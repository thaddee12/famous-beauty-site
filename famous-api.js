/* ==========================================================================
   THE FAMOUS — connecteur Supabase (fidelite) + agenda (reservations)
   --------------------------------------------------------------------------
   Le site est statique. Les donnees vivent dans Supabase, l'agenda dans
   Google Calendar via un webhook.

   REGLE DE CONCEPTION : si rien n'est configure, ou si le service ne repond
   pas, le site continue de fonctionner comme avant, avec la reservation par
   WhatsApp. Aucune fonction d'appoint ne doit casser la vitrine.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    /* ---- Supabase ----------------------------------------------------
       Tableau de bord Supabase > Project Settings > API
       La cle « anon » est faite pour etre publique. Elle n'est sure que si
       la Row Level Security est activee sur la table : voir supabase.sql. */
    SUPABASE_URL: 'https://ctznfolcbwobfxsfotcx.supabase.co',
    SUPABASE_ANON: 'sb_publishable_a9gsD0awvlZpGJ7eSeZ_ng_fdwliVI2',

    /* ---- Agenda -------------------------------------------------------
       LIRE  : adresse de la fonction Edge qui renvoie les plages occupees.
       ECRIRE: la meme adresse, appelee en POST, qui cree l'evenement.
       JETON : doit valoir le secret JETON_SITE de la fonction Edge. En
               lecture il part dans l'adresse, en ecriture dans le corps du
               message : la fonction le verifie dans les deux cas. */
    AGENDA_LIRE: 'https://ctznfolcbwobfxsfotcx.supabase.co/functions/v1/agenda',
    AGENDA_WEBHOOK: 'https://ctznfolcbwobfxsfotcx.supabase.co/functions/v1/agenda',
    AGENDA_JETON: 'Vi-3SR4dek2jrnncMp3YtJj0xWrNnQQF',

    /* Au-dela, on renonce et le site continue sans agenda. */
    DELAI_MS: 7000,

    /* Nombre de passages qui declenche la recompense. */
    SEUIL_RECOMPENSE: 10
  };

  var supaOK = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON);

  /* ---- appel HTTP avec delai maximal --------------------------------- */

  function requete(url, options) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, CONFIG.DELAI_MS);
    options = options || {};
    if (ctrl) options.signal = ctrl.signal;
    return fetch(url, options)
      .then(function (r) {
        return r.text().then(function (txt) {
          var data = null;
          try { data = txt ? JSON.parse(txt) : null; } catch (e) {}
          return { statut: r.status, ok: r.ok, data: data, brut: txt };
        });
      })
      .catch(function (e) { return { ok: false, horsService: true, erreur: String(e) }; })
      .then(function (res) { clearTimeout(t); return res; });
  }

  function entetes(extra) {
    var h = {
      apikey: CONFIG.SUPABASE_ANON,
      Authorization: 'Bearer ' + CONFIG.SUPABASE_ANON,
      'Content-Type': 'application/json'
    };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }

  function table(chemin) {
    return CONFIG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + chemin;
  }

  /* =====================================================================
     FIDELITE
     ===================================================================== */

  /* Normalise un numero pour la comparaison : on ne garde que les chiffres.
     « +237 6 89 67 29 32 » et « 237689672932 » doivent designer la meme
     personne, sinon l'unicite du telephone ne sert a rien. */
  function normaliserTel(tel) {
    return String(tel || '').replace(/\D/g, '');
  }

  /* Cherche une carte par telephone. Renvoie la carte ou null. */
  function chercherParTelephone(tel) {
    if (!supaOK) return Promise.resolve(null);
    var t = normaliserTel(tel);
    if (!t) return Promise.resolve(null);
    return requete(table('cartes_fidelite?telephone=eq.' + encodeURIComponent(t) + '&select=*'),
                   { headers: entetes() })
      .then(function (r) {
        return (r.ok && Array.isArray(r.data) && r.data.length) ? r.data[0] : null;
      });
  }

  function chercherParId(id) {
    if (!supaOK || !id) return Promise.resolve(null);
    return requete(table('cartes_fidelite?id=eq.' + encodeURIComponent(id) + '&select=*'),
                   { headers: entetes() })
      .then(function (r) {
        return (r.ok && Array.isArray(r.data) && r.data.length) ? r.data[0] : null;
      });
  }

  /* Cree la carte, ou renvoie l'existante si le telephone est deja connu.
     L'anti-doublon repose sur deux barrieres : cette verification, et la
     contrainte UNIQUE en base qui rattrape deux envois simultanes. */
  function creerOuRetrouver(nom, prenom, telephone) {
    if (!supaOK) return Promise.resolve({ ok: false, horsService: true });
    var tel = normaliserTel(telephone);

    return chercherParTelephone(tel).then(function (existante) {
      if (existante) return { ok: true, carte: existante, existait: true };

      return requete(table('cartes_fidelite'), {
        method: 'POST',
        headers: entetes({ Prefer: 'return=representation' }),
        body: JSON.stringify({ nom: nom, prenom: prenom, telephone: tel, passages: 1 })
      }).then(function (r) {
        if (r.ok && Array.isArray(r.data) && r.data.length)
          return { ok: true, carte: r.data[0], existait: false };

        // 409 = la contrainte UNIQUE a parle : quelqu'un a insere entre
        // notre lecture et notre ecriture. On relit, c'est la bonne carte.
        if (r.statut === 409) {
          return chercherParTelephone(tel).then(function (c) {
            return c ? { ok: true, carte: c, existait: true }
                     : { ok: false, erreur: 'conflit non resolu' };
          });
        }
        return { ok: false, erreur: (r.data && r.data.message) || 'insertion refusee',
                 statut: r.statut };
      });
    });
  }

  /* Incremente le compteur de passages. Au seuil, remet a zero et signale
     la recompense. L'increment passe par une fonction SQL atomique pour
     que deux scans simultanes ne se marchent pas dessus. */
  function enregistrerPassage(id) {
    if (!supaOK) return Promise.resolve({ ok: false, horsService: true });
    return requete(CONFIG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/rpc/incrementer_passage', {
      method: 'POST',
      headers: entetes(),
      body: JSON.stringify({ carte_id: id, seuil: CONFIG.SEUIL_RECOMPENSE })
    }).then(function (r) {
      if (!r.ok) return { ok: false, erreur: (r.data && r.data.message) || 'echec de l increment',
                          statut: r.statut, horsService: r.horsService };
      var d = Array.isArray(r.data) ? r.data[0] : r.data;
      if (!d) return { ok: false, erreur: 'carte introuvable' };
      return { ok: true, passages: d.passages, recompense: !!d.recompense,
               nom: d.nom, prenom: d.prenom };
    });
  }

  /* =====================================================================
     AGENDA
     ===================================================================== */

  function enMinutes(hhmm) {
    var p = String(hhmm).split(':');
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  /* Renvoie les plages occupees. En cas d'echec, liste vide : on prefere
     afficher un creneau libre a tort plutot que de bloquer la reservation.
     Le doublon est rattrape a l'ecriture. */
  function occupes(univers, date) {
    if (!CONFIG.AGENDA_LIRE) return Promise.resolve([]);
    var sep = CONFIG.AGENDA_LIRE.indexOf('?') >= 0 ? '&' : '?';
    var jeton = CONFIG.AGENDA_JETON && CONFIG.AGENDA_LIRE.indexOf('jeton=') < 0
              ? '&jeton=' + encodeURIComponent(CONFIG.AGENDA_JETON) : '';
    return requete(CONFIG.AGENDA_LIRE + sep + 'univers=' + encodeURIComponent(univers) +
                   '&date=' + encodeURIComponent(date) + jeton)
      .then(function (r) {
        if (!r.ok || !r.data) return [];
        var l = r.data.occupes || r.data.busy || r.data;
        return Array.isArray(l) ? l.map(function (p) {
          return { debut: p.debut || p.start || p.from, fin: p.fin || p.end || p.to,
                   ferme: !!p.ferme };
        }).filter(function (p) { return p.debut && p.fin; }) : [];
      });
  }

  /* capacite : nombre de personnes que le creneau peut recevoir en meme
     temps. 1 pour une cabine de spa, davantage pour une salle de sport.
     Sans ce compte, la premiere reservation fermait le creneau pour tout
     le monde, ce qui serait faux pour un cours collectif. */
  function estOccupe(debut, fin, plages, capacite) {
    var d = enMinutes(debut), f = enMinutes(fin);
    var max = Math.max(1, parseInt(capacite, 10) || 1);
    var chevauchent = (plages || []).filter(function (p) {
      return d < enMinutes(p.fin) && f > enMinutes(p.debut);
    });
    // Une journee fermee bloque, quel que soit le nombre de places.
    if (chevauchent.some(function (p) { return p.ferme; })) return true;
    return chevauchent.length >= max;
  }

  /* Envoie la reservation au webhook qui l'inscrit dans Google Calendar.
     Appele en parallele de WhatsApp : si le webhook echoue, le client a
     quand meme recu la demande par message. */
  function reserver(donnees) {
    if (!CONFIG.AGENDA_WEBHOOK) return Promise.resolve({ ok: false, horsService: true });
    var corps = {};
    for (var k in donnees) if (donnees.hasOwnProperty(k)) corps[k] = donnees[k];
    if (CONFIG.AGENDA_JETON) corps.jeton = CONFIG.AGENDA_JETON;
    /* En-tete volontairement en texte simple : evite la requete OPTIONS
       prealable, un aller-retour de moins sur une connexion lente. */
    return requete(CONFIG.AGENDA_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(corps)
    }).then(function (r) {
      return {
        ok: !!r.ok,
        statut: r.statut,
        horsService: !!r.horsService,
        /* 409 : le creneau a ete pris entre l'affichage et la validation.
           C'est la seule erreur que le visiteur doit voir, les autres ne
           l'empechent pas de passer par WhatsApp. */
        conflit: r.statut === 409 || !!(r.data && r.data.conflit),
        reference: r.data && r.data.reference ? r.data.reference : null
      };
    });
  }

  window.FAMOUS_API = {
    actif: supaOK,
    agendaActif: !!CONFIG.AGENDA_LIRE,
    seuil: CONFIG.SEUIL_RECOMPENSE,
    normaliserTel: normaliserTel,
    chercherParTelephone: chercherParTelephone,
    chercherParId: chercherParId,
    creerOuRetrouver: creerOuRetrouver,
    enregistrerPassage: enregistrerPassage,
    occupes: occupes,
    estOccupe: estOccupe,
    reserver: reserver
  };
})();

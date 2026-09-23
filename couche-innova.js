/* =========================================================
   COUCHE DE STYLE INNOVA ALPHA | comportements
   À charger en fin de page, après couche-innova.css.

   Ne touche à aucune structure existante. Il se contente
   d'observer, d'animer, et de poser deux éléments qui
   n'existent pas sur une maquette : le bouton WhatsApp
   flottant et l'indicateur de défilement.

   Réglage : une seule ligne, le numéro WhatsApp ci-dessous.
   ========================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------
     RÉGLAGES
     ------------------------------------------------------ */

  var CONFIG = {
    // Format international, sans + ni espaces. Laisser vide
    // pour ne pas poser le bouton WhatsApp.
    whatsapp: '237689672932',
    messageWhatsapp: 'Bonjour The Famous, je vous écris depuis votre site.',
    // Poser l'indicateur de défilement à gauche.
    rail: true
  };

  /* Le repli no-js : si ce script ne tourne pas, la classe
     reste et le CSS force tout à visible. On la retire donc
     dès la première ligne exécutée. */
  document.documentElement.classList.remove('no-js');

  var douxSeulement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------
     1 | APPARITION AU DÉFILEMENT
     Tout élément portant .ia-apparait devient .ia-vu quand
     il entre dans le champ. On cesse de l'observer ensuite :
     une apparition ne se rejoue pas, sinon la page clignote
     quand on remonte.
     ------------------------------------------------------ */

  function apparitions() {
    var cibles = document.querySelectorAll('.ia-apparait:not([data-ia-obs])');
    for (var k = 0; k < cibles.length; k++) cibles[k].setAttribute('data-ia-obs', '');
    if (!cibles.length) return;

    if (douxSeulement || !('IntersectionObserver' in window)) {
      for (var i = 0; i < cibles.length; i++) cibles[i].classList.add('ia-vu');
      return;
    }

    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('ia-vu');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (var j = 0; j < cibles.length; j++) obs.observe(cibles[j]);
  }

  /* ------------------------------------------------------
     2 | COMPTEURS
     <span class="ia-preuve__valeur" data-ia-final="270000"
           data-ia-suffixe=" +">0</span>

     La valeur monte en 1,4 s avec la courbe de la maison,
     et l'espace des milliers suit la langue de la page.
     ------------------------------------------------------ */

  function formate(n, sep) {
    return n.toLocaleString(document.documentElement.lang || 'fr-FR') + (sep || '');
  }

  function compteur(el) {
    var cible = parseFloat(el.getAttribute('data-ia-final'));
    if (isNaN(cible)) return;
    var suffixe = el.getAttribute('data-ia-suffixe') || '';
    var duree = 1400;

    if (douxSeulement) {
      el.textContent = formate(cible, suffixe);
      return;
    }

    var debut = null;
    function pas(t) {
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      // même sensation que la courbe CSS : départ rapide,
      // atterrissage long
      var adouci = 1 - Math.pow(1 - p, 3);
      el.textContent = formate(Math.round(cible * adouci), suffixe);
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  function compteurs() {
    var cibles = document.querySelectorAll('[data-ia-final]:not([data-ia-obs])');
    for (var k = 0; k < cibles.length; k++) cibles[k].setAttribute('data-ia-obs', '');
    if (!cibles.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < cibles.length; i++) compteur(cibles[i]);
      return;
    }

    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        compteur(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.4 });

    for (var j = 0; j < cibles.length; j++) obs.observe(cibles[j]);
  }

  /* ------------------------------------------------------
     3 | INDICATEUR DE DÉFILEMENT
     ------------------------------------------------------ */

  function rail() {
    if (!CONFIG.rail || douxSeulement) return;
    if (document.querySelector('.ia-rail')) return;

    var r = document.createElement('div');
    r.className = 'ia-rail';
    r.setAttribute('aria-hidden', 'true');
    var jauge = document.createElement('span');
    jauge.className = 'ia-rail__jauge';
    r.appendChild(jauge);
    document.body.appendChild(r);

    var enAttente = false;
    function maj() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      jauge.style.height = Math.max(0, Math.min(100, p)) + '%';
      enAttente = false;
    }
    window.addEventListener('scroll', function () {
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(maj);
    }, { passive: true });
    maj();
  }

  /* ------------------------------------------------------
     4 | WHATSAPP FLOTTANT
     ------------------------------------------------------ */

  function whatsapp() {
    if (!CONFIG.whatsapp) return;
    if (document.querySelector('meta[name="ia-sans-wa"]')) return;
    if (document.querySelector('.ia-wa')) return;

    var a = document.createElement('a');
    a.className = 'ia-wa';
    a.setAttribute('data-ia-pose', '');
    a.href = 'https://wa.me/' + CONFIG.whatsapp +
             '?text=' + encodeURIComponent(CONFIG.messageWhatsapp);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Nous écrire sur WhatsApp');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>';
    document.body.appendChild(a);
  }

  /* ------------------------------------------------------
     DÉPART
     ------------------------------------------------------ */

  function demarrer() {
    apparitions();
    compteurs();
    rail();
    // Les pages sont rendues après le chargement : on relance le
    // repérage à chaque ajout de contenu, puis on pose le bouton
    // WhatsApp seulement s'il n'existe toujours pas.
    var attente = null;
    new MutationObserver(function () {
      if (attente) return;
      attente = requestAnimationFrame(function () {
        attente = null; apparitions(); compteurs();
        // un seul bouton WhatsApp : si la page apporte le sien, on retire celui de la couche
        var tous = document.querySelectorAll('.ia-wa');
        if (tous.length > 1) {
          var pose = document.querySelector('.ia-wa[data-ia-pose]');
          if (pose) pose.remove();
        }
      });
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(whatsapp, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();

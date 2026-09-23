// <fam-assistant> — assistant IA flottant The Famous. Attributs : accent, univers ("beauty" | "gym").
(function () {
  if (customElements.get('fam-assistant')) return;
  const WA = '237689672932';
  const KB = `THE FAMOUS — BEAUTY · SPA · GYM
Adresse : Immeuble Bastos Building, Rue de l'Ambassade du Japon (rue 1828), Bastos, Yaoundé, Cameroun. Itinéraire : https://maps.app.goo.gl/QshwX8No6V83c1vU9
Téléphone / WhatsApp : +237 6 89 67 29 32. Instagram : @the__famousbeauty.
Réservations uniquement sur rendez-vous. Aucun paiement en ligne : la demande est envoyée sur WhatsApp puis confirmée par l'équipe.
Horaires connus : cours collectifs 7j/7 selon planning (08:00 – 20:00). Spa et soins sur réservation, créneaux de 09:00 à 20:00. Horaires exacts de l'accueil non publiés.

SPA — tarifs FCFA
Massages (60 min) : Massage 1h offre découverte 10 000 · Relaxant 30 000 · Tonique & Sportif 40 000 · Californien 35 000 · Massage Duo (2 pers.) 55 000.
Massages localisés jambe/dos/pied : 15 min 15 000 · 20 min 20 000 · 30 min 25 000 · Duo Express jambe + dos 30 min 25 000.
Enveloppes & rituels : Gommage corps complet 45 min 30 000 · Enveloppement détox à l'argile 45 min 25 000 · Rituel gommage + enveloppement 90 min 50 000.
Wet table Nilo : Gommage corps Nilo 45 min 40 000 · Enveloppement Nilo à l'argile 45 min 35 000 · Rituel corps complet Famous 90 min 70 000.
Madérothérapie & drainage : 1 zone (ventre/jambes/bras) 30 min 35 000 · 2 zones combinées 45 min 45 000 · Corps entier 60 min 75 000 · Drainage lymphatique ciblé 90 min 30 000 · Drainage lymphatique corps entier 60 min 45 000.
Jacuzzi : Solo 30 min 20 000 · Solo 60 min 30 000 · Duo 60 min 55 000 · Jacuzzi + Massage 90 min 45 000 · Jacuzzi Duo + Massage Duo 120 min 105 000.
Pack Spa + Gym : 20 000.

FEMME — The Hair Studio (à partir de) : Coiffure européenne 15 000 · Coiffure africaine 20 000 · Soins capillaires 15 000 · Pose perruques 25 000 · Défrisage 40 000 · Brushing 15 000 · Tresses 10 000 · Twist 15 000 · Tissages 20 000 · Colorations 30 000.
Épilation femme : tarifs non publiés (sur demande).
HOMME — Barbershop (à partir de) : Coupe homme 10 000 · Coupe caucasienne 15 000 · Traitement de barbe 5 000 · Coloration 20 000 · Reprise de racine de locks 25 000.
Épilation pour lui : Sourcils 5 500 · Épaules et nuque 10 000 · Dos complet 25 000 · Demi-dos 15 000 · Bras complet 20 000 · Demi-bras 10 000 · Jambes complètes 30 000 · Demi-jambes 20 000 · Torse ou abdomen 15 000 · Maillot classique 20 000 · Maillot intégral 35 000.
NAILS (à partir de) : Manucure 10 000 (homme, femme & enfant) · Pédicure 15 000 (homme, femme & enfant) · Vernis semi-permanent 15 000 · Remplissage 25 000 · Pose gel 30 000 · Pose poly gel 35 000 · Capsules 25 000 · Chablon 35 000 · Gainage 25 000.

GYM & FITNESS
Pass Journée 10 000 · Pass Annuel 1 000 000 (12 mois) · Pass Mensuel 100 000, Spécial Rentrée 90 000 (-10 %, du 25 août au 25 septembre 2026), formule sans coach, tarif adultes, cours collectifs gratuits, carte fidélité incluse.
Coaching privé 20 000 / séance (gratuit pour les abonnés selon la grille « séances »). Cours collectif non abonné 10 000 ; 1er cours offert (hors Pilates) pendant la promo.
Planning : Lundi 18:00 Pilates, 19:00 Afro Burn · Mardi 12:00 Pilates, 16:00 Ventre Fessier, 18:00 Body Combat, 19:00 Ventre Fessier · Mercredi 08:00 Tabata, 18:00 Pilates, 19:00 Crossfit · Jeudi 12:00 Pilates, 15:00 Ventre Fessier, 18:00 Body Attack, 19:00 Stepp · Vendredi 08:00 Aerobic, 18:00 Pilates, 19:00 Tabata · Samedi 08:00 Tabata, 10:00 Afro Dance, 12:00 Pilates, 18:00 Pilates · Dimanche 10:00 Body Sculp. Pilates débutants lun/mer/ven/sam 18:00.

BEAUTY SHOP : perruques (HD Lace frontale 13x4, Closure wig 4x4, Bob curly), mèches (Body Wave, Bone Straight, Deep Curly, Kinky Straight), closures & frontals HD, soins (shampooing, masque protéiné, huile). Plusieurs couleurs selon modèle. Prix des cheveux confirmés sur WhatsApp selon longueur et densité. Pose au salon +15 000. Retrait en boutique ou livraison dans Yaoundé.
FIDÉLITÉ : carte VIP gratuite avec QR code, chaque 10e soin offert.`;

  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  function availability({ univers, date, duree_min }) {
    const d = date ? new Date(date + 'T12:00') : new Date();
    if (isNaN(d)) return 'Date invalide. Format attendu AAAA-MM-JJ.';
    const now = new Date(), key = d.toDateString(), today = key === now.toDateString();
    const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (univers === 'gym') {
      const P = { 1: ['18:00 Pilates', '19:00 Afro Burn'], 2: ['12:00 Pilates', '16:00 Ventre Fessier', '18:00 Body Combat', '19:00 Ventre Fessier'], 3: ['08:00 Tabata', '18:00 Pilates', '19:00 Crossfit'], 4: ['12:00 Pilates', '15:00 Ventre Fessier', '18:00 Body Attack', '19:00 Stepp'], 5: ['08:00 Aerobic', '18:00 Pilates', '19:00 Tabata'], 6: ['08:00 Tabata', '10:00 Afro Dance', '12:00 Pilates', '18:00 Pilates'], 0: ['10:00 Body Sculp'] }[d.getDay()] || [];
      const free = P.filter(x => !(today && parseInt(x, 10) <= now.getHours()) && hash(key + x.slice(0, 5) + 'cours') >= 0.28);
      return `Cours collectifs le ${label} (simulation) : ${free.length ? free.join(', ') : 'aucun créneau libre'}.`;
    }
    const dur = Math.max(15, Math.min(180, +duree_min || 60)), slots = [];
    for (let m = 540; m + dur <= 1200; m += 30) {
      const t = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      if (today && m <= now.getHours() * 60 + now.getMinutes()) continue;
      if (hash(key + t + 'spa') < 0.3) continue;
      slots.push(t);
    }
    return `Créneaux libres en cabine le ${label} pour ${dur} min (simulation) : ${slots.length ? slots.join(', ') : 'aucun'}.`;
  }

  class FamAssistant extends HTMLElement {
    constructor() {
      super();
      this.msgs = []; this.open = false; this.busy = false;
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = `
<style>
  :host{--a:#C9A24A;--a-ink:#1B1008;position:fixed;right:clamp(14px,3vw,26px);bottom:calc(clamp(14px,3vw,26px) + 68px);z-index:80;font-family:'Jost',system-ui,sans-serif}
  .fab{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;cursor:pointer;color:var(--a-ink);
    background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0) 58%),var(--a);border:1px solid rgba(255,255,255,.45);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.7),0 12px 30px rgba(0,0,0,.35);transition:transform .3s cubic-bezier(.3,1.4,.5,1)}
  .fab:hover{transform:scale(1.07)}
  .fab .dot{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#1EA653;border:2px solid #fff}
  .panel{position:absolute;right:0;bottom:70px;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 170px));display:flex;flex-direction:column;overflow:hidden;border-radius:22px;color:#F4EBDC;
    background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.03)),rgba(14,10,6,.86);border:1px solid rgba(255,255,255,.2);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.3),0 30px 70px rgba(0,0,0,.5);backdrop-filter:blur(22px) saturate(1.6);-webkit-backdrop-filter:blur(22px) saturate(1.6);
    transform-origin:bottom right;transition:opacity .35s ease,transform .45s cubic-bezier(.2,.9,.3,1)}
  .panel[hidden]{display:flex;opacity:0;transform:translateY(14px) scale(.94);pointer-events:none}
  .head{display:flex;align-items:center;gap:12px;padding:16px 16px 14px;border-bottom:1px solid rgba(255,255,255,.1)}
  .av{flex:0 0 auto;display:grid;place-content:center;width:38px;height:38px;border-radius:50%;background:var(--a);color:var(--a-ink)}
  .ht{margin:0;font-size:15px;font-weight:600}.hs{margin:2px 0 0;font-size:12px;font-weight:300;color:#C2AE96;display:flex;align-items:center;gap:6px}
  .hs i{width:7px;height:7px;border-radius:50%;background:#3DDC84;display:inline-block}
  .x{margin-left:auto;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#F4EBDC;cursor:pointer}
  .list{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}
  .m{max-width:86%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;animation:in .35s ease both}
  .bot{align-self:flex-start;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-bottom-left-radius:6px}
  .me{align-self:flex-end;background:var(--a);color:var(--a-ink);border-bottom-right-radius:6px}
  .typing{display:flex;gap:4px;padding:14px}.typing span{width:6px;height:6px;border-radius:50%;background:#C2AE96;animation:b 1s infinite}
  .typing span:nth-child(2){animation-delay:.15s}.typing span:nth-child(3){animation-delay:.3s}
  .wa{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:#128C4A;color:#fff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:.04em;animation:in .35s ease both}
  .wa:hover{background:#1EA653}
  .chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}
  .chip{padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#F4EBDC;font:inherit;font-size:12px;cursor:pointer}
  .chip:hover{border-color:var(--a);color:var(--a)}
  form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.1)}
  input{flex:1;min-width:0;padding:12px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#F4EBDC;font:inherit;font-size:14px;outline:none}
  input:focus{border-color:var(--a)}
  .send{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;background:var(--a);color:var(--a-ink);display:grid;place-content:center}
  .send:disabled{opacity:.5;cursor:default}
  .note{margin:0;padding:0 16px 10px;font-size:10px;color:#9C8467;text-align:center}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes b{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
</style>
<div class="panel" hidden role="dialog" aria-label="Miss Beauty, assistante The Famous">
  <div class="head">
    <div class="av"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/></svg></div>
    <div><p class="ht">Miss Beauty</p><p class="hs"><i></i>Tarifs, horaires, disponibilités</p></div>
    <button class="x" type="button" aria-label="Fermer">✕</button>
  </div>
  <div class="list" aria-live="polite"></div>
  <div class="chips"></div>
  <form><input type="text" placeholder="Posez votre question…" aria-label="Votre question" /><button class="send" type="submit" aria-label="Envoyer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></svg></button></form>
  <p class="note">Réponses automatiques. Les disponibilités sont indicatives, l'équipe confirme sur WhatsApp.</p>
</div>
<button class="fab" type="button" aria-label="Discuter avec Miss Beauty"><span class="dot"></span><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/></svg></button>`;
      this.$ = s => r.querySelector(s);
      this.$('.fab').addEventListener('click', () => this.toggle());
      this.$('.x').addEventListener('click', () => this.toggle(false));
      this.$('form').addEventListener('submit', e => { e.preventDefault(); const i = this.$('input'); const q = i.value.trim(); if (q) { i.value = ''; this.ask(q); } });
    }
    connectedCallback() {
      const a = this.getAttribute('accent'); if (a) this.style.setProperty('--a', a);
      const gym = this.getAttribute('univers') === 'gym';
      if (gym) this.style.setProperty('--a-ink', '#0C0E0A');
      const chips = gym ? ['Prix du pass mensuel ?', 'Cours ce samedi ?', 'Coaching privé ?', 'Adresse de la salle'] : ['Prix d\'un massage ?', 'Dispo demain pour un soin ?', 'Coupe homme ?', 'Où vous trouver ?'];
      const c = this.$('.chips');
      chips.forEach(t => { const b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.textContent = t; b.addEventListener('click', () => this.ask(t)); c.appendChild(b); });
      this.add('bot', gym ? 'Bonjour, je suis Miss Beauty, l\'assistante de The Famous Gym. Pass, planning, coaching ou disponibilités : posez-moi votre question.' : 'Bonjour, je suis Miss Beauty, l\'assistante de The Famous. Soins, tarifs, coiffure, boutique ou disponibilités : posez-moi votre question.');
    }
    toggle(v) { this.open = v === undefined ? !this.open : v; this.$('.panel').hidden = !this.open; this.$('.dot').style.display = 'none'; if (this.open) setTimeout(() => this.$('input').focus(), 200); }
    add(who, text) { const d = document.createElement('div'); d.className = 'm ' + who; d.textContent = text; this.$('.list').appendChild(d); this.scroll(); return d; }
    addWa(q) {
      const a = document.createElement('a'); a.className = 'wa'; a.target = '_blank'; a.rel = 'noopener';
      a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Bonjour The Famous, j\'ai une question : ' + q);
      a.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z"/></svg> Continuer sur WhatsApp';
      this.$('.list').appendChild(a); this.scroll();
    }
    scroll() { const l = this.$('.list'); l.scrollTop = l.scrollHeight; }
    async ask(q) {
      if (this.busy) return;
      this.busy = true; this.$('.send').disabled = true; this.$('.chips').style.display = 'none';
      this.add('me', q); this.msgs.push({ role: 'user', content: q });
      const ty = document.createElement('div'); ty.className = 'm bot typing'; ty.innerHTML = '<span></span><span></span><span></span>'; this.$('.list').appendChild(ty); this.scroll();
      let text = '', wa = false;
      try {
        if (!window.claude || !window.claude.complete) throw new Error('no-ai');
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        text = await window.claude.complete({
          system: `Tu es Miss Beauty, l'assistante virtuelle du site de The Famous. Tu te présentes sous ce nom si on te le demande et tu parles au féminin (Beauty · Spa · Gym) à Bastos, Yaoundé. Nous sommes le ${today}. Réponds en français, de façon courte (2 à 5 phrases), chaleureuse et précise, uniquement à partir des informations ci-dessous et de l'outil de disponibilités. N'invente jamais un prix, un horaire, un service ou une promotion. Les tarifs sont en FCFA. Pour vérifier des disponibilités, appelle l'outil verifier_disponibilites avec la date au format AAAA-MM-JJ, et précise que ce sont des créneaux indicatifs à confirmer. Si l'information n'est pas dans les données, si la question sort du cadre, ou si le client veut réserver ou parler à quelqu'un, dis-le simplement et termine ta réponse par la balise [WHATSAPP] sur une ligne seule. Pas de markdown, pas de listes à puces longues.\n\nDONNÉES DU SITE :\n${KB}`,
          messages: this.msgs.slice(-10),
          max_tokens: 500,
          tools: [{
            name: 'verifier_disponibilites',
            description: 'Renvoie les créneaux libres simulés pour une date. univers = "spa" (soins, coiffure, onglerie, épilation) ou "gym" (cours collectifs).',
            input_schema: { type: 'object', properties: { univers: { type: 'string', enum: ['spa', 'gym'] }, date: { type: 'string', description: 'AAAA-MM-JJ' }, duree_min: { type: 'number' } }, required: ['univers', 'date'] },
            run: async input => availability(input)
          }]
        });
      } catch (e) {
        text = 'Je ne peux pas répondre pour le moment. L\'équipe vous répond directement sur WhatsApp.\n[WHATSAPP]';
      }
      ty.remove();
      if (/\[WHATSAPP\]/i.test(text)) { wa = true; text = text.replace(/\s*\[WHATSAPP\]\s*/gi, '').trim(); }
      this.add('bot', text || 'Je n\'ai pas cette information.');
      this.msgs.push({ role: 'assistant', content: text || '…' });
      if (wa || !text) this.addWa(q);
      this.busy = false; this.$('.send').disabled = false; this.$('input').focus();
    }
  }
  customElements.define('fam-assistant', FamAssistant);
})();

// <fam-coverflow> — carrousel 3D en éventail. Lit ses enfants <img data-title data-subtitle>.
(function () {
  if (customElements.get('fam-coverflow')) return;
  class FamCoverflow extends HTMLElement {
    constructor() {
      super();
      this.pos = 0; this.target = 0; this.width = 0; this.raf = null; this.drag = null; this.selected = 0; this.slides = [];
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = `
<style>
  :host{display:block;width:100%;--cf-card:clamp(170px,24vw,300px);--cf-accent:#C9A24A;--cf-ink:currentColor;font-family:inherit}
  .wrap{position:relative}
  .frame{overflow:hidden;padding:44px 0;outline:none;cursor:grab;touch-action:pan-y}
  .frame:active{cursor:grabbing}
  .frame:focus-visible{box-shadow:0 0 0 2px var(--cf-accent);border-radius:14px}
  .stage{position:relative;height:calc(var(--cf-card) * 1.25);transform-style:preserve-3d;user-select:none;-webkit-user-select:none}
  .card{position:absolute;left:50%;top:0;width:var(--cf-card);height:calc(var(--cf-card) * 1.25);border-radius:18px;overflow:hidden;will-change:transform,opacity;box-shadow:0 24px 50px rgba(0,0,0,.4);background:#1a1410}
  .card img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .card::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 1px 1px rgba(255,255,255,.45),inset 0 0 0 1px rgba(255,255,255,.14);pointer-events:none}
  .nav{position:absolute;top:50%;z-index:300;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;cursor:pointer;color:#fff;
       background:linear-gradient(180deg,rgba(255,255,255,.32),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.38);box-shadow:inset 0 1px 1px rgba(255,255,255,.6),0 8px 22px rgba(0,0,0,.28);
       backdrop-filter:blur(12px) saturate(1.7);-webkit-backdrop-filter:blur(12px) saturate(1.7);transition:transform .25s ease,background .25s ease}
  .nav:hover{transform:translateY(-50%) scale(1.08);background:linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,.12))}
  .prev{left:clamp(4px,2vw,20px)} .next{right:clamp(4px,2vw,20px)}
  .cap{display:flex;flex-direction:column;align-items:center;gap:6px;min-height:52px;padding:0 20px;text-align:center;animation:fade .35s ease both}
  .t{margin:0;font-size:15px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--cf-ink)}
  .s{margin:0;font-size:13px;font-weight:300;opacity:.75;color:var(--cf-ink)}
  .dots{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:18px}
  .dot{width:8px;height:8px;padding:0;border:none;border-radius:999px;cursor:pointer;background:var(--cf-accent);opacity:.3;transition:opacity .3s ease,width .3s ease}
  .dot[aria-current="true"]{opacity:1;width:22px}
  @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
</style>
<div class="wrap" role="region" aria-roledescription="carousel">
  <div class="frame" tabindex="0"><div class="stage"></div></div>
  <button class="nav prev" type="button" aria-label="Image précédente"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
  <button class="nav next" type="button" aria-label="Image suivante"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>
</div>
<div class="cap"></div>
<div class="dots"></div>`;
      this.frame = r.querySelector('.frame'); this.stage = r.querySelector('.stage');
      this.capEl = r.querySelector('.cap'); this.dotsEl = r.querySelector('.dots');
      r.querySelector('.prev').addEventListener('click', () => this.nudge(-1));
      r.querySelector('.next').addEventListener('click', () => this.nudge(1));
      this.frame.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); this.nudge(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); this.nudge(1); } });
      this.frame.addEventListener('pointerdown', e => this.down(e));
      this.frame.addEventListener('pointermove', e => this.move(e));
      this.frame.addEventListener('pointerup', e => this.up(e));
      this.frame.addEventListener('pointercancel', e => this.up(e));
    }
    get opt() {
      const n = (k, d) => { const v = parseFloat(this.getAttribute(k)); return Number.isFinite(v) ? v : d; };
      return { rotate: n('rotate', 44), depth: n('depth', 0.6), perspective: n('perspective', 3), falloff: n('falloff', 0.56), fade: n('fade', 0.12), gap: n('gap', 0.05), loop: this.getAttribute('loop') !== 'false' };
    }
    connectedCallback() {
      if (this.getAttribute('accent')) this.style.setProperty('--cf-accent', this.getAttribute('accent'));
      if (this.getAttribute('ink')) this.style.setProperty('--cf-ink', this.getAttribute('ink'));
      if (this.getAttribute('card-width')) this.style.setProperty('--cf-card', this.getAttribute('card-width'));
      this.read();
      this.mo = new MutationObserver(() => this.read()); this.mo.observe(this, { childList: true, subtree: true, attributes: true });
      this.ro = new ResizeObserver(() => this.measure()); this.ro.observe(this.frame);
      this.autoplay();
    }
    disconnectedCallback() { this.mo && this.mo.disconnect(); this.ro && this.ro.disconnect(); cancelAnimationFrame(this.raf); clearInterval(this.timer); }
    autoplay() {
      clearInterval(this.timer);
      const ms = parseFloat(this.getAttribute('autoplay'));
      if (!(ms > 0) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.timer = setInterval(() => { if (!this.drag && !this.matches(':hover')) this.nudge(1); }, ms);
    }
    read() {
      const imgs = Array.from(this.querySelectorAll('img'));
      const slides = imgs.map(i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') || '', title: i.dataset.title || '', subtitle: i.dataset.subtitle || '' }));
      if (JSON.stringify(slides) === JSON.stringify(this.slides)) return;
      this.slides = slides;
      this.stage.innerHTML = ''; this.cards = [];
      slides.forEach((s, i) => {
        const c = document.createElement('div'); c.className = 'card'; c.setAttribute('role', 'group'); c.setAttribute('aria-roledescription', 'slide'); c.setAttribute('aria-label', (i + 1) + ' sur ' + slides.length);
        const im = document.createElement('img'); im.src = s.src; im.alt = s.alt; im.draggable = false; c.appendChild(im);
        c.addEventListener('click', () => { if (!this.moved) this.goTo(i); });
        this.stage.appendChild(c); this.cards.push(c);
      });
      this.dotsEl.innerHTML = '';
      this.dots = slides.map((s, i) => { const b = document.createElement('button'); b.className = 'dot'; b.type = 'button'; b.setAttribute('aria-label', 'Aller à l’image ' + (i + 1)); b.addEventListener('click', () => this.goTo(i)); this.dotsEl.appendChild(b); return b; });
      this.select(this.indexAt(this.target), true);
      this.measure();
    }
    get count() { return this.slides.length; }
    indexAt(p) { const n = this.count || 1; return ((Math.round(p) % n) + n) % n; }
    clamp(p) { return this.opt.loop ? p : Math.max(0, Math.min(this.count - 1, p)); }
    measure() { if (!this.cards || !this.cards[0]) return; this.width = this.cards[0].offsetWidth; this.frame.style.perspective = (this.width * this.opt.perspective) + 'px'; this.paint(); }
    paint() {
      const w = this.width; if (!w || !this.cards) return;
      const o = this.opt, n = this.count, pitch = w * (1 + o.gap), pos = this.pos;
      this.cards.forEach((card, i) => {
        let off = i - pos;
        if (o.loop) { off = ((off % n) + n) % n; if (off > n / 2) off -= n; }
        const d = Math.abs(off), ramp = Math.pow(d, o.falloff);
        const tilt = Math.min(o.rotate * ramp, 82) * Math.sign(off);
        card.style.transform = `translateX(calc(-50% + ${off * pitch}px)) translateZ(${-o.depth * w * ramp}px) rotateY(${-tilt}deg)`;
        const edge = o.loop ? Math.min(1, Math.max(0, n / 2 - d)) : 1;
        card.style.opacity = String(Math.max(0, 1 - o.fade * d) * edge);
        card.style.zIndex = String(100 - Math.round(d));
        const g = Math.max(0, 1 - d * 1.4);
        card.style.boxShadow = g > 0.01
          ? `0 24px 50px rgba(0,0,0,.4), 0 0 ${Math.round(28 * g)}px ${Math.round(1 * g)}px color-mix(in srgb, var(--cf-accent) ${Math.round(30 * g)}%, transparent), 0 0 0 ${(1 * g).toFixed(2)}px color-mix(in srgb, var(--cf-accent) ${Math.round(40 * g)}%, transparent)`
          : '0 24px 50px rgba(0,0,0,.4)';
      });
    }
    select(i, force) {
      if (i === this.selected && !force) return;
      this.selected = i;
      const s = this.slides[i]; if (!s) return;
      this.capEl.innerHTML = '';
      this.capEl.style.animation = 'none'; void this.capEl.offsetWidth; this.capEl.style.animation = '';
      if (s.title) { const p = document.createElement('p'); p.className = 't'; p.textContent = s.title; this.capEl.appendChild(p); }
      if (s.subtitle) { const p = document.createElement('p'); p.className = 's'; p.textContent = s.subtitle; this.capEl.appendChild(p); }
      (this.dots || []).forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    }
    settle(t) {
      cancelAnimationFrame(this.raf); this.target = t; this.select(this.indexAt(t));
      const step = () => {
        const rem = t - this.pos;
        if (Math.abs(rem) < 0.0004) { this.pos = t; this.paint(); this.raf = null; return; }
        this.pos += rem * 0.16; this.paint(); this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
    goTo(i) { const n = this.count; const t = this.opt.loop ? i + Math.round((this.target - i) / n) * n : i; this.settle(this.clamp(t)); }
    nudge(by) { this.settle(this.clamp(Math.round(this.target) + by)); }
    down(e) {
      if (e.target.closest && e.target.closest('.nav')) return;
      cancelAnimationFrame(this.raf); this.raf = null;
      this.frame.setPointerCapture(e.pointerId); this.target = this.pos; this.moved = false;
      this.drag = { id: e.pointerId, x: e.clientX, pos: this.pos, v: 0, t: performance.now() };
    }
    move(e) {
      const d = this.drag; if (!d || d.id !== e.pointerId) return;
      const pitch = this.width * (1 + this.opt.gap); if (!pitch) return;
      if (Math.abs(e.clientX - d.x) > 4) this.moved = true;
      const now = performance.now(), prev = this.pos;
      this.pos = this.clamp(d.pos - (e.clientX - d.x) / pitch);
      d.v = ((this.pos - prev) / Math.max(now - d.t, 1)) * 1000; d.t = now;
      this.select(this.indexAt(this.pos)); this.paint();
    }
    up(e) {
      const d = this.drag; if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      const carried = Math.max(-2, Math.min(2, d.v * 0.18));
      if (!this.moved) return;
      this.settle(this.clamp(Math.round(this.pos + carried)));
      setTimeout(() => { this.moved = false; }, 0);
    }
  }
  customElements.define('fam-coverflow', FamCoverflow);
})();

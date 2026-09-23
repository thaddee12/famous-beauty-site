// <fam-particles> — champ de particules « chrono sport » (canvas). Attributs : color (hex), density (0.25–2.5).
(function () {
  if (customElements.get('fam-particles')) return;
  const hexToRgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); const n = parseInt(m ? m[1] : 'CBF34A', 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const pad = n => String(n).padStart(2, '0');
  const TOKENS = ['REP', 'SET', 'KG', 'BPM', 'GO', 'x10', 'x12', 'x15', 'HIIT', 'MAX', '1RM', 'PR'];
  const randToken = () => {
    const r = Math.random();
    if (r < 0.45) return pad(Math.floor(Math.random() * 60)) + ':' + pad(Math.floor(Math.random() * 60));
    if (r < 0.62) return pad(Math.floor(Math.random() * 60)) + '.' + pad(Math.floor(Math.random() * 100));
    if (r < 0.78) return String(60 + Math.floor(Math.random() * 120));
    return TOKENS[Math.floor(Math.random() * TOKENS.length)];
  };
  class FamParticles extends HTMLElement {
    connectedCallback() {
      if (this._on) return; this._on = true;
      this.style.position = 'absolute'; this.style.inset = '0'; this.style.pointerEvents = 'none'; this.style.display = 'block';
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = '<canvas style="display:block;width:100%;height:100%;opacity:0;transition:opacity 2s ease"></canvas>';
      this.c = r.querySelector('canvas'); this.ctx = this.c.getContext('2d');
      this.rgb = hexToRgb(this.getAttribute('color'));
      this.density = Math.max(0.25, Math.min(2.5, parseFloat(this.getAttribute('density')) || 1));
      this.mouse = { x: -1e4, y: -1e4 };
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.onMove = e => { const b = this.c.getBoundingClientRect(); this.mouse.x = e.clientX - b.left; this.mouse.y = e.clientY - b.top; };
      window.addEventListener('pointermove', this.onMove, { passive: true });
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this);
      this.resize();
      requestAnimationFrame(() => { this.c.style.opacity = '1'; });
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { rootMargin: '120px' }); this.io.observe(this);
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches; let drawn = false;
      const loop = () => { if (this.visible !== false && !document.hidden && !(still && drawn)) { this.draw(); drawn = true; } this.raf = requestAnimationFrame(loop); };
      this.raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); window.removeEventListener('pointermove', this.onMove); this._on = false; }
    resize() {
      const w = this.clientWidth, h = this.clientHeight; if (!w || !h) return;
      const dpr = Math.min(matchMedia('(max-width: 760px)').matches ? 1.5 : 2, window.devicePixelRatio || 1);
      this.w = w; this.h = h; this.c.width = w * dpr; this.c.height = h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = (w * h) / (1280 * 650);
      const nN = Math.max(14, Math.round(70 * this.density * Math.min(1.4, Math.max(0.35, area))));
      const nB = Math.max(4, Math.round(22 * this.density * Math.min(1.4, Math.max(0.35, area))));
      this.nodes = Array.from({ length: nN }, () => ({ x: Math.random() * w, y: Math.random() * h, vy: Math.random() * 0.35 + 0.08, t: randToken(), tick: Math.random() * 60, big: Math.random() < 0.12 }));
      this.beams = Array.from({ length: nB }, () => ({ x: Math.random() * w, y: Math.random() * h, len: Math.random() * 110 + 50, sp: Math.random() * 5 + 2.5, op: Math.random() * 0.45 + 0.25 }));
    }
    draw() {
      const { ctx, w, h, rgb, mouse } = this; if (!w) return;
      const light = document.documentElement.dataset.theme === 'light';
      const [R, G, B] = light ? [74, 100, 0] : rgb, col = a => `rgba(${R},${G},${B},${a})`, speed = this.reduced ? 0.15 : 1;
      const ink = light ? '40,50,20' : '210,220,190';
      ctx.clearRect(0, 0, w, h);
      this.beams.forEach(b => {
        b.y -= b.sp * speed;
        if (b.y + b.len < 0) { b.y = h + 100; b.x = Math.random() * w; }
        const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.len);
        g.addColorStop(0, col(b.op)); g.addColorStop(1, col(0));
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + b.len); ctx.stroke();
      });
      const N = this.nodes; ctx.lineWidth = 0.5;
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const d = Math.hypot(N[i].x - N[j].x, N[i].y - N[j].y);
        if (d < 120) { ctx.strokeStyle = `rgba(${ink},${(light ? 0.18 : 0.13) * (1 - d / 120)})`; ctx.beginPath(); ctx.moveTo(N[i].x, N[i].y); ctx.lineTo(N[j].x, N[j].y); ctx.stroke(); }
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      N.forEach(n => {
        n.y += n.vy * speed;
        if (n.y > h + 20) { n.y = -20; n.x = Math.random() * w; n.t = randToken(); }
        const d = Math.hypot(mouse.x - n.x, mouse.y - n.y), near = d < 180;
        // chronos tick: running timers count up, others shuffle near the pointer
        n.tick += speed;
        if (n.tick > 60) { n.tick = 0; const m = /^(\d\d):(\d\d)$/.exec(n.t); if (m) { let s = +m[1] * 60 + +m[2] + 1; n.t = pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); } }
        if (near && Math.random() > 0.8) n.t = randToken();
        if (near) { ctx.strokeStyle = col(0.5 * (1 - d / 180)); ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.font = (n.big ? '600 16px' : '500 11px') + ' ui-monospace, "SFMono-Regular", Menlo, monospace';
        ctx.fillStyle = near ? col(1) : n.big ? col(light ? 0.5 : 0.55) : `rgba(${ink},${light ? 0.32 : 0.38})`;
        ctx.fillText(n.t, n.x, n.y);
      });
    }
  }
  customElements.define('fam-particles', FamParticles);
})();

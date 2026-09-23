// <fam-spa-particles> — fond « spa » : bokeh doré, pétales qui tombent lentement, éclats scintillants (canvas). Attributs : color (hex), density (0.25–2.5).
(function () {
  if (customElements.get('fam-spa-particles')) return;
  const hexToRgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); const n = parseInt(m ? m[1] : 'C9A24A', 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  class FamSpaParticles extends HTMLElement {
    connectedCallback() {
      if (this._on) return; this._on = true;
      this.style.position = 'absolute'; this.style.inset = '0'; this.style.pointerEvents = 'none'; this.style.display = 'block';
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = '<canvas style="display:block;width:100%;height:100%;opacity:0;transition:opacity 2.4s ease"></canvas>';
      this.c = r.querySelector('canvas'); this.ctx = this.c.getContext('2d');
      this.rgb = hexToRgb(this.getAttribute('color'));
      this.density = Math.max(0.25, Math.min(2.5, parseFloat(this.getAttribute('density')) || 1));
      this.mouse = { x: -1e4, y: -1e4 };
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.t = 0;
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
    petal(w, h, top) { return { x: rnd(0, w), y: top ? rnd(-h * 0.2, -20) : rnd(0, h), s: rnd(5, 11), vy: rnd(0.18, 0.45), sway: rnd(0.4, 1.2), ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-0.012, 0.012), op: rnd(0.35, 0.75), dx: 0 }; }
    resize() {
      const w = this.clientWidth, h = this.clientHeight; if (!w || !h) return;
      const dpr = Math.min(matchMedia('(max-width: 760px)').matches ? 1.5 : 2, window.devicePixelRatio || 1);
      this.w = w; this.h = h; this.c.width = w * dpr; this.c.height = h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const k = (matchMedia('(max-width: 760px)').matches ? 0.6 : 1) * this.density * Math.min(1.5, Math.max(0.4, (w * h) / (1280 * 900)));
      this.orbs = Array.from({ length: Math.max(6, Math.round(16 * k)) }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(40, 140), vy: rnd(0.05, 0.18), ph: rnd(0, 6.28), op: rnd(0.05, 0.13) }));
      this.petals = Array.from({ length: Math.max(8, Math.round(26 * k)) }, () => this.petal(w, h, false));
      this.glints = Array.from({ length: Math.max(10, Math.round(40 * k)) }, () => ({ x: rnd(0, w), y: rnd(0, h), ph: rnd(0, 6.28), sp: rnd(0.01, 0.03), s: rnd(1.5, 3.2) }));
    }
    draw() {
      const { ctx, w, h, mouse } = this; if (!w) return;
      const light = document.documentElement.dataset.theme === 'light';
      const [R, G, B] = light ? [138, 104, 30] : this.rgb, col = a => `rgba(${R},${G},${B},${a})`;
      const speed = this.reduced ? 0.15 : 1; this.t += speed;
      ctx.clearRect(0, 0, w, h);
      // bokeh
      this.orbs.forEach(o => {
        o.y -= o.vy * speed; if (o.y + o.r < 0) { o.y = h + o.r; o.x = rnd(0, w); }
        const x = o.x + Math.sin(this.t * 0.004 + o.ph) * 30, a = o.op * (0.7 + 0.3 * Math.sin(this.t * 0.01 + o.ph)) * (light ? 1.4 : 1);
        const g = ctx.createRadialGradient(x, o.y, 0, x, o.y, o.r);
        g.addColorStop(0, col(a)); g.addColorStop(0.6, col(a * 0.4)); g.addColorStop(1, col(0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, o.y, o.r, 0, 6.2832); ctx.fill();
      });
      // glints
      this.glints.forEach(s => {
        s.ph += s.sp * speed; const a = Math.max(0, Math.sin(s.ph)) ** 3; if (a < 0.02) return;
        const d = Math.hypot(mouse.x - s.x, mouse.y - s.y), boost = d < 160 ? 1 + (1 - d / 160) : 1;
        ctx.strokeStyle = col(Math.min(1, a * 0.8 * boost)); ctx.lineWidth = 1;
        const L = s.s * (1 + a) * boost; ctx.beginPath();
        ctx.moveTo(s.x - L, s.y); ctx.lineTo(s.x + L, s.y); ctx.moveTo(s.x, s.y - L); ctx.lineTo(s.x, s.y + L); ctx.stroke();
        ctx.fillStyle = col(a * boost * 0.9); ctx.beginPath(); ctx.arc(s.x, s.y, 0.9, 0, 6.2832); ctx.fill();
      });
      // petals
      this.petals.forEach((p, i) => {
        p.y += p.vy * speed; p.rot += p.vr * speed;
        const d = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (d < 140) p.dx += ((p.x - mouse.x) / (d || 1)) * 0.08 * (1 - d / 140);
        p.dx *= 0.96; p.x += p.dx * speed;
        const x = p.x + Math.sin(this.t * 0.012 * p.sway + p.ph) * 22 * p.sway;
        if (p.y > h + 20) this.petals[i] = this.petal(w, h, true);
        ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.rot + Math.sin(this.t * 0.02 + p.ph) * 0.4);
        const s = p.s, g = ctx.createLinearGradient(0, -s, 0, s);
        g.addColorStop(0, col(p.op * (light ? 0.9 : 0.8))); g.addColorStop(1, col(p.op * 0.25));
        ctx.fillStyle = g; ctx.beginPath();
        ctx.moveTo(0, -s); ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.6, s * 0.7, 0, s); ctx.bezierCurveTo(-s * 0.6, s * 0.7, -s * 0.9, -s * 0.5, 0, -s);
        ctx.fill(); ctx.restore();
      });
    }
  }
  customElements.define('fam-spa-particles', FamSpaParticles);
})();

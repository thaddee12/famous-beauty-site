// <fam-vip-lumiere> — fond « VIP » sobre : rais de lumière dorés lents, poussière d'or, rares scintillements (canvas). Attributs : color (hex), density (0.25–2.5).
(function () {
  if (customElements.get('fam-vip-lumiere')) return;
  const hexToRgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); const n = parseInt(m ? m[1] : 'C9A24A', 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  class FamVipLumiere extends HTMLElement {
    connectedCallback() {
      if (this._on) return; this._on = true;
      this.style.position = 'absolute'; this.style.inset = '0'; this.style.pointerEvents = 'none'; this.style.display = 'block';
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = '<canvas style="display:block;width:100%;height:100%;opacity:0;transition:opacity 2.6s ease"></canvas>';
      this.c = r.querySelector('canvas'); this.ctx = this.c.getContext('2d');
      this.rgb = hexToRgb(this.getAttribute('color'));
      this.density = Math.max(0.25, Math.min(2.5, parseFloat(this.getAttribute('density')) || 1));
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.t = 0;
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this);
      this.resize();
      requestAnimationFrame(() => { this.c.style.opacity = '1'; });
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { rootMargin: '120px' }); this.io.observe(this);
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches; let drawn = false;
      const loop = () => { if (this.visible !== false && !document.hidden && !(still && drawn)) { this.draw(); drawn = true; } this.raf = requestAnimationFrame(loop); };
      this.raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); this._on = false; }
    resize() {
      const w = this.clientWidth, h = this.clientHeight; if (!w || !h) return;
      const dpr = Math.min(matchMedia('(max-width: 760px)').matches ? 1.5 : 2, window.devicePixelRatio || 1);
      this.w = w; this.h = h; this.c.width = w * dpr; this.c.height = h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const k = (matchMedia('(max-width: 760px)').matches ? 0.6 : 1) * this.density * Math.min(1.5, Math.max(0.4, (w * h) / (1280 * 900)));
      this.rays = Array.from({ length: 5 }, (_, i) => ({ x: (i + 0.5) / 5, wd: rnd(60, 160), sp: rnd(0.00018, 0.00035) * (i % 2 ? 1 : -1), ph: rnd(0, 6.28), op: rnd(0.05, 0.1) }));
      this.dust = Array.from({ length: Math.max(20, Math.round(70 * k)) }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(0.4, 1.4), vy: rnd(0.05, 0.22), vx: rnd(-0.05, 0.05), ph: rnd(0, 6.28), op: rnd(0.25, 0.7) }));
      this.stars = Array.from({ length: Math.max(4, Math.round(10 * k)) }, () => ({ x: rnd(0, w), y: rnd(0, h), ph: rnd(0, 6.28), sp: rnd(0.006, 0.014), s: rnd(4, 8) }));
    }
    draw() {
      const { ctx, w, h } = this; if (!w) return;
      const light = document.documentElement.dataset.theme === 'light';
      const [R, G, B] = light ? [138, 104, 30] : this.rgb, col = a => `rgba(${R},${G},${B},${a})`;
      const speed = this.reduced ? 0.12 : 1; this.t += speed;
      ctx.clearRect(0, 0, w, h);
      // rais diagonaux
      ctx.save(); ctx.globalCompositeOperation = light ? 'multiply' : 'screen';
      this.rays.forEach(r => {
        const cx = (r.x + Math.sin(this.t * r.sp * 10 + r.ph) * 0.12) * w, a = r.op * (0.6 + 0.4 * Math.sin(this.t * 0.006 + r.ph)) * (light ? 0.8 : 1);
        ctx.save(); ctx.translate(cx, -h * 0.1); ctx.rotate(0.38);
        const g = ctx.createLinearGradient(-r.wd, 0, r.wd, 0);
        g.addColorStop(0, col(0)); g.addColorStop(0.5, col(a)); g.addColorStop(1, col(0));
        const gv = ctx.createLinearGradient(0, 0, 0, h * 1.4);
        ctx.fillStyle = g; ctx.globalAlpha = 1; ctx.fillRect(-r.wd, 0, r.wd * 2, h * 1.4);
        ctx.restore();
      });
      ctx.restore();
      // poussière d'or
      this.dust.forEach(p => {
        p.y -= p.vy * speed; p.x += (p.vx + Math.sin(this.t * 0.01 + p.ph) * 0.06) * speed;
        if (p.y < -5) { p.y = h + 5; p.x = rnd(0, w); }
        const a = p.op * (0.55 + 0.45 * Math.sin(this.t * 0.02 + p.ph));
        ctx.fillStyle = col(a); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      });
      // scintillements rares (étoile fine à 4 branches)
      this.stars.forEach(s => {
        s.ph += s.sp * speed; const a = Math.max(0, Math.sin(s.ph)) ** 6; if (a < 0.02) { if (Math.sin(s.ph) < -0.99) { s.x = rnd(0, w); s.y = rnd(0, h); } return; }
        const L = s.s * (0.6 + a * 0.8);
        ctx.strokeStyle = col(a * 0.9); ctx.lineWidth = 0.8; ctx.beginPath();
        ctx.moveTo(s.x - L, s.y); ctx.lineTo(s.x + L, s.y); ctx.moveTo(s.x, s.y - L * 1.3); ctx.lineTo(s.x, s.y + L * 1.3); ctx.stroke();
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, L * 1.6); g.addColorStop(0, col(a * 0.35)); g.addColorStop(1, col(0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, L * 1.6, 0, 6.2832); ctx.fill();
      });
    }
  }
  customElements.define('fam-vip-lumiere', FamVipLumiere);
})();

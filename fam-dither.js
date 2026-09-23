// <fam-dither> — texture animée « dithering warp » (WebGL2), adaptée d'un shader de ticket. Attributs : back, front (hex), speed, px, scale.
(function () {
  if (customElements.get('fam-dither')) return;
  const hex = h => { const m = /^#?([0-9a-f]{6})$/i.exec((h || '').trim()); const n = parseInt(m ? m[1] : '000000', 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const VS = `#version 300 es
layout(location=0) in vec4 a_position; void main(){ gl_Position = a_position; }`;
  const FS = `#version 300 es
precision highp float;
uniform float u_time; uniform vec2 u_res; uniform float u_ratio; uniform float u_px; uniform float u_scale;
uniform vec3 u_back; uniform vec3 u_front;
out vec4 fragColor;
float hash21(vec2 p){ p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1; p += dot(p, p + 19.19); return fract(p.x * p.y); }
void main(){
  float t = .5 * u_time;
  float px = u_px * u_ratio;
  vec2 pxUV = (gl_FragCoord.xy - .5 * u_res) / px;
  vec2 cpx = (floor(pxUV) + .5) * px;
  vec2 uv = cpx / u_ratio * .003 / u_scale;
  for (float i = 1.0; i < 6.0; i++) {
    uv.x += 0.6 / i * cos(i * 2.5 * uv.y + t);
    uv.y += 0.6 / i * cos(i * 1.5 * uv.x + t);
  }
  float shape = .15 / max(0.001, abs(sin(t - uv.y - uv.x)));
  shape = smoothstep(0.02, 1., shape);
  float d = step(hash21(cpx), shape) - .5;
  float r = step(.5, shape + d);
  fragColor = vec4(mix(u_back, u_front, r), 1.);
}`;
  class FamDither extends HTMLElement {
    static get observedAttributes() { return ['back', 'front', 'speed', 'px', 'scale']; }
    connectedCallback() {
      if (this._on) return; this._on = true;
      this.style.position = 'absolute'; this.style.inset = '0'; this.style.display = 'block'; this.style.pointerEvents = 'none';
      const r = this.shadowRoot || this.attachShadow({ mode: 'open' });
      r.innerHTML = '<canvas style="display:block;width:100%;height:100%"></canvas>';
      this.c = r.querySelector('canvas');
      const gl = this.gl = this.c.getContext('webgl2', { premultipliedAlpha: false, antialias: false });
      if (!gl) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; };
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return; }
      this.p = p; gl.useProgram(p);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      this.u = {}; ['u_time', 'u_res', 'u_ratio', 'u_px', 'u_scale', 'u_back', 'u_front'].forEach(k => this.u[k] = gl.getUniformLocation(p, k));
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.t = 0; this.last = performance.now();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this); this.resize();
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }); this.io.observe(this);
      const loop = now => { const dt = Math.min(64, now - this.last); this.last = now; if (this.visible !== false && !document.hidden) { this.t += dt * this.speed(); this.draw(); } this.raf = requestAnimationFrame(loop); };
      this.raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); this._on = false; }
    attributeChangedCallback() { if (this.p) this.draw(); }
    speed() { const s = parseFloat(this.getAttribute('speed')); return (isNaN(s) ? 0.4 : s) * (this.reduced ? 0 : 1); }
    resize() {
      const w = this.clientWidth, h = this.clientHeight; if (!w || !h || !this.gl) return;
      this.ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      this.c.width = Math.round(w * this.ratio); this.c.height = Math.round(h * this.ratio);
      this.gl.viewport(0, 0, this.c.width, this.c.height); this.draw();
    }
    draw() {
      const gl = this.gl; if (!gl || !this.p) return;
      gl.useProgram(this.p);
      gl.uniform1f(this.u.u_time, this.t * 1e-3);
      gl.uniform2f(this.u.u_res, this.c.width, this.c.height);
      gl.uniform1f(this.u.u_ratio, this.ratio || 1);
      gl.uniform1f(this.u.u_px, parseFloat(this.getAttribute('px')) || 1);
      gl.uniform1f(this.u.u_scale, parseFloat(this.getAttribute('scale')) || 1);
      gl.uniform3fv(this.u.u_back, hex(this.getAttribute('back')));
      gl.uniform3fv(this.u.u_front, hex(this.getAttribute('front')));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
  customElements.define('fam-dither', FamDither);
})();

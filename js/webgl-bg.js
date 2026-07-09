/* Ember dust — WebGL particle field for the hero.
   Degrades: reduced-motion or no WebGL → canvas removed, CSS gradient remains. */
(function () {
  const canvas = document.getElementById("ember-canvas");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = !reduced && canvas.getContext("webgl", { alpha: true, antialias: false });
  if (!gl) { canvas.remove(); return; }

  const COUNT = Math.min(1600, Math.floor(window.innerWidth * 1.1));

  const vsSrc = `
    attribute vec4 aData;   // x, y, size, phase
    uniform float uTime;
    uniform vec2 uMouse;
    varying float vAlpha;
    void main() {
      float phase = aData.w;
      vec2 pos = aData.xy;

      // slow upward drift with sideways sway
      pos.y += mod(uTime * (0.018 + 0.02 * fract(phase * 7.31)) + phase, 1.0) * 2.2 - 1.1;
      pos.x += sin(uTime * 0.35 + phase * 6.2831) * 0.045;

      // gentle mouse repulsion
      vec2 d = pos - uMouse;
      float dist = length(d);
      if (dist < 0.28) pos += normalize(d) * (0.28 - dist) * 0.35;

      float tw = 0.55 + 0.45 * sin(uTime * (1.2 + fract(phase * 3.7)) + phase * 40.0);
      vAlpha = tw * smoothstep(1.15, 0.85, abs(pos.y));
      gl_Position = vec4(pos, 0.0, 1.0);
      gl_PointSize = aData.z * (0.7 + 0.5 * tw);
    }`;

  const fsSrc = `
    precision mediump float;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.08, d) * vAlpha;
      gl_FragColor = vec4(0.910, 0.365, 0.239, a * 0.55); // ember
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("ember-canvas shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = shader(gl.VERTEX_SHADER, vsSrc);
  const fs = shader(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) { canvas.remove(); return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const data = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    data[i * 4]     = Math.random() * 2 - 1;          // x
    data[i * 4 + 1] = Math.random() * 2 - 1;          // y
    data[i * 4 + 2] = 1.2 + Math.random() * 2.6;      // size
    data[i * 4 + 3] = Math.random();                  // phase
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aData = gl.getAttribLocation(prog, "aData");
  gl.enableVertexAttribArray(aData);
  gl.vertexAttribPointer(aData, 4, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, "uTime");
  const uMouse = gl.getUniformLocation(prog, "uMouse");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  let mouseX = 0, mouseY = -2; // offscreen until first move
  window.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseY = -(((e.clientY - r.top) / r.height) * 2 - 1);
  }, { passive: true });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // pause when hero offscreen or tab hidden
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
    .observe(canvas);

  let raf;
  const start = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.POINTS, 0, COUNT);
  }
  raf = requestAnimationFrame(frame);

  window.addEventListener("pagehide", () => cancelAnimationFrame(raf));
})();

/* Campo de puntos (manual §6). Retícula de 22 px; punto azul; de disperso a ordenado
   de izquierda a derecha (horizontal) o de arriba hacia abajo (vertical).
   Algoritmo de referencias/dots.js del manual. Sin animación: ya ordenado y estático. */
window.campoPuntos = function (canvas, opts) {
  opts = opts || {};
  if (!canvas) return;
  const par = canvas.parentElement; const w = opts.w || (par ? par.clientWidth : 300), h = opts.h || (par ? par.clientHeight : 200);
  if (!w || !h) return;
  const dpr = Math.max(2, window.devicePixelRatio || 1);
  canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const x = canvas.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
  let s = opts.seed || 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const G = 22, vertical = !!opts.vertical;
  const X0 = G / 2, X1 = w - G / 2, Y0 = G / 2, Y1 = h - G / 2;
  for (let gx = X0; gx <= X1; gx += G) for (let gy = Y0; gy <= Y1; gy += G) {
    const t = vertical ? (gy - Y0) / ((Y1 - Y0) * .85) : (gx - X0) / ((X1 - X0) * .85);
    const tt = Math.min(1, Math.max(0, t)), e = tt * tt * (3 - 2 * tt), j = (1 - e) * 14;
    if (r() > 0.2 + 0.8 * e) continue;
    x.globalAlpha = 0.15 + 0.7 * e; x.fillStyle = '#09318D';
    x.beginPath(); x.arc(gx + (r() - .5) * 2 * j, gy + (r() - .5) * 2 * j, 1.2 + 1.1 * e, 0, 7); x.fill();
  }
};
window.wordmark = (cls = '') => `<span class="wm ${cls}">freaknerd<i></i></span>`;
window.CHEV = '<svg class="chev" viewBox="0 0 14 18" aria-hidden="true"><path d="M0 0H5.2L14 9L5.2 18H0L8.8 9Z"/></svg>';
/* Pinta todo <canvas data-campo="v|h"> (también los que se crean después al renderizar) */
(function () {
  const pintar = () => document.querySelectorAll('canvas[data-campo]').forEach(c => { const p = c.parentElement, k = p.clientWidth + 'x' + p.clientHeight; if (c.dataset.ok === k) return; c.dataset.ok = k; campoPuntos(c, { vertical: c.dataset.campo === 'v', seed: Number(c.dataset.seed) || 11 }); });
  let h; const pedir = () => { clearTimeout(h); h = setTimeout(pintar, 30); };
  window.addEventListener('resize', pedir); window.pintarCampos = pintar;
  const ini = () => { new MutationObserver(pedir).observe(document.body, { childList: true, subtree: true }); pedir(); };
  if (document.body) ini(); else document.addEventListener('DOMContentLoaded', ini);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedir);
})();

/* Campo de puntos (manual v2.1, §7.6): los datos encuentran su lugar en la retícula.
   Port de lib.dots (libro de marca): los puntos ordenados caen exactamente en los VÉRTICES de la retícula
   (cada 88 px en web); hacia el lado disperso (izquierda, o arriba en vertical) el mismo punto se suelta al azar
   dentro de las celdas vecinas, y se suman 1–2 puntos extra por celda que se apagan hacia el lado ordenado.
   Puntos piedra sobre crema, crema sobre piedra; hasta dos puntos naranja vivos sobre un vértice de la zona ordenada.
   Movimiento (§8): llegan dispersos y se acomodan en 800 ms, cubic-bezier(.2,.8,.2,1), una sola vez.
   Con prefers-reduced-motion, o con data-estatico (reporte/PDF), se dibuja directo en su estado final. */
(function () {
  const PIEDRA = '#656A66', CREMA = '#F4EFE6', NARANJA = '#FF4A1C';
  const sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const ease = (t) => { /* cubic-bezier(.2,.8,.2,1) por bisección */
    let lo = 0, hi = 1, u = t; for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; const x = 3 * (1 - u) * (1 - u) * u * .2 + 3 * (1 - u) * u * u * .2 + u * u * u; if (x < t) lo = u; else hi = u; }
    return 3 * (1 - u) * (1 - u) * u * .8 + 3 * (1 - u) * u * u * 1 + u * u * u;
  };
  /* Genera el campo: lista de puntos con posición final y posición dispersa de partida */
  function generar(w, h, o) {
    let s = o.seed || 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const step = o.step || 88, gx = o.gx || 0, gy = o.gy || 0, vertical = !!o.vertical, r = o.r || Math.max(1.6, 3 * step / 88);
    const i0 = Math.ceil((0 - gx) / step - 1e-9), i1 = Math.floor((w - gx) / step + 1e-9), j0 = Math.ceil((0 - gy) / step - 1e-9), j1 = Math.floor((h - gy) / step + 1e-9);
    const d0 = o.d0 == null ? 1 : o.d0, d1 = o.d1 == null ? 0 : o.d1;
    /* desde: fracción del lienzo donde empieza el campo (a su izquierda, o arriba en vertical, queda libre para el texto) */
    const ini = (vertical ? h : w) * (o.desde || 0), largo = (vertical ? h : w) - ini;
    const disAt = (X, Y) => { let t = ((vertical ? Y : X) - ini) / largo; t = Math.max(0, Math.min(1, t / (o.orden || .7))); return d0 + (d1 - d0) * t; };
    const libre = (X, Y) => (vertical ? Y : X) < ini - 1;
    const pts = [], cand = [];
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const X = gx + i * step, Y = gy + j * step, dis = disAt(X, Y), k = sm(dis), ux = rnd() * 2 - 1, uy = rnd() * 2 - 1;
      if (libre(X, Y)) continue;
      pts.push({ fx: X + ux * .9 * step * k, fy: Y + uy * .9 * step * k, sx: X + ux * .9 * step, sy: Y + uy * .9 * step, r, a: .95 });
      const sz0 = r * 8 / 3; if (dis <= .05 && X > sz0 && X < w - sz0 && Y > sz0 && Y < h - sz0 && ((!vertical && (X - ini) / largo > .55) || (vertical && (Y - ini) / largo > .55))) cand.push([X, Y]);
    }
    if (o.extra !== false) for (let i = i0 - 1; i <= i1; i++) for (let j = j0 - 1; j <= j1; j++) {
      const cx = gx + (i + .5) * step, cy = gy + (j + .5) * step, dis = disAt(cx, cy), k = sm(dis * 1.25 - .05);
      if (k <= 0 || libre(cx, cy)) continue; const n = rnd() < .5 ? 1 : 2;
      for (let q = 0; q < n; q++) if (rnd() < k) { const x = gx + (i + rnd()) * step, y = gy + (j + rnd()) * step; pts.push({ fx: x, fy: y, sx: x, sy: y, r: r * .8, a: .25 + .45 * dis, extra: true }); }
    }
    const vivos = []; const nv = o.vivos == null ? 2 : o.vivos;
    if (cand.length && nv) [cand[Math.floor(cand.length * .35)], cand[Math.floor(cand.length * .8)]].slice(0, nv).forEach(p => vivos.push(p));
    return { pts, vivos, sz: Math.round(r * 8 / 3 * 10) / 10 };
  }
  function pintar(ctx, w, h, campo, o, t) {
    ctx.clearRect(0, 0, w, h);
    if (o.grid) { const step = o.step || 88, gx = o.gx || 0, gy = o.gy || 0; ctx.strokeStyle = o.amb === 'piedra' ? CREMA : PIEDRA; ctx.globalAlpha = o.amb === 'piedra' ? .2 : .12; ctx.lineWidth = 1; ctx.beginPath(); for (let x = gx; x <= w; x += step) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); } for (let y = gy; y <= h; y += step) { ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); } ctx.stroke(); }
    ctx.fillStyle = o.amb === 'piedra' ? CREMA : PIEDRA;
    const e = ease(t);
    campo.pts.forEach(p => { const x = p.extra ? p.fx : p.sx + (p.fx - p.sx) * e, y = p.extra ? p.fy : p.sy + (p.fy - p.sy) * e; ctx.globalAlpha = p.extra ? p.a * e : p.a * (.35 + .65 * e); ctx.beginPath(); ctx.arc(x + .5, y + .5, p.r, 0, 7); ctx.fill(); });
    if (t >= 1) { ctx.globalAlpha = 1; ctx.fillStyle = NARANJA; campo.vivos.forEach(([x, y]) => ctx.fillRect(x - campo.sz / 2, y - campo.sz / 2, campo.sz, campo.sz)); }
    ctx.globalAlpha = 1;
  }
  window.campoPuntos = function (canvas, opts) {
    opts = opts || {}; if (!canvas) return;
    const par = canvas.parentElement; const w = opts.w || (par ? par.clientWidth : 300), h = opts.h || (par ? par.clientHeight : 200);
    if (!w || !h) return;
    const dpr = Math.max(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const campo = generar(w, h, opts);
    const quieto = opts.estatico || !!opts.yaVisto || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (quieto) { pintar(ctx, w, h, campo, opts, 1); return; }
    const t0 = performance.now(); const paso = (ahora) => { const t = Math.min(1, (ahora - t0) / 800); pintar(ctx, w, h, campo, opts, t); if (t < 1) requestAnimationFrame(paso); }; requestAnimationFrame(paso);
  };
  window.wordmark = (cls = '') => `<span class="wm ${cls}">freaknerd<i></i></span>`;
  window.fnIcono = (s = 44, cls = '') => `<span class="fn-icono ${cls}" style="--s:${s}px" aria-label="fn"><b>fn</b></span>`;
  window.CHEV = '<svg class="chev" viewBox="0 0 14 18" aria-hidden="true"><path d="M0 0H5.2L14 9L5.2 18H0L8.8 9Z"/></svg>';
  /* Pinta todo <canvas data-campo="v|h"> (también los que se crean después al renderizar).
     Atributos: data-seed, data-amb="piedra" (puntos crema), data-step (88 por defecto), data-grid (dibuja la retícula),
     data-estatico (sin movimiento), data-orden (fracción del alto o ancho donde el campo ya está ordenado; .7 por defecto). El movimiento corre una sola vez por canvas y tamaño; los redibujados posteriores
     (refresco cada 3 s) lo pintan ya en su sitio. */
  const vistos = new WeakSet();
  const pintarTodos = () => document.querySelectorAll('canvas[data-campo]').forEach(c => {
    const p = c.parentElement, k = p.clientWidth + 'x' + p.clientHeight; if (c.dataset.ok === k) return;
    const yaVisto = vistos.has(c) || c.dataset.ok != null; c.dataset.ok = k; vistos.add(c);
    const pequeno = p.clientWidth < 600 && c.dataset.campo !== 'v';
    campoPuntos(c, { vertical: c.dataset.campo === 'v', seed: Number(c.dataset.seed) || 11, amb: c.dataset.amb, step: Number(c.dataset.step) || (p.clientWidth < 440 ? 66 : 88), grid: c.hasAttribute('data-grid'), estatico: c.hasAttribute('data-estatico'), yaVisto, desde: Number(c.dataset.desde) || 0, vivos: c.dataset.vivos == null ? 2 : Number(c.dataset.vivos), orden: Number(c.dataset.orden) || 0 });
  });
  let tm; const pedir = () => { clearTimeout(tm); tm = setTimeout(pintarTodos, 30); };
  window.addEventListener('resize', pedir); window.pintarCampos = pintarTodos;
  const ini = () => { new MutationObserver(pedir).observe(document.body, { childList: true, subtree: true }); pedir(); };
  if (document.body) ini(); else document.addEventListener('DOMContentLoaded', ini);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedir);
})();

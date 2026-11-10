/* ============================================================
   COMMON — etapas, helpers de UI, temporizador, módulo MECE (IA)
   ============================================================ */
window.STAGES = [
  { key: 'bienvenida',                 n: '0',   label: 'Bienvenida',                    grupo: 'Apertura' },
  { key: 'instrucciones',              n: '0.5', label: 'Instrucciones / QR',            grupo: 'Apertura' },
  { key: 'ideacion',                   n: '1',   label: 'Ideación por pilares',          grupo: 'Ideación',  timer: 'minutos_ideacion' },
  { key: 'instrucciones_consolidacion',n: '1.5', label: 'Instr. Consolidación',          grupo: 'Consolidación', opcional: true },
  { key: 'consolidacion',              n: '2',   label: 'Consolidación MECE (IA)',       grupo: 'Consolidación' },
  { key: 'pausa',                      n: '3',   label: 'Pausa · cafecito',              grupo: 'Consolidación', timer: 'minutos_pausa' },
  { key: 'instrucciones_votacion',     n: '3.5', label: 'Instr. Votación',               grupo: 'Votación (opcional)', opcional: true },
  { key: 'votacion',                   n: '4',   label: 'Votación por votos',            grupo: 'Votación (opcional)', opcional: true },
  { key: 'resultados',                 n: '5',   label: 'Resultados de votación',        grupo: 'Votación (opcional)', opcional: true },
  { key: 'instrucciones_matriz',       n: '5.5', label: 'Instr. Matriz',                 grupo: 'Priorización' },
  { key: 'matriz',                     n: '6',   label: 'Calificación Esfuerzo · Impacto', grupo: 'Priorización', timer: 'minutos_matriz' },
  { key: 'cierre',                     n: '7',   label: 'Matriz final · Hacer ya',     grupo: 'Priorización' },
  { key: 'resumen',                    n: '7.5', label: 'Resumen del foro',              grupo: 'Cierre' },
  { key: 'reporte',                    n: '8',   label: 'Reporte final',                 grupo: 'Cierre' }
];
window.stageInfo = (k) => STAGES.find(s => s.key === k) || { key: k, n: '?', label: k };

/* Colores por pilar: en la identidad v1 todo es azul (el pilar se distingue por nombre e ícono; manual §3) */
window.COLORS = (() => { const c = { bg: 'bg-fn-crema-2', text: 'text-fn-pizarra', border: 'border-fn-piedra', solid: 'bg-fn-pizarra', hex: "#2C312E", postit: 'bg-white' }; const o = {}; ['blue', 'green', 'purple', 'amber', 'rose', 'teal', 'indigo', 'orange', 'gray'].forEach(k => o[k] = c); return o; })();
window.col = (c) => COLORS[c] || COLORS.gray;

/* Orden aleatorio pero estable por participante: baraja con una semilla derivada del id del
   participante, así cada celular ve las ideas en un orden distinto (evita el sesgo de "las primeras
   siempre ganan") y ese orden no cambia entre refrescos. */
window.ordenPersonal = (arr, seed) => {
  let h = 2166136261; String(seed || '').split('').forEach(ch => { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; });
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
};

/* Escala de calificación (1..N). Una sola fuente de verdad: config.escala_max, por defecto 5 */
/* Tope de calificaciones por participante en la matriz (config.max_calificaciones, por defecto 8),
   nunca mayor que el número de ideas a calificar */
window.maxCalif = (sesion, nIdeas) => { const n = Number(sesion && sesion.config && sesion.config.max_calificaciones); const m = (n >= 1 && n <= 100) ? n : 8; return nIdeas ? Math.min(m, nIdeas) : m; };
window.escalaMax = (sesion) => { const n = Number(sesion && sesion.config && sesion.config.escala_max); return (n >= 2 && n <= 10) ? n : 5; };

/* Ideas que se califican en la matriz: las consolidadas (grupos) MÁS las ideas validadas que
   quedaron solas (sin grupo). Así ningún pilar con una sola idea aprobada se queda por fuera. */
window.calificables = (ideas) => (ideas || []).filter(i => i.tipo === 'grupo' || (i.tipo === 'idea' && i.estado === 'validada' && !i.padre_id))
  .sort((a, b) => (a.pilar_orden - b.pilar_orden) || (a.id - b.id));

/* Helpers */
window.$ = (id) => document.getElementById(id);
window.esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
window.fmtHora = (iso) => iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';
window.pct = (a, b) => b ? Math.round(100 * a / b) : 0;
window.toast = (msg, tipo = 'ok') => {
  let t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 text-base font-bold transition-opacity opacity-0 pointer-events-none whitespace-nowrap'; document.body.appendChild(t); }
  /* éxito en azul con ✓; error y atención en naranja texto con palabra (manual §11.6) */
  t.textContent = msg; t.classList.remove('t-ok', 't-err', 't-warn'); t.classList.add(tipo === 'err' ? 't-err' : tipo === 'warn' ? 't-warn' : 't-ok');
  t.classList.remove('opacity-0'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('opacity-0'), 2600);
};
window.errMsg = (e) => { const m = String(e && e.message || e); if (/row-level security|violates/i.test(m)) return 'Esta etapa ya se cerró: el moderador pasó a la siguiente.'; if (/Failed to fetch|NetworkError|Load failed|network|timeout/i.test(m)) return 'Sin conexión. Revisa el Wi‑Fi o los datos y reintenta.'; if (/LIMITE_VOTOS/.test(m)) return 'Ya usaste tus votos en este pilar.'; if (/LIMITE_CALIFICACIONES/.test(m)) return 'Ya usaste todas tus calificaciones: quita una para calificar otra idea.'; if (/ETAPA_CERRADA/.test(m)) return 'Esta etapa ya se cerró.'; if (/CLAVE_INVALIDA/.test(m)) return 'Clave incorrecta.'; if (/SOLO_ADMIN/.test(m)) return 'Solo el administrador puede hacer esto.'; if (/duplicate|unique/i.test(m)) return 'Ya lo habías hecho.'; return m; };
window.vibrar = (ms = 120) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
window.baseUrl = () => location.origin + location.pathname.replace(/[^/]*$/, '');
window.urlVista = (archivo) => {
  const p = new URLSearchParams();
  if (DB.SES !== (FORO_CONFIG.SESION || 'impercap')) p.set('s', DB.SES);
  if (DB.MODE === 'local' && new URLSearchParams(location.search).get('demo') === '1') p.set('demo', '1'); // un ejercicio cargado o de práctica no salta a la nube
  const q = p.toString(); return baseUrl() + archivo + (q ? '?' + q : '');
};

/* Junta asesora: sesión aparte de la ideación (config.tipo = 'junta' o un id con 'junta').
   Las vistas de ideación que se abren con una sesión de junta saltan a su equivalente. */
window.esJunta = (sesion) => !!(sesion && ((sesion.config && sesion.config.tipo === 'junta') || /junta/i.test(sesion.id || '')));
window.saltarAJunta = (sesion, archivo) => { if (esJunta(sesion)) { location.replace(urlVista(archivo)); return true; } return false; };

/* Logo del cliente en sesiones sin marca propia: config.logo_empresa; Impercap conserva el suyo por compatibilidad.
   Sin logo se muestra el nombre de la empresa en texto (antes salía el de Impercap en cualquier sesión). */
window.logoEmpresa = (s) => (s && s.config && s.config.logo_empresa) || (s && s.id === 'impercap' ? 'img/impercap_logo_solid.png' : '');

/* Marca por sesión: config.marca = 'propiman' | { id, nombre, logo, logo_claro, fondo, acento, acento_suave, acento_oscuro }.
   Sin marca la herramienta se ve como siempre (casa Freaknerd). Con marca, el cliente ocupa el lugar principal
   y Freaknerd queda como "facilitado por". Para un cliente nuevo: agregar su entrada aquí y sus logos en img/. */
window.MARCAS = {
  propiman: { id: 'propiman', nombre: 'Propiman', logo: 'img/propiman_logo_white.png', logo_claro: 'img/propiman_logo.png', icono: 'img/propiman_icon.png',
    fondo: '#0D132D', acento: '#FF5B6E', acento_suave: '#FF8A97', acento_oscuro: '#D63A4E' }
};
window.marca = (sesion) => {
  const m = sesion && sesion.config && sesion.config.marca; if (!m) return null;
  const r = typeof m === 'string' ? MARCAS[m] : Object.assign({}, MARCAS[m.id] || {}, m);
  return r && r.nombre ? r : null;
};
/* Título del evento (bienvenida, nav): config.titulo_evento, por defecto el nombre de la app */
window.tituloEvento = (sesion) => (sesion && sesion.config && sesion.config.titulo_evento) || FORO_CONFIG.APP_NAME || 'Foro de ideación';
window.facilitadoPor = (clase = '') => `<span class="fn-mono ${clase}">facilitado por <span class="normal-case font-bold">freaknerd</span></span>`;
window.aplicarMarca = (sesion) => {
  const m = marca(sesion), root = document.documentElement;
  const firma = m ? m.id + '|' + tituloEvento(sesion) : '';
  if (root.dataset.marcaFirma === firma) return; root.dataset.marcaFirma = firma;
  const st = document.getElementById('marcaCss'); if (st) st.remove();
  if (!m) { delete root.dataset.marca; return; }
  /* Sesión con marca de cliente: su logo (versión sobre claro) reemplaza el wordmark; el resto de la piel es la de Freaknerd v1 */
  root.dataset.marca = m.id;
  document.querySelectorAll('[data-wordmark]').forEach(w => { w.innerHTML = `<img src="${esc(m.logo_claro || m.logo)}" alt="${esc(m.nombre)}" class="h-6 w-auto block">`; });
  document.querySelectorAll('[data-appname]').forEach(a => { a.textContent = tituloEvento(sesion); });
  document.title = document.title.replace(/^freaknerd/, m.nombre);
  if (m.icono) { let ic = document.querySelector('link[rel=icon]'); if (ic) { ic.type = 'image/png'; ic.href = m.icono; } }
};

/* Nav superior (igual en todas las vistas) */
window.renderNav = (vista, extra = '', opts = {}) => {
  const nav = document.querySelector('nav[data-nav]'); if (!nav) return;
  nav.innerHTML = `
    <div class="fn-nav-marca flex items-center shrink-0"><span data-wordmark>${wordmark()}</span>${opts.app === false ? '' : `<span data-appname class="fn-mono text-[11px] uppercase tracking-[.14em] hidden sm:inline text-fn-piedra-osc">${esc(opts.nombre || FORO_CONFIG.APP_NAME || 'Foro de Ideación')}</span>`}</div>
    <div class="fn-nav-der text-sm flex items-center gap-2 min-w-0">
      ${DB.archivo ? `<span class="fn-pill" title="Ejercicio guardado, cargado solo en este navegador. No toca la nube.">archivo · ${esc(new Date(DB.archivo.exportado).toLocaleDateString('es-CO'))}</span>` : DB.MODE === 'local' ? '<span class="fn-pill" title="Datos solo en este navegador. Configura Supabase en js/config.js para producción.">demo local</span>' : ''}
      <span id="navEtapa" class="fn-nav-et truncate">${esc(vista)}</span>
      ${extra}
      <button onclick="window.location.reload()" class="fn-nav-btn shrink-0" title="Recargar" aria-label="Recargar"><i class="fas fa-sync"></i></button>
    </div>`;
};
window.setNavEtapa = (sesion) => { aplicarMarca(sesion); const e = $('navEtapa'); if (e && sesion) { const st = stageInfo(sesion.etapa); const corto = { ideacion: 'Ideación', consolidacion: 'Consolidación', matriz: 'Calificación', cierre: 'Matriz final', instrucciones: 'Instrucciones', bienvenida: 'Bienvenida', pausa: 'Pausa', resumen: 'Resumen', reporte: 'Reporte', votacion: 'Votación', resultados: 'Resultados' }[sesion.etapa]; e.textContent = st.n + ' · ' + (window.innerWidth < 640 && corto ? corto : st.label); } };

/* Temporizador de etapa */
window.timerText = (sesion) => {
  if (!sesion) return '';
  if (sesion.fin_etapa) { const d = Math.max(0, Math.floor((new Date(sesion.fin_etapa) - Date.now()) / 1000)); return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`; }
  const d = Math.max(0, Math.floor((Date.now() - new Date(sesion.etapa_ts)) / 1000)); return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`;
};
window.timerVencido = (sesion) => !!(sesion && sesion.fin_etapa && new Date(sesion.fin_etapa) <= Date.now());

/* Autoactualización: cada 60 s compara version.txt (sin caché) con la versión de esta página; si cambió, recarga.
   Así un arreglo publicado durante el foro llega a todos los celulares sin pedirles nada. */
window.VersionCheck = {
  mine: (document.querySelector('meta[name="app-version"]') || {}).content || '',
  start() { if (!this.mine || location.protocol === 'file:') return; const tick = async () => { try { const r = await fetch(baseUrl() + 'version.txt?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return; const v = (await r.text()).trim(); if (v && v !== this.mine) { console.log('Nueva versión', v, '→ recargando'); location.reload(); } } catch (e) {} }; setTimeout(tick, 15000); setInterval(tick, 60000); }
};
VersionCheck.start();

/* Duración legible */
window.fmtDur = (ms) => { if (!ms || ms < 0) return '–'; const m = Math.round(ms / 60000); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; };

/* Métricas de resumen del foro (muro al final y pestaña Resumen del admin) */
window.resumenForo = ({ sesion, pilares, ideas, participantes = [], evaluaciones = [] }) => {
  const orig = ideas.filter(i => i.tipo === 'idea'), cons = calificables(ideas), max = escalaMax(sesion);
  const reales = participantes.filter(p => !/^Demo · /.test(p.nombre || ''));
  const porPilar = pilares.map(p => ({ nombre: p.nombre, color: p.color, ideas: orig.filter(i => i.pilar_id === p.id).length, consolidadas: cons.filter(g => g.pilar_id === p.id).length }));
  const porPersona = {}; orig.forEach(i => { const k = i.participante_nombre || '¿?'; porPersona[k] = (porPersona[k] || 0) + 1; });
  const ranking = Object.entries(porPersona).sort((a, b) => b[1] - a[1]);
  const nPers = Math.max(participantes.length, ranking.length, 1);
  const ev = cons.filter(g => g.conteo_eval > 0), nmax = Math.max(...ev.map(g => g.conteo_eval), 1);
  const cuad = { quick: 0, proyecto: 0, relleno: 0, descartar: 0 }; ev.forEach(g => cuad[cuadrante(g.esfuerzo_prom, g.impacto_prom, max).key]++);
  const top = ev.slice().sort((a, b) => puntaje(b, nmax) - puntaje(a, nmax)).slice(0, 3);
  const calif = evaluaciones.length || ev.reduce((a, g) => a + g.conteo_eval, 0);
  const t = (x) => x ? new Date(x).getTime() : null;
  const inicio = Math.min(...[...participantes.map(p => t(p.created_at)), ...orig.map(i => t(i.created_at))].filter(Boolean));
  const fin = Math.max(...[...evaluaciones.map(e => t(e.updated_at || e.created_at)), ...orig.map(i => t(i.updated_at || i.created_at)), ...cons.map(g => t(g.updated_at))].filter(Boolean));
  return { participantes: participantes.length, reales: reales.length, ideas: orig.length, promIdeas: Math.round(10 * orig.length / nPers) / 10, maxIdeas: ranking[0] ? ranking[0][1] : 0, ranking, porPilar, consolidadas: cons.length, ratio: cons.length ? Math.round(10 * orig.length / cons.length) / 10 : 0, calificaciones: calif, promCalif: Math.round(10 * calif / nPers) / 10, conCuatro: ev.filter(g => g.conteo_eval >= 4).length, cuad, top, nmax, inicio: isFinite(inicio) ? inicio : null, fin: isFinite(fin) ? fin : null, duracion: (isFinite(inicio) && isFinite(fin)) ? fin - inicio : null };
};

/* Polling con manejo de errores */
window.Poll = {
  start(fn, ms) {
    let busy = false; const tick = async () => { if (busy) return; busy = true; try { await fn(); $('errBanner') && ($('errBanner').hidden = true); } catch (e) { console.error(e); const b = $('errBanner'); if (b) { b.hidden = false; b.textContent = 'Sin conexión: ' + errMsg(e); } } busy = false; };
    tick(); const h = setInterval(tick, ms || (FORO_CONFIG.POLL_MS || 3000)); document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); }); if (DB.onChange) DB.onChange(tick); return { tick, stop: () => clearInterval(h) };
  }
};

/* Participante local (identidad en este celular) */
window.Yo = {
  key: 'foro_yo_' + (window.DB ? DB.SES : 'x'),
  get() { try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; } },
  set(p) { localStorage.setItem(this.key, JSON.stringify(p)); },
  clear() { localStorage.removeItem(this.key); }
};

/* Cuadrante de la matriz esfuerzo-impacto */
window.umbralMedio = (max = 5) => max / 2 + 0.5; // 3 en escala 1-5, 5.5 en 1-10
/* Umbral inclusivo: «Hacer ya» = impacto ≥ medio y esfuerzo ≤ medio. Es la ÚNICA función que clasifica:
   muro, reporte, ranking y el dibujo de la matriz la usan, así que los conteos siempre coinciden. */
window.cuadrante = (esf, imp, max = 5) => {
  const mid = umbralMedio(max), altoImp = imp >= mid, bajoEsf = esf <= mid;
  if (altoImp && bajoEsf) return { key: 'quick', label: 'Hacer ya', color: 'blue' };
  if (altoImp) return { key: 'proyecto', label: 'Planear', color: 'blue' };
  if (bajoEsf) return { key: 'relleno', label: 'Tarea menor', color: 'blue' };
  return { key: 'descartar', label: 'Postergar', color: 'gray' };
};
/* Cifras con una decimal y coma (4,6 · 1,2 · 2,0) */
window.f1 = (v) => Number(v).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* Puntaje tridimensional para priorizar (impacto, esfuerzo y cuánta gente calificó).
   1) Promedios ponderados por participación: cada promedio se mezcla con el punto neutro (3) como si hubiera
      K = 3 calificaciones neutras extra. Con 1 calificación el promedio pesa poco; con 6 o más, casi todo.
      Así una sola persona con 5/1 no supera a seis personas de acuerdo.
   2) Bono de participación de hasta 2 puntos (la idea que más gente calificó recibe los 2).
   Puntaje = (impacto ponderado − esfuerzo ponderado) + 2 · n / nmax. Rango típico: −2 a +6. */
window.PUNTAJE_K = 3;
window.puntaje = (g, nmax, max) => {
  const n = Number(g.conteo_eval) || 0, K = window.PUNTAJE_K, mid = ((max || 5) + 1) / 2;
  const imp = (n * Number(g.impacto_prom) + K * mid) / (n + K), esf = (n * Number(g.esfuerzo_prom) + K * mid) / (n + K);
  return Math.round(((imp - esf) + 2 * (nmax ? n / nmax : 0)) * 10) / 10;
};


/* ============================================================
   MECE — consolidación de ideas con IA (Claude)
   Llamada directa desde el navegador del admin/líder con su API key
   (se guarda solo en sessionStorage de ese navegador). Alternativa:
   copiar el prompt, correrlo en claude.ai y pegar el JSON.
   ============================================================ */
window.MECE = {
  VERSION: 'v2',
  MODELOS: [['claude-sonnet-5-5', 'Sonnet 5.5 · recomendado (~US$0,3–0,6 por consolidación)'], ['claude-opus-5-5', 'Opus 5.5 · máxima calidad (más costoso)'], ['claude-haiku-5-5', 'Haiku 5.5 · no recomendado: no fusiona bien']],
  get MODEL() { const m = localStorage.getItem('foro_ia_model'); return (m && this.MODELOS.some(([id]) => id === m)) ? m : ((window.FORO_CONFIG && FORO_CONFIG.IA_MODEL) || 'claude-sonnet-5-5'); },  /* un modelo guardado que ya no está en la lista (p. ej. haiku-4-5) se ignora */
  setModel(m) { localStorage.setItem('foro_ia_model', m); },
  keyName: 'foro_anthropic_key',
  getKey() { return localStorage.getItem(this.keyName) || sessionStorage.getItem(this.keyName) || ''; },
  setKey(k) { localStorage.setItem(this.keyName, k.trim()); },
  clearKey() { localStorage.removeItem(this.keyName); sessionStorage.removeItem(this.keyName); localStorage.removeItem('foro_anthropic_ws'); },
  getWs() { return localStorage.getItem('foro_anthropic_ws') || ''; },
  setWs(w) { localStorage.setItem('foro_anthropic_ws', w.trim()); },
  /* Esquema de la respuesta (salida estructurada de la API: el JSON siempre llega válido).
     El orden de los campos guía el orden en que el modelo escribe: primero qué ideas y qué dice cada una,
     después el título. Así el título sale de los aportes y no al revés. */
  SCHEMA: {
    type: 'object', additionalProperties: false, required: ['grupos', 'duplicados_entre_pilares'],
    properties: {
      grupos: { type: 'array', items: { type: 'object', additionalProperties: false,
        required: ['pilar_id', 'ideas', 'aportes', 'palabras_clave', 'titulo', 'descripcion_corta', 'diferencia'],
        properties: {
          pilar_id: { type: 'integer' },
          ideas: { type: 'array', items: { type: 'integer' } },
          aportes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'aporte'], properties: { id: { type: 'integer' }, aporte: { type: 'string' } } } },
          palabras_clave: { type: 'array', items: { type: 'string' } },
          titulo: { type: 'string' },
          descripcion_corta: { type: 'string' },
          diferencia: { type: 'string' }
        } } },
      duplicados_entre_pilares: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ideas', 'motivo'], properties: { ideas: { type: 'array', items: { type: 'integer' } }, motivo: { type: 'string' } } } }
    }
  },
  buildPrompt({ sesion, pilares, ideas, otras }) {
    const cfg = (sesion && sesion.config) || {};
    const L = [];
    L.push(`Eres un consultor que facilita una sesión de ideación de ${sesion.empresa || sesion.nombre}. Tu trabajo es consolidar lo que escribieron los participantes, sin agregar nada propio: la sesión le pertenece a ellos y cada idea consolidada debe poder rastrearse hasta sus autores.`);
    L.push('');
    L.push('CONTEXTO (solo para entender de qué hablan; nunca es fuente de propuestas ni de datos)');
    if (cfg.caso) L.push(`Caso: ${cfg.caso}`);
    if (cfg.restricciones && cfg.restricciones.length) L.push(`Restricciones: ${cfg.restricciones.join(' | ')}`);
    if (cfg.instruccion_ia) L.push(`Instrucción de esta sesión: ${cfg.instruccion_ia}`);
    L.push('');
    L.push('TAREA: consolidar las ideas de cada pilar con criterio MECE. Mutuamente excluyente: dos grupos del mismo pilar nunca hablan de lo mismo. Colectivamente exhaustivo: entre todos los grupos cubren todas las ideas.');
    L.push('');
    L.push('CÓMO TRABAJAR, EN ESTE ORDEN');
    L.push('1. Núcleo. Para cada idea identifica su núcleo: qué acción o tarea, sobre qué información u objeto. Ignora la redacción, el tono, el nivel de detalle, los ejemplos y quién la escribió.');
    L.push('2. Agrupa por núcleo dentro de cada pilar:');
    L.push('   - Mismo núcleo dicho con otras palabras, con más o menos detalle o con otros ejemplos: MISMO grupo. Una paráfrasis o una repetición nunca queda en un grupo aparte.');
    L.push('   - Una idea que es un caso particular, una parte o la consecuencia directa de otra del mismo pilar: MISMO grupo.');
    L.push('   - Mismo tema, pero otra acción u otro objeto, que exigiría una solución distinta: grupos distintos.');
    L.push('3. Prueba de exclusión. Compara cada par de grupos del mismo pilar. Si un directivo, leyendo los dos títulos, diría que es lo mismo, fusiónalos. En "diferencia" escribe en una frase qué distingue a ese grupo del grupo más parecido de su pilar; si no hay ninguno parecido, escribe: Único en su tema.');
    L.push('4. Repetidos entre pilares. Si una idea tiene el mismo núcleo que una idea de OTRO pilar, no la muevas: queda en su pilar. Reporta el par (o el conjunto) en "duplicados_entre_pilares" con el motivo en una frase. El facilitador decide.');
    L.push('5. Cobertura. Cada id aparece EXACTAMENTE UNA VEZ en "ideas", en un grupo de SU pilar ("pilar_id" = el número del pilar donde aparece la idea). Ninguna se pierde ni se repite. El número de grupos lo define el contenido: un grupo de una sola idea solo existe si ninguna otra idea de su pilar comparte el núcleo.');
    L.push('');
    L.push('FIDELIDAD: NO INVENTAR');
    L.push('- Todo lo que escribas en un grupo sale de las ideas de ESE grupo. El contexto, las restricciones y los enunciados de los pilares no son fuente.');
    L.push('- No agregues cifras, frecuencias, tiempos, herramientas, sistemas, nombres, áreas, beneficios ni soluciones que no estén escritos en las ideas del grupo. Si una idea es vaga, resúmela vaga: no la completes.');
    L.push('- No le pongas destinatario, afectado, lugar ni causa tomados del enunciado del pilar o del caso. Si la idea dice solo «Errores en facturación», el título no puede decir «errores en la facturación a residentes»; dice «Errores en facturación».');
    L.push('- "aportes": una entrada por cada idea del grupo, en el mismo orden de "ideas", con su id y una frase de máximo 25 palabras que diga lo que esa idea dice, conservando su matiz o ejemplo concreto. Paráfrasis fiel, no interpretación.');
    L.push('- "palabras_clave": de 2 a 5 palabras o expresiones copiadas literalmente de las ideas del grupo.');
    L.push('- "titulo": máximo 60 caracteres. La acción o tarea concreta, con las palabras de los participantes. Nada genérico como Mejorar procesos o Estrategia comercial.');
    L.push('- "descripcion_corta": máximo 160 caracteres, para proyectar en el muro. Solo afirma lo que dicen los aportes.');
    L.push('- Español de Colombia, directo, sin adjetivos de relleno. Dentro de los textos no uses comillas dobles ni saltos de línea (si citas algo, usa comillas simples).');
    L.push('');
    L.push('EJEMPLOS DE CRITERIO (de otra empresa, solo para ilustrar)');
    L.push('- «Conciliar a mano el extracto del banco cada mes» y «cruzar los pagos con el extracto nos toma dos días»: mismo grupo (misma tarea, misma información; el segundo agrega el tiempo, que va en su aporte).');
    L.push('- «Los clientes llaman a preguntar el saldo» y «responder uno por uno cuánto debe cada cliente»: mismo grupo (la misma consulta vista desde los dos lados).');
    L.push('- «Mandar los recordatorios de pago uno por uno» y «los acuerdos de pago se llevan en Excel y se olvidan las cuotas»: grupos distintos (mismo tema, cobranza, pero otra tarea y otra solución).');
    L.push('');
    L.push('FORMATO: responde SOLO con JSON con esta forma:');
    L.push('{"grupos":[{"pilar_id":1,"ideas":[12,15],"aportes":[{"id":12,"aporte":"..."},{"id":15,"aporte":"..."}],"palabras_clave":["...","..."],"titulo":"...","descripcion_corta":"...","diferencia":"..."}],"duplicados_entre_pilares":[{"ideas":[12,40],"motivo":"..."}]}');
    L.push('');
    L.push('IDEAS DE LOS PARTICIPANTES (estas son las que agrupas)');
    pilares.forEach(p => {
      const mias = ideas.filter(i => i.pilar_id === p.id);
      if (!mias.length) return;
      L.push(`## PILAR ${p.id}: ${p.nombre}`);
      if (p.enunciado) L.push(`Enunciado (contexto, no fuente): ${p.enunciado}`);
      mias.forEach(i => L.push(`- [id ${i.id}]${i.subfrente ? ' (' + i.subfrente + ')' : ''} ${String(i.texto).replace(/\s+/g, ' ').trim()}`));
      L.push('');
    });
    if (otras && otras.length) {
      L.push('IDEAS DE OTROS PILARES (solo para detectar repetidos entre pilares: NO las agrupes ni las pongas en "ideas"; úsalas únicamente en "duplicados_entre_pilares", y solo si se repiten con una idea de arriba)');
      otras.forEach(i => L.push(`- [id ${i.id}] (pilar ${i.pilar_nombre || i.pilar_id}) ${String(i.texto).replace(/\s+/g, ' ').trim()}`));
      L.push('');
    }
    return L.join('\n');
  },
  /* Una llamada por pilar, en paralelo: cada respuesta es corta (no se agota el límite de salida con 60-80 ideas)
     y la espera total es la del pilar más lento. Cada llamada ve las ideas de los otros pilares solo para
     reportar repetidos entre pilares. Devuelve el objeto combinado, como si fuera una sola respuesta. */
  async consolidar(d, apiKey, onProgreso = () => {}) {
    const conIdeas = d.pilares.filter(p => d.ideas.some(i => i.pilar_id === p.id));
    if (conIdeas.length <= 1) { const txt = await this.call(this.buildPrompt(d), apiKey); return { obj: this.parse(txt), txt, uso: this.ultimoUso }; }
    let listos = 0; const uso = { input_tokens: 0, output_tokens: 0 }; this._acum = uso;
    const enCola = conIdeas.slice(); const res = new Array(conIdeas.length);
    const uno = async p => {
      const sub = { sesion: d.sesion, pilares: [p], ideas: d.ideas.filter(i => i.pilar_id === p.id),
        otras: d.ideas.filter(i => i.pilar_id !== p.id).map(i => Object.assign({}, i, { pilar_nombre: (d.pilares.find(x => x.id === i.pilar_id) || {}).nombre })) };
      const txt = await this.call(this.buildPrompt(sub), apiKey);
      onProgreso(++listos, conIdeas.length, p.nombre);
      res[conIdeas.indexOf(p)] = { txt, obj: this.parse(txt) };
    };
    const trabajador = async () => { while (enCola.length) await uno(enCola.shift()); };
    await Promise.all([trabajador(), trabajador(), trabajador()]).finally(() => { this._acum = null; });  /* máximo 3 llamadas simultáneas */
    const obj = { grupos: res.flatMap(r => r.obj.grupos || []), duplicados_entre_pilares: res.flatMap(r => r.obj.duplicados_entre_pilares || []), rescatado: res.some(r => r.obj.rescatado) };
    this.ultimoUso = uso;
    return { obj, txt: JSON.stringify(obj), uso };
  },
  async call(prompt, apiKey) {
    /* Reintenta lo transitorio: 429 (límite de frecuencia o de solicitudes simultáneas), 5xx/529 (API ocupada),
       errores de red y respuestas que no son JSON (página de error de un intermediario). Los 4xx restantes no. */
    const body = JSON.stringify({ model: this.MODEL, max_tokens: 32000, output_config: { effort: 'high', format: { type: 'json_schema', schema: this.SCHEMA } }, messages: [{ role: 'user', content: prompt }] });
    const headers = Object.assign({ 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, this.getWs() ? { 'anthropic-workspace-id': this.getWs() } : {});
    let data, ultimo;
    for (let intento = 1; intento <= 4; intento++) {
      let res = null;
      try { res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body }); data = await res.json(); }
      catch (e) { ultimo = new Error(res ? 'Respuesta inválida de la API (HTTP ' + res.status + ')' : 'Sin conexión con la API: ' + e.message); data = null; }
      if (res && res.ok && data) break;
      const transitorio = !res || !data || res.status === 429 || res.status >= 500;
      if (res && data && !res.ok) ultimo = new Error((data.error && data.error.message) || ('HTTP ' + res.status));
      if (!transitorio || intento === 4) throw ultimo;
      const espera = Number(res && res.headers.get('retry-after')) * 1000 || 4000 * intento;
      console.warn('MECE: reintento ' + intento + ' en ' + Math.round(espera / 1000) + ' s · ' + ultimo.message);
      await new Promise(r => setTimeout(r, espera));
    }
    if (data.stop_reason === 'refusal') throw new Error('El modelo rechazó la solicitud.');
    const txt = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    if (data.stop_reason === 'max_tokens') console.warn('MECE: respuesta cortada por límite de salida; se intentará rescatar los grupos completos');
    this.ultimoUso = data.usage || null;
    if (this._acum && data.usage) { this._acum.input_tokens += data.usage.input_tokens || 0; this._acum.output_tokens += data.usage.output_tokens || 0; }
    return txt;
  },
  parse(text) {
    let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) t = t.slice(a, b + 1);
    try { const obj = JSON.parse(t); if (!obj || !Array.isArray(obj.grupos)) throw new Error('El JSON no trae "grupos".'); return obj; }
    catch (e) {
      /* Respuesta cortada o con un error puntual: rescatar los objetos de grupo que estén completos */
      const grupos = this.rescatar(t); if (!grupos.length) throw e;
      console.warn('MECE: JSON incompleto; rescatados ' + grupos.length + ' grupos'); return { grupos, rescatado: true };
    }
  },
  /* Recorre el texto y extrae cada objeto {...} balanceado que tenga "ideas" y "titulo" (tolera comillas y llaves dentro de cadenas) */
  rescatar(t) {
    const out = []; let i = t.indexOf('['); if (i < 0) return out;
    while (i < t.length) {
      const s = t.indexOf('{', i); if (s < 0) break;
      let depth = 0, inStr = false, esc = false, e = -1;
      for (let k = s; k < t.length; k++) { const ch = t[k]; if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; } if (ch === '"') inStr = true; else if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { e = k; break; } } }
      if (e < 0) break;
      try { const g = JSON.parse(t.slice(s, e + 1)); if (g && Array.isArray(g.ideas) && 'titulo' in g) out.push(g); } catch (x) {}
      i = e + 1;
    }
    return out;
  },
  /* ---- Auditoría de fidelidad (determinista, sin IA): marca lo que el grupo dice y sus ideas no ----
     Fuerte: cifras que no aparecen en las ideas originales del grupo, y nombres propios (palabras con
     mayúscula que no están al inicio de una frase) que tampoco aparecen.
     Suave: palabras de contenido del título o de la descripción que no comparten raíz con ninguna idea. */
  _norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); },
  _raiz(w) { return w.slice(0, 5); },
  _vacias: new Set('para por con sin una uno unos unas los las del que como cada sobre entre desde hasta donde cuando cual cuales este esta estos estas ese esa esos esas todo toda todos todas otro otra otros otras mismo misma mas menos muy tambien solo sola porque pero hacer hace hacen tener tiene tienen poder puede pueden dejar deja sale salir manera forma tarea tareas idea ideas grupo integra hoy siempre nunca'.split(' ')),
  _marco: new Set('autom conso centr unifi digit plant table repor infor segui regis gesti proce manua herra siste flujo asist gener alert'.split(' ')),
  auditar(g, ideas) {
    const orig = g.ideas.map(id => (ideas.find(x => x.id === id) || {}).texto || '').join(' \n ');
    const on = this._norm(orig);
    const raices = new Set((on.match(/[a-zñ]{4,}/g) || []).map(w => this._raiz(w)));
    const nums = new Set(on.match(/\d+(?:[.,]\d+)?/g) || []);
    const alertas = [];
    const txtGen = [g.titulo, g.descripcion_corta, (g.aportes || []).map(a => a.aporte).join(' ')].join(' \n ');
    const cifras = [...new Set((this._norm(txtGen).match(/\d+(?:[.,]\d+)?/g) || []))].filter(n => !nums.has(n));
    if (cifras.length) alertas.push({ nivel: 'fuerte', texto: 'Cifras que no están en las ideas: ' + cifras.join(', ') });
    const propios = [...new Set(txtGen.split(/[.:;!?¿¡\n]+/).flatMap(fr => fr.trim().split(/\s+/).slice(1)).map(w => w.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñü]/g, '')).filter(w => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]{2,}$/.test(w)))].filter(w => !on.includes(this._norm(w)));
    if (propios.length) alertas.push({ nivel: 'fuerte', texto: 'Nombres que no están en las ideas: ' + propios.join(', ') });
    const palabras = (this._norm([g.titulo, g.descripcion_corta].join(' ')).match(/[a-zñ]{5,}/g) || []).filter(w => !this._vacias.has(w));
    const nuevas = [...new Set(palabras.filter(w => !raices.has(this._raiz(w)) && !this._marco.has(this._raiz(w))))];
    if (nuevas.length) alertas.push({ nivel: 'suave', texto: 'Palabras del título o la descripción que no usaron los participantes: ' + nuevas.join(', ') });
    return alertas;
  },
  /* Garantiza MECE en los ids: cada idea en un solo grupo de su pilar; las que falten van a "Otras ideas".
     Arma el "detalle" (lo que se guarda) desde los aportes, y adjunta alertas y repetidos entre pilares. */
  validate(obj, { pilares, ideas }) {
    const usados = new Set(); const grupos = [];
    obj.grupos.forEach(g => {
      const ids = [...new Set((g.ideas || []).map(Number))].filter(id => { const i = ideas.find(x => x.id === id); if (!i || usados.has(id)) return false; usados.add(id); return true; });
      if (!ids.length) return;
      /* el pilar lo manda la primera idea; las de otro pilar se sacan y quedan para "Otras ideas" de su pilar */
      const pilar_id = (ideas.find(x => x.id === ids[0]) || {}).pilar_id;
      const propias = ids.filter(id => { const ok = (ideas.find(x => x.id === id) || {}).pilar_id === pilar_id; if (!ok) usados.delete(id); return ok; });
      const ap = Array.isArray(g.aportes) ? g.aportes : [];
      const aportes = propias.map(id => { const a = ap.find(x => Number(x.id) === id); return { id, aporte: String((a && a.aporte) || '').trim() }; });
      const detalle = ap.length ? `Integra ${propias.length} idea${propias.length === 1 ? '' : 's'}: ` + aportes.map(a => a.aporte.replace(/\.?$/, '.')).filter(x => x !== '.').join(' ') : String(g.detalle || '');
      const out = { pilar_id, titulo: String(g.titulo || '').slice(0, 80), descripcion_corta: String(g.descripcion_corta || '').slice(0, 160), detalle, ideas: propias, origen: 'ia',
        aportes, palabras_clave: (g.palabras_clave || []).map(String), diferencia: String(g.diferencia || '') };
      if (ap.length && aportes.some(a => !a.aporte)) out.sin_aporte = aportes.filter(a => !a.aporte).map(a => a.id);
      out.alertas = this.auditar(out, ideas);
      if (out.sin_aporte) out.alertas.unshift({ nivel: 'fuerte', texto: 'Ideas sin aporte propio en el detalle: #' + out.sin_aporte.join(', #') });
      grupos.push(out);
    });
    pilares.forEach(p => {
      const faltan = ideas.filter(i => i.pilar_id === p.id && !usados.has(i.id)).map(i => i.id);
      if (faltan.length) grupos.push({ pilar_id: p.id, titulo: 'Otras ideas · ' + p.nombre, descripcion_corta: 'Ideas que la IA no agrupó; revisar y reubicar.', detalle: '', ideas: faltan, origen: 'ia', alertas: [{ nivel: 'fuerte', texto: 'La IA dejó estas ideas por fuera: reubicarlas a mano.' }] });
    });
    const duplicados = (obj.duplicados_entre_pilares || []).map(d => ({ ideas: [...new Set((d.ideas || []).map(Number))].filter(id => ideas.some(x => x.id === id)), motivo: String(d.motivo || '') }))
      .filter(d => d.ideas.length > 1 && new Set(d.ideas.map(id => ideas.find(x => x.id === id).pilar_id)).size > 1)
;
    /* El mismo repetido llega reportado desde cada pilar con combinaciones distintas: se unen los conjuntos que comparten ideas */
    const unidos = [];
    duplicados.forEach(d => {
      const tocan = unidos.filter(u => u.ideas.some(id => d.ideas.includes(id)));
      const nuevo = { ideas: [...new Set(tocan.flatMap(u => u.ideas).concat(d.ideas))], motivo: (tocan[0] && tocan[0].motivo) || d.motivo };
      tocan.forEach(u => unidos.splice(unidos.indexOf(u), 1)); unidos.push(nuevo);
    });
    return { grupos, duplicados: unidos };
  }
};

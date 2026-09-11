/* ============================================================
   COMMON — etapas, helpers de UI, temporizador, módulo MECE (IA)
   ============================================================ */
window.STAGES = [
  { key: 'bienvenida',                 n: '0',   label: 'Bienvenida',                    grupo: 'Apertura' },
  { key: 'instrucciones',              n: '0.5', label: 'Instrucciones / QR',            grupo: 'Apertura' },
  { key: 'ideacion',                   n: '1',   label: 'Ideación por pilares',          grupo: 'Ideación',  timer: 'minutos_ideacion' },
  { key: 'instrucciones_consolidacion',n: '1.5', label: 'Instr. Consolidación',          grupo: 'Consolidación', opcional: true },
  { key: 'consolidacion',              n: '2',   label: 'Consolidación MECE (IA)',       grupo: 'Consolidación' },
  { key: 'pausa',                      n: '3',   label: 'Pausa · cafecito',              grupo: 'Consolidación' },
  { key: 'instrucciones_votacion',     n: '3.5', label: 'Instr. Votación',               grupo: 'Votación (opcional)', opcional: true },
  { key: 'votacion',                   n: '4',   label: 'Votación por votos',            grupo: 'Votación (opcional)', opcional: true },
  { key: 'resultados',                 n: '5',   label: 'Resultados de votación',        grupo: 'Votación (opcional)', opcional: true },
  { key: 'instrucciones_matriz',       n: '5.5', label: 'Instr. Matriz',                 grupo: 'Priorización' },
  { key: 'matriz',                     n: '6',   label: 'Calificación Esfuerzo · Impacto', grupo: 'Priorización', timer: 'minutos_matriz' },
  { key: 'cierre',                     n: '7',   label: 'Matriz final · Quick wins',     grupo: 'Priorización' },
  { key: 'reporte',                    n: '8',   label: 'Reporte final',                 grupo: 'Cierre' }
];
window.stageInfo = (k) => STAGES.find(s => s.key === k) || { key: k, n: '?', label: k };

/* Colores por pilar (Tailwind) */
window.COLORS = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-400',   solid: 'bg-blue-600',   hex: '#2563eb', postit: 'bg-blue-50' },
  green:  { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-400',  solid: 'bg-green-600',  hex: '#16a34a', postit: 'bg-green-50' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400', solid: 'bg-purple-600', hex: '#9333ea', postit: 'bg-purple-50' },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-400',  solid: 'bg-amber-500',  hex: '#f59e0b', postit: 'bg-amber-50' },
  rose:   { bg: 'bg-rose-100',   text: 'text-rose-800',   border: 'border-rose-400',   solid: 'bg-rose-600',   hex: '#e11d48', postit: 'bg-rose-50' },
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-400',   solid: 'bg-teal-600',   hex: '#0d9488', postit: 'bg-teal-50' },
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-800',   border: 'border-gray-400',   solid: 'bg-gray-600',   hex: '#4b5563', postit: 'bg-gray-50' }
};
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
  let t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg text-base font-bold text-white transition-opacity opacity-0 pointer-events-none whitespace-nowrap'; document.body.appendChild(t); }
  t.textContent = msg; t.className = t.className.replace(/bg-\S+/g, '') + (tipo === 'err' ? ' bg-red-600' : tipo === 'warn' ? ' bg-amber-500' : ' bg-emerald-600');
  t.classList.remove('opacity-0'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('opacity-0'), 2600);
};
window.errMsg = (e) => { const m = String(e && e.message || e); if (/row-level security|violates/i.test(m)) return 'Esta etapa ya se cerró: el moderador pasó a la siguiente.'; if (/Failed to fetch|NetworkError|Load failed|network|timeout/i.test(m)) return 'Sin conexión. Revisa el Wi‑Fi o los datos y reintenta.'; if (/LIMITE_VOTOS/.test(m)) return 'Ya usaste tus votos en este pilar.'; if (/LIMITE_CALIFICACIONES/.test(m)) return 'Ya usaste todas tus calificaciones: quita una para calificar otra idea.'; if (/ETAPA_CERRADA/.test(m)) return 'Esta etapa ya se cerró.'; if (/CLAVE_INVALIDA/.test(m)) return 'Clave incorrecta.'; if (/SOLO_ADMIN/.test(m)) return 'Solo el administrador puede hacer esto.'; if (/duplicate|unique/i.test(m)) return 'Ya lo habías hecho.'; return m; };
window.vibrar = (ms = 120) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
window.baseUrl = () => location.origin + location.pathname.replace(/[^/]*$/, '');
window.urlVista = (archivo) => baseUrl() + archivo + (DB.SES !== (FORO_CONFIG.SESION || 'impercap') ? '?s=' + encodeURIComponent(DB.SES) : '');

/* Nav superior (igual en todas las vistas) */
window.renderNav = (vista, extra = '', opts = {}) => {
  const nav = document.querySelector('nav[data-nav]'); if (!nav) return;
  nav.innerHTML = `
    <div class="flex items-center gap-3 shrink-0"><span class="fn-mono font-bold text-base tracking-tight">freaknerd<span class="fn-green">_</span></span>${opts.app === false ? '' : `<span class="text-gray-600 hidden sm:inline">|</span><span class="font-bold text-sm hidden sm:inline text-gray-200">${esc(FORO_CONFIG.APP_NAME || 'Foro de Ideación')}</span>`}</div>
    <div class="text-sm flex items-center gap-2 min-w-0">
      ${DB.MODE === 'local' ? '<span class="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap" title="Datos solo en este navegador. Configura Supabase en js/config.js para producción.">demo local</span>' : ''}
      <span id="navEtapa" class="fn-mono bg-emerald-400 text-black px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider truncate max-w-[58vw] sm:max-w-none">${esc(vista)}</span>
      ${extra}
      <button onclick="window.location.reload()" class="bg-gray-700 hover:bg-gray-600 px-2.5 py-1 rounded text-xs shrink-0" title="Recargar"><i class="fas fa-sync"></i></button>
    </div>`;
};
window.setNavEtapa = (sesion) => { const e = $('navEtapa'); if (e && sesion) { const st = stageInfo(sesion.etapa); const corto = { ideacion: 'Ideación', consolidacion: 'Consolidación', matriz: 'Calificación', cierre: 'Matriz final', instrucciones: 'Instrucciones', bienvenida: 'Bienvenida', pausa: 'Pausa', reporte: 'Reporte', votacion: 'Votación', resultados: 'Resultados' }[sesion.etapa]; e.textContent = st.n + ' · ' + (window.innerWidth < 640 && corto ? corto : st.label); } };

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
window.cuadrante = (esf, imp, max = 5) => {
  const mid = max / 2 + 0.5; // 3 en escala 1-5, 5.5 en 1-10
  if (imp >= mid && esf < mid) return { key: 'quick', label: 'QUICK WIN · Hacer ya', color: 'emerald' };
  if (imp >= mid && esf >= mid) return { key: 'proyecto', label: 'PROYECTO · Planificar', color: 'blue' };
  if (imp < mid && esf < mid) return { key: 'relleno', label: 'TAREA MENOR · Si sobra tiempo', color: 'amber' };
  return { key: 'descartar', label: 'POSTERGAR', color: 'gray' };
};

/* Puntaje tridimensional para priorizar: impacto menos esfuerzo, más un bono de participación de hasta 2 puntos
   (la idea que más gente calificó recibe los 2). Mide qué tan buena es la idea y cuánta atención atrajo. */
window.puntaje = (g, nmax) => Math.round(((Number(g.impacto_prom) - Number(g.esfuerzo_prom)) + 2 * (nmax ? g.conteo_eval / nmax : 0)) * 10) / 10;


/* ============================================================
   MECE — consolidación de ideas con IA (Claude)
   Llamada directa desde el navegador del admin/líder con su API key
   (se guarda solo en sessionStorage de ese navegador). Alternativa:
   copiar el prompt, correrlo en claude.ai y pegar el JSON.
   ============================================================ */
window.MECE = {
  MODELOS: [['claude-opus-5', 'Opus 5 · máxima calidad (~$0,05 por consolidación)'], ['claude-sonnet-5', 'Sonnet 5 · equilibrio (~$0,02)'], ['claude-haiku-4-5', 'Haiku 4.5 · mínimo costo (~$0,01)']],
  get MODEL() { return localStorage.getItem('foro_ia_model') || (window.FORO_CONFIG && FORO_CONFIG.IA_MODEL) || 'claude-sonnet-5'; },
  setModel(m) { localStorage.setItem('foro_ia_model', m); },
  keyName: 'foro_anthropic_key',
  getKey() { return localStorage.getItem(this.keyName) || sessionStorage.getItem(this.keyName) || ''; },
  setKey(k) { localStorage.setItem(this.keyName, k.trim()); },
  clearKey() { localStorage.removeItem(this.keyName); sessionStorage.removeItem(this.keyName); localStorage.removeItem('foro_anthropic_ws'); },
  getWs() { return localStorage.getItem('foro_anthropic_ws') || ''; },
  setWs(w) { localStorage.setItem('foro_anthropic_ws', w.trim()); },
  buildPrompt({ sesion, pilares, ideas }) {
    const cfg = (sesion && sesion.config) || {};
    const lineas = [];
    lineas.push(`Eres un consultor de estrategia facilitando un foro de ideación para la empresa ${sesion.empresa || sesion.nombre}.`);
    if (cfg.caso) lineas.push(`Contexto del caso: ${cfg.caso}`);
    if (cfg.restricciones && cfg.restricciones.length) lineas.push(`Restricciones conocidas: ${cfg.restricciones.join(' | ')}`);
    lineas.push('');
    lineas.push('TAREA: consolidar las ideas de cada pilar con criterio MECE (mutuamente excluyentes, colectivamente exhaustivas).');
    lineas.push('');
    lineas.push('REGLAS DE AGRUPACIÓN');
    lineas.push('1. Agrupa SOLO ideas que proponen la misma acción o el mismo mecanismo. Si dos ideas se parecen en tema pero difieren en la acción concreta, van en grupos distintos. Una idea única puede ser un grupo sola.');
    lineas.push('2. Cada idea original aparece EXACTAMENTE UNA VEZ en el campo "ideas" de un grupo de SU MISMO pilar. Ninguna se pierde, ninguna se repite.');
    lineas.push('3. No inventes propuestas: todo lo que digas en un grupo debe salir de las ideas listadas. No agregues acciones, cifras ni supuestos que ningún participante escribió.');
    lineas.push('4. Entre 3 y 7 grupos por pilar como orientación; con pocas ideas, menos. Prefiere más grupos antes que mezclar ideas distintas.');
    lineas.push('');
    lineas.push('REGLAS DE REDACCIÓN (para no perder la esencia)');
    lineas.push('- "titulo": la acción concreta que proponen las ideas, en máximo 60 caracteres, con las palabras clave que usaron los participantes (lugares, clientes, productos, canales). Evita títulos genéricos como "Estrategia comercial".');
    lineas.push('- "descripcion_corta": una frase de máximo 160 caracteres que resuma QUÉ haría la empresa, para proyectar en el muro.');
    lineas.push('- "detalle": empieza con "Integra N ideas:" y luego UNA frase por cada idea original, en el mismo orden de la lista, conservando su mecanismo, matiz o ejemplo específico (por ejemplo: "vender en sitios turísticos como el Salto del Buey"). Si una idea añade un matiz distinto a las demás del grupo, dilo explícitamente.');
    lineas.push('- Escribe en español de Colombia, directo, sin adjetivos de relleno.');
    lineas.push('');
    lineas.push('FORMATO: responde SOLO con JSON válido, sin texto adicional ni bloques de código, con esta forma exacta:');
    lineas.push('{"grupos":[{"pilar_id":1,"titulo":"...","descripcion_corta":"...","detalle":"Integra 2 ideas: ...","ideas":[12,15]}]}');
    lineas.push('');
    pilares.forEach(p => {
      const mias = ideas.filter(i => i.pilar_id === p.id);
      if (!mias.length) return;
      lineas.push(`## PILAR ${p.id}: ${p.nombre}`);
      if (p.enunciado) lineas.push(`Enunciado: ${p.enunciado}`);
      mias.forEach(i => lineas.push(`- [id ${i.id}]${i.subfrente ? ' (' + i.subfrente + ')' : ''} ${String(i.texto).replace(/\s+/g, ' ').trim()}`));
      lineas.push('');
    });
    return lineas.join('\n');
  },
  async call(prompt, apiKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, this.getWs() ? { 'anthropic-workspace-id': this.getWs() } : {}),
      body: JSON.stringify({ model: this.MODEL, max_tokens: 16000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data.error && data.error.message) || ('HTTP ' + res.status));
    if (data.stop_reason === 'refusal') throw new Error('El modelo rechazó la solicitud.');
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  },
  parse(text) {
    let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) t = t.slice(a, b + 1);
    const obj = JSON.parse(t); if (!obj || !Array.isArray(obj.grupos)) throw new Error('El JSON no trae "grupos".');
    return obj;
  },
  /* Garantiza MECE: cada idea en un solo grupo; las que falten van a un grupo "Otras ideas" del pilar */
  validate(obj, { pilares, ideas }) {
    const usados = new Set(); const grupos = [];
    obj.grupos.forEach(g => {
      const ids = [...new Set((g.ideas || []).map(Number))].filter(id => { const i = ideas.find(x => x.id === id); if (!i || usados.has(id)) return false; usados.add(id); return true; });
      const pilar_id = (ids.length ? (ideas.find(x => x.id === ids[0]) || {}).pilar_id : null) || (pilares.some(p => p.id === Number(g.pilar_id)) ? Number(g.pilar_id) : null);
      grupos.push({ pilar_id, titulo: String(g.titulo || '').slice(0, 80), descripcion_corta: String(g.descripcion_corta || '').slice(0, 160), detalle: String(g.detalle || ''), ideas: ids, origen: 'ia' });
    });
    pilares.forEach(p => {
      const faltan = ideas.filter(i => i.pilar_id === p.id && !usados.has(i.id)).map(i => i.id);
      if (faltan.length) grupos.push({ pilar_id: p.id, titulo: 'Otras ideas · ' + p.nombre, descripcion_corta: 'Ideas que la IA no agrupó; revisar y reubicar.', detalle: '', ideas: faltan, origen: 'ia' });
    });
    return { grupos };
  }
};

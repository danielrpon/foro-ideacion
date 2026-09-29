/* ============================================================
   JUNTA ASESORA — mesas de trabajo y tablero de acciones
   Vive aparte de la ideación: una sesión con config.tipo = 'junta'
   (p. ej. ?s=impercap-junta-1). La configuración (mesas y campos)
   se guarda en sesiones.config.junta; las acciones, en la tabla
   `acciones`. Dos backends con la misma interfaz (supabase | local).
   ============================================================ */
(function () {
  const CFG = window.FORO_CONFIG || {};
  const SES = DB.SES;

  /* ---------- catálogo de campos de una acción ----------
     base: columna propia en la tabla; los demás van en acciones.extra (jsonb).
     La junta decide cuáles se activan y cuáles son obligatorios (junta.html › Campos). */
  window.CAMPOS_JUNTA = [
    { k: 'titulo',      etiqueta: 'Acción',           ph: 'La acción, en una frase',              tipo: 'textarea', base: true, fijo: true },
    { k: 'responsable', etiqueta: 'Responsable',      ph: 'Quién la ejecuta en la empresa',       base: true, icono: 'fa-user' },
    { k: 'acompana',    etiqueta: 'Acompaña',         ph: 'Miembro de la junta que acompaña',     base: true, icono: 'fa-handshake-angle' },
    { k: 'fecha',       etiqueta: 'Fecha',            ph: '10/10, semana del 6…',                 base: true, icono: 'fa-calendar' },
    { k: 'senal',       etiqueta: 'Señal de avance',  ph: 'Cómo sabemos que avanzó',              base: true, icono: 'fa-flag-checkered' },
    { k: 'prioridad',   etiqueta: 'Prioridad',        tipo: 'select', opciones: ['Alta', 'Media', 'Baja'], icono: 'fa-signal' },
    { k: 'recursos',    etiqueta: 'Qué se necesita',  ph: 'Plata, personas, contactos…',          icono: 'fa-toolbox' },
    { k: 'notas',       etiqueta: 'Notas',            ph: 'Contexto o acuerdos de la mesa',       tipo: 'textarea', icono: 'fa-note-sticky' }
  ];
  const CAMPOS_DEF = {
    responsable: { activo: true,  obligatorio: true },
    acompana:    { activo: true,  obligatorio: false },
    fecha:       { activo: true,  obligatorio: true },
    senal:       { activo: true,  obligatorio: false },
    prioridad:   { activo: false, obligatorio: false },
    recursos:    { activo: false, obligatorio: false },
    notas:       { activo: false, obligatorio: false }
  };
  const MESAS_DEF = [
    { slug: 'mercadeo',   nombre: 'Mercadeo y ventas',      color: 'blue', icono: 'fa-bullhorn',  pregunta: '', modera: '', relata: '', miembros: [] },
    { slug: 'innovacion', nombre: 'Innovación de producto', color: 'teal', icono: 'fa-lightbulb', pregunta: '', modera: '', relata: '', miembros: [] }
  ];
  window.ICONOS_MESA = ['fa-bullhorn', 'fa-lightbulb', 'fa-coins', 'fa-gears', 'fa-people-group', 'fa-chess', 'fa-laptop-code', 'fa-truck', 'fa-scale-balanced', 'fa-comments'];

  /* ---------- configuración de la junta ---------- */
  const JUNTA = window.JUNTA = {
    sesion: null, mesas: MESAS_DEF, campos: [],
    /* Lee la config de la sesión y deja listas MESAS y los campos combinados con el catálogo */
    leer(sesion) {
      this.sesion = sesion || null;
      const j = (sesion && sesion.config && sesion.config.junta) || {};
      this.mesas = (Array.isArray(j.mesas) && j.mesas.length ? j.mesas : MESAS_DEF).map(m => ({ pregunta: '', modera: '', relata: '', miembros: [], color: 'gray', icono: 'fa-comments', ...m }));
      const cf = j.campos || {};
      this.campos = CAMPOS_JUNTA.map(c => {
        const d = CAMPOS_DEF[c.k] || {}, u = cf[c.k] || {};
        return { ...c, activo: c.fijo ? true : (u.activo ?? d.activo ?? false), obligatorio: c.fijo ? true : (u.obligatorio ?? d.obligatorio ?? false), etiqueta: u.etiqueta || c.etiqueta };
      });
      window.MESAS = this.mesas;
      return this;
    },
    async cargar() { return this.leer(await DB.getSesion()); },
    activos() { return this.campos.filter(c => c.activo); },
    detalle() { return this.campos.filter(c => c.activo && !c.fijo); },
    val(a, k) { const c = CAMPOS_JUNTA.find(x => x.k === k); return String((c && c.base ? a[k] : (a.extra || {})[k]) ?? '').trim(); },
    /* Etiquetas de los campos obligatorios que la acción todavía no tiene */
    faltan(a) { return this.campos.filter(c => c.activo && c.obligatorio && !c.fijo && !this.val(a, c.k)).map(c => c.etiqueta); },
    completa(a) { return !this.faltan(a).length; },
    /* Guarda mesas y campos (solo admin). Se guarda el objeto completo: el merge de config es por clave de primer nivel. */
    async guardar({ mesas, campos, nombre }) {
      const junta = { mesas: mesas || this.mesas, campos: Object.fromEntries((campos || this.campos).filter(c => !c.fijo).map(c => [c.k, { activo: !!c.activo, obligatorio: !!c.obligatorio, etiqueta: c.etiqueta }])) };
      const p = { config: { tipo: 'junta', junta } }; if (nombre) p.nombre = nombre;
      return DB.admin('config', p);
    }
  };
  JUNTA.leer(null);
  window.mesaInfo = (slug) => JUNTA.mesas.find(m => m.slug === slug) || { slug, nombre: slug || 'Sin mesa', color: 'gray', icono: 'fa-circle', miembros: [] };
  window.slugify = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'mesa';
  /* URL de una vista para una mesa (conserva ?s= y ?demo=1) */
  window.urlMesa = (archivo, slug) => { const u = urlVista(archivo); return slug ? u + (u.includes('?') ? '&' : '?') + 'm=' + encodeURIComponent(slug) : u; };
  window.mesaDeUrl = () => new URLSearchParams(location.search).get('m') || '';

  /* ---------------- SUPABASE ---------------- */
  if (DB.MODE === 'supabase' && window.supabase) {
    const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const ok = (r) => { if (r.error) throw new Error(r.error.message || JSON.stringify(r.error)); return r.data; };
    DB.getAcciones = async () => ok(await sb.from('acciones').select('*').eq('sesion_id', SES).order('id')) || [];
    DB.accionOp = async (op, payload = {}, clave) => ok(await sb.rpc('acciones_op', { p_sesion: SES, p_clave: clave || DB.claveMesa || DB.clave, p_op: op, p_payload: payload }));
  }

  /* ---------------- LOCAL (demo / plan B sin red) ---------------- */
  else {
    const KEY = 'foro_acciones_' + SES;
    const chan = ('BroadcastChannel' in window) ? new BroadcastChannel('foro_acc_' + SES) : null;
    const leer = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { seq: 0, filas: [] }; } catch (e) { return { seq: 0, filas: [] }; } };
    const guardar = (d) => { localStorage.setItem(KEY, JSON.stringify(d)); chan && chan.postMessage('x'); };
    DB.getAcciones = async () => leer().filas.slice().sort((a, b) => a.id - b.id);
    DB.accionOp = async (op, payload = {}) => {
      if (op === 'validar') return { ok: true, admin: true };   // en modo local no hay clave que validar
      const d = leer(); const i = d.filas.findIndex(f => f.id === Number(payload.id)); const now = new Date().toISOString();
      if (op === 'crear') {
        const fila = { id: ++d.seq, sesion_id: SES, mesa: payload.mesa || 'general', titulo: payload.titulo || '(sin título)', responsable: payload.responsable || '', acompana: payload.acompana || '', fecha: payload.fecha || '', senal: payload.senal || '', extra: payload.extra || {}, estado: 'borrador', autor: payload.autor || '', created_at: now, updated_at: now };
        d.filas.push(fila); guardar(d); return fila;
      }
      if (i < 0 && op !== 'limpiar') throw new Error('NO_EXISTE');
      if (op === 'editar') { ['titulo', 'responsable', 'acompana', 'fecha', 'senal', 'mesa'].forEach(k => { if (payload[k] !== undefined) d.filas[i][k] = payload[k]; }); if (payload.extra) d.filas[i].extra = { ...(d.filas[i].extra || {}), ...payload.extra }; d.filas[i].updated_at = now; }
      else if (op === 'confirmar') d.filas[i].estado = 'confirmada';
      else if (op === 'reabrir') d.filas[i].estado = 'borrador';
      else if (op === 'borrar') d.filas.splice(i, 1);
      else if (op === 'limpiar') { d.filas = []; }
      guardar(d); return { ok: true };
    };
    DB.onAccionesChange = (fn) => { chan && chan.addEventListener('message', fn); };
  }

  /* Clave de mesa: la guarda el navegador del relator mientras dure la sesión */
  DB.claveMesa = sessionStorage.getItem('acc_clave_' + SES) || '';
  DB.setClaveMesa = (c) => { DB.claveMesa = c; sessionStorage.setItem('acc_clave_' + SES, c); };

  /* CSV para el acta (Excel lo abre de una): mesa + campos activos + estado */
  window.accionesCsv = (filas) => {
    const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const cs = JUNTA.activos();
    const cab = ['Mesa', ...cs.map(c => c.etiqueta), 'Estado', 'Faltan'];
    const cuerpo = filas.map(a => [mesaInfo(a.mesa).nombre, ...cs.map(c => JUNTA.val(a, c.k)), a.estado === 'confirmada' ? 'Lista' : 'Borrador', JUNTA.faltan(a).join(' · ')].map(q).join(','));
    return '﻿' + [cab.map(q).join(','), ...cuerpo].join('\r\n');
  };
  window.descargarCsv = (nombre, texto) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
    a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  /* Solo las acciones que llegan después del primer pintado entran con animación (el refresco cada 4 s
     redibuja todo y no debe hacer parpadear lo que ya estaba). */
  window.Nuevas = () => { let vistos = null; return (filas) => { const nuevas = new Set(vistos ? filas.filter(f => !vistos.has(f.id)).map(f => f.id) : []); vistos = new Set(filas.map(f => f.id)); return nuevas; }; };
  window.ACC_CSS = `.acc-in{animation:accIn 260ms cubic-bezier(.23,1,.32,1)}@keyframes accIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .press{transition:transform 140ms ease-out}.press:active{transform:scale(.97)}
    @media (prefers-reduced-motion:reduce){.acc-in{animation:accFade 200ms ease}@keyframes accFade{from{opacity:0}to{opacity:1}}.press:active{transform:none}}`;
  document.head.insertAdjacentHTML('beforeend', '<style>' + ACC_CSS + '</style>');
  window.nombreArchivo = (slug) => `acciones_${SES}${slug ? '_' + slug : ''}_${new Date().toISOString().slice(0, 10)}.csv`;

  /* Tarjeta de acción reutilizable (tema claro u oscuro). opts.acciones = html de botones a la derecha */
  window.tarjetaAccion = (f, opts = {}) => {
    const osc = !!opts.oscuro, lista = f.estado === 'confirmada', faltan = JUNTA.faltan(f);
    const borde = lista ? (osc ? 'border-emerald-400' : 'border-emerald-500') : faltan.length ? 'border-amber-400' : (osc ? 'border-white/25' : 'border-gray-300');
    const fondo = osc ? (lista ? 'bg-white/10' : 'bg-white/5') : 'bg-white shadow-sm';
    const sub = osc ? 'text-gray-300' : 'text-gray-600', ico = 'text-gray-400', aviso = osc ? 'text-amber-300' : 'text-amber-600';
    const det = JUNTA.detalle().filter(c => c.tipo !== 'textarea');
    const largos = JUNTA.detalle().filter(c => c.tipo === 'textarea');
    return `<div class="card ${opts.nueva ? 'acc-in' : ''} rounded-xl border-l-4 ${borde} ${fondo} p-3">
      <div class="flex justify-between gap-3">
        <p class="font-bold leading-snug ${opts.grande ? 'text-[17px]' : ''}">${opts.num ? `<span class="fn-mono ${ico} mr-1">${opts.num}.</span>` : ''}${esc(f.titulo)}</p>
        ${opts.acciones || (lista ? `<i class="fas fa-circle-check text-emerald-500 mt-1" title="Lista"></i>` : '')}
      </div>
      <div class="text-[13px] ${sub} mt-2 flex flex-wrap gap-x-4 gap-y-1">
        ${det.map(c => { const v = JUNTA.val(f, c.k); return v ? `<span><i class="fas ${c.icono || 'fa-circle'} mr-1 ${ico}"></i>${esc(v)}</span>` : (c.obligatorio ? `<span class="${aviso}"><i class="fas ${c.icono || 'fa-circle'} mr-1"></i>falta ${esc(c.etiqueta.toLowerCase())}</span>` : ''); }).join('')}
      </div>
      ${largos.map(c => { const v = JUNTA.val(f, c.k); return v ? `<p class="text-[12px] ${ico} mt-1 whitespace-pre-line"><i class="fas ${c.icono} mr-1"></i>${esc(v)}</p>` : ''; }).join('')}
    </div>`;
  };
})();

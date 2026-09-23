/* ============================================================
   ACCIONES — tablero del wrap up (submódulo)
   Extiende DB con la misma idea de siempre: dos backends con la
   misma interfaz (supabase en producción, localStorage en demo).
   ============================================================ */
(function () {
  const CFG = window.FORO_CONFIG || {};
  const SES = DB.SES;

  /* Mesas del wrap up. Se pueden cambiar sin tocar la base: el slug es lo que se guarda. */
  window.MESAS = [
    { slug: 'mercadeo',   nombre: 'Mercadeo y ventas',   color: 'blue',  icono: 'fa-bullhorn' },
    { slug: 'innovacion', nombre: 'Innovación de producto', color: 'teal', icono: 'fa-lightbulb' },
    { slug: 'general',    nombre: 'De la sala',          color: 'gray',  icono: 'fa-comments' }
  ];
  window.mesaInfo = (slug) => MESAS.find(m => m.slug === slug) || { slug, nombre: slug, color: 'gray', icono: 'fa-circle' };

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
        const fila = { id: ++d.seq, sesion_id: SES, mesa: payload.mesa || 'general', titulo: payload.titulo || '(sin título)', responsable: payload.responsable || '', acompana: payload.acompana || '', fecha: payload.fecha || '', senal: payload.senal || '', estado: 'borrador', autor: payload.autor || '', created_at: now, updated_at: now };
        d.filas.push(fila); guardar(d); return fila;
      }
      if (i < 0 && op !== 'limpiar') throw new Error('NO_EXISTE');
      if (op === 'editar') { ['titulo', 'responsable', 'acompana', 'fecha', 'senal', 'mesa'].forEach(k => { if (payload[k] !== undefined) d.filas[i][k] = payload[k]; }); d.filas[i].updated_at = now; }
      else if (op === 'confirmar') d.filas[i].estado = 'confirmada';
      else if (op === 'reabrir') d.filas[i].estado = 'borrador';
      else if (op === 'borrar') d.filas.splice(i, 1);
      else if (op === 'limpiar') { d.filas = []; }
      guardar(d); return { ok: true };
    };
    if (chan && DB.onChange === undefined) { /* el muro de acciones se refresca solo entre pestañas */ }
    DB.onAccionesChange = (fn) => { chan && chan.addEventListener('message', fn); };
  }

  /* Clave de mesa: la guarda el navegador del líder mientras dure la sesión */
  DB.claveMesa = sessionStorage.getItem('acc_clave_' + SES) || '';
  DB.setClaveMesa = (c) => { DB.claveMesa = c; sessionStorage.setItem('acc_clave_' + SES, c); };

  /* CSV para el acta (Excel lo abre de una) */
  window.accionesCsv = (filas) => {
    const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const cab = ['Mesa', 'Acción', 'Responsable', 'Acompaña', 'Fecha', 'Cómo sabemos que avanzó', 'Estado'];
    const cuerpo = filas.map(a => [mesaInfo(a.mesa).nombre, a.titulo, a.responsable, a.acompana, a.fecha, a.senal, a.estado === 'confirmada' ? 'Confirmada' : 'Borrador'].map(q).join(','));
    return '﻿' + [cab.map(q).join(','), ...cuerpo].join('\r\n');
  };
  window.descargarCsv = (nombre, texto) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
    a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
})();

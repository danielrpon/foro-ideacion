/* ============================================================
   DB — capa de datos. Dos backends con la MISMA interfaz:
   - supabase: producción (todas las pantallas comparten la nube)
   - local:    demo en este navegador (localStorage + BroadcastChannel)
   ============================================================ */
(function () {
  const CFG = window.FORO_CONFIG || {};
  const qs = new URLSearchParams(location.search);
  const SES = qs.get('s') || CFG.SESION || 'impercap';
  const placeholder = !CFG.SUPABASE_URL || /TU-PROYECTO/.test(CFG.SUPABASE_URL) || !CFG.SUPABASE_ANON_KEY || /TU-ANON/.test(CFG.SUPABASE_ANON_KEY);
  const MODE = (CFG.MODE === 'supabase' && !placeholder && window.supabase && qs.get('demo') !== '1') ? 'supabase' : 'local'; // ?demo=1 fuerza el modo local para practicar

  const DB = { MODE, SES, clave: sessionStorage.getItem('foro_clave_' + SES) || '' };
  DB.setClave = (c) => { DB.clave = c; sessionStorage.setItem('foro_clave_' + SES, c); };

  /* ---------------- SUPABASE ---------------- */
  if (MODE === 'supabase') {
    const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const ok = (r) => { if (r.error) throw new Error(r.error.message || JSON.stringify(r.error)); return r.data; };
    DB.getSesion = async () => ok(await sb.from('v_sesiones').select('*').eq('id', SES).maybeSingle());
    DB.getPilares = async () => ok(await sb.from('pilares').select('*').eq('sesion_id', SES).eq('activo', true).order('orden'));
    DB.getIdeas = async () => ok(await sb.from('v_ideas').select('*').eq('sesion_id', SES).order('created_at'));
    DB.getParticipantes = async () => ok(await sb.from('participantes').select('*').eq('sesion_id', SES).order('created_at'));
    DB.conectados = async () => ok(await sb.rpc('conectados', { p_sesion: SES }));
    DB.getVotos = async (pid) => (ok(await sb.from('votos').select('idea_id').eq('sesion_id', SES).eq('participante_id', pid)) || []).map(v => v.idea_id);
    DB.getEvaluaciones = async (pid) => ok(await sb.from('evaluaciones').select('*').eq('sesion_id', SES).eq('participante_id', pid)) || [];
    DB.getAllEvaluaciones = async () => ok(await sb.from('evaluaciones').select('*').eq('sesion_id', SES)) || [];
    DB.registrar = async (nombre, perfil) => ok(await sb.from('participantes').insert({ sesion_id: SES, nombre, perfil }).select().single());
    DB.ping = async (pid) => { try { await sb.from('participantes').update({ last_seen: new Date().toISOString() }).eq('id', pid); } catch (e) {} };
    DB.crearIdea = async (d) => ok(await sb.from('ideas').insert({ sesion_id: SES, ...d, tipo: 'idea', estado: 'nueva' }).select().single());
    DB.crearIdeas = async (arr) => ok(await sb.from('ideas').insert(arr.map(d => ({ sesion_id: SES, ...d, tipo: 'idea', estado: 'nueva' }))).select());
    DB.votar = async (idea_id, pid) => ok(await sb.from('votos').insert({ sesion_id: SES, idea_id, participante_id: pid }));
    DB.quitarVoto = async (idea_id, pid) => ok(await sb.from('votos').delete().eq('idea_id', idea_id).eq('participante_id', pid));
    DB.quitarEvaluacion = async (idea_id, pid) => ok(await sb.from('evaluaciones').delete().eq('idea_id', idea_id).eq('participante_id', pid));
    DB.evaluar = async (idea_id, pid, esfuerzo, impacto) => ok(await sb.from('evaluaciones').upsert({ sesion_id: SES, idea_id, participante_id: pid, esfuerzo, impacto }, { onConflict: 'idea_id,participante_id' }));
    DB.admin = async (op, payload = {}, clave) => ok(await sb.rpc('admin_op', { p_sesion: SES, p_clave: clave || DB.clave, p_op: op, p_payload: payload }));
  }

  /* ---------------- LOCAL (demo) ---------------- */
  else {
    const KEY = 'foro_local_' + SES;
    const chan = ('BroadcastChannel' in window) ? new BroadcastChannel('foro_' + SES) : null;
    const nowIso = () => new Date().toISOString();
    const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'p-' + Math.random().toString(36).slice(2) + Date.now());
    const seed = () => ({
      seq: 5,
      sesion: { id: SES, nombre: 'Foro de ideación · Impercap', empresa: 'Impercap', facilitador: 'Daniel Restrepo', etapa: 'bienvenida', etapa_ts: nowIso(), fin_etapa: null, proyectada_id: null, modo_matriz: 'todas', clave_admin: 'admin', clave_lider: 'lider', created_at: nowIso(),
        config: { votos_por_pilar: 3, minutos_ideacion: 10, minutos_matriz: 8, escala_max: 5, max_calificaciones: 8,
          caso: 'Impercap (Impermeables Vélez y Forero SAS) lleva más de 10 años fabricando impermeables para moto en plástico reciclado en Medellín. En 2025 vendió $2.734M (+50%) y enero–abril de 2026 iba +32%. Con El Niño, de mayo a agosto la venta cayó 40%: $153M/mes frente a ~$250M que necesita para cubrir sus costos; enero a julio ya acumula pérdidas por $178M, con 37 personas en nómina y la caja para pocos meses. El reto del foro: ideas que den ventas y aire financiero en los próximos 3 a 6 meses, desde Mercadeo y Ventas, Financiero, Estructura y Cultura, Operaciones y Otros.',
          restricciones: ['Caja limitada: no hay flujo para indemnizar ni para contratar sin retorno rápido', 'Un vendedor tarda ~3 meses en volverse rentable', 'El clima vuelve a favor ~febrero: el corto plazo es sobrevivir y llegar al punto de equilibrio', 'Puede haber activos vendibles o una línea de crédito: preguntar antes de asumir'] } },
      pilares: [
        { id: 1, sesion_id: SES, orden: 1, nombre: 'Mercadeo y Ventas', icono: 'fa-bullhorn', color: 'blue', activo: true, enunciado: '¿Cómo inyectar ventas en los próximos 3 a 6 meses mientras no llueve en Antioquia? ¿A quién le sigue lloviendo y cómo llegar allá rápido? ¿Qué le podemos vender al cliente que ya nos compra, aunque no sea impermeable? Datos: 2025 cerró en $2.734M (+50%); enero a abril de 2026 iba +32% y de mayo a agosto cayó 40%, a $153M/mes. Antioquia es el 61% de las unidades, Bogotá 9%, el Pacífico casi nada. Dos cuentas grandes son cerca del 40% de la venta. Unos 500 clientes atendidos por un vendedor, una auxiliar y un practicante.', subfrentes: ['Cobertura geográfica', 'Diversificación de productos', 'Desarrollo del cliente actual', 'Clientes nuevos', 'Canal digital / IA'] },
        { id: 2, sesion_id: SES, orden: 2, nombre: 'Financiero', icono: 'fa-coins', color: 'green', activo: true, enunciado: '¿Cómo aguantar hasta febrero con la venta a la mitad? ¿Qué gasto se puede pausar o volver variable sin romper la operación? ¿De dónde sale caja rápida sin endeudarse más? Datos: el equilibrio está cerca de $250M/mes; de mayo a agosto se vendieron $153M/mes. La estructura es casi toda fija: el costo de producción pasó de ~64% de la venta (enero–abril) a más del 100% en mayo y julio. Enero–julio de 2026 deja pérdida operativa de $76M y neta de $178M; los gastos financieros son ~$15M/mes. Publicidad es 3,7% de la venta (11% con su personal). El margen sobre costo directo de los impermeables es alto (55–65%); el de las líneas institucionales, bajo. Hay deuda financiera y la caja alcanza para pocos meses.', subfrentes: ['Estructura de costos y gastos', 'Caja y financiación', 'Activos y capital de trabajo'] },
        { id: 3, sesion_id: SES, orden: 3, nombre: 'Estructura y Cultura', icono: 'fa-people-group', color: 'purple', activo: true, enunciado: '¿Cómo reorganizar 37 personas para vender más con la misma nómina? ¿Quién de planta podría estar hoy vendiendo, atendiendo clientes o despachando? ¿Cómo activar ideas y compromiso del equipo en plena crisis? Datos: estructura transversal, no piramidal: 24 operarios, coordinador de producción, líder de operaciones, dos de logística, líder general, líder de mercadeo, una auxiliar administrativa comercial, un vendedor, un practicante y una auxiliar administrativa. El brazo comercial son cuatro personas para unos 500 clientes y se debilitó este año.', subfrentes: ['Fuerza comercial', 'Roles y estructura', 'Cultura y capacidad de reinvención'] },
        { id: 5, sesion_id: SES, orden: 4, nombre: 'Operaciones', icono: 'fa-gears', color: 'teal', activo: true, enunciado: '¿Qué se puede fabricar o hacer con media planta parada? ¿Qué maquila, producto o servicio cabe en la capacidad y el material que ya tenemos? ¿Cómo bajar el costo por unidad sin sacrificar calidad? Datos: planta en Medellín con 24 operarios y materia prima de plástico 100% reciclado. En abril despachó 56.000 unidades; de mayo a agosto, 28.000 al mes. Unas 25 referencias: impermeables, ponchos, gabanes, botas, delantales y batas. Hoy también puede fabricar pijamas para carro, moto de carga, bicicleta y lavadora, portacascos, pantalones, capa para mascota, bolsas de empaque personalizadas, estampado de tela y delantales infantiles. Logística de dos personas.', subfrentes: ["Capacidad y planta", "Compras y proveedores", "Logística y entregas", "Calidad y procesos"] },
        { id: 4, sesion_id: SES, orden: 5, nombre: 'Otros', icono: 'fa-lightbulb', color: 'amber', activo: true, enunciado: '¿Qué alianza, contacto o idea rara podría mover la aguja y no cabe en los otros pilares? ¿Con quién deberíamos hablar la próxima semana? Aquí van contactos concretos, alianzas, canales inesperados y obviedades que nadie ha dicho.', subfrentes: [] }
      ],
      participantes: [], ideas: [], votos: [], evaluaciones: []
    });
    const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.sesion) return s; } catch (e) {} const s = seed(); save(s); return s; };
    const save = (s) => { localStorage.setItem(KEY, JSON.stringify(s)); if (chan) chan.postMessage('upd'); };
    const nextId = (s) => (s.seq = (s.seq || 1) + 1);
    const delay = (v) => Promise.resolve(v);
    const pub = (s) => { const { clave_admin, clave_lider, ...rest } = s.sesion; return rest; };
    const round1 = (x) => Math.round(x * 10) / 10;
    const vIdeas = (s) => s.ideas.map(i => {
      const p = s.pilares.find(p => p.id === i.pilar_id) || {};
      const ev = s.evaluaciones.filter(e => e.idea_id === i.id);
      return { ...i, pilar_nombre: p.nombre || null, pilar_color: p.color || 'gray', pilar_orden: p.orden || 99,
        votos: s.votos.filter(v => v.idea_id === i.id).length, conteo_eval: ev.length,
        esfuerzo_prom: ev.length ? round1(ev.reduce((a, e) => a + e.esfuerzo, 0) / ev.length) : 0,
        impacto_prom: ev.length ? round1(ev.reduce((a, e) => a + e.impacto, 0) / ev.length) : 0,
        n_hijas: s.ideas.filter(h => h.padre_id === i.id).length };
    });

    DB.getSesion = async () => delay(pub(load()));
    DB.getPilares = async () => delay(load().pilares.filter(p => p.activo).sort((a, b) => a.orden - b.orden));
    DB.getIdeas = async () => delay(vIdeas(load()));
    DB.getParticipantes = async () => delay(load().participantes);
    DB.conectados = async () => { const t = Date.now() - 90000; return delay(load().participantes.filter(p => new Date(p.last_seen).getTime() > t).length); };
    DB.getVotos = async (pid) => delay(load().votos.filter(v => v.participante_id === pid).map(v => v.idea_id));
    DB.getEvaluaciones = async (pid) => delay(load().evaluaciones.filter(e => e.participante_id === pid));
    DB.getAllEvaluaciones = async () => delay(load().evaluaciones);
    DB.registrar = async (nombre, perfil) => { const s = load(); const p = { id: uuid(), sesion_id: SES, nombre, perfil, created_at: nowIso(), last_seen: nowIso() }; s.participantes.push(p); save(s); return delay(p); };
    DB.ping = async (pid) => { const s = load(); const p = s.participantes.find(p => p.id === pid); if (p) { p.last_seen = nowIso(); localStorage.setItem(KEY, JSON.stringify(s)); } };
    DB.crearIdea = async (d) => { const s = load(); if (s.sesion.etapa !== 'ideacion') throw new Error('ETAPA_CERRADA'); const i = { id: nextId(s), sesion_id: SES, tipo: 'idea', estado: 'nueva', padre_id: null, texto_original: null, es_editado: false, origen: 'participante', titulo: null, descripcion_corta: null, detalle: null, responsable: null, tiempo_ejecucion: null, created_at: nowIso(), updated_at: nowIso(), ...d }; s.ideas.push(i); save(s); return delay(i); };
    DB.votar = async (idea_id, pid) => { const s = load(); if (s.sesion.etapa !== 'votacion') throw new Error('ETAPA_CERRADA'); const idea = s.ideas.find(i => i.id === idea_id); const max = s.sesion.config.votos_por_pilar || 3; const n = s.votos.filter(v => v.participante_id === pid && (s.ideas.find(i => i.id === v.idea_id) || {}).pilar_id === idea.pilar_id).length; if (n >= max) throw new Error('LIMITE_VOTOS'); if (s.votos.some(v => v.idea_id === idea_id && v.participante_id === pid)) throw new Error('duplicate'); s.votos.push({ id: nextId(s), sesion_id: SES, idea_id, participante_id: pid, created_at: nowIso() }); save(s); return delay(true); };
    DB.quitarVoto = async (idea_id, pid) => { const s = load(); s.votos = s.votos.filter(v => !(v.idea_id === idea_id && v.participante_id === pid)); save(s); return delay(true); };
    DB.evaluar = async (idea_id, pid, esfuerzo, impacto) => { const s = load(); if (s.sesion.etapa !== 'matriz') throw new Error('ETAPA_CERRADA'); let e = s.evaluaciones.find(e => e.idea_id === idea_id && e.participante_id === pid); if (e) { e.esfuerzo = esfuerzo; e.impacto = impacto; e.updated_at = nowIso(); } else { const lim = Number(s.sesion.config.max_calificaciones) || 8; if (s.evaluaciones.filter(x => x.participante_id === pid).length >= lim) throw new Error('LIMITE_CALIFICACIONES'); s.evaluaciones.push({ id: nextId(s), sesion_id: SES, idea_id, participante_id: pid, esfuerzo, impacto, created_at: nowIso(), updated_at: nowIso() }); } save(s); return delay(true); };
    DB.quitarEvaluacion = async (idea_id, pid) => { const s = load(); if (s.sesion.etapa !== 'matriz') throw new Error('ETAPA_CERRADA'); s.evaluaciones = s.evaluaciones.filter(e => !(e.idea_id === idea_id && e.participante_id === pid)); save(s); return delay(true); };

    DB.admin = async (op, payload = {}, clave) => {
      const s = load(); clave = clave || DB.clave;
      let rol = clave === s.sesion.clave_admin ? 'admin' : clave === s.sesion.clave_lider ? 'lider' : null;
      if (!rol) throw new Error('CLAVE_INVALIDA');
      const soloAdmin = () => { if (rol !== 'admin') throw new Error('SOLO_ADMIN'); };
      const byId = (id) => s.ideas.find(i => i.id === Number(id));
      const ungroup = (gid) => s.ideas.forEach(i => { if (i.padre_id === gid) { i.padre_id = null; if (i.estado === 'agrupada') i.estado = 'validada'; } });
      const mkGrupo = (g, origen) => { const id = nextId(s); s.ideas.push({ id, sesion_id: SES, pilar_id: g.pilar_id ? Number(g.pilar_id) : null, subfrente: null, participante_id: null, participante_nombre: origen === 'ia' ? 'IA' : rol, tipo: 'grupo', texto: g.titulo || '(sin título)', texto_original: null, es_editado: false, estado: 'consolidada', padre_id: null, titulo: g.titulo, descripcion_corta: g.descripcion_corta || null, detalle: g.detalle || null, origen, responsable: null, tiempo_ejecucion: null, created_at: nowIso(), updated_at: nowIso() }); (g.ideas || []).forEach(cid => { const c = byId(cid); if (c && c.tipo === 'idea') { c.padre_id = id; c.estado = 'agrupada'; } }); return id; };
      let r = {};
      switch (op) {
        case 'login': break;
        case 'cambiar_etapa': soloAdmin(); s.sesion.etapa = payload.etapa; s.sesion.etapa_ts = nowIso(); s.sesion.fin_etapa = payload.minutos > 0 ? new Date(Date.now() + payload.minutos * 60000).toISOString() : null; break;
        case 'temporizador': { soloAdmin(); const m = Number(payload.minutos || 0); if (payload.extender) s.sesion.fin_etapa = new Date((s.sesion.fin_etapa ? new Date(s.sesion.fin_etapa).getTime() : Date.now()) + m * 60000).toISOString(); else s.sesion.fin_etapa = m > 0 ? new Date(Date.now() + m * 60000).toISOString() : null; break; }
        case 'proyectar': soloAdmin(); s.sesion.proyectada_id = payload.idea_id ? Number(payload.idea_id) : null; break;
        case 'modo_matriz': soloAdmin(); s.sesion.modo_matriz = payload.modo; break;
        case 'config': soloAdmin(); Object.assign(s.sesion.config, payload.config || {}); ['nombre', 'empresa', 'facilitador'].forEach(k => { if (payload[k] != null) s.sesion[k] = payload[k]; }); break;
        case 'upsert_pilar': { soloAdmin(); if (payload.id) { const p = s.pilares.find(p => p.id === Number(payload.id)); Object.keys(payload).forEach(k => { if (k !== 'id' && payload[k] !== undefined) p[k] = payload[k]; }); r.id = p.id; } else { const p = { id: nextId(s), sesion_id: SES, orden: payload.orden || 0, nombre: payload.nombre, icono: payload.icono || 'fa-lightbulb', color: payload.color || 'blue', enunciado: payload.enunciado || '', subfrentes: payload.subfrentes || [], activo: true }; s.pilares.push(p); r.id = p.id; } break; }
        case 'eliminar_pilar': soloAdmin(); s.pilares = s.pilares.filter(p => p.id !== Number(payload.id)); break;
        case 'eliminar_idea': { soloAdmin(); const id = Number(payload.id); ungroup(id); s.ideas = s.ideas.filter(i => i.id !== id); s.votos = s.votos.filter(v => v.idea_id !== id); s.evaluaciones = s.evaluaciones.filter(e => e.idea_id !== id); break; }
        case 'borrar_votos': soloAdmin(); s.votos = []; break;
        case 'borrar_evaluaciones': soloAdmin(); s.evaluaciones = []; break;
        case 'borrar_grupos': soloAdmin(); s.ideas.forEach(i => { if (i.estado === 'agrupada') { i.padre_id = null; i.estado = 'validada'; } }); s.ideas = s.ideas.filter(i => i.tipo !== 'grupo'); break;
        case 'borrar_todo': soloAdmin(); s.ideas = []; s.votos = []; s.evaluaciones = []; s.participantes = []; Object.assign(s.sesion, { etapa: 'bienvenida', etapa_ts: nowIso(), fin_etapa: null, proyectada_id: null }); s.sesion.modo_matriz = 'todas'; s.sesion.proyectada_id = null; break;
        case 'eliminar_participante': soloAdmin(); s.participantes = s.participantes.filter(p => p.id !== payload.id); break;
        case 'crear_idea': { const tipo = payload.tipo || 'idea'; const i = { id: nextId(s), sesion_id: SES, pilar_id: payload.pilar_id ? Number(payload.pilar_id) : null, subfrente: payload.subfrente || null, participante_id: null, participante_nombre: payload.participante_nombre || (rol === 'admin' ? 'Admin' : 'Líder'), tipo, texto: payload.texto || payload.titulo, texto_original: null, es_editado: false, estado: tipo === 'grupo' ? 'consolidada' : 'validada', padre_id: null, titulo: payload.titulo || null, descripcion_corta: payload.descripcion_corta || null, detalle: payload.detalle || null, origen: rol, responsable: null, tiempo_ejecucion: null, created_at: nowIso(), updated_at: nowIso() }; s.ideas.push(i); r.id = i.id; break; }
        case 'editar_idea': { const i = byId(payload.id); if (!i) break; if ('texto' in payload && payload.texto !== i.texto) { if (i.texto_original == null) i.texto_original = i.texto; i.es_editado = true; i.texto = payload.texto; } ['pilar_id', 'subfrente', 'estado', 'titulo', 'descripcion_corta', 'detalle', 'responsable', 'tiempo_ejecucion'].forEach(k => { if (k in payload) i[k] = k === 'pilar_id' ? (payload[k] ? Number(payload[k]) : null) : payload[k]; }); i.updated_at = nowIso(); break; }
        case 'set_estado': { const i = byId(payload.id); if (i) i.estado = payload.estado; break; }
        case 'deshacer': { const i = byId(payload.id); if (i && i.tipo === 'idea') { i.estado = 'nueva'; i.padre_id = null; if (i.texto_original != null) i.texto = i.texto_original; i.texto_original = null; i.es_editado = false; } break; }
        case 'crear_grupo': r.id = mkGrupo(payload, payload.origen || rol); break;
        case 'asignar_grupo': { const i = byId(payload.id); if (i && i.tipo === 'idea') { i.padre_id = payload.padre_id ? Number(payload.padre_id) : null; i.estado = i.padre_id ? 'agrupada' : 'validada'; } break; }
        case 'disolver_grupo': { const id = Number(payload.id); ungroup(id); s.ideas = s.ideas.filter(i => i.id !== id); break; }
        case 'importar_consolidacion': { if (payload.reemplazar) { const pid = payload.pilar_id ? Number(payload.pilar_id) : null; s.ideas.filter(i => i.tipo === 'grupo' && (!pid || i.pilar_id === pid)).forEach(g => ungroup(g.id)); s.ideas = s.ideas.filter(i => !(i.tipo === 'grupo' && (!pid || i.pilar_id === pid))); } (payload.grupos || []).forEach(g => mkGrupo(g, g.origen || 'ia')); break; }
        default: throw new Error('OP_DESCONOCIDA: ' + op);
      }
      save(s); return delay({ ...r, ok: true, rol });
    };
    DB.onChange = (fn) => { if (chan) chan.onmessage = fn; window.addEventListener('storage', (e) => { if (e.key === KEY) fn(); }); };
  }

  /* ---------------- común ---------------- */
  DB.snapshot = async () => {
    const [sesion, pilares, ideas, conectados] = await Promise.all([DB.getSesion(), DB.getPilares(), DB.getIdeas(), DB.conectados().catch(() => 0)]);
    return { sesion, pilares, ideas: ideas || [], conectados: conectados || 0 };
  };
  window.DB = DB;
})();

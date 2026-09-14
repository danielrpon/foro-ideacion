/* ============================================================
   ARCHIVO — descarga el ejercicio completo (JSON) y lo vuelve a
   cargar para verlo tal cual quedó.
   La carga NUNCA toca la nube: instala el ejercicio como sesión
   local de este navegador (?demo=1&s=<slug>), con claves admin / lider.
   ============================================================ */
(function () {
  const FORMATO = 'foro-ideacion/ejercicio';
  const PREFIJO = 'foro_local_';
  const TABLAS = ['pilares', 'participantes', 'ideas', 'votos', 'evaluaciones'];
  const CAMPOS_VISTA = ['pilar_nombre', 'pilar_color', 'pilar_orden', 'votos', 'conteo_eval', 'esfuerzo_prom', 'impacto_prom', 'n_hijas'];
  const dos = (n) => String(n).padStart(2, '0');
  const sello = (iso, sep = '_') => { const d = new Date(iso); return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}${sep}${dos(d.getHours())}${dos(d.getMinutes())}`; };
  const conteos = (d) => ({ participantes: d.participantes.length, pilares: d.pilares.length, ideas: d.ideas.filter(i => i.tipo === 'idea').length, consolidadas: d.ideas.filter(i => i.tipo === 'grupo').length, votos: d.votos.length, evaluaciones: d.evaluaciones.length });

  const ARCHIVO = { FORMATO };

  /* Arma el objeto del ejercicio desde el backend activo (nube o local) */
  ARCHIVO.construir = async () => {
    const d = await DB.exportar();
    if (!d.sesion) throw new Error('No se encontró la sesión «' + DB.SES + '»');
    let version = ''; try { version = document.querySelector('meta[name="app-version"]').content; } catch (e) {}
    return { formato: FORMATO, version: 1, exportado: new Date().toISOString(), app_version: version,
      origen: { modo: DB.MODE, sesion: (DB.archivo && DB.archivo.sesion_original) || DB.SES, sitio: baseUrl() },
      conteos: conteos(d), datos: d };
  };

  ARCHIVO.descargar = async () => {
    const o = await ARCHIVO.construir();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(o, null, 1)], { type: 'application/json' }));
    a.download = 'foro_' + o.origen.sesion + '_ejercicio_' + sello(o.exportado) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return o;
  };

  ARCHIVO.validar = (o) => {
    if (!o || o.formato !== FORMATO) throw new Error('El archivo no es un ejercicio del Foro de Ideación');
    if (Number(o.version) > 1) throw new Error('El archivo es de una versión más nueva de la herramienta (v' + o.version + ')');
    if (!o.datos || !o.datos.sesion) throw new Error('Al archivo le falta la sesión');
    TABLAS.forEach(t => { if (!Array.isArray(o.datos[t])) throw new Error('Al archivo le falta la tabla «' + t + '»'); });
    return o;
  };

  /* Slug estable por ejercicio: cargar el mismo archivo dos veces reemplaza, no duplica */
  ARCHIVO.slug = (o) => String((o.origen && o.origen.sesion) || o.datos.sesion.id || 'foro').replace(/[^a-z0-9-]/gi, '') + '-archivo-' + sello(o.exportado, '-').replace(/-/g, '');

  ARCHIVO.instalar = (o) => {
    ARCHIVO.validar(o);
    const slug = ARCHIVO.slug(o), d = o.datos, conSes = (x) => ({ ...x, sesion_id: slug });
    const ideas = d.ideas.map(i => { const r = conSes(i); CAMPOS_VISTA.forEach(k => delete r[k]); return r; });
    const ids = [...d.pilares, ...ideas, ...d.votos, ...d.evaluaciones].map(x => Number(x.id) || 0);
    const { clave_admin, clave_lider, ...sesion } = d.sesion;
    const estado = {
      seq: Math.max(5, ...ids),
      archivo: { exportado: o.exportado, cargado: new Date().toISOString(), sesion_original: (o.origen && o.origen.sesion) || d.sesion.id, modo_original: o.origen && o.origen.modo, app_version: o.app_version || '', conteos: conteos(d) },
      sesion: { ...sesion, id: slug, clave_admin: 'admin', clave_lider: 'lider' },
      pilares: d.pilares.map(conSes), participantes: d.participantes.map(conSes), ideas, votos: d.votos.map(conSes), evaluaciones: d.evaluaciones.map(conSes)
    };
    localStorage.setItem(PREFIJO + slug, JSON.stringify(estado));
    return slug;
  };

  ARCHIVO.leer = async (file) => {
    let o; try { o = JSON.parse(await file.text()); } catch (e) { throw new Error('El archivo no es un JSON válido'); }
    return ARCHIVO.instalar(o);
  };

  /* Ejercicios cargados en este navegador */
  ARCHIVO.lista = () => Object.keys(localStorage).filter(k => k.startsWith(PREFIJO)).map(k => {
    try { const s = JSON.parse(localStorage.getItem(k)); if (s && s.archivo) return { slug: k.slice(PREFIJO.length), nombre: s.sesion.nombre, etapa: s.sesion.etapa, ...s.archivo }; } catch (e) {}
    return null;
  }).filter(Boolean).sort((a, b) => String(b.exportado).localeCompare(String(a.exportado)));

  ARCHIVO.quitar = (slug) => localStorage.removeItem(PREFIJO + slug);
  ARCHIVO.url = (vista, slug) => baseUrl() + vista + '?demo=1&s=' + encodeURIComponent(slug);

  window.ARCHIVO = ARCHIVO;
})();

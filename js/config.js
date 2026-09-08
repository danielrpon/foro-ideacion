// ============================================================
// CONFIGURACIÓN — Foro de Ideación (Freaknerd)
// ============================================================
// MODO:
//   'local'    → demo sin backend: los datos viven en este navegador
//                (localStorage) y se sincronizan entre pestañas.
//   'supabase' → producción: todas las pantallas comparten la nube.
// Para pasar a producción: crear el proyecto en supabase.com, correr
// supabase/schema.sql y supabase/seed_impercap.sql en el SQL Editor,
// y pegar aquí la URL y la llave anon (publishable).
// ============================================================
window.FORO_CONFIG = {
  MODE: 'supabase',
  SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'TU-ANON-KEY',
  SESION: 'impercap',          // id de la sesión (slug); se puede cambiar con ?s=otra
  POLL_MS: 3000,               // refresco de pantallas
  APP_NAME: 'Foro de Ideación'
};

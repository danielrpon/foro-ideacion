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
  SUPABASE_URL: 'https://zccrvdytrmrloahnbajl.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjY3J2ZHl0cm1ybG9haG5iYWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDA2NzQsImV4cCI6MjEwNDQxNjY3NH0.blfohUbSXniU_WMHzGAsek9DA_7ZsGNgxsoDJeC7hDg',
  SESION: 'impercap',          // id de la sesión (slug); se puede cambiar con ?s=otra
  POLL_MS: 3000,               // refresco de pantallas
  APP_NAME: 'Foro de Ideación',
  IA_MODEL: 'claude-sonnet-5'      // modelo para la consolidación MECE: 'claude-opus-5' (máxima calidad) | 'claude-sonnet-5' (equilibrio) | 'claude-haiku-4-5' (mínimo costo)
};

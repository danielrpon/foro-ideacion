// Genera el seed SQL de una sesión desde su plantilla (js/plantilla-<nombre>.js, fuente única del contenido).
// Uso: node supabase/gen_seed.js mp   → supabase/seed_mp-backlog.sql
const fs = require('fs'), path = require('path');
const nombre = process.argv[2]; if (!nombre) { console.error('uso: node supabase/gen_seed.js <plantilla>  (p. ej. mp)'); process.exit(1); }
const P = require(`../js/plantilla-${nombre}.js`);
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const out = [];
out.push('-- ============================================================');
out.push(`-- SESIÓN: ${P.nombre}`);
out.push(`-- Generado por supabase/gen_seed.js desde js/plantilla-${nombre}.js (no editar a mano).`);
out.push(P.config.sin_lider ? '-- ANTES DE CORRER: cambiar CAMBIAR_ADMIN (una sola vez, abajo) por una clave fuerte. No la guarde en el repo.\n-- Sin líderes de pilar: la clave de líder se genera al azar y nadie la conoce.' : '-- ANTES DE CORRER: cambiar CAMBIAR_ADMIN y CAMBIAR_LIDER por claves reales (no las guarde en el repo).');
out.push('-- Se corre en el SQL Editor del proyecto Supabase del foro (zccrvdytrmrloahnbajl).');
out.push('-- Es idempotente: vuelve a dejar la sesión en bienvenida con sus pilares, sin ideas.');
out.push('-- Si la sesión ya existe, NO cambia las claves (solo nombre, empresa, facilitador y config).');
out.push('-- ============================================================');
out.push(`insert into sesiones (id, nombre, empresa, facilitador, etapa, clave_admin, clave_lider, config) values`);
/* sin_lider: la clave de líder se genera al azar en la base y nadie la conoce (area.html y acciones.html quedan cerradas) */
const lider = P.config.sin_lider ? "md5(random()::text || clock_timestamp()::text)" : "'CAMBIAR_LIDER'";
out.push(`(${q(P.id)}, ${q(P.nombre)}, ${q(P.empresa)}, ${q(P.facilitador)}, 'bienvenida', 'CAMBIAR_ADMIN', ${lider},`);
out.push(` ${q(JSON.stringify(P.config))}::jsonb)`);
out.push(`on conflict (id) do update set nombre = excluded.nombre, empresa = excluded.empresa, facilitador = excluded.facilitador, config = excluded.config;`);
out.push('');
out.push(`delete from evaluaciones where idea_id in (select id from ideas where sesion_id = ${q(P.id)});`);
out.push(`delete from votos where idea_id in (select id from ideas where sesion_id = ${q(P.id)});`);
out.push(`update ideas set padre_id = null where sesion_id = ${q(P.id)};`);
out.push(`delete from ideas where sesion_id = ${q(P.id)};`);
out.push(`delete from participantes where sesion_id = ${q(P.id)};`);
out.push(`delete from pilares where sesion_id = ${q(P.id)};`);
out.push(`update sesiones set etapa = 'bienvenida', etapa_ts = now(), fin_etapa = null, proyectada_id = null where id = ${q(P.id)};`);
out.push('');
out.push(`insert into pilares (sesion_id, orden, nombre, icono, color, enunciado, subfrentes) values`);
out.push(P.pilares.map(p => `(${q(P.id)}, ${p.orden}, ${q(p.nombre)}, ${q(p.icono)}, ${q(p.color)},\n ${q(p.enunciado)},\n ${q(JSON.stringify(p.subfrentes))})`).join(',\n') + ';');
const file = path.join(__dirname, `seed_${P.id}.sql`);
fs.writeFileSync(file, out.join('\n') + '\n');
console.log('ok', file);

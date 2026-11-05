-- ============================================================
-- SESIÓN: Backlog de ideación · Grupo MP
-- Generado por supabase/gen_seed.js desde js/plantilla-mp.js (no editar a mano).
-- ANTES DE CORRER: cambiar CAMBIAR_ADMIN (una sola vez, abajo) por una clave fuerte. No la guarde en el repo.
-- Sin líderes de pilar: la clave de líder se genera al azar y nadie la conoce.
-- Se corre en el SQL Editor del proyecto Supabase del foro (zccrvdytrmrloahnbajl).
-- Es idempotente: vuelve a dejar la sesión en bienvenida con sus pilares, sin ideas.
-- Si la sesión ya existe, NO cambia las claves (solo nombre, empresa, facilitador y config).
-- ============================================================
insert into sesiones (id, nombre, empresa, facilitador, etapa, clave_admin, clave_lider, config) values
('mp-backlog', 'Backlog de ideación · Grupo MP', 'Grupo MP', 'Daniel Restrepo · Juan Gonzalo Tamayo', 'bienvenida', 'CAMBIAR_ADMIN', md5(random()::text || clock_timestamp()::text),
 '{"titulo_evento":"Backlog de ideación","logo_empresa":"img/grupomp_logo.png","sin_lider":true,"titulo_reporte":"Backlog priorizado de automatización · Grupo MP","votos_por_pilar":3,"minutos_ideacion":10,"minutos_matriz":12,"minutos_pausa":5,"escala_max":5,"max_calificaciones":12,"caso":"Después de cuatro niveles de IA-abilities, la gerencia y los directores deciden qué se automatiza primero. Escriba síntomas: tareas manuales que le duelen a usted o a su equipo. Un buen síntoma dice qué tarea, cada cuánto y cuánto tiempo toma. Ejemplo: Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas. Un síntoma por tarjeta. Con lo que salga armamos el backlog: la lista de automatizaciones ordenada por prioridad.","restricciones":["Hablamos de tareas y procesos, no de personas","No escriba datos reales de clientas ni asesoras (nombres, cédulas, teléfonos)","Lo que salga se ordena por impacto y esfuerzo: no todo se hace ya"],"instruccion_ia":"Las ideas son SÍNTOMAS: tareas manuales que le duelen a un área de Grupo MP (venta directa por catálogo con asesoras). Cada idea consolidada es una AUTOMATIZACIÓN CANDIDATA para el backlog: el título nombra la tarea que se automatizaría con las palabras de los participantes (por ejemplo: Resumen semanal de pedidos por zona para el comité). En descripcion_corta di qué tarea manual dejaría de hacerse y, solo si algún participante lo escribió, cada cuánto ocurre y cuánto tiempo toma. Nunca estimes frecuencias, horas, herramientas ni ahorros que nadie escribió. Dos síntomas son el mismo si describen la misma tarea manual sobre la misma información, aunque los escriban personas de áreas distintas o con otras palabras.","etiqueta_idea":"Su síntoma: qué tarea manual le duele, cada cuánto y cuánto tiempo le toma","ejemplo_idea":"Ej.: Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas","perfiles":["Gerencia General","Comercial","Mercadeo","Cadena de Abastecimiento","Financiera","Operaciones","Desarrollo Humano y Organizacional","Tecnología"],"afinidad":{"Gerencia General":"Gerencia General","Comercial":"Comercial","Mercadeo":"Mercadeo","Cadena de Abastecimiento":"Cadena de Abastecimiento","Financiera":"Financiera","Operaciones":"Operaciones","Desarrollo Humano y Organizacional":"Desarrollo Humano y Organizacional","Tecnología":"Tecnología"}}'::jsonb)
on conflict (id) do update set nombre = excluded.nombre, empresa = excluded.empresa, facilitador = excluded.facilitador, config = excluded.config;

delete from evaluaciones where idea_id in (select id from ideas where sesion_id = 'mp-backlog');
delete from votos where idea_id in (select id from ideas where sesion_id = 'mp-backlog');
update ideas set padre_id = null where sesion_id = 'mp-backlog';
delete from ideas where sesion_id = 'mp-backlog';
delete from participantes where sesion_id = 'mp-backlog';
delete from pilares where sesion_id = 'mp-backlog';
update sesiones set etapa = 'bienvenida', etapa_ts = now(), fin_etapa = null, proyectada_id = null where id = 'mp-backlog';

insert into pilares (sesion_id, orden, nombre, icono, color, enunciado, subfrentes) values
('mp-backlog', 1, 'Gerencia General', 'fa-compass', 'green',
 '¿Qué información necesita la gerencia y hoy llega tarde, a mano o de varias fuentes? Piense en indicadores, preparación de comités, seguimiento de compromisos y decisiones entre áreas.',
 '["Indicadores","Comités","Compromisos","Decisiones entre áreas"]'),
('mp-backlog', 2, 'Comercial', 'fa-handshake', 'amber',
 '¿Qué reporte o seguimiento comercial arma a mano? Piense en pedidos, orden promedio, zonas, asesoras activas y metas. ¿Qué le preguntan siempre y le cuesta responder rápido?',
 '["Pedidos","Orden promedio","Zonas","Asesoras"]'),
('mp-backlog', 3, 'Mercadeo', 'fa-bullhorn', 'rose',
 '¿Qué tarea de mercadeo o de diseño repite cada campaña o cada catálogo y siente que podría hacerse sola? Piense en armar el catálogo, escribir briefs, adaptar piezas a muchos formatos y leer los resultados. ¿Cuál le quita más horas y cuál le genera más reprocesos?',
 '["Catálogo","Briefs","Piezas y formatos","Lectura de resultados"]'),
('mp-backlog', 4, 'Cadena de Abastecimiento', 'fa-boxes-stacked', 'blue',
 '¿Qué hace a mano cada semana o cada campaña para saber cuánto se va a vender, cuánto comprar y cuánto inventario hace falta? Piense en bajar y limpiar datos, correr el pronóstico, cruzarlo con inventario y pedir a proveedores. ¿En qué paso se pierde más tiempo?',
 '["Pronóstico de demanda","Inventario","Compras y proveedores","Datos de entrada"]'),
('mp-backlog', 5, 'Financiera', 'fa-coins', 'indigo',
 '¿Qué cuadre, conciliación o informe financiero se arma a mano? Piense en recaudos, cartera, conciliaciones, cierres y presupuesto. ¿Qué cifra le piden siempre y le cuesta tener al día?',
 '["Recaudo y cartera","Conciliaciones","Cierres","Presupuesto"]'),
('mp-backlog', 6, 'Operaciones', 'fa-truck', 'teal',
 '¿Qué pregunta o novedad le llega todos los días y se resuelve siempre igual? Piense en despachos, novedades de pedidos, devoluciones y atención a asesoras y clientas. ¿Qué se pierde entre correos y chats?',
 '["Despachos","Novedades","Atención a asesoras","Atención a clientas"]'),
('mp-backlog', 7, 'Desarrollo Humano y Organizacional', 'fa-people-group', 'purple',
 '¿Qué trámite de personas se hace a mano o en papel? Piense en novedades de nómina, ingresos y retiros, capacitación, evaluaciones y solicitudes de los colaboradores. ¿Qué pedido le llega siempre igual?',
 '["Nómina y novedades","Ingreso y retiro","Formación","Solicitudes de colaboradores"]'),
('mp-backlog', 8, 'Tecnología', 'fa-microchip', 'orange',
 '¿Qué solicitud o tarea de tecnología se atiende una por una? Piense en reportes que sacan del sistema, accesos, integraciones entre sistemas y soporte a usuarios. ¿Qué le piden todas las semanas?',
 '["Reportes del sistema","Accesos y usuarios","Integraciones","Soporte"]');

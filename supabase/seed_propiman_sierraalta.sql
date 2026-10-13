-- ============================================================
-- SESIÓN: Taller de ideación · Sierra Alta · Propiman · jueves 15-oct-2026, 10:00–12:00
-- Generado por supabase/gen_seed_propiman.js desde js/plantilla-propiman.js (no editar a mano).
-- ANTES DE CORRER: cambiar CAMBIAR_ADMIN y CAMBIAR_LIDER por claves reales.
-- Se corre en el SQL Editor del proyecto Supabase del foro (zccrvdytrmrloahnbajl).
-- Es idempotente: vuelve a dejar la sesión en bienvenida con sus pilares, sin ideas.
-- ============================================================
insert into sesiones (id, nombre, empresa, facilitador, etapa, clave_admin, clave_lider, config) values
('propiman-sierraalta', 'Taller de ideación · Sierra Alta', 'Salenza · Sierra Alta', 'Daniel Restrepo', 'bienvenida', 'CAMBIAR_ADMIN', 'CAMBIAR_LIDER',
 '{"marca":"propiman","titulo_evento":"Taller de ideación","titulo_reporte":"Backlog priorizado · Sierra Alta","votos_por_pilar":3,"minutos_ideacion":15,"minutos_matriz":10,"minutos_pausa":3,"escala_max":5,"max_calificaciones":20,"caso":"Sierra Alta empieza a administrarse con Propiman. Antes de terminar de configurarla queremos escuchar a quienes la administran todos los días: dónde se pierde tiempo, dónde se pierde información y qué le gustaría que la plataforma resolviera primero. Escriba ideas cortas, una por tarjeta: un dolor de hoy o algo que le gustaría que pasara. No hay ideas malas. Con lo que salga armamos la lista de prioridades de Propiman para Sierra Alta.","restricciones":["Sierra Alta ya está cargada en Propiman y la salida en vivo es en noviembre","Lo que salga entra a una lista de prioridades: no todo se hace ya, se ordena por impacto y esfuerzo","Hablamos de cómo se trabaja hoy, no de personas"],"instruccion_ia":"Las ideas son dolores y pedidos del equipo que administra la copropiedad, pensados para la plataforma Propiman (software de administración de propiedad horizontal). Redacta cada idea consolidada como una necesidad o funcionalidad concreta para la lista de prioridades (backlog), por ejemplo: Recordatorio automático de pago por WhatsApp. En descripcion_corta di qué resolvería para el equipo, no lo que haría una empresa.","etiqueta_idea":"Su idea: un dolor de hoy o algo que le gustaría que pasara (una o dos frases)","ejemplo_idea":"Ej.: Los residentes mandan el comprobante de pago por WhatsApp y hay que aplicarlo a mano…","perfiles":["Administración","Contabilidad / Cartera","Asistente o auxiliar administrativa","Consejo de administración","Portería / Mantenimiento","Otro"],"afinidad":{"Administración":"Control y seguimiento","Contabilidad / Cartera":"Ingreso de información","Asistente o auxiliar administrativa":"Procesos manuales","Consejo de administración":"Control y seguimiento","Portería / Mantenimiento":"Comunicación"}}'::jsonb)
on conflict (id) do update set nombre = excluded.nombre, empresa = excluded.empresa, facilitador = excluded.facilitador, config = excluded.config;

delete from evaluaciones where idea_id in (select id from ideas where sesion_id = 'propiman-sierraalta');
delete from votos where idea_id in (select id from ideas where sesion_id = 'propiman-sierraalta');
update ideas set padre_id = null where sesion_id = 'propiman-sierraalta';
delete from ideas where sesion_id = 'propiman-sierraalta';
delete from participantes where sesion_id = 'propiman-sierraalta';
delete from pilares where sesion_id = 'propiman-sierraalta';
update sesiones set etapa = 'bienvenida', etapa_ts = now(), fin_etapa = null, proyectada_id = null where id = 'propiman-sierraalta';

insert into pilares (sesion_id, orden, nombre, icono, color, enunciado, subfrentes) values
('propiman-sierraalta', 1, 'Ingreso de información', 'fa-inbox', 'blue',
 '¿Por dónde le llega hoy la información y cuántas veces la tiene que volver a escribir? Piense en extractos del banco, pagos de los residentes, Aplicamos, hojas de Excel, facturas de proveedores, papeles y correos. ¿Qué dato busca y no encuentra, o encuentra en dos lugares con valores distintos?',
 '["Pagos y recaudo","Extractos y conciliación","Facturas y proveedores","Datos de residentes e inmuebles","Documentos y soportes"]'),
('propiman-sierraalta', 2, 'Comunicación', 'fa-comments', 'green',
 '¿Qué conversaciones se le salen de las manos? Piense en el WhatsApp con residentes y propietarios, los mensajes al consejo y la coordinación con contratistas y portería. ¿Qué pregunta le hacen todos los días que podría responderse sola? ¿Qué se pierde entre tantos chats?',
 '["Residentes y propietarios","Consejo de administración","Contratistas y proveedores","Portería y personal","Circulares y avisos"]'),
('propiman-sierraalta', 3, 'Procesos manuales', 'fa-hand', 'purple',
 '¿Qué tarea repite cada semana o cada mes y siente que podría hacerse sola? Piense en cuentas de cobro, paz y salvos, recordatorios de pago, reservas de zonas comunes, actas, cartas y reportes. ¿Cuál le quita más horas y cuál le genera más errores?',
 '["Cobro y cartera","Certificados y paz y salvos","Reservas y zonas comunes","Mantenimiento y órdenes de trabajo","Cartas, actas y reportes"]'),
('propiman-sierraalta', 4, 'Control y seguimiento', 'fa-list-check', 'teal',
 '¿Cómo sabe hoy qué está pendiente, qué se atrasó y por qué? Piense en el informe al consejo, el plan de mantenimiento presupuestado, las PQRS con plazo legal y los compromisos de las reuniones. ¿Qué le preguntan el consejo o los propietarios que hoy le cuesta responder con datos?',
 '["Informe al consejo","Mantenimiento y presupuesto","PQRS y plazos legales","Compromisos y pendientes","Cartera y morosidad"]'),
('propiman-sierraalta', 5, 'Otros', 'fa-lightbulb', 'amber',
 '¿Qué no cabe en los otros pilares y vale la pena decirlo? Ideas sueltas, algo que hacía otra herramienta y extrañaría, o lo que nadie se ha atrevido a pedir.',
 '[]');

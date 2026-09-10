-- ============================================================
-- SESIÓN: Foro Impercap · viernes 11-sep-2026, 2:00 pm, Estrella Estéreo
-- CAMBIAR las claves antes de correr.
-- ============================================================
insert into sesiones (id, nombre, empresa, facilitador, etapa, clave_admin, clave_lider, config) values
('impercap', 'Foro de ideación · Impercap', 'Impercap', 'Daniel Restrepo', 'bienvenida', 'impercap2026', 'pilar2026',
 '{"votos_por_pilar": 3, "minutos_ideacion": 10, "minutos_matriz": 8, "minutos_pausa": 5, "caso": "Impercap lleva más de 10 años fabricando impermeables para moto en Medellín. En 2025 creció 49%, pero en 2026 el fenómeno de El Niño secó la demanda: hoy vende cerca de la mitad de lo que necesita para cubrir sus costos y la caja alcanza para pocos meses. El reto de este foro: ideas que le den ventas y aire financiero en los próximos 3 a 6 meses, desde Mercadeo y Ventas, Financiero, Estructura y Cultura, Operaciones y Otros.", "restricciones": ["Caja limitada: no hay flujo para indemnizar ni para contratar sin retorno rápido", "Un vendedor tarda ~3 meses en volverse rentable", "El clima vuelve a favor ~febrero: el corto plazo es sobrevivir y llegar al punto de equilibrio", "Puede haber activos vendibles o una línea de crédito: preguntar antes de asumir"], "escala_max": 5}'::jsonb)
on conflict (id) do update set nombre = excluded.nombre, config = excluded.config;

delete from pilares where sesion_id = 'impercap';
insert into pilares (sesion_id, orden, nombre, icono, color, enunciado, subfrentes) values
('impercap', 1, 'Mercadeo y Ventas', 'fa-bullhorn', 'blue',
 'El producto principal (impermeables para moto) no se está demandando por el fenómeno de El Niño. Impercap está sobre-indexada donde hoy no llueve y casi no vende donde sí llueve (Pacífico, Cali). ¿Cómo inyectar ventas en los próximos 3-6 meses?',
 '["Cobertura geográfica", "Diversificación de productos", "Desarrollo del cliente actual", "Clientes nuevos", "Canal digital / IA"]'),
('impercap', 2, 'Financiero', 'fa-coins', 'green',
 'Con ventas de ~$120-130M/mes el costo de personal pasó de ~30% a ~50% de las ventas; el gasto de mercadeo es 0,3%. La caja está apretada. ¿Cómo optimizar la estructura de costos y gastos y financiar la travesía hasta que vuelva la lluvia?',
 '["Estructura de costos y gastos", "Caja y financiación", "Activos y capital de trabajo"]'),
('impercap', 3, 'Estructura y Cultura', 'fa-people-group', 'purple',
 'Equipo de ~12 personas apalancado en producción y administración; el brazo comercial se debilitó (renunciaron 2 vendedoras y el de mercadeo) mientras se apostaba a agentes de IA. ¿Cómo reorganizar el equipo y activar su capacidad de reinventarse? (Ej. ilustrativo: cofinanciar formación tipo Platzi 50/50 para activar ideas desde todos los niveles.)',
 '["Fuerza comercial", "Roles y estructura", "Cultura y capacidad de reinvención"]'),
('impercap', 4, 'Operaciones', 'fa-gears', 'teal',
 'Planta, compras, logística y capacidad instalada. Con la demanda a la mitad, ¿cómo usar la maquinaria, el equipo y los proveedores para bajar costos, fabricar otras cosas o servir a nuevos clientes?',
 '["Capacidad y planta", "Compras y proveedores", "Logística y entregas", "Calidad y procesos"]'),
('impercap', 5, 'Otros', 'fa-lightbulb', 'amber',
 'Dibujo libre: contactos, alianzas, ideas disruptivas u obviedades que no caben en los otros pilares.',
 '[]');

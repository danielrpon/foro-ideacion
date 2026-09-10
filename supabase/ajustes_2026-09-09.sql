-- ============================================================
-- AJUSTES 2026-09-09 · Foro Impercap (correr en el SQL Editor del proyecto zccrvdytrmrloahnbajl)
-- Sale de la reunión del 09-sep: pilar Operaciones + texto de bienvenida centrado en el problema.
-- Es idempotente: se puede correr más de una vez.
-- ============================================================

-- 1) Pilar Operaciones (orden 4) y Otros pasa a orden 5
update pilares set orden = 5 where sesion_id = 'impercap' and nombre = 'Otros';
insert into pilares (sesion_id, orden, nombre, icono, color, enunciado, subfrentes)
select 'impercap', 4, 'Operaciones', 'fa-gears', 'teal',
 'Planta, compras, logística y capacidad instalada. Con la demanda a la mitad, ¿cómo usar la maquinaria, el equipo y los proveedores para bajar costos, fabricar otras cosas o servir a nuevos clientes?',
 '["Capacidad y planta", "Compras y proveedores", "Logística y entregas", "Calidad y procesos"]'::jsonb
where not exists (select 1 from pilares where sesion_id = 'impercap' and nombre = 'Operaciones');

-- 2) Texto del caso (bienvenida en celular y muro; también lo lee la IA) y escala 1–5
update sesiones set config = config || jsonb_build_object(
  'caso', 'Impercap lleva más de 10 años fabricando impermeables para moto en Medellín. En 2025 creció 49%, pero en 2026 el fenómeno de El Niño secó la demanda: hoy vende cerca de la mitad de lo que necesita para cubrir sus costos y la caja alcanza para pocos meses. El reto de este foro: ideas que le den ventas y aire financiero en los próximos 3 a 6 meses, desde Mercadeo y Ventas, Financiero, Estructura y Cultura, Operaciones y Otros.',
  'escala_max', 5
) where id = 'impercap';

-- 3) Verificación
select orden, nombre, color, icono, subfrentes from pilares where sesion_id = 'impercap' order by orden;
select config->>'caso' as caso, config->>'escala_max' as escala from sesiones where id = 'impercap';

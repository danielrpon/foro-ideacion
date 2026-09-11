-- ============================================================
-- SESIÓN: Foro Impercap · viernes 11-sep-2026, 2:00 pm, Estrella Estéreo
-- CAMBIAR las claves antes de correr.
-- ============================================================
insert into sesiones (id, nombre, empresa, facilitador, etapa, clave_admin, clave_lider, config) values
('impercap', 'Foro de ideación · Impercap', 'Impercap', 'Daniel Restrepo', 'bienvenida', 'impercap2026', 'pilar2026',
 '{"votos_por_pilar": 3, "minutos_ideacion": 10, "minutos_matriz": 8, "minutos_pausa": 5, "caso": "Impercap (Impermeables Vélez y Forero SAS) lleva más de 10 años fabricando impermeables para moto en plástico reciclado en Medellín. En 2025 vendió $2.734M (+50%) y enero–abril de 2026 iba +32%. Con El Niño, de mayo a agosto la venta cayó 40%: $153M/mes frente a ~$250M que necesita para cubrir sus costos; enero a julio ya acumula pérdidas por $178M, con 37 personas en nómina y la caja para pocos meses. El reto del foro: ideas que den ventas y aire financiero en los próximos 3 a 6 meses, desde Mercadeo y Ventas, Financiero, Estructura y Cultura, Operaciones y Otros.", "restricciones": ["Caja limitada: no hay flujo para indemnizar ni para contratar sin retorno rápido", "Un vendedor tarda ~3 meses en volverse rentable", "El clima vuelve a favor ~febrero: el corto plazo es sobrevivir y llegar al punto de equilibrio", "Puede haber activos vendibles o una línea de crédito: preguntar antes de asumir"], "escala_max": 5, "max_calificaciones": 8}'::jsonb)
on conflict (id) do update set nombre = excluded.nombre, config = excluded.config;

delete from pilares where sesion_id = 'impercap';
insert into pilares (sesion_id, orden, nombre, icono, color, enunciado, subfrentes) values
('impercap', 1, 'Mercadeo y Ventas', 'fa-bullhorn', 'blue',
 '¿Cómo inyectar ventas en los próximos 3 a 6 meses mientras no llueve en Antioquia? ¿A quién le sigue lloviendo y cómo llegar allá rápido? ¿Qué le podemos vender al cliente que ya nos compra, aunque no sea impermeable? Datos: 2025 cerró en $2.734M (+50%); enero a abril de 2026 iba +32% y de mayo a agosto cayó 40%, a $153M/mes. Antioquia es el 61% de las unidades, Bogotá 9%, el Pacífico casi nada. Dos cuentas grandes son cerca del 40% de la venta. Unos 500 clientes atendidos por un vendedor, una auxiliar y un practicante.',
 '["Cobertura geográfica", "Diversificación de productos", "Desarrollo del cliente actual", "Clientes nuevos", "Canal digital / IA"]'),
('impercap', 2, 'Financiero', 'fa-coins', 'green',
 '¿Cómo aguantar hasta febrero con la venta a la mitad? ¿Qué gasto se puede pausar o volver variable sin romper la operación? ¿De dónde sale caja rápida sin endeudarse más? Datos: el equilibrio está cerca de $250M/mes; de mayo a agosto se vendieron $153M/mes. La estructura es casi toda fija: el costo de producción pasó de ~64% de la venta (enero–abril) a más del 100% en mayo y julio. Enero–julio de 2026 deja pérdida operativa de $76M y neta de $178M; los gastos financieros son ~$15M/mes. Publicidad es 3,7% de la venta (11% con su personal). El margen sobre costo directo de los impermeables es alto (55–65%); el de las líneas institucionales, bajo. Hay deuda financiera y la caja alcanza para pocos meses.',
 '["Estructura de costos y gastos", "Caja y financiación", "Activos y capital de trabajo"]'),
('impercap', 3, 'Estructura y Cultura', 'fa-people-group', 'purple',
 '¿Cómo reorganizar 37 personas para vender más con la misma nómina? ¿Quién de planta podría estar hoy vendiendo, atendiendo clientes o despachando? ¿Cómo activar ideas y compromiso del equipo en plena crisis? Datos: estructura transversal, no piramidal: 24 operarios, coordinador de producción, líder de operaciones, dos de logística, líder general, líder de mercadeo, una auxiliar administrativa comercial, un vendedor, un practicante y una auxiliar administrativa. El brazo comercial son cuatro personas para unos 500 clientes y se debilitó este año.',
 '["Fuerza comercial", "Roles y estructura", "Cultura y capacidad de reinvención"]'),
('impercap', 4, 'Operaciones', 'fa-gears', 'teal',
 '¿Qué se puede fabricar o hacer con media planta parada? ¿Qué maquila, producto o servicio cabe en la capacidad y el material que ya tenemos? ¿Cómo bajar el costo por unidad sin sacrificar calidad? Datos: planta en Medellín con 24 operarios y materia prima de plástico 100% reciclado. En abril despachó 56.000 unidades; de mayo a agosto, 28.000 al mes. Unas 25 referencias: impermeables, ponchos, gabanes, botas, delantales y batas. Hoy también puede fabricar pijamas para carro, moto de carga, bicicleta y lavadora, portacascos, pantalones, capa para mascota, bolsas de empaque personalizadas, estampado de tela y delantales infantiles. Logística de dos personas.',
 '["Capacidad y planta", "Compras y proveedores", "Logística y entregas", "Calidad y procesos"]'),
('impercap', 5, 'Otros', 'fa-lightbulb', 'amber',
 '¿Qué alianza, contacto o idea rara podría mover la aguja y no cabe en los otros pilares? ¿Con quién deberíamos hablar la próxima semana? Aquí van contactos concretos, alianzas, canales inesperados y obviedades que nadie ha dicho.',
 '[]');

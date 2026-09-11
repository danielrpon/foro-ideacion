-- ============================================================
-- AJUSTES 2026-09-10 (6) · Texto del caso (bienvenida en celular y muro; lo lee la IA)
-- Producción tenía todavía "40 personas"; fija el texto completo con 37 personas y las pérdidas ene–jul. Idempotente.
-- ============================================================
update sesiones set config = config || jsonb_build_object('caso', 'Impercap (Impermeables Vélez y Forero SAS) lleva más de 10 años fabricando impermeables para moto en plástico reciclado en Medellín. En 2025 vendió $2.734M (+50%) y enero–abril de 2026 iba +32%. Con El Niño, de mayo a agosto la venta cayó 40%: $153M/mes frente a ~$250M que necesita para cubrir sus costos; enero a julio ya acumula pérdidas por $178M, con 37 personas en nómina y la caja para pocos meses. El reto del foro: ideas que den ventas y aire financiero en los próximos 3 a 6 meses, desde Mercadeo y Ventas, Financiero, Estructura y Cultura, Operaciones y Otros.') where id = 'impercap';
select config->>'caso' as caso from sesiones where id = 'impercap';

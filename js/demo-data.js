/* ============================================================
   DEMO — carga de práctica: 5 participantes y 50 ideas sobre el caso
   Impercap. Se dispara desde Admin › Control › "Cargar demo".
   Funciona en producción (Supabase) y en el modo local.
   ============================================================ */
window.DEMO = {
  participantes: [
    ['Demo · Ana Restrepo', 'Mercadeo / Ventas'], ['Demo · Carlos Mejía', 'Finanzas / Inversión'], ['Demo · Laura Gómez', 'Gente / Cultura'],
    ['Demo · Felipe Ríos', 'Operaciones / Cadena de abastecimiento'], ['Demo · Marcela Duque', 'Digital / Tecnología / IA']
  ],
  /* [pilar, subfrente, texto, índice del participante] */
  ideas: [
    ['Mercadeo y Ventas', 'Cobertura geográfica', 'Contratar un vendedor de campo para Cali y el Pacífico con fijo bajo y comisión alta', 0],
    ['Mercadeo y Ventas', 'Cobertura geográfica', 'Abrir un distribuidor en Cali y Buenaventura donde sí está lloviendo', 1],
    ['Mercadeo y Ventas', 'Cobertura geográfica', 'Llevar producto a Chocó, Buenaventura y Tumaco con un aliado logístico local', 3],
    ['Mercadeo y Ventas', 'Cobertura geográfica', 'Vendedor freelance por comisión en Bogotá aprovechando que ya hay 9% de ventas allá', 2],
    ['Mercadeo y Ventas', 'Desarrollo del cliente actual', 'Negociar con Distracom y el Grupo Éxito exhibición adicional de impermeables en caja durante lluvias', 0],
    ['Mercadeo y Ventas', 'Desarrollo del cliente actual', 'Plan de puntos o descuento por volumen para las estaciones de servicio que más compran', 1],
    ['Mercadeo y Ventas', 'Desarrollo del cliente actual', 'Llamar uno a uno a los 50 clientes que compraron en 2025 y no han comprado en 2026', 4],
    ['Mercadeo y Ventas', 'Clientes nuevos', 'Vender dotación con franjas reflectivas a empresas mineras y de construcción', 3],
    ['Mercadeo y Ventas', 'Clientes nuevos', 'Ofrecer impermeables de marca propia a las apps de domicilios (Rappi, Didi) para sus repartidores', 2],
    ['Mercadeo y Ventas', 'Clientes nuevos', 'Entrar a colegios y universidades con capas para estudiantes en temporada escolar', 4],
    ['Mercadeo y Ventas', 'Diversificación de productos', 'Producir sombrillas o toldos de sombra para motociclistas en tiempo seco', 0],
    ['Mercadeo y Ventas', 'Diversificación de productos', 'Línea de delantales y batas para restaurantes y plantas de alimentos', 3],
    ['Mercadeo y Ventas', 'Diversificación de productos', 'Capa para mascotas y forros para maletas de moto que se vendan todo el año', 1],
    ['Mercadeo y Ventas', 'Canal digital / IA', 'Vender por Mercado Libre y Temu con envío nacional', 2],
    ['Mercadeo y Ventas', 'Canal digital / IA', 'Campañas en Instagram y TikTok dirigidas a motociclistas cuando el pronóstico anuncie lluvia', 2],
    ['Mercadeo y Ventas', 'Canal digital / IA', 'Bot de WhatsApp con IA que reciba pedidos de distribuidores y responda fichas técnicas', 4],
    ['Mercadeo y Ventas', 'Clientes nuevos', 'Vender en eventos deportivos de madrugada (running, ciclismo) capas para el frío', 3],
    ['Mercadeo y Ventas', 'Desarrollo del cliente actual', 'Kit de exhibición en las estaciones de servicio con precio visible y ganchos', 0],
    ['Financiero', 'Caja y financiación', 'Renegociar plazos de pago con proveedores de materia prima a 60 o 90 días', 1],
    ['Financiero', 'Caja y financiación', 'Pedir anticipo del 30% a los clientes grandes a cambio de descuento', 0],
    ['Financiero', 'Caja y financiación', 'Factoring de las facturas del Grupo Éxito y Distracom para adelantar caja', 1],
    ['Financiero', 'Caja y financiación', 'Buscar un inversionista o socio que ponga capital de trabajo por participación', 4],
    ['Financiero', 'Estructura de costos y gastos', 'Reducir jornada a cuatro días en producción mientras dura el verano', 2],
    ['Financiero', 'Estructura de costos y gastos', 'Congelar contrataciones y horas extra hasta febrero', 1],
    ['Financiero', 'Estructura de costos y gastos', 'Revisar el arriendo y servicios de la planta y negociar rebaja temporal', 3],
    ['Financiero', 'Activos y capital de trabajo', 'Vender el inventario lento y las referencias descontinuadas con descuento agresivo', 0],
    ['Financiero', 'Activos y capital de trabajo', 'Alquilar la maquinaria ociosa a otros fabricantes de plástico', 3],
    ['Financiero', 'Caja y financiación', 'Línea de crédito rotativa con Bancóldex o el Fondo Nacional de Garantías para la temporada', 2],
    ['Estructura y Cultura', 'Fuerza comercial', 'Pasar dos operarios con habilidad comercial a ventas telefónicas durante el verano', 2],
    ['Estructura y Cultura', 'Fuerza comercial', 'Contratar vendedores por comisión pura sin costo fijo', 0],
    ['Estructura y Cultura', 'Roles y estructura', 'Que el líder de operaciones asuma logística y compras para liberar al gerente para vender', 3],
    ['Estructura y Cultura', 'Roles y estructura', 'Definir un responsable único de mercadeo digital aunque sea medio tiempo', 4],
    ['Estructura y Cultura', 'Cultura y capacidad de reinvención', 'Cofinanciar cursos de Platzi 50/50 para que el equipo proponga mejoras', 2],
    ['Estructura y Cultura', 'Cultura y capacidad de reinvención', 'Reunión semanal de 15 minutos donde cada área trae una idea para vender más', 1],
    ['Estructura y Cultura', 'Cultura y capacidad de reinvención', 'Bono colectivo si la planta llega al punto de equilibrio en el mes', 1],
    ['Estructura y Cultura', 'Fuerza comercial', 'Convertir al practicante del SENA en gestor de redes sociales con metas', 4],
    ['Operaciones', 'Capacidad y planta', 'Maquilar bolsas y empaques para hard discounts con la capacidad ociosa', 3],
    ['Operaciones', 'Capacidad y planta', 'Ofrecer servicio de maquila de marca propia a otras marcas de impermeables', 3],
    ['Operaciones', 'Compras y proveedores', 'Comprar materia prima por lotes más pequeños para no inmovilizar caja', 1],
    ['Operaciones', 'Compras y proveedores', 'Buscar un segundo proveedor de PEMD reciclado y licitar precio', 0],
    ['Operaciones', 'Logística y entregas', 'Consolidar despachos por zona una vez por semana para bajar el costo logístico', 3],
    ['Operaciones', 'Logística y entregas', 'Usar transportadoras de pago contra entrega para clientes pequeños nuevos', 2],
    ['Operaciones', 'Calidad y procesos', 'Ciclos Kaizen quincenales para bajar desperdicio de materia prima', 3],
    ['Operaciones', 'Capacidad y planta', 'Producir en verano el inventario de la temporada de lluvias para no perder ventas en febrero', 4],
    ['Operaciones', 'Calidad y procesos', 'Estandarizar las 8 referencias que más venden y pausar las de bajo margen', 0],
    ['Otros', null, 'Alianza con escuelas de conducción de moto para regalar capa con el curso', 4],
    ['Otros', null, 'Convenio con las alcaldías para campañas de seguridad vial con capas reflectivas', 2],
    ['Otros', null, 'Exportar a Ecuador y Perú donde la temporada de lluvias es distinta', 0],
    ['Otros', null, 'Alianza con marcas de motos (Yamaha, AKT) para incluir la capa en la compra de la moto', 1],
    ['Otros', null, 'Programa de reciclaje: el cliente devuelve la capa vieja y recibe descuento en la nueva', 3]
  ],
  /* Carga todo. Requiere sesión de admin (cambia la etapa a Ideación si hace falta, porque la base
     solo acepta ideas nuevas en esa etapa). onProgress(texto) es opcional. */
  async cargar(snap, onProgress = () => {}) {
    const byName = {}; snap.pilares.forEach(p => byName[p.nombre.trim().toLowerCase()] = p);
    const pil = (n) => byName[n.toLowerCase()] || byName['otros'] || snap.pilares[snap.pilares.length - 1];
    if (snap.sesion.etapa !== 'ideacion') { onProgress('Abriendo la etapa de ideación…'); await DB.admin('cambiar_etapa', { etapa: 'ideacion', minutos: 0 }); }
    onProgress('Registrando 5 participantes…');
    const parts = []; for (const [nombre, perfil] of this.participantes) parts.push(await DB.registrar(nombre, perfil));
    const filas = this.ideas.map(([pn, sf, texto, w]) => { const p = pil(pn); return { pilar_id: p.id, subfrente: sf && (p.subfrentes || []).includes(sf) ? sf : null, participante_id: parts[w].id, participante_nombre: parts[w].nombre, texto }; });
    onProgress('Enviando 50 ideas…');
    if (DB.crearIdeas) await DB.crearIdeas(filas); else for (const f of filas) await DB.crearIdea(f);
    return { participantes: parts.length, ideas: filas.length };
  }
};

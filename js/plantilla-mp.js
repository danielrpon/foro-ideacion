/* ============================================================
   PLANTILLA · Grupo MP (Marketing Personal) · Nivel 05 de IA-abilities: Backlog de ideación
   Sesión con la gerencia general y los directores: cada quien sube los síntomas
   (tareas manuales que le duelen), la IA los consolida en automatizaciones
   candidatas y la matriz impacto × esfuerzo deja el backlog priorizado.
   Fuente única del contenido: la usan el modo demo local (js/db.js) y el
   generador del seed SQL (supabase/gen_seed.js mp).
   Pilares = las ocho direcciones de MP (lista de Orfa, 4-nov-2026). Si cambian, editar aquí y regenerar.
   ============================================================ */
(function (root) {
  const P = {
    id: 'mp-backlog',
    nombre: 'Backlog de ideación · Grupo MP',
    empresa: 'Grupo MP',
    facilitador: 'Daniel Restrepo · Juan Gonzalo Tamayo',
    config: {
      titulo_evento: 'Backlog de ideación',
      logo_empresa: 'img/grupomp_logo.png',  /* logo claro para fondo oscuro; si el archivo no está, se muestra el nombre en texto */
      sin_lider: true,  /* sin líderes de pilar: la depuración la hace la consolidación MECE con revisión del facilitador */
      titulo_reporte: 'Backlog priorizado de automatización',
      votos_por_pilar: 3, minutos_ideacion: 10, minutos_matriz: 12, minutos_pausa: 5, escala_max: 5, max_calificaciones: 12,
      caso: 'Después de cuatro niveles de IA-abilities, la gerencia y los directores deciden qué se automatiza primero. Escribe síntomas: tareas manuales que te duelen a ti o a tu equipo. Un buen síntoma dice qué tarea, cada cuánto y cuánto tiempo toma. Ejemplo: Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas. Un síntoma por tarjeta. Con lo que salga armamos el backlog: la lista de automatizaciones ordenada por prioridad.',
      restricciones: [
        'Hablamos de tareas y procesos, no de personas',
        'No escribas datos reales de clientas ni asesoras (nombres, cédulas, teléfonos)',
        'Lo que salga se ordena por impacto y esfuerzo: no todo se hace ya'
      ],
      instruccion_ia: 'Las ideas son SÍNTOMAS: tareas manuales que le duelen a un área de Grupo MP (venta directa por catálogo con asesoras). Cada idea consolidada es una AUTOMATIZACIÓN CANDIDATA para el backlog: el título nombra la tarea que se automatizaría con las palabras de los participantes (por ejemplo: Resumen semanal de pedidos por zona para el comité). En descripcion_corta di qué tarea manual dejaría de hacerse y, solo si algún participante lo escribió, cada cuánto ocurre y cuánto tiempo toma. Nunca estimes frecuencias, horas, herramientas ni ahorros que nadie escribió. Dos síntomas son el mismo si describen la misma tarea manual sobre la misma información, aunque los escriban personas de áreas distintas o con otras palabras.',
      etiqueta_idea: 'Tu síntoma: qué tarea manual te duele, cada cuánto y cuánto tiempo te toma',
      ejemplo_idea: 'Ej.: Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas',
      perfiles: ['Gerencia General', 'Comercial', 'Mercadeo', 'Cadena de Abastecimiento', 'Financiera', 'Operaciones', 'Desarrollo Humano y Organizacional', 'Tecnología'],
      /* Rol → pilar que se abre primero: cada dirección arranca en su propio pilar (luego cada quien escribe donde quiera) */
      afinidad: {
        'Gerencia General': 'Gerencia General', 'Comercial': 'Comercial', 'Mercadeo': 'Mercadeo',
        'Cadena de Abastecimiento': 'Cadena de Abastecimiento', 'Financiera': 'Financiera', 'Operaciones': 'Operaciones',
        'Desarrollo Humano y Organizacional': 'Desarrollo Humano y Organizacional', 'Tecnología': 'Tecnología'
      }
    },
    pilares: [
      { orden: 1, nombre: 'Gerencia General', icono: 'fa-compass', color: 'green',
        enunciado: '¿Qué información necesita la gerencia y hoy llega tarde, a mano o de varias fuentes? Piensa en indicadores, preparación de comités, seguimiento de compromisos y decisiones entre áreas.',
        subfrentes: ['Indicadores', 'Comités', 'Compromisos', 'Decisiones entre áreas'] },
      { orden: 2, nombre: 'Comercial', icono: 'fa-handshake', color: 'amber',
        enunciado: '¿Qué reporte o seguimiento comercial arma a mano? Piensa en pedidos, orden promedio, zonas, asesoras activas y metas. ¿Qué te preguntan siempre y te cuesta responder rápido?',
        subfrentes: ['Pedidos', 'Orden promedio', 'Zonas', 'Asesoras'] },
      { orden: 3, nombre: 'Mercadeo', icono: 'fa-bullhorn', color: 'rose',
        enunciado: '¿Qué tarea de mercadeo o de diseño repite cada campaña o cada catálogo y siente que podría hacerse sola? Piensa en armar el catálogo, escribir briefs, adaptar piezas a muchos formatos y leer los resultados. ¿Cuál te quita más horas y cuál te genera más reprocesos?',
        subfrentes: ['Catálogo', 'Briefs', 'Piezas y formatos', 'Lectura de resultados'] },
      { orden: 4, nombre: 'Cadena de Abastecimiento', icono: 'fa-boxes-stacked', color: 'blue',
        enunciado: '¿Qué hace a mano cada semana o cada campaña para saber cuánto se va a vender, cuánto comprar y cuánto inventario hace falta? Piensa en bajar y limpiar datos, correr el pronóstico, cruzarlo con inventario y pedir a proveedores. ¿En qué paso se pierde más tiempo?',
        subfrentes: ['Pronóstico de demanda', 'Inventario', 'Compras y proveedores', 'Datos de entrada'] },
      { orden: 5, nombre: 'Financiera', icono: 'fa-coins', color: 'indigo',
        enunciado: '¿Qué cuadre, conciliación o informe financiero se arma a mano? Piensa en recaudos, cartera, conciliaciones, cierres y presupuesto. ¿Qué cifra te piden siempre y te cuesta tener al día?',
        subfrentes: ['Recaudo y cartera', 'Conciliaciones', 'Cierres', 'Presupuesto'] },
      { orden: 6, nombre: 'Operaciones', icono: 'fa-truck', color: 'teal',
        enunciado: '¿Qué pregunta o novedad te llega todos los días y se resuelve siempre igual? Piensa en despachos, novedades de pedidos, devoluciones y atención a asesoras y clientas. ¿Qué se pierde entre correos y chats?',
        subfrentes: ['Despachos', 'Novedades', 'Atención a asesoras', 'Atención a clientas'] },
      { orden: 7, nombre: 'Desarrollo Humano y Organizacional', icono: 'fa-people-group', color: 'purple',
        enunciado: '¿Qué trámite de personas se hace a mano o en papel? Piensa en novedades de nómina, ingresos y retiros, capacitación, evaluaciones y solicitudes de los colaboradores. ¿Qué pedido te llega siempre igual?',
        subfrentes: ['Nómina y novedades', 'Ingreso y retiro', 'Formación', 'Solicitudes de colaboradores'] },
      { orden: 8, nombre: 'Tecnología', icono: 'fa-microchip', color: 'orange',
        enunciado: '¿Qué solicitud o tarea de tecnología se atiende una por una? Piensa en reportes que sacan del sistema, accesos, integraciones entre sistemas y soporte a usuarios. ¿Qué te piden todas las semanas?',
        subfrentes: ['Reportes del sistema', 'Accesos y usuarios', 'Integraciones', 'Soporte'] }
    ],
    /* Demo de ensayo (Admin › Control › Cargar demo). Ficticio. Trae a propósito síntomas repetidos con
       otras palabras y entre áreas, para ver que la consolidación los junte. */
    demo: {
      participantes: [['Demo · Gerente', 'Gerencia General'], ['Demo · Comercial', 'Comercial'], ['Demo · Mercadeo', 'Mercadeo'], ['Demo · Abastecimiento', 'Cadena de Abastecimiento'], ['Demo · Financiera', 'Financiera'], ['Demo · Operaciones', 'Operaciones'], ['Demo · Desarrollo Humano', 'Desarrollo Humano y Organizacional'], ['Demo · Tecnología', 'Tecnología']],
      ideas: [
        ['Gerencia General', 'Comités', 'Preparar el comité semanal: pedir a cada área sus cifras y armar la presentación', 0],
        ['Gerencia General', 'Indicadores', 'No tenemos un tablero de indicadores; cada quien trae sus números en un formato distinto', 0],
        ['Gerencia General', 'Compromisos', 'Los compromisos del comité quedan en el acta y nadie les hace seguimiento', 0],
        ['Gerencia General', 'Comités', 'El resumen de pedidos por zona para el comité de los lunes se arma a mano', 0],
        ['Comercial', 'Pedidos', 'Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas', 1],
        ['Comercial', 'Zonas', 'El informe semanal de ventas por zona lo hacemos copiando y pegando del sistema', 1],
        ['Comercial', 'Asesoras', 'Saber qué asesoras dejaron de pedir esta campaña exige cruzar dos reportes', 1],
        ['Comercial', 'Asesoras', 'Mandar a cada líder la lista de sus asesoras inactivas para que las llame', 1],
        ['Mercadeo', 'Catálogo', 'Cada campaña armamos a mano el listado de productos y precios del catálogo desde tres Excel', 2],
        ['Mercadeo', 'Briefs', 'Escribir el brief de cada pieza desde cero, siempre con la misma estructura', 2],
        ['Mercadeo', 'Briefs', 'Los briefs llegan incompletos y hay que devolverlos varias veces', 2],
        ['Mercadeo', 'Piezas y formatos', 'Adaptar la misma pieza a historia, post, WhatsApp y catálogo, una por una', 2],
        ['Mercadeo', 'Piezas y formatos', 'Sacar cada arte en cinco tamaños distintos para redes', 2],
        ['Mercadeo', 'Lectura de resultados', 'Al cierre de campaña bajo las ventas por producto y armo la presentación de resultados a mano: un día entero', 2],
        ['Cadena de Abastecimiento', 'Datos de entrada', 'Cada semana descargo los pedidos y los limpio a mano antes de correr el modelo', 3],
        ['Cadena de Abastecimiento', 'Datos de entrada', 'Juntar los datos de ventas de varias fuentes antes del pronóstico: 4 horas semanales', 3],
        ['Cadena de Abastecimiento', 'Inventario', 'Cruzar el pronóstico con el inventario disponible es manual y se hace tarde', 3],
        ['Financiera', 'Recaudo y cartera', 'Cada día concilio a mano los pagos de las asesoras contra el extracto del banco', 4],
        ['Financiera', 'Recaudo y cartera', 'Cruzar las consignaciones con la cartera de cada asesora se hace en Excel', 4],
        ['Financiera', 'Cierres', 'Para el cierre del mes pido reportes a varias áreas y los junto a mano', 4],
        ['Operaciones', 'Atención a asesoras', 'Las asesoras preguntan todo el día por WhatsApp dónde está su pedido', 5],
        ['Operaciones', 'Despachos', 'Responder a mano el estado de cada despacho que preguntan las asesoras', 5],
        ['Operaciones', 'Novedades', 'Las novedades de pedidos (faltantes, cambios) se registran en un Excel compartido y se pierden', 5],
        ['Desarrollo Humano y Organizacional', 'Nómina y novedades', 'Las áreas mandan las novedades de nómina por correo y las consolido a mano', 6],
        ['Desarrollo Humano y Organizacional', 'Formación', 'El seguimiento de quién hizo cada capacitación se lleva en una hoja de cálculo', 6],
        ['Tecnología', 'Reportes del sistema', 'Cada semana las áreas piden reportes del sistema y los saco uno por uno', 7],
        ['Tecnología', 'Accesos y usuarios', 'Las solicitudes de acceso llegan por correo y WhatsApp sin un registro', 7]
      ],
      titulos: {
        'Gerencia General|Comités': ['Comité semanal preparado solo', 'Cifras de las áreas reunidas sin pedirlas.'],
        'Gerencia General|Indicadores': ['Tablero único de indicadores', 'Un formato y una fuente para los números.'],
        'Gerencia General|Compromisos': ['Seguimiento de compromisos del comité', 'Cada compromiso con responsable y fecha.'],
        'Comercial|Pedidos': ['Resumen de pedidos por zona para el comité', 'El resumen de los lunes sale solo.'],
        'Comercial|Zonas': ['Informe semanal de ventas por zona', 'Sin copiar y pegar del sistema.'],
        'Comercial|Asesoras': ['Asesoras inactivas por líder', 'Lista de quién dejó de pedir, enviada a cada líder.'],
        'Mercadeo|Catálogo': ['Precios y productos del catálogo desde una sola fuente', 'Dejar de armar a mano el listado del catálogo en cada campaña.'],
        'Mercadeo|Briefs': ['Brief de piezas con plantilla completa', 'El brief sale con la misma estructura y sin devoluciones.'],
        'Mercadeo|Piezas y formatos': ['Una pieza, todos los formatos', 'Adaptar el arte a cada tamaño y canal sin hacerlo uno por uno.'],
        'Mercadeo|Lectura de resultados': ['Presentación de resultados de campaña', 'Ventas por producto al cierre sin armarlas a mano.'],
        'Cadena de Abastecimiento|Datos de entrada': ['Datos de ventas listos para el pronóstico', 'Descargar, juntar y limpiar los pedidos sin trabajo manual.'],
        'Cadena de Abastecimiento|Inventario': ['Pronóstico cruzado con inventario', 'El cruce se hace a tiempo y sin pasos manuales.'],
        'Financiera|Recaudo y cartera': ['Conciliación de pagos de asesoras', 'Pagos y cartera cruzados sin hacerlo a mano.'],
        'Financiera|Cierres': ['Cierre mensual con reportes reunidos', 'Los reportes de las áreas llegan juntos al cierre.'],
        'Operaciones|Atención a asesoras': ['Estado del pedido sin preguntar', 'La asesora consulta dónde está su pedido.'],
        'Operaciones|Despachos': ['Estado de despachos a la mano', 'Respuestas de estado sin buscarlas una por una.'],
        'Operaciones|Novedades': ['Registro de novedades con seguimiento', 'Faltantes y cambios que no se pierden.'],
        'Desarrollo Humano y Organizacional|Nómina y novedades': ['Novedades de nómina en un solo lugar', 'Sin consolidar correos a mano.'],
        'Desarrollo Humano y Organizacional|Formación': ['Registro de capacitaciones', 'Quién hizo qué, sin hoja de cálculo.'],
        'Tecnología|Reportes del sistema': ['Reportes del sistema por autoservicio', 'Las áreas sacan sus reportes sin pedirlos.'],
        'Tecnología|Accesos y usuarios': ['Solicitudes de acceso con registro', 'Cada solicitud con estado y responsable.']
      }
    }
  };
  root.PLANTILLAS = Object.assign(root.PLANTILLAS || {}, { [P.id]: P });
  if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);

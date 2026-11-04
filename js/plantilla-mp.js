/* ============================================================
   PLANTILLA · Grupo MP (Marketing Personal) · Nivel 05 de IA-abilities: Backlog de ideación
   Sesión con la gerencia general y los directores: cada quien sube los síntomas
   (tareas manuales que le duelen), la IA los consolida en automatizaciones
   candidatas y la matriz impacto × esfuerzo deja el backlog priorizado.
   Fuente única del contenido: la usan el modo demo local (js/db.js) y el
   generador del seed SQL (supabase/gen_seed.js mp).
   Pilares = las seis áreas del N5 (lám. 05). Si cambian, editar aquí y regenerar.
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
      titulo_reporte: 'Backlog priorizado de automatización · Grupo MP',
      votos_por_pilar: 3, minutos_ideacion: 10, minutos_matriz: 12, minutos_pausa: 5, escala_max: 5, max_calificaciones: 12,
      caso: 'Después de cuatro niveles de IA-abilities, la gerencia y los directores deciden qué se automatiza primero. Escriba síntomas: tareas manuales que le duelen a usted o a su equipo. Un buen síntoma dice qué tarea, cada cuánto y cuánto tiempo toma. Ejemplo: Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas. Un síntoma por tarjeta. Con lo que salga armamos el backlog: la lista de automatizaciones ordenada por prioridad.',
      restricciones: [
        'Hablamos de tareas y procesos, no de personas',
        'No escriba datos reales de clientas ni asesoras (nombres, cédulas, teléfonos)',
        'Lo que salga se ordena por impacto y esfuerzo: no todo se hace ya'
      ],
      instruccion_ia: 'Las ideas son SÍNTOMAS: tareas manuales que le duelen a un área de Grupo MP (venta directa por catálogo con asesoras). Cada idea consolidada es una AUTOMATIZACIÓN CANDIDATA para el backlog: el título nombra la tarea que se automatizaría con las palabras de los participantes (por ejemplo: Resumen semanal de pedidos por zona para el comité). En descripcion_corta di qué tarea manual dejaría de hacerse y, solo si algún participante lo escribió, cada cuánto ocurre y cuánto tiempo toma. Nunca estimes frecuencias, horas, herramientas ni ahorros que nadie escribió. Dos síntomas son el mismo si describen la misma tarea manual sobre la misma información, aunque los escriban personas de áreas distintas o con otras palabras.',
      etiqueta_idea: 'Su síntoma: qué tarea manual le duele, cada cuánto y cuánto tiempo le toma',
      ejemplo_idea: 'Ej.: Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas',
      perfiles: ['Gerencia general', 'Mercadeo', 'Diseño', 'Demanda', 'Comercial', 'Operación y servicio', 'Otra dirección'],
      afinidad: {
        'Gerencia general': 'Dirección',
        'Mercadeo': 'Mercadeo',
        'Diseño': 'Diseño',
        'Demanda': 'Demanda',
        'Comercial': 'Comercial',
        'Operación y servicio': 'Operación y servicio'
      }
    },
    pilares: [
      { orden: 1, nombre: 'Mercadeo', icono: 'fa-bullhorn', color: 'rose',
        enunciado: '¿Qué tarea de mercadeo repite cada campaña o cada catálogo y siente que podría hacerse sola? Piense en armar el catálogo, escribir briefs, preparar campañas y leer los resultados. ¿Cuál le quita más horas y cuál le genera más reprocesos?',
        subfrentes: ['Catálogo', 'Campañas', 'Briefs', 'Lectura de resultados'] },
      { orden: 2, nombre: 'Diseño', icono: 'fa-palette', color: 'purple',
        enunciado: '¿Qué parte del trabajo de diseño es repetición y no creatividad? Piense en adaptar una pieza a muchos formatos, sacar versiones, ajustar imágenes y responder cambios. ¿Qué pedido le llega siempre igual?',
        subfrentes: ['Piezas', 'Imágenes con IA', 'Versiones', 'Formatos'] },
      { orden: 3, nombre: 'Demanda', icono: 'fa-chart-line', color: 'blue',
        enunciado: '¿Qué hace a mano cada semana o cada campaña para saber cuánto se va a vender y cuánto inventario hace falta? Piense en bajar datos, limpiarlos, correr modelos en Python o R y armar el informe. ¿En qué paso se pierde más tiempo?',
        subfrentes: ['Pronóstico', 'Modelos en Python y R', 'Inventario', 'Datos de entrada'] },
      { orden: 4, nombre: 'Comercial', icono: 'fa-handshake', color: 'amber',
        enunciado: '¿Qué reporte o seguimiento comercial arma a mano? Piense en pedidos, orden promedio, zonas, asesoras activas y metas. ¿Qué le preguntan siempre y le cuesta responder rápido?',
        subfrentes: ['Pedidos', 'Orden promedio', 'Zonas', 'Asesoras'] },
      { orden: 5, nombre: 'Operación y servicio', icono: 'fa-truck', color: 'teal',
        enunciado: '¿Qué pregunta o novedad le llega todos los días y se resuelve siempre igual? Piense en despachos, novedades de pedidos y atención a asesoras y clientas. ¿Qué se pierde entre correos y chats?',
        subfrentes: ['Despachos', 'Novedades', 'Atención a asesoras', 'Atención a clientas'] },
      { orden: 6, nombre: 'Dirección', icono: 'fa-compass', color: 'green',
        enunciado: '¿Qué información necesita la dirección y hoy llega tarde, a mano o de varias fuentes? Piense en indicadores, preparación de comités, seguimiento de compromisos y decisiones entre áreas.',
        subfrentes: ['Indicadores', 'Comités', 'Compromisos', 'Decisiones entre áreas'] }
    ],
    /* Demo de ensayo (Admin › Control › Cargar demo). Ficticio. Trae a propósito síntomas repetidos con
       otras palabras y entre áreas, para ver que la consolidación los junte. */
    demo: {
      participantes: [['Demo · Gerente', 'Gerencia general'], ['Demo · Mercadeo', 'Mercadeo'], ['Demo · Diseño', 'Diseño'], ['Demo · Demanda', 'Demanda'], ['Demo · Comercial', 'Comercial'], ['Demo · Servicio', 'Operación y servicio']],
      ideas: [
        ['Mercadeo', 'Catálogo', 'Cada campaña armamos a mano el listado de productos y precios del catálogo desde tres Excel', 1],
        ['Mercadeo', 'Catálogo', 'Revisar que los precios del catálogo coincidan con el sistema nos toma dos días por campaña', 1],
        ['Mercadeo', 'Briefs', 'Escribir el brief de cada pieza para diseño desde cero, siempre con la misma estructura', 1],
        ['Mercadeo', 'Briefs', 'Los briefs llegan incompletos y hay que devolverlos varias veces', 2],
        ['Mercadeo', 'Lectura de resultados', 'Al cierre de campaña bajo las ventas por producto y armo la presentación de resultados a mano: un día entero', 1],
        ['Diseño', 'Formatos', 'Adaptar la misma pieza a historia, post, WhatsApp y catálogo, una por una', 2],
        ['Diseño', 'Formatos', 'Sacar cada arte en cinco tamaños distintos para redes', 2],
        ['Diseño', 'Versiones', 'Los cambios de precio obligan a rehacer todas las versiones de la pieza', 2],
        ['Diseño', 'Imágenes con IA', 'Quitar fondos y retocar fotos de producto toma media mañana por campaña', 2],
        ['Demanda', 'Datos de entrada', 'Cada semana descargo los pedidos y los limpio a mano antes de correr el modelo', 3],
        ['Demanda', 'Datos de entrada', 'Juntar los datos de ventas de varias fuentes antes del pronóstico: 4 horas semanales', 3],
        ['Demanda', 'Pronóstico', 'Correr el modelo de pronóstico en R y copiar los resultados a Excel para compartirlos', 3],
        ['Demanda', 'Inventario', 'Cruzar el pronóstico con el inventario disponible es manual y se hace tarde', 3],
        ['Comercial', 'Pedidos', 'Cada lunes armo a mano el resumen de pedidos por zona para el comité: 3 horas', 4],
        ['Comercial', 'Zonas', 'El informe semanal de ventas por zona lo hacemos copiando y pegando del sistema', 4],
        ['Comercial', 'Asesoras', 'Saber qué asesoras dejaron de pedir esta campaña exige cruzar dos reportes', 4],
        ['Comercial', 'Orden promedio', 'Calcular la orden promedio por zona y compararla con la campaña anterior', 4],
        ['Comercial', 'Asesoras', 'Mandar a cada líder la lista de sus asesoras inactivas para que las llame', 4],
        ['Operación y servicio', 'Atención a asesoras', 'Las asesoras preguntan todo el día por WhatsApp dónde está su pedido', 5],
        ['Operación y servicio', 'Despachos', 'Responder a mano el estado de cada despacho que preguntan las asesoras', 5],
        ['Operación y servicio', 'Novedades', 'Las novedades de pedidos (faltantes, cambios) se registran en un Excel compartido y se pierden', 5],
        ['Operación y servicio', 'Atención a clientas', 'Las devoluciones de clientas se gestionan por correo sin seguimiento', 5],
        ['Dirección', 'Comités', 'Preparar el comité semanal: pedir a cada área sus cifras y armar la presentación', 0],
        ['Dirección', 'Indicadores', 'No tenemos un tablero de indicadores; cada quien trae sus números en un formato distinto', 0],
        ['Dirección', 'Compromisos', 'Los compromisos del comité quedan en el acta y nadie les hace seguimiento', 0],
        ['Dirección', 'Comités', 'El resumen de pedidos por zona para el comité de los lunes se arma a mano', 0]
      ],
      titulos: {
        'Mercadeo|Catálogo': ['Precios y productos del catálogo desde una sola fuente', 'Dejar de armar y revisar a mano el listado del catálogo en cada campaña.'],
        'Mercadeo|Briefs': ['Brief de piezas con plantilla completa', 'El brief sale con la misma estructura y sin devoluciones.'],
        'Mercadeo|Lectura de resultados': ['Presentación de resultados de campaña', 'Ventas por producto al cierre sin armarlas a mano.'],
        'Diseño|Formatos': ['Una pieza, todos los formatos', 'Adaptar el arte a cada tamaño y canal sin hacerlo uno por uno.'],
        'Diseño|Versiones': ['Versiones que se actualizan con el precio', 'Un cambio de precio no obliga a rehacer las piezas.'],
        'Diseño|Imágenes con IA': ['Fondos y retoque de fotos de producto', 'Menos horas de retoque por campaña.'],
        'Demanda|Datos de entrada': ['Datos de ventas listos para el modelo', 'Descargar, juntar y limpiar los pedidos sin trabajo manual.'],
        'Demanda|Pronóstico': ['Pronóstico compartido sin copiar a Excel', 'Los resultados del modelo en R llegan solos a quien los usa.'],
        'Demanda|Inventario': ['Pronóstico cruzado con inventario', 'El cruce se hace a tiempo y sin pasos manuales.'],
        'Comercial|Pedidos': ['Resumen de pedidos por zona para el comité', 'El resumen de los lunes sale solo.'],
        'Comercial|Zonas': ['Informe semanal de ventas por zona', 'Sin copiar y pegar del sistema.'],
        'Comercial|Asesoras': ['Asesoras inactivas por líder', 'Lista de quién dejó de pedir, enviada a cada líder.'],
        'Comercial|Orden promedio': ['Orden promedio por zona y campaña', 'Comparación automática con la campaña anterior.'],
        'Operación y servicio|Atención a asesoras': ['Estado del pedido sin preguntar', 'La asesora consulta dónde está su pedido.'],
        'Operación y servicio|Despachos': ['Estado de despachos a la mano', 'Respuestas de estado sin buscarlas una por una.'],
        'Operación y servicio|Novedades': ['Registro de novedades con seguimiento', 'Faltantes y cambios que no se pierden.'],
        'Operación y servicio|Atención a clientas': ['Devoluciones con seguimiento', 'Cada devolución con estado y responsable.'],
        'Dirección|Comités': ['Comité semanal preparado solo', 'Cifras de las áreas reunidas sin pedirlas.'],
        'Dirección|Indicadores': ['Tablero único de indicadores', 'Un formato y una fuente para los números.'],
        'Dirección|Compromisos': ['Seguimiento de compromisos del comité', 'Cada compromiso con responsable y fecha.']
      }
    }
  };
  root.PLANTILLAS = Object.assign(root.PLANTILLAS || {}, { [P.id]: P });
  if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);

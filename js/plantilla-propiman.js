/* ============================================================
   PLANTILLA · Propiman · Taller de ideación con el equipo de una copropiedad
   Primera vez: Salenza · Sierra Alta, jueves 15-oct-2026, 10:00–12:00.
   Fuente única del contenido: la usan el modo demo local (js/db.js) y el
   generador del seed SQL (supabase/gen_seed_propiman.js). Para otra
   copropiedad: copiar, cambiar id/empresa/caso y regenerar el SQL.
   ============================================================ */
(function (root) {
  const P = {
    id: 'propiman-sierraalta',
    nombre: 'Taller de ideación · Sierra Alta',
    empresa: 'Salenza · Sierra Alta',
    facilitador: 'Daniel Restrepo',
    config: {
      marca: 'propiman',
      titulo_evento: 'Taller de ideación',
      titulo_reporte: 'Backlog priorizado · Sierra Alta',
      votos_por_pilar: 3, minutos_ideacion: 15, minutos_matriz: 10, minutos_pausa: 3, escala_max: 5, max_calificaciones: 20,
      caso: 'Sierra Alta empieza a administrarse con Propiman. Antes de terminar de configurarla queremos escuchar a quienes la administran todos los días: dónde se pierde tiempo, dónde se pierde información y qué le gustaría que la plataforma resolviera primero. Escriba ideas cortas, una por tarjeta: un dolor de hoy o algo que le gustaría que pasara. No hay ideas malas. Con lo que salga armamos la lista de prioridades de Propiman para Sierra Alta.',
      restricciones: [
        'Sierra Alta ya está cargada en Propiman y la salida en vivo es en noviembre',
        'Lo que salga entra a una lista de prioridades: no todo se hace ya, se ordena por impacto y esfuerzo',
        'Hablamos de cómo se trabaja hoy, no de personas'
      ],
      instruccion_ia: 'Las ideas son dolores y pedidos del equipo que administra la copropiedad, pensados para la plataforma Propiman (software de administración de propiedad horizontal). Redacta cada idea consolidada como una necesidad o funcionalidad concreta para la lista de prioridades (backlog), por ejemplo: Recordatorio automático de pago por WhatsApp. En descripcion_corta di qué resolvería para el equipo, no lo que haría una empresa.',
      etiqueta_idea: 'Su idea: un dolor de hoy o algo que le gustaría que pasara (una o dos frases)',
      ejemplo_idea: 'Ej.: Los residentes mandan el comprobante de pago por WhatsApp y hay que aplicarlo a mano…',
      perfiles: ['Administración', 'Contabilidad / Cartera', 'Asistente o auxiliar administrativa', 'Consejo de administración', 'Portería / Mantenimiento', 'Otro'],
      afinidad: {
        'Administración': 'Control y seguimiento',
        'Contabilidad / Cartera': 'Ingreso de información',
        'Asistente o auxiliar administrativa': 'Procesos manuales',
        'Consejo de administración': 'Control y seguimiento',
        'Portería / Mantenimiento': 'Comunicación'
      }
    },
    pilares: [
      { orden: 1, nombre: 'Ingreso de información', icono: 'fa-inbox', color: 'blue',
        enunciado: '¿Por dónde le llega hoy la información y cuántas veces la tiene que volver a escribir? Piense en extractos del banco, pagos de los residentes, Aplicamos, hojas de Excel, facturas de proveedores, papeles y correos. ¿Qué dato busca y no encuentra, o encuentra en dos lugares con valores distintos?',
        subfrentes: ['Pagos y recaudo', 'Extractos y conciliación', 'Facturas y proveedores', 'Datos de residentes e inmuebles', 'Documentos y soportes'] },
      { orden: 2, nombre: 'Comunicación', icono: 'fa-comments', color: 'green',
        enunciado: '¿Qué conversaciones se le salen de las manos? Piense en el WhatsApp con residentes y propietarios, los mensajes al consejo y la coordinación con contratistas y portería. ¿Qué pregunta le hacen todos los días que podría responderse sola? ¿Qué se pierde entre tantos chats?',
        subfrentes: ['Residentes y propietarios', 'Consejo de administración', 'Contratistas y proveedores', 'Portería y personal', 'Circulares y avisos'] },
      { orden: 3, nombre: 'Procesos manuales', icono: 'fa-hand', color: 'purple',
        enunciado: '¿Qué tarea repite cada semana o cada mes y siente que podría hacerse sola? Piense en cuentas de cobro, paz y salvos, recordatorios de pago, reservas de zonas comunes, actas, cartas y reportes. ¿Cuál le quita más horas y cuál le genera más errores?',
        subfrentes: ['Cobro y cartera', 'Certificados y paz y salvos', 'Reservas y zonas comunes', 'Mantenimiento y órdenes de trabajo', 'Cartas, actas y reportes'] },
      { orden: 4, nombre: 'Control y seguimiento', icono: 'fa-list-check', color: 'teal',
        enunciado: '¿Cómo sabe hoy qué está pendiente, qué se atrasó y por qué? Piense en el informe al consejo, el plan de mantenimiento presupuestado, las PQRS con plazo legal y los compromisos de las reuniones. ¿Qué le preguntan el consejo o los propietarios que hoy le cuesta responder con datos?',
        subfrentes: ['Informe al consejo', 'Mantenimiento y presupuesto', 'PQRS y plazos legales', 'Compromisos y pendientes', 'Cartera y morosidad'] },
      { orden: 5, nombre: 'Otros', icono: 'fa-lightbulb', color: 'amber',
        enunciado: '¿Qué no cabe en los otros pilares y vale la pena decirlo? Ideas sueltas, algo que hacía otra herramienta y extrañaría, o lo que nadie se ha atrevido a pedir.',
        subfrentes: [] }
    ],
    /* Demo de ensayo (Admin › Control › Cargar demo): participantes y ideas verosímiles, sin datos reales */
    demo: {
      participantes: [['Demo · Administradora', 'Administración'], ['Demo · Contadora', 'Contabilidad / Cartera'], ['Demo · Auxiliar', 'Asistente o auxiliar administrativa'], ['Demo · Consejera', 'Consejo de administración'], ['Demo · Portero', 'Portería / Mantenimiento']],
      ideas: [
        ['Ingreso de información', 'Pagos y recaudo', 'Los residentes mandan el comprobante por WhatsApp y hay que buscarlo y aplicarlo a mano', 1],
        ['Ingreso de información', 'Pagos y recaudo', 'Que el pago por la plataforma quede aplicado solo a la cuenta del apartamento', 0],
        ['Ingreso de información', 'Extractos y conciliación', 'Conciliar el extracto del banco toma dos días cada mes', 1],
        ['Ingreso de información', 'Extractos y conciliación', 'Consignaciones sin referencia que nadie sabe de quién son', 2],
        ['Ingreso de información', 'Facturas y proveedores', 'Las facturas de proveedores llegan al correo personal y se pierden', 2],
        ['Ingreso de información', 'Datos de residentes e inmuebles', 'Datos de contacto desactualizados: teléfonos viejos y arrendatarios que nadie registró', 0],
        ['Ingreso de información', 'Datos de residentes e inmuebles', 'Tener en un solo lugar quién es propietario y quién arrendatario', 4],
        ['Ingreso de información', 'Documentos y soportes', 'Las pólizas y contratos están en carpetas físicas y no sé cuándo vencen', 0],
        ['Comunicación', 'Residentes y propietarios', 'Todos los días preguntan cuánto deben: que lo puedan consultar solos', 2],
        ['Comunicación', 'Residentes y propietarios', 'El WhatsApp de la administración no para y se mezclan temas personales', 0],
        ['Comunicación', 'Consejo de administración', 'El consejo pide información por chat a cualquier hora y en formatos distintos', 0],
        ['Comunicación', 'Contratistas y proveedores', 'Coordinar con el contratista quién entra y a qué hora es puro teléfono', 4],
        ['Comunicación', 'Portería y personal', 'El portero no se entera de los trabajos programados hasta que llega el técnico', 4],
        ['Comunicación', 'Circulares y avisos', 'Las circulares se pegan en el ascensor y nadie las lee', 3],
        ['Comunicación', 'Circulares y avisos', 'Poder mandar un aviso a una sola torre o a los morosos sin hacerlo uno por uno', 2],
        ['Procesos manuales', 'Cobro y cartera', 'Los recordatorios de pago se mandan uno por uno', 1],
        ['Procesos manuales', 'Cobro y cartera', 'Los acuerdos de pago se llevan en Excel y se olvidan las cuotas', 1],
        ['Procesos manuales', 'Certificados y paz y salvos', 'Un paz y salvo toma medio día porque hay que revisar todo a mano', 2],
        ['Procesos manuales', 'Reservas y zonas comunes', 'Las reservas del salón social se llevan en un cuaderno de portería', 4],
        ['Procesos manuales', 'Mantenimiento y órdenes de trabajo', 'Pedir tres cotizaciones y compararlas es un correo eterno', 0],
        ['Procesos manuales', 'Cartas, actas y reportes', 'Las actas se escriben después de la reunión a partir de notas sueltas', 3],
        ['Control y seguimiento', 'Informe al consejo', 'Armar el informe del mes toma casi una semana', 0],
        ['Control y seguimiento', 'Informe al consejo', 'El consejo quiere ver lo que no se ha hecho y por qué, no solo lo que se hizo', 3],
        ['Control y seguimiento', 'Mantenimiento y presupuesto', 'No hay un calendario de mantenimientos con lo presupuestado contra lo ejecutado', 3],
        ['Control y seguimiento', 'PQRS y plazos legales', 'Una alerta antes de que se venza el plazo de respuesta de una PQRS', 0],
        ['Control y seguimiento', 'Compromisos y pendientes', 'Los compromisos de las reuniones del consejo se pierden entre actas', 3],
        ['Control y seguimiento', 'Cartera y morosidad', 'Saber al día cuánto se debe por edad de mora sin pedírselo a la contadora', 3],
        ['Otros', null, 'Que los residentes nuevos reciban un manual de convivencia y bienvenida automática', 4],
        ['Otros', null, 'Capacitación corta para el equipo antes de salir en vivo', 2]
      ],
      titulos: {
        'Ingreso de información|Pagos y recaudo': ['Pagos aplicados solos a cada apartamento', 'Que el pago y su soporte queden en la cuenta del inmueble sin digitarlos.'],
        'Ingreso de información|Extractos y conciliación': ['Conciliación bancaria asistida', 'Cruzar el extracto con las cuentas y señalar consignaciones sin dueño.'],
        'Ingreso de información|Facturas y proveedores': ['Buzón único de facturas de proveedores', 'Las facturas llegan a un solo lugar y se registran sin perderse.'],
        'Ingreso de información|Datos de residentes e inmuebles': ['Directorio de residentes al día', 'Propietario, arrendatario y contacto vigentes por inmueble.'],
        'Ingreso de información|Documentos y soportes': ['Pólizas y contratos con vencimiento', 'Documentos digitales con aviso antes de vencer.'],
        'Comunicación|Residentes y propietarios': ['Autoconsulta de saldo y menos chat', 'El residente consulta lo que debe y el WhatsApp se ordena por temas.'],
        'Comunicación|Consejo de administración': ['Canal ordenado con el consejo', 'Información para el consejo en un formato y un lugar.'],
        'Comunicación|Contratistas y proveedores': ['Coordinación de ingresos de contratistas', 'Quién entra, cuándo y con qué, sin llamadas.'],
        'Comunicación|Portería y personal': ['Portería enterada de los trabajos', 'El portero ve los mantenimientos programados del día.'],
        'Comunicación|Circulares y avisos': ['Avisos segmentados y que se lean', 'Circulares por torre, por grupo o a morosos, con confirmación.'],
        'Procesos manuales|Cobro y cartera': ['Cobro y acuerdos de pago automáticos', 'Recordatorios masivos y cuotas de acuerdos con aviso.'],
        'Procesos manuales|Certificados y paz y salvos': ['Paz y salvo en minutos', 'Certificado generado desde la cuenta del inmueble.'],
        'Procesos manuales|Reservas y zonas comunes': ['Reservas de zonas comunes en línea', 'Sin cuaderno de portería.'],
        'Procesos manuales|Mantenimiento y órdenes de trabajo': ['Cotizaciones comparadas en un solo lugar', 'Pedir, comparar y aprobar sin cadenas de correo.'],
        'Procesos manuales|Cartas, actas y reportes': ['Actas a partir de la reunión', 'Borrador del acta desde las notas o la grabación.'],
        'Control y seguimiento|Informe al consejo': ['Informe al consejo con pendientes y causas', 'Lo hecho, lo atrasado y por qué, generado en minutos.'],
        'Control y seguimiento|Mantenimiento y presupuesto': ['Plan de mantenimiento presupuestado vs ejecutado', 'Calendario con avance y costo real.'],
        'Control y seguimiento|PQRS y plazos legales': ['Alertas de plazo legal de PQRS', 'Aviso antes del vencimiento de la respuesta.'],
        'Control y seguimiento|Compromisos y pendientes': ['Seguimiento de compromisos del consejo', 'Cada compromiso con responsable y fecha.'],
        'Control y seguimiento|Cartera y morosidad': ['Cartera por edad siempre a la mano', 'Mora por edades sin pedir un reporte.'],
        'Otros|': ['Bienvenida y capacitación', 'Manual para residentes nuevos y capacitación del equipo.']
      }
    }
  };
  root.PLANTILLAS = Object.assign(root.PLANTILLAS || {}, { [P.id]: P });
  if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);

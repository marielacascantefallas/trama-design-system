import type { StatusTone } from '@trama';

export type Person = { id: string; name: string; role: string; load: number; unanswered: number; avg: string };

export const TEAM: Person[] = [
  { id: 'ana', name: 'Ana Vargas', role: 'Impuestos', load: 14, unanswered: 3, avg: '26 min' },
  { id: 'marta', name: 'Marta Solís', role: 'Planilla CCSS', load: 11, unanswered: 1, avg: '17 min' },
  { id: 'sofia', name: 'Sofía Arias', role: 'Facturación', load: 9, unanswered: 0, avg: '15 min' },
  { id: 'luis', name: 'Luis Jiménez', role: 'Planilla y facturación', load: 8, unanswered: 0, avg: '12 min' },
  { id: 'jorge', name: 'Jorge Mora', role: 'Impuestos', load: 6, unanswered: 1, avg: '21 min' },
];

export const LOAD_LIMIT = 12;

export type Message = {
  side: 'incoming' | 'outgoing';
  text: string;
  time: string;
  author?: string;
  day: 'Ayer' | 'Hoy';
};

export type Chat = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  preview: string;
  time: string;
  status: { tone: StatusTone; label: string };
  owner: string | null;
  group: 'mios' | 'sin-asignar';
  pending?: boolean;
  urgent?: string;
  summary: string;
  messages: Message[];
  draft?: string;
};

const m = (
  side: Message['side'],
  text: string,
  time: string,
  day: Message['day'] = 'Hoy',
  author?: string,
): Message => ({
  side,
  text,
  time,
  day,
  author,
});

export const CHATS: Chat[] = [
  {
    id: 'cafe-cordillera',
    name: 'Café Cordillera',
    contact: 'Andrés Solano',
    phone: '+506 8813 2207',
    preview: '¿Me confirman? Tengo que pagar antes de las 3',
    time: '9:38',
    status: { tone: 'danger', label: 'Urgente' },
    owner: 'ana',
    group: 'mios',
    urgent: 'menciona un pago que vence hoy.',
    summary:
      'Andrés pregunta si ya se presentó la declaración de IVA (D-104) de septiembre. Vence hoy y quiere pagar antes de las 3:00 p.m. Ayer envió el reporte de ventas con tarjeta que faltaba.',
    draft:
      'Hola Andrés, la D-104 ya está lista. La presentamos a las 10:00 y le enviamos el comprobante para que pueda pagar.',
    messages: [
      m(
        'outgoing',
        'Hola Andrés, ya tenemos las facturas de septiembre. Solo nos falta el reporte de ventas con tarjeta para cerrar la D-104.',
        '4:12 p.m.',
        'Ayer',
        'Ana',
      ),
      m('incoming', 'Listo, se lo acabo de enviar al correo.', '5:03 p.m.', 'Ayer'),
      m('incoming', 'Buenos días, Ana. ¿Ya presentaron la declaración de IVA de septiembre?', '7:50 a.m.'),
      m('incoming', '¿Me confirman, por favor? Tengo que pagar antes de las 3.', '9:38 a.m.'),
    ],
  },
  {
    id: 'laura-mora',
    name: 'Laura Mora',
    contact: 'Laura Mora',
    phone: '+506 8702 1145',
    preview: 'Adjunté la factura de octubre',
    time: '9:21',
    status: { tone: 'warning', label: 'Sin responder' },
    owner: 'ana',
    group: 'mios',
    pending: true,
    summary: 'Envió la factura de octubre de su consultorio. No pide nada más; falta confirmar que se recibió.',
    messages: [
      m('outgoing', 'Laura, recuerde enviarnos la factura de octubre antes del 25.', '3:40 p.m.', 'Ayer', 'Ana'),
      m('incoming', 'Adjunté la factura de octubre', '9:21 a.m.'),
    ],
  },
  {
    id: 'ferreteria-el-roble',
    name: 'Ferretería El Roble',
    contact: 'Rodrigo Quesada',
    phone: '+506 2771 0934',
    preview: 'Les mando el estado de cuenta del BCR',
    time: '8:57',
    status: { tone: 'warning', label: 'Sin responder' },
    owner: 'ana',
    group: 'mios',
    pending: true,
    urgent: 'necesita el estado de cuenta para un pago de hoy.',
    summary: 'Envió el estado de cuenta del BCR para conciliar septiembre. Necesita saber hoy cuánto pagar de IVA.',
    messages: [
      m('incoming', 'Buenos días. Les mando el estado de cuenta del BCR', '8:57 a.m.'),
      m('incoming', 'Necesito saber hoy cuánto me toca pagar.', '8:58 a.m.'),
    ],
  },
  {
    id: 'soda-la-esquina',
    name: 'Soda La Esquina',
    contact: 'Yorleny Castro',
    phone: '+506 8890 4410',
    preview: 'Muchas gracias, quedo atenta',
    time: '8:40',
    status: { tone: 'success', label: 'Respondido' },
    owner: 'sofia',
    group: 'mios',
    summary: 'Quedó lista la inscripción en Hacienda. Ya recibió el comprobante y no hay pendientes.',
    messages: [
      m(
        'outgoing',
        'Yorleny, ya quedó la inscripción en Hacienda. Le adjunto el comprobante.',
        '8:31 a.m.',
        'Hoy',
        'Sofía',
      ),
      m('incoming', 'Muchas gracias, quedo atenta', '8:40 a.m.'),
    ],
  },
  {
    id: 'transportes-brenes',
    name: 'Transportes Brenes',
    contact: 'Mauricio Brenes',
    phone: '+506 8345 7721',
    preview: '¿Cuánto me toca pagar de planilla este mes?',
    time: 'Ayer',
    status: { tone: 'warning', label: 'Sin responder' },
    owner: 'ana',
    group: 'mios',
    pending: true,
    summary: 'Pregunta el monto de la planilla CCSS de octubre. Tiene 2 choferes nuevos desde el 15.',
    messages: [m('incoming', '¿Cuánto me toca pagar de planilla este mes? Entraron 2 choferes el 15.', '7:49 a.m.')],
  },
  {
    id: 'karla-mendez',
    name: 'Dra. Karla Méndez',
    contact: 'Karla Méndez',
    phone: '+506 8611 3092',
    preview: 'Perfecto, el lunes les paso los recibos',
    time: 'Ayer',
    status: { tone: 'neutral', label: 'Esperando' },
    owner: 'ana',
    group: 'mios',
    summary: 'Va a enviar los recibos de gastos médicos el lunes. Se espera respuesta suya.',
    messages: [
      m(
        'outgoing',
        'Doctora, para la renta nos faltan los recibos de gastos de septiembre.',
        '2:10 p.m.',
        'Ayer',
        'Ana',
      ),
      m('incoming', 'Perfecto, el lunes les paso los recibos', '2:44 p.m.', 'Ayer'),
    ],
  },
  {
    id: 'panaderia-santa-ana',
    name: 'Panadería Santa Ana',
    contact: 'Gerardo Rojas',
    phone: '+506 2282 5519',
    preview: 'Ya hice la transferencia del mes',
    time: 'Ayer',
    status: { tone: 'success', label: 'Respondido' },
    owner: 'marta',
    group: 'mios',
    summary: 'Pagó la planilla CCSS de octubre. Marta confirmó el pago.',
    messages: [
      m('incoming', 'Ya hice la transferencia del mes', '9:20 a.m.', 'Ayer'),
      m('outgoing', 'Recibido, don Gerardo. Ya quedó aplicada.', '9:31 a.m.', 'Ayer', 'Marta'),
    ],
  },
  {
    id: 'jose-rojas',
    name: 'José Rojas',
    contact: 'José Rojas',
    phone: '+506 8420 6678',
    preview: 'Necesito una constancia de ingresos',
    time: 'Lun',
    status: { tone: 'warning', label: 'Sin responder' },
    owner: 'jorge',
    group: 'mios',
    pending: true,
    summary: 'Pide una constancia de ingresos para un préstamo en el Banco Nacional.',
    messages: [m('incoming', 'Necesito una constancia de ingresos para el banco, por favor.', '8:43 a.m.')],
  },
  {
    id: 'taller-quesada',
    name: 'Taller Hermanos Quesada',
    contact: 'Óscar Quesada',
    phone: '+506 2447 3381',
    preview: 'Gracias por el recordatorio',
    time: 'Lun',
    status: { tone: 'success', label: 'Respondido' },
    owner: 'luis',
    group: 'mios',
    summary: 'Confirmó que enviará las facturas de compras antes del 25. Sin pendientes.',
    messages: [
      m(
        'outgoing',
        'Don Óscar, le recordamos enviar las facturas de compras antes del 25.',
        '10:02 a.m.',
        'Ayer',
        'Luis',
      ),
      m('incoming', 'Gracias por el recordatorio', '10:15 a.m.', 'Ayer'),
    ],
  },
  {
    id: 'pilates-luna',
    name: 'Estudio Pilates Luna',
    contact: 'Valeria Luna',
    phone: '+506 8556 2290',
    preview: '¿Me pueden facturar a nombre de la sociedad?',
    time: '14 oct',
    status: { tone: 'neutral', label: 'Esperando' },
    owner: 'sofia',
    group: 'mios',
    summary: 'Quiere que las facturas salgan a nombre de su sociedad. Sofía pidió la cédula jurídica.',
    messages: [
      m('incoming', '¿Me pueden facturar a nombre de la sociedad?', '11:20 a.m.', 'Ayer'),
      m('outgoing', 'Claro, Valeria. ¿Nos pasa la cédula jurídica?', '11:34 a.m.', 'Ayer', 'Sofía'),
    ],
  },
  {
    id: 'inversiones-arias',
    name: 'Inversiones Arias S.A.',
    contact: 'Roberto Arias',
    phone: '+506 2290 7714',
    preview: 'Les reenvío el correo de Hacienda',
    time: '13 oct',
    status: { tone: 'success', label: 'Respondido' },
    owner: 'luis',
    group: 'mios',
    summary: 'Reenvió una notificación de Hacienda por una multa. Luis ya presentó el recurso.',
    messages: [
      m('incoming', 'Les reenvío el correo de Hacienda, habla de una multa.', '8:05 a.m.', 'Ayer'),
      m(
        'outgoing',
        'Recibido, don Roberto. Ya presentamos el recurso; le aviso la respuesta.',
        '9:05 a.m.',
        'Hoy',
        'Luis',
      ),
    ],
  },
  {
    id: 'lucia-fernandez',
    name: 'Lucía Fernández',
    contact: 'Lucía Fernández',
    phone: '+506 8723 0045',
    preview: 'Ya firmé el contrato de servicios',
    time: '12 oct',
    status: { tone: 'success', label: 'Respondido' },
    owner: 'marta',
    group: 'mios',
    summary: 'Firmó el contrato de servicios contables. Empieza en noviembre.',
    messages: [
      m('incoming', 'Ya firmé el contrato de servicios', '4:30 p.m.', 'Ayer'),
      m('outgoing', '¡Bienvenida, Lucía! Empezamos en noviembre.', '4:41 p.m.', 'Ayer', 'Marta'),
    ],
  },
  {
    id: 'ferreteria-nueva',
    name: 'Ferretería La Unión',
    contact: 'Laura Quesada',
    phone: '+506 2771 0950',
    preview: '¿Me ayudan con la declaración de renta?',
    time: '9:40',
    status: { tone: 'neutral', label: 'Sin asignar' },
    owner: null,
    group: 'sin-asignar',
    summary: 'Cliente nuevo. Pide ayuda con la declaración de renta de la sucursal.',
    messages: [m('incoming', '¿Me ayudan con la declaración de renta?', '9:40 a.m.')],
  },
  {
    id: 'soda-nueva',
    name: 'Soda Doña Mary',
    contact: 'María Fallas',
    phone: '+506 8877 1203',
    preview: 'Necesito inscribirme en Hacienda',
    time: '9:31',
    status: { tone: 'neutral', label: 'Sin asignar' },
    owner: null,
    group: 'sin-asignar',
    summary: 'Abre una soda y necesita inscribirse en Hacienda como contribuyente.',
    messages: [m('incoming', 'Necesito inscribirme en Hacienda', '9:31 a.m.')],
  },
  {
    id: 'transportes-pacifico',
    name: 'Transportes Pacífico',
    contact: 'Esteban Mora',
    phone: '+506 2661 4402',
    preview: 'Mandé las facturas de septiembre',
    time: '9:12',
    status: { tone: 'neutral', label: 'Sin asignar' },
    owner: null,
    group: 'sin-asignar',
    summary: 'Envió las facturas de septiembre. Luis lo atendió en agosto.',
    messages: [m('incoming', 'Mandé las facturas de septiembre', '9:12 a.m.')],
  },
];

export type EventType = 'mensajes' | 'tramites' | 'documentos';
export type HistoryEvent = {
  month: string;
  type: EventType;
  title: string;
  detail: string;
  meta: string;
  chip?: { tone: StatusTone; label: string };
};

export const HISTORY: HistoryEvent[] = [
  {
    month: 'Octubre 2026',
    type: 'mensajes',
    title: 'Conversación sobre la D-104 de septiembre',
    detail: 'Andrés pidió confirmar la presentación; Ana respondió y envió el comprobante.',
    meta: 'Hoy, Ana Vargas',
    chip: { tone: 'danger', label: 'Urgente' },
  },
  {
    month: 'Octubre 2026',
    type: 'documentos',
    title: 'Reporte de ventas con tarjeta',
    detail: 'Recibido por WhatsApp y guardado en Documentos.',
    meta: 'Ayer, Andrés Solano',
  },
  {
    month: 'Octubre 2026',
    type: 'tramites',
    title: 'Pago de octubre registrado',
    detail: 'Transferencia BAC por ₡185 000.',
    meta: '12 oct, Daniela Rojas',
    chip: { tone: 'success', label: 'Pagado' },
  },
  {
    month: 'Octubre 2026',
    type: 'tramites',
    title: 'Cliente asignado a Ana Vargas',
    detail: 'Reasignado desde Luis Jiménez por cambio de cartera.',
    meta: '2 oct, Daniela Rojas',
  },
  {
    month: 'Septiembre 2026',
    type: 'tramites',
    title: 'D-104 de agosto presentada',
    detail: 'Comprobante enviado al cliente el mismo día.',
    meta: '15 sep, Luis Jiménez',
    chip: { tone: 'success', label: 'A tiempo' },
  },
  {
    month: 'Septiembre 2026',
    type: 'tramites',
    title: 'Planilla CCSS de agosto',
    detail: 'Presentada con 2 días de anticipación.',
    meta: '8 sep, Luis Jiménez',
    chip: { tone: 'success', label: 'A tiempo' },
  },
  {
    month: 'Septiembre 2026',
    type: 'mensajes',
    title: 'Consulta sobre factura electrónica',
    detail: 'Pidió cómo anular una factura duplicada.',
    meta: '3 sep, Luis Jiménez',
  },
  {
    month: 'Septiembre 2026',
    type: 'documentos',
    title: 'Facturas de compras de agosto',
    detail: '23 documentos recibidos en un .zip.',
    meta: '2 sep, Andrés Solano',
  },
];

export const URGENT_RULES = [
  'menciona “vence hoy”',
  'habla de una multa',
  'menciona a Hacienda',
  'pide un embargo o cobro judicial',
  'lleva más de 2 h sin respuesta',
];

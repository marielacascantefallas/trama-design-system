// Casos del experimento. Las conversaciones son las del prototipo de Hilo.
// Los resúmenes son ejemplos escritos para el experimento: en cada ronda, dos son correctos
// y dos dicen algo que el cliente nunca escribió. Las fuentes y la confianza están anotadas a mano.

export type Mode = 'solo' | 'confianza' | 'fuente';

export interface Msg { side: 'incoming' | 'outgoing'; text: string; time: string }
export interface Claim { text: string; source: number | null; note?: string }
export interface Case {
  id: string;
  name: string;
  contact: string;
  phone: string;
  messages: Msg[];
  claims: Claim[];
  confidence: 'alta' | 'media';
  /** Qué está mal, para el aviso después de responder. */
  error?: string;
}

const inc = (text: string, time: string): Msg => ({ side: 'incoming', text, time });
const out = (text: string, time: string): Msg => ({ side: 'outgoing', text, time });

export const ROUNDS: Record<Mode, Case[]> = {
  solo: [
    {
      id: 'cafe', name: 'Café Cordillera', contact: 'Andrés Solano', phone: '+506 8813 2207', confidence: 'alta',
      messages: [
        out('Hola Andrés, ya tenemos las facturas de septiembre. Solo nos falta el reporte de ventas con tarjeta para cerrar la D-104.', '4:12 p.m.'),
        inc('Listo, se lo acabo de enviar al correo.', '5:03 p.m.'),
        inc('Buenos días, Ana. ¿Ya presentaron la declaración de IVA de septiembre?', '7:50 a.m.'),
        inc('¿Me confirman, por favor? Tengo que pagar antes de las 3.', '9:38 a.m.'),
      ],
      claims: [
        { text: 'Andrés pregunta si ya se presentó la declaración de IVA de septiembre.', source: 2 },
        { text: 'Tiene que pagar antes de las 3.', source: 3 },
        { text: 'Ayer envió el reporte de ventas con tarjeta que faltaba.', source: 1 },
      ],
    },
    {
      id: 'laura', name: 'Laura Mora', contact: 'Laura Mora', phone: '+506 8702 1145', confidence: 'alta',
      error: 'Laura nunca dice que la factura sea de un consultorio.',
      messages: [
        out('Laura, recuerde enviarnos la factura de octubre antes del 25.', '3:40 p.m.'),
        inc('Adjunté la factura de octubre', '9:21 a.m.'),
      ],
      claims: [
        { text: 'Envió la factura de octubre', source: 1 },
        { text: 'de su consultorio.', source: null },
        { text: 'Se le había pedido antes del 25.', source: 0 },
      ],
    },
    {
      id: 'soda', name: 'Soda La Esquina', contact: 'Yorleny Castro', phone: '+506 8890 4410', confidence: 'alta',
      messages: [
        out('Yorleny, ya quedó la inscripción en Hacienda. Le adjunto el comprobante.', '8:31 a.m.'),
        inc('Muchas gracias, quedo atenta', '8:40 a.m.'),
      ],
      claims: [
        { text: 'Se le confirmó la inscripción en Hacienda y se le envió el comprobante.', source: 0 },
        { text: 'Yorleny agradeció.', source: 1 },
      ],
    },
    {
      id: 'brenes', name: 'Transportes Brenes', contact: 'Mauricio Brenes', phone: '+506 8345 7721', confidence: 'alta',
      error: 'El mensaje dice que entraron 2 choferes, no 3.',
      messages: [inc('¿Cuánto me toca pagar de planilla este mes? Entraron 2 choferes el 15.', '7:49 a.m.')],
      claims: [
        { text: 'Pregunta cuánto paga de planilla este mes.', source: 0 },
        { text: 'Entraron 3 choferes nuevos el 15.', source: null, note: 'El mensaje dice 2 choferes' },
      ],
    },
  ],
  confianza: [
    {
      id: 'roble', name: 'Ferretería El Roble', contact: 'Rodrigo Quesada', phone: '+506 2771 0934', confidence: 'media',
      error: 'Rodrigo no habla de conciliar septiembre ni de IVA.',
      messages: [
        inc('Buenos días. Les mando el estado de cuenta del BCR', '8:57 a.m.'),
        inc('Necesito saber hoy cuánto me toca pagar.', '8:58 a.m.'),
      ],
      claims: [
        { text: 'Envió el estado de cuenta del BCR', source: 0 },
        { text: 'para conciliar septiembre.', source: null },
        { text: 'Necesita saber hoy cuánto pagar', source: 1 },
        { text: 'de IVA.', source: null },
      ],
    },
    {
      id: 'panaderia', name: 'Panadería Santa Ana', contact: 'Gerardo Rojas', phone: '+506 2282 5519', confidence: 'alta',
      messages: [
        inc('Ya hice la transferencia del mes', '9:20 a.m.'),
        out('Recibido, don Gerardo. Ya quedó aplicada.', '9:31 a.m.'),
      ],
      claims: [
        { text: 'Gerardo hizo la transferencia del mes.', source: 0 },
        { text: 'El equipo confirmó que quedó aplicada.', source: 1 },
      ],
    },
    {
      id: 'karla', name: 'Dra. Karla Méndez', contact: 'Karla Méndez', phone: '+506 8611 3092', confidence: 'alta',
      error: 'Nadie dice que los recibos sean de gastos médicos.',
      messages: [
        out('Doctora, para la renta nos faltan los recibos de gastos de septiembre.', '2:10 p.m.'),
        inc('Perfecto, el lunes les paso los recibos', '2:44 p.m.'),
      ],
      claims: [
        { text: 'Va a enviar el lunes los recibos', source: 1 },
        { text: 'de gastos médicos', source: null },
        { text: 'que faltan para la renta de septiembre.', source: 0 },
      ],
    },
    {
      id: 'pilates', name: 'Estudio Pilates Luna', contact: 'Valeria Luna', phone: '+506 8556 2290', confidence: 'media',
      messages: [
        inc('¿Me pueden facturar a nombre de la sociedad?', '11:20 a.m.'),
        out('Claro, Valeria. ¿Nos pasa la cédula jurídica?', '11:34 a.m.'),
      ],
      claims: [
        { text: 'Valeria pide que le facturen a nombre de su sociedad.', source: 0 },
        { text: 'Se le pidió la cédula jurídica.', source: 1 },
      ],
    },
  ],
  fuente: [
    {
      id: 'jose', name: 'José Rojas', contact: 'José Rojas', phone: '+506 8420 6678', confidence: 'alta',
      error: 'José no dice para qué es la constancia.',
      messages: [inc('Necesito una constancia de ingresos para el banco, por favor.', '8:43 a.m.')],
      claims: [
        { text: 'Pide una constancia de ingresos para el banco', source: 0 },
        { text: 'para un préstamo de vivienda.', source: null },
      ],
    },
    {
      id: 'arias', name: 'Inversiones Arias S.A.', contact: 'Roberto Arias', phone: '+506 2290 7714', confidence: 'alta',
      messages: [
        inc('Les reenvío el correo de Hacienda, habla de una multa.', '8:05 a.m.'),
        out('Recibido, don Roberto. Ya presentamos el recurso; le aviso la respuesta.', '9:05 a.m.'),
      ],
      claims: [
        { text: 'Reenvió un correo de Hacienda sobre una multa.', source: 0 },
        { text: 'El equipo ya presentó el recurso y le avisará la respuesta.', source: 1 },
      ],
    },
    {
      id: 'lucia', name: 'Lucía Fernández', contact: 'Lucía Fernández', phone: '+506 8723 0045', confidence: 'alta',
      messages: [
        inc('Ya firmé el contrato de servicios', '4:30 p.m.'),
        out('¡Bienvenida, Lucía! Empezamos en noviembre.', '4:41 p.m.'),
      ],
      claims: [
        { text: 'Firmó el contrato de servicios.', source: 0 },
        { text: 'Empieza en noviembre.', source: 1 },
      ],
    },
    {
      id: 'taller', name: 'Taller Hermanos Quesada', contact: 'Óscar Quesada', phone: '+506 2447 3381', confidence: 'alta',
      error: 'Óscar solo agradece el recordatorio; no dice que ya envió las facturas.',
      messages: [
        out('Don Óscar, le recordamos enviar las facturas de compras antes del 25.', '10:02 a.m.'),
        inc('Gracias por el recordatorio', '10:15 a.m.'),
      ],
      claims: [
        { text: 'Se le recordó enviar las facturas de compras antes del 25.', source: 0 },
        { text: 'Ya las envió.', source: null },
      ],
    },
  ],
};

export const MODES: { id: Mode; label: string; short: string }[] = [
  { id: 'solo', label: 'Solo el resumen', short: 'Solo el resumen' },
  { id: 'confianza', label: 'Con nivel de confianza', short: 'Con confianza' },
  { id: 'fuente', label: 'Con la fuente de cada frase', short: 'Con la fuente' },
];

export const isWrong = (c: Case) => c.claims.some((x) => x.source === null);

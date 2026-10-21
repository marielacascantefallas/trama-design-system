export type Pay = 'pending' | 'paid' | 'platform' | 'dock';

export type Booking = {
  id: string;
  name: string;
  ref: string;
  adults: number;
  kids: number;
  hotel: string;
  pickup?: string;
  lang: 'Español' | 'Inglés' | 'Alemán';
  pay: Pay;
  payLabel?: string;
  deposit?: number;
  arrived?: boolean;
};

export type Departure = {
  id: string;
  day: 'hoy' | 'mañana' | 'jueves';
  time: string;
  checkin: string;
  tour: string;
  boat: string;
  captain: string;
  cap: number;
  /** Pasajeros sin detalle de reservas (para salidas que no se abren en el prototipo). */
  extra: number;
  bookings: Booking[];
  state: 'sea' | 'next' | 'scheduled' | 'moved';
  sailed?: string;
  weather?: string;
};

export const pax = (d: Departure) => d.extra + d.bookings.reduce((s, b) => s + b.adults + b.kids, 0);

const b = (
  x: Partial<Booking> & Pick<Booking, 'id' | 'name' | 'ref' | 'adults' | 'hotel' | 'lang' | 'pay'>,
): Booking => ({
  kids: 0,
  ...x,
});

export const DEPARTURES: Departure[] = [
  {
    id: 'hoy-700',
    day: 'hoy',
    time: '7:00',
    checkin: '6:30',
    tour: 'Avistamiento de ballenas',
    boat: 'Marea I',
    captain: 'Capitán Diego Mora',
    cap: 24,
    extra: 22,
    bookings: [],
    state: 'sea',
    sailed: 'Zarpó 7:04',
  },
  {
    id: 'hoy-730',
    day: 'hoy',
    time: '7:30',
    checkin: '7:00',
    tour: 'Snorkel en Isla Ballena',
    boat: 'Gaviota',
    captain: 'Capitana Andrea Vega',
    cap: 10,
    extra: 8,
    bookings: [],
    state: 'sea',
    sailed: 'Zarpó 7:31',
  },
  {
    id: 'hoy-930',
    day: 'hoy',
    time: '9:30',
    checkin: '9:00',
    tour: 'Ballenas y Cueva Ventana',
    boat: 'Marea II',
    captain: 'Capitán Kevin Castro',
    cap: 16,
    extra: 0,
    state: 'next',
    bookings: [
      b({
        id: 'R-2041',
        name: 'Familia Rojas',
        ref: 'R-2041, WhatsApp',
        adults: 2,
        kids: 2,
        hotel: 'Hotel Cristal Ballena',
        pickup: '7:55',
        lang: 'Español',
        pay: 'pending',
        deposit: 28000,
      }),
      b({
        id: 'R-2044',
        name: 'Tom y Lisa Meyer',
        ref: 'R-2044, Web',
        adults: 2,
        hotel: 'Oxygen Jungle Villas',
        pickup: '8:05',
        lang: 'Inglés',
        pay: 'pending',
        deposit: 36000,
      }),
      b({
        id: 'V-88190',
        name: 'Familia Patel',
        ref: 'Viator V-88190',
        adults: 2,
        kids: 1,
        hotel: 'Rancho Pacífico',
        pickup: '8:15',
        lang: 'Inglés',
        pay: 'platform',
        payLabel: 'Pagado en Viator',
        arrived: true,
      }),
      b({
        id: 'G-4410',
        name: 'Jonas y Mia Weber',
        ref: 'GetYourGuide G-4410',
        adults: 2,
        hotel: 'Hotel Tangara',
        pickup: '8:25',
        lang: 'Alemán',
        pay: 'platform',
        payLabel: 'Pagado en GYG',
      }),
      b({
        id: 'R-2038',
        name: 'Ana Lucía Chaves',
        ref: 'R-2038, WhatsApp',
        adults: 1,
        hotel: 'En el muelle',
        lang: 'Español',
        pay: 'paid',
        arrived: true,
      }),
      b({
        id: 'R-2046',
        name: 'Carlos Mena',
        ref: 'R-2046, Llamada',
        adults: 2,
        hotel: 'En el muelle',
        lang: 'Español',
        pay: 'paid',
        arrived: true,
      }),
    ],
  },
  {
    id: 'hoy-1300',
    day: 'hoy',
    time: '13:00',
    checkin: '12:30',
    tour: 'Atardecer en Bahía Ballena',
    boat: 'Marea I',
    captain: 'Capitán Diego Mora',
    cap: 24,
    extra: 0,
    state: 'scheduled',
    weather: 'Oleaje 1,8 m',
    bookings: [
      b({
        id: 'R-2048',
        name: 'Familia Herrera',
        ref: 'R-2048, WhatsApp',
        adults: 2,
        kids: 2,
        hotel: 'Hotel Cristal Ballena',
        lang: 'Español',
        pay: 'paid',
      }),
      b({
        id: 'R-2050',
        name: 'Sarah Collins',
        ref: 'R-2050, Web',
        adults: 2,
        hotel: 'Oxygen Jungle Villas',
        lang: 'Inglés',
        pay: 'paid',
      }),
      b({
        id: 'V-88302',
        name: 'Viator V-88302',
        ref: 'Viator V-88302',
        adults: 3,
        hotel: 'Rancho Pacífico',
        lang: 'Inglés',
        pay: 'platform',
        payLabel: 'Pagado en Viator',
      }),
      b({
        id: 'G-4471',
        name: 'Marco y Elena Rossi',
        ref: 'GetYourGuide G-4471',
        adults: 2,
        hotel: 'Hotel Tangara',
        lang: 'Inglés',
        pay: 'platform',
        payLabel: 'Pagado en GYG',
      }),
    ],
  },
  {
    id: 'hoy-1400',
    day: 'hoy',
    time: '14:00',
    checkin: '13:30',
    tour: 'Pesca deportiva privada',
    boat: 'Gaviota',
    captain: 'Capitana Andrea Vega',
    cap: 6,
    extra: 4,
    bookings: [],
    state: 'scheduled',
  },
  {
    id: 'man-700',
    day: 'mañana',
    time: '7:00',
    checkin: '6:30',
    tour: 'Avistamiento de ballenas',
    boat: 'Marea I',
    captain: 'Capitán Diego Mora',
    cap: 24,
    extra: 18,
    bookings: [],
    state: 'scheduled',
  },
  {
    id: 'man-930',
    day: 'mañana',
    time: '9:30',
    checkin: '9:00',
    tour: 'Ballenas y Cueva Ventana',
    boat: 'Marea II',
    captain: 'Capitán Kevin Castro',
    cap: 16,
    extra: 7,
    bookings: [],
    state: 'scheduled',
  },
  {
    id: 'man-1300',
    day: 'mañana',
    time: '13:00',
    checkin: '12:30',
    tour: 'Atardecer en Bahía Ballena',
    boat: 'Marea I',
    captain: 'Capitán Diego Mora',
    cap: 24,
    extra: 9,
    bookings: [],
    state: 'scheduled',
  },
  {
    id: 'jue-1300',
    day: 'jueves',
    time: '13:00',
    checkin: '12:30',
    tour: 'Atardecer en Bahía Ballena',
    boat: 'Marea I',
    captain: 'Capitán Diego Mora',
    cap: 24,
    extra: 8,
    bookings: [],
    state: 'scheduled',
  },
];

export const DAY_LABEL = { hoy: 'Hoy', mañana: 'Mañana, miércoles 21', jueves: 'Jueves 22' } as const;

/** Calendario de la semana. null = sin salida, 'M' = mantenimiento. Las celdas con id salen del estado. */
export type CalCell = number | null | 'M' | { id: string };
export const WEEK = ['Lun 19', 'Mar 20', 'Mié 21', 'Jue 22', 'Vie 23', 'Sáb 24', 'Dom 25'];
export const CAL_ROWS: { time: string; tour: string; boat: string; cap: number; cells: CalCell[] }[] = [
  {
    time: '7:00',
    tour: 'Avistamiento de ballenas',
    boat: 'Marea I',
    cap: 24,
    cells: [24, { id: 'hoy-700' }, { id: 'man-700' }, 12, 16, 24, 24],
  },
  {
    time: '7:30',
    tour: 'Snorkel en Isla Ballena',
    boat: 'Gaviota',
    cap: 10,
    cells: [10, { id: 'hoy-730' }, 6, 'M', 4, 10, 9],
  },
  {
    time: '9:30',
    tour: 'Ballenas y Cueva Ventana',
    boat: 'Marea II',
    cap: 16,
    cells: [12, { id: 'hoy-930' }, { id: 'man-930' }, 9, 11, 16, 15],
  },
  {
    time: '13:00',
    tour: 'Atardecer en Bahía Ballena',
    boat: 'Marea I',
    cap: 24,
    cells: [16, { id: 'hoy-1300' }, { id: 'man-1300' }, { id: 'jue-1300' }, 14, 24, 20],
  },
  {
    time: '14:00',
    tour: 'Pesca deportiva privada',
    boat: 'Gaviota',
    cap: 6,
    cells: [null, { id: 'hoy-1400' }, 6, 'M', 2, 6, null],
  },
];

export type BankMove = { id: string; time: string; from: string; amount: number; booking?: string; note: string };
export const BANK: BankMove[] = [
  { id: 'm1', time: '10:12', from: 'JOSE BRENES SOLANO', amount: 45000, note: 'Sin reserva: ¿Familia Brenes?' },
  {
    id: 'm2',
    time: '9:05',
    from: 'MARIA CHAVES V.',
    amount: 20000,
    booking: 'R-2038',
    note: 'Ana Lucía Chaves, R-2038',
  },
  { id: 'm3', time: '8:58', from: 'CARLOS MENA', amount: 24000, booking: 'R-2046', note: 'Carlos Mena, R-2046' },
  {
    id: 'm4',
    time: '7:40',
    from: 'RAQUEL ROJAS MORA',
    amount: 28000,
    booking: 'R-2041',
    note: 'Familia Rojas, por confirmar',
  },
  { id: 'm5', time: '7:12', from: 'DIEGO ALFARO', amount: 54000, booking: 'R-2029', note: 'R-2029, mañana 7:00' },
  { id: 'm6', time: '6:47', from: 'KARLA SEGURA', amount: 18000, booking: 'R-2031', note: 'R-2031, jueves 9:30' },
  { id: 'm7', time: '6:31', from: 'PABLO ARAYA', amount: 15000, booking: 'R-2027', note: 'R-2027, viernes 7:30' },
  { id: 'm8', time: '6:05', from: 'LAURA JIMENEZ', amount: 18000, booking: 'R-2025', note: 'R-2025, jueves 9:30' },
];

export const PROOFS: Record<string, { proof: string; bank: string | null }> = {
  'R-2041': {
    proof: 'Foto por WhatsApp a las 7:42, SINPE desde 8841 2290',
    bank: '₡28 000 a las 7:40, RAQUEL ROJAS MORA',
  },
  'R-2044': { proof: 'Correo a las 8:15, “SINPE sent from my BN app”', bank: null },
  'R-2052': { proof: 'Pagó por SINPE antes de crear la reserva', bank: '₡45 000 a las 10:12, JOSE BRENES SOLANO' },
};

export const AI_DRAFT = {
  message:
    '“Hola! Somos 4, dos niños de 6 y 9 años. Queremos ir mañana a ver ballenas, el de las 7. Estamos en el Cuna del Ángel. ¿Cuánto sería?”',
  phone: '+506 8890 1123',
  name: 'Familia Brenes',
  adults: 2,
  kids: 2,
  departure: 'man-700',
  hotel: 'Hotel Cuna del Ángel',
  lang: 'Español' as const,
};

export const PRICE = { adult: 45000, kid: 30000, deposit: 0.3 };

export const colones = (n: number) => '₡' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

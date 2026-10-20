import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { AI_DRAFT, DEPARTURES, pax, type Booking, type Departure } from './data';

export type Route = 'hoy' | 'salida' | 'checkin' | 'reservas' | 'calendario' | 'pagos';
const ROUTES: Route[] = ['hoy', 'salida', 'checkin', 'reservas', 'calendario', 'pagos'];

export type State = {
  route: Route;
  deps: Departure[];
  draft: boolean;
  panel: boolean;
  reschedule: string | null;
  toast: string | null;
  linkedBrenes: boolean;
  sel: string;
};

export type Action =
  | { type: 'route'; route: Route }
  | { type: 'open'; dep: string; route?: Route }
  | { type: 'arrive'; dep: string; booking: string }
  | { type: 'confirm'; booking: string }
  | { type: 'toast'; text: string | null }
  | { type: 'panel'; open: boolean }
  | { type: 'dismissDraft' }
  | { type: 'create'; booking: Booking; dep: string }
  | { type: 'openReschedule'; dep: string }
  | { type: 'closeReschedule' }
  | { type: 'reschedule'; from: string; to: string; label: string }
  | { type: 'sail'; dep: string };

const mapBooking = (deps: Departure[], id: string, fn: (b: Booking) => Booking) =>
  deps.map((d) => ({ ...d, bookings: d.bookings.map((b) => (b.id === id ? fn(b) : b)) }));

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'route':
      return { ...s, route: a.route };
    case 'open':
      return { ...s, sel: a.dep, route: a.route ?? 'salida' };
    case 'arrive':
      return {
        ...s,
        deps: s.deps.map((d) =>
          d.id === a.dep
            ? { ...d, bookings: d.bookings.map((b) => (b.id === a.booking ? { ...b, arrived: !b.arrived } : b)) }
            : d,
        ),
      };
    case 'confirm':
      return {
        ...s,
        deps: mapBooking(s.deps, a.booking, (b) => ({ ...b, pay: 'paid' })),
        toast: 'Depósito confirmado. El cliente recibe el recibo por WhatsApp.',
      };
    case 'toast':
      return { ...s, toast: a.text };
    case 'panel':
      return { ...s, panel: a.open };
    case 'dismissDraft':
      return { ...s, draft: false, toast: 'Borrador descartado. El mensaje sigue en WhatsApp.' };
    case 'create':
      return {
        ...s,
        draft: false,
        panel: false,
        linkedBrenes: true,
        deps: s.deps.map((d) => (d.id === a.dep ? { ...d, bookings: [...d.bookings, a.booking] } : d)),
        toast: `Reserva ${a.booking.id} creada para ${a.booking.name}. Se envió el resumen y el número SINPE.`,
      };
    case 'openReschedule':
      return { ...s, reschedule: a.dep };
    case 'closeReschedule':
      return { ...s, reschedule: null };
    case 'reschedule': {
      const from = s.deps.find((d) => d.id === a.from)!;
      const n = pax(from);
      return {
        ...s,
        reschedule: null,
        deps: s.deps.map((d) =>
          d.id === a.from
            ? { ...d, bookings: [], extra: 0, state: 'moved' }
            : d.id === a.to
              ? { ...d, bookings: [...d.bookings, ...from.bookings] }
              : d,
        ),
        toast: `${n} pasajeros movidos a ${a.label}. Se avisó a los clientes en su idioma.`,
      };
    }
    case 'sail': {
      const d = s.deps.find((x) => x.id === a.dep)!;
      const on = d.bookings.filter((b) => b.arrived).reduce((t, b) => t + b.adults + b.kids, 0);
      const next = s.deps.find((x) => x.day === 'hoy' && x.state === 'scheduled');
      return {
        ...s,
        route: 'hoy',
        deps: s.deps.map((x) =>
          x.id === a.dep
            ? { ...x, state: 'sea', sailed: 'Zarpó 9:45' }
            : x.id === next?.id
              ? { ...x, state: 'next' }
              : x,
        ),
        toast: `Check-in cerrado: ${on} a bordo. El manifiesto final quedó registrado.`,
      };
    }
  }
}

const fromHash = (): Route => {
  const r = window.location.hash.replace('#/', '').split('/')[0] as Route;
  return ROUTES.includes(r) ? r : 'hoy';
};

const Ctx = createContext<{ s: State; d: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, {
    route: fromHash(),
    deps: DEPARTURES,
    draft: true,
    panel: false,
    reschedule: null,
    toast: null,
    linkedBrenes: false,
    sel: 'hoy-930',
  });

  useEffect(() => {
    const on = () => d({ type: 'route', route: fromHash() });
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    if (s.route !== fromHash()) window.location.hash = `#/${s.route}`;
  }, [s.route]);

  useEffect(() => {
    if (!s.toast) return;
    const t = setTimeout(() => d({ type: 'toast', text: null }), 4500);
    return () => clearTimeout(t);
  }, [s.toast]);

  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore fuera de StoreProvider');
  return v;
}

export const go = (route: Route) => {
  window.location.hash = `#/${route}`;
};

export const dep = (s: State, id: string) => s.deps.find((d) => d.id === id)!;
export { AI_DRAFT };

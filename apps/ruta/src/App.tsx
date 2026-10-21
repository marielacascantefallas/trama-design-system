import { useEffect, useRef, useState } from 'react';
import { Avatar, TramaTheme } from '@trama';
import { Bell, CalendarDays, Home, List, Wallet } from '../../shared/icons';
import { useStore, type Route } from './store';
import { Today } from './screens/Today';
import { Departure } from './screens/Departure';
import { CheckIn } from './screens/CheckIn';
import { Bookings } from './screens/Bookings';
import { Calendar } from './screens/Calendar';
import { Payments } from './screens/Payments';
import { NewBooking } from './screens/NewBooking';
import { Reschedule } from './screens/Reschedule';

const NAV: { route: Route; label: string; Icon: typeof Home }[] = [
  { route: 'hoy', label: 'Hoy', Icon: Home },
  { route: 'reservas', label: 'Reservas', Icon: List },
  { route: 'calendario', label: 'Calendario', Icon: CalendarDays },
  { route: 'pagos', label: 'Pagos', Icon: Wallet },
];

const TITLES: Record<Route, string> = {
  hoy: 'Hoy',
  salida: 'Salida de 9:30',
  checkin: 'Check-in 9:30',
  reservas: 'Reservas',
  calendario: 'Calendario',
  pagos: 'Pagos',
};

export function useIsMobile() {
  const q = '(max-width: 760px)';
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

function Nav({ variant }: { variant: 'rail' | 'tabbar' }) {
  const { s } = useStore();
  const active = s.route === 'salida' || s.route === 'checkin' ? 'hoy' : s.route;
  return (
    <ul className={`hilo-nav hilo-nav--${variant}`}>
      {NAV.map(({ route, label, Icon }) => (
        <li key={route}>
          <a href={`#/${route}`} className="hilo-nav__item" aria-current={active === route ? 'page' : undefined}>
            <Icon size={20} strokeWidth={1.75} aria-hidden />
            <span>{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function App() {
  const { s } = useStore();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const mobile = useIsMobile();
  // En el celular, "Hoy" es el check-in del guía: es lo que se usa en el muelle.
  const route = mobile && s.route === 'hoy' ? 'checkin' : s.route;

  useEffect(() => {
    document.title = `${TITLES[route]}, Ruta`;
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus();
    main.current?.scrollTo({ top: 0 });
  }, [route]);

  return (
    <TramaTheme brand="ruta" mode="light" className="hilo-app ruta-app">
      <a
        className="hilo-skip"
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <nav className="hilo-rail" aria-label="Principal">
        <span className="hilo-logo" aria-label="Ruta" role="img">
          r
        </span>
        <a className="hilo-proto" href="../" title="Prototipo con datos ficticios, hecho con el design system Trama">
          Prototipo
        </a>
        <Nav variant="rail" />
        <div className="hilo-rail__end">
          <button type="button" className="hilo-icon-btn" aria-label="Notificaciones">
            <Bell size={20} strokeWidth={1.75} aria-hidden />
          </button>
          <Avatar name="Melissa Salas" size="s" decorative={false} />
        </div>
      </nav>
      <main id="contenido" ref={main} tabIndex={-1} className={`hilo-main ruta-main--${route}`}>
        {route === 'hoy' && <Today />}
        {route === 'salida' && <Departure />}
        {route === 'checkin' && <CheckIn />}
        {route === 'reservas' && <Bookings />}
        {route === 'calendario' && <Calendar />}
        {route === 'pagos' && <Payments />}
      </main>
      <nav className="hilo-tabbar" aria-label="Principal móvil">
        <Nav variant="tabbar" />
      </nav>
      {s.panel && <NewBooking />}
      {s.reschedule && <Reschedule />}
      <div className="hilo-toast-region" role="status" aria-live="polite">
        {s.toast && <div className="hilo-toast">{s.toast}</div>}
      </div>
    </TramaTheme>
  );
}

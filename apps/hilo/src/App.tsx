import { useEffect, useRef } from 'react';
import { Avatar, TramaTheme } from '@trama';
import { BarChart3, Bell, Inbox as InboxIcon, SlidersHorizontal, Users } from 'lucide-react';
import { go, useStore, type Route } from './store';
import { Inbox } from './screens/Inbox';
import { ClientView } from './screens/ClientView';
import { Team } from './screens/Team';
import { Settings } from './screens/Settings';
import { AssignModal } from './screens/AssignModal';

const NAV: { route: Route; label: string; Icon: typeof InboxIcon }[] = [
  { route: 'bandeja', label: 'Bandeja', Icon: InboxIcon },
  { route: 'clientes', label: 'Clientes', Icon: Users },
  { route: 'equipo', label: 'Equipo', Icon: BarChart3 },
  { route: 'ajustes', label: 'Ajustes', Icon: SlidersHorizontal },
];

const TITLES: Record<Route, string> = {
  bandeja: 'Bandeja',
  clientes: 'Café Cordillera S.A.',
  equipo: 'Equipo',
  ajustes: 'Ajustes',
};

function Nav({ variant }: { variant: 'rail' | 'tabbar' }) {
  const { s } = useStore();
  return (
    <ul className={`hilo-nav hilo-nav--${variant}`}>
      {NAV.map(({ route, label, Icon }) => (
        <li key={route}>
          <a href={`#/${route}`} className="hilo-nav__item" aria-current={s.route === route ? 'page' : undefined}>
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

  useEffect(() => {
    document.title = `${TITLES[s.route]} · Hilo`;
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus();
  }, [s.route]);

  useEffect(() => {
    if (!window.location.hash) go('bandeja');
  }, []);

  return (
    <TramaTheme brand="hilo" mode="light" className="hilo-app">
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
        <span className="hilo-logo" aria-label="Hilo" role="img">
          h
        </span>
        <a className="hilo-proto" href="../" title="Prototipo con datos ficticios, hecho con el design system Trama">
          Prototipo
        </a>
        <Nav variant="rail" />
        <div className="hilo-rail__end">
          <button type="button" className="hilo-icon-btn" aria-label="Notificaciones">
            <Bell size={20} strokeWidth={1.75} aria-hidden />
          </button>
          <Avatar name="Ana Vargas" size="s" decorative={false} />
        </div>
      </nav>
      <main id="contenido" ref={main} tabIndex={-1} className={`hilo-main hilo-main--${s.route}`}>
        {s.route === 'bandeja' && <Inbox />}
        {s.route === 'clientes' && <ClientView />}
        {s.route === 'equipo' && <Team />}
        {s.route === 'ajustes' && <Settings />}
      </main>
      <nav className="hilo-tabbar" aria-label="Principal móvil">
        <Nav variant="tabbar" />
      </nav>
      {s.assign && <AssignModal />}
      <div className="hilo-toast-region" role="status" aria-live="polite">
        {s.toast && <div className="hilo-toast">{s.toast}</div>}
      </div>
    </TramaTheme>
  );
}

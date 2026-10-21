import { useState } from 'react';
import { Avatar, Button, StatusChip } from '@trama';
import { ArrowLeft, Check, Search } from '../../../shared/icons';
import { colones, pax } from '../data';
import { dep, useStore } from '../store';
import { Bar } from './ui';

/** Check-in del guía en el muelle: un toque por reserva, botones de 48 px. */
export function CheckIn() {
  const { s, d } = useStore();
  const x = dep(s, 'hoy-930');
  const [q, setQ] = useState('');
  const total = pax(x);
  const on = x.bookings.filter((b) => b.arrived).reduce((t, b) => t + b.adults + b.kids, 0);
  const missing = x.bookings.filter((b) => !b.arrived);
  const list = x.bookings.filter((b) => (b.name + b.ref).toLowerCase().includes(q.toLowerCase()));

  if (x.state === 'sea')
    return (
      <div className="ruta-checkin">
        <div className="ruta-checkin__done">
          <Check size={32} aria-hidden />
          <h1 className="hilo-h1">La salida de 9:30 zarpó</h1>
          <p className="hilo-muted">{on} pasajeros a bordo. El manifiesto final quedó registrado.</p>
          <Button variant="secondary" size="l" onClick={() => d({ type: 'route', route: 'hoy' })}>
            Volver a hoy
          </Button>
        </div>
      </div>
    );

  return (
    <div className="ruta-checkin">
      <header className="ruta-checkin__top">
        <div className="hilo-row">
          <button
            type="button"
            className="hilo-icon-btn ruta-back"
            aria-label="Volver"
            onClick={() => d({ type: 'route', route: 'hoy' })}
          >
            <ArrowLeft size={22} aria-hidden />
          </button>
          <div>
            <h1 className="hilo-h2">Check-in de las {x.time}</h1>
            <p className="hilo-caption">
              {x.tour}, {x.boat}
            </p>
          </div>
        </div>
        <div className="ruta-progress" role="group" aria-label="Avance del check-in">
          <div className="hilo-row hilo-row--between">
            <strong>
              {on} de {total} a bordo
            </strong>
            <span>Zarpe 9:45</span>
          </div>
          <Bar value={on} max={total} width="100%" />
        </div>
        <label className="hilo-search ruta-search">
          <Search size={18} aria-hidden />
          <span className="trama-sr-only">Buscar por nombre o reserva</span>
          <input
            type="search"
            placeholder="Buscar por nombre o reserva"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </header>

      <ul className="ruta-checkin__list">
        {list.map((b) => (
          <li key={b.id} className={b.arrived ? 'is-on' : ''}>
            <div className="hilo-row">
              <Avatar name={b.name} />
              <span className="hilo-grow-x">
                <span className="hilo-strong">{b.name}</span>
                <span className="hilo-caption">
                  {b.adults + b.kids} {b.adults + b.kids === 1 ? 'persona' : 'personas'}
                  {b.kids ? `, ${b.kids} ${b.kids === 1 ? 'niño' : 'niños'}` : `, ${b.lang.toLowerCase()}`}
                </span>
                <span className="hilo-caption">
                  {b.hotel === 'En el muelle' ? 'Llega directo al muelle' : `Recoge: ${b.hotel}`}
                </span>
              </span>
              <button
                type="button"
                className={`ruta-arrive ${b.arrived ? 'is-on' : ''}`}
                aria-pressed={!!b.arrived}
                onClick={() => d({ type: 'arrive', dep: x.id, booking: b.id })}
              >
                {b.arrived ? (
                  <>
                    <Check size={18} aria-hidden /> A bordo
                  </>
                ) : (
                  'Llegaron'
                )}
              </button>
            </div>
            {b.pay === 'pending' && (
              <StatusChip tone="warning">
                {b.id === 'R-2044' ? 'Depósito no aparece' : `Cobrar ${colones(b.deposit ?? 0)} si no se confirma`}
              </StatusChip>
            )}
          </li>
        ))}
        {list.length === 0 && <li className="hilo-empty">Nadie coincide con «{q}».</li>}
      </ul>

      <footer className="ruta-checkin__foot">
        <span className="hilo-grow-x">
          <span className="hilo-strong">{missing.length ? `Faltan ${total - on}` : 'Todos a bordo'}</span>
          <span className="hilo-caption">
            {missing.length
              ? `${missing.length} ${missing.length === 1 ? 'reserva' : 'reservas'} sin llegar`
              : 'Listo para zarpar'}
          </span>
        </span>
        <Button
          variant={missing.length ? 'secondary' : 'primary'}
          size="l"
          onClick={() => d({ type: 'sail', dep: x.id })}
        >
          Cerrar check-in
        </Button>
      </footer>
    </div>
  );
}

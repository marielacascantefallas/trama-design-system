import { useState } from 'react';
import { Avatar, Button, Tabs } from '@trama';
import { Search } from '../../../shared/icons';
import { DAY_LABEL } from '../data';
import { useStore } from '../store';
import { payChip } from './Departure';

/** Todas las reservas con detalle en el prototipo, de cualquier canal. */
export function Bookings() {
  const { s, d } = useStore();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('todas');
  const rows = s.deps
    .flatMap((x) => x.bookings.map((b) => ({ b, x })))
    .filter(({ b }) =>
      tab === 'pendientes' ? b.pay === 'pending' : tab === 'plataformas' ? b.pay === 'platform' : true,
    )
    .filter(({ b }) => (b.name + b.ref + b.hotel).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="hilo-page">
      <header className="hilo-row hilo-row--between hilo-page__head">
        <div>
          <h1 className="hilo-h1 hilo-h1--lg">Reservas</h1>
          <p className="hilo-muted">WhatsApp, web, llamadas, Viator y GetYourGuide en una sola lista</p>
        </div>
        <Button onClick={() => d({ type: 'panel', open: true })}>Nueva reserva</Button>
      </header>

      <section className="hilo-card hilo-grow" aria-labelledby="lista">
        <div className="hilo-card__head">
          <div className="hilo-row hilo-row--between">
            <h2 id="lista" className="hilo-h2">
              Próximas reservas
            </h2>
            <label className="hilo-search ruta-search ruta-search--inline">
              <Search size={16} aria-hidden />
              <span className="trama-sr-only">Buscar reserva</span>
              <input
                type="search"
                placeholder="Nombre, código u hotel"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
          </div>
          <Tabs
            aria-label="Filtrar reservas"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'todas', label: 'Todas' },
              { id: 'pendientes', label: 'Depósito pendiente' },
              { id: 'plataformas', label: 'Plataformas' },
            ]}
          />
        </div>
        <div className="hilo-table-wrap" role="region" aria-label="Reservas" tabIndex={0}>
          <table className="hilo-table">
            <thead>
              <tr>
                <th scope="col">Reserva</th>
                <th scope="col">Salida</th>
                <th scope="col">Personas</th>
                <th scope="col">Recogida</th>
                <th scope="col">Pago</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ b, x }) => (
                <tr key={b.id}>
                  <th scope="row">
                    <span className="hilo-person">
                      <Avatar name={b.name} size="s" />
                      <span>
                        {b.name}
                        <span className="hilo-caption">{b.ref}</span>
                      </span>
                    </span>
                  </th>
                  <td>
                    {x.state === 'moved' ? 'Movida' : `${DAY_LABEL[x.day]}, ${x.time}`}
                    <span className="hilo-caption">{x.tour}</span>
                  </td>
                  <td>{b.adults + b.kids}</td>
                  <td>{b.hotel}</td>
                  <td>{payChip(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="hilo-empty">Ninguna reserva coincide.</p>}
        </div>
      </section>
    </div>
  );
}

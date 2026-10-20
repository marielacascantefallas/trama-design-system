import { useState } from 'react';
import { Avatar, Button, MetricCard, StatusChip } from '@trama';
import { ArrowLeft, Check, Ship, Users } from 'lucide-react';
import { pax, type Booking } from '../data';
import { dep, useStore } from '../store';
import { CardHead } from './ui';

export const payChip = (b: Booking) =>
  b.pay === 'pending' ? (
    <StatusChip tone="warning">Depósito por confirmar</StatusChip>
  ) : b.pay === 'platform' ? (
    <StatusChip tone="success">{b.payLabel}</StatusChip>
  ) : (
    <StatusChip tone="success">Pagado</StatusChip>
  );

export function Departure() {
  const { s, d } = useStore();
  const x = dep(s, s.sel);
  const p = pax(x);
  const kids = x.bookings.reduce((t, b) => t + b.kids, 0);
  const paid = x.bookings.filter((b) => b.pay !== 'pending').reduce((t, b) => t + b.adults + b.kids, 0);
  const pend = x.bookings.filter((b) => b.pay === 'pending');
  const arrived = x.bookings.filter((b) => b.arrived).reduce((t, b) => t + b.adults + b.kids, 0);
  const langs = ['Español', 'Inglés', 'Alemán']
    .map((l) => [l, x.bookings.filter((b) => b.lang === l).reduce((t, b) => t + b.adults + b.kids, 0)] as const)
    .filter(([, n]) => n);
  const [checks, setChecks] = useState([true, true, true, false, false]);
  const depositsOk = pend.length === 0;
  const items = [
    ['Chalecos revisados', '16 adultos · 4 infantiles'],
    ['Combustible y motor', 'Revisado por Kevin a las 8:10'],
    ['Clima', 'Oleaje 1,2 m hasta las 13:00'],
    ['Depósitos confirmados', depositsOk ? 'Todos confirmados' : `Faltan ${pend.map((b) => b.name).join(' y ')}`],
    ['Zarpe registrado en Capitanía', 'Se envía con el manifiesto final'],
  ];
  const done = checks.map((c, i) => (i === 3 ? depositsOk : c));
  const stops = x.bookings.filter((b) => b.pickup);

  return (
    <div className="hilo-page">
      <nav aria-label="Ruta" className="hilo-crumbs">
        <a href="#/hoy">
          <ArrowLeft size={16} aria-hidden /> Hoy
        </a>
        <span aria-hidden>/</span>
        <span aria-current="page">
          {x.time} · {x.tour}
        </span>
      </nav>

      <header className="hilo-card hilo-client-head">
        <span className="ruta-time-tile">{x.time}</span>
        <div className="hilo-client-head__data">
          <div className="hilo-row hilo-row--wrap">
            <h1 className="hilo-h1 hilo-h1--lg">{x.tour}</h1>
            <StatusChip tone={x.state === 'sea' ? 'success' : 'neutral'}>
              {x.state === 'sea' ? 'En el mar' : `Check-in abre ${x.checkin}`}
            </StatusChip>
          </div>
          <p className="hilo-muted">Martes 20 de octubre · {x.time} a 13:00 · Muelle de Uvita</p>
          <p className="hilo-row hilo-row--wrap ruta-crew">
            <span className="ruta-inline">
              <Ship size={16} aria-hidden /> {x.boat} · {x.cap} lugares
            </span>
            <span className="ruta-inline">
              <Users size={16} aria-hidden /> {x.captain} · Guía Sofía Méndez (inglés y alemán)
            </span>
          </p>
        </div>
        <div className="hilo-row">
          <Button variant="secondary" onClick={() => d({ type: 'toast', text: 'Manifiesto listo para imprimir.' })}>
            Imprimir manifiesto
          </Button>
          {x.state !== 'sea' && (
            <Button onClick={() => d({ type: 'route', route: 'checkin' })}>Iniciar check-in</Button>
          )}
        </div>
      </header>

      <div className="hilo-metrics">
        <MetricCard label="Pasajeros" value={`${p} de ${x.cap}`} note={`${x.cap - p} lugares libres`} />
        <MetricCard
          label="Check-in"
          value={`${arrived} de ${p}`}
          note={x.state === 'sea' ? 'Zarpó 9:45' : `Abre a las ${x.checkin}`}
        />
        <MetricCard
          label="Pagos"
          value={`${paid} de ${p}`}
          note={pend.length ? `${pend.length} depósitos SINPE por confirmar` : 'Todo pagado'}
          noteTone={pend.length ? 'neutral' : 'success'}
        />
        <MetricCard
          label="Idiomas"
          value={String(langs.length)}
          note={langs.map(([l, n]) => `${n} ${l.toLowerCase()}`).join(' · ')}
        />
      </div>

      <div className="hilo-split">
        <section className="hilo-card" aria-labelledby="manifiesto">
          <CardHead id="manifiesto" title="Manifiesto" side={`${x.bookings.length} reservas · ${p} pasajeros`} />
          <div className="hilo-table-wrap" role="region" aria-label="Manifiesto" tabIndex={0}>
            <table className="hilo-table">
              <thead>
                <tr>
                  <th scope="col">Reserva</th>
                  <th scope="col">Personas</th>
                  <th scope="col">Recogida</th>
                  <th scope="col">Idioma</th>
                  <th scope="col">Pago</th>
                </tr>
              </thead>
              <tbody>
                {x.bookings.map((b) => (
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
                      <span className="hilo-strong">{b.adults + b.kids}</span>
                      {b.kids > 0 && (
                        <span className="hilo-caption">{b.kids === 1 ? '1 niño' : `${b.kids} niños`}</span>
                      )}
                    </td>
                    <td>
                      {b.hotel}
                      {b.pickup && <span className="hilo-caption">Recogida {b.pickup}</span>}
                    </td>
                    <td>{b.lang}</td>
                    <td>{payChip(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hilo-card__foot">
            <span className="hilo-caption">
              Quedan {x.cap - p} lugares{kids ? ` · ${kids} niños a bordo: llevar chalecos talla infantil` : ''}
            </span>
            <Button variant="ghost" size="s" onClick={() => d({ type: 'panel', open: true })}>
              Agregar pasajero
            </Button>
          </div>
        </section>

        <div className="hilo-side">
          <section className="hilo-card" aria-labelledby="zarpar">
            <CardHead
              id="zarpar"
              small
              title="Antes de zarpar"
              side={
                <StatusChip
                  tone={done.every(Boolean) ? 'success' : 'warning'}
                >{`${done.filter(Boolean).length} de 5`}</StatusChip>
              }
            />
            <ul className="hilo-checks ruta-checks">
              {items.map(([t, dd], i) => (
                <li key={t}>
                  <label>
                    <input
                      type="checkbox"
                      checked={done[i]}
                      disabled={i === 3}
                      onChange={() => setChecks(checks.map((c, j) => (j === i ? !c : c)))}
                    />
                    <span>
                      <span className={done[i] ? 'is-done-soft' : ''}>{t}</span>
                      <span className="hilo-caption">{i === 3 ? dd + ' · se marca solo desde Pagos' : dd}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
          <section className="hilo-card hilo-grow" aria-labelledby="recogida">
            <CardHead id="recogida" small title="Ruta de recogida" side="Buseta · Luis Ureña" />
            <ol className="ruta-stops">
              {stops.map((b) => (
                <li key={b.id}>
                  <span className="hilo-strong">{b.pickup}</span>
                  <span className="ruta-dot" aria-hidden />
                  <span>
                    {b.hotel}
                    <span className="hilo-caption">
                      {b.adults + b.kids} pasajeros · {b.name}
                    </span>
                  </span>
                  {b.arrived && <Check size={16} aria-label="Ya en el muelle" className="is-ok" />}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

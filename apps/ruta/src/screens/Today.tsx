import { AICard, Button, MetricCard, StatusChip } from '@trama';
import { Cloud, Ship, UserCheck } from '../../../shared/icons';
import { AI_DRAFT, colones, pax, type Departure } from '../data';
import { go, useStore } from '../store';
import { Bar, CardHead } from './ui';

function status(d: Departure) {
  if (d.state === 'sea') return <StatusChip tone="success">En el mar</StatusChip>;
  if (d.state === 'moved') return <StatusChip tone="neutral">Reprogramada</StatusChip>;
  const pending = d.bookings.filter((b) => b.pay === 'pending').length;
  if (pending) return <StatusChip tone="warning">{pending === 1 ? '1 depósito' : `${pending} depósitos`}</StatusChip>;
  if (d.weather) return <StatusChip tone="warning">{d.weather}</StatusChip>;
  return <StatusChip tone="neutral">Programada</StatusChip>;
}

export function Today() {
  const { s, d } = useStore();
  const today = s.deps.filter((x) => x.day === 'hoy');
  const total = today.reduce((t, x) => t + pax(x), 0);
  const capTotal = today.filter((x) => x.state !== 'moved').reduce((t, x) => t + x.cap, 0);
  const checked = today.reduce(
    (t, x) =>
      t + (x.state === 'sea' ? pax(x) : x.bookings.filter((b) => b.arrived).reduce((u, b) => u + b.adults + b.kids, 0)),
    0,
  );
  const pending = s.deps
    .flatMap((x) => x.bookings.map((b) => ({ ...b, at: x.day === 'hoy' ? `salida ${x.time}` : `${x.day} ${x.time}` })))
    .filter((b) => b.pay === 'pending');
  const pendingAmount = pending.reduce((t, b) => t + (b.deposit ?? 0), 0);
  const next = today.find((x) => x.state === 'next');
  const afternoon = today.find((x) => x.id === 'hoy-1300')!;
  const tomorrow700 = s.deps.find((x) => x.id === AI_DRAFT.departure)!;

  const todo = [
    ...pending.map((b) => ({
      key: b.id,
      title: 'Depósito SINPE sin confirmar',
      detail: `${b.name}, ${colones(b.deposit ?? 0)}, ${b.at}`,
      action: () => go('pagos'),
    })),
    {
      key: 'hotel',
      title: 'Falta hotel de recogida',
      detail: 'Viator V-88231, 3 personas, mañana 7:00',
    },
    {
      key: 'guia',
      title: 'Guía en alemán sin confirmar',
      detail: 'GetYourGuide G-4410, 2 personas, salida 9:30',
    },
    ...(afternoon.state !== 'moved'
      ? [
          {
            key: 'olas',
            warn: true,
            title: 'Oleaje de 1,8 m en la tarde',
            detail: 'Salida de 13:00, 11 pasajeros, decidir antes de las 11:00',
            action: () => d({ type: 'openReschedule', dep: 'hoy-1300' }),
          },
        ]
      : []),
  ];

  return (
    <div className="hilo-page">
      <header className="hilo-row hilo-row--between hilo-page__head">
        <div>
          <h1 className="hilo-h1 hilo-h1--lg">Hoy</h1>
          <p className="hilo-muted">Martes 20 de octubre, Ballena Azul Tours, Uvita, Puntarenas</p>
        </div>
        <div className="hilo-row ruta-head-actions">
          <div className="ruta-weather">
            <Cloud size={18} aria-hidden />
            <span>
              <strong>27 °C, viento 14 km/h</strong>
              <span className="ruta-warn-text">Oleaje 1,2 m, sube a 1,8 m a las 14:00</span>
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => d({ type: 'toast', text: 'Manifiestos listos para imprimir: 5 salidas.' })}
          >
            Imprimir manifiestos
          </Button>
          <Button onClick={() => d({ type: 'panel', open: true })}>Nueva reserva</Button>
        </div>
      </header>

      <div className="hilo-metrics">
        <MetricCard
          label="Pasajeros hoy"
          value={String(total)}
          note={`En ${today.filter((x) => x.state !== 'moved').length} salidas y 3 embarcaciones`}
        />
        <MetricCard
          label="Check-in"
          value={`${checked} de ${total}`}
          note={next ? `Siguiente: salida de ${next.time}` : 'Sin más salidas hoy'}
        />
        <MetricCard
          label="Ocupación"
          value={`${Math.round((total / capTotal) * 100)} %`}
          note={`${total} de ${capTotal} lugares`}
        />
        <MetricCard
          label="Depósitos por confirmar"
          value={colones(pendingAmount)}
          note={pending.length ? `${pending.length} reservas pagadas por SINPE` : 'Todo confirmado'}
          noteTone={pending.length ? 'neutral' : 'success'}
        />
      </div>

      <div className="hilo-split">
        <section className="hilo-card" aria-labelledby="salidas">
          <CardHead id="salidas" title="Salidas de hoy" side="Muelle de Uvita, zarpe 15 min después del check-in" />
          <div className="hilo-table-wrap" role="region" aria-label="Salidas de hoy" tabIndex={0}>
            <table className="hilo-table ruta-deps">
              <thead>
                <tr>
                  <th scope="col">Hora</th>
                  <th scope="col">Tour y embarcación</th>
                  <th scope="col">Cupo</th>
                  <th scope="col">Check-in</th>
                  <th scope="col">Estado</th>
                  <th scope="col">
                    <span className="trama-sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {today.map((x) => {
                  const p = pax(x);
                  const arrived = x.bookings.filter((b) => b.arrived).reduce((t, b) => t + b.adults + b.kids, 0);
                  return (
                    <tr key={x.id} className={x.state === 'next' ? 'is-next' : x.state === 'moved' ? 'is-muted' : ''}>
                      <th scope="row">
                        <span className="ruta-time">{x.time}</span>
                        <span className="hilo-caption">
                          {x.sailed ?? (x.state === 'moved' ? 'Movida a mañana' : `Check-in ${x.checkin}`)}
                        </span>
                      </th>
                      <td>
                        {x.bookings.length > 0 && x.state !== 'moved' ? (
                          <button
                            type="button"
                            className="hilo-link-strong"
                            onClick={() => d({ type: 'open', dep: x.id })}
                          >
                            {x.tour}
                          </button>
                        ) : (
                          <span className="hilo-strong">{x.tour}</span>
                        )}
                        <span className="hilo-caption ruta-boat">
                          <Ship size={14} aria-hidden /> {x.boat}, {x.captain}
                        </span>
                      </td>
                      {x.state === 'moved' ? (
                        <td colSpan={2} className="hilo-caption">
                          11 pasajeros movidos a mañana 13:00
                        </td>
                      ) : (
                        <>
                          <td>
                            <span className="hilo-strong">
                              {p} / {x.cap}
                            </span>
                            <Bar value={p} max={x.cap} width={120} />
                          </td>
                          <td>
                            <span className="ruta-inline">
                              <UserCheck size={16} aria-hidden className={x.state === 'sea' ? 'is-ok' : ''} />
                              {x.state === 'sea' ? `${p} de ${p}` : `${arrived} de ${p}`}
                            </span>
                          </td>
                        </>
                      )}
                      <td>{status(x)}</td>
                      <td className="ruta-actions">
                        {x.state === 'next' && x.id === 'hoy-930' && (
                          <Button size="s" onClick={() => d({ type: 'open', dep: x.id, route: 'checkin' })}>
                            Check-in
                          </Button>
                        )}
                        {x.bookings.length > 0 && x.state !== 'next' && x.id === 'hoy-1300' && (
                          <Button variant="secondary" size="s" onClick={() => d({ type: 'openReschedule', dep: x.id })}>
                            Reprogramar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ruta-fleet">
            <p className="hilo-label">Embarcaciones</p>
            <ul>
              {[
                ['Marea I', '24 lugares, 2 salidas hoy', 'success', 'En el mar'],
                [
                  'Marea II',
                  '16 lugares, 1 salida hoy',
                  today.find((x) => x.id === 'hoy-930')!.state === 'sea' ? 'success' : 'neutral',
                  today.find((x) => x.id === 'hoy-930')!.state === 'sea' ? 'En el mar' : 'En el muelle',
                ],
                ['Gaviota', '10 lugares, 2 salidas hoy', 'warning', 'Mantenimiento jueves'],
              ].map(([n, dd, tone, lab]) => (
                <li key={n}>
                  <span className="hilo-strong">{n}</span>
                  <span className="hilo-caption">{dd}</span>
                  <StatusChip tone={tone as 'success'}>{lab}</StatusChip>
                </li>
              ))}
            </ul>
          </div>
          <div className="hilo-card__foot">
            <span className="hilo-caption">
              Mañana: 6 salidas, {s.deps.filter((x) => x.day === 'mañana').reduce((t, x) => t + pax(x), 0) + 37}{' '}
              pasajeros, 1 reserva sin hotel de recogida
            </span>
            <a className="hilo-link" href="#/calendario">
              Ver calendario
            </a>
          </div>
        </section>

        <div className="hilo-side">
          {s.draft ? (
            <AICard
              title="Reserva leída de WhatsApp"
              meta="Hace 4 min"
              actions={
                <>
                  <Button size="s" onClick={() => d({ type: 'panel', open: true })}>
                    Revisar y crear
                  </Button>
                  <Button variant="ghost" size="s" onClick={() => d({ type: 'dismissDraft' })}>
                    Descartar
                  </Button>
                </>
              }
            >
              {AI_DRAFT.name}, 4 personas (2 niños), Avistamiento de ballenas, mañana 7:00, recogida en{' '}
              {AI_DRAFT.hotel}. Hay cupo: quedan {tomorrow700.cap - pax(tomorrow700)} lugares en Marea I.
            </AICard>
          ) : (
            <AICard title="Sin borradores nuevos" meta="Revisado 10:25">
              Cuando llegue una reserva por WhatsApp o por correo de una plataforma, la leo y te dejo el borrador aquí.
            </AICard>
          )}

          <section className="hilo-card hilo-grow" aria-labelledby="resolver">
            <CardHead
              id="resolver"
              small
              title="Por resolver"
              side={<StatusChip tone={todo.length ? 'warning' : 'success'}>{String(todo.length)}</StatusChip>}
            />
            <ul className="ruta-todo">
              {todo.map((t) => (
                <li key={t.key}>
                  <span className="hilo-grow-x">
                    {t.action ? (
                      <button type="button" className="hilo-link-strong" onClick={t.action}>
                        {t.title}
                      </button>
                    ) : (
                      <span className="hilo-strong">{t.title}</span>
                    )}
                    <span className="hilo-caption">{t.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="hilo-card__foot hilo-card__foot--plain">
              <Button variant="secondary" size="s" onClick={() => go('pagos')}>
                Ir a pagos
              </Button>
              {afternoon.state !== 'moved' && (
                <Button variant="ghost" size="s" onClick={() => d({ type: 'openReschedule', dep: 'hoy-1300' })}>
                  Reprogramar 13:00
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

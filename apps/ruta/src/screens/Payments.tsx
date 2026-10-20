import { useState } from 'react';
import { Avatar, Button, MetricCard, StatusChip, Tabs } from '@trama';
import { Lock, MessageSquare, Wallet } from 'lucide-react';
import { BANK, PROOFS, colones } from '../data';
import { useStore } from '../store';
import { payChip } from './Departure';

export function Payments() {
  const { s, d } = useStore();
  const [tab, setTab] = useState('confirmar');
  const all = s.deps.flatMap((x) =>
    x.bookings.map((b) => ({ ...b, when: x.day === 'hoy' ? `hoy ${x.time}` : `${x.day} ${x.time}` })),
  );
  const pending = all.filter((b) => b.pay === 'pending' && PROOFS[b.id]);
  const confirmedToday = all.filter((b) => b.pay === 'paid' && PROOFS[b.id]);
  const pendingAmount = pending.reduce((t, b) => t + (b.deposit ?? 0), 0);
  const created = all.find((b) => b.id === 'R-2052');

  return (
    <div className="hilo-page">
      <header className="hilo-row hilo-row--between hilo-page__head">
        <div>
          <h1 className="hilo-h1 hilo-h1--lg">Pagos</h1>
          <p className="hilo-muted">Depósitos y cobros de octubre · SINPE Móvil, tarjeta, efectivo y plataformas</p>
        </div>
        <div className="hilo-row">
          <Button
            variant="secondary"
            onClick={() => d({ type: 'toast', text: 'Exportado: pagos-octubre.csv para contabilidad.' })}
          >
            Exportar para contabilidad
          </Button>
          <Button>Registrar pago</Button>
        </div>
      </header>

      <div className="hilo-metrics">
        <MetricCard
          label="Cobrado en octubre"
          value={colones(4860000 + 64000 - pendingAmount)}
          note="312 reservas pagadas o con depósito"
        />
        <MetricCard
          label="Por confirmar"
          value={colones(pendingAmount)}
          note={pending.length ? `${pending.length} depósitos SINPE de hoy` : 'Todo confirmado'}
          noteTone={pending.length ? 'neutral' : 'success'}
        />
        <MetricCard
          label="Saldo a cobrar en el muelle"
          value="₡1 215 000"
          note="27 reservas, se paga el día del tour"
        />
        <MetricCard label="Pendiente de plataformas" value="₡2 140 000" note="Viator y GetYourGuide liquidan el 5" />
      </div>

      <div className="hilo-split">
        <section className="hilo-card" aria-labelledby="depositos">
          <div className="hilo-card__head">
            <h2 id="depositos" className="hilo-h2">
              Depósitos
            </h2>
            <Tabs
              aria-label="Filtrar depósitos"
              value={tab}
              onChange={setTab}
              items={[
                { id: 'confirmar', label: 'Por confirmar', count: pending.length },
                { id: 'hoy', label: 'Recibidos hoy', count: 9 + confirmedToday.length },
                { id: 'saldos', label: 'Saldos pendientes', count: 27 },
              ]}
            />
          </div>
          <div className="ruta-deposits">
            {tab === 'confirmar' &&
              (pending.length ? (
                pending.map((b) => {
                  const pr = PROOFS[b.id];
                  const match = !!pr.bank;
                  return (
                    <article
                      key={b.id}
                      className={`ruta-deposit ${match ? '' : 'is-warn'}`}
                      aria-label={`Depósito de ${b.name}`}
                    >
                      <div className="ruta-deposit__top">
                        <Avatar name={b.name} size="s" />
                        <span className="hilo-grow-x">
                          <span className="hilo-strong">{b.name}</span>
                          <span className="hilo-caption">
                            {b.id} · salida de {b.when} · {b.adults + b.kids} personas
                          </span>
                        </span>
                        <span className="ruta-amount">{colones(b.deposit ?? 0)}</span>
                      </div>
                      <div className="ruta-deposit__cmp">
                        <span>
                          <MessageSquare size={16} aria-hidden />
                          <span>
                            <span className="hilo-caption">Comprobante del cliente</span>
                            {pr.proof}
                          </span>
                        </span>
                        <span>
                          <Wallet size={16} aria-hidden />
                          <span>
                            <span className="hilo-caption">Movimiento en BAC</span>
                            <span className={match ? '' : 'ruta-warn-text'}>
                              {pr.bank ?? `Sin movimiento de ${colones(b.deposit ?? 0)} desde ayer`}
                            </span>
                          </span>
                        </span>
                      </div>
                      <div className="ruta-deposit__act">
                        <StatusChip tone={match ? 'success' : 'warning'}>
                          {match ? 'Coincide monto y nombre' : 'Aún no aparece en el banco'}
                        </StatusChip>
                        <span className="hilo-grow-x" />
                        <Button variant="ghost" size="s">
                          Ver comprobante
                        </Button>
                        {match ? (
                          <Button size="s" onClick={() => d({ type: 'confirm', booking: b.id })}>
                            Confirmar depósito
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="s"
                            onClick={() =>
                              d({ type: 'toast', text: `Se le pidió otro comprobante a ${b.name} por correo.` })
                            }
                          >
                            Pedir otro comprobante
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="hilo-empty">No hay depósitos por confirmar. Todo lo de hoy cuadra con el banco.</p>
              ))}
            {tab === 'hoy' && (
              <ul className="ruta-received">
                {[...confirmedToday, ...all.filter((b) => b.pay === 'paid' && !PROOFS[b.id])].map((b) => (
                  <li key={b.id}>
                    <span className="hilo-grow-x">
                      <span className="hilo-strong">{b.name}</span>
                      <span className="hilo-caption">
                        {b.id} · {b.when}
                      </span>
                    </span>
                    {payChip(b)}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'saldos' && (
              <p className="hilo-empty">
                27 reservas pagan el saldo en el muelle, el día del tour. En el check-in se avisa a quién cobrar.
              </p>
            )}
            <div className="ruta-methods">
              <p className="hilo-label">Recibido hoy por método</p>
              <ul>
                <li>
                  <span className="hilo-caption">SINPE Móvil</span>
                  <span className="hilo-strong">₡222 000</span>
                  <span className="hilo-caption">8 pagos · {s.linkedBrenes ? 'todos asociados' : '1 sin reserva'}</span>
                </li>
                <li>
                  <span className="hilo-caption">Tarjeta</span>
                  <span className="hilo-strong">₡96 000</span>
                  <span className="hilo-caption">2 pagos en el muelle</span>
                </li>
                <li>
                  <span className="hilo-caption">Efectivo</span>
                  <span className="hilo-strong">₡30 000</span>
                  <span className="hilo-caption">1 pago · caja del muelle</span>
                </li>
                <li>
                  <span className="hilo-caption">Plataformas</span>
                  <span className="hilo-strong">₡0</span>
                  <span className="hilo-caption">Se liquida el 5 de noviembre</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="hilo-card__foot">
            <span className="hilo-caption">
              Si un depósito no se confirma 1 hora antes de zarpar, la reserva pasa a “pago en el muelle”.
            </span>
          </div>
        </section>

        <section className="hilo-card" aria-labelledby="banco">
          <div className="hilo-card__pad">
            <div className="hilo-row hilo-row--between">
              <h2 id="banco" className="hilo-strong">
                Movimientos del banco
              </h2>
              <span className="hilo-caption">BAC · 10:15</span>
            </div>
            <p className="hilo-caption">Entradas por SINPE Móvil de hoy</p>
          </div>
          <ul className="ruta-bank">
            {BANK.map((m) => {
              const brenes = m.id === 'm1';
              const note = brenes && s.linkedBrenes && created ? `${created.name} · ${created.id}` : m.note;
              return (
                <li key={m.id}>
                  <span className="hilo-caption ruta-bank__time">{m.time}</span>
                  <span className="hilo-grow-x">
                    <span>{m.from}</span>
                    <span className={`hilo-caption ${brenes && !s.linkedBrenes ? 'ruta-warn-text' : ''}`}>{note}</span>
                  </span>
                  <span className="hilo-strong">{colones(m.amount)}</span>
                </li>
              );
            })}
          </ul>
          <div className="hilo-card__foot">
            <span className="hilo-caption ruta-inline">
              <Lock size={14} aria-hidden /> Conexión de solo lectura con BAC Credomatic
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

import { AICard, Avatar, Button, MetricCard, StatusChip } from '@trama';
import { AlertTriangle } from 'lucide-react';
import { LOAD_LIMIT } from '../data';
import { go, useStore } from '../store';

const BEHIND = [
  {
    id: 'ferreteria-el-roble',
    name: 'Ferretería El Roble',
    msg: 'Les mando el estado de cuenta del BCR',
    wait: '2 h 14 min',
    tone: 'danger' as const,
  },
  {
    id: 'transportes-brenes',
    name: 'Transportes Brenes',
    msg: '¿Cuánto me toca pagar de planilla este mes?',
    wait: '1 h 52 min',
    tone: 'danger' as const,
  },
  {
    id: 'jose-rojas',
    name: 'José Rojas',
    msg: 'Necesito una constancia de ingresos',
    wait: '58 min',
    tone: 'warning' as const,
  },
];

const URGENCIES = [
  { name: 'Café Cordillera', why: 'Pago de la D-104 vence hoy', id: 'cafe-cordillera' },
  { name: 'Inversiones Arias S.A.', why: 'Menciona una multa de Hacienda' },
  { name: 'Ferretería El Roble', why: 'Pago con estado de cuenta, hoy', id: 'ferreteria-el-roble' },
  { name: 'Soda La Esquina', why: 'Inscripción en Hacienda, hoy' },
  { name: 'Panadería Santa Ana', why: 'Planilla CCSS vence hoy' },
];

export function Team() {
  const { s, d } = useStore();
  const open = (id: string) => {
    d({ type: 'select', id });
    go('bandeja');
  };
  const pendingUrgent = (id?: string) => !!id && !!s.chats.find((c) => c.id === id)?.urgent;
  const left = URGENCIES.filter((u) => pendingUrgent(u.id));

  return (
    <div className="hilo-page">
      <header className="hilo-row hilo-row--between hilo-page__head">
        <div>
          <h1 className="hilo-h1 hilo-h1--lg">Equipo</h1>
          <p className="hilo-muted">Hoy, martes 20 de octubre · 6 personas en turno · actualizado 9:41</p>
        </div>
        <div className="hilo-row">
          <Button variant="secondary">Exportar semana</Button>
          <Button onClick={() => go('bandeja')}>Ver bandeja del equipo</Button>
        </div>
      </header>

      <div className="hilo-metrics">
        <MetricCard
          label="Sin responder"
          value={String(s.chats.filter((c) => c.pending).length)}
          note="2 llevan más de 2 horas"
          noteTone="danger"
        />
        <MetricCard
          label="Sin asignar"
          value={String(s.chats.filter((c) => c.group === 'sin-asignar').length)}
          note="Llegaron después de las 9:00"
        />
        <MetricCard label="Primera respuesta (hoy)" value="18 min" note="4 min mejor que la semana pasada" />
        <MetricCard label="Resueltos hoy" value="27" note="De 41 conversaciones abiertas" />
      </div>

      <div className="hilo-split">
        <div className="hilo-stack">
          <section className="hilo-card" aria-labelledby="carga">
            <div className="hilo-row hilo-row--between hilo-card__pad">
              <h2 id="carga" className="hilo-h2">
                Carga por persona
              </h2>
              <span className="hilo-caption">Límite sugerido: {LOAD_LIMIT} chats activos</span>
            </div>
            <div className="hilo-table-wrap">
              <table className="hilo-table">
                <thead>
                  <tr>
                    <th scope="col">Persona</th>
                    <th scope="col">Chats activos</th>
                    <th scope="col">Sin responder</th>
                    <th scope="col">Tiempo medio</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {s.team.map((p) => {
                    const over = p.load > LOAD_LIMIT;
                    return (
                      <tr key={p.id}>
                        <th scope="row">
                          <span className="hilo-person">
                            <Avatar name={p.name} size="s" />
                            <span>
                              {p.name}
                              <span className="hilo-caption">{p.role}</span>
                            </span>
                          </span>
                        </th>
                        <td>
                          <span className="hilo-load">
                            <span className="hilo-bar" aria-hidden>
                              <span
                                style={{ width: `${Math.min(p.load / 16, 1) * 100}%` }}
                                className={over ? 'is-over' : ''}
                              />
                            </span>
                            <span className="hilo-strong">{p.load}</span>
                          </span>
                        </td>
                        <td className={p.unanswered > 1 ? 'is-danger hilo-em' : ''}>{p.unanswered}</td>
                        <td>{p.avg}</td>
                        <td>
                          <StatusChip tone={over ? 'warning' : 'success'}>{over ? 'Atrasada' : 'Al día'}</StatusChip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="hilo-card hilo-grow" aria-labelledby="atras">
            <div className="hilo-row hilo-row--between hilo-card__pad">
              <h2 id="atras" className="hilo-h2">
                Se están quedando atrás
              </h2>
              <span className="hilo-caption">Sin respuesta hace más de 45 min</span>
            </div>
            <ul className="hilo-behind">
              {BEHIND.map((b) => {
                const c = s.chats.find((x) => x.id === b.id);
                const who = s.team.find((p) => p.id === c?.owner)?.name ?? 'Sin asignar';
                return (
                  <li key={b.id}>
                    <Avatar name={b.name} size="s" />
                    <span className="hilo-grow-x">
                      <span className="hilo-strong">{b.name}</span>
                      <span className="hilo-caption">
                        “{b.msg}” · {who}
                      </span>
                    </span>
                    <StatusChip tone={b.tone}>{b.wait}</StatusChip>
                    <Button variant="ghost" size="s" onClick={() => d({ type: 'openAssign', ids: [b.id] })}>
                      Reasignar
                    </Button>
                    <Button variant="secondary" size="s" onClick={() => open(b.id)}>
                      Abrir
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="hilo-side">
          <AICard
            title="Reporte del día"
            meta={s.reportSent ? 'Enviado 9:42' : 'Borrador 9:41'}
            actions={
              s.reportSent ? undefined : (
                <>
                  <Button size="s" onClick={() => d({ type: 'sendReport' })}>
                    Enviar al equipo
                  </Button>
                  <Button variant="ghost" size="s">
                    Editar
                  </Button>
                </>
              )
            }
          >
            Mañana tranquila salvo Ana: tiene 14 chats y 3 sin responder, dos de más de 2 horas. Luis tiene espacio para
            4 más. Hilo marcó 5 urgencias por vencimientos de hoy;{' '}
            {left.length ? `faltan ${left.length}.` : 'ya se atendieron todas.'}
          </AICard>

          <section className="hilo-card hilo-grow" aria-labelledby="urgencias">
            <div className="hilo-card__pad">
              <div className="hilo-row hilo-row--between">
                <h2 id="urgencias" className="hilo-strong">
                  Urgencias de hoy
                </h2>
                <StatusChip>Automáticas</StatusChip>
              </div>
              <p className="hilo-caption">
                Hilo las marca solo cuando un mensaje menciona un vencimiento, una multa o a Hacienda.
              </p>
            </div>
            <ul className="hilo-urgencies">
              {URGENCIES.map((u) => {
                const pend = pendingUrgent(u.id);
                return (
                  <li key={u.name}>
                    <AlertTriangle size={16} aria-hidden className={pend ? 'is-danger' : ''} />
                    <span className="hilo-grow-x">
                      {u.id ? (
                        <button type="button" className="hilo-link-strong" onClick={() => open(u.id!)}>
                          {u.name}
                        </button>
                      ) : (
                        <span className="hilo-strong">{u.name}</span>
                      )}
                      <span className="hilo-caption">{u.why}</span>
                    </span>
                    <StatusChip tone={pend ? 'danger' : 'success'}>{pend ? 'Pendiente' : 'Atendida'}</StatusChip>
                  </li>
                );
              })}
            </ul>
            <div className="hilo-card__foot">
              <span className="hilo-caption">5 marcadas hoy · {s.unmarked} quitadas a mano</span>
              <a className="hilo-link" href="#/ajustes">
                Editar reglas
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

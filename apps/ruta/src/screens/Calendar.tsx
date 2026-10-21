import { Button, MetricCard } from '@trama';
import { ArrowLeft, ArrowRight } from '../../../shared/icons';
import { CAL_ROWS, WEEK, pax, type CalCell } from '../data';
import { useStore, type State } from '../store';
import { Bar } from './ui';

const value = (s: State, c: CalCell) =>
  typeof c === 'object' && c !== null ? pax(s.deps.find((d) => d.id === c.id)!) : c;

export function Calendar() {
  const { s, d } = useStore();
  const rows = CAL_ROWS.map((r) => ({ ...r, vals: r.cells.map((c) => value(s, c)) }));
  let people = 0;
  let cap = 0;
  let full = 0;
  rows.forEach((r) =>
    r.vals.forEach((v) => {
      if (typeof v === 'number') {
        people += v;
        cap += r.cap;
        if (v === r.cap) full++;
      }
    }),
  );
  const moved = s.deps.find((x) => x.id === 'hoy-1300')!.state === 'moved';

  return (
    <div className="hilo-page">
      <header className="hilo-row hilo-row--between hilo-page__head">
        <div>
          <h1 className="hilo-h1 hilo-h1--lg">Calendario</h1>
          <p className="hilo-muted">Ocupación por salida, semana del 19 al 25 de octubre</p>
        </div>
        <div className="hilo-row">
          <button type="button" className="hilo-icon-btn hilo-icon-btn--outline" aria-label="Semana anterior">
            <ArrowLeft size={18} aria-hidden />
          </button>
          <Button variant="secondary">Esta semana</Button>
          <button type="button" className="hilo-icon-btn hilo-icon-btn--outline" aria-label="Semana siguiente">
            <ArrowRight size={18} aria-hidden />
          </button>
          <Button
            onClick={() => d({ type: 'toast', text: 'En el prototipo, las salidas nuevas se crean desde Ajustes.' })}
          >
            Nueva salida
          </Button>
        </div>
      </header>

      <div className="hilo-metrics">
        <MetricCard label="Pasajeros en la semana" value={String(people)} note="Sábado lleno, domingo al 92 %" />
        <MetricCard
          label="Ocupación"
          value={`${Math.round((people / cap) * 100)} %`}
          note={`${people} de ${cap} lugares`}
        />
        <MetricCard label="Salidas llenas" value={String(full)} note="Abre una salida extra el sábado" />
        <MetricCard
          label="Por clima"
          value="1 salida"
          note={moved ? 'Martes 13:00 movida al miércoles' : 'Martes 13:00 en revisión'}
        />
      </div>

      <section className="hilo-card ruta-cal-card" aria-labelledby="cal-titulo">
        <h2 id="cal-titulo" className="trama-sr-only">
          Ocupación de la semana
        </h2>
        <div className="hilo-table-wrap" role="region" aria-label="Calendario de la semana" tabIndex={0}>
          <table className="ruta-cal">
            <thead>
              <tr>
                <th scope="col">Salida</th>
                {WEEK.map((w, i) => (
                  <th key={w} scope="col" className={i === 1 ? 'is-today' : ''}>
                    {w}
                    {i === 1 && ', hoy'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.time + r.tour}>
                  <th scope="row">
                    <span className="hilo-strong">
                      {r.time}, {r.tour}
                    </span>
                    <span className="hilo-caption">
                      {r.boat}, {r.cap} lugares
                    </span>
                  </th>
                  {r.vals.map((v, i) => {
                    const today = i === 1 ? 'is-today' : '';
                    if (v === 'M')
                      return (
                        <td key={i} className={`is-off ${today}`}>
                          Mantenimiento
                        </td>
                      );
                    if (v === null)
                      return (
                        <td key={i} className={`is-none ${today}`}>
                          Sin salida
                        </td>
                      );
                    const isMoved = moved && r.time === '13:00' && i === 1;
                    const warn = !moved && r.time === '13:00' && i === 1;
                    return (
                      <td key={i} className={today}>
                        <span className="hilo-strong">{isMoved ? 'Reprogramada' : `${v} / ${r.cap}`}</span>
                        {!isMoved && <Bar value={v} max={r.cap} width={100} />}
                        <span className={`hilo-caption ${warn ? 'ruta-warn-text' : v === r.cap ? 'ruta-ok-text' : ''}`}>
                          {isMoved
                            ? 'Pasajeros al miércoles'
                            : warn
                              ? 'Oleaje: en revisión'
                              : v === r.cap
                                ? 'Lleno'
                                : `Quedan ${r.cap - v}`}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total del día</th>
                {WEEK.map((w, i) => {
                  let p = 0;
                  let c = 0;
                  rows.forEach((r) => {
                    const v = r.vals[i];
                    if (typeof v === 'number' && !(moved && r.time === '13:00' && i === 1)) {
                      p += v;
                      c += r.cap;
                    }
                  });
                  return (
                    <td key={w} className={i === 1 ? 'is-today' : ''}>
                      <span className="hilo-strong">
                        {p} de {c}
                      </span>
                      <span className="hilo-caption">{Math.round((p / c) * 100)} %</span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

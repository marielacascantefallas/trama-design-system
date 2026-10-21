import { useRef, useState, type KeyboardEvent } from 'react';
import { AICard, Button, MessageBubble, StatusChip, TramaTheme } from '@trama';
import { LabNav } from '../../shared/LabNav';
import { MODES, ROUNDS, isWrong, type Case, type Mode } from './cases';

interface Answer { said: 'ok' | 'fix'; ms: number }
type Answers = Record<Mode, Record<string, Answer>>;

export function App() {
  const [mode, setMode] = useState<Mode>('solo');
  const [answers, setAnswers] = useState<Answers>({ solo: {}, confianza: {}, fuente: {} });

  const go = (m: Mode, focus = false) => { setMode(m); if (focus) document.getElementById(`modo-${m}`)?.focus(); };
  const onKey = (e: KeyboardEvent) => {
    const i = MODES.findIndex((m) => m.id === mode);
    if (e.key === 'ArrowRight') { e.preventDefault(); go(MODES[(i + 1) % 3].id, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(MODES[(i + 2) % 3].id, true); }
  };

  return (
    <>
      <a className="skip" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>
        Saltar al contenido
      </a>
      <header className="bar">
        <strong>Trama</strong>
        <LabNav current="confianza" />
      </header>
      <main id="contenido" tabIndex={-1} className="dx">
        <h1>¿Qué ayuda más a revisar lo que dice la IA?</h1>
        <p className="lead">
          Resúmenes que Hilo escribe para una contadora. En cada ronda hay cuatro, y dos dicen algo que el cliente nunca
          escribió. Cada forma de mostrar la IA tiene casos distintos, para que no te sepas las respuestas.
        </p>
        <div className="cf-modes">
          <span className="cf-modes__label" id="modos">Mostrar la IA</span>
          <div role="tablist" aria-labelledby="modos" onKeyDown={onKey}>
            {MODES.map((m) => {
              const n = Object.keys(answers[m.id]).length;
              return (
                <button
                  key={m.id} id={`modo-${m.id}`} role="tab" type="button" className="tab"
                  aria-selected={mode === m.id} aria-controls="ronda" tabIndex={mode === m.id ? 0 : -1}
                  onClick={() => go(m.id)}
                >
                  {m.label}
                  <span className="cf-count">{n === 4 ? ', terminada' : n ? `, ${n} de 4` : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div id="ronda" role="tabpanel" aria-labelledby={`modo-${mode}`}>
          <Round
            key={mode}
            mode={mode}
            answers={answers[mode]}
            onAnswer={(id, a) => setAnswers((s) => ({ ...s, [mode]: { ...s[mode], [id]: a } }))}
            onNext={() => { const next = MODES.find((m) => Object.keys(answers[m.id]).length < 4 && m.id !== mode); if (next) go(next.id, true); }}
          />
        </div>
        <Results answers={answers} onReset={() => { setAnswers({ solo: {}, confianza: {}, fuente: {} }); go('solo'); }} />
        <Why />
      </main>
    </>
  );
}

function Round({ mode, answers, onAnswer, onNext }: {
  mode: Mode; answers: Record<string, Answer>; onAnswer: (id: string, a: Answer) => void; onNext: () => void;
}) {
  const cases = ROUNDS[mode];
  const firstOpen = cases.findIndex((c) => !answers[c.id]);
  const [i, setI] = useState(firstOpen === -1 ? 3 : firstOpen);
  const [hover, setHover] = useState<number | null>(null);
  const t0 = useRef(performance.now());
  const c = cases[i];
  const a = answers[c.id];
  const done = Object.keys(answers).length === 4;

  const answer = (said: 'ok' | 'fix') => {
    onAnswer(c.id, { said, ms: performance.now() - t0.current });
    requestAnimationFrame(() => document.getElementById('veredicto')?.focus());
  };
  const next = () => {
    t0.current = performance.now();
    setHover(null);
    if (i < 3) { setI(i + 1); requestAnimationFrame(() => document.getElementById('caso-titulo')?.focus()); }
    else onNext();
  };

  return (
    <div className="cf-case">
      <TramaTheme brand="hilo" mode="light" surface className="cf-chat">
        <h2 id="caso-titulo" tabIndex={-1} className="cf-chat__title">
          {c.name}
          <span className="trama-sr-only">, caso {i + 1} de 4</span>
        </h2>
        <p className="cf-chat__sub">{c.contact}, {c.phone}</p>
        <ol className="cf-msgs" aria-label="Mensajes de la conversación">
          {c.messages.map((m, k) => (
            <li key={k} className={mode === 'fuente' && hover === k ? 'is-source' : ''}>
              <MessageBubble side={m.side} time={m.time} author={m.side === 'outgoing' ? 'Equipo' : undefined}>{m.text}</MessageBubble>
            </li>
          ))}
        </ol>
      </TramaTheme>

      <TramaTheme brand="hilo" mode="light" className="cf-ai">
        <p className="cf-progress" aria-hidden>Caso {i + 1} de 4</p>
        <AICard
          title="Resumen de la conversación"
          actions={
            a ? undefined : (
              <>
                <Button variant="secondary" onClick={() => answer('ok')}>Es correcto</Button>
                <Button variant="ghost" onClick={() => answer('fix')}>Corregir</Button>
              </>
            )
          }
        >
          {mode === 'fuente' ? (
            <ul className="cf-claims">
              {c.claims.map((cl, k) => (
                <li
                  key={k} className={cl.source === null ? 'is-unsourced' : ''} tabIndex={0}
                  onMouseEnter={() => setHover(cl.source)} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(cl.source)} onBlur={() => setHover(null)}
                >
                  {cl.text}
                  <small>
                    {cl.source === null
                      ? `Sin fuente: ${cl.note ?? 'el cliente no lo dice'}`
                      : `Mensaje de las ${c.messages[cl.source].time}`}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <>
              {mode === 'confianza' && (
                <p className="cf-conf">
                  <StatusChip tone={c.confidence === 'alta' ? 'success' : 'warning'}>Confianza {c.confidence}</StatusChip>
                </p>
              )}
              <p className="cf-summary">{c.claims.map((cl) => cl.text).join(' ')}</p>
            </>
          )}
        </AICard>
        {a && (
          <div className={`cf-verdict ${(a.said === 'fix') === isWrong(c) ? 'is-right' : 'is-wrong'}`} id="veredicto" tabIndex={-1}>
            <strong>
              {(a.said === 'fix') === isWrong(c)
                ? isWrong(c) ? 'Bien visto: tenía un error.' : 'Correcto: el resumen estaba bien.'
                : isWrong(c) ? 'Se te pasó: tenía un error.' : 'Este estaba bien.'}
            </strong>
            <span>{isWrong(c) ? c.error : 'Cada frase sale de un mensaje de la conversación.'}</span>
            <Button onClick={next}>{i < 3 ? 'Siguiente caso' : done ? 'Ir a otra forma' : 'Siguiente caso'}</Button>
          </div>
        )}
        <p className="note">
          Conversaciones del prototipo de Hilo. Los resúmenes son ejemplos escritos para el experimento; las fuentes y la
          confianza están anotadas a mano.
        </p>
      </TramaTheme>
    </div>
  );
}

function Results({ answers, onReset }: { answers: Answers; onReset: () => void }) {
  const stat = (m: Mode) => {
    const cs = ROUNDS[m];
    const got = cs.filter((c) => answers[m][c.id]);
    const caught = cs.filter((c) => isWrong(c) && answers[m][c.id]?.said === 'fix').length;
    const false_ = cs.filter((c) => !isWrong(c) && answers[m][c.id]?.said === 'fix').length;
    const secs = got.length ? got.reduce((t, c) => t + answers[m][c.id].ms, 0) / got.length / 1000 : null;
    return { n: got.length, caught, false_, secs };
  };
  const s = Object.fromEntries(MODES.map((m) => [m.id, stat(m.id)])) as Record<Mode, ReturnType<typeof stat>>;
  const any = MODES.some((m) => s[m.id].n);
  const cell = (m: Mode, v: string) => (s[m].n ? v : '');
  return (
    <section aria-labelledby="t-prueba" className="dx-results">
      <h2 id="t-prueba">Tu prueba</h2>
      <p className="note" role="status">
        {any ? 'Tus respuestas de esta sesión. Nada sale de tu navegador.' : 'Responde los casos para ver tus números. Nada sale de tu navegador.'}
      </p>
      <table>
        <thead>
          <tr><th scope="col"><span className="trama-sr-only">Medida</span></th>{MODES.map((m) => <th scope="col" key={m.id}>{m.short}</th>)}</tr>
        </thead>
        <tbody>
          <tr><th scope="row">Casos respondidos</th>{MODES.map((m) => <td key={m.id}>{s[m.id].n} de 4</td>)}</tr>
          <tr><th scope="row">Errores que encontraste</th>{MODES.map((m) => <td key={m.id}>{cell(m.id, `${s[m.id].caught} de 2`)}</td>)}</tr>
          <tr><th scope="row">Correctos que marcaste como error</th>{MODES.map((m) => <td key={m.id}>{cell(m.id, String(s[m.id].false_))}</td>)}</tr>
          <tr><th scope="row">Segundos por caso</th>{MODES.map((m) => <td key={m.id}>{s[m.id].secs === null ? '' : (s[m.id].secs as number).toLocaleString('es-CR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>)}</tr>
        </tbody>
      </table>
      {any && <button type="button" className="dx-refill cf-reset" onClick={onReset}>Empezar de nuevo</button>}
    </section>
  );
}

function Why() {
  return (
    <section aria-labelledby="t-por" className="dx-when">
      <h2 id="t-por">Lo que hay detrás de cada forma</h2>
      <div className="cf-why">
        <div>
          <h3>Solo el resumen</h3>
          <p>Es la forma más rápida de leer, y la más fácil de creer. Un dato inventado se ve igual que uno real.</p>
        </div>
        <div>
          <h3>Con nivel de confianza</h3>
          <p>«Alta» o «Media» suena útil, pero no dice qué revisar. En esta ronda, un resumen con un dato inventado dice «confianza alta».</p>
        </div>
        <div>
          <h3>Con la fuente de cada frase</h3>
          <p>Toma más segundos, pero cada frase se puede comprobar contra su mensaje, y lo que no tiene respaldo se ve. Es la que propongo llevar a Hilo.</p>
        </div>
      </div>
    </section>
  );
}

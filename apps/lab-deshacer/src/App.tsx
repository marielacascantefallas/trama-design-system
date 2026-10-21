import { useEffect, useRef, useState } from 'react';
import { Avatar, Button, TramaTheme } from '@trama';
import { LabNav } from '../../shared/LabNav';
import { useDialog } from '../../shared/useDialog';

// Las mismas conversaciones del prototipo de Hilo.
interface Chat { id: string; name: string; preview: string }
const CHATS: Chat[] = [
  { id: 'cc', name: 'Café Cordillera', preview: '¿Me confirman? Tengo que pagar antes de las 3' },
  { id: 'lm', name: 'Laura Mora', preview: 'Adjunté la factura de octubre' },
  { id: 'fr', name: 'Ferretería El Roble', preview: 'Les mando el estado de cuenta del BCR' },
  { id: 'se', name: 'Soda La Esquina', preview: 'Muchas gracias, quedo atenta' },
];

interface Stats { done: number; clicks: number; ms: number; fixed: number }
const empty: Stats = { done: 0, clicks: 0, ms: 0, fixed: 0 };
const UNDO_MS = 5000;

export function App() {
  const [confirm, setConfirm] = useState<Stats>(empty);
  const [undo, setUndo] = useState<Stats>(empty);
  return (
    <>
      <a className="skip" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>
        Saltar al contenido
      </a>
      <header className="bar">
        <strong>Trama</strong>
        <LabNav current="deshacer" />
      </header>
      <main id="contenido" tabIndex={-1} className="dx">
        <h1>¿Preguntar antes, o dejar deshacer después?</h1>
        <p className="lead">
          La misma acción de Hilo, marcar una conversación como resuelta, hecha de dos formas. Prueba las dos: el
          laboratorio cuenta tus propios clics y segundos, y abajo los compara.
        </p>
        <div className="dx-pair">
          <ConfirmSide stats={confirm} setStats={setConfirm} />
          <UndoSide stats={undo} setStats={setUndo} />
        </div>
        <Results confirm={confirm} undo={undo} />
        <WhenToAsk />
      </main>
    </>
  );
}

/* ---------- Lista común ---------- */

function ChatList({ chats, onResolve, label }: { chats: Chat[]; onResolve: (c: Chat, i: number) => void; label: string }) {
  if (!chats.length) return <p className="dx-empty">Bandeja vacía. Usa «Volver a llenar» para seguir probando.</p>;
  return (
    <ul className="dx-list" aria-label={label}>
      {chats.map((c, i) => (
        <li key={c.id}>
          <Avatar name={c.name} decorative />
          <span className="dx-grow">
            <strong>{c.name}</strong>
            <span>{c.preview}</span>
          </span>
          <Button variant="secondary" size="s" data-row={c.id} onClick={() => onResolve(c, i)} aria-label={`Marcar ${c.name} como resuelto`}>
            Marcar resuelto
          </Button>
        </li>
      ))}
    </ul>
  );
}

/** Después de quitar una fila, el foco pasa a la siguiente para no perder el lugar con teclado. */
function focusAfter(rootId: string, index: number) {
  requestAnimationFrame(() => {
    const btns = document.querySelectorAll<HTMLButtonElement>(`#${rootId} [data-row]`);
    (btns[index] ?? btns[btns.length - 1] ?? document.querySelector<HTMLElement>(`#${rootId} .dx-refill`))?.focus();
  });
}

/* ---------- Con confirmación ---------- */

function ConfirmSide({ stats, setStats }: { stats: Stats; setStats: (f: (s: Stats) => Stats) => void }) {
  const [chats, setChats] = useState(CHATS);
  const [asking, setAsking] = useState<{ chat: Chat; index: number; t0: number } | null>(null);
  const click = () => setStats((s) => ({ ...s, clicks: s.clicks + 1 }));

  const resolve = () => {
    const a = asking!;
    click();
    setChats((cs) => cs.filter((c) => c.id !== a.chat.id));
    setStats((s) => ({ ...s, done: s.done + 1, ms: s.ms + (performance.now() - a.t0) }));
    setAsking(null);
    focusAfter('lado-confirmar', a.index);
  };
  const cancel = () => { click(); setStats((s) => ({ ...s, fixed: s.fixed + 1 })); setAsking(null); };

  return (
    <section className="dx-side" id="lado-confirmar" aria-labelledby="t-confirmar">
      <h2 id="t-confirmar">Con confirmación</h2>
      <p>Un diálogo pregunta «¿Seguro?» cada vez. Frena el error, y también todo lo demás.</p>
      <TramaTheme brand="hilo" mode="light" surface className="dx-stage">
        <ChatList chats={chats} label="Bandeja con confirmación" onResolve={(chat, index) => { click(); setAsking({ chat, index, t0: performance.now() }); }} />
        <button type="button" className="dx-refill" onClick={() => setChats(CHATS)} disabled={chats.length === CHATS.length}>Volver a llenar</button>
        {asking && <ConfirmDialog chat={asking.chat} onConfirm={resolve} onCancel={cancel} />}
      </TramaTheme>
      <ol className="dx-steps">
        <li><span>1</span>Clic en «Marcar resuelto»</li>
        <li><span>2</span>Leer el diálogo y llevar la vista al centro</li>
        <li><span>3</span>Clic en «Marcar resuelto» otra vez</li>
      </ol>
    </section>
  );
}

function ConfirmDialog({ chat, onConfirm, onCancel }: { chat: Chat; onConfirm: () => void; onCancel: () => void }) {
  const ref = useDialog(onCancel);
  return (
    <div className="dx-scrim" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div ref={ref} className="dx-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-d">
        <h3 id="dlg-t">¿Marcar {chat.name} como resuelto?</h3>
        <p id="dlg-d">Sale de tu bandeja. Si el cliente vuelve a escribir, aparece de nuevo.</p>
        <div className="dx-dialog__act">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onConfirm} data-autofocus>Marcar resuelto</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Con deshacer ---------- */

function UndoSide({ stats, setStats }: { stats: Stats; setStats: (f: (s: Stats) => Stats) => void }) {
  const [chats, setChats] = useState(CHATS);
  const [last, setLast] = useState<{ chat: Chat; index: number; key: number } | null>(null);
  const timer = useRef<number>();
  const click = () => setStats((s) => ({ ...s, clicks: s.clicks + 1 }));

  const resolve = (chat: Chat, index: number) => {
    const t0 = performance.now();
    click();
    setChats((cs) => cs.filter((c) => c.id !== chat.id));
    setStats((s) => ({ ...s, done: s.done + 1, ms: s.ms + (performance.now() - t0) }));
    setLast({ chat, index, key: Date.now() });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLast(null), UNDO_MS);
    focusAfter('lado-deshacer', index);
  };
  const restore = (viaKeyboard = false) => {
    if (!last) return;
    if (!viaKeyboard) click();
    window.clearTimeout(timer.current);
    setChats((cs) => { const next = [...cs]; next.splice(Math.min(last.index, next.length), 0, last.chat); return next; });
    setStats((s) => ({ ...s, done: s.done - 1, fixed: s.fixed + 1 }));
    setLast(null);
    const id = last.chat.id;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`#lado-deshacer [data-row="${id}"]`)?.focus());
  };

  // Ctrl + Z o Cmd + Z deshace mientras el aviso está visible.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && last) { e.preventDefault(); restore(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <section className="dx-side" id="lado-deshacer" aria-labelledby="t-deshacer">
      <h2 id="t-deshacer">Con deshacer</h2>
      <p>Se marca al instante y un aviso deja 5 segundos para deshacerlo. Sin pasos de más si no hubo error.</p>
      <TramaTheme brand="hilo" mode="light" surface className="dx-stage">
        <ChatList chats={chats} label="Bandeja con deshacer" onResolve={resolve} />
        <button type="button" className="dx-refill" onClick={() => { setChats(CHATS); setLast(null); }} disabled={chats.length === CHATS.length}>Volver a llenar</button>
        <div className="dx-toast-slot" role="status" aria-live="polite">
          {last && (
            <div className="dx-toast" key={last.key}>
              <span>{last.chat.name} quedó como resuelto.</span>
              <button type="button" onClick={() => restore()}>Deshacer</button>
              <i aria-hidden />
            </div>
          )}
        </div>
      </TramaTheme>
      <ol className="dx-steps">
        <li><span>1</span>Clic en «Marcar resuelto»</li>
        <li><span>2</span>Solo si fue un error: «Deshacer», o Ctrl + Z</li>
      </ol>
    </section>
  );
}

/* ---------- Resultados ---------- */

function Results({ confirm, undo }: { confirm: Stats; undo: Stats }) {
  const ready = confirm.done > 0 && undo.done > 0;
  const per = (s: Stats) => (s.done ? (s.ms / s.done / 1000).toLocaleString('es-CR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : '0');
  const perClicks = (s: Stats) => (s.done ? (s.clicks / s.done).toLocaleString('es-CR', { maximumFractionDigits: 1 }) : '0');
  const better = (a: number, b: number) => (ready && a < b ? 'win' : '');
  const rows: [string, string, string, string, string][] = [
    ['Conversaciones marcadas', String(confirm.done), String(undo.done), '', ''],
    ['Clics por conversación', perClicks(confirm), perClicks(undo), better(confirm.clicks / confirm.done, undo.clicks / undo.done), better(undo.clicks / undo.done, confirm.clicks / confirm.done)],
    ['Segundos desde el clic hasta que sale de la lista', per(confirm), per(undo), better(confirm.ms / confirm.done, undo.ms / undo.done), better(undo.ms / undo.done, confirm.ms / confirm.done)],
    ['Errores que corregiste', String(confirm.fixed), String(undo.fixed), '', ''],
  ];
  return (
    <section aria-labelledby="t-prueba" className="dx-results">
      <h2 id="t-prueba">Tu prueba</h2>
      <p className="note" role="status">
        {ready
          ? 'Tus números de esta sesión. No se guardan en ningún lado.'
          : 'Marca conversaciones en los dos lados para ver tus números. No se guardan en ningún lado.'}
      </p>
      <table>
        <thead>
          <tr><th scope="col"><span className="trama-sr-only">Medida</span></th><th scope="col">Con confirmación</th><th scope="col">Con deshacer</th></tr>
        </thead>
        <tbody>
          {rows.map(([label, a, b, wa, wb]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td className={wa}>{a}{wa && <span className="trama-sr-only"> (menos)</span>}</td>
              <td className={wb}>{b}{wb && <span className="trama-sr-only"> (menos)</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ---------- Cuándo sí preguntar ---------- */

function WhenToAsk() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  return (
    <section aria-labelledby="t-cuando" className="dx-when">
      <h2 id="t-cuando">Cuándo sí preguntar antes</h2>
      <div className="dx-when__grid">
        <div>
          <h3>Deshacer sirve cuando la acción se puede revertir</h3>
          <p>Marcar resuelto, archivar, mover de carpeta, reasignar un chat. Si algo sale mal, se vuelve atrás sin que nadie se entere.</p>
        </div>
        <div>
          <h3>Confirmar sirve cuando no hay vuelta atrás</h3>
          <p>
            Cancelar una reserva de Ruta con depósito por SINPE devuelve dinero y le avisa al cliente. Ahí el diálogo
            nombra la consecuencia y el botón dice exactamente qué pasa.
          </p>
          <TramaTheme brand="ruta" mode="light" className="dx-ruta">
            <Button variant="secondary" onClick={() => { setMsg(''); setOpen(true); }}>Ver el diálogo de Ruta</Button>
            {open && <RutaDialog onClose={(m) => { setOpen(false); setMsg(m); }} />}
          </TramaTheme>
          <p className="note" role="status">{msg}</p>
        </div>
      </div>
    </section>
  );
}

function RutaDialog({ onClose }: { onClose: (msg: string) => void }) {
  const ref = useDialog(() => onClose(''));
  return (
    <div className="dx-scrim dx-scrim--page" onMouseDown={(e) => e.target === e.currentTarget && onClose('')}>
      <div ref={ref} className="dx-dialog" role="alertdialog" aria-modal="true" aria-labelledby="r-t" aria-describedby="r-d">
        <h3 id="r-t">¿Cancelar la reserva de Familia Rojas?</h3>
        <p id="r-d">
          Se devuelven ₡28 000 por SINPE Móvil a Raquel Rojas Mora y se le avisa por WhatsApp. Los 4 lugares de la salida
          de las 9:30 quedan libres. Esto no se puede deshacer.
        </p>
        <div className="dx-dialog__act">
          <Button variant="secondary" onClick={() => onClose('')} data-autofocus>Mantener la reserva</Button>
          <Button onClick={() => onClose('Es un ejemplo: en Ruta, aquí se devolvería el depósito y se avisaría al cliente.')}>Cancelar y devolver ₡28 000</Button>
        </div>
      </div>
    </div>
  );
}

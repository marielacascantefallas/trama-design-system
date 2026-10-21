import { useEffect, useMemo, useRef, useState } from 'react';
import { AICard, Avatar, Button, StatusChip } from '@trama';
import { X } from '../../../shared/icons';
import { LOAD_LIMIT } from '../data';
import { useStore } from '../store';

/** Sugerencia: la persona con menos carga, salvo que ya haya atendido a alguno de estos clientes. */
function suggest(team: { id: string; load: number }[], ids: string[]) {
  if (ids.includes('transportes-pacifico')) return 'luis';
  return [...team].sort((a, b) => a.load - b.load)[0].id;
}

export function AssignModal() {
  const { s, d } = useStore();
  const ids = s.assign ?? [];
  const chats = s.chats.filter((c) => ids.includes(c.id));
  const suggested = useMemo(() => suggest(s.team, ids), [s.team, ids]);
  const [to, setTo] = useState(suggested);
  const dialog = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(document.activeElement);
  const close = () => d({ type: 'closeAssign' });
  const target = s.team.find((p) => p.id === to)!;
  const sugName = s.team.find((p) => p.id === suggested)!.name;
  const ranked = [...s.team].sort((a, b) => (a.id === suggested ? -1 : b.id === suggested ? 1 : a.load - b.load));

  useEffect(() => {
    const el = dialog.current!;
    el.querySelector<HTMLElement>('input:checked')?.focus();
    const back = returnTo.current as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const f = [...el.querySelectorAll<HTMLElement>('button:not(:disabled), input:checked')];
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      back?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = chats.length === 1 ? `Asignar ${chats[0].name}` : `Asignar ${chats.length} chats nuevos`;

  return (
    <div className="hilo-scrim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={dialog} className="hilo-modal" role="dialog" aria-modal="true" aria-labelledby="asignar-titulo">
        <header className="hilo-modal__head">
          <div className="hilo-grow-x">
            <h2 id="asignar-titulo" className="hilo-h2">
              {title}
            </h2>
            <p className="hilo-muted">
              {chats.length === 1
                ? 'Elige quién sigue la conversación.'
                : 'Llegaron entre 9:12 y 9:40 y nadie los ha abierto.'}
            </p>
          </div>
          <button type="button" className="hilo-icon-btn" aria-label="Cerrar" onClick={close}>
            <X size={20} aria-hidden />
          </button>
        </header>

        <ul className="hilo-modal__chats">
          {chats.map((c) => (
            <li key={c.id}>
              <Avatar name={c.name} size="s" />
              <span className="hilo-grow-x">
                <span className="hilo-strong">{c.name}</span>
                <span className="hilo-caption">{c.preview}</span>
              </span>
              <span className="hilo-caption">{c.time}</span>
            </li>
          ))}
        </ul>

        <div className="hilo-modal__body">
          <AICard title={`Sugerencia: ${sugName}`} meta="Por carga e historial">
            {suggested === 'luis'
              ? 'Tiene la menor carga hoy y ya atendió a Transportes Pacífico en agosto. Ana está cerca de su límite.'
              : `Es quien tiene menos chats activos ahora mismo.`}
          </AICard>
          <fieldset className="hilo-radios">
            <legend className="hilo-label">Asignar a</legend>
            {ranked.map((p) => {
              const after = p.load + (p.id === to ? chats.filter((c) => c.owner !== p.id).length : 0);
              const near = p.load >= LOAD_LIMIT;
              return (
                <label key={p.id} className={`hilo-radio ${to === p.id ? 'is-on' : ''}`}>
                  <input type="radio" name="persona" value={p.id} checked={to === p.id} onChange={() => setTo(p.id)} />
                  <Avatar name={p.name} size="s" />
                  <span className="hilo-grow-x">
                    <span className="hilo-strong">{p.name}</span>
                    <span className="hilo-caption">{p.role}</span>
                  </span>
                  <span className="hilo-load-col">
                    <span className="hilo-row">
                      {near && <StatusChip tone="warning">Cerca del límite</StatusChip>}
                      <span className="hilo-caption hilo-ink">
                        {to === p.id && after !== p.load ? `De ${p.load} a ${after} chats` : `${p.load} chats`}
                      </span>
                    </span>
                    <span className="hilo-bar" aria-hidden>
                      <span
                        style={{ width: `${Math.min(after / 16, 1) * 100}%` }}
                        className={after > LOAD_LIMIT ? 'is-over' : ''}
                      />
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        </div>

        <footer className="hilo-modal__foot">
          <span className="hilo-caption hilo-grow-x">
            {target.name.split(' ')[0]} recibirá {chats.length === 1 ? 'el chat' : `los ${chats.length} chats`} en su
            bandeja.
          </span>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button onClick={() => d({ type: 'assign', ids, to })}>Asignar a {target.name.split(' ')[0]}</Button>
        </footer>
      </div>
    </div>
  );
}

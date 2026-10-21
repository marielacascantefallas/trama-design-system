import type { ReactNode } from 'react';

/** Barra de ocupación. Siempre va junto a la cifra, nunca sola. */
export function Bar({
  value,
  max,
  width = 150,
  tone = 'brand',
}: {
  value: number;
  max: number;
  width?: number | string;
  tone?: 'brand' | 'warn';
}) {
  return (
    <span className="hilo-bar" style={{ width }} aria-hidden>
      <span style={{ width: `${Math.min(value / max, 1) * 100}%` }} className={tone === 'warn' ? 'is-over' : ''} />
    </span>
  );
}

export function CardHead({
  title,
  side,
  id,
  small,
}: {
  title: string;
  side?: ReactNode;
  id?: string;
  small?: boolean;
}) {
  return (
    <div className="hilo-row hilo-row--between hilo-card__pad">
      <h2 id={id} className={small ? 'hilo-strong' : 'hilo-h2'}>
        {title}
      </h2>
      {typeof side === 'string' ? <span className="hilo-caption">{side}</span> : side}
    </div>
  );
}

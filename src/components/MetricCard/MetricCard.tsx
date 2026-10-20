import type { HTMLAttributes } from 'react';
import './MetricCard.css';

export type MetricNoteTone = 'neutral' | 'danger' | 'success';

export interface MetricCardProps extends HTMLAttributes<HTMLDListElement> {
  /** Qué se mide: "Sin responder", "Primera respuesta (media)"… */
  label: string;
  /** El número, ya con su unidad: "18 min", "₡0", "11 de 12". */
  value: string;
  /** Contexto en una línea: comparación o qué hacer con el número. */
  note?: string;
  /** Tono de la nota. Peligro solo cuando hay que actuar. */
  noteTone?: MetricNoteTone;
}

/** Métrica con etiqueta, valor y una nota de contexto. Es una lista de definición. */
export function MetricCard({ label, value, note, noteTone = 'neutral', className, ...rest }: MetricCardProps) {
  return (
    <dl className={['trama-metric', className].filter(Boolean).join(' ')} {...rest}>
      <dt className="trama-metric__label">{label}</dt>
      <dd className="trama-metric__value">{value}</dd>
      {note && <dd className={`trama-metric__note trama-metric__note--${noteTone}`}>{note}</dd>}
    </dl>
  );
}

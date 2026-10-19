import type { HTMLAttributes, ReactNode } from 'react';
import './StatusChip.css';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Éxito, advertencia, peligro o neutro. */
  tone?: StatusTone;
  /** Texto del estado. Obligatorio: el color nunca es la única señal (WCAG 1.4.1). */
  children: ReactNode;
}

export function StatusChip({ tone = 'neutral', className, children, ...rest }: StatusChipProps) {
  return (
    <span className={['trama-chip', `trama-chip--${tone}`, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}

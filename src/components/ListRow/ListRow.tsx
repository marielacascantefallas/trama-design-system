import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { StatusChip, type StatusTone } from '../StatusChip/StatusChip';
import './ListRow.css';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** Nombre accesible de la lista, por ejemplo "Mis clientes". */
  'aria-label': string;
  children: ReactNode;
}

/** Contenedor de filas. Agrupa las filas en una lista con borde. */
export function List({ className, children, ...rest }: ListProps) {
  return (
    <ul className={['trama-list', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </ul>
  );
}

export interface ListRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** Nombre del cliente (Hilo) o del tour (Ruta). */
  title: string;
  /** Detalle: último mensaje u hora y personas. Se corta a una línea. */
  detail?: string;
  /** Estado opcional que se muestra como chip. */
  status?: { tone: StatusTone; label: string };
  /** Fila activa. Se marca con fondo, barra lateral y `aria-current`. */
  selected?: boolean;
  /** Contenido a la izquierda. Por defecto, un avatar con las iniciales del título. */
  leading?: ReactNode;
  /** Hora o fecha del último movimiento, arriba a la derecha: "9:38", "Ayer", "14 oct". */
  time?: string;
}

/**
 * Fila compartida por Hilo (chats) y Ruta (reservas). Es un botón dentro
 * de un `<li>`, así que se navega con Tab y se activa con Enter o Espacio.
 */
export function ListRow({ title, detail, status, selected = false, leading, time, className, ...rest }: ListRowProps) {
  return (
    <li className="trama-list__item">
      <button
        type="button"
        className={['trama-row', selected && 'trama-row--selected', className].filter(Boolean).join(' ')}
        aria-current={selected ? 'true' : undefined}
        {...rest}
      >
        {leading ?? <Avatar name={title} size="m" />}
        <span className="trama-row__text">
          <span className="trama-row__title">{title}</span>
          {detail && <span className="trama-row__detail">{detail}</span>}
        </span>
        {(time || status) && (
          <span className="trama-row__meta">
            {time && <span className="trama-row__time">{time}</span>}
            {status && <StatusChip tone={status.tone}>{status.label}</StatusChip>}
          </span>
        )}
      </button>
    </li>
  );
}

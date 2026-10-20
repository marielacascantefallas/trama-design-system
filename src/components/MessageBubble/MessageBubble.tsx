import type { HTMLAttributes, ReactNode } from 'react';
import '../../styles/utilities.css';
import './MessageBubble.css';

export type BubbleSide = 'incoming' | 'outgoing';

export interface MessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  /** Entrante (del cliente) o saliente (del equipo). */
  side?: BubbleSide;
  /** Hora visible, por ejemplo "9:38 a.m.". */
  time: string;
  /** Quién respondió del equipo, por ejemplo "Ana". Se muestra junto a la hora. */
  author?: string;
  /** Contenido del mensaje. */
  children: ReactNode;
}

/**
 * Burbuja de un hilo de WhatsApp. El lado se distingue por posición, fondo
 * y un texto oculto para lectores de pantalla, no solo por color.
 */
export function MessageBubble({ side = 'incoming', time, author, className, children, ...rest }: MessageBubbleProps) {
  return (
    <div className={['trama-bubble', `trama-bubble--${side}`, className].filter(Boolean).join(' ')} {...rest}>
      <span className="trama-sr-only">{side === 'incoming' ? 'Mensaje del cliente: ' : 'Respuesta del equipo: '}</span>
      <div className="trama-bubble__text">{children}</div>
      <span className="trama-bubble__meta">
        {time}
        {author && ` · ${author}`}
      </span>
    </div>
  );
}

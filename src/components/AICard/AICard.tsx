import { useId, type HTMLAttributes, type ReactNode } from 'react';
import '../../styles/utilities.css';
import './AICard.css';

export interface AICardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Qué es la sugerencia: "Resumen de la conversación", "Reporte del día"… */
  title: string;
  /** Texto generado. Corto y concreto: hechos, no adjetivos. */
  children: ReactNode;
  /** Cuándo o con qué datos se generó, por ejemplo "Actualizado 9:41". */
  meta?: string;
  /** Acciones de confirmación. La IA sugiere; una persona confirma. */
  actions?: ReactNode;
}

/**
 * Tarjeta para todo lo que genera la IA. Se identifica con una insignia de
 * texto "IA" (no con destellos ni degradados) y con un nombre accesible que
 * dice que el contenido es generado.
 */
export function AICard({ title, children, meta, actions, className, ...rest }: AICardProps) {
  const titleId = useId();
  return (
    <article aria-labelledby={titleId} className={['trama-ai', className].filter(Boolean).join(' ')} {...rest}>
      <header className="trama-ai__header">
        <span className="trama-ai__badge" aria-hidden="true">
          IA
        </span>
        <h3 id={titleId} className="trama-ai__title">
          <span className="trama-sr-only">Generado por IA: </span>
          {title}
        </h3>
        {meta && <span className="trama-ai__meta">{meta}</span>}
      </header>
      <div className="trama-ai__body">{children}</div>
      {actions && <div className="trama-ai__actions">{actions}</div>}
    </article>
  );
}

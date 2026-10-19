import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import type { ControlSize } from '../Button/Button';
import './TextField.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Etiqueta visible. Obligatoria (WCAG 3.3.2): el placeholder no la reemplaza. */
  label: string;
  /** Texto de ayuda debajo del campo. */
  hint?: string;
  /** Mensaje de error. Si existe, el campo pasa a estado de error. */
  error?: string;
  /** S, M o L: las mismas alturas que el botón, para alinearlos en una fila. */
  size?: ControlSize;
}

/**
 * Campo de texto de Trama. El error se comunica con borde, con texto
 * que empieza por "Error:" y con `aria-invalid`, nunca solo con color.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, size = 'm', id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `trama-field-${autoId}`;
  const messageId = `${inputId}-message`;
  const message = error ? `Error: ${error}` : hint;

  return (
    <div
      className={[
        'trama-field',
        `trama-field--${size}`,
        error && 'trama-field--error',
        disabled && 'trama-field--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <label className="trama-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className="trama-field__input"
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...rest}
      />
      {message && (
        <p id={messageId} className="trama-field__message">
          {message}
        </p>
      )}
    </div>
  );
});

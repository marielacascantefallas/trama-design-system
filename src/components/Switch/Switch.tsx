import { useId, useState, type ButtonHTMLAttributes } from 'react';
import './Switch.css';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  /** Qué activa o desactiva. Obligatoria. */
  label: string;
  /** Explicación de una línea: qué pasa cuando está activo. */
  description?: string;
  /** Estado controlado. */
  checked?: boolean;
  /** Estado inicial si no se controla. */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

/**
 * Interruptor para ajustes que se aplican al instante. Es un botón con
 * `role="switch"`, así que se activa con Espacio o Enter. Encendido se marca
 * con relleno y posición de la perilla, no solo con color.
 */
export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  disabled,
  className,
  ...rest
}: SwitchProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const toggle = () => {
    if (checked === undefined) setInner(!on);
    onChange?.(!on);
  };
  return (
    <div className={['trama-switch', disabled && 'trama-switch--disabled', className].filter(Boolean).join(' ')}>
      <span className="trama-switch__text">
        <label htmlFor={id} className="trama-switch__label">
          {label}
        </label>
        {description && (
          <span id={`${id}-desc`} className="trama-switch__description">
            {description}
          </span>
        )}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        className="trama-switch__track"
        onClick={toggle}
        {...rest}
      >
        <span className="trama-switch__thumb" aria-hidden="true" />
      </button>
    </div>
  );
}

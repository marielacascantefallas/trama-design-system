import { forwardRef, type ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ControlSize = 's' | 'm' | 'l';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primario para la acción principal (uno por vista), secundario o fantasma. */
  variant?: ButtonVariant;
  /** S (32 px) para filas densas, M (40 px) por defecto, L (48 px) para móvil o acciones únicas. */
  size?: ControlSize;
}

/**
 * Botón de Trama. Los estados hover, foco y deshabilitado vienen del
 * navegador (`:hover`, `:focus-visible`, `disabled`), no de una prop.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'm', type = 'button', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={['trama-button', `trama-button--${variant}`, `trama-button--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
});

import type { HTMLAttributes, ReactNode } from 'react';
import './TramaTheme.css';

export type Brand = 'hilo' | 'ruta';
export type Mode = 'light' | 'dark';

export interface TramaThemeProps extends HTMLAttributes<HTMLDivElement> {
  /** Marca activa: Hilo (añil) o Ruta (atardecer). */
  brand?: Brand;
  /** Modo de color. */
  mode?: Mode;
  /** Pinta el fondo canvas y el color de texto del tema. */
  surface?: boolean;
  children: ReactNode;
}

/**
 * Aplica un tema de Trama a todo lo que contiene.
 * Pone `data-brand` y `data-mode` en el mismo elemento, que es lo que
 * necesitan los tokens semánticos para resolver la marca correcta.
 */
export function TramaTheme({
  brand = 'hilo',
  mode = 'light',
  surface = false,
  className,
  children,
  ...rest
}: TramaThemeProps) {
  return (
    <div
      data-brand={brand}
      data-mode={mode}
      className={['trama-theme', surface && 'trama-theme--surface', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

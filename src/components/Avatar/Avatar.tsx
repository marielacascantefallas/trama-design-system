import type { HTMLAttributes } from 'react';
import './Avatar.css';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Nombre completo. Se usa para calcular las iniciales. */
  name: string;
  /** S (32 px) para listas densas, M (40 px) por defecto. */
  size?: 's' | 'm';
  /**
   * Decorativo por defecto: si el nombre ya aparece al lado, el lector de
   * pantalla no necesita oír las iniciales. Ponlo en `false` cuando el
   * avatar va solo.
   */
  decorative?: boolean;
}

export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 'm', decorative = true, className, ...rest }: AvatarProps) {
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name };
  return (
    <span
      className={['trama-avatar', `trama-avatar--${size}`, className].filter(Boolean).join(' ')}
      {...a11y}
      {...rest}
    >
      {initialsFrom(name)}
    </span>
  );
}

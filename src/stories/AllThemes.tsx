import type { ReactNode } from 'react';
import { TramaTheme, type Brand, type Mode } from '../components/TramaTheme/TramaTheme';

const THEMES: { brand: Brand; mode: Mode; label: string }[] = [
  { brand: 'hilo', mode: 'light', label: 'Hilo claro' },
  { brand: 'hilo', mode: 'dark', label: 'Hilo oscuro' },
  { brand: 'ruta', mode: 'light', label: 'Ruta claro' },
  { brand: 'ruta', mode: 'dark', label: 'Ruta oscuro' },
];

/** Muestra el mismo contenido en los 4 temas, lado a lado. */
export function AllThemes({ children, minWidth = 280 }: { children: (brand: Brand) => ReactNode; minWidth?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`, gap: 16 }}>
      {THEMES.map((t) => (
        <TramaTheme key={t.label} brand={t.brand} mode={t.mode} surface style={{ padding: 20, borderRadius: 12 }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{t.label}</p>
          {children(t.brand)}
        </TramaTheme>
      ))}
    </div>
  );
}

export const row = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 } as const;
export const stack = { display: 'flex', flexDirection: 'column', gap: 16 } as const;

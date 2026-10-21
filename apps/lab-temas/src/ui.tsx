import type { CSSProperties } from 'react';
import { Avatar, Button, StatusChip, TextField, TramaTheme } from '@trama';
import { inkOn, type Hex } from './color';
import { STEPS, type Ramp, type Step } from './theme';

export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RampStrip({ ramp, anchor, label }: { ramp: Ramp; anchor?: Step; label: string }) {
  return (
    <>
      <ul className="ramp" aria-label={label}>
        {STEPS.map((s) => (
          <li key={s} className={s === anchor ? 'is-anchor' : ''} style={{ background: ramp[s], color: inkOn(ramp[s], '#000000') }}>
            <span>{s}</span>
            <span className="trama-sr-only">
              {ramp[s]}
              {s === anchor ? ', tu color' : ''}
            </span>
          </li>
        ))}
      </ul>
      <ul className="ramp-hex" aria-hidden>
        {STEPS.map((s) => (
          <li key={s}>{ramp[s].slice(1)}</li>
        ))}
      </ul>
    </>
  );
}

/** Una línea de la carta de lectura: la pareja escrita con sus propios colores. */
export function ChartLine({ label, fg, bg, size, light, dark, min, fix, compact }: {
  label: string; fg: Hex; bg: Hex; size: number; light: number; dark: number | null; min: number; fix?: string; compact?: boolean;
}) {
  const cell = (v: number) => (
    <span className={`r ${v < min ? 'no' : 'ok'}`}>
      {v.toFixed(1)}
      {v < min && <small>pide {min}</small>}
    </span>
  );
  return (
    <li className="line">
      <span className="sample">
        {compact ? (
          <>
            <Specimen label="Aa" fg={fg} bg={bg} size={size} line={min < 4.5} />
            <span className="pair-name">{label}</span>
          </>
        ) : (
          <Specimen label={label} fg={fg} bg={bg} size={size} line={min < 4.5} />
        )}
        {fix && <span className="fix">{fix}</span>}
      </span>
      {cell(light)}
      {dark === null ? <span className="r">sin oscuro</span> : cell(dark)}
    </li>
  );
}

export const sizeFor = (i: number) => Math.max(14, 28 - i * 1.1);

/** Pantalla de muestra pintada con los componentes reales de Trama y el tema generado. */
export function Preview({ mode, vars, canvas }: { mode: 'light' | 'dark'; vars: Record<string, string>; canvas: Hex }) {
  return (
    <section style={{ background: canvas }}>
      <TramaTheme brand="hilo" mode={mode} style={vars as CSSProperties}>
        <h3 style={{ color: 'var(--color-text-primary)' }}>{mode === 'light' ? 'Claro' : 'Oscuro'}</h3>
        <div className="mini">
          <div className="mini-head">
            <Avatar name="Ana Brenes" size="m" />
            <div>
              <strong>Reserva confirmada</strong>
              <p>Tour del atardecer, 4 pasajeros</p>
            </div>
          </div>
          <div className="mini-row">
            <StatusChip tone="success">Pagado</StatusChip>
            <StatusChip tone="warning">Falta depósito</StatusChip>
            <a href="#vista" onClick={(e) => e.preventDefault()}>Ver detalle</a>
          </div>
          <TextField label="Buscar cliente" placeholder="Nombre o teléfono" id={`buscar-${mode}`} />
          <div className="mini-row">
            <Button>Confirmar</Button>
            <Button variant="secondary">Cancelar</Button>
          </div>
        </div>
      </TramaTheme>
    </section>
  );
}

/**
 * Muestra visual de una pareja. Se dibuja en SVG porque a veces enseña a propósito
 * una pareja que no cumple; el dato accesible es la cifra de contraste de la fila.
 * Las parejas de 3:1 (borde y foco) se muestran como un borde, no como texto.
 */
export function Specimen({ label, fg, bg, size, line }: { label: string; fg: Hex; bg: Hex; size: number; line?: boolean }) {
  const w = Math.round(label.length * size * 0.56 + 24);
  const h = Math.round(size * 1.5 + 8);
  return (
    <svg className="specimen" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <rect x="0" y="0" width={w} height={h} rx="6" fill={bg} />
      {line ? (
        <>
          <rect x="1.5" y="1.5" width={w - 3} height={h - 3} rx="5" fill="none" stroke={fg} strokeWidth="3" />
          <text x="12" y={h / 2} dominantBaseline="central" fontSize={size} fontWeight="700" fill={inkOn(bg)}>{label}</text>
        </>
      ) : (
        <text x="12" y={h / 2} dominantBaseline="central" fontSize={size} fontWeight="700" fill={fg}>{label}</text>
      )}
    </svg>
  );
}

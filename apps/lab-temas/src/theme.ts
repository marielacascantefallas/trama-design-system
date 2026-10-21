// Genera un tema de Trama desde un color de marca, con la misma lógica de capas
// que scripts/generate-tokens.py: primitivos, marca y semánticos.
import trama from '../../../tokens/trama-tokens.json';
import { contrast, fromOklch, toOklch, type Hex } from './color';

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type Step = (typeof STEPS)[number];
export type Ramp = Record<Step, Hex>;

// Curva de luz y de croma tomada de Añil (Hilo) y Atardecer (Ruta) medidos en OKLCH.
const LIGHT = [0.965, 0.93, 0.86, 0.77, 0.69, 0.605, 0.53, 0.455, 0.39, 0.32];
const CHROMA = [0.09, 0.18, 0.36, 0.6, 0.82, 0.97, 1, 0.9, 0.73, 0.52];

export function buildRamp(brand: Hex): { ramp: Ramp; anchor: Step } {
  const [L0, C0, H] = toOklch(brand);
  let idx = 0;
  LIGHT.forEach((l, i) => { if (Math.abs(l - L0) < Math.abs(LIGHT[idx] - L0)) idx = i; });
  const scale = C0 / CHROMA[idx];
  const ramp = {} as Ramp;
  STEPS.forEach((s, i) => { ramp[s] = i === idx ? brand : fromOklch(LIGHT[i], scale * CHROMA[i], H); });
  return { ramp, anchor: STEPS[idx] };
}

// Neutros y estados reales de Trama (primitivos publicados).
const prim = (trama as unknown as { primitives: { color: Record<string, Record<string, { $value: string }>> } }).primitives.color;
const P = (k: string) => prim.piedra[k].$value.toUpperCase();
const S = (c: string, k: string) => prim[c][k].$value.toUpperCase();

export type Mode = 'light' | 'dark';
export type Semantic = Record<string, Hex>;

export const SEMANTIC_ROLES = [
  'bg.canvas', 'bg.surface', 'bg.subtle', 'text.primary', 'text.secondary', 'text.placeholder', 'text.brand',
  'border.default', 'border.control', 'action.primary', 'action.primary-hover', 'action.on-primary',
  'action.subtle', 'action.on-subtle', 'focus.ring', 'status.success', 'status.success-bg',
  'status.warning', 'status.warning-bg', 'status.danger', 'status.danger-bg',
] as const;

export function semantic(ramp: Ramp, mode: Mode, exact: Hex | null): Semantic {
  const L = mode === 'light';
  const r = (a: string, b: string) => (L ? a : b);
  const s: Semantic = {
    'bg.canvas': r(P('50'), P('950')), 'bg.surface': r(P('0'), P('900')), 'bg.subtle': r(P('100'), P('800')),
    'text.primary': r(P('900'), P('50')), 'text.secondary': r(P('600'), P('300')), 'text.placeholder': r(P('600'), P('300')),
    'text.brand': r(ramp[700], ramp[300]),
    'border.default': r(P('200'), P('700')), 'border.control': r(P('500'), P('400')),
    'action.primary': r(ramp[600], ramp[400]), 'action.primary-hover': r(ramp[700], ramp[300]),
    'action.on-primary': r(P('0'), P('950')),
    'action.subtle': r(ramp[50], ramp[900]), 'action.on-subtle': r(ramp[700], ramp[200]),
    'focus.ring': r(ramp[600], ramp[300]),
    'status.success': r(S('verde', '600'), S('verde', '300')), 'status.success-bg': r(S('verde', '50'), S('verde', '900')),
    'status.warning': r(S('ambar', '600'), S('ambar', '300')), 'status.warning-bg': r(S('ambar', '50'), S('ambar', '900')),
    'status.danger': r(S('rojo', '600'), S('rojo', '300')), 'status.danger-bg': r(S('rojo', '50'), S('rojo', '900')),
  };
  if (exact) {
    // El color exacto en botón, link y foco, aunque baje el contraste.
    s['action.primary'] = exact;
    s['text.brand'] = exact;
    s['focus.ring'] = exact;
    s['action.on-primary'] = contrast(exact, P('0')) >= contrast(exact, P('950')) ? P('0') : P('950');
  }
  return s;
}

export interface Check { a: string; b: string; min: number; use: string }

// Las mismas 17 parejas que revisa scripts/generate-tokens.py en cada build.
export const CHECKS: Check[] = [
  { a: 'text.primary', b: 'bg.surface', min: 4.5, use: 'Texto' },
  { a: 'text.secondary', b: 'bg.canvas', min: 4.5, use: 'Texto secundario' },
  { a: 'text.placeholder', b: 'bg.surface', min: 4.5, use: 'Texto de ayuda en un campo' },
  { a: 'action.on-primary', b: 'action.primary', min: 4.5, use: 'Botón principal' },
  { a: 'action.on-subtle', b: 'action.subtle', min: 4.5, use: 'Chip de marca' },
  { a: 'status.success', b: 'status.success-bg', min: 4.5, use: 'Estado de éxito' },
  { a: 'status.warning', b: 'status.warning-bg', min: 4.5, use: 'Estado de aviso' },
  { a: 'border.control', b: 'bg.canvas', min: 3, use: 'Borde de un campo' },
  { a: 'focus.ring', b: 'bg.canvas', min: 3, use: 'Anillo de foco' },
  { a: 'text.brand', b: 'bg.surface', min: 4.5, use: 'Link' },
  { a: 'text.brand', b: 'bg.canvas', min: 4.5, use: 'Link sobre el fondo' },
  { a: 'text.brand', b: 'action.subtle', min: 4.5, use: 'Link dentro de un chip' },
  { a: 'text.primary', b: 'bg.subtle', min: 4.5, use: 'Texto en zona gris' },
  { a: 'status.danger', b: 'bg.surface', min: 4.5, use: 'Error' },
  { a: 'status.danger', b: 'bg.canvas', min: 4.5, use: 'Error sobre el fondo' },
  { a: 'status.danger', b: 'status.danger-bg', min: 4.5, use: 'Estado de error' },
  { a: 'text.secondary', b: 'bg.subtle', min: 4.5, use: 'Secundario en zona gris' },
];

export interface CheckResult extends Check { light: number; dark: number }

export const runChecks = (light: Semantic, dark: Semantic): CheckResult[] =>
  CHECKS.map((c) => ({ ...c, light: contrast(light[c.a], light[c.b]), dark: contrast(dark[c.a], dark[c.b]) }));

/** Primer paso de la escala que llega al mínimo contra un fondo. */
export function firstPassingStep(ramp: Ramp, bg: Hex, min: number, from: 'dark' | 'light' = 'light'): Step | null {
  const order = from === 'light' ? [...STEPS] : [...STEPS].reverse();
  return order.find((s) => contrast(ramp[s], bg) >= min) ?? null;
}

export type Corners = 'rectas' | 'medias' | 'suaves';
export const CORNERS: Record<Corners, { label: string; control: number; card: number }> = {
  rectas: { label: 'Rectas', control: 4, card: 6 },
  medias: { label: 'Medias', control: 8, card: 10 },
  suaves: { label: 'Suaves', control: 10, card: 14 },
};

/** Variables CSS que se ponen sobre un TramaTheme para pintar el tema generado. */
export function cssVars(ramp: Ramp, corners: Corners, exactSem: Semantic | null): Record<string, string> {
  const v: Record<string, string> = {};
  STEPS.forEach((s) => (v[`--brand-${s}`] = ramp[s]));
  v['--radius-control'] = `${CORNERS[corners].control}px`;
  v['--radius-card'] = `${CORNERS[corners].card}px`;
  if (exactSem) {
    for (const k of ['action.primary', 'text.brand', 'focus.ring', 'action.on-primary']) {
      v[`--color-${k.replace('.', '-')}`] = exactSem[k];
    }
  }
  return v;
}

export function exportCss(ramp: Ramp, corners: Corners, light: Semantic, dark: Semantic, exact: boolean): string {
  const lines = ['/* Tema generado con el Generador de temas de Trama */', ':root {'];
  STEPS.forEach((s) => lines.push(`  --brand-${s}: ${ramp[s]};`));
  lines.push(`  --radius-control: ${CORNERS[corners].control}px;`, `  --radius-card: ${CORNERS[corners].card}px;`);
  for (const k of SEMANTIC_ROLES) lines.push(`  --color-${k.replace('.', '-')}: ${light[k]};`);
  lines.push('}', '', '[data-mode="dark"] {');
  for (const k of SEMANTIC_ROLES) lines.push(`  --color-${k.replace('.', '-')}: ${dark[k]};`);
  lines.push('}');
  if (exact) lines.splice(1, 0, '/* Usa el color exacto de marca en botón, link y foco. Revisa el contraste. */');
  return lines.join('\n') + '\n';
}

/** Conjunto de marca en formato DTCG, igual que tokens/trama-tokens.json. */
export function exportDtcg(name: string, ramp: Ramp, corners: Corners) {
  const color = (v: string) => ({ $type: 'color', $value: v });
  return {
    primitives: { color: { [name]: Object.fromEntries(STEPS.map((s) => [String(s), color(ramp[s])])) } },
    [`brand/${name}`]: {
      brand: Object.fromEntries(STEPS.map((s) => [String(s), color(`{color.${name}.${s}}`)])),
      radius: {
        control: { $type: 'dimension', $value: `${CORNERS[corners].control}px` },
        card: { $type: 'dimension', $value: `${CORNERS[corners].card}px` },
      },
    },
  };
}

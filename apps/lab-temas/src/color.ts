// Conversión de color y contraste WCAG. Todo corre en el navegador.

export type Hex = string;

export function normalizeHex(input: string): Hex | null {
  let h = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('');
  if (/^[0-9a-f]{8}$/i.test(h)) h = h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return '#' + h.toUpperCase();
}

export function rgbToHex(r: number, g: number, b: number): Hex {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Acepta #hex o rgb()/rgba(); devuelve null si no es un color que entendamos. */
export function parseColor(value: string): Hex | null {
  const v = value.trim();
  if (v.startsWith('#')) return normalizeHex(v);
  const m = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (m) return rgbToHex(+m[1], +m[2], +m[3]);
  return null;
}

const toRgb = (h: Hex) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const delin = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function luminance(h: Hex) {
  const [r, g, b] = toRgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Hex, b: Hex) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function toOklch(h: Hex): [number, number, number] {
  const [r, g, b] = toRgb(h).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function oklchToLinear(L: number, C: number, H: number) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (c: number[]) => c.every((x) => x >= -1e-4 && x <= 1 + 1e-4);

/** OKLCH a hex, bajando el croma lo necesario para quedar dentro de sRGB. */
export function fromOklch(L: number, C: number, H: number): Hex {
  if (!inGamut(oklchToLinear(L, C, H))) {
    let lo = 0, hi = C;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, H))) lo = mid; else hi = mid;
    }
    C = lo;
  }
  const [r, g, b] = oklchToLinear(L, C, H).map((x) => Math.min(1, Math.max(0, delin(x))) * 255);
  return rgbToHex(r, g, b);
}

/**
 * Cambia solo la luz de `fg` (mismo tono y croma) hasta llegar a `target` contra `bg`.
 * Se aleja del fondo: oscurece sobre fondos claros y aclara sobre fondos oscuros.
 */
export function adjustLightness(fg: Hex, bg: Hex, target: number): Hex {
  const [L, C, H] = toOklch(fg);
  const darken = luminance(bg) > 0.18;
  let lo = darken ? 0 : L, hi = darken ? L : 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const ok = contrast(fromOklch(mid, C, H), bg) >= target;
    if (darken) { if (ok) lo = mid; else hi = mid; } else { if (ok) hi = mid; else lo = mid; }
  }
  return fromOklch(darken ? lo : hi, C, H);
}

/** Tinta legible sobre un color: blanco o el azul tinta del laboratorio. */
export const inkOn = (bg: Hex, dark = '#14213D') => (contrast(bg, '#FFFFFF') >= contrast(bg, dark) ? '#FFFFFF' : dark);

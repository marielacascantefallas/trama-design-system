// Lee un tema (.css con variables o .json de tokens), detecta roles y arma recomendaciones.
import { adjustLightness, contrast, parseColor, toOklch, type Hex } from './color';

export type Mode = 'light' | 'dark';
export type Role = 'bg' | 'text' | 'link' | 'primary' | 'onPrimary' | 'border' | 'focus' | 'scale' | 'none';

export const ROLE_LABEL: Record<Role, string> = {
  bg: 'Fondo', text: 'Texto', link: 'Link', primary: 'Acción principal', onPrimary: 'Texto sobre acción',
  border: 'Borde de campo', focus: 'Anillo de foco', scale: 'Escala de color', none: 'Sin rol',
};
export const COVERAGE: Role[] = ['bg', 'text', 'link', 'primary', 'onPrimary', 'border', 'focus'];

export interface Token { name: string; light: Hex; dark: Hex | null; path?: string[] }
export interface Theme {
  fileName: string;
  format: 'css' | 'json';
  source: string;
  tokens: Token[];
  hasDark: boolean;
  darkSelector: string;
  /** Aviso sobre qué parte del archivo se revisó. */
  note?: string;
  /** Para JSON: rutas a cada token por modo. */
  jsonPaths?: Record<string, Partial<Record<Mode, string[]>>>;
}

/* ---------------- Lectura ---------------- */

const DARK_SEL = /(\[data-(theme|mode|color-scheme)\s*=\s*["']?dark["']?\]|\.dark\b|\.theme-dark\b|prefers-color-scheme:\s*dark)/i;

interface Block { selector: string; start: number; end: number; body: string }

function cssBlocks(src: string): Block[] {
  const out: Block[] = [];
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) {
    const selector = m[1].trim();
    const bodyStart = m.index + m[0].indexOf('{') + 1;
    out.push({ selector, start: bodyStart, end: bodyStart + m[2].length, body: src.slice(bodyStart, bodyStart + m[2].length) });
  }
  // @media (prefers-color-scheme: dark) { :root { ... } } : el bloque interno hereda el modo del @media.
  const media = /@media[^{]*prefers-color-scheme:\s*dark[^{]*\{/gi;
  let mm: RegExpExecArray | null;
  while ((mm = media.exec(clean))) {
    const from = mm.index + mm[0].length;
    out.filter((b) => b.start > from).slice(0, 1).forEach((b) => (b.selector = `@media dark ${b.selector}`));
  }
  return out;
}

function cssVars(body: string) {
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);?/g)) vars[m[1]] = m[2].trim();
  return vars;
}

function resolveCss(raw: Record<string, string>, fallback: Record<string, string> = {}) {
  const out: Record<string, Hex> = {};
  const get = (name: string, depth = 0): Hex | null => {
    const v = raw[name] ?? fallback[name];
    if (!v || depth > 8) return null;
    const ref = v.match(/^var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)$/);
    if (ref) return get(ref[1], depth + 1) ?? (ref[2] ? parseColor(ref[2]) : null);
    return parseColor(v);
  };
  for (const k of new Set([...Object.keys(raw), ...Object.keys(fallback)])) {
    const h = get(k);
    if (h) out[k] = h;
  }
  return out;
}

export function parseCss(fileName: string, src: string): Theme {
  const blocks = cssBlocks(src);
  const lightRaw: Record<string, string> = {};
  const darkRaw: Record<string, string> = {};
  let darkSelector = '[data-theme="dark"]';
  let hasDark = false;
  for (const b of blocks) {
    const vars = cssVars(b.body);
    if (!Object.keys(vars).length) continue;
    if (DARK_SEL.test(b.selector)) { Object.assign(darkRaw, vars); hasDark = true; darkSelector = b.selector.replace(/^@media dark /, ''); }
    else Object.assign(lightRaw, vars);
  }
  const light = resolveCss(lightRaw);
  const dark = hasDark ? resolveCss(darkRaw, lightRaw) : {};
  const tokens = Object.keys(light).map((name) => ({ name, light: light[name], dark: hasDark ? dark[name] ?? light[name] : null }));
  return { fileName, format: 'css', source: src, tokens, hasDark, darkSelector };
}

type Json = { [k: string]: unknown };

export function parseJson(fileName: string, src: string): Theme {
  const data = JSON.parse(src) as Json;
  // Cada conjunto (set) de Tokens Studio puede ser un modo. Si no hay sets, todo es claro.
  const flat: Record<string, { value: string; path: string[]; mode: Mode }> = {};
  const walk = (node: unknown, path: string[], mode: Mode) => {
    if (!node || typeof node !== 'object') return;
    const o = node as Json;
    const val = (o.$value ?? o.value) as unknown;
    if (typeof val === 'string' && (o.$type ?? o.type ?? 'color') === 'color') {
      const key = path.filter((p) => !/^(light|dark|claro|oscuro)$/i.test(p) && !p.includes('/')).join('.');
      flat[`${mode}:${key}`] = { value: val, path, mode };
      return;
    }
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$')) continue;
      const isDark = /dark|oscuro/i.test(k);
      walk(v, [...path, k], isDark ? 'dark' : mode);
    }
  };
  // Archivos de Tokens Studio con $themes (como el de Trama): se revisa la primera marca, en claro y oscuro.
  let note: string | undefined;
  const themes = Array.isArray(data.$themes) ? (data.$themes as { name: string; selectedTokenSets: Record<string, string> }[]) : [];
  const isDarkTheme = (t: { name: string }) => /dark|oscuro/i.test(t.name);
  const lightTheme = themes.find((t) => !isDarkTheme(t));
  if (lightTheme) {
    const on = (t: { selectedTokenSets: Record<string, string> }) => Object.entries(t.selectedTokenSets).filter(([, v]) => v !== 'disabled').map(([k]) => k);
    const lightSets = on(lightTheme);
    const darkTheme = themes.find((t) => isDarkTheme(t) && on(t).filter((x) => !/dark|oscuro|light|claro/i.test(x)).every((x) => lightSets.includes(x)));
    for (const set of lightSets) walk(data[set], [set], 'light');
    if (darkTheme) for (const set of on(darkTheme)) walk(data[set], [set], 'dark');
    if (themes.length > 2) note = `El archivo tiene ${themes.length} temas. Revisé «${lightTheme.name}»${darkTheme ? ` y «${darkTheme.name}»` : ''}.`;
  } else {
    walk(data, [], 'light');
  }
  const byKey = (mode: Mode) => Object.fromEntries(Object.entries(flat).filter(([k]) => k.startsWith(mode + ':')).map(([k, v]) => [k.slice(mode.length + 1), v]));
  const L = byKey('light'), D = byKey('dark');
  const all = { ...Object.fromEntries(Object.entries(L).map(([k, v]) => [k, v.value])) };
  const resolve = (v: string, table: Record<string, string>, depth = 0): Hex | null => {
    const ref = v.match(/^\{(.+)\}$/);
    if (ref && depth < 8) {
      const key = ref[1];
      const suffix = (t: Record<string, string>) => Object.keys(t).find((k) => k.endsWith('.' + key));
      // Tokens Studio escribe las referencias sin el nombre del set: {brand.500} apunta a global.brand.500.
      const target = table[key] ?? all[key] ?? table[suffix(table) ?? ''] ?? all[suffix(all) ?? ''];
      return target ? resolve(target, table, depth + 1) : null;
    }
    return parseColor(v);
  };
  const hasDark = Object.keys(D).length > 0;
  const darkTable = { ...all, ...Object.fromEntries(Object.entries(D).map(([k, v]) => [k, v.value])) };
  const jsonPaths: Theme['jsonPaths'] = {};
  const tokens: Token[] = [];
  for (const key of new Set([...Object.keys(L), ...Object.keys(D)])) {
    const lv = L[key] ? resolve(L[key].value, all) : null;
    const dv = hasDark ? resolve((D[key] ?? L[key]).value, darkTable) : null;
    if (!lv && !dv) continue;
    tokens.push({ name: key, light: (lv ?? dv)!, dark: hasDark ? dv ?? lv : null });
    jsonPaths[key] = { light: L[key]?.path, dark: D[key]?.path };
  }
  return { fileName, format: 'json', source: src, tokens, hasDark, darkSelector: '', jsonPaths, note };
}

export function parseTheme(fileName: string, src: string): Theme {
  const t = /\.json$/i.test(fileName) || src.trim().startsWith('{') ? parseJson(fileName, src) : parseCss(fileName, src);
  if (!t.tokens.length) throw new Error('empty');
  return t;
}

/* ---------------- Roles ---------------- */

export function guessRole(name: string): Role {
  const n = name.toLowerCase();
  if (/disabled|deshabilitado/.test(n)) return 'none'; // WCAG no pide contraste a lo deshabilitado
  if (/(^|[.-])(on-primary|primary-foreground|on-brand|on-accent|button-text)/.test(n)) return 'onPrimary';
  if (/focus|ring|outline/.test(n)) return 'focus';
  if (/(^|[.-])(\d{2,3})$/.test(n) && !/(bg|text|border)/.test(n)) return 'scale';
  if (/link|text[.-]brand|brand[.-]text/.test(n)) return 'link';
  if (/subtle|soft|muted|weak|tint/.test(n) && /action|primary|brand|accent/.test(n)) return 'none';
  if (/border|stroke|outline/.test(n) && /input|control|field|campo/.test(n)) return 'border';
  if (/border|stroke|divider/.test(n)) return 'none'; // bordes decorativos: WCAG no les pide 3:1
  if (/^(bg|background|surface|canvas)|[.-](bg|background|surface|canvas)($|[.-])/.test(n)) return 'bg';
  if (/^(text|fg|foreground|ink|content)|[.-](text|fg|foreground)($|[.-])/.test(n)) return 'text';
  if (/primary|brand|accent|action|cta/.test(n)) return 'primary';
  return 'none';
}

/* ---------------- Análisis ---------------- */

export interface Pair { fg: string; bg: string; min: number; mode: Mode; ratio: number }

export function pairs(theme: Theme, roles: Record<string, Role>): Pair[] {
  const of = (r: Role) => theme.tokens.filter((t) => roles[t.name] === r);
  const list: Omit<Pair, 'ratio' | 'mode'>[] = [];
  const bgs = of('bg');
  for (const t of [...of('text'), ...of('link')]) for (const b of bgs) list.push({ fg: t.name, bg: b.name, min: 4.5 });
  for (const o of of('onPrimary')) for (const p of of('primary')) list.push({ fg: o.name, bg: p.name, min: 4.5 });
  const base = bgs.find((b) => /surface/.test(b.name)) ?? bgs[0];
  if (base) for (const b of [...of('border'), ...of('focus')]) list.push({ fg: b.name, bg: base.name, min: 3 });
  const val = (n: string, m: Mode) => { const t = theme.tokens.find((x) => x.name === n)!; return m === 'dark' ? t.dark ?? t.light : t.light; };
  const modes: Mode[] = theme.hasDark ? ['light', 'dark'] : ['light'];
  return modes.flatMap((mode) => list.map((p) => ({ ...p, mode, ratio: contrast(val(p.fg, mode), val(p.bg, mode)) })));
}

export type Severity = 'bloquea' | 'mejora' | 'sugerencia';

export interface Change { token: string; mode: Mode; from: Hex; to: Hex }
export interface Rec {
  id: string;
  severity: Severity;
  title: string;
  why: string;
  samples?: { fg: Hex; bg: Hex; before: number; after: number; mode: Mode; beforeFg: Hex; beforeBg: Hex }[];
  changes?: Change[];
  add?: { name: string; value: Hex };
}

const modeName = (m: Mode) => (m === 'light' ? 'claro' : 'oscuro');

function scaleSteps(theme: Theme, roles: Record<string, Role>) {
  // Agrupa las escalas por prefijo: --color-brand-100, --color-brand-500 ...
  const groups: Record<string, { step: number; name: string; hex: Hex }[]> = {};
  for (const t of theme.tokens) {
    if (roles[t.name] !== 'scale') continue;
    const m = t.name.match(/^(.*?)[.-]?(\d{2,3})$/);
    if (!m) continue;
    (groups[m[1]] ??= []).push({ step: +m[2], name: t.name, hex: t.light });
  }
  return groups;
}

export function recommend(theme: Theme, roles: Record<string, Role>): { recs: Rec[]; pairs: Pair[] } {
  const ps = pairs(theme, roles);
  const val = (n: string, m: Mode) => { const t = theme.tokens.find((x) => x.name === n)!; return m === 'dark' ? t.dark ?? t.light : t.light; };
  const scales = scaleSteps(theme, roles);
  const allSteps = Object.values(scales).flat();
  const recs: Rec[] = [];

  // Contraste: una recomendación por token, con un arreglo por modo.
  const failing = ps.filter((p) => p.ratio < p.min);
  const byTarget: Record<string, Pair[]> = {};
  for (const p of failing) {
    const target = roles[p.fg] === 'onPrimary' ? p.bg : p.fg; // en el botón se corrige el fondo
    (byTarget[target] ??= []).push(p);
  }
  for (const [token, fs] of Object.entries(byTarget)) {
    const isButton = roles[fs[0].fg] === 'onPrimary';
    const modes = [...new Set(fs.map((f) => f.mode))];
    const samples: NonNullable<Rec['samples']> = [];
    const changes: Change[] = [];
    const fromScale: { mode: Mode; name: string }[] = [];
    for (const mode of modes) {
      const inMode = fs.filter((f) => f.mode === mode);
      const partners = ps.filter((p) => p.mode === mode && (isButton ? p.bg === token && roles[p.fg] === 'onPrimary' : p.fg === token));
      const current = val(token, mode);
      const passesAll = (h: Hex) => partners.every((p) => contrast(h, val(isButton ? p.fg : p.bg, mode)) >= p.min);
      // 1) un paso de su propia escala con el mismo tono
      const [, chroma, hue] = toOklch(current);
      const sameFamily = (h: Hex) => {
        const [, c, hh] = toOklch(h);
        if (chroma < 0.015) return false; // un gris se corrige moviendo su luz, para que siga siendo gris
        const d = Math.abs(hh - hue);
        return c >= 0.015 && Math.min(d, 360 - d) < 25;
      };
      const candidates = allSteps
        .filter((s) => sameFamily(s.hex))
        .filter((s) => passesAll(s.hex))
        .sort((a, b) => Math.abs(toOklch(a.hex)[0] - toOklch(current)[0]) - Math.abs(toOklch(b.hex)[0] - toOklch(current)[0]));
      let next: Hex;
      if (candidates[0]) { next = candidates[0].hex; fromScale.push({ mode, name: candidates[0].name }); }
      else {
        // 2) mover solo la luz hasta que pase contra todas sus parejas
        next = current;
        for (let i = 0; i < 4 && !passesAll(next); i++) {
          const worst = partners.reduce((w, p) => {
            const r = contrast(next, val(isButton ? p.fg : p.bg, mode));
            return r - p.min < w.gap ? { p, gap: r - p.min } : w;
          }, { p: partners[0], gap: Infinity }).p;
          next = adjustLightness(next, val(isButton ? worst.fg : worst.bg, mode), worst.min + 0.05);
        }
      }
      changes.push({ token, mode, from: current, to: next });
      const w = inMode.reduce((a, b) => (a.ratio < b.ratio ? a : b));
      const fgB = val(w.fg, mode), bgB = val(w.bg, mode);
      const fgA = isButton ? fgB : next, bgA = isButton ? next : bgB;
      samples.push({ mode, beforeFg: fgB, beforeBg: bgB, fg: fgA, bg: bgA, before: w.ratio, after: contrast(fgA, bgA) });
    }
    const worst = fs.reduce((a, b) => (a.ratio < b.ratio ? a : b));
    const isBorder = worst.min === 3;
    recs.push({
      id: `c-${token}`,
      severity: isBorder ? 'mejora' : 'bloquea',
      title: isButton
        ? `El botón principal no se lee bien en modo ${modes.map(modeName).join(' y ')}`
        : `--${token} no se lee bien en modo ${modes.map(modeName).join(' y ')}`,
      why:
        (isButton
          ? `El texto de --${worst.fg} sobre --${token} da ${worst.ratio.toFixed(2)}:1 y pide ${worst.min}:1. Conviene cambiar el fondo del botón, no su texto.`
          : `Falla en ${fs.length === 1 ? 'una pareja' : fs.length + ' parejas'}. La peor es sobre --${worst.bg} en modo ${modeName(worst.mode)}: ${worst.ratio.toFixed(2)}:1, y pide ${worst.min}:1.`) +
        (fromScale.length
          ? ' ' + (fromScale.length === 2 && fromScale[0].name === fromScale[1].name
              ? `En los dos modos sirve --${fromScale[0].name}, que ya existe en tu tema.`
              : fromScale.map((f) => `En ${modeName(f.mode)} sirve --${f.name}, que ya existe en tu tema.`).join(' ')) +
            (fromScale.length < modes.length ? ' En el otro modo se cambia solo la luz del color.' : '')
          : ' El arreglo cambia solo la luz del color; el tono se mantiene.') +
        (isBorder ? ' Si el campo tiene un fondo distinto que lo delimita, este borde puede quedarse.' : ''),
      samples,
      changes,
    });
  }

  // Falta de roles
  const has = (r: Role) => theme.tokens.some((t) => roles[t.name] === r);
  if (!has('focus')) {
    const bg = theme.tokens.find((t) => roles[t.name] === 'bg');
    const primary = theme.tokens.find((t) => roles[t.name] === 'primary');
    const value = primary && bg ? (contrast(primary.light, bg.light) >= 3 ? primary.light : adjustLightness(primary.light, bg.light, 3.05)) : '#14213D';
    recs.push({
      id: 'focus', severity: 'bloquea', title: 'Falta un color de foco',
      why: 'No hay ninguna variable para el anillo de foco. Sin ella, cada componente usa el del navegador o inventa el suyo, y quien navega con teclado pierde dónde está. Agrega --focus-ring con 3:1 contra el fondo.',
      add: { name: 'focus-ring', value },
    });
  }
  for (const r of ['link', 'onPrimary'] as Role[]) {
    if (!has(r)) recs.push({ id: `miss-${r}`, severity: 'sugerencia', title: `No encontré un color para «${ROLE_LABEL[r]}»`, why: 'Si existe con otro nombre, asígnale el rol en la lista de la izquierda y se revisa de nuevo.' });
  }

  // Modo oscuro
  if (!theme.hasDark) {
    recs.push({ id: 'nodark', severity: 'sugerencia', title: 'El tema no tiene modo oscuro', why: 'No encontré un bloque oscuro (por ejemplo [data-theme="dark"] o .dark). Si tu producto lo necesita, el generador puede proponer uno desde tu color de marca.' });
  } else {
    const same = theme.tokens.filter((t) => roles[t.name] !== 'scale' && roles[t.name] !== 'none' && roles[t.name] !== 'bg' && t.dark === t.light);
    if (same.length)
      recs.push({
        id: 'same', severity: 'mejora', title: `${same.length} ${same.length === 1 ? 'color es igual' : 'colores son iguales'} en claro y oscuro`,
        why: `${same.map((t) => '--' + t.name).join(', ')} no ${same.length === 1 ? 'cambia' : 'cambian'} en el modo oscuro. Un color pensado para fondo blanco casi nunca funciona igual sobre fondo oscuro: el texto de marca suele aclararse y los fondos de chips, oscurecerse.`,
      });
  }

  // Escalas incompletas
  for (const [prefix, steps] of Object.entries(scales)) {
    const have = steps.map((s) => s.step);
    const missing = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].filter((s) => !have.includes(s));
    if (missing.length && steps.length >= 6)
      recs.push({
        id: `scale-${prefix}`, severity: 'sugerencia', title: `A la escala --${prefix} le ${missing.length === 1 ? 'falta un paso' : `faltan ${missing.length} pasos`}`,
        why: `Faltan ${missing.join(', ')}. Sin esos pasos no hay un color intermedio para estados como hover o fondos suaves. El generador puede completarlos con el mismo tono.`,
      });
  }

  const order: Record<Severity, number> = { bloquea: 0, mejora: 1, sugerencia: 2 };
  recs.sort((a, b) => order[a.severity] - order[b.severity]);
  return { recs, pairs: ps };
}

/* ---------------- Aplicar y exportar ---------------- */

export function applyChanges(theme: Theme, changes: Change[], adds: { name: string; value: Hex }[]): Theme {
  const tokens = theme.tokens.map((t) => ({ ...t }));
  for (const c of changes) {
    const t = tokens.find((x) => x.name === c.token);
    if (!t) continue;
    if (c.mode === 'light') t.light = c.to; else t.dark = c.to;
  }
  for (const a of adds) if (!tokens.some((t) => t.name === a.name)) tokens.push({ name: a.name, light: a.value, dark: theme.hasDark ? a.value : null });
  return { ...theme, tokens };
}

/** Escribe el archivo corregido con los mismos nombres de variable y el mismo formato. */
export function exportTheme(original: Theme, changes: Change[], adds: { name: string; value: Hex }[]): string {
  if (original.format === 'json') {
    const data = JSON.parse(original.source) as Json;
    const setAt = (path: string[], v: string) => {
      let o = data as Json;
      for (const p of path.slice(0, -1)) o = o[p] as Json;
      const leaf = o[path[path.length - 1]] as Json;
      if ('$value' in leaf) leaf.$value = v; else leaf.value = v;
    };
    for (const c of changes) {
      const p = original.jsonPaths?.[c.token]?.[c.mode] ?? original.jsonPaths?.[c.token]?.light;
      if (p) setAt(p, c.to);
    }
    for (const a of adds) (data as Json)[a.name] = { $type: 'color', $value: a.value };
    return JSON.stringify(data, null, 2) + '\n';
  }
  let src = original.source;
  const blocks = () => cssBlocks(src);
  const replaceIn = (dark: boolean, name: string, value: string) => {
    const b = blocks().find((x) => DARK_SEL.test(x.selector) === dark && new RegExp(`--${name}\\s*:`).test(x.body));
    if (b) {
      const body = b.body.replace(new RegExp(`(--${name}\\s*:\\s*)([^;]+)`), `$1${value}`);
      src = src.slice(0, b.start) + body + src.slice(b.end);
      return;
    }
    const target = blocks().find((x) => DARK_SEL.test(x.selector) === dark && Object.keys(cssVars(x.body)).length);
    if (target) src = src.slice(0, target.end) + `  --${name}: ${value};\n` + src.slice(target.end);
    else src += `\n${dark ? original.darkSelector : ':root'} {\n  --${name}: ${value};\n}\n`;
  };
  for (const c of changes) {
    replaceIn(c.mode === 'dark', c.token, c.to);
    // Si el oscuro heredaba este color del claro, se deja fijo su valor anterior para no cambiarlo sin querer.
    const inDark = blocks().some((x) => DARK_SEL.test(x.selector) && new RegExp(`--${c.token}\\s*:`).test(x.body));
    const darkChanged = changes.some((o) => o.token === c.token && o.mode === 'dark');
    const old = original.tokens.find((t) => t.name === c.token)?.dark;
    if (c.mode === 'light' && original.hasDark && !inDark && !darkChanged && old) replaceIn(true, c.token, old);
  }
  for (const a of adds) replaceIn(false, a.name, a.value);
  return src;
}

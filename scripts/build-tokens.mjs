// Trama · Construye variables CSS y un módulo TS a partir de trama-tokens.json
// Fuente: export de Tokens Studio (formato DTCG con $value / $type).
//
// Estrategia multimarca:
//   primitives.css      → :root                      (valores crudos)
//   brand-hilo.css      → :root, [data-brand="hilo"] (Hilo es la marca por defecto)
//   brand-ruta.css      → [data-brand="ruta"]
//   semantic-light.css  → :root, [data-mode="light"]
//   semantic-dark.css   → [data-mode="dark"]
// Los semánticos apuntan a var(--brand-*), así que la cascada de CSS combina
// cualquier marca con cualquier modo sin generar 4 archivos repetidos.

import fs from 'node:fs';
import path from 'node:path';
import StyleDictionary from 'style-dictionary';

const SRC = 'tokens/trama-tokens.json';
const SPLIT = 'tokens/sets';
const OUT = 'src/styles/tokens/';

// 1. Separar cada set de Tokens Studio en su propio archivo
const all = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const sets = {
  primitives: 'primitives',
  'brand/hilo': 'brand-hilo',
  'brand/ruta': 'brand-ruta',
  'semantic/light': 'semantic-light',
  'semantic/dark': 'semantic-dark',
};
fs.mkdirSync(SPLIT, { recursive: true });
for (const [set, file] of Object.entries(sets)) {
  fs.writeFileSync(path.join(SPLIT, `${file}.json`), JSON.stringify(all[set], null, 2));
}
const f = (name) => `${SPLIT}/${name}.json`;

// 2. Formato propio: módulo TS con nombre → var(--css), útil en React
StyleDictionary.registerFormat({
  name: 'trama/ts-vars',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(
      (t) => `  '${t.path.join('.')}': 'var(--${t.name})',`
    );
    return [
      '// Generado por Style Dictionary. No editar a mano.',
      'export const tokens = {',
      ...lines,
      '} as const;',
      'export type TokenName = keyof typeof tokens;',
      '',
    ].join('\n');
  },
});

const transforms = ['name/kebab'];

// 3. Una corrida por capa: se incluyen los sets necesarios para resolver
//    referencias, pero solo se imprime la capa que corresponde.
async function layer({ sources, only, file, selector, refs = true }) {
  const sd = new StyleDictionary({
    source: sources.map(f),
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: {
        transforms,
        buildPath: OUT,
        files: [
          {
            destination: file,
            format: 'css/variables',
            filter: (t) => t.filePath === f(only),
            options: { selector, outputReferences: refs },
          },
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
}

await layer({ sources: ['primitives'], only: 'primitives', file: 'primitives.css', selector: ':root', refs: false });
await layer({ sources: ['primitives', 'brand-hilo'], only: 'brand-hilo', file: 'brand-hilo.css', selector: ':root, [data-brand="hilo"]' });
await layer({ sources: ['primitives', 'brand-ruta'], only: 'brand-ruta', file: 'brand-ruta.css', selector: '[data-brand="ruta"]' });
await layer({ sources: ['primitives', 'brand-hilo', 'semantic-light'], only: 'semantic-light', file: 'semantic-light.css', selector: ':root, [data-mode="light"]' });
await layer({ sources: ['primitives', 'brand-hilo', 'semantic-dark'], only: 'semantic-dark', file: 'semantic-dark.css', selector: '[data-mode="dark"]' });

// 4. Módulo TS con todos los nombres (los valores viven en CSS)
const ts = new StyleDictionary({
  source: ['primitives', 'brand-hilo', 'semantic-light'].map(f),
  log: { verbosity: 'silent', warnings: 'disabled' },
  platforms: {
    ts: { transforms, buildPath: OUT, files: [{ destination: 'tokens.ts', format: 'trama/ts-vars' }] },
  },
});
await ts.buildAllPlatforms();

// 5. Punto de entrada: importa todas las capas + movimiento reducido
fs.writeFileSync(
  path.join(OUT, 'trama.css'),
  [
    '/* Trama · punto de entrada. Generado por build-tokens.mjs */',
    "@import './primitives.css';",
    "@import './brand-hilo.css';",
    "@import './brand-ruta.css';",
    "@import './semantic-light.css';",
    "@import './semantic-dark.css';",
    '',
    '/* WCAG 2.3.3: sin animaciones si la persona lo pide en su sistema */',
    '@media (prefers-reduced-motion: reduce) {',
    '  :root { --motion-fast: 0ms; --motion-base: 0ms; --motion-slow: 0ms; }',
    '}',
    '',
  ].join('\n')
);

console.log('Listo:', fs.readdirSync(OUT).join(', '));

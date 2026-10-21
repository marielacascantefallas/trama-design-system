import { useEffect, useMemo, useState } from 'react';
import { normalizeHex, type Hex } from './color';
import {
  CORNERS, buildRamp, cssVars, exportCss, exportDtcg, firstPassingStep, runChecks, semantic, type Corners,
} from './theme';
import { ChartLine, Preview, RampStrip, download, sizeFor } from './ui';

export const PRESETS: { name: string; hex: Hex; slug: string }[] = [
  { name: 'Añil, de Hilo', hex: '#5B5FEE', slug: 'anil' },
  { name: 'Atardecer, de Ruta', hex: '#EA5A1A', slug: 'atardecer' },
  { name: 'Turquesa', hex: '#14B8A6', slug: 'turquesa' },
  { name: 'Bosque', hex: '#2E6B46', slug: 'bosque' },
];

export function Create({ brand, setBrand }: { brand: Hex; setBrand: (h: Hex) => void }) {
  const [draft, setDraft] = useState(brand);
  const [error, setError] = useState('');
  const [corners, setCorners] = useState<Corners>('medias');
  const [exact, setExact] = useState(false);
  const [status, setStatus] = useState('');

  // Mantiene el campo al día cuando el color cambia desde un atajo o desde Revisar.
  useEffect(() => { setDraft((d) => (normalizeHex(d) === brand ? d : brand)); }, [brand]);

  const { ramp, anchor, light, dark, checks } = useMemo(() => {
    const { ramp, anchor } = buildRamp(brand);
    const light = semantic(ramp, 'light', exact ? brand : null);
    const dark = semantic(ramp, 'dark', exact ? brand : null);
    return { ramp, anchor, light, dark, checks: runChecks(light, dark) };
  }, [brand, exact]);

  const fails = checks.filter((c) => c.light < c.min || c.dark < c.min);
  const sorted = [...checks].sort((a, b) => Math.min(b.light, b.dark) - Math.min(a.light, a.dark));
  const lightVars = cssVars(ramp, corners, exact ? light : null);
  const darkVars = cssVars(ramp, corners, exact ? dark : null);
  const preset = PRESETS.find((p) => p.hex === brand);
  const slug = preset?.slug ?? 'marca';

  const commit = (value: string) => {
    const h = normalizeHex(value);
    if (!h) { setError('Escribe un color en hexadecimal, por ejemplo #14B8A6.'); return; }
    setError('');
    setBrand(h);
  };

  const fixFor = (a: string, b: string, min: number, mode: 'light' | 'dark') => {
    const bg = (mode === 'light' ? light : dark)[b];
    const step = firstPassingStep(ramp, bg, min, mode === 'light' ? 'light' : 'dark');
    if (!a.startsWith('text.brand') && !a.startsWith('focus') && !a.startsWith('action')) return undefined;
    return step ? `Con el paso ${step} llega a ${min}:1 en ${mode === 'light' ? 'claro' : 'oscuro'}.` : undefined;
  };

  return (
    <>
      <div className="tool" role="group" aria-label="Opciones del tema">
        <div>
          <label className="label" htmlFor="hex">Color de marca</label>
          <span className={`hex ${error ? 'is-error' : ''}`}>
            <input type="color" aria-label="Elegir con el selector de color" value={brand.toLowerCase()} onChange={(e) => { setDraft(e.target.value.toUpperCase()); commit(e.target.value); }} />
            <input
              id="hex" type="text" inputMode="text" spellCheck={false} value={draft}
              aria-invalid={!!error} aria-describedby={error ? 'hex-err' : undefined}
              onChange={(e) => { setDraft(e.target.value); if (normalizeHex(e.target.value)) commit(e.target.value); }}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
            />
          </span>
          {error && <span id="hex-err" className="err">{error}</span>}
        </div>
        <fieldset>
          <legend>Probar con</legend>
          <span className="swatches">
            {PRESETS.map((p) => (
              <label key={p.hex} className="swatch" title={p.name}>
                <input type="radio" name="preset" checked={brand === p.hex} onChange={() => { setError(''); setBrand(p.hex); }} aria-label={p.name} />
                <span style={{ background: p.hex }} />
              </label>
            ))}
          </span>
        </fieldset>
        <fieldset>
          <legend>Esquinas</legend>
          {(Object.keys(CORNERS) as Corners[]).map((k) => (
            <label key={k} className="choice">
              <input type="radio" name="corners" checked={corners === k} onChange={() => setCorners(k)} />
              <span>{CORNERS[k].label}</span>
            </label>
          ))}
        </fieldset>
        <button type="button" role="switch" aria-checked={exact} className="toggle" onClick={() => setExact(!exact)}>
          <i aria-hidden />
          <span>
            <strong>Usar mi color exacto</strong>
            <small>En botón, link y foco, aunque baje el contraste</small>
          </span>
        </button>
      </div>

      <div className="canvas">
        <section aria-labelledby="titulo">
          <h1 id="titulo">¿Se puede leer tu marca en cada pantalla?</h1>
          <p className="lead">
            Cada línea es una pareja real de texto y fondo del tema, de la que mejor se lee a la que más cuesta. Si una
            se lee con esfuerzo aquí, también le costará a quien use tu producto.
          </p>
          <p className={`verdict ${fails.length ? '' : 'ok'}`} role="status">
            {fails.length ? (
              <><strong>{fails.length} de 17 parejas</strong> no llegan al mínimo de WCAG 2.2 AA.</>
            ) : (
              <><strong>Las 17 parejas</strong> cumplen WCAG 2.2 AA en claro y en oscuro.</>
            )}
          </p>
          <div className="chart-head" aria-hidden><span>Pareja</span><span>Claro</span><span>Oscuro</span></div>
          <ol className="chart" aria-label="Contraste de cada pareja, en claro y en oscuro">
            {sorted.map((c, i) => {
              const failMode = c.light < c.min ? 'light' : c.dark < c.min ? 'dark' : null;
              return (
                <ChartLine
                  key={c.use} label={c.use} fg={light[c.a]} bg={light[c.b]} size={sizeFor(i)}
                  light={c.light} dark={c.dark} min={c.min}
                  fix={failMode ? fixFor(c.a, c.b, c.min, failMode) : undefined}
                />
              );
            })}
          </ol>
        </section>

        <aside aria-label="Escala y vista previa" className="order-first">
          <h2>La escala</h2>
          <RampStrip ramp={ramp} anchor={anchor} label={`Escala de ${preset?.name ?? brand}, del 50 al 900`} />
          <p className="note">
            Tu color quedó en el paso {anchor}.{' '}
            {exact ? 'Botón, link y foco usan tu color exacto.' : 'Botón y links usan pasos más oscuros para que se puedan leer.'}
          </p>
          <h2 id="vista">En una pantalla</h2>
          <div className="pv">
            <Preview mode="light" vars={lightVars} canvas={light['bg.canvas']} />
            <Preview mode="dark" vars={darkVars} canvas={dark['bg.canvas']} />
          </div>
          <div className="act">
            <button
              type="button" className="btn primary"
              onClick={() => { download(`trama-${slug}.tokens.json`, JSON.stringify(exportDtcg(slug, ramp, corners), null, 2), 'application/json'); setStatus('Descargaste los tokens en formato DTCG.'); }}
            >
              Descargar tokens
            </button>
            <button
              type="button" className="btn"
              onClick={async () => {
                try { await navigator.clipboard.writeText(exportCss(ramp, corners, light, dark, exact)); setStatus('CSS copiado. Pégalo en tu hoja de estilos.'); }
                catch { download(`trama-${slug}.css`, exportCss(ramp, corners, light, dark, exact), 'text/css'); setStatus('Tu navegador no dejó copiar, así que se descargó el archivo CSS.'); }
              }}
            >
              Copiar CSS
            </button>
          </div>
          <p className="status" role="status">{status}</p>
        </aside>
      </div>
    </>
  );
}

import { useMemo, useRef, useState, type DragEvent } from 'react';
import ejemplo from './ejemplo-brisa.css?raw';
import { contrast, type Hex } from './color';
import {
  COVERAGE, ROLE_LABEL, applyChanges, exportTheme, guessRole, pairs, parseTheme, recommend,
  type Rec, type Role, type Theme,
} from './analyze';
import { ChartLine, Specimen, download, sizeFor } from './ui';

const SEV_LABEL = { bloquea: 'Bloquea AA', mejora: 'Mejora', sugerencia: 'Sugerencia' } as const;

export function Review({ openInCreate }: { openInCreate: (h: Hex) => void }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [applied, setApplied] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const [paste, setPaste] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = (name: string, src: string) => {
    try {
      const t = parseTheme(name, src);
      setTheme(t);
      setRoles(Object.fromEntries(t.tokens.map((x) => [x.name, guessRole(x.name)])));
      setApplied([]);
      setError('');
      setStatus('');
      setPaste(false);
      requestAnimationFrame(() => document.getElementById('resultado')?.focus());
    } catch {
      setError(`No encontré colores en ${name}. Sube un .css con variables (--nombre: #hex) o un .json de tokens con $value o value.`);
    }
  };
  const readFile = async (f: File) => {
    if (f.size > 1_000_000) { setError('El archivo pesa más de 1 MB. Sube solo el archivo de tokens o de variables.'); return; }
    load(f.name, await f.text());
  };

  const analysis = useMemo(() => (theme ? recommend(theme, roles) : null), [theme, roles]);
  const chosen = analysis ? analysis.recs.filter((r) => applied.includes(r.id)) : [];
  const changes = chosen.flatMap((r) => r.changes ?? []);
  const adds = chosen.flatMap((r) => (r.add ? [r.add] : []));
  const current = theme ? applyChanges(theme, changes, adds) : null;
  const currentRoles = { ...roles, ...Object.fromEntries(adds.map((a) => [a.name, 'focus' as Role])) };
  const now = current ? pairs(current, currentRoles) : [];

  if (!theme || !analysis || !current) {
    return (
      <div className="canvas"><section>
          <h1>Revisa el contraste de tu tema</h1>
          <p className="lead">
            Sube tu archivo de variables. Te digo qué parejas de texto y fondo no se leen bien, qué roles le faltan al
            tema y cómo arreglarlo sin cambiar el tono de tu marca. El archivo se lee en tu navegador y no se envía a
            ningún servidor.
          </p>
          <div
            className={`drop ${over ? 'is-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e: DragEvent) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
          >
            <h2>Arrastra tu archivo aquí</h2>
            <p>Acepta .css con variables, incluidos los modos oscuros con [data-theme="dark"], .dark o prefers-color-scheme, y .json de tokens en formato DTCG o Tokens Studio.</p>
            <div className="act" style={{ marginTop: 4 }}>
              <button type="button" className="btn primary" onClick={() => fileRef.current?.click()}>Elegir archivo</button>
              <button type="button" className="btn" onClick={() => setPaste(!paste)} aria-expanded={paste}>Pegar el contenido</button>
              <button type="button" className="btn" onClick={() => load('ejemplo-brisa.css', ejemplo)}>Probar con un tema de ejemplo</button>
            </div>
            <input ref={fileRef} type="file" accept=".css,.json,text/css,application/json" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
          </div>
          {paste && (
            <div style={{ marginTop: 16 }}>
              <label className="label" htmlFor="pegar" style={{ float: 'none', display: 'block', marginBottom: 6 }}>Contenido del archivo</label>
              <textarea id="pegar" className="paste" value={text} onChange={(e) => setText(e.target.value)} placeholder=":root { --primary: #3E9B6A; }" />
              <div className="act" style={{ marginTop: 10 }}>
                <button type="button" className="btn primary" disabled={!text.trim()} onClick={() => load(text.trim().startsWith('{') ? 'pegado.json' : 'pegado.css', text)}>Revisar</button>
              </div>
            </div>
          )}
          {error && <p className="err" role="alert" style={{ marginTop: 12 }}>{error}</p>}
        </section></div>
    );
  }

  const passNow = now.filter((p) => p.ratio >= p.min).length;
  const missing = COVERAGE.filter((r) => !current.tokens.some((t) => currentRoles[t.name] === r));
  const val = (n: string, m: 'light' | 'dark') => { const t = current.tokens.find((x) => x.name === n)!; return m === 'dark' ? t.dark ?? t.light : t.light; };
  const linesByPair = [...new Set(now.map((p) => `${p.fg}|${p.bg}|${p.min}`))].map((k) => {
    const [fg, bg, min] = k.split('|');
    const l = now.find((p) => p.fg === fg && p.bg === bg && p.mode === 'light')!;
    const d = now.find((p) => p.fg === fg && p.bg === bg && p.mode === 'dark');
    return { fg, bg, min: +min, light: l.ratio, dark: d ? d.ratio : null };
  }).sort((a, b) => Math.min(b.light, b.dark ?? 99) - Math.min(a.light, a.dark ?? 99));
  const primary = current.tokens.find((t) => currentRoles[t.name] === 'primary');
  const ext = theme.format === 'json' ? 'json' : 'css';
  const outName = theme.fileName.replace(/(\.[a-z]+)?$/i, `-corregido.${ext}`);

  return (
    <div className="canvas">
      <section aria-labelledby="resultado">
        <h1 id="resultado" tabIndex={-1}>Así se lee {theme.fileName}</h1>
        <p className="summary" role="status">
          {passNow} de {now.length} parejas se leen bien
          {theme.hasDark ? ' entre claro y oscuro' : ''}.{' '}
          {missing.length ? `Falta: ${missing.map((r) => ROLE_LABEL[r].toLowerCase()).join(', ')}.` : 'Tiene todos los roles que reviso.'}
          {applied.length ? ` Llevas ${applied.length} ${applied.length === 1 ? 'arreglo aplicado' : 'arreglos aplicados'}.` : ''}
        </p>

        <h2>Recomendaciones</h2>
        {analysis.recs.length === 0 ? (
          <p className="lead">No encontré nada que corregir con los roles actuales.</p>
        ) : (
          <ol className="recs">
            {analysis.recs.map((r) => <RecItem key={r.id} r={r} done={applied.includes(r.id)} toggle={() => setApplied((a) => (a.includes(r.id) ? a.filter((x) => x !== r.id) : [...a, r.id]))} />)}
          </ol>
        )}

        <h2 style={{ marginTop: 40 }}>Todas las parejas</h2>
        <div className="chart-head" aria-hidden><span>Pareja</span><span>Claro</span><span>Oscuro</span></div>
        <ol className="chart" aria-label="Contraste de cada pareja del tema">
          {linesByPair.map((p, i) => (
            <ChartLine key={p.fg + p.bg} label={`--${p.fg} sobre --${p.bg}`} fg={val(p.fg, 'light')} bg={val(p.bg, 'light')} size={Math.min(sizeFor(i), 22)} compact light={p.light} dark={p.dark} min={p.min} />
          ))}
        </ol>
      </section>

      <aside aria-label="Archivo y roles">
        <div className="file">
          <div>
            <h2 style={{ margin: 0 }}>{theme.fileName}</h2>
            <p>{theme.tokens.length} colores, {theme.hasDark ? 'con modo claro y oscuro' : 'solo modo claro'}</p>
            {theme.note && <p>{theme.note}</p>}
          </div>
          <button type="button" className="btn small" onClick={() => { setTheme(null); setStatus(''); }}>Cambiar archivo</button>
        </div>
        <h2 style={{ marginTop: 20 }}>Roles detectados</h2>
        <p className="note" style={{ margin: '0 0 8px' }}>Los adiviné por el nombre de cada variable. Si alguno no acertó, cámbialo y se revisa de nuevo.</p>
        <ul className="roles">
          {theme.tokens.map((t) => (
            <li key={t.name}>
              <i style={{ background: t.light }} aria-hidden />
              <code>--{t.name}</code>
              <select
                aria-label={`Rol de --${t.name}`} value={roles[t.name]}
                onChange={(e) => { setRoles({ ...roles, [t.name]: e.target.value as Role }); setApplied([]); }}
              >
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </li>
          ))}
        </ul>
        <div className="act">
          <button
            type="button" className="btn primary" disabled={!applied.length}
            onClick={() => { download(outName, exportTheme(theme, changes, adds), ext === 'json' ? 'application/json' : 'text/css'); setStatus(`Descargaste ${outName} con tus mismos nombres de variable.`); }}
          >
            Descargar tema corregido
          </button>
          {primary && <button type="button" className="btn" onClick={() => openInCreate(primary.light)}>Abrir --{primary.name} en el generador</button>}
        </div>
        <p className="status" role="status">{applied.length ? status : 'Aplica al menos un arreglo para descargar el tema corregido.'}</p>
      </aside>
    </div>
  );
}

function RecItem({ r, done, toggle }: { r: Rec; done: boolean; toggle: () => void }) {
  const canApply = !!(r.changes?.length || r.add);
  const s = (fg: Hex, bg: Hex, v: number, hex: Hex) => (
    <span className="pair-s">
      <Specimen label="Aa" fg={fg} bg={bg} size={18} />
      <small>{hex}, {v.toFixed(2)}:1</small>
    </span>
  );
  return (
    <li className={`rec ${done ? 'is-done' : ''}`}>
      <div>
        <span className={`sev ${r.severity}`}>{SEV_LABEL[r.severity]}</span>
        <h3>{r.title}</h3>
      </div>
      <p>{r.why}</p>
      {r.samples?.map((x) => (
        <div className="ba" key={x.mode}>
          <em>{x.mode === 'light' ? 'Claro' : 'Oscuro'}:</em>
          {s(x.beforeFg, x.beforeBg, x.before, x.beforeFg === x.fg ? x.beforeBg : x.beforeFg)}
          <em>pasa a</em>
          {s(x.fg, x.bg, x.after, x.beforeFg === x.fg ? x.bg : x.fg)}
        </div>
      ))}
      {r.add && (
        <div className="ba">
          <span className="s" style={{ background: '#fff', boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${r.add.value}` }}>
            --{r.add.name} <small>{r.add.value}, {contrast(r.add.value, '#FFFFFF').toFixed(2)}:1 sobre blanco</small>
          </span>
        </div>
      )}
      {canApply && (
        <button type="button" className="btn small" aria-pressed={done} onClick={toggle}>
          {done ? 'Deshacer' : 'Aplicar'}
        </button>
      )}
    </li>
  );
}

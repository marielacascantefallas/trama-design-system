import { useState, type KeyboardEvent } from 'react';
import type { Hex } from './color';
import { Create } from './Create';
import { Review } from './Review';
import { LabNav } from '../../shared/LabNav';

type Tab = 'crear' | 'revisar';
const TABS: { id: Tab; label: string }[] = [
  { id: 'crear', label: 'Crear desde un color' },
  { id: 'revisar', label: 'Revisar mi tema' },
];

const initialTab = (): Tab => (location.hash === '#revisar' ? 'revisar' : 'crear');

export function App() {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [brand, setBrand] = useState<Hex>('#14B8A6');

  const go = (t: Tab, focus = false) => {
    setTab(t);
    history.replaceState(null, '', `#${t}`);
    if (focus) document.getElementById(`tab-${t}`)?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    go(tab === 'crear' ? 'revisar' : 'crear', true);
  };

  return (
    <>
      <a className="skip" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>
        Saltar al contenido
      </a>
      <header className="bar">
        <strong>Trama</strong>
        <LabNav current="temas" />
        <div className="tabs" role="tablist" aria-label="Generador de temas" onKeyDown={onKey}>
          {TABS.map((t) => (
            <button
              key={t.id} id={`tab-${t.id}`} role="tab" type="button" className="tab"
              aria-selected={tab === t.id} aria-controls="panel" tabIndex={tab === t.id ? 0 : -1}
              onClick={() => go(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <main id="contenido" tabIndex={-1}>
      <div id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'crear' ? (
          <Create brand={brand} setBrand={setBrand} />
        ) : (
          <Review openInCreate={(h) => { setBrand(h); go('crear'); }} />
        )}
      </div>
      </main>
    </>
  );
}

import { useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  /** Contador opcional, por ejemplo chats sin leer. */
  count?: number;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Nombre accesible del grupo, por ejemplo "Filtrar bandeja". */
  'aria-label': string;
  items: TabItem[];
  /** Id de la pestaña activa. */
  value: string;
  onChange: (id: string) => void;
  /**
   * Prefijo para enlazar cada pestaña con su panel (`aria-controls`).
   * Pásalo solo si usas `TabPanel` con el mismo prefijo; sin él, las
   * pestañas funcionan como filtro de una lista que ya está en pantalla.
   */
  idPrefix?: string;
}

const tabId = (p: string, id: string) => `${p}-tab-${id}`;
const panelId = (p: string, id: string) => `${p}-panel-${id}`;

/**
 * Pestañas según el patrón WAI-ARIA: Tab entra a la pestaña activa, las
 * flechas se mueven entre pestañas, Inicio y Fin van a los extremos. La
 * activa se marca con subrayado y peso, no solo con color.
 */
export function Tabs({ items, value, onChange, idPrefix, className, ...rest }: TabsProps) {
  const auto = useId();
  const prefix = idPrefix ?? auto;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (e: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = targets[e.key];
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].id);
  };

  return (
    <div role="tablist" className={['trama-tabs', className].filter(Boolean).join(' ')} {...rest}>
      {items.map((item, i) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(prefix, item.id)}
            aria-selected={active}
            aria-controls={idPrefix ? panelId(prefix, item.id) : undefined}
            tabIndex={active ? 0 : -1}
            className={['trama-tab', active && 'trama-tab--active'].filter(Boolean).join(' ')}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => move(e, i)}
          >
            {item.label}
            {item.count !== undefined && <span className="trama-tab__count">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** El mismo `idPrefix` que en `Tabs`. */
  idPrefix: string;
  /** Id de la pestaña a la que pertenece este panel. */
  tab: string;
  /** Id de la pestaña activa. El panel se oculta si no coincide. */
  value: string;
  children: ReactNode;
}

/** Panel que acompaña a una pestaña. */
export function TabPanel({ idPrefix, tab, value, children, ...rest }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelId(idPrefix, tab)}
      aria-labelledby={tabId(idPrefix, tab)}
      hidden={tab !== value}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
}

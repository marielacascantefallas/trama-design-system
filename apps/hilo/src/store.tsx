import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { CHATS, TEAM, type Chat, type Person } from './data';

export type Route = 'bandeja' | 'clientes' | 'equipo' | 'ajustes';

export type State = {
  route: Route;
  chats: Chat[];
  team: Person[];
  selected: string;
  assign: string[] | null;
  toast: string | null;
  reportSent: boolean;
  unmarked: number;
};

export type Action =
  | { type: 'route'; route: Route }
  | { type: 'select'; id: string }
  | { type: 'send'; id: string; text: string }
  | { type: 'draft'; id: string; text: string }
  | { type: 'unmark'; id: string }
  | { type: 'resolve'; id: string }
  | { type: 'openAssign'; ids: string[] }
  | { type: 'closeAssign' }
  | { type: 'assign'; ids: string[]; to: string }
  | { type: 'toast'; text: string | null }
  | { type: 'sendReport' };

const nameOf = (team: Person[], id: string) => team.find((p) => p.id === id)?.name.split(' ')[0] ?? '';

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'route':
      return { ...s, route: a.route };
    case 'select':
      return { ...s, selected: a.id };
    case 'draft':
      return { ...s, chats: s.chats.map((c) => (c.id === a.id ? { ...c, draft: a.text } : c)) };
    case 'send':
      return {
        ...s,
        chats: s.chats.map((c) =>
          c.id === a.id
            ? {
                ...c,
                draft: '',
                pending: false,
                preview: a.text,
                time: '9:42',
                status: c.urgent ? c.status : { tone: 'success', label: 'Respondido' },
                messages: [
                  ...c.messages,
                  {
                    side: 'outgoing',
                    text: a.text,
                    time: '9:42 a.m.',
                    day: 'Hoy',
                    author: nameOf(s.team, c.owner ?? 'ana'),
                  },
                ],
              }
            : c,
        ),
      };
    case 'unmark':
      return {
        ...s,
        chats: s.chats.map((c) =>
          c.id === a.id ? { ...c, urgent: undefined, status: { tone: 'warning', label: 'Sin responder' } } : c,
        ),
        unmarked: s.unmarked + 1,
        toast: 'Marca de urgente quitada. Hilo no la volverá a poner en este chat hoy.',
      };
    case 'resolve':
      return {
        ...s,
        chats: s.chats.map((c) =>
          c.id === a.id
            ? { ...c, urgent: undefined, pending: false, status: { tone: 'success', label: 'Resuelto' } }
            : c,
        ),
        toast: 'Chat marcado como resuelto.',
      };
    case 'openAssign':
      return { ...s, assign: a.ids };
    case 'closeAssign':
      return { ...s, assign: null };
    case 'assign': {
      const n = a.ids.length;
      return {
        ...s,
        assign: null,
        chats: s.chats.map((c) =>
          a.ids.includes(c.id)
            ? { ...c, owner: a.to, group: 'mios', pending: true, status: { tone: 'warning', label: 'Sin responder' } }
            : c,
        ),
        team: s.team.map((p) => {
          const moved = s.chats.filter((c) => a.ids.includes(c.id) && c.owner === p.id).length;
          return p.id === a.to ? { ...p, load: p.load + n - moved } : { ...p, load: p.load - moved };
        }),
        toast: `${n === 1 ? '1 chat asignado' : `${n} chats asignados`} a ${s.team.find((p) => p.id === a.to)?.name}.`,
      };
    }
    case 'toast':
      return { ...s, toast: a.text };
    case 'sendReport':
      return { ...s, reportSent: true, toast: 'Reporte enviado al equipo por notificación.' };
  }
}

const routeFromHash = (): Route => {
  const r = window.location.hash.replace('#/', '').split('/')[0];
  return (['bandeja', 'clientes', 'equipo', 'ajustes'] as Route[]).includes(r as Route) ? (r as Route) : 'bandeja';
};

const Ctx = createContext<{ s: State; d: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, {
    route: routeFromHash(),
    chats: CHATS,
    team: TEAM,
    selected: 'cafe-cordillera',
    assign: null,
    toast: null,
    reportSent: false,
    unmarked: 0,
  });

  useEffect(() => {
    const on = () => d({ type: 'route', route: routeFromHash() });
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    if (!s.toast) return;
    const t = setTimeout(() => d({ type: 'toast', text: null }), 4000);
    return () => clearTimeout(t);
  }, [s.toast]);

  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore fuera de StoreProvider');
  return v;
}

export const go = (route: Route) => {
  window.location.hash = `#/${route}`;
};

import { useEffect, useRef, useState } from 'react';
import { AICard, Avatar, Button, List, ListRow, MessageBubble, StatusChip, Tabs } from '@trama';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  FileText,
  ListFilter,
  MoreHorizontal,
  Paperclip,
  Search,
  Users,
} from '../../../shared/icons';
import { go, useStore } from '../store';
import type { Chat } from '../data';

type Tab = 'mios' | 'sin-asignar' | 'pendientes';

function useIsMobile() {
  const q = '(max-width: 760px)';
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

export function Inbox() {
  const { s, d } = useStore();
  const [tab, setTab] = useState<Tab>('mios');
  const [query, setQuery] = useState('');
  const [openMobile, setOpenMobile] = useState(false);
  const mobile = useIsMobile();

  const counts = {
    mios: s.chats.filter((c) => c.group === 'mios').length,
    'sin-asignar': s.chats.filter((c) => c.group === 'sin-asignar').length,
    pendientes: s.chats.filter((c) => c.group === 'mios' && c.pending).length,
  };
  const visible = s.chats
    .filter((c) => (tab === 'pendientes' ? c.group === 'mios' && c.pending : c.group === tab))
    .filter((c) => (query ? (c.name + c.preview).toLowerCase().includes(query.toLowerCase()) : true));
  const chat = s.chats.find((c) => c.id === s.selected) ?? s.chats[0];
  const unassigned = s.chats.filter((c) => c.group === 'sin-asignar').map((c) => c.id);
  const urgentOpen = s.chats.filter((c) => c.urgent);

  return (
    <div className={`hilo-inbox ${openMobile ? 'is-open' : ''}`}>
      <section className="hilo-list" aria-labelledby="bandeja-titulo">
        <header className="hilo-list__header">
          <div>
            <h1 id="bandeja-titulo" className="hilo-h1">
              {mobile ? 'Bandeja del equipo' : 'Bandeja'}
            </h1>
            <p className="hilo-caption">Cuentas Claras, +506 2222 4180</p>
          </div>
          <button type="button" className="hilo-icon-btn hilo-icon-btn--outline" aria-label="Filtros">
            <ListFilter size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        {mobile && (
          <>
            <dl className="hilo-kpis">
              <div>
                <dt>Sin responder</dt>
                <dd>{counts.pendientes}</dd>
                <dd className="is-danger">2 de +2 h</dd>
              </div>
              <div>
                <dt>Sin asignar</dt>
                <dd>{counts['sin-asignar']}</dd>
                <dd>desde las 9:00</dd>
              </div>
              <div>
                <dt>1.ª respuesta</dt>
                <dd>18 min</dd>
                <dd>4 min mejor</dd>
              </div>
            </dl>
            {urgentOpen.length > 0 && (
              <button
                type="button"
                className="hilo-urgent-link"
                onClick={() => {
                  d({ type: 'select', id: urgentOpen[0].id });
                  setOpenMobile(true);
                }}
              >
                <AlertTriangle size={18} aria-hidden />
                <span>
                  <strong>
                    {urgentOpen.length === 1 ? '1 urgencia sin atender' : `${urgentOpen.length} urgencias sin atender`}
                  </strong>
                  <span>
                    {urgentOpen[0].name}, {urgentOpen[0].urgent}
                  </span>
                </span>
                <ChevronRight size={16} aria-hidden />
              </button>
            )}
          </>
        )}

        <div className="hilo-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            aria-label="Buscar cliente, teléfono o cédula"
            placeholder="Buscar cliente, teléfono o cédula"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Tabs
          aria-label="Filtrar bandeja"
          className="hilo-list__tabs"
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          items={[
            { id: 'mios', label: mobile ? 'Todos' : 'Mis clientes', count: counts.mios },
            { id: 'sin-asignar', label: 'Sin asignar', count: counts['sin-asignar'] },
            { id: 'pendientes', label: 'Pendientes', count: counts.pendientes },
          ]}
        />

        {tab === 'sin-asignar' && unassigned.length > 0 && (
          <div className="hilo-assign-bar">
            <span>{unassigned.length} chats sin responsable. Hilo puede sugerir a quién asignarlos.</span>
            <Button size="s" onClick={() => d({ type: 'openAssign', ids: unassigned })}>
              Asignar
            </Button>
          </div>
        )}

        <div className="hilo-list__scroll">
          {visible.length === 0 ? (
            <p className="hilo-empty">
              {query ? `Nada coincide con «${query}».` : 'No hay chats en esta pestaña. Buen trabajo.'}
            </p>
          ) : (
            <List aria-label="Chats" className="hilo-list__rows">
              {visible.map((c) => (
                <ListRow
                  key={c.id}
                  title={c.name}
                  detail={mobile && c.owner ? `${owner(s.team, c.owner)}, ${c.preview}` : c.preview}
                  time={c.time}
                  status={c.status}
                  selected={!mobile && c.id === chat.id}
                  onClick={() => {
                    d({ type: 'select', id: c.id });
                    setOpenMobile(true);
                  }}
                />
              ))}
            </List>
          )}
        </div>
      </section>

      <Conversation chat={chat} onBack={() => setOpenMobile(false)} />
      <ClientPanel chat={chat} />
    </div>
  );
}

const owner = (team: { id: string; name: string }[], id: string) =>
  team.find((p) => p.id === id)?.name.split(' ')[0] ?? '';

function Conversation({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const { s, d } = useStore();
  const [summary, setSummary] = useState<'new' | 'ok' | 'edit'>('new');
  const [text, setText] = useState(chat.summary);
  const thread = useRef<HTMLDivElement>(null);
  const ownerName = chat.owner ? owner(s.team, chat.owner) : null;

  useEffect(() => {
    setSummary('new');
    setText(chat.summary);
  }, [chat.id, chat.summary]);

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight });
  }, [chat.id, chat.messages.length]);

  const send = () => {
    const t = (chat.draft ?? '').trim();
    if (t) d({ type: 'send', id: chat.id, text: t });
  };

  const days = ['Ayer', 'Hoy'] as const;

  return (
    <section className="hilo-convo" aria-labelledby="convo-titulo">
      <header className="hilo-convo__header">
        <button type="button" className="hilo-icon-btn hilo-back" onClick={onBack} aria-label="Volver a la bandeja">
          <ArrowLeft size={20} aria-hidden />
        </button>
        <Avatar name={chat.name} />
        <div className="hilo-convo__who">
          <h2 id="convo-titulo" className="hilo-h2">
            {chat.name}
          </h2>
          <p className="hilo-caption">
            {chat.contact}, {chat.phone}
          </p>
        </div>
        <Button variant="secondary" size="s" onClick={() => d({ type: 'openAssign', ids: [chat.id] })}>
          {ownerName ? `Asignado a ${ownerName}` : 'Asignar'}
        </Button>
        <Button
          variant="secondary"
          size="s"
          onClick={() => d({ type: 'resolve', id: chat.id })}
          disabled={chat.status.label === 'Resuelto'}
        >
          {chat.status.label === 'Resuelto' ? 'Resuelto' : 'Marcar resuelto'}
        </Button>
        <button type="button" className="hilo-icon-btn" aria-label="Más acciones">
          <MoreHorizontal size={20} aria-hidden />
        </button>
      </header>

      <div className="hilo-convo__context">
        {chat.urgent && (
          <div className="hilo-urgent" role="note">
            <AlertTriangle size={16} aria-hidden />
            <span>
              <strong>Urgente automático:</strong> {chat.urgent}
            </span>
            <Button variant="ghost" size="s" onClick={() => d({ type: 'unmark', id: chat.id })}>
              Quitar marca
            </Button>
          </div>
        )}
        <AICard
          title="Resumen de la conversación"
          meta={summary === 'ok' ? `Confirmado por ${ownerName ?? 'Ana'}` : 'Actualizado 9:41'}
          actions={
            summary === 'new' ? (
              <>
                <Button variant="secondary" size="s" onClick={() => setSummary('ok')}>
                  Es correcto
                </Button>
                <Button variant="ghost" size="s" onClick={() => setSummary('edit')}>
                  Corregir
                </Button>
              </>
            ) : summary === 'edit' ? (
              <Button size="s" onClick={() => setSummary('ok')}>
                Guardar corrección
              </Button>
            ) : undefined
          }
        >
          {summary === 'edit' ? (
            <textarea
              className="hilo-textarea"
              aria-label="Corregir el resumen"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              autoFocus
            />
          ) : (
            <p>{text}</p>
          )}
        </AICard>
      </div>

      <div className="hilo-thread" ref={thread} tabIndex={0} aria-label="Mensajes">
        <div className="hilo-thread__inner">
          {days.map((day) => {
            const msgs = chat.messages.filter((m) => m.day === day);
            if (!msgs.length) return null;
            return (
              <div key={day} className="hilo-thread__day">
                <p className="hilo-day">
                  <span>{day}</span>
                </p>
                {msgs.map((m, i) => (
                  <MessageBubble key={i} side={m.side} time={m.time} author={m.author}>
                    {m.text}
                  </MessageBubble>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <form
        className="hilo-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="respuesta" className="trama-sr-only">
          Respuesta a {chat.name}
        </label>
        <textarea
          id="respuesta"
          className="hilo-composer__input"
          rows={2}
          placeholder={`Escribe a ${chat.contact.split(' ')[0]}…`}
          value={chat.draft ?? ''}
          onChange={(e) => d({ type: 'draft', id: chat.id, text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="hilo-composer__bar">
          <Button variant="ghost" size="s" type="button">
            <Paperclip size={16} aria-hidden /> Adjuntar
          </Button>
          <Button variant="ghost" size="s" type="button">
            <FileText size={16} aria-hidden /> Plantillas
          </Button>
          <span className="hilo-caption hilo-composer__hint">Enter para enviar</span>
          <Button type="submit" size="m" disabled={!(chat.draft ?? '').trim()}>
            Enviar
          </Button>
        </div>
      </form>
    </section>
  );
}

function ClientPanel({ chat }: { chat: Chat }) {
  const { s } = useStore();
  const full = chat.id === 'cafe-cordillera';
  const [done, setDone] = useState([false, false, true]);
  const ownerName = chat.owner ? s.team.find((p) => p.id === chat.owner)?.name : 'Sin asignar';
  const tasks = [
    { t: 'Declaración IVA (D-104)', d: 'Septiembre, vence hoy', chip: { tone: 'danger' as const, label: 'Hoy' } },
    { t: 'Planilla CCSS', d: 'Octubre, vence 31 oct', chip: { tone: 'neutral' as const, label: '12 días' } },
    { t: 'Facturas de compras', d: 'Recibidas ayer, 23 documentos' },
  ];
  return (
    <aside className="hilo-panel" aria-label={`Datos de ${chat.name}`}>
      <div className="hilo-panel__section hilo-panel__id">
        <Avatar name={chat.name} />
        <div>
          <p className="hilo-strong">{full ? 'Café Cordillera S.A.' : chat.name}</p>
          <p className="hilo-caption">
            {full ? 'Cliente desde marzo 2022' : chat.group === 'sin-asignar' ? 'Cliente nuevo' : 'Cliente desde 2023'}
          </p>
        </div>
      </div>
      {full && (
        <div className="hilo-panel__tags">
          <StatusChip>IVA mensual</StatusChip>
          <StatusChip>Planilla CCSS</StatusChip>
        </div>
      )}
      <div className="hilo-panel__section">
        <h3 className="hilo-label">Datos</h3>
        <dl className="hilo-dl">
          {full && (
            <div>
              <dt>Cédula jurídica</dt>
              <dd>3-101-482915</dd>
            </div>
          )}
          <div>
            <dt>Contacto</dt>
            <dd>{chat.contact}</dd>
          </div>
          <div>
            <dt>Responsable</dt>
            <dd>{ownerName}</dd>
          </div>
          {full && (
            <div>
              <dt>Último pago</dt>
              <dd>12 oct, ₡185 000</dd>
            </div>
          )}
        </dl>
      </div>
      {full ? (
        <>
          <div className="hilo-panel__section">
            <h3 className="hilo-label">Pendientes este mes</h3>
            <ul className="hilo-checks">
              {tasks.map((t, i) => (
                <li key={t.t}>
                  <label>
                    <input
                      type="checkbox"
                      checked={done[i]}
                      onChange={() => setDone(done.map((v, j) => (j === i ? !v : v)))}
                    />
                    <span>
                      <span className={done[i] ? 'is-done' : ''}>{t.t}</span>
                      <span className="hilo-caption">{t.d}</span>
                    </span>
                  </label>
                  {t.chip && !done[i] && <StatusChip tone={t.chip.tone}>{t.chip.label}</StatusChip>}
                </li>
              ))}
            </ul>
          </div>
          <div className="hilo-panel__section">
            <h3 className="hilo-label">Documentos recientes</h3>
            <ul className="hilo-docs">
              <li>
                <FileText size={16} aria-hidden />
                <span>
                  Reporte ventas tarjeta - sept.pdf<span className="hilo-caption">Ayer, 5:03 p.m., 182 KB</span>
                </span>
              </li>
              <li>
                <FileText size={16} aria-hidden />
                <span>
                  Facturas compras sept.zip<span className="hilo-caption">Ayer, 2:40 p.m., 4,1 MB</span>
                </span>
              </li>
            </ul>
          </div>
          <div className="hilo-panel__section">
            <h3 className="hilo-label">Actividad</h3>
            <ul className="hilo-docs">
              <li>
                <AlertTriangle size={16} aria-hidden />
                <span>
                  Hilo lo marcó como urgente<span className="hilo-caption">Hoy, 9:38 a.m.</span>
                </span>
              </li>
              <li>
                <FileText size={16} aria-hidden />
                <span>
                  Andrés envió el reporte de ventas<span className="hilo-caption">Ayer, 5:03 p.m.</span>
                </span>
              </li>
              <li>
                <Users size={16} aria-hidden />
                <span>
                  Daniela asignó el cliente a Ana<span className="hilo-caption">2 oct, 3:58 p.m.</span>
                </span>
              </li>
            </ul>
          </div>
          <div className="hilo-panel__end">
            <Button variant="secondary" onClick={() => go('clientes')} style={{ width: '100%' }}>
              Ver historial completo
            </Button>
          </div>
        </>
      ) : (
        <p className="hilo-panel__note hilo-caption">
          {chat.group === 'sin-asignar'
            ? 'Todavía no hay historial: es la primera conversación con este cliente.'
            : 'En este prototipo, el historial completo solo está cargado para Café Cordillera.'}
        </p>
      )}
    </aside>
  );
}

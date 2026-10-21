import { useState } from 'react';
import { AICard, Avatar, Button, MetricCard, StatusChip, Tabs } from '@trama';
import { ArrowLeft, Check, ChevronDown, FileText, MessageSquare, Users } from '../../../shared/icons';
import { HISTORY, type EventType } from '../data';
import { go, useStore } from '../store';

const ICON = { mensajes: MessageSquare, tramites: Check, documentos: FileText };

export function ClientView() {
  const { d } = useStore();
  const [tab, setTab] = useState<'todo' | EventType>('todo');
  const [all, setAll] = useState(false);
  const filtered = HISTORY.filter((e) => tab === 'todo' || e.type === tab);
  const shown = all ? filtered : filtered.slice(0, 5);
  const months = [...new Set(shown.map((e) => e.month))];

  return (
    <div className="hilo-page">
      <nav aria-label="Ruta" className="hilo-crumbs">
        <a href="#/bandeja">
          <ArrowLeft size={16} aria-hidden /> Bandeja
        </a>
        <span aria-hidden>/</span>
        <span aria-current="page">Café Cordillera S.A.</span>
      </nav>

      <header className="hilo-card hilo-client-head">
        <Avatar name="Café Cordillera" className="hilo-avatar-xl" />
        <div className="hilo-client-head__data">
          <div className="hilo-row">
            <h1 className="hilo-h1 hilo-h1--lg">Café Cordillera S.A.</h1>
            <StatusChip tone="success">Al día</StatusChip>
          </div>
          <p className="hilo-muted">Cédula jurídica 3-101-482915, Cafetería y tostador, San Pedro de Montes de Oca</p>
          <div className="hilo-row hilo-row--wrap">
            {['IVA mensual', 'Planilla CCSS', 'Régimen general', 'Factura electrónica'].map((t) => (
              <StatusChip key={t}>{t}</StatusChip>
            ))}
          </div>
        </div>
        <div className="hilo-row">
          <Button variant="secondary">Editar datos</Button>
          <Button
            onClick={() => {
              d({ type: 'select', id: 'cafe-cordillera' });
              go('bandeja');
            }}
          >
            Abrir chat
          </Button>
        </div>
      </header>

      <div className="hilo-metrics">
        <MetricCard label="Conversaciones en 2026" value="148" note="12 este mes" />
        <MetricCard label="Primera respuesta (media)" value="22 min" note="8 min menos que en 2025" />
        <MetricCard label="Trámites a tiempo" value="11 de 12" note="Uno con prórroga en junio" />
        <MetricCard label="Saldo pendiente" value="₡0" note="Pagó octubre el día 12" />
      </div>

      <div className="hilo-split">
        <section className="hilo-card hilo-history" aria-labelledby="historial">
          <div className="hilo-card__head">
            <div className="hilo-row hilo-row--between">
              <h2 id="historial" className="hilo-h2">
                Historial
              </h2>
              <span className="hilo-caption">Desde marzo 2022, 1 284 eventos</span>
            </div>
            <Tabs
              aria-label="Filtrar historial"
              idPrefix="historial"
              value={tab}
              onChange={(v) => {
                setTab(v as typeof tab);
                setAll(false);
              }}
              items={[
                { id: 'todo', label: 'Todo', count: 1284 },
                { id: 'mensajes', label: 'Mensajes', count: 1106 },
                { id: 'tramites', label: 'Trámites', count: 143 },
                { id: 'documentos', label: 'Documentos', count: 35 },
              ]}
            />
          </div>
          <div
            role="tabpanel"
            id={`historial-panel-${tab}`}
            aria-labelledby={`historial-tab-${tab}`}
            className="hilo-history__body"
          >
            {months.map((month) => (
              <div key={month}>
                <h3 className="hilo-label hilo-history__month">{month}</h3>
                <ul className="hilo-events">
                  {shown
                    .filter((e) => e.month === month)
                    .map((e) => {
                      const Icon = e.title.startsWith('Cliente asignado') ? Users : ICON[e.type];
                      return (
                        <li key={e.title}>
                          <span className="hilo-event__icon">
                            <Icon size={16} aria-hidden />
                          </span>
                          <span className="hilo-event__text">
                            <span className="hilo-strong">{e.title}</span>
                            <span className="hilo-muted">{e.detail}</span>
                          </span>
                          <span className="hilo-event__meta">
                            <span className="hilo-caption">{e.meta}</span>
                            {e.chip && <StatusChip tone={e.chip.tone}>{e.chip.label}</StatusChip>}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
          {filtered.length > 5 && (
            <div className="hilo-card__foot">
              <span className="hilo-caption">
                Mostrando {shown.length} de {tab === 'todo' ? '1 284' : filtered.length} eventos
              </span>
              <Button variant="ghost" size="s" onClick={() => setAll(!all)} aria-expanded={all}>
                {all ? 'Mostrar menos' : 'Ver septiembre completo'}{' '}
                <ChevronDown size={16} aria-hidden className={all ? 'is-flipped' : ''} />
              </Button>
            </div>
          )}
        </section>

        <div className="hilo-side">
          <AICard title="Resumen del cliente" meta="Con datos de 2026">
            Cliente puntual: paga entre el 10 y el 12 de cada mes. Casi siempre escribe el día del vencimiento, así que
            conviene recordarle los documentos 3 días antes. Prefiere WhatsApp a correo.
          </AICard>
          <section className="hilo-card" aria-labelledby="contactos">
            <h2 id="contactos" className="hilo-label hilo-card__title">
              Contactos
            </h2>
            <ul className="hilo-people">
              <li>
                <Avatar name="Andrés Solano" size="s" />
                <span>
                  Andrés Solano<span className="hilo-caption">Dueño, +506 8813 2207</span>
                </span>
                <StatusChip>Principal</StatusChip>
              </li>
              <li>
                <Avatar name="Mariana Cordero" size="s" />
                <span>
                  Mariana Cordero<span className="hilo-caption">Administradora, facturas y planilla</span>
                </span>
              </li>
            </ul>
          </section>
          <section className="hilo-card hilo-grow" aria-labelledby="responsables">
            <h2 id="responsables" className="hilo-label hilo-card__title">
              Equipo responsable
            </h2>
            <ul className="hilo-people">
              <li>
                <Avatar name="Ana Vargas" size="s" />
                <span>
                  Ana Vargas<span className="hilo-caption">Desde octubre 2026</span>
                </span>
                <StatusChip tone="success">Actual</StatusChip>
              </li>
              <li>
                <Avatar name="Luis Jiménez" size="s" />
                <span>
                  Luis Jiménez<span className="hilo-caption">De marzo 2022 a septiembre 2026</span>
                </span>
              </li>
              <li>
                <Avatar name="Marta Solís" size="s" />
                <span>
                  Marta Solís<span className="hilo-caption">Revisa planillas CCSS, desde 2024</span>
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

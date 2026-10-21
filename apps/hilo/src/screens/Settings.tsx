import { useState } from 'react';
import { Avatar, Button, StatusChip, Switch, TextField } from '@trama';
import { Phone } from '../../../shared/icons';
import { URGENT_RULES } from '../data';
import { useStore } from '../store';

const MODES = [
  {
    id: 'ia',
    label: 'Sugerir con IA y confirmar',
    desc: 'Hilo propone a alguien según carga e historial; una persona confirma.',
  },
  { id: 'turnos', label: 'Repartir por turnos', desc: 'A quien tenga menos chats activos, sin confirmar.' },
  { id: 'manual', label: 'Manual', desc: 'La dueña asigna cada chat.' },
];

const SECTIONS = [
  'General',
  'Número de WhatsApp',
  'Equipo y roles',
  'Asignación',
  'Urgencias',
  'Plantillas',
  'Horario de atención',
];

export function Settings() {
  const { s, d } = useStore();
  const [mode, setMode] = useState('ia');
  const [auto, setAuto] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [invited, setInvited] = useState<string[]>([]);

  const invite = () => {
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError('Escribe un correo completo, por ejemplo nombre@cuentasclaras.cr.');
      return;
    }
    setInvited([...invited, v]);
    setEmail('');
    setError(undefined);
    d({ type: 'toast', text: `Invitación enviada a ${v}.` });
  };

  const people = [
    { name: 'Daniela Rojas', mail: 'daniela@cuentasclaras.cr', owner: true },
    ...s.team.map((p) => ({ name: p.name, mail: `${p.id}@cuentasclaras.cr`, owner: false })),
  ];

  return (
    <div className="hilo-page">
      <header className="hilo-page__head">
        <h1 className="hilo-h1 hilo-h1--lg">Ajustes</h1>
        <p className="hilo-muted">Cuentas Claras, solo la dueña y quien tenga rol de dueño pueden cambiar esto</p>
      </header>

      <div className="hilo-settings">
        <nav className="hilo-subnav" aria-label="Secciones de ajustes">
          <p className="hilo-caption">Espacio de trabajo</p>
          <ul>
            {SECTIONS.map((x, i) => (
              <li key={x}>
                <a href="#/ajustes" aria-current={i === 0 ? 'page' : undefined}>
                  {x}
                </a>
              </li>
            ))}
          </ul>
          <p className="hilo-caption">Cuenta</p>
          <ul>
            <li>
              <a href="#/ajustes">Plan y facturación</a>
            </li>
          </ul>
          <div className="hilo-card hilo-plan">
            <p className="hilo-strong">Plan Equipo</p>
            <p className="hilo-caption">{people.length + invited.length} de 8 personas, renueva el 1 de noviembre</p>
            <span className="hilo-bar" aria-hidden>
              <span style={{ width: `${((people.length + invited.length) / 8) * 100}%` }} />
            </span>
            <Button variant="secondary" size="s">
              Ver plan
            </Button>
          </div>
        </nav>

        <div className="hilo-settings__grid">
          <section className="hilo-card" aria-labelledby="wa">
            <h2 id="wa" className="hilo-h2 hilo-card__pad">
              Número de WhatsApp
            </h2>
            <div className="hilo-row hilo-card__pad-x">
              <span className="hilo-icon-tile">
                <Phone size={20} aria-hidden />
              </span>
              <span className="hilo-grow-x">
                <span className="hilo-strong">+506 2222 4180</span>
                <span className="hilo-caption">WhatsApp Business, verificado el 3 de marzo</span>
              </span>
              <StatusChip tone="success">Conectado</StatusChip>
            </div>
            <dl className="hilo-dl hilo-dl--rows">
              <div>
                <dt>Nombre visible</dt>
                <dd>Cuentas Claras</dd>
              </div>
              <div>
                <dt>Fuera de horario</dt>
                <dd>Responde con mensaje automático</dd>
              </div>
              <div>
                <dt>Horario de atención</dt>
                <dd>Lunes a viernes, de 8:00 a 17:00</dd>
              </div>
            </dl>
            <div className="hilo-row hilo-card__pad">
              <Button variant="secondary" size="s">
                Cambiar número
              </Button>
              <Button variant="ghost" size="s">
                Ver registro de conexión
              </Button>
            </div>
          </section>

          <section className="hilo-card" aria-labelledby="asig">
            <div className="hilo-card__pad">
              <h2 id="asig" className="hilo-h2">
                Asignación de chats nuevos
              </h2>
              <p className="hilo-caption">Qué pasa cuando escribe un cliente sin responsable.</p>
            </div>
            <fieldset className="hilo-radios hilo-card__pad-x">
              <legend className="trama-sr-only">Modo de asignación</legend>
              {MODES.map((m) => (
                <label key={m.id} className={`hilo-radio ${mode === m.id ? 'is-on' : ''}`}>
                  <input type="radio" name="modo" value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} />
                  <span>
                    <span className="hilo-strong">{m.label}</span>
                    <span className="hilo-caption">{m.desc}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>

          <section className="hilo-card" aria-labelledby="eq">
            <div className="hilo-card__pad">
              <h2 id="eq" className="hilo-h2">
                Equipo y roles
              </h2>
              <p className="hilo-caption">
                {people.length} personas, los agentes solo ven sus chats y los sin asignar.
              </p>
            </div>
            <ul className="hilo-people hilo-people--rows">
              {people.map((p) => (
                <li key={p.mail}>
                  <Avatar name={p.name} size="s" />
                  <span>
                    {p.name}
                    <span className="hilo-caption">{p.mail}</span>
                  </span>
                  <StatusChip tone={p.owner ? 'success' : 'neutral'}>{p.owner ? 'Dueña' : 'Agente'}</StatusChip>
                </li>
              ))}
              {invited.map((mail) => (
                <li key={mail}>
                  <Avatar name={mail} size="s" />
                  <span>
                    {mail}
                    <span className="hilo-caption">Todavía no acepta</span>
                  </span>
                  <StatusChip tone="warning">Invitación enviada</StatusChip>
                </li>
              ))}
            </ul>
            <form
              className="hilo-invite"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                invite();
              }}
            >
              <TextField
                label="Invitar por correo"
                type="email"
                placeholder="nombre@cuentasclaras.cr"
                value={email}
                error={error}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit">Invitar</Button>
            </form>
          </section>

          <section className="hilo-card" aria-labelledby="urg">
            <div className="hilo-card__pad">
              <h2 id="urg" className="hilo-h2">
                Urgencias automáticas
              </h2>
            </div>
            <div className="hilo-card__pad-x hilo-switch-main">
              <Switch
                label="Marcar urgencias automáticamente"
                description="Hilo marca el chat como urgente sin pedir confirmación. Cualquiera del equipo puede quitar la marca."
                checked={auto}
                onChange={setAuto}
              />
            </div>
            <div className={`hilo-card__pad hilo-rules ${auto ? '' : 'is-off'}`}>
              <p className="hilo-label">Marcar cuando el mensaje…</p>
              <ul className="hilo-row hilo-row--wrap">
                {URGENT_RULES.map((r) => (
                  <li key={r}>
                    <StatusChip>{r}</StatusChip>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hilo-switches">
              <Switch
                label="Subir urgentes al inicio de la bandeja"
                description="Aparecen primero en “Mis clientes” y en “Sin asignar”."
                defaultChecked
                disabled={!auto}
              />
              <Switch
                label="Avisar a la dueña por notificación"
                description="Solo si nadie responde en 30 minutos."
                defaultChecked
                disabled={!auto}
              />
              <Switch
                label="Responder automáticamente al cliente"
                description="Desactivado: Hilo nunca escribe al cliente sin que alguien lo revise."
                disabled
              />
            </div>
            <div className="hilo-card__foot">
              <span className="hilo-caption">Últimos 30 días: 64 marcadas, 3 quitadas a mano</span>
              <Button variant="ghost" size="s">
                Agregar regla
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

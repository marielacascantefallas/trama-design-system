import { useState } from 'react';
import { Avatar, Button, StatusChip, Switch } from '@trama';
import { Waves, X } from '../../../shared/icons';
import { DAY_LABEL, pax } from '../data';
import { dep, useStore } from '../store';
import { useDialog } from './useDialog';

export function Reschedule() {
  const { s, d } = useStore();
  const close = () => d({ type: 'closeReschedule' });
  const ref = useDialog(close);
  const from = dep(s, s.reschedule!);
  const n = pax(from);
  const options = ['man-1300', 'jue-1300', 'man-930'].map((id) => dep(s, id));
  const [to, setTo] = useState('man-1300');
  const [translate, setTranslate] = useState(true);
  const target = dep(s, to);
  const label = `${DAY_LABEL[target.day].toLowerCase()}, ${target.time}`;
  const whatsapp = from.bookings.filter((b) => !b.ref.startsWith('Viator'));
  const english = from.bookings
    .filter((b) => b.lang === 'Inglés' && !b.ref.startsWith('Viator'))
    .map((b) => b.name.split(' ')[0]);
  const fits = target.cap - pax(target) >= n;
  const when = target.day === 'mañana' ? 'a mañana miércoles 21' : 'al jueves 22';

  return (
    <div className="hilo-scrim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={ref} className="hilo-modal ruta-modal" role="dialog" aria-modal="true" aria-labelledby="reprog-titulo">
        <header className="hilo-modal__head ruta-modal__head">
          <div className="hilo-grow-x">
            <h2 id="reprog-titulo" className="hilo-h2">
              Reprogramar la salida de {from.time}
            </h2>
            <p className="hilo-muted">
              {from.tour}, {from.boat}, {n} pasajeros en {from.bookings.length} reservas
            </p>
            <div className="ruta-alert">
              <Waves size={18} aria-hidden />
              <span>
                <strong>Oleaje de 1,8 m y viento de 25 km/h de 13:00 a 17:00</strong>
                <span>Pronóstico del IMN actualizado a las 10:00</span>
              </span>
            </div>
          </div>
          <button type="button" className="hilo-icon-btn" aria-label="Cerrar" onClick={close}>
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="hilo-modal__body">
          <fieldset className="hilo-radios">
            <legend className="hilo-label">Mover a</legend>
            {options.map((o) => {
              const left = o.cap - pax(o);
              const ok = left >= n;
              return (
                <label key={o.id} className={`hilo-radio ${to === o.id ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="destino"
                    checked={to === o.id}
                    onChange={() => setTo(o.id)}
                    data-autofocus={to === o.id || undefined}
                  />
                  <span className="hilo-grow-x">
                    <span className="hilo-strong">
                      {DAY_LABEL[o.day]}, {o.time}
                    </span>
                    <span className="hilo-caption">
                      {o.boat}, quedan {left} lugares
                    </span>
                  </span>
                  <StatusChip tone={ok ? 'success' : 'warning'}>
                    {ok ? 'Caben todos' : `Faltan ${n - left} lugares`}
                  </StatusChip>
                </label>
              );
            })}
          </fieldset>

          <div>
            <div className="hilo-row hilo-row--between">
              <p className="hilo-label">Se mueven estas reservas</p>
              <span className="hilo-caption">{n} pasajeros</span>
            </div>
            <ul className="ruta-moving">
              {from.bookings.map((b) => (
                <li key={b.id}>
                  <Avatar name={b.name} size="s" />
                  <span>
                    <span className="hilo-strong">{b.name}</span>
                    <span className="hilo-caption">
                      {b.adults + b.kids} {b.adults + b.kids === 1 ? 'persona' : 'personas'},{' '}
                      {b.ref.startsWith('Viator')
                        ? 'Viator avisa al cliente'
                        : `${b.ref.split(', ')[1] ?? 'GetYourGuide'}, ${b.lang.toLowerCase()}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ruta-message">
            <label htmlFor="msg" className="hilo-label">
              Mensaje por WhatsApp a {whatsapp.length} clientes
            </label>
            <textarea
              id="msg"
              className="hilo-textarea"
              rows={3}
              key={to}
              defaultValue={`Hola, por el oleaje de esta tarde movimos su tour del atardecer ${when} a la 1:00 p. m., mismo punto de encuentro. Si esa hora no les sirve, respondan y les ofrecemos otra fecha o la devolución del depósito.`}
            />
            <Switch
              label="Enviar en el idioma de cada cliente"
              description={`${english.join(' y ')} lo reciben en inglés`}
              checked={translate}
              onChange={setTranslate}
            />
          </div>
        </div>

        <footer className="hilo-modal__foot">
          <span className="hilo-caption hilo-grow-x">
            {fits ? 'El depósito se mantiene para la nueva fecha' : 'Elige una salida con lugar para todos'}
          </span>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button disabled={!fits} onClick={() => d({ type: 'reschedule', from: from.id, to, label })}>
            Mover y avisar
          </Button>
        </footer>
      </div>
    </div>
  );
}

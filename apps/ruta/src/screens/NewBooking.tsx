import { useState } from 'react';
import { AICard, Button, TextField } from '@trama';
import { Check, X } from '../../../shared/icons';
import { AI_DRAFT, PRICE, colones, pax } from '../data';
import { useStore } from '../store';
import { useDialog } from './useDialog';

const AI = 'Leído del mensaje';

export function NewBooking() {
  const { s, d } = useStore();
  const close = () => d({ type: 'panel', open: false });
  const ref = useDialog(close);
  const fromAI = s.draft;
  const tomorrow = s.deps.filter((x) => x.day === 'mañana');
  const [depId, setDep] = useState(fromAI ? AI_DRAFT.departure : 'man-930');
  const [adults, setAdults] = useState(fromAI ? AI_DRAFT.adults : 2);
  const [kids, setKids] = useState(fromAI ? AI_DRAFT.kids : 0);
  const [name, setName] = useState(fromAI ? AI_DRAFT.name : '');
  const [hotel, setHotel] = useState(fromAI ? AI_DRAFT.hotel : '');
  const [phone, setPhone] = useState(fromAI ? AI_DRAFT.phone : '');
  const [error, setError] = useState<string>();
  const total = adults * PRICE.adult + kids * PRICE.kid;
  const people = adults + kids;
  const chosen = tomorrow.find((x) => x.id === depId)!;
  const free = chosen.cap - pax(chosen);

  const create = () => {
    if (!name.trim()) return setError('Escribe el nombre de la reserva.');
    if (people > free) return setError(`En esa salida solo quedan ${free} lugares.`);
    d({
      type: 'create',
      dep: depId,
      booking: {
        id: 'R-2052',
        name: name.trim(),
        ref: 'R-2052, WhatsApp',
        adults,
        kids,
        hotel: hotel || 'En el muelle',
        lang: 'Español',
        pay: 'pending',
        deposit: Math.round(total * PRICE.deposit),
      },
    });
  };

  const hint = (text: string) => (fromAI ? text : undefined);

  return (
    <div className="hilo-scrim ruta-scrim--side" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={ref} className="ruta-drawer" role="dialog" aria-modal="true" aria-labelledby="nueva-titulo">
        <header className="hilo-modal__head">
          <div className="hilo-grow-x">
            <h2 id="nueva-titulo" className="hilo-h2">
              Nueva reserva
            </h2>
            <p className="hilo-caption">
              {fromAI ? `Desde WhatsApp, ${AI_DRAFT.phone}, hace 4 min` : 'Reserva manual'}
            </p>
          </div>
          <button type="button" className="hilo-icon-btn" aria-label="Cerrar" onClick={close}>
            <X size={20} aria-hidden />
          </button>
        </header>

        <form
          className="ruta-drawer__body"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          id="form-reserva"
        >
          {fromAI && (
            <>
              <blockquote className="ruta-quote">
                <span className="hilo-caption">Mensaje original</span>
                {AI_DRAFT.message}
              </blockquote>
              <AICard title="Llené 6 campos con el mensaje" meta="Leído 10:21">
                Falta el nombre de la reserva: lo tomé del contacto de WhatsApp. Revisa los campos marcados “{AI}” antes
                de crearla.
              </AICard>
            </>
          )}
          <div className="ruta-grid2">
            <TextField label="Tour" value="Avistamiento de ballenas" readOnly hint={hint(AI)} />
            <TextField label="Fecha" value="Miércoles 21 de octubre" readOnly hint={hint(AI)} />
          </div>
          <fieldset className="ruta-slots">
            <legend className="hilo-label ruta-legend">Salida</legend>
            {tomorrow.map((x) => {
              const left = x.cap - pax(x);
              return (
                <label key={x.id} className={`ruta-slot ${depId === x.id ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="salida"
                    checked={depId === x.id}
                    onChange={() => setDep(x.id)}
                    data-autofocus={depId === x.id || undefined}
                  />
                  <span className="hilo-strong">
                    {x.time} {depId === x.id && <Check size={14} aria-hidden />}
                  </span>
                  <span className="hilo-caption">
                    {x.boat}, quedan {left}
                  </span>
                </label>
              );
            })}
          </fieldset>
          <div className="ruta-grid2">
            <TextField
              label="Adultos"
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Math.max(0, +e.target.value))}
              hint={hint(AI)}
            />
            <TextField
              label="Niños (5 a 11 años)"
              type="number"
              min={0}
              value={kids}
              onChange={(e) => setKids(Math.max(0, +e.target.value))}
              hint={hint(`${AI}: 6 y 9 años`)}
            />
          </div>
          <div className="ruta-grid2">
            <TextField
              label="Nombre de la reserva"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(undefined);
              }}
              hint={hint('Del contacto de WhatsApp')}
              error={error && !name.trim() ? error : undefined}
            />
            <TextField
              label="Recogida"
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              hint={hint(`${AI}, pasan a las 6:35`)}
            />
          </div>
          <div className="ruta-grid2">
            <TextField
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              hint={hint('Del contacto de WhatsApp')}
            />
            <TextField label="Idioma del tour" value="Español" readOnly hint={hint('Escribió en español')} />
          </div>
          <dl className="ruta-price">
            <div>
              <dt>
                {adults} adultos × {colones(PRICE.adult)}
              </dt>
              <dd>{colones(adults * PRICE.adult)}</dd>
            </div>
            <div>
              <dt>
                {kids} niños × {colones(PRICE.kid)}
              </dt>
              <dd>{colones(kids * PRICE.kid)}</dd>
            </div>
            <div className="is-strong">
              <dt>Total</dt>
              <dd>{colones(total)}</dd>
            </div>
            <div className="is-strong">
              <dt>Depósito del 30 % por SINPE Móvil</dt>
              <dd>{colones(Math.round(total * PRICE.deposit))}</dd>
            </div>
          </dl>
          {error && name.trim() && (
            <p className="ruta-error" role="alert">
              Error: {error}
            </p>
          )}
        </form>

        <footer className="hilo-modal__foot">
          <span className="hilo-caption hilo-grow-x">Se le envía al cliente el resumen y el número SINPE</span>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form="form-reserva">
            Crear reserva
          </Button>
        </footer>
      </div>
    </div>
  );
}

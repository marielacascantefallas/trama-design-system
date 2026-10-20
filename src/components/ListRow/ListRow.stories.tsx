import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { List, ListRow } from './ListRow';
import type { StatusTone } from '../StatusChip/StatusChip';
import { AllThemes } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Fila de lista',
  component: ListRow,
  args: {
    title: 'Laura Mora',
    detail: 'Adjunté la factura de octubre',
    status: { tone: 'success', label: 'Asignado' },
    time: '9:21',
    selected: false,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'La misma fila sirve para un **chat en Hilo** y una **reserva en Ruta**. Es un botón dentro de un `<li>`: se navega con Tab y se activa con Enter. La fila activa se marca con fondo de marca, barra lateral y `aria-current`.',
      },
    },
  },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Configurable',
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <List aria-label="Ejemplo">
        <ListRow {...args} />
      </List>
    </div>
  ),
};

export const Estados: Story = {
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <List aria-label="Estados de la fila">
        <ListRow {...args} title="Normal" />
        <ListRow {...args} title="Hover" id="fila-hover" />
        <ListRow {...args} title="Seleccionada" selected />
        <ListRow {...args} title="Con foco" id="fila-foco" />
      </List>
    </div>
  ),
  parameters: { pseudo: { hover: ['#fila-hover'], focusVisible: ['#fila-foco'] } },
};

type Item = { title: string; detail: string; tone: StatusTone; label: string };
const DATA: Record<'hilo' | 'ruta', { name: string; items: Item[] }> = {
  hilo: {
    name: 'Mis clientes',
    items: [
      { title: 'Laura Mora', detail: 'Adjunté la factura de octubre', tone: 'success', label: 'Asignado' },
      { title: 'Café Cordillera', detail: '¿Ya revisaron mi declaración?', tone: 'warning', label: 'Sin responder' },
      { title: 'José Rojas', detail: 'Necesito el estado de cuenta', tone: 'danger', label: 'Vencido' },
    ],
  },
  ruta: {
    name: 'Reservas de hoy',
    items: [
      { title: 'Catamarán Ballena', detail: '8:00 a.m. · 12 personas', tone: 'success', label: 'Confirmada' },
      { title: 'Tour Selva', detail: '1:30 p.m. · 6 personas', tone: 'warning', label: 'Pendiente' },
      { title: 'Kayak Manglar', detail: '3:00 p.m. · 4 personas', tone: 'neutral', label: 'Borrador' },
    ],
  },
};

function InteractiveList({ brand }: { brand: 'hilo' | 'ruta' }) {
  const [active, setActive] = useState(1);
  const d = DATA[brand];
  return (
    <List aria-label={d.name}>
      {d.items.map((it, i) => (
        <ListRow
          key={it.title}
          title={it.title}
          detail={it.detail}
          status={{ tone: it.tone, label: it.label }}
          selected={i === active}
          onClick={() => setActive(i)}
        />
      ))}
    </List>
  );
}

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: {
    themes: 'all',
    layout: 'fullscreen',
    docs: { description: { story: 'Haz clic en una fila para seleccionarla.' } },
  },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes minWidth={380}>{(brand) => <InteractiveList brand={brand} />}</AllThemes>
    </div>
  ),
};

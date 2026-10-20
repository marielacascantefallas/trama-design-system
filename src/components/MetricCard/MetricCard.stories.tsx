import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard';
import { AllThemes } from '../../stories/AllThemes';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 } as const;

const meta = {
  title: 'Componentes/Tarjeta de métrica',
  component: MetricCard,
  args: {
    label: 'Primera respuesta (hoy)',
    value: '18 min',
    note: '4 min mejor que la semana pasada',
    noteTone: 'neutral',
  },
  argTypes: { noteTone: { control: 'inline-radio', options: ['neutral', 'danger', 'success'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Un número con su etiqueta y una nota de contexto. Es una lista de definición (`dl`), así el lector de pantalla lee "etiqueta: valor". La nota en **peligro** se reserva para cuando hay que actuar.',
      },
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Configurable',
  render: (args) => (
    <div style={{ maxWidth: 280 }}>
      <MetricCard {...args} />
    </div>
  ),
};

const Dia = () => (
  <div style={grid}>
    <MetricCard label="Sin responder" value="5" note="2 llevan más de 2 horas" noteTone="danger" />
    <MetricCard label="Sin asignar" value="3" note="Llegaron después de las 9:00" />
    <MetricCard label="Primera respuesta (hoy)" value="18 min" note="4 min mejor que la semana pasada" />
    <MetricCard label="Resueltos hoy" value="27" note="De 41 conversaciones abiertas" />
  </div>
);

export const VistaDelDueno: Story = { name: 'Vista del dueño', render: () => <Dia /> };

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes minWidth={480}>{() => <Dia />}</AllThemes>
    </div>
  ),
};

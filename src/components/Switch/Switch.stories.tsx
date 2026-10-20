import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Switch } from './Switch';
import { AllThemes, stack } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Interruptor',
  component: Switch,
  args: {
    label: 'Urgencias automáticas',
    description: 'Hilo marca el chat como urgente sin pedir confirmación.',
    defaultChecked: true,
    disabled: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Para ajustes que se aplican al instante. Es un botón con `role="switch"` y `aria-checked`; la etiqueta es obligatoria y la descripción se enlaza con `aria-describedby`. Encendido se distingue por relleno y posición de la perilla.',
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Configurable',
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Switch {...args} />
    </div>
  ),
};

const Ajustes = () => (
  <div style={{ ...stack, maxWidth: 420 }}>
    <Switch label="Urgencias automáticas" description="Hilo marca el chat sin pedir confirmación." defaultChecked />
    <Switch label="Avisar a la dueña" description="Solo si nadie responde en 30 minutos." defaultChecked />
    <Switch
      label="Responder automáticamente al cliente"
      description="Desactivado: Hilo nunca escribe al cliente sin revisión."
    />
    <Switch label="Mensaje fuera de horario" description="Requiere plan Equipo." disabled />
  </div>
);

export const Estados: Story = { render: () => <Ajustes /> };

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes minWidth={340}>{() => <Ajustes />}</AllThemes>
    </div>
  ),
};

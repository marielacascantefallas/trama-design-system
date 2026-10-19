import type { Meta, StoryObj } from '@storybook/react';
import { StatusChip } from './StatusChip';
import { AllThemes, row } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Chip de estado',
  component: StatusChip,
  args: { tone: 'success', children: 'Confirmada' },
  argTypes: { tone: { control: 'inline-radio', options: ['success', 'warning', 'danger', 'neutral'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Muestra el estado de un chat o una reserva. **Siempre lleva texto**: el color nunca es la única señal.',
      },
    },
  },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: 'Configurable' };

export const Tipos: Story = {
  render: () => (
    <div style={row}>
      <StatusChip tone="success">Confirmada</StatusChip>
      <StatusChip tone="warning">Pendiente</StatusChip>
      <StatusChip tone="danger">Cancelada</StatusChip>
      <StatusChip tone="neutral">Borrador</StatusChip>
    </div>
  ),
};

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes>
        {() => (
          <div style={row}>
            <StatusChip tone="success">Confirmada</StatusChip>
            <StatusChip tone="warning">Pendiente</StatusChip>
            <StatusChip tone="danger">Cancelada</StatusChip>
            <StatusChip tone="neutral">Borrador</StatusChip>
          </div>
        )}
      </AllThemes>
    </div>
  ),
};

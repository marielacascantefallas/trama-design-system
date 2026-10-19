import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { AllThemes, row } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Avatar',
  component: Avatar,
  args: { name: 'Laura Mora', size: 'm', decorative: false },
  argTypes: { size: { control: 'inline-radio', options: ['s', 'm'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Calcula las iniciales a partir del nombre. Es **decorativo por defecto** (`aria-hidden`) porque casi siempre va junto al nombre; usa `decorative={false}` cuando aparece solo.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: 'Configurable' };

export const Tamaños: Story = {
  render: (args) => (
    <div style={row}>
      <Avatar {...args} size="s" />
      <Avatar {...args} size="m" />
    </div>
  ),
};

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes>
        {(brand) => (
          <div style={row}>
            {(brand === 'hilo'
              ? ['Laura Mora', 'Café Cordillera', 'José Rojas']
              : ['Catamarán Ballena', 'Tour Selva', 'Kayak Manglar']
            ).map((n) => (
              <Avatar key={n} name={n} decorative={false} />
            ))}
          </div>
        )}
      </AllThemes>
    </div>
  ),
};

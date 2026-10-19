import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';
import { AllThemes, row, stack } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Botón',
  component: Button,
  args: { children: 'Asignar', variant: 'primary', size: 'm', disabled: false, onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Usa **primario** para la acción principal (uno por vista), **secundario** para acciones alternativas y **fantasma** para acciones de bajo peso. Tamaños: **S** (32 px) en filas y tablas, **M** (40 px) por defecto, **L** (48 px) en móvil o pantallas con una sola acción.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: 'Configurable' };

export const Variantes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primario
      </Button>
      <Button {...args} variant="secondary">
        Secundario
      </Button>
      <Button {...args} variant="ghost">
        Fantasma
      </Button>
    </div>
  ),
};

export const Tamaños: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="s">
        Tamaño S
      </Button>
      <Button {...args} size="m">
        Tamaño M
      </Button>
      <Button {...args} size="l">
        Tamaño L
      </Button>
    </div>
  ),
};

const estados = (args: Story['args']) => (
  <div style={stack}>
    {(['primary', 'secondary', 'ghost'] as const).map((v) => (
      <div key={v} style={row}>
        <Button {...args} variant={v}>
          Normal
        </Button>
        <Button {...args} variant={v} id={`hover-${v}`}>
          Hover
        </Button>
        <Button {...args} variant={v} id={`focus-${v}`}>
          Con foco
        </Button>
        <Button {...args} variant={v} disabled>
          Deshabilitado
        </Button>
      </div>
    ))}
  </div>
);

export const Estados: Story = {
  render: estados,
  parameters: {
    pseudo: {
      hover: ['#hover-primary', '#hover-secondary', '#hover-ghost'],
      focusVisible: ['#focus-primary', '#focus-secondary', '#focus-ghost'],
    },
    docs: {
      description: {
        story:
          'Hover y foco se simulan aquí para documentarlos; en uso real vienen del navegador. Prueba la tecla Tab.',
      },
    },
  },
};

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: (args) => (
    <div style={{ padding: 16 }}>
      <AllThemes>
        {(brand) => (
          <div style={row}>
            <Button {...args} variant="primary">
              {brand === 'hilo' ? 'Asignar' : 'Nueva reserva'}
            </Button>
            <Button {...args} variant="secondary">
              Cancelar
            </Button>
            <Button {...args} variant="ghost">
              Ver detalle
            </Button>
          </div>
        )}
      </AllThemes>
    </div>
  ),
};

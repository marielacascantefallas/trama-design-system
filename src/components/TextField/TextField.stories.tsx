import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';
import { Button } from '../Button/Button';
import { AllThemes, stack } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Campo de texto',
  component: TextField,
  args: {
    label: 'Nombre del cliente',
    placeholder: 'Laura Mora',
    hint: 'Escribe el nombre como aparece en la factura.',
    size: 'm',
    disabled: false,
  },
  argTypes: { size: { control: 'inline-radio', options: ['s', 'm', 'l'] } },
  decorators: [
    (Story, ctx) =>
      ctx.parameters.themes === 'all' ? (
        <Story />
      ) : (
        <div style={{ maxWidth: 360 }}>
          <Story />
        </div>
      ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'La **etiqueta** siempre es visible. El **error** se comunica con borde de 2 px, un mensaje que empieza con "Error:" y `aria-invalid`; el mensaje se anuncia con `aria-describedby`.',
      },
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: 'Configurable' };

export const Estados: Story = {
  render: (args) => (
    <div style={stack}>
      <TextField {...args} label="Normal" />
      <TextField {...args} label="Con foco" id="campo-foco" />
      <TextField {...args} label="Con error" error="este campo es obligatorio." />
      <TextField {...args} label="Deshabilitado" disabled hint="No puedes editar este campo." />
    </div>
  ),
  parameters: { pseudo: { focusVisible: ['#campo-foco'] } },
};

export const Tamaños: Story = {
  render: (args) => (
    <div style={stack}>
      <TextField {...args} size="s" label="Tamaño S" />
      <TextField {...args} size="m" label="Tamaño M" />
      <TextField {...args} size="l" label="Tamaño L" />
    </div>
  ),
};

export const ConBotón: Story = {
  name: 'Alineado con el botón',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <TextField {...args} label="Buscar cliente" hint={undefined} />
      </div>
      <Button size={args.size}>Buscar</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Campo y botón del mismo tamaño quedan a la misma altura.',
      },
    },
  },
};

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes>
        {(brand) =>
          brand === 'hilo' ? (
            <div style={stack}>
              <TextField
                label="Nombre del cliente"
                placeholder="Laura Mora"
                hint="Escribe el nombre como aparece en la factura."
              />
              <TextField label="Correo" placeholder="laura@correo.com" error="escribe un correo válido." />
            </div>
          ) : (
            <div style={stack}>
              <TextField label="Tour" placeholder="Catamarán Ballena" hint="Elige el tour de la reserva." />
              <TextField label="Fecha" placeholder="24 de octubre" error="elige una fecha con cupo disponible." />
            </div>
          )
        }
      </AllThemes>
    </div>
  ),
};

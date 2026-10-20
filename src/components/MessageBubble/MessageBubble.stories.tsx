import type { Meta, StoryObj } from '@storybook/react';
import { MessageBubble } from './MessageBubble';
import { AllThemes } from '../../stories/AllThemes';

const thread = { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 } as const;

const meta = {
  title: 'Componentes/Burbuja de mensaje',
  component: MessageBubble,
  args: { side: 'incoming', time: '9:38 a.m.', children: '¿Me confirman, por favor? Tengo que pagar antes de las 3.' },
  argTypes: { side: { control: 'inline-radio', options: ['incoming', 'outgoing'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Un mensaje del hilo de WhatsApp. **Entrante** (cliente) a la izquierda con borde; **saliente** (equipo) a la derecha con fondo de marca y el nombre de quien respondió. Cada burbuja anuncia su lado a los lectores de pantalla.',
      },
    },
  },
} satisfies Meta<typeof MessageBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Configurable',
  render: (args) => (
    <div style={thread}>
      <MessageBubble {...args} />
    </div>
  ),
};

const Hilo = () => (
  <div style={thread}>
    <MessageBubble side="outgoing" time="4:12 p.m." author="Ana">
      Hola Andrés, ya tenemos las facturas de septiembre. Solo nos falta el reporte de ventas con tarjeta para cerrar la
      D-104.
    </MessageBubble>
    <MessageBubble time="5:03 p.m.">Listo, se lo acabo de enviar al correo.</MessageBubble>
    <MessageBubble time="7:50 a.m.">
      Buenos días, Ana. ¿Ya presentaron la declaración de IVA de septiembre?
    </MessageBubble>
  </div>
);

export const Conversacion: Story = { name: 'Conversación', render: () => <Hilo /> };

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes minWidth={360}>{() => <Hilo />}</AllThemes>
    </div>
  ),
};

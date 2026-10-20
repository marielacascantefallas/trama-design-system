import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { AICard } from './AICard';
import { Button } from '../Button/Button';
import { AllThemes, stack } from '../../stories/AllThemes';

const meta = {
  title: 'Componentes/Tarjeta IA',
  component: AICard,
  args: {
    title: 'Resumen de la conversación',
    meta: 'Actualizado 9:41',
    children:
      'Pide la declaración de IVA (D-104) de septiembre y pregunta si ya se presentó. Escribió 3 veces desde las 7:50 a.m. Vence hoy.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Todo lo que genera la IA vive aquí. Se identifica con una **insignia de texto "IA"**, sin destellos ni degradados, y su nombre accesible empieza con "Generado por IA". Regla de producto: la IA **sugiere** y una persona **confirma**; la única acción automática es marcar urgencias.',
      },
    },
  },
} satisfies Meta<typeof AICard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Configurable',
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <AICard {...args} />
    </div>
  ),
};

export const ConAcciones: Story = {
  name: 'Con acciones',
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <AICard
        {...args}
        actions={
          <>
            <Button variant="secondary" size="s" onClick={fn()}>
              Es correcto
            </Button>
            <Button variant="ghost" size="s" onClick={fn()}>
              Corregir
            </Button>
          </>
        }
      />
    </div>
  ),
};

export const ReporteDelDia: Story = {
  name: 'Reporte del día (dueño)',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <AICard
        title="Reporte del día"
        meta="Borrador 9:41"
        actions={
          <>
            <Button size="s">Enviar al equipo</Button>
            <Button variant="ghost" size="s">
              Editar
            </Button>
          </>
        }
      >
        Mañana tranquila salvo Ana: tiene 14 chats y 3 sin responder, dos de más de 2 horas. Luis tiene espacio para 4
        más.
      </AICard>
    </div>
  ),
};

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: (args) => (
    <div style={{ padding: 16 }}>
      <AllThemes minWidth={320}>
        {() => (
          <div style={stack}>
            <AICard
              {...args}
              actions={
                <Button variant="secondary" size="s">
                  Es correcto
                </Button>
              }
            />
          </div>
        )}
      </AllThemes>
    </div>
  ),
};

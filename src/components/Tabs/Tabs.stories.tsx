import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Tabs, TabPanel, type TabItem } from './Tabs';
import { AllThemes } from '../../stories/AllThemes';

const BANDEJA: TabItem[] = [
  { id: 'mios', label: 'Mis clientes', count: 12 },
  { id: 'sin-asignar', label: 'Sin asignar', count: 3 },
  { id: 'pendientes', label: 'Pendientes', count: 5 },
];

const meta = {
  title: 'Componentes/Pestañas',
  component: Tabs,
  args: { 'aria-label': 'Filtrar bandeja', items: BANDEJA, value: 'mios', onChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Pestañas con el patrón WAI-ARIA: **Tab** entra a la pestaña activa, las **flechas izquierda y derecha** se mueven, **Inicio/Fin** van a los extremos. La activa se marca con barra inferior y peso, no solo con color. Usa `TabPanel` con el mismo `idPrefix` para enlazar cada panel.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: 'Configurable',
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <div style={{ maxWidth: 400 }}>
        <Tabs
          {...args}
          value={value}
          onChange={(v) => {
            setValue(v);
            args.onChange(v);
          }}
        />
      </div>
    );
  },
};

export const ConPaneles: Story = {
  name: 'Con paneles',
  render: () => {
    const [value, setValue] = useState('mios');
    return (
      <div style={{ maxWidth: 400 }}>
        <Tabs aria-label="Filtrar bandeja" idPrefix="bandeja" items={BANDEJA} value={value} onChange={setValue} />
        {BANDEJA.map((t) => (
          <TabPanel key={t.id} idPrefix="bandeja" tab={t.id} value={value} style={{ padding: '16px 0' }}>
            {t.count} chats en «{t.label}».
          </TabPanel>
        ))}
      </div>
    );
  },
};

export const CuatroTemas: Story = {
  name: 'En los 4 temas',
  parameters: { themes: 'all', layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes minWidth={360}>
        {(brand) =>
          brand === 'hilo' ? (
            <Tabs aria-label="Filtrar bandeja" items={BANDEJA} value="sin-asignar" onChange={() => {}} />
          ) : (
            <Tabs
              aria-label="Filtrar reservas"
              items={[
                { id: 'hoy', label: 'Hoy', count: 8 },
                { id: 'manana', label: 'Mañana', count: 14 },
                { id: 'semana', label: 'Esta semana' },
              ]}
              value="hoy"
              onChange={() => {}}
            />
          )
        }
      </AllThemes>
    </div>
  ),
};

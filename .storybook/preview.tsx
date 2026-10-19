import type { Preview } from '@storybook/react';
import { TramaTheme, type Brand, type Mode } from '../src/components/TramaTheme/TramaTheme';
import '../src/styles/tokens/trama.css';

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Marca',
      toolbar: {
        title: 'Marca',
        icon: 'paintbrush',
        items: [
          { value: 'hilo', title: 'Hilo · inbox' },
          { value: 'ruta', title: 'Ruta · reservas' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Modo',
      toolbar: {
        title: 'Modo',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Oscuro', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { brand: 'hilo', mode: 'light' },
  decorators: [
    (Story, context) => {
      if (context.parameters.themes === 'all') return <Story />;
      return (
        <TramaTheme
          brand={context.globals.brand as Brand}
          mode={context.globals.mode as Mode}
          surface
          style={{ padding: 24, borderRadius: 12 }}
        >
          <Story />
        </TramaTheme>
      );
    },
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Trama', ['Introducción', 'Tokens'], 'Componentes', 'Patrones'] },
    },
  },
  tags: ['autodocs'],
};

export default preview;

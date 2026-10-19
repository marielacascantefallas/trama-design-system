import type { Meta, StoryObj } from '@storybook/react';
import { AllThemes } from './AllThemes';

const GROUPS: { title: string; tokens: string[] }[] = [
  { title: 'Fondos', tokens: ['bg-canvas', 'bg-surface', 'bg-subtle', 'bg-disabled'] },
  { title: 'Texto', tokens: ['text-primary', 'text-secondary', 'text-brand', 'text-placeholder', 'text-disabled'] },
  {
    title: 'Acción',
    tokens: ['action-primary', 'action-primary-hover', 'action-on-primary', 'action-subtle', 'action-on-subtle'],
  },
  { title: 'Bordes y foco', tokens: ['border-default', 'border-control', 'focus-ring'] },
  {
    title: 'Estado',
    tokens: [
      'status-success',
      'status-success-bg',
      'status-warning',
      'status-warning-bg',
      'status-danger',
      'status-danger-bg',
    ],
  },
];

function Swatches() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>{g.title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.tokens.map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    width: 28,
                    height: 28,
                    flex: 'none',
                    borderRadius: 6,
                    background: `var(--color-${t})`,
                    border: '1px solid var(--color-border-default)',
                  }}
                />
                <code style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>--color-{t}</code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: 'Trama/Tokens',
  parameters: {
    themes: 'all',
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Tokens semánticos de color. El mismo nombre resuelve a un valor distinto en cada tema.',
      },
    },
  },
} satisfies Meta;

export default meta;

export const Color: StoryObj = {
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes>{() => <Swatches />}</AllThemes>
    </div>
  ),
};

export const TamañosYRadios: StoryObj = {
  name: 'Tamaños y radios',
  render: () => (
    <div style={{ padding: 16 }}>
      <AllThemes>
        {() => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  aria-hidden
                  style={{
                    width: 96,
                    height: `var(--size-control-${s})`,
                    borderRadius: 'var(--radius-control)',
                    background: 'var(--color-action-subtle)',
                    border: '1px solid var(--color-border-control)',
                  }}
                />
                <code style={{ fontSize: 12 }}>--size-control-{s}</code>
              </div>
            ))}
            <code style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              radio: var(--radius-control) / var(--radius-card)
            </code>
          </div>
        )}
      </AllThemes>
    </div>
  ),
};

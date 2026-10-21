# Trama

Design system multimarca para dos productos B2B:

- **Hilo**: inbox compartido de WhatsApp para equipos pequeños de servicio.
- **Ruta**: panel de reservas para operadores de tours en Costa Rica.

Una sola base de tokens y componentes; cada producto es un tema (marca × modo claro/oscuro).

## Flujo

```
Figma (variables con modos)  ⇄  tokens/trama-tokens.json  (formato DTCG / Tokens Studio)
                                         │  npm run tokens  (Style Dictionary 4)
                                         ▼
                         src/styles/tokens/*.css  +  tokens.ts
                                         │
                                         ▼
                         Componentes React  →  Storybook
```

## Comandos

```bash
npm install
npm run storybook        # desarrollo en http://localhost:6006
npm run build-storybook  # compila el sitio estático
npm run tokens           # regenera las variables CSS desde el JSON
npm run typecheck
```

Cada push a `main` publica Storybook en GitHub Pages (`.github/workflows/storybook.yml`).

## Prototipo de Hilo

`apps/hilo` es un prototipo navegable de Hilo construido solo con los componentes de Trama: bandeja y conversación, vista del cliente, asignación con sugerencia de IA, vista del dueño, ajustes y versión móvil.

```bash
npm run dev-hilo     # desarrollo
npm run build-hilo   # se publica en storybook-static/hilo
```

En línea: https://marielacascantefallas.github.io/trama-design-system/hilo/

## Prototipo de Ruta

`apps/ruta` es el panel de reservas para operadores de tours en bote, con el tema Ruta: salidas de hoy, detalle y check-in móvil, nueva reserva leída por IA, reprogramar por clima, calendario y pagos SINPE.

```bash
npm run dev-ruta
npm run build-ruta   # se publica en storybook-static/ruta
```

En línea: https://marielacascantefallas.github.io/trama-design-system/ruta/

## Laboratorio: Generador de temas

`apps/lab-temas` tiene dos pestañas:

- **Crear desde un color.** Abre el color en diez pasos con la curva de luz de Añil y Atardecer (OKLCH), lo asigna a los tokens semánticos y prueba las mismas 17 parejas que revisa `scripts/generate-tokens.py`. La vista previa usa los componentes reales de Trama. Exporta CSS y tokens DTCG.
- **Revisar mi tema.** Lee un `.css` con variables o un `.json` de tokens (DTCG o Tokens Studio, con `$themes`), adivina el rol de cada color, revisa el contraste y propone arreglos: primero un paso que ya exista en la escala de la marca, si no, mueve solo la luz. Descarga el archivo corregido con los mismos nombres.

Todo corre en el navegador. Su sistema visual está en `apps/lab-temas/DESIGN.md`.

```bash
npm run dev-lab
npm run build-lab   # se publica en storybook-static/lab/temas
```

En línea: https://marielacascantefallas.github.io/trama-design-system/lab/temas/

## Laboratorio: Deshacer o confirmar

`apps/lab-deshacer` compara la misma acción de Hilo (marcar una conversación como resuelta) con un diálogo de confirmación y con un aviso de 5 segundos para deshacer, también con Ctrl + Z. Cuenta los clics, el tiempo y los errores corregidos de quien lo usa, sin guardarlos. Cierra con el caso contrario: cancelar una reserva de Ruta con depósito, donde sí va un diálogo que nombra la consecuencia.

Accesibilidad: el diálogo atrapa el foco y lo devuelve; al quitar una fila, el foco pasa a la siguiente; el aviso se anuncia con `role="status"` sin robar el foco; con movimiento reducido no hay animaciones.

```bash
npm run dev-lab-deshacer
npm run build-lab   # construye los dos experimentos en storybook-static/lab
```

En línea: https://marielacascantefallas.github.io/trama-design-system/lab/deshacer/

## Tokens en capas

| Capa | Archivo | Selector |
|---|---|---|
| Primitivos | `primitives.css` | `:root` |
| Marca Hilo (por defecto) | `brand-hilo.css` | `:root, [data-brand="hilo"]` |
| Marca Ruta | `brand-ruta.css` | `[data-brand="ruta"]` |
| Semánticos claro | `semantic-light.css` | `:root, [data-mode="light"]` |
| Semánticos oscuro | `semantic-dark.css` | `[data-mode="dark"]` |

Los semánticos apuntan a `var(--brand-*)`, así que la marca y el modo deben ir en el mismo elemento. `TramaTheme` lo hace por ti:

```tsx
<TramaTheme brand="ruta" mode="dark">
  <Button variant="primary">Nueva reserva</Button>
</TramaTheme>
```

## Componentes

| Componente | Props principales |
|---|---|
| `Button` | `variant` primary/secondary/ghost · `size` s/m/l · `disabled` |
| `TextField` | `label` (obligatoria) · `hint` · `error` · `size` s/m/l · `disabled` |
| `StatusChip` | `tone` success/warning/danger/neutral |
| `Avatar` | `name` · `size` s/m · `decorative` |
| `List` + `ListRow` | `title` · `detail` · `status` · `selected` · `leading` |
| `AICard` | `title` · `meta` · `actions` · insignia de texto "IA" |
| `MessageBubble` | `side` incoming/outgoing · `time` · `author` |
| `Tabs` + `TabPanel` | `items` (`label`, `count`) · `value` · `onChange` · flechas, Inicio y Fin |
| `MetricCard` | `label` · `value` · `note` · `noteTone` neutral/danger/success |
| `Switch` | `label` (obligatoria) · `description` · `checked` · `onChange` · `disabled` |

## Accesibilidad (WCAG 2.2 AA)

- Contraste verificado en los 4 temas: texto ≥ 4.5:1, bordes de controles y foco ≥ 3:1.
- Foco visible con anillo separado 2 px; área mínima de 24 px; tamaños S/M/L de 32/40/48 px.
- El color nunca es la única señal: errores con texto, chips con etiqueta, fila seleccionada con barra lateral y `aria-current`.
- Animaciones desactivadas con `prefers-reduced-motion`.
- Pruebas automáticas con axe en el panel Accessibility de Storybook.

## Archivos

- `tokens/trama-tokens.json`: fuente de verdad de los tokens.
- `scripts/generate-tokens.py`: genera el JSON y valida el contraste de los 4 temas.
- `scripts/build-tokens.mjs`: Style Dictionary, genera las variables CSS.

---

Diseño y construcción: Mariella Cascante.

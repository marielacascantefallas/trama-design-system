# Trama: decisiones visuales

Reglas que siguen Trama, Hilo, Ruta y el Laboratorio. Vienen de la skill «Diseño sin AI slop» de Mariella.

## Tipografía

Instrument Sans (variable, 400 a 700), servida desde `@fontsource-variable/instrument-sans` sin Google Fonts. Reemplazó a Inter el 21 de octubre de 2026. El token es `fontFamily.sans`.

## Íconos

Phosphor, peso regular, una sola familia (`apps/shared/icons.tsx`). Lucide quedó fuera. Antes de poner un ícono se pregunta si el texto ya dice lo mismo: en «Por resolver» de Ruta y en «Embarcaciones» se quitaron.

## Datos

Las cifras del día van en una franja con divisores, no en tarjetas sueltas. Las listas de cosas iguales (embarcaciones, salidas) son filas.

## Texto

Sin puntos medios para unir datos (se usa coma), sin rayas largas y sin flechas en botones ni en el copy.

## Contraste

WCAG 2.2 AA en las cuatro combinaciones de marca y modo, revisado en cada build por `scripts/generate-tokens.py`.

# Generador de temas: sistema visual

Dirección elegida por Mariella: **carta de lectura** (como la carta del oculista). El contraste es una pregunta de lectura, así que cada pareja de colores se escribe con sus propios colores y las líneas se achican de la que mejor se lee a la que más cuesta.

## Lectura del diseño

- Herramienta de laboratorio para diseñadoras y equipos de sistemas de diseño.
- Tarea: saber si un color de marca se puede leer en toda la interfaz y cómo arreglarlo.
- Densidad 6, movimiento 2, fidelidad a la marca del usuario 9 (su color nunca se cambia de tono).

## Color

| Nombre | Hex | Rol |
| --- | --- | --- |
| Tinta | #14213D | Texto, bordes fuertes, botón principal, foco |
| Tinta suave | #4A5568 | Texto secundario |
| Filete | #C9D1DC | Divisores de la carta |
| Pozo | #F4F6F9 | Barra de herramientas y zona de subir archivo |
| Papel | #FFFFFF | Fondo |
| Cumple / no cumple | #1B6E3A / #B3261E | Solo para el resultado del contraste, siempre con la cifra al lado |

El laboratorio no tiene color de acento propio: el único color es el de la marca que se prueba.

## Tipografía

Atkinson Hyperlegible, 400 y 700, diseñada por el Braille Institute para lectura difícil. Escala 14, 17, 20, 28 y 34. La carta va de 28 a 14 px.

## Forma y movimiento

Radio 8 en controles, 12 en las placas de vista previa, 6 en las muestras. Sin sombras. Movimiento solo al presionar botones (scale 0.97, 120 ms) y en el interruptor (160 ms, ease-out). Con movimiento reducido no hay transiciones.

## Prohibido aquí

Lucide, emojis, rayas largas, tarjetas de métricas en fila, flechas en botones, hovers que mueven cosas. La vista previa usa componentes reales de Trama, no imágenes.

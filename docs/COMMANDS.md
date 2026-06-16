# Guía de Comandos - HANDi EPN V3

Este simulador implementa el 100% de la especificación de comandos descrita en el manual técnico oficial (Tablas 5, 6, 7 y 8).

---

## 1. Movimientos Individuales (Tabla 5)

Permiten posicionar motores específicos. El simulador realiza una interpolación lineal para mapear el valor entero al ángulo de flexión real en 3D.

| Letra | Motor / Dedo | Rango de Entrada | Ángulo Resultante |
| :---: | :--- | :---: | :---: |
| **A** | Meñique | `0` a `600` | `0°` a `90°` |
| **B** | Anular | `0` a `550` | `0°` a `85°` |
| **C** | Medio | `0` a `600` | `0°` a `95°` |
| **D** | Índice | `0` a `550` | `0°` a `90°` |
| **E** | Pulgar Inferior (Rotación) | `0` a `130` | `0°` a `45°` |
| **F** | Pulgar Superior (Flexión) | `0` a `400` | `0°` a `90°` |

### Ecuación de Mapeo Lineal:
$$\text{Ángulo} = \text{AngMin} + \left( \frac{\text{Valor} - \text{Min}}{\text{Max} - \text{Min}} \right) \times (\text{AngMax} - \text{AngMin})$$

---

## 2. Movimientos Compuestos / Gestos (Tabla 6)

Comandos de una sola letra que ejecutan poses completas cargando configuraciones predefinidas de ángulos:

| Letra | Nombre del Gesto | Ángulos en Grados (A, B, C, D, E, F) |
| :---: | :--- | :--- |
| **O** | Abrir Mano | `0°, 0°, 0°, 0°, 0°, 0°` |
| **C** | Cerrar Mano | `90°, 85°, 95°, 90°, 45°, 90°` |
| **P** | Pinza (Pulgar + Medio) | `0°, 0°, 0°, 70°, 0°, 80°` |
| **R** | Spiderman | `80°, 85°, 95°, 0°, 0°, 0°` |
| **W** | Garra Parcial | `0°, 80°, 0°, 80°, 0°, 0°` |
| **Y** | OK | `0°, 0°, 0°, 30°, 0°, 50°` |
| **L** | Pulgar Arriba | `0°, 0°, 0°, 0°, 30°, 0°` |
| **M** | Llámame | `90°, 0°, 0°, 0°, 20°, 0°` |
| **H** | Número Tres | `0°, 70°, 70°, 70°, 0°, 0°` |
| **U** | Número Cuatro | `0°, 0°, 0°, 0°, 45°, 0°` |
| **G** | Apuntar | `0°, 0°, 0°, 80°, 10°, 0°` |

---

## 3. Comandos Múltiples

Puedes encadenar múltiples comandos de dedos separados por comas para mover varios dedos simultáneamente:
- **Ejemplo**: `A300,B250,C400`
- **Ejemplo**: `D450,E50,F120`

---

## 4. Comandos Especiales (Tabla 7)

- **S** (Stop): Detiene los motores en seco en su posición actual.
- **X** (Calibrar): Calibra y fija los codificadores de posición a la postura actual.
- **I** (Inicializar): Resetea de forma instantánea todos los motores de vuelta a su posición de reposo inicial (`0°`).

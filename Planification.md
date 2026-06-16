```markdown
# Plan de Implementación: Simulador 3D Mano Robótica HANDi EPN V3

**Versión:** 5.0 (Definitiva - Comandos Completos del Manual)  
**Fecha:** 16 de junio de 2026  
**Tipo:** Plan Técnico para Agente de Código  
**Prioridad:** ALTA - Implementación completa de todos los comandos del manual

---

## 🎯 OBJETIVO PRINCIPAL

Desarrollar un simulador web 3D de la mano robótica HANDi EPN V3 que permita al usuario escribir comandos (según el manual) en un campo de texto y, al presionar "Enviar", ejecutar el movimiento correspondiente en el modelo 3D.

**Requisito crítico:** Implementar **TODOS** los comandos documentados en el Manual Handi_EPN_V3_ES.pdf (Tablas 5, 6, 7, 8).

---

## 📋 COMANDOS A IMPLEMENTAR (100% DEL MANUAL)

### 1. Movimientos Individuales (Tabla 5 - Página 23)

| Comando | Rango Mínimo | Rango Máximo | Dedo | Ángulo Mínimo | Ángulo Máximo |
|---------|--------------|--------------|------|---------------|---------------|
| `A[pos]` | 0 | 600 | Meñique | 0° | 90° |
| `B[pos]` | 0 | 550 | Anular | 0° | 85° |
| `C[pos]` | 0 | 600 | Medio | 0° | 95° |
| `D[pos]` | 0 | 550 | Índice | 0° | 90° |
| `E[pos]` | 0 | 130 | Pulgar Inferior | 0° | 45° |
| `F[pos]` | 0 | 400 | Pulgar Superior | 0° | 90° |

**Ejemplos del manual (Tabla 8):**
- `A112` - Mueve meñique a posición 112
- `B320` - Mueve anular a posición 320
- `C397` - Mueve medio a posición 397
- `D350` - Mueve índice a posición 350
- `E30` - Mueve pulgar inferior a 30
- `F48` - Mueve pulgar superior a 48

---

### 2. Movimientos Compuestos (Tabla 6 - Página 23)

| Comando | Descripción | Comportamiento en 3D |
|---------|-------------|---------------------|
| `O` | Abre todos los dedos de la mano | Todos los dedos extendidos (0°) |
| `C` | Cierra todos los dedos de la mano | Todos los dedos flexionados al máximo |
| `P` | Gesto de pinza | Dedo medio y pulgar flexionados |
| `R` | Gesto de Spiderman | Dedo medio, anular y meñique flexionados |
| `W` | Garra parcial | Dedo índice y anular cerrados |
| `Y` | Gesto de OK | Pulgar e índice formando círculo |
| `L` | Gesto de pulgar arriba | Solo pulgar hacia arriba |
| `M` | Gesto de llámame | Meñique y pulgar en posición de llamada |
| `H` | Gesto de número tres | Índice, medio y anular levantados |
| `U` | Gesto de número cuatro | Pulgar cerrado, resto abiertos |
| `G` | Gesto de apuntar | Índice extendido, pulgar abierto |

**Mapeo de ángulos para cada gesto:**

| Comando | A (Meñique) | B (Anular) | C (Medio) | D (Índice) | E (Pulgar Inf) | F (Pulgar Sup) |
|---------|-------------|------------|-----------|------------|----------------|----------------|
| `O` | 0° | 0° | 0° | 0° | 0° | 0° |
| `C` | 90° | 85° | 95° | 90° | 45° | 90° |
| `P` | 0° | 0° | 0° | 70° | 0° | 80° |
| `R` | 80° | 85° | 95° | 0° | 0° | 0° |
| `W` | 0° | 80° | 0° | 80° | 0° | 0° |
| `Y` | 0° | 0° | 0° | 30° | 0° | 50° |
| `L` | 0° | 0° | 0° | 0° | 30° | 0° |
| `M` | 90° | 0° | 0° | 0° | 20° | 0° |
| `H` | 0° | 70° | 70° | 70° | 0° | 0° |
| `U` | 0° | 0° | 0° | 0° | 45° | 0° |
| `G` | 0° | 0° | 0° | 80° | 10° | 0° |

---

### 3. Comandos Especiales (Tabla 7 - Página 24)

| Comando | Descripción | Efecto |
|---------|-------------|--------|
| `S` | Detener los motores | Interrumpe la animación actual |
| `X` | Calibración | Guarda la pose actual como referencia |
| `I` | Inicializar Motor Shields | Resetea todos los ángulos a 0° |

---

### 4. Comandos Múltiples

| Formato | Ejemplo | Comportamiento |
|---------|---------|----------------|
| `[comando1],[comando2],...` | `A300,B250,C400` | Mueve varios dedos simultáneamente |
| `[comando1],[comando2],...` | `D350,E50,F48` | Índice y pulgar en un solo envío |

**Reglas para comandos múltiples:**
- Separados por coma (`,`)
- Sin espacios (opcional pero recomendado)
- Se procesan en orden de izquierda a derecha
- Actualización simultánea de todos los dedos

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐│
│  │ Campo    │  │ Botón    │  │ Visor 3D (Three.js)          ││
│  │ Texto    │→│ Enviar   │  │ - Modelo GLB/GLTF            ││
│  └──────────┘  └──────────┘  │ - Jerarquía de huesos       ││
│       ↓                       │ - Control de cámara (Orbit) ││
│   fetch()                     │ - Luces y sombras           ││
│   (POST)                      │ - Animación suave (lerp)    ││
└─────────────────────────────────────────────────────────────────┘
                                ↓ HTTP:3000
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR NODE.JS                          │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ POST /command                                             ││
│  │  - InterceptCommand(text) → { ... }                      ││
│  │  - Parsear comando (regex)                               ││
│  │  - Calcular ángulos (mapeo lineal)                      ││
│  │  - Aplicar poses predefinidas (switch/case)             ││
│  │  - Validar rangos (0-600, 0-550, etc.)                  ││
│  │  - Manejar errores (comando inválido, fuera de rango)   ││
│  │  - Devolver JSON: { success, angles, type, ... }        ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
handi-simulator/
├── server.js                      # Servidor Express
├── package.json                   # Dependencias
├── public/
│   ├── index.html                # Página principal
│   ├── style.css                 # Estilos UI
│   ├── script.js                 # Lógica frontend (Three.js + comandos)
│   └── models/
│       └── hand.glb              # Modelo 3D de la mano
├── docs/
│   ├── README.md                 # Instalación y uso
│   ├── COMMANDS.md               # Lista completa de comandos
│   └── TESTING.md                # Guía de pruebas
└── tests/
    ├── test-parser.js            # Pruebas unitarias de parsing
    └── test-commands.js          # Pruebas de todos los comandos
```

---

## 🔧 ESPECIFICACIONES TÉCNICAS DETALLADAS

### Backend (server.js)

#### Dependencias requeridas:
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

#### Endpoints:

**POST /command**
- Body: `{ "command": "string" }`
- Response: 
  ```json
  {
    "success": true,
    "type": "individual|multiple|preset|special",
    "data": {
      "angles": { "A": 45, "B": 38, "C": 50, ... },
      "description": "string",
      "command": "string"
    }
  }
  ```
- Error Response:
  ```json
  {
    "success": false,
    "error": "Mensaje de error descriptivo"
  }
  ```

#### Funciones principales:

```javascript
function interceptCommand(text) {
    // 1. Limpiar y validar entrada
    text = text.toUpperCase().trim();
    
    // 2. Verificar comandos especiales (S, X, I)
    if (['S', 'X', 'I'].includes(text)) {
        return { type: 'special', action: text };
    }
    
    // 3. Verificar comandos compuestos (Tabla 6)
    const presets = ['O', 'C', 'P', 'R', 'W', 'Y', 'L', 'M', 'H', 'U', 'G'];
    if (presets.includes(text)) {
        return { type: 'preset', preset: text };
    }
    
    // 4. Verificar comandos múltiples (separados por coma)
    if (text.includes(',')) {
        return parseMultipleCommands(text);
    }
    
    // 5. Verificar comando individual
    return parseIndividualCommand(text);
}

function parseIndividualCommand(cmd) {
    const match = cmd.match(/^([A-F])(\d+)$/);
    if (!match) throw new Error('Formato inválido. Use: Letra + Número');
    
    const letter = match[1];
    const value = parseInt(match[2]);
    
    const config = {
        'A': { min: 0, max: 600, angleMin: 0, angleMax: 90 },
        'B': { min: 0, max: 550, angleMin: 0, angleMax: 85 },
        'C': { min: 0, max: 600, angleMin: 0, angleMax: 95 },
        'D': { min: 0, max: 550, angleMin: 0, angleMax: 90 },
        'E': { min: 0, max: 130, angleMin: 0, angleMax: 45 },
        'F': { min: 0, max: 400, angleMin: 0, angleMax: 90 }
    };
    
    const conf = config[letter];
    if (!conf) throw new Error('Comando no reconocido');
    if (value < conf.min || value > conf.max) {
        throw new Error(`Rango fuera de límites (${letter}: ${conf.min}-${conf.max})`);
    }
    
    const angle = mapRange(value, conf.min, conf.max, conf.angleMin, conf.angleMax);
    return { type: 'individual', finger: letter, angle };
}
```

---

### Frontend (script.js)

#### Configuración Three.js:
```javascript
// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Cámara
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

// Luces
const ambientLight = new THREE.AmbientLight(0x404040);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
```

#### Carga del modelo:
```javascript
const loader = new THREE.GLTFLoader();
loader.load('models/hand.glb', (gltf) => {
    handModel = gltf.scene;
    setupBones(handModel);
    scene.add(handModel);
});

function setupBones(model) {
    // Buscar y configurar cada hueso por nombre
    // D1_Thumb, D1_P, D1_D
    // D2_Index, D2_P, D2_I, D2_D
    // D3_Middle, D3_P, D3_I, D3_D
    // D4_Ring, D4_P, D4_I, D4_D
    // D5_Pinky, D5_P, D5_I, D5_D
}
```

#### Sistema de animación:
```javascript
let targetAngles = {};
let currentAngles = {};
let isAnimating = false;
let animationId = null;

function animateToAngles(angles, duration = 500) {
    // Guardar ángulos objetivo
    targetAngles = angles;
    isAnimating = true;
    
    // Iniciar animación
    if (animationId) cancelAnimationFrame(animationId);
    animate();
}

function animate() {
    if (!isAnimating) return;
    
    // Interpolación lineal (lerp)
    for (const [finger, target] of Object.entries(targetAngles)) {
        if (currentAngles[finger] === undefined) {
            currentAngles[finger] = 0;
        }
        currentAngles[finger] += (target - currentAngles[finger]) * 0.1;
    }
    
    // Aplicar ángulos al modelo
    applyAnglesToModel(currentAngles);
    
    // Renderizar
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
}

function applyAnglesToModel(angles) {
    // Aplicar rotaciones a cada hueso
    // Ejemplo: bones.D2_P.rotation.x = angles.D;
    // D2_I.rotation.x = angles.D;
    // D2_D.rotation.x = angles.D;
}
```

#### Controlador de comandos:
```javascript
document.getElementById('sendBtn').addEventListener('click', async () => {
    const command = document.getElementById('commandInput').value.trim();
    if (!command) {
        updateStatus('⚠️ Ingrese un comando', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Procesar respuesta según tipo
            if (data.type === 'individual') {
                const angles = {};
                angles[data.data.finger] = data.data.angle;
                animateToAngles(angles);
                updateStatus(`✅ Comando ejecutado: ${command}`, 'success');
            } else if (data.type === 'multiple' || data.type === 'preset') {
                animateToAngles(data.data.angles);
                updateStatus(`✅ ${data.data.description || 'Comando ejecutado'}: ${command}`, 'success');
            } else if (data.type === 'special') {
                handleSpecialCommand(data.data.action);
            }
        } else {
            updateStatus(`❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`❌ Error de conexión: ${error.message}`, 'error');
    }
});

function handleSpecialCommand(action) {
    switch(action) {
        case 'S':
            stopAnimation();
            updateStatus('⏹️ Motores detenidos', 'info');
            break;
        case 'X':
            calibratePosition();
            updateStatus('📐 Posición calibrada', 'info');
            break;
        case 'I':
            resetAll();
            updateStatus('🔄 Inicializado', 'info');
            break;
    }
}
```

---

### Interfaz de Usuario (HTML + CSS)

#### Layout requerido:
1. **Header** - Título y versión
2. **Visor 3D** (70% del viewport) - Modelo interactivo
3. **Controles**:
   - Campo de texto (entrada de comandos)
   - Botón "Enviar"
   - Botón "Limpiar"
4. **Área de estado** - Feedback visual
5. **Botones rápidos** (todos los comandos compuestos)
6. **Ayuda** - Lista de comandos (colapsable)

#### Elementos de UI:
```html
<!-- Campo de texto -->
<input type="text" 
       id="commandInput" 
       placeholder="Escribe comando (ej: A300, B250, O, P, C)"
       autofocus>

<!-- Botones -->
<button id="sendBtn">Enviar 📤</button>
<button id="clearBtn">Limpiar 🗑️</button>

<!-- Botones rápidos (11 comandos compuestos) -->
<button class="btn-preset" data-cmd="O">🔓 Abrir</button>
<button class="btn-preset" data-cmd="C">🔒 Cerrar</button>
<button class="btn-preset" data-cmd="P">✌️ Pinza</button>
<button class="btn-preset" data-cmd="R">🕷️ Spiderman</button>
<button class="btn-preset" data-cmd="W">🦀 Garra</button>
<button class="btn-preset" data-cmd="Y">👌 OK</button>
<button class="btn-preset" data-cmd="L">👍 Pulgar</button>
<button class="btn-preset" data-cmd="M">📞 Llámame</button>
<button class="btn-preset" data-cmd="H">3️⃣ Número 3</button>
<button class="btn-preset" data-cmd="U">4️⃣ Número 4</button>
<button class="btn-preset" data-cmd="G">☝️ Apuntar</button>
```

#### Estilos clave:
- Tema oscuro (fondo #1a1a2e, texto #ffffff)
- Input con borde azul (#4fc3f7) en focus
- Botones con gradientes y hover effects
- Grid responsive para botones rápidos
- Feedback visual con colores (✅ éxito, ❌ error, ⚠️ advertencia)

---

## 📊 PRUEBAS DE ACEPTACIÓN

### Pruebas Unitarias (Jest)

```javascript
// test-parser.js
describe('Parser de comandos', () => {
    test('Comando individual válido', () => {
        expect(parseIndividualCommand('A300')).toEqual({ type: 'individual', finger: 'A', angle: 45 });
        expect(parseIndividualCommand('B275')).toEqual({ type: 'individual', finger: 'B', angle: 42.5 });
    });
    
    test('Comando individual fuera de rango', () => {
        expect(() => parseIndividualCommand('A700')).toThrow('Rango fuera de límites');
        expect(() => parseIndividualCommand('E150')).toThrow('Rango fuera de límites');
    });
    
    test('Comando múltiple', () => {
        const result = parseMultipleCommands('A300,B250,C400');
        expect(result).toEqual({ type: 'multiple', angles: { A: 45, B: 38.6, C: 63.3 } });
    });
    
    test('Comando compuesto (preset)', () => {
        expect(interceptCommand('O')).toEqual({ type: 'preset', preset: 'O' });
        expect(interceptCommand('P')).toEqual({ type: 'preset', preset: 'P' });
        expect(interceptCommand('R')).toEqual({ type: 'preset', preset: 'R' });
    });
    
    test('Comando especial', () => {
        expect(interceptCommand('S')).toEqual({ type: 'special', action: 'S' });
        expect(interceptCommand('X')).toEqual({ type: 'special', action: 'X' });
        expect(interceptCommand('I')).toEqual({ type: 'special', action: 'I' });
    });
});
```

### Pruebas Visuales

| # | Prueba | Resultado Esperado | Estado |
|---|--------|-------------------|--------|
| 1 | Comando `A300` | Meñique flexionado 45° | [ ] |
| 2 | Comando `B275` | Anular flexionado 42.5° | [ ] |
| 3 | Comando `C400` | Medio flexionado 63.3° | [ ] |
| 4 | Comando `D350` | Índice flexionado 57.3° | [ ] |
| 5 | Comando `E30` | Pulgar inferior 10.4° | [ ] |
| 6 | Comando `F48` | Pulgar superior 10.8° | [ ] |
| 7 | Comando `O` | Mano completamente abierta | [ ] |
| 8 | Comando `C` | Puño cerrado | [ ] |
| 9 | Comando `P` | Gesto de pinza | [ ] |
| 10 | Comando `R` | Gesto de Spiderman | [ ] |
| 11 | Comando `W` | Garra parcial | [ ] |
| 12 | Comando `Y` | Gesto de OK | [ ] |
| 13 | Comando `L` | Pulgar arriba | [ ] |
| 14 | Comando `M` | Gesto de llámame | [ ] |
| 15 | Comando `H` | Número 3 | [ ] |
| 16 | Comando `U` | Número 4 | [ ] |
| 17 | Comando `G` | Apuntar | [ ] |
| 18 | Comando `S` | Detener animación | [ ] |
| 19 | Comando `X` | Calibrar posición | [ ] |
| 20 | Comando `I` | Resetear todo | [ ] |
| 21 | Múltiple `A300,B250,C400` | Tres dedos simultáneos | [ ] |
| 22 | Múltiple `D350,E50,F48` | Índice y pulgar | [ ] |

---

## 📈 CRONOGRAMA DE IMPLEMENTACIÓN

| Fase | Actividades | Duración | Prioridad |
|------|-------------|----------|-----------|
| **Fase 1** | Configuración inicial (Node.js, Express, estructura) | 1 hora | Alta |
| **Fase 2** | Implementación del parser de comandos (100% del manual) | 3 horas | Crítica |
| **Fase 3** | API del servidor (POST /command) | 2 horas | Alta |
| **Fase 4** | Modelo 3D (jerarquía de huesos) | 4 horas | Alta |
| **Fase 5** | Frontend (HTML, CSS, Three.js) | 4 horas | Alta |
| **Fase 6** | Sistema de animación (lerp, interpolación) | 3 horas | Alta |
| **Fase 7** | Integración y pruebas | 2 horas | Media |
| **Fase 8** | Documentación y entrega | 1 hora | Media |
| **Total** | | **20 horas** | |

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Funcionales
- [ ] Todos los comandos individuales funcionan (A-F)
- [ ] Todos los comandos compuestos funcionan (O, C, P, R, W, Y, L, M, H, U, G)
- [ ] Todos los comandos especiales funcionan (S, X, I)
- [ ] Comandos múltiples separados por coma funcionan
- [ ] Validación de rangos correcta
- [ ] Mensajes de error claros y descriptivos

### Técnicos
- [ ] Modelo 3D se carga correctamente
- [ ] Animación suave (interpolación lineal)
- [ ] Respuesta del servidor < 100ms
- [ ] FPS ≥ 30 en animación
- [ ] Código modular y documentado

### UI/UX
- [ ] Campo de texto funcional
- [ ] Botón "Enviar" funcional
- [ ] Botones rápidos funcionales (todos los comandos)
- [ ] Área de estado muestra feedback
- [ ] Diseño responsive
- [ ] Ayuda interactiva (comandos listados)

### Documentación
- [ ] README.md con instalación y uso
- [ ] COMMANDS.md con todos los comandos
- [ ] Ejemplos de comandos de prueba
- [ ] Video demostrativo

---

## 🚀 INSTRUCCIONES DE EJECUCIÓN

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/handi-epn/simulator.git
cd simulator

# Instalar dependencias
npm install

# Ejecutar servidor
npm start
```

### Acceso
- **Servidor:** http://localhost:3000
- **API:** http://localhost:3000/command

### Comandos de prueba
```bash
# Pruebas manuales
curl -X POST http://localhost:3000/command \
  -H "Content-Type: application/json" \
  -d '{"command": "A300"}'

# Pruebas con múltiples comandos
curl -X POST http://localhost:3000/command \
  -H "Content-Type: application/json" \
  -d '{"command": "A300,B250,C400"}'

# Pruebas con comandos compuestos
curl -X POST http://localhost:3000/command \
  -H "Content-Type: application/json" \
  -d '{"command": "P"}'
```

---

## 📝 NOTAS PARA EL AGENTE DE CÓDIGO

### Prioridades
1. **Parser de comandos** - Implementar 100% de las Tablas 5, 6, 7, 8
2. **Modelo 3D** - Jerarquía correcta de huesos
3. **Animación** - Suave y realista
4. **UI** - Intuitiva y con feedback
5. **Pruebas** - Cubrir todos los comandos

### Consideraciones de Código
- Usar ES6+ (async/await, arrow functions)
- Funciones puras para el parser
- Manejo robusto de errores
- Código comentado en español
- Nombres descriptivos

### Consideraciones de Performance
- Cargar modelo GLB una sola vez
- Usar `requestAnimationFrame` para animación
- Minimizar cálculos en cada frame
- Usar `BufferGeometry` en Three.js

---

## 📌 REFERENCIAS

- **Manual:** Manual Handi_EPN_V3_ES.pdf
- **Diagrama:** DIAGRAMA DE BLOQUES.pdf
- **Conexiones:** CONEXIONES.PDF
- **Assembly:** Assembly Manual.pdf
- **Three.js:** https://threejs.org/docs/
- **Express:** https://expressjs.com/

---

**Fin del Plan de Implementación**  
*Versión 5.0 - Comandos completos del manual (100%)*  
*Aprobado para desarrollo por agente de código*
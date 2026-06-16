# Simulador 3D de Mano Robótica HANDi EPN V3

Este proyecto es un simulador interactivo en 3D desarrollado en Node.js, Express y Three.js que permite emular en tiempo real el comportamiento físico y lógico de la mano robótica **HANDi EPN V3** basándose en el manual técnico oficial.

## 🚀 Requisitos e Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- npm (v9 o superior)

### Instalación
1. Descarga o clona el repositorio del simulador.
2. Abre una terminal en el directorio raíz del proyecto e instala las dependencias:
   ```bash
   npm install
   ```

## 🎮 Ejecución del Simulador

Para iniciar el servidor local, ejecuta:
```bash
npm start
```

El servidor se iniciará en: **http://localhost:3000**

Abre esta dirección en tu navegador preferido. Verás la interfaz gráfica interactiva con el visor 3D de la mano robótica, controles directos, una consola de logs en vivo y monitores de los ángulos de flexión en tiempo real.

## 🧪 Pruebas Unitarias e Integración

Para ejecutar la suite de pruebas unitarias y de API automatizadas con Jest, utiliza el comando:
```bash
npm test
```

## 📂 Estructura del Proyecto

- `server.js`: Punto de entrada del servidor Express.
- `parser.js`: Módulo del parser y validador de comandos de la mano robótica.
- `public/`: Archivos estáticos servidos al cliente.
  - `index.html`: Layout principal de la interfaz web.
  - `style.css`: Estilos visuales oscuros con diseño Glassmorphism premium.
  - `script.js`: Control del renderizado 3D de Three.js, animación suave (lerp) de articulaciones y peticiones AJAX.
- `tests/`: Suite de pruebas.
  - `parser.test.js`: Pruebas de unidad para la validación y mapeo de comandos.
  - `commands.test.js`: Pruebas de integración HTTP sobre la API.
- `docs/`: Carpeta de documentación de comandos y guías.

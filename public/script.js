import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================================
// ESCENA, CÁMARA Y RENDERIZADOR
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b13);
scene.fog = new THREE.FogExp2(0x070b13, 0.018);

const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 12, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.6;
controls.minDistance = 8;
controls.maxDistance = 35;
controls.target.set(0, 3, 0);

// ============================================================================
// ILUMINACIÓN
// ============================================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const keyLight = new THREE.SpotLight(0xffffff, 5.0);
keyLight.position.set(6, 18, 12);
keyLight.angle = Math.PI / 5;
keyLight.penumbra = 0.7;
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.bias = -0.00005;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xcce0ff, 0.55);
fillLight.position.set(-8, 10, -4);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x00e5ff, 2.0, 20);
rimLight.position.set(-6, 4, 6);
scene.add(rimLight);

scene.add(new THREE.HemisphereLight(0xeef4ff, 0x111827, 0.2));

// Suelo
const grid = new THREE.GridHelper(30, 30, 0x00e5ff, 0x0f1a2e);
grid.position.y = -5;
grid.material.opacity = 0.25;
grid.material.transparent = true;
scene.add(grid);

// ============================================================================
// MATERIALES
// ============================================================================
const matShell = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8, metalness: 0.08, roughness: 0.18
});
const matMetal = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, metalness: 0.92, roughness: 0.14
});
const matChrome = new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 1.0, roughness: 0.04
});
const matAccent = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9, metalness: 0.1, roughness: 0.7, emissive: 0x0284c7, emissiveIntensity: 0.15
});
const matDark = new THREE.MeshStandardMaterial({
    color: 0x1e293b, metalness: 0.3, roughness: 0.55
});
const matRubber = new THREE.MeshStandardMaterial({
    color: 0x334155, metalness: 0.05, roughness: 0.9
});

// ============================================================================
// UTILIDADES PARA GEOMETRÍA ORGÁNICA
// ============================================================================

/**
 * Crea una cápsula redondeada (cilindro con hemisferios en los extremos)
 */
function createCapsule(radius, height, segments = 16) {
    const geom = new THREE.CapsuleGeometry(radius, height, segments / 2, segments);
    return geom;
}

/**
 * Crea un segmento de dedo anatómico con carcasa exterior y articulación
 */
function createFingerSegment(length, radiusTop, radiusBot, isDistal = false) {
    const group = new THREE.Group();

    // Articulación esférica en la base (cromo)
    const jointRadius = radiusBot * 1.15;
    const jointSphere = new THREE.Mesh(
        new THREE.SphereGeometry(jointRadius, 20, 20),
        matChrome
    );
    jointSphere.castShadow = true;
    group.add(jointSphere);

    // Carcasa exterior (forma de cápsula alargada)
    const capsuleLen = length - jointRadius;
    const shellGeom = createCapsule(radiusTop * 0.95, capsuleLen, 16);
    shellGeom.translate(0, capsuleLen / 2 + jointRadius * 0.6, 0);
    const shellMesh = new THREE.Mesh(shellGeom, matShell);
    shellMesh.castShadow = true;
    shellMesh.receiveShadow = true;
    group.add(shellMesh);

    // Estructura interna de metal visible entre carcasa y articulación
    const innerLen = capsuleLen * 0.7;
    const innerGeom = new THREE.CylinderGeometry(radiusTop * 0.45, radiusBot * 0.5, innerLen, 12);
    innerGeom.translate(0, innerLen / 2 + jointRadius * 0.5, 0);
    const innerMesh = new THREE.Mesh(innerGeom, matMetal);
    innerMesh.castShadow = true;
    group.add(innerMesh);

    // Almohadilla de agarre en la cara palmar (-Z)
    if (!isDistal) {
        const padGeom = new THREE.BoxGeometry(radiusTop * 1.4, length * 0.55, radiusTop * 0.25);
        padGeom.translate(0, length * 0.52, -radiusTop * 0.85);
        const padMesh = new THREE.Mesh(padGeom, matAccent);
        padMesh.castShadow = true;
        group.add(padMesh);
    } else {
        // Punta de goma de agarre para el segmento distal
        const tipGeom = new THREE.SphereGeometry(radiusTop * 0.85, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        tipGeom.rotateX(Math.PI);
        tipGeom.translate(0, length, 0);
        const tipMesh = new THREE.Mesh(tipGeom, matRubber);
        tipMesh.castShadow = true;
        group.add(tipMesh);
    }

    return { group, length };
}

// ============================================================================
// MODELO DE LA MANO
// ============================================================================
const handGroup = new THREE.Group();
scene.add(handGroup);

// --- PALMA ANATÓMICA (Forma orgánica con curvas) ---
function buildPalm() {
    const palmGroup = new THREE.Group();

    // Forma principal de la palma usando un polígono suavizado y extruido
    const s = new THREE.Shape();

    // Trazar el contorno de la palma (vista dorsal, Y hacia arriba)
    // Comenzamos en la base (muñeca) y recorremos en sentido horario
    s.moveTo(0, 0);
    // Lado derecho (lado del pulgar) - curva convexa del tenar
    s.quadraticCurveTo(2.2, 0.3, 2.0, 1.8);
    s.quadraticCurveTo(1.95, 2.8, 1.6, 3.8);
    // Borde superior de nudillos (arco suave)
    s.quadraticCurveTo(1.4, 4.5, 0.8, 4.65);
    s.quadraticCurveTo(0.0, 4.85, -0.8, 4.6);
    s.quadraticCurveTo(-1.3, 4.4, -1.6, 3.8);
    // Lado izquierdo (meñique) - curva cóncava del hipotenar
    s.quadraticCurveTo(-1.75, 2.8, -1.65, 1.8);
    s.quadraticCurveTo(-1.5, 0.5, -0.8, 0.05);
    s.lineTo(0, 0);

    const extrudeOpts = {
        depth: 1.1,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 1,
        bevelSize: 0.18,
        bevelThickness: 0.15
    };

    const palmGeom = new THREE.ExtrudeGeometry(s, extrudeOpts);
    palmGeom.translate(0, 0, -0.55);
    palmGeom.computeVertexNormals();

    const palmMesh = new THREE.Mesh(palmGeom, matShell);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    palmGroup.add(palmMesh);

    // Cara palmar más oscura (placa interior metálica)
    const innerGeom = new THREE.ExtrudeGeometry(s, {
        depth: 0.15,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05
    });
    innerGeom.translate(0, 0, -0.62);
    const innerMesh = new THREE.Mesh(innerGeom, matMetal);
    innerMesh.castShadow = true;
    palmGroup.add(innerMesh);

    // Líneas de tendones visibles (cables de accionamiento)
    const tendonPositions = [
        { x: -1.1, y: 2.2 }, { x: -0.4, y: 2.4 },
        { x: 0.35, y: 2.5 }, { x: 1.05, y: 2.3 }
    ];
    tendonPositions.forEach(pos => {
        const tendonGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 6);
        const tendonMesh = new THREE.Mesh(tendonGeom, matDark);
        tendonMesh.position.set(pos.x, pos.y, -0.5);
        tendonMesh.castShadow = true;
        palmGroup.add(tendonMesh);
    });

    // Detalle: línea de acento luminosa en el dorso
    const accentGeom = new THREE.TorusGeometry(1.4, 0.03, 8, 32, Math.PI * 0.7);
    const accentMesh = new THREE.Mesh(accentGeom, matAccent);
    accentMesh.position.set(0.1, 3.2, 0.65);
    accentMesh.rotation.set(Math.PI / 2, 0, Math.PI * 0.15);
    palmGroup.add(accentMesh);

    return { group: palmGroup, mesh: palmMesh };
}

const palm = buildPalm();
handGroup.add(palm.group);

// --- MUÑECA Y ANTEBRAZO ---
const wristBall = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 24, 24),
    matChrome
);
wristBall.position.set(0, -0.15, 0);
wristBall.castShadow = true;
handGroup.add(wristBall);

const forearmGeom = new THREE.CylinderGeometry(0.9, 1.2, 3.5, 20);
const forearm = new THREE.Mesh(forearmGeom, matDark);
forearm.position.set(0, -2.2, 0);
forearm.castShadow = true;
handGroup.add(forearm);

// Varillas de soporte del antebrazo
[-0.7, 0.7].forEach(x => {
    const rodGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.6, 8);
    const rod = new THREE.Mesh(rodGeom, matMetal);
    rod.position.set(x, -2.2, 0);
    rod.castShadow = true;
    handGroup.add(rod);
});

// ============================================================================
// SISTEMA DE HUESOS (ARTICULACIONES)
// ============================================================================
const bones = {
    A: { proximal: null, intermediate: null, distal: null },
    B: { proximal: null, intermediate: null, distal: null },
    C: { proximal: null, intermediate: null, distal: null },
    D: { proximal: null, intermediate: null, distal: null },
    E: { base: null },
    F: { proximal: null, distal: null }
};

/**
 * Construye un dedo estándar (4 dedos: Índice, Medio, Anular, Meñique)
 * Cada dedo tiene 3 falanges anidadas jerárquicamente.
 */
function buildFinger(letter, x, y, z, splayZ, thickness, lengthScale) {
    const r = 0.2 * thickness;

    // Proximal
    const prox = createFingerSegment(1.5 * lengthScale, r, r * 1.05);
    prox.group.position.set(x, y, z);
    prox.group.rotation.z = splayZ;
    palm.group.add(prox.group);

    // Intermedia
    const inter = createFingerSegment(1.05 * lengthScale, r * 0.9, r * 0.95);
    inter.group.position.set(0, prox.length, 0);
    prox.group.add(inter.group);

    // Distal
    const dist = createFingerSegment(0.75 * lengthScale, r * 0.8, r * 0.85, true);
    dist.group.position.set(0, inter.length, 0);
    inter.group.add(dist.group);

    bones[letter].proximal = prox.group;
    bones[letter].intermediate = inter.group;
    bones[letter].distal = dist.group;
}

/**
 * Construye el pulgar con anatomía realista.
 * El pulgar se ancla a la eminencia tenar de la palma,
 * con una articulación CMC (carpometacarpiana) multi-eje.
 */
function buildThumb() {
    // Metacarpiano del pulgar (hueso que conecta palma → primera articulación)
    const metacarpal = new THREE.Group();
    metacarpal.position.set(1.65, 1.2, 0.0);     // Unido al borde del tenar
    metacarpal.rotation.set(0.15, -0.15, -0.45);  // Posición de reposo natural
    palm.group.add(metacarpal);

    // Articulación CMC (rótula grande en la base)
    const cmcBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 20, 20),
        matChrome
    );
    cmcBall.castShadow = true;
    metacarpal.add(cmcBall);

    // Segmento metacarpiano corto (el "puente" dentro de la palma)
    const metaBone = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.6, 8, 12),
        matShell
    );
    metaBone.position.set(0, 0.45, 0);
    metaBone.castShadow = true;
    metacarpal.add(metaBone);

    // Falange proximal del pulgar
    const proxGroup = new THREE.Group();
    proxGroup.position.set(0, 0.8, 0);
    proxGroup.rotation.z = -0.2;
    metacarpal.add(proxGroup);

    const prox = createFingerSegment(1.1, 0.22, 0.24);
    proxGroup.add(prox.group);

    // Falange distal del pulgar
    const dist = createFingerSegment(0.85, 0.2, 0.22, true);
    dist.group.position.set(0, prox.length, 0);
    prox.group.add(dist.group);

    bones.E.base = metacarpal;
    bones.F.proximal = proxGroup;
    bones.F.distal = dist.group;
}

// --- POSICIONAMIENTO DE LOS DEDOS ---
// Coordenadas (x, y, z) respecto a la palma + splay angular
// Los nudillos siguen un arco natural: medio es el más alto, meñique el más bajo
buildFinger('D',  1.15, 4.55, 0, -0.04, 1.02, 1.0);   // Índice
buildFinger('C',  0.35, 4.75, 0,  0.00, 1.08, 1.1);   // Medio (más largo)
buildFinger('B', -0.45, 4.55, 0,  0.03, 1.00, 1.02);  // Anular
buildFinger('A', -1.15, 4.25, 0,  0.07, 0.90, 0.88);  // Meñique (más corto)
buildThumb();

// Posición y rotación inicial de la mano
handGroup.rotation.set(-0.3, -0.5, 0.08);
handGroup.position.set(0, -1.5, 0);

// ============================================================================
// SISTEMA DE ANIMACIÓN LERP
// ============================================================================
const targetAngles = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
const currentAngles = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
let isStopped = false;
const LERP_FACTOR = 0.08;

const MAX_DEG = { A: 90, B: 85, C: 95, D: 90, E: 45, F: 90 };

function degToRad(finger, deg) {
    const clamped = Math.max(0, Math.min(deg, MAX_DEG[finger]));
    return (clamped / MAX_DEG[finger]) * (MAX_DEG[finger] * Math.PI / 180);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (!isStopped) {
        for (const f of ['A', 'B', 'C', 'D', 'E', 'F']) {
            currentAngles[f] += (targetAngles[f] - currentAngles[f]) * LERP_FACTOR;
            updateMonitorUI(f, currentAngles[f]);
        }
    }

    applyRotations();
    renderer.render(scene, camera);
}

function applyRotations() {
    // --- Dedos estándar (A, B, C, D) ---
    // La rotación se distribuye entre las 3 falanges para un cierre natural
    ['A', 'B', 'C', 'D'].forEach(f => {
        const rad = degToRad(f, currentAngles[f]);
        const b = bones[f];
        if (b.proximal)     b.proximal.rotation.x     = -rad * 0.40;
        if (b.intermediate) b.intermediate.rotation.x = -rad * 0.35;
        if (b.distal)       b.distal.rotation.x       = -rad * 0.30;
    });

    // --- Pulgar: Articulación CMC (E) = Oposición multiaxial ---
    if (bones.E.base) {
        const t = degToRad('E', currentAngles['E']); // 0 → ~0.785 rad (45°)
        const norm = currentAngles['E'] / MAX_DEG['E']; // 0..1

        // Reposo: rotation(0.15, -0.15, -0.45)
        // Oposición total: el pulgar cruza la palma para encontrar los dedos
        bones.E.base.rotation.x = 0.15 + norm * 0.80;   // Se inclina hacia adelante
        bones.E.base.rotation.y = -0.15 - norm * 1.1;   // Rota hacia adentro (oposición)
        bones.E.base.rotation.z = -0.45 + norm * 0.35;  // Rota sobre sí mismo
    }

    // --- Pulgar: Flexión de falanges (F) ---
    if (bones.F.proximal || bones.F.distal) {
        const rad = degToRad('F', currentAngles['F']);
        if (bones.F.proximal) bones.F.proximal.rotation.x = -rad * 0.55;
        if (bones.F.distal)   bones.F.distal.rotation.x   = -rad * 0.50;
    }
}

function updateMonitorUI(finger, angle) {
    const item = document.getElementById(`mon-${finger}`);
    if (!item) return;

    const valText = item.querySelector('.mon-val');
    const fillBar = item.querySelector('.mon-bar-fill');
    valText.textContent = `${angle.toFixed(1)}°`;

    const pct = Math.max(0, Math.min(100, (angle / MAX_DEG[finger]) * 100));
    fillBar.style.width = `${pct}%`;
}

animate();

// ============================================================================
// INTERACCIÓN Y COMUNICACIÓN CON EL SERVIDOR
// ============================================================================
const consoleBox = document.getElementById('status-console');
const commandInput = document.getElementById('commandInput');
const commandForm = document.getElementById('command-form');
const clearBtn = document.getElementById('clearBtn');
const clearConsoleBtn = document.getElementById('clear-console-btn');

function printLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${time}] ${message}`;
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function clearInput() {
    commandInput.value = '';
    commandInput.focus();
}

clearBtn.addEventListener('click', clearInput);

clearConsoleBtn.addEventListener('click', () => {
    consoleBox.innerHTML = '';
    printLog('Consola limpia.', 'info');
});

async function sendCommand(commandText) {
    if (!commandText || !commandText.trim()) return;
    printLog(`Enviando comando: "${commandText}"`, 'info');
    isStopped = false;

    try {
        const response = await fetch('/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: commandText })
        });

        const resData = await response.json();

        if (!response.ok || !resData.success) {
            printLog(`ERROR: ${resData.error || 'Error desconocido'}`, 'error');
            return;
        }

        const payload = resData.data;
        printLog(`OK: ${payload.description}`, 'success');

        if (payload.type === 'individual') {
            targetAngles[payload.finger] = payload.angle;
        } else if (payload.type === 'preset' || payload.type === 'multiple') {
            for (const [finger, angle] of Object.entries(payload.angles)) {
                targetAngles[finger] = angle;
            }
        } else if (payload.type === 'special') {
            handleSpecialCommand(payload.action);
        }
    } catch (err) {
        printLog('ERROR: No se pudo establecer conexion con el servidor.', 'error');
        console.error(err);
    }
}

function handleSpecialCommand(action) {
    if (action === 'S') {
        isStopped = true;
        for (const f of ['A', 'B', 'C', 'D', 'E', 'F']) {
            targetAngles[f] = currentAngles[f];
        }
        printLog('DETENER: Movimiento de motores cancelado.', 'warning');
    } else if (action === 'X') {
        for (const f of ['A', 'B', 'C', 'D', 'E', 'F']) {
            targetAngles[f] = currentAngles[f];
        }
        printLog('CALIBRAR: Posicion actual guardada como referencia.', 'info');
    } else if (action === 'I') {
        isStopped = false;
        for (const f of ['A', 'B', 'C', 'D', 'E', 'F']) {
            targetAngles[f] = 0;
            currentAngles[f] = 0;
            updateMonitorUI(f, 0);
        }
        printLog('INICIALIZAR: Motor Shields reseteados a 0 grados.', 'info');
    }
}

commandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendCommand(commandInput.value);
    clearInput();
});

document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => sendCommand(btn.getAttribute('data-cmd')));
});

document.querySelectorAll('.btn-special').forEach(btn => {
    btn.addEventListener('click', () => sendCommand(btn.getAttribute('data-cmd')));
});

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

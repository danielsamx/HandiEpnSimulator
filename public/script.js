import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================================
// ESCENA, CÁMARA Y RENDERIZADOR
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xababab); // Light gray background
scene.fog = new THREE.FogExp2(0xababab, 0.018);
// Removed old fog line

const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 12, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.6;
controls.minDistance = 8;
controls.maxDistance = 35;
controls.target.set(0, 3, 0);

// ============================================================================
// ILUMINACIÓN MECÁNICA/ESTUDIO DE ALTO CONTRASTE
// ============================================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const keyLight = new THREE.SpotLight(0xffffff, 9.0);
keyLight.position.set(8, 20, 12);
keyLight.angle = Math.PI / 4;
keyLight.penumbra = 0.8;
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.bias = -0.00005;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.85); // Relleno azul tecnológico
fillLight.position.set(-10, 8, -6);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x00f0ff, 2.5, 20); // Luz de contorno cian de alta intensidad
rimLight.position.set(-6, 6, 8);
scene.add(rimLight);

scene.add(new THREE.HemisphereLight(0xffffff, 0x090d16, 0.4));

// Suelo y Cuadrícula (Estilo cibernético)
const grid = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
grid.position.y = -5;
grid.material.opacity = 0.25;
grid.material.transparent = true;
scene.add(grid);

// Plano receptor de sombras de alto contraste en suelo oscuro
const shadowFloorGeom = new THREE.PlaneGeometry(100, 100);
const shadowFloorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
const shadowFloor = new THREE.Mesh(shadowFloorGeom, shadowFloorMat);
shadowFloor.rotation.x = -Math.PI / 2;
shadowFloor.position.y = -5;
shadowFloor.receiveShadow = true;
scene.add(shadowFloor);

// ============================================================================
// MATERIALES ROBÓTICOS DE ALTA TECNOLOGÍA (ESTILO CYBERPUNK/INDUSTRIAL)
// ============================================================================
const matChassis = new THREE.MeshStandardMaterial({
    color: 0x4a5b78,      // Gris medio claro para mayor contraste
    roughness: 0.45,
    metalness: 0.25
});

const matChrome = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,      // Acero/cromo brillante para ejes y pistones
    roughness: 0.1,
    metalness: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
});

const matGold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,      // Oro/latón pulido para juntas y pernos de acento
    roughness: 0.2,
    metalness: 0.95
});

const matGrip = new THREE.MeshStandardMaterial({
    color: 0x090d16,      // Caucho/silicona antideslizante para la cara palmar
    roughness: 0.9,
    metalness: 0.0
});

const matGlow = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,      // Neón cian para circuitos y emisores
    toneMapped: false
});

// Mapeos de compatibilidad con código existente
const matSkin = matChassis;
const matNail = matChrome;
const matWrinkle = matGold;
const matShell = matChassis;
const matMetal = matChrome;
const matAccent = matGold;
const matDark = matChassis;
const matRubber = matGrip;

// ============================================================================
// UTILIDADES PARA GEOMETRÍA ORGÁNICA
// ============================================================================

/**
 * Crea un segmento de dedo anatómico (falange) con volumen de piel, pliegues y uñas
 */
function createFingerSegment(length, radiusTop, radiusBot, isDistal = false) {
    const group = new THREE.Group();

    const jointRadius = radiusBot * 1.15;

    // 1. EJE DE BISAGRA MECÁNICA (Cilindro horizontal a lo largo del eje X)
    const hingeGeom = new THREE.CylinderGeometry(jointRadius * 0.85, jointRadius * 0.85, jointRadius * 2.3, 16);
    hingeGeom.rotateZ(Math.PI / 2); // Alinea el cilindro con el eje X
    const hingeMesh = new THREE.Mesh(hingeGeom, matChrome);
    hingeMesh.castShadow = true;
    hingeMesh.receiveShadow = true;
    group.add(hingeMesh);

    // 2. TAPAS/PERNOS DE ARTICULACIÓN (Detalles dorados en los extremos)
    [-1.15, 1.15].forEach(side => {
        const capGeom = new THREE.CylinderGeometry(jointRadius * 1.0, jointRadius * 1.0, jointRadius * 0.25, 12);
        capGeom.rotateZ(Math.PI / 2);
        const capMesh = new THREE.Mesh(capGeom, matGold);
        capMesh.position.x = side * jointRadius;
        capMesh.castShadow = true;
        group.add(capMesh);
    });

    // 3. CUERPO DE LA FALANGE (Chasis robótico principal)
    const cylLength = length - jointRadius * 0.55;
    const bodyGeom = new THREE.CylinderGeometry(radiusTop * 0.95, radiusBot * 0.95, cylLength, 16, 2);
    bodyGeom.translate(0, cylLength / 2 + jointRadius * 0.45, 0);
    const bodyMesh = new THREE.Mesh(bodyGeom, matChassis);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // 4. LÍNEA DE NEÓN (LED indicador de estado en la parte posterior/dorsal +Z)
    const neonGeom = new THREE.BoxGeometry(radiusBot * 0.25, cylLength * 0.75, radiusBot * 0.15);
    neonGeom.translate(0, cylLength / 2 + jointRadius * 0.45, radiusBot * 0.9);
    const neonMesh = new THREE.Mesh(neonGeom, matGlow);
    group.add(neonMesh);

    // 5. ALMOHADILLA DE AGARRE (Caucho antideslizante en la parte frontal/palmar -Z)
    const gripGeom = new THREE.BoxGeometry(radiusBot * 1.15, cylLength * 0.8, radiusBot * 0.35);
    gripGeom.translate(0, cylLength / 2 + jointRadius * 0.45, -radiusBot * 0.8);
    const gripMesh = new THREE.Mesh(gripGeom, matGrip);
    gripMesh.castShadow = true;
    gripMesh.receiveShadow = true;
    group.add(gripMesh);

    // Si es falange distal (punta), añadimos sensor táctil
    if (isDistal) {
        // Yema robótica redondeada
        const tipRadius = radiusTop * 0.95;
        const tipGeom = new THREE.SphereGeometry(tipRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        tipGeom.scale(1.0, 0.85, 1.05);
        tipGeom.translate(0, length, 0);
        const tipMesh = new THREE.Mesh(tipGeom, matChassis);
        tipMesh.castShadow = true;
        tipMesh.receiveShadow = true;
        group.add(tipMesh);

        // Sensor de contacto (pequeño domo dorado en la punta)
        const sensorGeom = new THREE.SphereGeometry(radiusTop * 0.55, 12, 12);
        sensorGeom.translate(0, length + radiusTop * 0.15, 0);
        const sensorMesh = new THREE.Mesh(sensorGeom, matGold);
        sensorMesh.castShadow = true;
        group.add(sensorMesh);

        // Placa del sensor dorsal (reemplaza la uña)
        const plateGeom = new THREE.BoxGeometry(radiusTop * 1.2, length * 0.35, radiusTop * 0.08);
        plateGeom.translate(0, length - length * 0.2, radiusTop * 0.75);
        const plateMesh = new THREE.Mesh(plateGeom, matChrome);
        plateMesh.castShadow = true;
        group.add(plateMesh);
    } else {
        // Abrazaderas metálicas / anillos de refuerzo en falanges intermedias
        [jointRadius * 0.6, length - radiusTop * 0.7].forEach(yPos => {
            const ringGeom = new THREE.TorusGeometry(radiusBot * 1.08, radiusBot * 0.07, 6, 20);
            ringGeom.rotateX(Math.PI / 2);
            const ringMesh = new THREE.Mesh(ringGeom, matGold);
            ringMesh.position.y = yPos;
            ringMesh.castShadow = true;
            group.add(ringMesh);
        });
    }

    return { group, length };
}

// ============================================================================
// MODELO DE LA MANO
// ============================================================================
const handGroup = new THREE.Group();
scene.add(handGroup);

// --- PALMA ANATÓMICA (Forma orgánica con eminencias y pliegues) ---
function buildPalm() {
    const palmGroup = new THREE.Group();

    // Forma principal de la palma (chasis estructural)
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(2.1, 0.4, 1.9, 1.8);
    s.quadraticCurveTo(1.85, 2.8, 1.5, 3.8);
    s.quadraticCurveTo(1.3, 4.4, 0.8, 4.55);
    s.quadraticCurveTo(0.0, 4.75, -0.8, 4.5);
    s.quadraticCurveTo(-1.3, 4.3, -1.5, 3.8);
    s.quadraticCurveTo(-1.65, 2.8, -1.55, 1.8);
    s.quadraticCurveTo(-1.4, 0.5, -0.7, 0.05);
    s.lineTo(0, 0);

    const extrudeOpts = {
        depth: 0.6,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.15,
        bevelThickness: 0.12
    };

    const palmGeom = new THREE.ExtrudeGeometry(s, extrudeOpts);
    palmGeom.translate(0, 0, -0.3);
    palmGeom.computeVertexNormals();

    const palmMesh = new THREE.Mesh(palmGeom, matChassis);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    palmGroup.add(palmMesh);

    // Carcasa del actuador del pulgar (Eminencia Tenar Mecánica)
    const thenarGeom = new THREE.BoxGeometry(1.4, 1.9, 0.7);
    const thenarMesh = new THREE.Mesh(thenarGeom, matChassis);
    thenarMesh.position.set(0.9, 1.5, 0.2);
    thenarMesh.rotation.set(0.15, -0.2, -0.35);
    thenarMesh.castShadow = true;
    thenarMesh.receiveShadow = true;
    palmGroup.add(thenarMesh);

    // Embellecedor metálico en la base del pulgar
    const thenarRimGeom = new THREE.BoxGeometry(1.5, 0.2, 0.8);
    const thenarRim = new THREE.Mesh(thenarRimGeom, matGold);
    thenarRim.position.copy(thenarMesh.position);
    thenarRim.rotation.copy(thenarMesh.rotation);
    thenarRim.position.y -= 0.65;
    thenarRim.castShadow = true;
    palmGroup.add(thenarRim);

    // Radiador/Disipador de Calor (Eminencia Hipotenar Mecánica)
    const hypoGeom = new THREE.BoxGeometry(0.8, 1.7, 0.6);
    const hypoMesh = new THREE.Mesh(hypoGeom, matChrome);
    hypoMesh.position.set(-1.0, 1.4, 0.18);
    hypoMesh.rotation.set(0.1, 0.05, 0.1);
    hypoMesh.castShadow = true;
    hypoMesh.receiveShadow = true;
    palmGroup.add(hypoMesh);

    // Rejilla del disipador (líneas horizontales en el disipador)
    for (let i = 0; i < 5; i++) {
        const finGeom = new THREE.BoxGeometry(0.85, 0.08, 0.65);
        const fin = new THREE.Mesh(finGeom, matChassis);
        fin.position.set(-1.0, 0.8 + i * 0.3, 0.2);
        fin.rotation.set(0.1, 0.05, 0.1);
        fin.castShadow = true;
        palmGroup.add(fin);
    }

    // Barra de soporte de nudillos (parachoques superior)
    const knucklePadGeom = new THREE.CylinderGeometry(0.24, 0.24, 2.6, 16);
    knucklePadGeom.rotateZ(Math.PI / 2);
    const knucklePad = new THREE.Mesh(knucklePadGeom, matChrome);
    knucklePad.position.set(-0.15, 3.8, 0.22);
    knucklePad.castShadow = true;
    knucklePad.receiveShadow = true;
    palmGroup.add(knucklePad);

    // Tapas doradas para la barra de soporte de nudillos
    [-1.35, 1.35].forEach(side => {
        const endGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12);
        endGeom.rotateZ(Math.PI / 2);
        const endMesh = new THREE.Mesh(endGeom, matGold);
        endMesh.position.set(-0.15 + side, 3.8, 0.22);
        endMesh.castShadow = true;
        palmGroup.add(endMesh);
    });

    // Líneas de Circuitos Integrados de Neón (Reemplazan líneas de la vida/cabeza)
    // Circuito 1
    const path1Geom = new THREE.CylinderGeometry(0.045, 0.045, 1.6, 8);
    const path1 = new THREE.Mesh(path1Geom, matGlow);
    path1.position.set(0.2, 2.2, 0.32);
    path1.rotation.set(0.1, 0.05, -Math.PI * 0.2);
    palmGroup.add(path1);

    // Circuito 2
    const path2Geom = new THREE.CylinderGeometry(0.045, 0.045, 1.3, 8);
    const path2 = new THREE.Mesh(path2Geom, matGlow);
    path2.position.set(-0.4, 2.6, 0.32);
    path2.rotation.set(0.1, -0.05, Math.PI * 0.3);
    palmGroup.add(path2);

    // Nodos de circuito (pequeñas esferas doradas en las intersecciones)
    const nodeGeom = new THREE.SphereGeometry(0.09, 8, 8);
    [[0.6, 1.6, 0.32], [-0.8, 2.2, 0.32], [0.1, 2.9, 0.32]].forEach(pos => {
        const node = new THREE.Mesh(nodeGeom, matGold);
        node.position.set(pos[0], pos[1], pos[2]);
        palmGroup.add(node);
    });

    // Tendones mecánicos en el dorso (-Z)
    [-0.8, -0.3, 0.2, 0.7].forEach(x => {
        const tendonGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.6, 8);
        const tendon = new THREE.Mesh(tendonGeom, matChrome);
        tendon.position.set(x, 2.0, -0.32);
        tendon.rotation.x = -0.08;
        tendon.castShadow = true;
        palmGroup.add(tendon);
    });

    return { group: palmGroup, mesh: palmMesh };
}

const palm = buildPalm();
handGroup.add(palm.group);

// --- MUÑECA Y ANTEBRAZO (Estilo orgánico cubierto de piel) ---
// Articulación de rótula de la muñeca (Rótula metálica industrial)
const wristBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 24, 24),
    matChrome
);
wristBall.position.set(0, -0.1, 0);
wristBall.castShadow = true;
wristBall.receiveShadow = true;
handGroup.add(wristBall);

// Chasis del antebrazo
const forearmGeom = new THREE.CylinderGeometry(0.85, 1.05, 3.5, 16);
const forearm = new THREE.Mesh(forearmGeom, matChassis);
forearm.position.set(0, -2.1, 0);
forearm.castShadow = true;
forearm.receiveShadow = true;
handGroup.add(forearm);

// Anillo decorativo en la base del antebrazo
const forearmRingGeom = new THREE.CylinderGeometry(1.1, 1.1, 0.3, 16);
const forearmRing = new THREE.Mesh(forearmRingGeom, matGold);
forearmRing.position.set(0, -3.7, 0);
forearmRing.castShadow = true;
handGroup.add(forearmRing);

// Varillas mecánicas/pistones del antebrazo
[-0.48, 0.48].forEach(x => {
    // Eje interior de cromo
    const innerRodGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8);
    const innerRod = new THREE.Mesh(innerRodGeom, matChrome);
    innerRod.position.set(x, -2.1, 0.0);
    innerRod.castShadow = true;
    innerRod.receiveShadow = true;
    handGroup.add(innerRod);

    // Carcasa exterior corta
    const outerCylGeom = new THREE.CylinderGeometry(0.16, 0.18, 1.8, 12);
    const outerCyl = new THREE.Mesh(outerCylGeom, matChassis);
    outerCyl.position.set(x, -2.9, 0.0);
    outerCyl.castShadow = true;
    handGroup.add(outerCyl);

    // Acento dorado
    const collarGeom = new THREE.CylinderGeometry(0.19, 0.19, 0.15, 12);
    const collar = new THREE.Mesh(collarGeom, matGold);
    collar.position.set(x, -2.0, 0.0);
    collar.castShadow = true;
    handGroup.add(collar);
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
 * El pulgar se ancla a la eminencia tenar de la palma.
 */
function buildThumb() {
    // Metacarpal del pulgar
    const metacarpal = new THREE.Group();
    metacarpal.position.set(1.65, 1.2, 0.0);
    metacarpal.rotation.set(0.25, -0.35, -0.5); // Orientación base estática de la bisagra
    palm.group.add(metacarpal);

    // Pivot group para la oposición limpia del pulgar (Motor E)
    const E_joint = new THREE.Group();
    metacarpal.add(E_joint);

    // Articulación CMC (Rótula metálica del pulgar)
    const cmcBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 20, 20),
        matChrome
    );
    cmcBall.castShadow = true;
    E_joint.add(cmcBall);

    // Anillo dorado de acento en la rótula
    const cmcRingGeom = new THREE.TorusGeometry(0.38, 0.06, 6, 20);
    const cmcRing = new THREE.Mesh(cmcRingGeom, matGold);
    cmcRing.rotation.x = Math.PI / 2;
    E_joint.add(cmcRing);

    // Hueso metacarpiano corto (eje mecánico de conexión)
    const metaBoneGeom = new THREE.CylinderGeometry(0.16, 0.2, 0.6, 12);
    const metaBone = new THREE.Mesh(metaBoneGeom, matChrome);
    metaBone.position.set(0, 0.35, 0);
    metaBone.castShadow = true;
    E_joint.add(metaBone);

    // Cubierta protectora del metacarpiano
    const metaShellGeom = new THREE.BoxGeometry(0.28, 0.4, 0.35);
    const metaShell = new THREE.Mesh(metaShellGeom, matChassis);
    metaShell.position.set(0, 0.35, 0);
    metaShell.castShadow = true;
    E_joint.add(metaShell);

    // Falange proximal del pulgar
    const proxGroup = new THREE.Group();
    proxGroup.position.set(0, 0.75, 0);
    proxGroup.rotation.set(0, 1.2, -0.2); // Rotación Y invertida para orientar la flexión hacia la palma
    E_joint.add(proxGroup);

    const prox = createFingerSegment(1.1, 0.22, 0.24);
    proxGroup.add(prox.group);

    // Falange distal del pulgar
    const dist = createFingerSegment(0.85, 0.2, 0.22, true);
    dist.group.position.set(0, prox.length, 0);
    prox.group.add(dist.group);

    bones.E.base = E_joint; // Asignamos E_joint como la base de rotación del motor E
    bones.F.proximal = proxGroup;
    bones.F.distal = dist.group;
}

// --- POSICIONAMIENTO DE LOS DEDOS ---
// Coordenadas (x, y, z) respecto a la palma + splay angular
// Los nudillos siguen un arco natural: medio es el más alto, meñique el más bajo
buildFinger('D', 1.15, 4.55, 0, -0.04, 1.02, 1.0);   // Índice
buildFinger('C', 0.35, 4.75, 0, 0.00, 1.08, 1.1);   // Medio (más largo)
buildFinger('B', -0.45, 4.55, 0, 0.03, 1.00, 1.02);  // Anular
buildFinger('A', -1.15, 4.25, 0, 0.07, 0.90, 0.88);  // Meñique (más corto)
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
        if (b.proximal) b.proximal.rotation.x = -rad * 0.40;
        if (b.intermediate) b.intermediate.rotation.x = -rad * 0.35;
        if (b.distal) b.distal.rotation.x = -rad * 0.30;
    });

    // --- Pulgar: Articulación CMC (E) = Oposición multiaxial ---
    if (bones.E.base) {
        const norm = currentAngles['E'] / MAX_DEG['E']; // 0..1

        // Rotación de bisagra limpia alrededor del eje X local (flexión hacia la palma)
        // y una rotación complementaria en Y para encarar los dedos.
        // Al ser un grupo anidado (E_joint), la rotación inicial de la bisagra
        // se mantiene estática en su padre (metacarpal), evitando giros o bamboleos raros.
        bones.E.base.rotation.x = -norm * 0.75;
        bones.E.base.rotation.y = norm * 0.45;
        bones.E.base.rotation.z = 0; // Sin torsión
    }


    // --- Pulgar: Flexión de falanges (F) ---
    if (bones.F.proximal || bones.F.distal) {
        const rad = degToRad('F', currentAngles['F']);
        if (bones.F.proximal) bones.F.proximal.rotation.x = -rad * 0.65;
        if (bones.F.distal) bones.F.distal.rotation.x = -rad * 0.55;
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

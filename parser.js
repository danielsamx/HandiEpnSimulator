const CONFIG = {
    'A': { min: 0, max: 600, angleMin: 0, angleMax: 90, name: 'Meñique' },
    'B': { min: 0, max: 550, angleMin: 0, angleMax: 85, name: 'Anular' },
    'C': { min: 0, max: 600, angleMin: 0, angleMax: 95, name: 'Medio' },
    'D': { min: 0, max: 550, angleMin: 0, angleMax: 90, name: 'Índice' },
    'E': { min: 0, max: 130, angleMin: 0, angleMax: 45, name: 'Pulgar Inferior' },
    'F': { min: 0, max: 400, angleMin: 0, angleMax: 90, name: 'Pulgar Superior' }
};

const PRESETS = {
    'O': {
        description: 'Abre todos los dedos de la mano',
        angles: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
    },
    'C': {
        description: 'Cierra todos los dedos de la mano',
        angles: { A: 90, B: 85, C: 95, D: 90, E: 45, F: 90 }
    },
    'P': {
        description: 'Gesto de pinza (dedo medio y pulgar flexionados)',
        angles: { A: 0, B: 0, C: 0, D: 70, E: 0, F: 80 }
    },
    'R': {
        description: 'Gesto de Spiderman',
        angles: { A: 80, B: 85, C: 95, D: 0, E: 0, F: 0 }
    },
    'W': {
        description: 'Garra parcial (dedo índice y anular cerrados)',
        angles: { A: 0, B: 80, C: 0, D: 80, E: 0, F: 0 }
    },
    'Y': {
        description: 'Gesto de OK',
        angles: { A: 0, B: 0, C: 0, D: 30, E: 0, F: 50 }
    },
    'L': {
        description: 'Gesto de pulgar arriba',
        angles: { A: 0, B: 0, C: 0, D: 0, E: 30, F: 0 }
    },
    'M': {
        description: 'Gesto de llámame',
        angles: { A: 90, B: 0, C: 0, D: 0, E: 20, F: 0 }
    },
    'H': {
        description: 'Gesto de número tres (índice, medio y anular levantados)',
        angles: { A: 0, B: 70, C: 70, D: 70, E: 0, F: 0 }
    },
    'U': {
        description: 'Gesto de número cuatro (pulgar cerrado)',
        angles: { A: 0, B: 0, C: 0, D: 0, E: 45, F: 0 }
    },
    'G': {
        description: 'Gesto de apuntar con el índice y con el pulgar abierto',
        angles: { A: 0, B: 0, C: 0, D: 80, E: 10, F: 0 }
    }
};

const SPECIALS = {
    'S': 'Detener los motores',
    'X': 'Calibración',
    'I': 'Inicializar Motor Shields'
};

function mapRange(value, minVal, maxVal, angleMin, angleMax) {
    const rawAngle = angleMin + ((value - minVal) / (maxVal - minVal)) * (angleMax - angleMin);
    return Math.round(rawAngle * 10) / 10;
}

function parseIndividualCommand(cmd) {
    const match = cmd.match(/^([A-F])(\d+)$/);
    if (!match) {
        throw new Error(`Formato de comando individual inválido: "${cmd}". Use una letra [A-F] seguida de un número.`);
    }
    const finger = match[1];
    const value = parseInt(match[2], 10);
    const conf = CONFIG[finger];
    if (value < conf.min || value > conf.max) {
        throw new Error(`Rango fuera de límites para ${conf.name} (${finger}): debe estar entre ${conf.min} y ${conf.max}.`);
    }
    const angle = mapRange(value, conf.min, conf.max, conf.angleMin, conf.angleMax);
    return {
        finger,
        angle,
        description: `Mueve ${conf.name} (${finger}) a ${angle}° (posición ${value})`
    };
}

function parseMultipleCommands(text) {
    const parts = text.split(',');
    const angles = {};
    for (let part of parts) {
        part = part.trim();
        if (!part) continue;
        const result = parseIndividualCommand(part);
        angles[result.finger] = result.angle;
    }
    return {
        angles,
        description: `Movimiento múltiple: ${Object.entries(angles).map(([f, a]) => `${f} a ${a}°`).join(', ')}`
    };
}

function interceptCommand(text) {
    if (typeof text !== 'string') {
        throw new Error('El comando debe ser una cadena de texto.');
    }
    text = text.toUpperCase().replace(/\s+/g, '');
    
    if (!text) {
        throw new Error('Comando vacío.');
    }
    
    // 1. Verificar comandos especiales (S, X, I)
    if (SPECIALS[text]) {
        return {
            type: 'special',
            action: text,
            description: SPECIALS[text]
        };
    }
    
    // 2. Verificar comandos compuestos (presets)
    if (PRESETS[text]) {
        return {
            type: 'preset',
            preset: text,
            angles: PRESETS[text].angles,
            description: PRESETS[text].description
        };
    }
    
    // 3. Verificar comandos múltiples (separados por comas)
    if (text.includes(',')) {
        const result = parseMultipleCommands(text);
        return {
            type: 'multiple',
            angles: result.angles,
            description: result.description
        };
    }
    
    // 4. Verificar comando individual
    const result = parseIndividualCommand(text);
    return {
        type: 'individual',
        finger: result.finger,
        angle: result.angle,
        description: result.description
    };
}

module.exports = {
    interceptCommand,
    CONFIG,
    PRESETS,
    SPECIALS,
    mapRange
};

const { interceptCommand } = require('../parser');

describe('Parser de comandos de la mano robótica', () => {
    test('Comandos individuales válidos', () => {
        expect(interceptCommand('A300')).toEqual({
            type: 'individual',
            finger: 'A',
            angle: 45,
            description: 'Mueve Meñique (A) a 45° (posición 300)'
        });
        expect(interceptCommand('B275')).toEqual({
            type: 'individual',
            finger: 'B',
            angle: 42.5,
            description: 'Mueve Anular (B) a 42.5° (posición 275)'
        });
        expect(interceptCommand('C600')).toEqual({
            type: 'individual',
            finger: 'C',
            angle: 95,
            description: 'Mueve Medio (C) a 95° (posición 600)'
        });
        expect(interceptCommand('E130')).toEqual({
            type: 'individual',
            finger: 'E',
            angle: 45,
            description: 'Mueve Pulgar Inferior (E) a 45° (posición 130)'
        });
    });
    
    test('Comandos individuales con minúsculas y espacios', () => {
        expect(interceptCommand('  a 300  ')).toEqual({
            type: 'individual',
            finger: 'A',
            angle: 45,
            description: 'Mueve Meñique (A) a 45° (posición 300)'
        });
    });

    test('Comandos individuales fuera de rango', () => {
        expect(() => interceptCommand('A700')).toThrow('Rango fuera de límites');
        expect(() => interceptCommand('E150')).toThrow('Rango fuera de límites');
        expect(() => interceptCommand('F-5')).toThrow();
    });

    test('Comandos individuales con letras inválidas', () => {
        expect(() => interceptCommand('Z300')).toThrow();
        expect(() => interceptCommand('123')).toThrow();
    });

    test('Comandos múltiples válidos', () => {
        const result = interceptCommand('A300,B250,C400');
        expect(result.type).toBe('multiple');
        expect(result.angles).toEqual({ A: 45, B: 38.6, C: 63.3 });
        expect(result.description).toContain('A a 45°');
        expect(result.description).toContain('B a 38.6°');
        expect(result.description).toContain('C a 63.3°');
    });

    test('Comandos compuestos (presets)', () => {
        expect(interceptCommand('O')).toEqual({
            type: 'preset',
            preset: 'O',
            angles: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
            description: 'Abre todos los dedos de la mano'
        });
        expect(interceptCommand('P')).toEqual({
            type: 'preset',
            preset: 'P',
            angles: { A: 0, B: 0, C: 0, D: 70, E: 0, F: 80 },
            description: 'Gesto de pinza (dedo medio y pulgar flexionados)'
        });
        expect(interceptCommand('R')).toEqual({
            type: 'preset',
            preset: 'R',
            angles: { A: 80, B: 85, C: 95, D: 0, E: 0, F: 0 },
            description: 'Gesto de Spiderman'
        });
    });

    test('Comandos especiales', () => {
        expect(interceptCommand('S')).toEqual({
            type: 'special',
            action: 'S',
            description: 'Detener los motores'
        });
        expect(interceptCommand('X')).toEqual({
            type: 'special',
            action: 'X',
            description: 'Calibración'
        });
        expect(interceptCommand('I')).toEqual({
            type: 'special',
            action: 'I',
            description: 'Inicializar Motor Shields'
        });
    });
});

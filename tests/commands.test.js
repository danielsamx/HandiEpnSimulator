const request = require('supertest');
const app = require('../server');

describe('API de Comandos (POST /command)', () => {
    test('Debe procesar comando individual con éxito', async () => {
        const res = await request(app)
            .post('/command')
            .send({ command: 'A300' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.type).toBe('individual');
        expect(res.body.data.angle).toBe(45);
    });

    test('Debe procesar preset con éxito', async () => {
        const res = await request(app)
            .post('/command')
            .send({ command: 'O' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.type).toBe('preset');
        expect(res.body.data.angles.A).toBe(0);
    });

    test('Debe devolver 400 para comando inválido', async () => {
        const res = await request(app)
            .post('/command')
            .send({ command: 'Z999' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBeDefined();
    });

    test('Debe devolver 400 si falta el parámetro command', async () => {
        const res = await request(app)
            .post('/command')
            .send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });
});

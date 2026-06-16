const express = require('express');
const cors = require('cors');
const path = require('path');
const { interceptCommand } = require('./parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para procesar los comandos de la mano robótica
app.post('/command', (req, res) => {
    const { command } = req.body;
    if (command === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Falta el parámetro "command" en la solicitud.'
        });
    }
    
    try {
        const result = interceptCommand(command);
        res.json({
            success: true,
            type: result.type,
            data: result
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

// Ruta fallback para el simulador de una sola página
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor solo si no estamos en entorno de pruebas (Jest)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor del simulador de la mano robótica ejecutándose en http://localhost:${PORT}`);
    });
}

module.exports = app; // Exportar para supertest

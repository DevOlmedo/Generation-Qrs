const express = require('express');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const PORT = 3000;
const TOKEN = process.env.SECRET_TOKEN || 'mi-token-seguro';

// Cargar rutas iniciales desde archivo estático
let rutas = {};
try {
    rutas = require('./rutas.json');
} catch (error) {
    console.warn('No se pudo cargar rutas.json. Usando objeto vacío.');
    rutas = {};
}

app.use(express.json());
app.use('/qrs', express.static(path.join(__dirname, 'public/qrs')));

// Middleware de seguridad
function validarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token !== `Bearer ${TOKEN}`) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
}

// Crear QR dinámico
app.post('/crear', validarToken, async (req, res) => {
    const { nombre, destino } = req.body;
    if (!nombre || !destino) {
        return res.status(400).json({ error: 'Faltan datos: nombre y destino' });
    }

    rutas[nombre] = destino;

    const urlIntermedia = `https://olmedoapp.vercel.app/r/${nombre}`;
    const svg = await QRCode.toString(urlIntermedia, { type: 'svg' });

    // No se guarda el SVG en disco en Vercel
    res.json({ mensaje: 'QR dinámico creado', svg, destino });
});

// Redirección dinámica
app.get('/r/:nombre', (req, res) => {
    const { nombre } = req.params;
    const destino = rutas[nombre];
    if (!destino) {
        return res.status(404).send('QR no encontrado o sin destino asignado.');
    }
    res.redirect(destino);
});

// Actualizar destino
app.put('/actualizar/:nombre', validarToken, (req, res) => {
    const { nombre } = req.params;
    const { nuevoDestino } = req.body;

    if (!rutas[nombre]) {
        return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    rutas[nombre] = nuevoDestino;
    res.json({ mensaje: 'Destino actualizado', nombre, nuevoDestino });
});

// Eliminar ruta
app.delete('/eliminar/:nombre', validarToken, (req, res) => {
    const { nombre } = req.params;

    if (!rutas[nombre]) {
        return res.status(404).json({ error: 'Ruta no existe' });
    }

    delete rutas[nombre];
    res.json({ mensaje: 'Ruta eliminada', nombre });
});

// Listar rutas
app.get('/listar', validarToken, (req, res) => {
    res.json(rutas);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
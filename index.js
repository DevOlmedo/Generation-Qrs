const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Servir archivos estáticos (QRs)
app.use('/qrs', express.static(path.join(__dirname, 'public/qrs')));

// Cargar rutas existentes (si las hubiera)
let rutas = {};
if (fs.existsSync('rutas.json')) {
    rutas = JSON.parse(fs.readFileSync('rutas.json', 'utf8'));
}

// Endpoint para crear un nuevo QR
app.post('/crear', async (req, res) => {
    const { nombre, destino } = req.body;
    if (!nombre || !destino) {
        return res.status(400).json({ error: 'Faltan datos: nombre y destino' });
    }

    // Guardar la ruta
    rutas[nombre] = destino;
    fs.writeFileSync('rutas.json', JSON.stringify(rutas, null, 2));

    // Generar el QR como SVG
    const svg = await QRCode.toString(destino, { type: 'svg' });
    const qrPath = path.join(__dirname, `public/qrs/${nombre}.svg`);
    fs.writeFileSync(qrPath, svg);

    res.json({ mensaje: 'QR SVG creado', url_qr: `/qrs/${nombre}.svg`, destino });
});

// Endpoint para redirigir
app.get('/r/:nombre', (req, res) => {
    const { nombre } = req.params;
    const destino = rutas[nombre];
    if (!destino) {
        return res.status(404).send('QR no encontrado o sin destino asignado.');
    }
    res.redirect(destino);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

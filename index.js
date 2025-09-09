require('dotenv').config();

const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;
const TOKEN = process.env.SECRET_TOKEN || 'mi-token-seguro';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use('/qrs', express.static(path.join(__dirname, 'public/qrs')));

// 🔐 Middleware de seguridad
function validarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token !== `Bearer ${TOKEN}`) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
}

// 🏠 Endpoint raíz
app.get('/', (req, res) => {
    res.send('🛠️ Backend QR activo y conectado a Supabase');
});

// ➕ Crear QR dinámico
app.post('/crear', validarToken, async (req, res) => {
    const { nombre, destino } = req.body;
    if (!nombre || !destino) {
        return res.status(400).json({ error: 'Faltan datos: nombre y destino' });
    }

    const { error } = await supabase
        .from('rutas')
        .insert([{ nombre, destino }]);

    if (error) {
        return res.status(500).json({ error: 'Error al guardar en Supabase', detalle: error.message });
    }

    const urlIntermedia = `https://olmedoapp.vercel.app/r/${nombre}`;
    const svg = await QRCode.toString(urlIntermedia, { type: 'svg' });

    console.log(`📝 Ruta "${nombre}" creada con destino "${destino}"`);
    res.json({ mensaje: 'QR dinámico creado', svg, destino });
});

// 🔁 Redirección dinámica
app.get('/r/:nombre', async (req, res) => {
    const { nombre } = req.params;

    const { data, error } = await supabase
        .from('rutas')
        .select('destino')
        .eq('nombre', nombre)
        .single();

    if (error || !data) {
        console.log(`❌ Ruta "${nombre}" no encontrada`);
        return res.status(404).send('QR no encontrado o sin destino asignado.');
    }

    console.log(`➡️ Redirigiendo "${nombre}" a ${data.destino}`);
    res.redirect(data.destino);
});

// 🔄 Actualizar destino
app.put('/actualizar/:nombre', validarToken, async (req, res) => {
    const { nombre } = req.params;
    const { nuevoDestino } = req.body;

    if (!nuevoDestino) {
        return res.status(400).json({ error: 'Falta el nuevo destino' });
    }

    const { error } = await supabase
        .from('rutas')
        .update({ destino: nuevoDestino })
        .eq('nombre', nombre);

    if (error) {
        return res.status(500).json({ error: 'Error al actualizar destino', detalle: error.message });
    }

    console.log(`🔧 Ruta "${nombre}" actualizada a nuevo destino: ${nuevoDestino}`);
    res.json({ mensaje: 'Destino actualizado', nombre, nuevoDestino });
});

// 🗑️ Eliminar ruta
app.delete('/eliminar/:nombre', validarToken, async (req, res) => {
    const { nombre } = req.params;

    const { error } = await supabase
        .from('rutas')
        .delete()
        .eq('nombre', nombre);

    if (error) {
        return res.status(500).json({ error: 'Error al eliminar ruta', detalle: error.message });
    }

    console.log(`🗑️ Ruta "${nombre}" eliminada`);
    res.json({ mensaje: 'Ruta eliminada', nombre });
});

// 📋 Listar rutas activas
app.get('/listar', validarToken, async (req, res) => {
    const { data, error } = await supabase
        .from('rutas')
        .select('*');

    if (error) {
        return res.status(500).json({ error: 'Error al listar rutas', detalle: error.message });
    }

    console.log(`📦 Listando ${data.length} rutas activas`);
    res.json(data);
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Backend QR corriendo en http://localhost:${PORT}`);
});
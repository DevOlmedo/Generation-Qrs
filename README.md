# 🎯 Generador de QR Dinámico con Express

Este proyecto permite crear códigos QR que apuntan a una URL intermedia, la cual puede redirigirse dinámicamente a cualquier destino. Ideal para impresión profesional, donde el QR debe ser **permanente y editable**.

---

## 🚀 Características principales

- ✅ Códigos QR dinámicos
- 🔄 Redirección editable sin reimprimir
- 🔐 Seguridad con token tipo Bearer
- 🧰 CRUD completo para administrar rutas
- 🌐 Listo para deploy en Vercel (24/7)

---

## 📦 Dependencias usadas

- 📦 `express` – servidor backend
- 📦 `qrcode` – generación de códigos QR en SVG
- 📦 `fs` – manejo de archivos locales
- 📦 `path` – rutas absolutas para archivos

---

## ⚡ Instalación

```bash
npm install
```

---

## 🔐 Seguridad con token

Todos los endpoints sensibles requieren un token en el header:

```
Authorization: Bearer mi-token-seguro
```

Este token se define como variable de entorno: (`SECRET_TOKEN`) en el panel de configuración de Vercel.

---

## 🌐 Configuración de variables en Vercel

Para proteger tu API en producción:

1. Entrá a tu proyecto en vercel.com
2. Ir a **Settings > Environment Variables**
3. Agregá:
   - **Key:** SECRET_TOKEN
   - **Value:** mi-token-seguro (o el valor que elijas)
   - **Environment:** Production (y Preview si querés testear)

No necesitás usar `.env` ni instalar dotenv en Vercel.

---

## 🧪 Endpoints disponibles

| Método | Ruta                  | Descripción                       |
| ------ | --------------------- | --------------------------------- |
| POST   | `/crear`              | Crea un nuevo QR dinámico         |
| GET    | `/r/:nombre`          | Redirige al destino guardado      |
| PUT    | `/actualizar/:nombre` | Modifica el destino de un QR      |
| DELETE | `/eliminar/:nombre`   | Elimina una ruta QR               |
| GET    | `/listar`             | Muestra todas las rutas guardadas |

---

## 🧪 Ejemplos con curl

**Crear un QR**
```bash
curl -X POST https://tu-dominio.vercel.app/crear \
  -H "Authorization: Bearer mi-token-seguro" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"sanjose", "destino":"https://instagram.com/forja.gym.ok"}'
```

**Actualizar destino**
```bash
curl -X PUT https://tu-dominio.vercel.app/actualizar/sanjose \
  -H "Authorization: Bearer mi-token-seguro" \
  -H "Content-Type: application/json" \
  -d '{"nuevoDestino":"https://nuevo-link.com"}'
```

**Eliminar ruta**
```bash
curl -X DELETE https://tu-dominio.vercel.app/eliminar/sanjose \
  -H "Authorization: Bearer mi-token-seguro"
```

**Listar rutas**
```bash
curl -X GET https://tu-dominio.vercel.app/listar \
  -H "Authorization: Bearer mi-token-seguro"
```

---

## 🖨️ Para imprenta

- Exportá el QR como SVG desde `/qrs/:nombre.svg`
- Asegurate de que apunte a la URL intermedia (`/r/:nombre`)
- Podés cambiar el destino sin reimprimir el código

---

## 📦 Deploy en Vercel

1. Subí el proyecto a GitHub
2. Importalo en vercel.com
3. Configurá:
   - **Build Command:** `npm install`
   - **Framework Preset:** Express

4. Archivo `vercel.json` para rutas personalizadas:

```json
{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/r/(.*)", "dest": "index.js" },
    { "src": "/crear", "dest": "index.js" },
    { "src": "/actualizar/(.*)", "dest": "index.js" },
    { "src": "/eliminar/(.*)", "dest": "index.js" },
    { "src": "/listar", "dest": "index.js" },
    { "src": "/qrs/(.*)", "dest": "public/qrs/$1" }
  ]
}
```

5. Agregá la variable de entorno `SECRET_TOKEN`

---

## 🧠 Futuras mejoras

- 📊 Estadísticas de escaneo
- 🧱 Persistencia con Supabase o Firebase
- 🖥️ Panel visual para administrar rutas

---

Hecho con ❤️ por Joaquín Olmedo
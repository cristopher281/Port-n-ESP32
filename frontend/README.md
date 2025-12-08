
# Frontend — ESP32 IoT Dashboard

Este proyecto contiene la aplicación frontend (React + Vite) para la plataforma de monitoreo y control del portón ESP32.

## Requisitos

- Node.js 18+ y npm

## Instalación y ejecución (desarrollo)

```cmd
cd "c:\Users\DELL\OneDrive\Escritorio\Porton-ESP32\frontend"
npm install
npm run dev
```

## Variables de entorno (local)

Crear un archivo `.env` en `frontend/` con:

- `VITE_API_BASE` — URL base de la API (por ejemplo `http://localhost:3000/api`)
- `VITE_ADMIN_SECRET` — (solo para pruebas locales) token usado por el dashboard para encolar comandos. NO subir este valor al repositorio.

## Estructura breve

- `src/features/dashboard` — pantalla principal (botón de operación, estado)
- `src/services/api.js` — instancia axios utilizada por la app
- `src/components` — componentes UI reutilizables

## Documentación adicional

- Uso de la UI y explicación de cada control: `frontend/docs/USAGE.md`
- Comunicación entre Frontend / Backend / ESP32: `frontend/docs/COMMUNICATION.md`

## Seguridad

- En producción el frontend NO debe exponer `API_SECRET`. Implementar autenticación de usuarios (login + JWT) y roles (admin) antes de desplegar control en producción.

## Despliegue en Vercel

Instrucciones rápidas para desplegar el frontend en Vercel (SPA compilada por Vite):

- Sitúa el proyecto en Vercel y configura el `Root Directory` en `frontend` (si tu repo es monorepo).
- Comando de build: `npm run build`
- Directorio de salida: `dist`

Variables de entorno recomendadas en Vercel (Project Settings → Environment Variables):
- `VITE_API_BASE` = URL pública de tu API (por ejemplo `https://mi-backend.example.com/api`)

Archivo de configuración incluido: `frontend/vercel.json` — hará el deploy como sitio estático y aplica una regla de fallback para SPAs.

Pasos cortos:
1. Conecta el repositorio en vercel.com
2. En `Project Settings` configura `Root Directory` = `frontend`
3. Añade `VITE_API_BASE` en Environment Variables
4. Despliega (Vercel detectará `package.json` y ejecutará `npm run build`)

Notas:
- Si quieres desplegar también el backend en Vercel, habrá que adaptar las rutas de Express a funciones serverless (carpeta `/api`) o desplegar el backend por separado (Clever Cloud, DigitalOcean, etc.).
- No incluyas secretos en el código; usa las Environment Variables de Vercel.

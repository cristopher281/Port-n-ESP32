
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

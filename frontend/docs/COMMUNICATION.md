# Comunicación — Frontend / Backend / ESP32

Este documento explica cómo se comunican los componentes del sistema y qué endpoints se usan.

## Principios

- El frontend encola comandos (open/close) en el backend usando una llamada protegida por un token administrativo.
- El ESP32 no mantiene una conexión persistente: pollea periódicamente al backend para obtener comandos y luego confirma (ack).

Endpoints relevantes

- `POST /api/devices/:id/command` (Admin)
  - Descripción: encola un comando (`open`|`close`) para el dispositivo.
  - Headers: `Authorization: Bearer <API_SECRET_ADMIN>` (en desarrollo usamos `API_SECRET` del backend).
  - Body: `{ "command": "open" }`
  - Respuesta: objeto del comando con `id`, `device_id`, `command`, `status`.

- `GET /api/devices/:id/commands/poll` (Device)
  - Descripción: el ESP32 solicita el siguiente comando pendiente.
  - Headers: `Authorization: Bearer <DEVICE_API_TOKEN>` (token único por dispositivo, almacenado en la tabla `devices` como `api_token`).
  - Respuesta: comando pendiente (si existe) y backend lo marca `sent` para evitar replicados.

- `POST /api/devices/:id/commands/:cmdId/ack` (Device)
  - Descripción: el ESP32 confirma que ejecutó el comando.
  - Headers: `Authorization: Bearer <DEVICE_API_TOKEN>`
  - Body: opcional `{"result":"ok","info":{...}}`
  - Respuesta: comando actualizado (`status: acknowledged`).

- `GET /api/devices/:id/state` (Public)
  - Descripción: devuelve el estado lógico actual derivado del último comando ack.

- Endpoints de sensores (lecturas)
  - `POST /api/sensors/data` — ingestión desde ESP32 (requiere token de dispositivo)
  - `GET /api/sensors/latest/:deviceId` — obtener última lectura
  - `GET /api/sensors/history/:deviceId` — historial paginado

## Flujo típico (usuario presiona el botón)

1. Frontend (dashboard) envía `POST /api/devices/:id/command` con `Authorization: Bearer <ADMIN_SECRET>`.
2. Backend inserta fila en `device_commands` con `status = 'pending'`.
3. ESP32 pollea `GET /api/devices/:id/commands/poll` (cada X segundos).
4. Cuando backend devuelve un comando, lo marca `sent` y lo retorna al ESP32.
5. ESP32 ejecuta la acción (mueve relé, abre/cierra) y llama `POST /api/devices/:id/commands/:cmdId/ack`.
6. Backend marca `status = 'acknowledged'` y almacena metadatos si aplica.
7. Frontend consulta `GET /api/devices/:id/state` para mostrar estado actualizado.

## Seguridad y recomendaciones

- No usar el `API_SECRET` en el cliente en producción. En su lugar:
  - Implementa autenticación de usuarios (login + JWT).
  - Protege la ruta de enviar comandos con roles (admin).
- Usa HTTPS para todas las comunicaciones.
- Considera usar MQTT o WebSockets si necesitas push en tiempo real en lugar de polling.

## Ejemplos curl

Encolar comando (frontend/admin):

```bash
curl -X POST http://localhost:3000/api/devices/1/command \
  -H "Authorization: Bearer <API_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"command":"open"}'
```

ESP32 pide comando (poll):

```bash
curl -X GET http://localhost:3000/api/devices/1/commands/poll \
  -H "Authorization: Bearer esp32_sample_token_12345"
```

ESP32 confirma ejecución:

```bash
curl -X POST http://localhost:3000/api/devices/1/commands/123/ack \
  -H "Authorization: Bearer esp32_sample_token_12345" \
  -H "Content-Type: application/json" \
  -d '{"result":"ok"}'
```

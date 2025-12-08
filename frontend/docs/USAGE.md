# Guía de uso — Interfaz móvil

Este documento describe cada control de la pantalla principal y cómo usar la aplicación correctamente en móvil.

Pantalla principal (Mi Portón)

- Cabecera
  - Botón menú (izquierda): abre el menú lateral con opciones (Historial, Accesos, Perfil).
  - Título (centro): muestra el nombre de la app.
  - Botón ajustes (derecha): abre configuración de la aplicación.

- Indicador de estado
  - Icono de candado y texto grande: muestra el estado lógico del portón:
    - "Abierto": el último comando confirmado por el ESP32 fue `open`.
    - "Cerrado": el último comando confirmado fue `close`.
    - "Desconocido": no hay comando confirmado todavía.

- Botón principal (círculo central)
  - Comportamiento: mantener presionado con el dedo durante ~600ms para activar la acción.
  - Acción: alterna el estado (si está `Abierto` envía `close`, si está `Cerrado` envía `open`).
  - Feedback visual: el botón cambia estilo (amarillo) cuando el estado es `Abierto`.
  - Seguridad: la acción de encolar comando requiere un token admin (en desarrollo la app usa `VITE_ADMIN_SECRET`). En producción NO guardar secreto en el cliente.

- Texto de ayuda
  - "Mantén presionado para operar": instrucción clara para evitar activaciones accidentales.

- Barra inferior (navegación)
  - Inicio: vuelve a esta pantalla.
  - Historial: abre listado de lecturas y registros de apertura/cierre.
  - Accesos: gestión de usuarios/credenciales (por implementar según requisitos).
  - Perfil: configuración personal del usuario.

## Buenas prácticas de uso

- Asegúrate de tener conexión estable antes de operar el portón.
- Para pruebas locales, configura `VITE_ADMIN_SECRET` que coincida con `API_SECRET` del backend.
- No compartir dispositivos con acceso administrativo en producción.

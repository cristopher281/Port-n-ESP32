#  Guía de Despliegue en Vercel

Esta guía detalla paso a paso cómo subir tu proyecto **Porton-ESP32** a Vercel. Al ser un proyecto "Monorepo" (Frontend + Backend en la misma carpeta), ya hemos configurado todo para que funcione automáticamente.

##  Requisitos Previos

1.  Una cuenta en [GitHub](https://github.com/).
2.  Una cuenta en [Vercel](https://vercel.com/) (puedes entrar con tu cuenta de GitHub).
3.  Tu código subido a un repositorio de GitHub.
4.  Tus credenciales de base de datos (Clever Cloud MySQL o similar).

---

##  Paso 1: Preparar el Proyecto

Asegúrate de que tienes los siguientes archivos clave en tu proyecto (ya deberían estar creados):
- `/vercel.json`: Configura las rutas para que el Frontend y Backend funcionen juntos.
- `/backend/api/index.js`: El adaptador para que el backend funcione en la nube.

Sube estos cambios a GitHub:
```bash
git add .
git commit -m "Preparar para Vercel"
git push origin main
```

---

##  Paso 2: Importar en Vercel

1.  Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard).
2.  Haz clic en el botón **"Add New..."** y selecciona **"Project"**.
3.  Busca tu repositorio `Porton-ESP32` y haz clic en **"Import"**.

### Configuración del Proyecto
Vercel detectará automáticamente muchas cosas, pero verifica lo siguiente:

- **Framework Preset**: Debe decir `Vite` (para el frontend).
- **Root Directory**: Déjalo en `./` (la raíz).
- **Build Command**: Déjalo como está (Vercel usará `npm run build` del frontend).
- **Output Directory**: Déjalo como está (`dist`).

---

##  Paso 3: Variables de Entorno

**IMPORTANTE**: Esta es la parte crítica. Tu backend necesita saber cómo conectarse a la base de datos.

En la pantalla de configuración (o en *Settings > Environment Variables* después), agrega las siguientes variables una por una:

| Nombre Variable | Valor (Ejemplo) | Descripción |
| :--- | :--- | :--- |
| `DB_HOST` | `ue394...clever-cloud.com` | Host de tu MySQL |
| `DB_USER` | `u392...` | Usuario de MySQL |
| `DB_PASSWORD` | `x820...` | Contraseña de MySQL |
| `DB_NAME` | `be45...` | Nombre de la base de datos |
| `DB_PORT` | `3306` | Puerto (usualmente 3306) |
| `JWT_SECRET` | `mi_secreto_seguro` | Para encriptar tokens |
| `ADMIN_SECRET` | `admin123` | Contraseña maestra opcional |
| `NODE_ENV` | `production` | Modo producción |

---

##  Paso 4: Desplegar

1.  Haz clic en **"Deploy"**.
2.  Espera unos minutos. Vercel construirá tu Frontend y preparará las funciones del Backend.
3.  ¡Listo! Verás una pantalla de felicitaciones con la URL de tu proyecto.
    - Ejemplo: `https://porton-esp32-tu-usuario.vercel.app`

---

##  Paso 5: Verificación

1.  **Backend**:
    - Ve a `https://[TU-URL].vercel.app/api/health`
    - Deberías ver un mensaje JSON: `{"status":"ok", ...}`. Si ves esto, ¡el backend está vivo!
2.  **Frontend**:
    - Ve a la página principal `https://[TU-URL].vercel.app`.
    - Debería cargar el login o el dashboard.

---

##  Paso 6: Conectar el ESP32

Ahora que tienes tu URL pública, es hora de actualizar el ESP32.

1.  Abre el archivo `firmware/main/main.ino` en tu Arduino IDE.
2.  Busca la línea:
    ```cpp
    const char* serverUrl = "http://...";
    ```
3.  Cámbiala por tu nueva URL de Vercel + `/api`:
    ```cpp
    const char* serverUrl = "https://porton-esp32-tu-usuario.vercel.app/api";
    ```
4.  Carga el código a tu placa ESP32.

---

##  Solución de Problemas Comunes

**Error 404 en `/api/...`**
- Revisa el archivo `vercel.json` en la raíz.
- Asegúrate de que las variables de entorno están bien escritas.

**Error "Database connection failed"**
- Verifica que tu base de datos (Clever Cloud/Railway/etc.) permite conexiones remotas desde cualquier IP (0.0.0.0/0), ya que las IPs de Vercel cambian constantemente.

**El Frontend no carga datos**
- Abre la consola del navegador (F12). Si ves errores de "CORS" o "Network Error", verifica que el `serverUrl` en el frontend esté apuntando a la dirección correcta (automático si usas `/api` relativo).

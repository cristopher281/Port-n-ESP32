# Documentación de Hardware y Firmware - Portón ESP32

Esta guía detalla cómo conectar los componentes electrónicos y cargar el código en el microcontrolador ESP32 para que funcione con el sistema de control de portones.

## 1. Lista de Materiales

*   **ESP32 DevKit V1** (Placa de desarrollo)
*   **Sensor PIR (HC-SR501)**: Para detección de movimiento.
*   **Sensor de Ultrasonido (HC-SR04)**: Para medir distancia de vehículos/objetos.
*   **Servo Motor (SG90 o MG996R)**: Para simular o accionar el mecanismo del portón (180 grados).
*   **Cables Jumper** (Macho-Hembra, Macho-Macho).
*   **Protoboard** (opcional, para pruebas).
*   **Fuente de alimentación externa** (5V): *Recomendada para el servo, ya que el USB del ESP32 puede no tener suficiente potencia.*

## 2. Diagrama de Conexiones

Conecta los componentes al ESP32 siguiendo este esquema de pines (GPIO):

| Componente | Pin Componente | Pin ESP32 (GPIO) | Notas |
| :--- | :--- | :--- | :--- |
| **Servo Motor** | Señal (Naranja/Amarillo) | **GPIO 13** | Pin PWM |
| | VCC (Rojo) | 5V (VIN) o Fuente Externa (+) | **¡Cuidado!** Usa fuente externa si es un servo grande. Connecta GND común. |
| | GND (Marrón/Negro) | GND | Común con el ESP32 |
| **HC-SR04** | VCC | 5V (VIN) | |
| (Distancia) | TRIG | **GPIO 26** | Salida (ESP -> Sensor) |
| | ECHO | **GPIO 25** | Entrada (Sensor -> ESP) |
| | GND | GND | |
| **PIR** | VCC | 5V (VIN) o 3.3V | Depende del módulo, la mayoría funcionan bien con 5V |
| (Movimiento) | OUT / Data | **GPIO 27** | Entrada Digital |
| | GND | GND | |

> **Nota sobre Seguridad (Obstrucciones):** El firmware incluye lógica para que el portón **NO se cierre** si el sensor de distancia detecta un objeto a menos de 20cm. Asegúrate de apuntar el HC-SR04 hacia el área de paso.

## 3. Preparación del Firmware

El código fuente se encuentra en la carpeta `firmware/PortonESP32`.

### Requisitos Previos (Arduino IDE)

1.  Descarga e instala [Arduino IDE](https://www.arduino.cc/en/software).
2.  **Instalar Placas ESP32**:
    *   Ve a *File > Preferences*.
    *   En "Additional Board Manager URLs" pega: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
    *   Ve a *Tools > Board > Boards Manager*, busca "esp32" e instala la versión de Espressif Systems.
3.  **Instalar Librerías**:
    *   Ve a *Tools > Manage Libraries...*
    *   Busca e instala:
        *   `ArduinoJson` (por Benoit Blanchon) - Versión 6.x o 7.x
        *   `ESP32Servo` (por Kevin Harrington)

### Configuración del Archivo `secrets.h`

Para que el ESP32 se conecte a tu red y al servidor, necesitas editar el archivo `firmware/PortonESP32/secrets.h`. Si no existe, créalo junto al archivo `.ino`.

#### Paso 1: Configurar WiFi (`WIFI_SSID` y `WIFI_PASS`)
*   **WIFI_SSID**: Es el nombre exacto de tu red WiFi (ej. "Familia_Perez").
*   **WIFI_PASS**: La contraseña de esa red.

> **¿Cambió tu red WiFi?**
> Si cambias de router o contraseña, **debes editar este archivo** con los nuevos datos y **volver a cargar el código** (repetir el paso "Cargar el Código") en el ESP32. El ESP32 no tiene forma de saber la nueva clave automáticamente.

#### Paso 2: Configurar IP del Servidor (`API_BASE_URL`)
El ESP32 necesita la dirección IP de tu computadora (donde corre el backend) dentro de la red local. **No uses "localhost"**, ya que para el ESP32, "localhost" sería él mismo.

**Cómo obtener tu IP:**
1.  **Windows**: Abre la terminal (CMD o PowerShell) y escribe `ipconfig`. Busca el adaptador "Wi-Fi" (o Ethernet si usas cable) y copia la dirección **IPv4** (ej. `192.168.1.15`).
        *   `WiFiManager` (por **tzapu**) - *¡Esencial para configuración WiFi fácil!*

### Configuración Inicial (¡Sin código!)

¡Ya no necesitas editar el código cada vez! El firmware ahora crea su propia red WiFi para que lo configures desde tu celular.

### Cargar el Código por Primera Vez

1.  Abre `firmware/PortonESP32/PortonESP32.ino`.
2.  Conecta el ESP32 por USB al PC.
3.  Selecciona la placa: *Tools > Board > DOIT ESP32 DEVKIT V1* (o similar).
4.  Selecciona el puerto COM correcto.
5.  Sube el código a tu ESP32 con el botón **Upload** (Flecha derecha).
    *   *Tip: Si falla conectando ("Connecting..."), mantén presionado el botón "BOOT" en el ESP32 hasta que empiece a cargar.*
6.  Abre el **Serial Monitor** (115200 baudios). Verás que dice: "Iniciando WiFiManager...".

## 4. Configuración vía Portal WiFi (Paso a Paso)

Cuando el ESP32 no encuentra una red conocida (o es la primera vez), creará un Punto de Acceso.

1.  Busca en tu celular o laptop una red WiFi llamada **`Porton-Config`**.
2.  Conéctate a ella (no tiene clave o es una abierta por defecto).
3.  Automáticamente debería abrirse un navegador ("Iniciar sesión en la red"). Si no, abre tu navegador y ve a `192.168.4.1`.
4.  Verás un menú. Toca **"Configure WiFi"**.
5.  **Selecciona tu red WiFi** de la lista.
6.  Escribe la contraseña de tu WiFi.
7.  **Campos Personalizados**:
    *   `API Base URL`: Pon la IP de tu PC (ej. `http://192.168.1.15:3000/api`).
    *   `Device Token (JWT)`: Pega el token largo que te dio el sistema al crear el dispositivo.
    *   `Device ID`: El número ID del dispositivo (ej. `1`).
8.  Dale a **Save**.
9.  El ESP32 se reiniciará y se conectará automáticamente a tu WiFi con los datos que le diste.

> **¿Necesitas cambiar algo después?**
> Si cambias de router o de IP:
> *   El ESP32 no encontrará la red antigua y volverá a crear la red `Porton-Config`.
> *   Opcionalmente, puedes conectar un botón entre **GND** y el pin **GPIO 4**. Si lo mantienes presionado al encender el ESP32, borrará toda la configuración.

## 5. Probando el Sistema

1.  Asegúrate que el **Backend** esté corriendo (`npm run dev` en la carpeta backend) y que tu PC y el ESP32 estén en la misma red WiFi.
2.  En el Serial Monitor del Arduino IDE, deberías ver "WiFi Conectado!".
3.  Prueba pasar la mano frente al **PIR**: Deberías ver logs de "Sensor motion enviado".
4.  Desde la Aplicación Web (o Postman), envía un comando de "Abrir" al dispositivo.
5.  El ESP32 debería recibir el comando en menos de 2 segundos (intervalo de polling), mover el servo a 90° y responder con un ACK al servidor.

## Problemas Comunes

*   **Error de conexión HTTP (-1)**: Generalmente significa que el ESP32 no puede alcanzar la IP del servidor.
    *   Verifica que el Firewall de Windows permita conexiones entrantes a Node.js (puerto 3000).
    *   Verifica que la IP en la configuración de WiFiManager sea la correcta de tu PC, no localhost.
*   **Servo hace ruido pero no se mueve**: Falta de corriente. Usa una fuente de 5V externa (uniendo las tierras/GND).
*   **No veo la red Porton-Config**: Reinicia el ESP32. Asegúrate que no haya guardado una red anterior válida.
*   **Captive Portal no abre**: Escribe manualmente `192.168.4.1` en Chrome/Safari.

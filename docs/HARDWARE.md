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

### Configuración

1.  Abre el archivo `firmware/PortonESP32/PortonESP32.ino`.
2.  Verás una pestaña o archivo adjunto llamado `secrets.h`. Si no está, créalo en la misma carpeta.
3.  Edita `secrets.h` con tus datos:

```cpp
// secrets.h

const char* WIFI_SSID = "NOMBRE_DE_TU_WIFI";
const char* WIFI_PASS = "CONTRASEÑA_WIFI";

// IP de tu computadora donde corre el backend.
// IMPORTANTE: No uses "localhost". Usa la IP de red (ej. 192.168.1.15)
const char* API_BASE_URL = "http://192.168.1.XX:3000/api"; 

// Token que obtienes al crear el dispositivo en la web o vía Postman.
const char* DEVICE_TOKEN = "eyJhbGciOiJIUzI1NiIs...";

const int DEVICE_ID = 1; // ID que corresponde en la base de datos
```

### Cargar el Código

1.  Conecta el ESP32 por USB al PC.
2.  Selecciona la placa: *Tools > Board > DOIT ESP32 DEVKIT V1* (o similar).
3.  Selecciona el puerto COM correcto.
4.  Dale al botón de **Upload** (Flecha derecha).
    *   *Tip: Si falla conectando ("Connecting..."), mantén presionado el botón "BOOT" en el ESP32 hasta que empiece a cargar.*
5.  Abre el **Serial Monitor** (115200 baudios) para ver los logs de conexión y depuración.

## 4. Probando el Sistema

1.  Asegúrate que el **Backend** esté corriendo (`npm run dev` en la carpeta backend) y que tu PC y el ESP32 estén en la misma red WiFi.
2.  En el Serial Monitor del Arduino IDE, deberías ver "WiFi Conectado!".
3.  Prueba pasar la mano frente al **PIR**: Deberías ver logs de "Sensor motion enviado".
4.  Desde la Aplicación Web (o Postman), envía un comando de "Abrir" al dispositivo.
5.  El ESP32 debería recibir el comando en menos de 2 segundos (intervalo de polling), mover el servo a 90° y responder con un ACK al servidor.

## Problemas Comunes

*   **Error de conexión HTTP (-1)**: Generalmente significa que el ESP32 no puede alcanzar la IP del servidor.
    *   Verifica que el Firewall de Windows permita conexiones entrantes a Node.js (puerto 3000).
    *   Verifica que la IP en `secrets.h` sea la correcta de tu PC, no localhost.
*   **Servo hace ruido pero no se mueve**: Falta de corriente. Usa una fuente de 5V externa (uniendo las tierras/GND).

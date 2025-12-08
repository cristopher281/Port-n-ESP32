# API Documentation - Portón ESP32

Esta documentación detalla todos los endpoints del backend, cómo funcionan, qué datos esperan recibir y cómo responden.

## Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Autenticación](#autenticación)
- [Endpoints de Dispositivos](#endpoints-de-dispositivos)
- [Endpoints de Sensores](#endpoints-de-sensores)
- [Formatos de Datos](#formatos-de-datos)
- [Códigos de Respuesta](#códigos-de-respuesta)
- [Ejemplos desde ESP32](#ejemplos-desde-esp32)

---

## Arquitectura General

### Stack Tecnológico

- **Framework**: Express.js (Node.js)
- **Base de Datos**: MySQL
- **Autenticación**: Token-based (para ESP32)
- **Validación**: express-validator
- **Seguridad**: Helmet, CORS

### Flujo de Datos

```mermaid
graph LR
    A[ESP32] -->|JSON + Token| B[Backend API]
    B -->|Valida| C[Middleware]
    C -->|Procesa| D[Controller]
    D -->|Guarda| E[MySQL Database]
    F[Frontend] -->|HTTP Request| B
    B -->|JSON Response| F
    E -->|Consulta| D
```

### URL Base

```
http://localhost:3000/api
```

> **Producción**: La URL base cambiará según el deployment (Render, etc.)

---

## Autenticación

### Headers Requeridos

Para que el ESP32 pueda enviar datos, debe incluir el token de autenticación:

```http
Authorization: Bearer YOUR_DEVICE_TOKEN
Content-Type: application/json
```

### Obtener Token

Los tokens se generan al crear un dispositivo y se almacenan en la base de datos. El ESP32 debe configurarse con este token.

---

## Endpoints de Dispositivos

### 1. Obtener Todos los Dispositivos

**GET** `/api/devices`

Obtiene la lista de todos los dispositivos registrados.

#### Request

```http
GET /api/devices HTTP/1.1
Host: localhost:3000
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "ESP32-Portón-Principal",
      "location": "Entrada Principal",
      "device_type": "gate_controller",
      "is_active": 1,
      "created_at": "2025-12-08T12:00:00Z",
      "updated_at": "2025-12-08T12:00:00Z"
    }
  ]
}
```

---

### 2. Obtener Dispositivo por ID

**GET** `/api/devices/:id`

Obtiene la información de un dispositivo específico.

#### Request

```http
GET /api/devices/1 HTTP/1.1
Host: localhost:3000
```

#### Validación

- `id`: Debe ser un entero positivo (≥ 1)

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Device retrieved successfully",
  "data": {
    "id": 1,
    "name": "ESP32-Portón-Principal",
    "location": "Entrada Principal",
    "device_type": "gate_controller",
    "is_active": 1,
    "created_at": "2025-12-08T12:00:00Z",
    "updated_at": "2025-12-08T12:00:00Z"
  }
}
```

#### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Device not found"
}
```

---

### 3. Crear Nuevo Dispositivo

**POST** `/api/devices`

Crea un nuevo dispositivo en el sistema.

#### Request

```http
POST /api/devices HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "ESP32-Portón-Secundario",
  "location": "Entrada Trasera",
  "device_type": "gate_controller"
}
```

#### Campos Requeridos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del dispositivo (requerido) |
| `location` | string | Ubicación física (opcional) |
| `device_type` | string | Tipo de dispositivo (opcional) |

#### Validación

- `name`: String no vacío (requerido)
- `location`: String (opcional)
- `device_type`: String (opcional)

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Device created successfully",
  "data": {
    "id": 2,
    "name": "ESP32-Portón-Secundario",
    "location": "Entrada Trasera",
    "device_type": "gate_controller",
    "is_active": 1,
    "created_at": "2025-12-08T13:00:00Z",
    "updated_at": "2025-12-08T13:00:00Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **IMPORTANTE**: Guarda el `token` retornado. El ESP32 lo necesitará para autenticarse.

---

### 4. Actualizar Dispositivo

**PUT** `/api/devices/:id`

Actualiza la información de un dispositivo existente.

#### Request

```http
PUT /api/devices/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "ESP32-Portón-Principal-Actualizado",
  "location": "Entrada Norte"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "id": 1,
    "name": "ESP32-Portón-Principal-Actualizado",
    "location": "Entrada Norte",
    "device_type": "gate_controller",
    "is_active": 1,
    "updated_at": "2025-12-08T14:00:00Z"
  }
}
```

---

### 5. Eliminar/Desactivar Dispositivo

**DELETE** `/api/devices/:id`

Desactiva un dispositivo (soft delete - marca `is_active = 0`).

#### Request

```http
DELETE /api/devices/1 HTTP/1.1
Host: localhost:3000
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Device deactivated successfully",
  "data": null
}
```

---

## Endpoints de Sensores

### 1. Enviar Datos de Sensores (ESP32)

**POST** `/api/sensors/data`

**Endpoint principal** que utiliza el ESP32 para enviar lecturas de sensores.

#### Request

```http
POST /api/sensors/data HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "device_id": 1,
  "sensor_type": "temperature",
  "value": 25.5,
  "unit": "°C",
  "metadata": {
    "battery_level": 85,
    "signal_strength": -45
  }
}
```

#### Campos Requeridos

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `device_id` | integer | ID del dispositivo | ≥ 1 |
| `sensor_type` | string | Tipo de sensor | No vacío |
| `value` | float | Valor de la lectura | Numérico |
| `unit` | string | Unidad de medida | Opcional |
| `metadata` | object | Datos adicionales | Opcional |

#### Middleware Aplicado

1. **authenticateToken**: Verifica el token de autenticación
2. **verifyDeviceToken**: Verifica que el token pertenece a un dispositivo válido
3. **validateSensorData**: Valida el formato de los datos

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Sensor data saved successfully",
  "data": {
    "id": 1234,
    "device_id": 1,
    "sensor_type": "temperature",
    "value": 25.5,
    "unit": "°C",
    "metadata": {
      "battery_level": 85,
      "signal_strength": -45
    },
    "timestamp": "2025-12-08T15:30:00Z"
  }
}
```

#### Response (400 Bad Request) - Validación Fallida

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Valid device_id required",
      "param": "device_id",
      "location": "body"
    }
  ]
}
```

#### Response (401 Unauthorized) - Token Inválido

```json
{
  "success": false,
  "message": "Invalid or missing token"
}
```

---

### 2. Obtener Última Lectura

**GET** `/api/sensors/latest/:deviceId`

Obtiene la lectura más reciente de un dispositivo, opcionalmente filtrada por tipo de sensor.

#### Request

```http
GET /api/sensors/latest/1?sensor_type=temperature HTTP/1.1
Host: localhost:3000
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `sensor_type` | string | Tipo de sensor a filtrar | No |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Latest reading retrieved successfully",
  "data": {
    "id": 1234,
    "device_id": 1,
    "sensor_type": "temperature",
    "value": 25.5,
    "unit": "°C",
    "metadata": {
      "battery_level": 85
    },
    "timestamp": "2025-12-08T15:30:00Z"
  }
}
```

#### Response (404 Not Found)

```json
{
  "success": false,
  "message": "No readings found for this device"
}
```

---

### 3. Obtener Todas las Últimas Lecturas

**GET** `/api/sensors/all-latest/:deviceId`

Obtiene la última lectura de cada tipo de sensor para un dispositivo.

#### Request

```http
GET /api/sensors/all-latest/1 HTTP/1.1
Host: localhost:3000
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Latest readings retrieved successfully",
  "data": [
    {
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2025-12-08T15:30:00Z"
    },
    {
      "sensor_type": "humidity",
      "value": 65.0,
      "unit": "%",
      "timestamp": "2025-12-08T15:30:00Z"
    },
    {
      "sensor_type": "motion",
      "value": 1,
      "unit": "boolean",
      "timestamp": "2025-12-08T15:25:00Z"
    }
  ]
}
```

---

### 4. Obtener Historial de Lecturas

**GET** `/api/sensors/history/:deviceId`

Obtiene el historial de lecturas con soporte de paginación y filtros.

#### Request

```http
GET /api/sensors/history/1?limit=50&offset=0&sensor_type=temperature&start_date=2025-12-07T00:00:00Z&end_date=2025-12-08T23:59:59Z HTTP/1.1
Host: localhost:3000
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default | Validación |
|-----------|------|-------------|---------|------------|
| `limit` | integer | Máximo de resultados | 100 | 1-1000 |
| `offset` | integer | Desplazamiento | 0 | ≥ 0 |
| `sensor_type` | string | Filtro por tipo | - | - |
| `start_date` | ISO8601 | Fecha inicial | - | ISO8601 |
| `end_date` | ISO8601 | Fecha final | - | ISO8601 |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Historical data retrieved successfully",
  "data": [
    {
      "id": 1234,
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2025-12-08T15:30:00Z"
    },
    {
      "id": 1233,
      "sensor_type": "temperature",
      "value": 25.2,
      "unit": "°C",
      "timestamp": "2025-12-08T15:00:00Z"
    }
  ],
  "pagination": {
    "total": 452,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 5. Obtener Estadísticas

**GET** `/api/sensors/stats/:deviceId`

Obtiene estadísticas (promedio, mínimo, máximo) de un sensor en un período.

#### Request

```http
GET /api/sensors/stats/1?sensor_type=temperature&hours=24 HTTP/1.1
Host: localhost:3000
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default | Requerido |
|-----------|------|-------------|---------|-----------|
| `sensor_type` | string | Tipo de sensor | - | **Sí** |
| `hours` | integer | Horas hacia atrás | 24 | No |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "sensor_type": "temperature",
    "period_hours": 24,
    "statistics": {
      "average": 25.3,
      "minimum": 22.1,
      "maximum": 28.5,
      "count": 288,
      "unit": "°C"
    },
    "device_id": 1,
    "calculated_at": "2025-12-08T16:00:00Z"
  }
}
```

#### Response (400 Bad Request) - Falta sensor_type

```json
{
  "success": false,
  "message": "sensor_type query parameter required"
}
```

---

## Formatos de Datos

### Estructura de Respuesta Estándar

Todas las respuestas siguen este formato:

```json
{
  "success": boolean,
  "message": string,
  "data": any | null
}
```

### Respuesta con Paginación

```json
{
  "success": true,
  "message": string,
  "data": array,
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

### Timestamps

Todos los timestamps usan formato **ISO 8601**:

```
2025-12-08T15:30:00Z
```

---

## Códigos de Respuesta

| Código | Significado | Cuándo se Usa |
|--------|-------------|---------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Validación fallida |
| `401` | Unauthorized | Token inválido o faltante |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error del servidor |

---

## Ejemplos desde ESP32

### Configuración WiFi y HTTP Client

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// Configuración Backend
const char* serverUrl = "http://192.168.1.100:3000/api/sensors/data";
const char* deviceToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

void setup() {
  Serial.begin(115200);
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}
```

### Enviar Lectura de Temperatura

```cpp
void enviarTemperatura(float temperatura) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Iniciar conexión
    http.begin(serverUrl);
    
    // Headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + deviceToken);
    
    // Crear JSON
    StaticJsonDocument<256> doc;
    doc["device_id"] = 1;
    doc["sensor_type"] = "temperature";
    doc["value"] = temperatura;
    doc["unit"] = "°C";
    
    // Metadata adicional
    JsonObject metadata = doc.createNestedObject("metadata");
    metadata["battery_level"] = 85;
    metadata["signal_strength"] = WiFi.RSSI();
    
    // Serializar a string
    String jsonData;
    serializeJson(doc, jsonData);
    
    // Enviar POST request
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Código de respuesta: " + String(httpResponseCode));
      Serial.println("Respuesta: " + response);
    } else {
      Serial.println("Error en la solicitud: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("WiFi desconectado!");
  }
}
```

### Enviar Múltiples Sensores

```cpp
void enviarDatosSensores(float temp, float humidity, bool motion) {
  // Temperatura
  enviarSensor(1, "temperature", temp, "°C");
  delay(100);
  
  // Humedad
  enviarSensor(1, "humidity", humidity, "%");
  delay(100);
  
  // Movimiento
  enviarSensor(1, "motion", motion ? 1.0 : 0.0, "boolean");
}

void enviarSensor(int deviceId, const char* type, float value, const char* unit) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + deviceToken);
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["sensor_type"] = type;
  doc["value"] = value;
  doc["unit"] = unit;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  int httpCode = http.POST(jsonData);
  Serial.printf("[%s] HTTP Code: %d\n", type, httpCode);
  
  http.end();
}
```

### Manejo de Errores y Reconexión

```cpp
void loop() {
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconectando WiFi...");
    WiFi.reconnect();
    delay(5000);
    return;
  }
  
  // Leer sensores
  float temperatura = leerTemperatura();
  
  // Enviar datos
  bool exito = enviarTemperatura(temperatura);
  
  if (!exito) {
    Serial.println("Reintentando en 5 segundos...");
    delay(5000);
  } else {
    // Esperar 10 segundos antes del próximo envío
    delay(10000);
  }
}
```

### Obtener IP del Backend en Red Local

Para que el ESP32 encuentre el backend en tu red local:

1. **En tu computadora**, ejecuta en el backend:
   ```bash
   npm run dev
   ```

2. **Encuentra tu IP local**:
   - Windows: `ipconfig` → buscar "IPv4 Address"
   - Linux/Mac: `ifconfig` → buscar "inet"

3. **Configura el ESP32**:
   ```cpp
   // Reemplaza con la IP de tu computadora
   const char* serverUrl = "http://192.168.1.XXX:3000/api/sensors/data";
   ```

---

## Health Check

### Verificar Estado del Servidor

**GET** `/health`

```http
GET /health HTTP/1.1
Host: localhost:3000
```

#### Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2025-12-08T16:00:00.000Z",
  "uptime": 3600.5
}
```

---

## Endpoint No Encontrado

Si se accede a un endpoint que no existe:

#### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

---

## Notas Importantes

> [!IMPORTANT]
> **Seguridad del Token**: El token del dispositivo debe guardarse de forma segura en el ESP32. No lo compartas públicamente.

> [!WARNING]
> **Límites de Tasa**: No envíes más de 1 solicitud por segundo desde el ESP32 para evitar sobrecarga del servidor.

> [!TIP]
> **Depuración**: Usa el endpoint `/health` para verificar que el servidor está funcionando antes de depurar problemas del ESP32.

---

## Resumen de Flujo ESP32 → Backend

```mermaid
sequenceDiagram
    participant ESP32
    participant WiFi
    participant Backend
    participant Database

    ESP32->>WiFi: Conectar
    WiFi-->>ESP32: IP Asignada
    
    ESP32->>ESP32: Leer Sensores
    
    ESP32->>Backend: POST /api/sensors/data<br/>{device_id, sensor_type, value}
    
    Backend->>Backend: Verificar Token
    Backend->>Backend: Validar Datos
    Backend->>Database: INSERT sensor_readings
    Database-->>Backend: OK
    
    Backend-->>ESP32: 201 Created<br/>{success: true, data: {...}}
    
    ESP32->>ESP32: delay(10000)
```

---

## Soporte

Para más información o problemas, revisa:
- [README.md](../README.md) - Documentación general del proyecto
- [Backend README](../backend/README.md) - Configuración del backend
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía de despliegue

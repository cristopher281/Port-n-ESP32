# Flujo de Datos: ESP32 → Backend

Esta documentación describe en detalle cómo el backend recibe, valida, procesa y almacena los datos enviados desde el ESP32.

## 📋 Tabla de Contenidos

- [Arquitectura de Capas](#arquitectura-de-capas)
- [Flujo Completo de una Petición](#flujo-completo-de-una-petición)
- [Capa de Middleware](#capa-de-middleware)
- [Capa de Controladores](#capa-de-controladores)
- [Capa de Servicios](#capa-de-servicios)
- [Ejemplos Paso a Paso](#ejemplos-paso-a-paso)

---

## Arquitectura de Capas

El backend sigue una arquitectura en capas que separa responsabilidades:

### Diagrama: Estructura de Capas del Sistema

**Este diagrama muestra** cómo se organiza el backend en capas separadas. Cada petición del ESP32 atraviesa todas estas capas de arriba hacia abajo, asegurando validación y seguridad en cada paso.

```mermaid
flowchart TB
    subgraph "Entrada"
        ESP[ESP32 Request]
    end
    
    subgraph "Capa de Routing"
        Router[Express Router]
    end
    
    subgraph "Capa de Middleware"
        Auth[Authentication]
        Valid[Validation]
        Error[Error Handling]
    end
    
    subgraph "Capa de Controladores"
        DevCtrl[deviceController]
        SensCtrl[sensorController]
    end
    
    subgraph "Capa de Servicios"
        DevSrv[deviceService]
        SensSrv[sensorService]
    end
    
    subgraph "Capa de Datos"
        DB[(MySQL Database)]
    end
    
    ESP --> Router
    Router --> Auth
    Auth --> Valid
    Valid --> Error
    Error --> DevCtrl
    Error --> SensCtrl
    DevCtrl --> DevSrv
    SensCtrl --> SensSrv
    DevSrv --> DB
    SensSrv --> DB
    
    style ESP fill:#e1f5ff,stroke:#0066cc
    style Router fill:#fff4e1,stroke:#ff9900
    style Auth fill:#ffe1e1,stroke:#ff3333
    style Valid fill:#ffe1e1,stroke:#ff3333
    style Error fill:#ffe1e1,stroke:#ff3333
    style DevCtrl fill:#fff4e1,stroke:#ff9900
    style SensCtrl fill:#fff4e1,stroke:#ff9900
    style DevSrv fill:#e1ffe1,stroke:#33cc33
    style SensSrv fill:#e1ffe1,stroke:#33cc33
    style DB fill:#f0e1ff,stroke:#9933ff
```

### Responsabilidades por Capa

| Capa | Responsabilidad | Archivos |
|------|-----------------|----------|
| **Router** | Mapea URLs a controladores | `routes/sensors.js`, `routes/devices.js` |
| **Middleware** | Autenticación, validación, manejo de errores | `middleware/auth.js`, `middleware/validate.js` |
| **Controller** | Maneja request/response, orquesta servicios | `controllers/sensorController.js` |
| **Service** | Lógica de negocio y acceso a datos | `services/sensorService.js` |
| **Database** | Queries SQL y conexión | `config/database.js` |

---

## Flujo Completo de una Petición

### Endpoint: POST /api/sensors/data

### Diagrama: Secuencia Completa de Validación

**Este diagrama muestra** el recorrido completo de una petición desde que el ESP32 envía datos hasta que recibe confirmación. Observa cómo cada middleware valida diferentes aspectos antes de procesar los datos.

```mermaid
sequenceDiagram
    autonumber
    participant ESP as ESP32
    participant R as Router
    participant A as Auth Middleware
    participant V as Validation Middleware
    participant C as Controller
    participant S as Service
    participant DB as MySQL
    
    Note over ESP: ESP32 envía datos de sensor
    ESP->>R: POST /api/sensors/data<br/>{device_id, sensor_type, value}
    
    Note over R,A: Paso 1: Autenticación
    R->>A: Verificar token
    A->>A: Extraer Bearer token
    
    alt Token válido
        A->>V: Token OK ✓
    else Token inválido/faltante
        A-->>ESP: 401 Unauthorized ✗
    end
    
    Note over V,DB: Paso 2: Verificar dispositivo
    V->>DB: SELECT * FROM devices<br/>WHERE token = ?
    DB-->>V: Datos del dispositivo
    
    alt Dispositivo existe
        V->>V: validateSensorData()
    else Dispositivo no existe
        V-->>ESP: 401 Unauthorized ✗
    end
    
    Note over V: Paso 3: Validar formato
    V->>V: Validar campos requeridos
    
    alt Validación exitosa
        V->>C: Datos válidos ✓
        Note over C,S: Paso 4: Procesar y guardar
        C->>S: saveSensorReading(data)
        S->>DB: INSERT INTO sensor_readings
        DB-->>S: insertId: 1234
        S-->>C: {id, device_id, value...}
        C-->>ESP: 201 Created ✓<br/>{success: true}
    else Validación fallida
        V-->>ESP: 400 Bad Request ✗<br/>{errors: [...]}
    end
```

**Explicación de pasos**:
1. **Authentication**: Verifica que el token existe y tiene formato correcto
2. **Device Verification**: Confirma que el dispositivo está registrado
3. **Data Validation**: Valida que los campos cumplan los requisitos
4. **Processing**: Guarda los datos en la base de datos

---

## Capa de Middleware

### 1. Authentication Middleware

**Archivo**: `src/middleware/auth.js`

#### Función: `authenticateToken(req, res, next)`

**Propósito**: Verificar que la petición incluye un token válido.

**Proceso**:

1. Extrae el token del header `Authorization`
2. Verifica que el formato sea `Bearer TOKEN`
3. Valida que el token no esté vacío
4. Pasa el token a `req.token` para uso posterior
5. Llama a `next()` si todo es válido

### Diagrama: Flujo de Autenticación

**Este diagrama muestra** el proceso paso a paso de cómo se extrae y valida el token de autenticación.

```mermaid
flowchart LR
    A[Request Headers] --> B{¿Tiene header<br/>Authorization?}
    B -->|No| C[❌ Error 401]
    B -->|Sí| D[Extraer token]
    D --> E{¿Formato<br/>Bearer TOKEN?}
    E -->|No| C
    E -->|Sí| F[Guardar en req.token]
    F --> G[✓ next]
    
    style C fill:#ff6b6b
    style G fill:#51cf66
```

**Código simplificado**:

```javascript
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    
    req.token = token;
    next();
}
```

---

#### Función: `verifyDeviceToken(req, res, next)`

**Propósito**: Verificar que el token pertenece a un dispositivo registrado y activo.

### Diagrama: Verificación de Dispositivo

**Este diagrama muestra** cómo se verifica que el token corresponde a un dispositivo real en la base de datos.

```mermaid
flowchart TD
    A[req.token] --> B[Consultar BD]
    B --> C{¿Dispositivo<br/>encontrado?}
    C -->|No| D[❌ 401 Invalid token]
    C -->|Sí| E{¿is_active = 1?}
    E -->|No| D
    E -->|Sí| F[Guardar deviceId<br/>en req.deviceId]
    F --> G[✓ next]
    
    style D fill:#ff6b6b
    style G fill:#51cf66
```

**Código simplificado**:

```javascript
export async function verifyDeviceToken(req, res, next) {
    try {
        const [devices] = await pool.query(
            'SELECT id, is_active FROM devices WHERE token = ? AND is_active = 1',
            [req.token]
        );
        
        if (devices.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid device token'
            });
        }
        
        req.deviceId = devices[0].id;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Token verification failed'
        });
    }
}
```

---

### 2. Validation Middleware

**Archivo**: `src/middleware/validate.js`

### Diagrama: Validación de Datos del Sensor

**Este diagrama muestra** qué campos se validan y qué reglas se aplican a cada uno.

```mermaid
flowchart TB
    Start[Recibir body] --> V1{device_id<br/>es entero ≥ 1?}
    V1 -->|No| Err[Agregar error]
    V1 -->|Sí| V2{sensor_type<br/>es string no vacío?}
    
    V2 -->|No| Err
    V2 -->|Sí| V3{value<br/>es numérico?}
    
    V3 -->|No| Err
    V3 -->|Sí| V4{unit es string?<br/>opcional}
    
    V4 --> V5{metadata es objeto?<br/>opcional}
    
    V5 --> Check{¿Hay errores?}
    Check -->|Sí| Fail[❌ 400 Bad Request<br/>Retornar lista de errores]
    Check -->|No| Pass[✓ next<br/>Continuar al controller]
    
    Err --> Check
    
    style Fail fill:#ff6b6b
    style Pass fill:#51cf66
```

**Validaciones aplicadas**:

```javascript
export const validateSensorData = [
    // device_id debe ser un entero ≥ 1
    body('device_id').isInt({ min: 1 }).withMessage('Valid device_id required'),
    
    // sensor_type debe ser string no vacío
    body('sensor_type').isString().trim().notEmpty().withMessage('sensor_type required'),
    
    // value debe ser numérico (int o float)
    body('value').isFloat().withMessage('Numeric value required'),
    
    // unit es opcional, pero si existe debe ser string
    body('unit').optional().isString().trim(),
    
    // metadata es opcional, pero si existe debe ser objeto JSON
    body('metadata').optional().isObject(),
    
    // Middleware que revisa los resultados
    validate
];
```

---

## Capa de Controladores

**Archivo**: `src/controllers/sensorController.js`

### Función: `submitSensorData(req, res)`

### Diagrama: Flujo del Controlador

**Este diagrama muestra** cómo el controlador orquesta el guardado de datos sin manejar detalles de la base de datos.

```mermaid
flowchart LR
    A[Request validado] --> B[Controller recibe]
    B --> C[Llamar a Service]
    C --> D[sensorService.saveSensorReading]
    D --> E[Esperar resultado]
    E --> F[Formatear respuesta]
    F --> G[successResponse]
    G --> H[Retornar 201 Created]
    
    D -.->|En caso de error| I[asyncHandler captura]
    I -.-> J[errorHandler middleware]
    
    style H fill:#51cf66
    style J fill:#ff6b6b
```

**Código**:

```javascript
export const submitSensorData = asyncHandler(async (req, res) => {
    // req.body ya está validado por el middleware
    const reading = await sensorService.saveSensorReading(req.body);
    
    successResponse(res, reading, 'Sensor data saved successfully', 201);
});
```

**El `asyncHandler` wrapper** captura automáticamente errores async:

```javascript
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
```

---

## Capa de Servicios

**Archivo**: `src/services/sensorService.js`

### Función: `saveSensorReading(data)`

### Diagrama: Guardado en Base de Datos

**Este diagrama muestra** cómo se transforma el objeto JavaScript a una query SQL y se guarda en MySQL.

```mermaid
flowchart TB
    A[Datos del sensor] --> B[Desestructurar campos]
    B --> C[device_id, sensor_type,<br/>value, unit, metadata]
    C --> D{¿metadata existe?}
    D -->|Sí| E[JSON.stringify]
    D -->|No| F[null]
    E --> G[Preparar parámetros SQL]
    F --> G
    G --> H[Ejecutar INSERT INTO<br/>sensor_readings]
    H --> I[Obtener insertId]
    I --> J[Construir objeto de respuesta]
    J --> K[Agregar timestamp]
    K --> L[Retornar objeto completo]
    
    style L fill:#51cf66
```

**Código simplificado**:

```javascript
export async function saveSensorReading(data) {
    const { device_id, sensor_type, value, unit, metadata } = data;
    
    // Preparar query SQL
    const query = `
        INSERT INTO sensor_readings 
        (device_id, sensor_type, value, unit, metadata)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    // Convertir metadata a JSON string si existe
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    
    // Ejecutar INSERT
    const [result] = await pool.query(query, [
        device_id,
        sensor_type,
        value,
        unit || null,
        metadataJson
    ]);
    
    // Retornar el objeto creado
    return {
        id: result.insertId,
        device_id,
        sensor_type,
        value,
        unit,
        metadata,
        timestamp: new Date()
    };
}
```

---

## Ejemplos Paso a Paso

### Ejemplo 1: Petición Exitosa

#### ESP32 Envía

```http
POST /api/sensors/data HTTP/1.1
Host: 192.168.1.100:3000
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "device_id": 1,
  "sensor_type": "temperature",
  "value": 25.5,
  "unit": "°C",
  "metadata": {
    "battery_level": 85
  }
}
```

### Diagrama: Flujo Exitoso Completo

**Este diagrama muestra** el recorrido exitoso de los datos con todos los valores transformados en cada etapa.

```mermaid
flowchart LR
    subgraph "1. ESP32"
        A["{device_id:1,<br/>temp:25.5}"]
    end
    
    subgraph "2. Authentication"
        B["token='eyJhbGc...'<br/>✓ Válido"]
    end
    
    subgraph "3. Device Verification"
        C["deviceId=1<br/>✓ Activo"]
    end
    
    subgraph "4. Validation"
        D["device_id ✓<br/>sensor_type ✓<br/>value ✓"]
    end
    
    subgraph "5. Service"
        E["INSERT SQL<br/>params: [1,'temp',25.5]"]
    end
    
    subgraph "6. Database"
        F["insertId: 1234"]
    end
    
    subgraph "7. Response"
        G["{id:1234,<br/>value:25.5<br/>✓ 201}"]
    end
    
    A --> B --> C --> D --> E --> F --> G
    
    style G fill:#51cf66
```

**Respuesta Final**:

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
      "battery_level": 85
    },
    "timestamp": "2025-12-08T16:30:00.000Z"
  }
}
```

---

### Ejemplo 2: Token Inválido

### Diagrama: Flujo con Error de Autenticación

**Este diagrama muestra** dónde se detiene el proceso cuando el token no es válido.

```mermaid
flowchart LR
    A[ESP32 Request] --> B[Router]
    B --> C[authenticateToken]
    C --> D[verifyDeviceToken]
    D --> E{¿Token en DB?}
    E -->|No| F[❌ 401 Unauthorized]
    E -->|Sí| G[Continuar...]
    
    F -.->|Detiene aquí| H[Retorna al ESP32]
    
    style F fill:#ff6b6b,stroke:#cc0000,stroke-width:3px
```

**Request**:
```http
Authorization: Bearer token_invalido123
```

**Response**:
```json
{
  "success": false,
  "message": "Invalid device token"
}
```

---

### Ejemplo 3: Validación Fallida

### Diagrama: Errores de Validación

**Este diagrama muestra** qué sucede cuando los datos tienen formato incorrecto.

```mermaid
flowchart TB
    A[Body recibido] --> B[Validar device_id]
    B --> C[device_id: 'abc' ❌]
    A --> D[Validar sensor_type]
    D --> E["sensor_type: '' ❌"]
    A --> F[Validar value]
    F --> G["value: '25.5°C' ❌"]
    
    C --> H[Error: debe ser número]
    E --> I[Error: campo vacío]
    G --> J[Error: debe ser numérico]
    
    H --> K[Lista de errores]
    I --> K
    J --> K
    K --> L[❌ 400 Bad Request]
    
    style L fill:#ff6b6b
```

**Request Incorrecto**:
```json
{
  "device_id": "abc",     // ❌ String en vez de número
  "sensor_type": "",      // ❌ Vacío
  "value": "25.5°C"       // ❌ String en vez de número
}
```

**Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Valid device_id required",
      "param": "device_id",
      "location": "body"
    },
    {
      "msg": "sensor_type required",
      "param": "sensor_type",
      "location": "body"
    },
    {
      "msg": "Numeric value required",
      "param": "value",
      "location": "body"
    }
  ]
}
```

---

## Resumen del Flujo de Datos

### Diagrama: Transformación de Datos en Cada Capa

**Este diagrama muestra** cómo los datos se transforman y enriquecen en cada capa del sistema.

```mermaid
flowchart TD
    subgraph "Input"
        A["ESP32<br/>{device_id, sensor_type, value}"]
    end
    
    subgraph "Transformaciones"
        B["+ token"] --> C["+ deviceId verificado"]
        C --> D["+ validación completa"]
        D --> E["+ SQL query"]
        E --> F["+ insertId de BD"]
        F --> G["+ timestamp generado"]
    end
    
    subgraph "Output"
        H["{id, device_id, sensor_type,<br/>value, unit, metadata, timestamp}"]
    end
    
    A --> B
    G --> H
    
    style A fill:#e1f5ff
    style H fill:#51cf66
```

### Tabla de Transformación

| Etapa | Input | Output | Agregado |
|-------|-------|--------|----------|
| **ESP32** | Lectura sensor | JSON HTTP Request | Headers, Body |
| **Router** | HTTP Request | Llamada a middleware | - |
| **Auth MW** | Request + Headers | Request enriquecido | `req.token` |
| **Verify MW** | Token | Request enriquecido | `req.deviceId` |
| **Validation MW** | Body JSON | Body validado | Errores o ✓ |
| **Controller** | Body validado | Llamada a service | - |
| **Service** | Datos limpios | Query SQL | SQL params |
| **Database** | SQL Query | Insert result | `insertId` |
| **Service** | Insert result | Objeto completo | `id`, `timestamp` |
| **Controller** | Objeto completo | JSON Response | Formato estándar |

---

## Archivos Involucrados

| Archivo | Responsabilidad | Líneas Clave |
|---------|-----------------|--------------|
| `src/app.js` | Monta las rutas `/api/sensors` | 49-50 |
| `src/routes/sensors.js` | Define ruta POST con middlewares | 13-19 |
| `src/middleware/auth.js` | Autenticación y verificación | 10-25, 30-50 |
| `src/middleware/validate.js` | Reglas de validación | 23-30 |
| `src/controllers/sensorController.js` | Orquestación | 8-11 |
| `src/services/sensorService.js` | Lógica de negocio y DB | Todo |
| `src/config/database.js` | Conexión MySQL | Todo |

---

## Conclusión

El flujo de datos desde el ESP32 hasta la base de datos pasa por **6 capas principales**:

1. **Router**: Mapea URL a handlers
2. **Authentication**: Verifica token
3. **Authorization**: Valida dispositivo
4. **Validation**: Valida formato de datos
5. **Controller**: Orquesta la operación
6. **Service**: Ejecuta lógica de negocio y guarda en DB

Cada capa tiene una **responsabilidad específica** y trabaja con los datos transformados de la capa anterior, asegurando:

- ✅ Seguridad (autenticación/autorización)
- ✅ Integridad de datos (validación)
- ✅ Separación de responsabilidades (arquitectura en capas)
- ✅ Mantenibilidad (código organizado)
- ✅ Trazabilidad (logging en cada capa)

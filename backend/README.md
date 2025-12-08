# ESP32 IoT Backend

Backend API for ESP32 IoT Monitoring Platform built with Node.js and Express.

## Features

- ✅ RESTful API for device management
- ✅ Sensor data ingestion from ESP32
- ✅ Token-based authentication
- ✅ MySQL database with Clever Cloud
- ✅ Real-time and historical data endpoints
- ✅ Request validation and error handling
- ✅ Modular architecture

## Prerequisites

- Node.js 18+ 
- MySQL database (Clever Cloud)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=3000
DB_HOST=your-clever-cloud-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
API_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

4. Initialize database:
```bash
npm run init-db
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Devices

- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Deactivate device

### Sensors

- `POST /api/sensors/data` - Submit sensor reading (requires auth token)
- `GET /api/sensors/latest/:deviceId` - Get latest reading
- `GET /api/sensors/all-latest/:deviceId` - Get all latest readings
- `GET /api/sensors/history/:deviceId` - Get historical data
- `GET /api/sensors/stats/:deviceId` - Get device statistics

## ESP32 Integration

Send sensor data via HTTP POST:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "http://your-server.com/api/sensors/data";
const char* apiToken = "your-device-token";

void sendSensorData(float value) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(apiToken));
  
  String payload = "{\"device_id\":1,\"sensor_type\":\"distance\",\"value\":" + String(value) + ",\"unit\":\"cm\"}";
  
  int httpCode = http.POST(payload);
  http.end();
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js           # Express app
├── scripts/             # Database scripts
├── server.js            # Entry point
└── package.json
```

## License

MIT

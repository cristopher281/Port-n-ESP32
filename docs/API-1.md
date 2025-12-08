# API Documentation

Base URL: `/api`

Authentication: Device endpoints that ingest data require a Bearer token in `Authorization` header. Example: `Authorization: Bearer <device_api_token>`

Endpoints

- `POST /api/sensors/data` - Submit sensor reading
  - Body: `{ device_id, sensor_type, value, unit?, metadata? }`
  - Auth: Bearer device token (see `api_token` in `devices` table)

- `GET /api/sensors/latest/:deviceId` - Get latest reading for a device
  - Query: `sensor_type` optional

- `GET /api/sensors/history/:deviceId` - Get historical readings
  - Query parameters: `limit`, `offset`, `start_date` (ISO8601), `end_date` (ISO8601), `sensor_type`

- `GET /api/devices` - List devices
- `POST /api/devices` - Create device: `{ name, location?, device_type? }` returns device with generated `api_token`
- `GET /api/devices/:id` - Get device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Soft delete (sets `status` to `inactive`)

Authentication / Users

- `POST /api/auth/register` - Register new user
  - Body: `{ "username", "password" }`
  - Response: created user (id, username, created_at)

- `POST /api/auth/login` - Login user
  - Body: `{ "username", "password" }`
  - Response: `{ token, user }` where `token` is a JWT to use in `Authorization: Bearer <token>`

Device command flow
See `frontend/docs/COMMUNICATION.md` for a complete explanation of the command enqueueing and polling flow between frontend, backend and ESP32.

Error responses follow the shape: `{ success: false, message: '...', errors?: [...] }`

Examples

Submit sensor data (curl):

```bash
curl -X POST https://your-backend.example.com/api/sensors/data \
  -H "Authorization: Bearer esp32_sample_token_12345" \
  -H "Content-Type: application/json" \
  -d '{"device_id":1,"sensor_type":"distance","value":25.5,"unit":"cm"}'
```

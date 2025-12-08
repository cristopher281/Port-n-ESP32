# ESP32 Integration Guide

This guide shows a minimal JSON payload and authentication approach for sending sensor data from an ESP32.

Requirements
- ESP32 board (Arduino framework)
- WiFi credentials
- Server URL and device API token (from device record `api_token`)

Minimal payload (JSON):

{
  "device_id": 1,
  "sensor_type": "distance",
  "value": 25.5,
  "unit": "cm",
  "metadata": { "extra": "info" }
}

HTTP request
- Method: `POST`
- URL: `https://your-backend.example.com/api/sensors/data`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <DEVICE_API_TOKEN>`

Arduino (HTTP) sketch outline

// Pseudocode sample (Arduino)
// - Connect to WiFi
// - Build JSON payload
// - Send POST request with Authorization header

Notes
- Keep the device token secret on the device.
- Use HTTPS in production.
- If using the sample device from `init-db.sql`, token is `esp32_sample_token_12345` (for testing only).

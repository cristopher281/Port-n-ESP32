
#ifndef SECRETS_H
#define SECRETS_H

// === Credenciales WiFi ===
const char* WIFI_SSID = "TU_WIFI_NOMBRE";
const char* WIFI_PASS = "TU_WIFI_CLAVE";

// === Configuración del Servidor ===
// REEMPLAZA CON LA IP DE TU COMPUTADORA QUE CORRE EL BACKEND
// Ejemplo: "http://192.168.1.50:3000/api"
const char* API_BASE_URL = "http://192.168.0.XX:3000/api";

// === Token del Dispositivo ===
// Este token se obtiene al crear el dispositivo en el backend via /api/devices
// Debes copiar y pegar el token que te devolvio la API al crear el dispositivo.
const char* DEVICE_TOKEN = "PEGA_AQUI_TU_TOKEN_JWT_DEL_DISPOSITIVO";

// ID del dispositivo (debe coincidir con el ID en tu base de datos)
const int DEVICE_ID = 1;

#endif

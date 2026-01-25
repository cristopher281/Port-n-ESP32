
#ifndef SECRETS_H
#define SECRETS_H

// === Credenciales WiFi ===
// PRECAUCIÓN: No compartas este archivo si contiene tus claves reales.
const char* WIFI_SSID = "TU_WIFI_NOMBRE_AQUI"; // <--- PON TU NOMBRE DE WIFI AQUI
const char* WIFI_PASS = "TU_WIFI_CLAVE_AQUI";  // <--- PON TU CONTRASEÑA DE WIFI AQUI

// === Configuración del Servidor ===
// REEMPLAZA CON LA IP DE TU COMPUTADORA QUE CORRE EL BACKEND
// Ip configurada automaticamente para tu laptop
const char* API_BASE_URL = "http://10.95.148.200:3000/api";

// === Token del Dispositivo ===
// Este token se obtiene al crear el dispositivo en el backend via /api/devices
// Debes copiar y pegar el token que te devolvio la API al crear el dispositivo.
const char* DEVICE_TOKEN = "PEGA_AQUI_TU_TOKEN_JWT_DEL_DISPOSITIVO";

// ID del dispositivo (debe coincidir con el ID en tu base de datos)
const int DEVICE_ID = 1;

#endif

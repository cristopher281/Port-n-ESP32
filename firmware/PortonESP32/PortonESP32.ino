#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include "secrets.h"

// === DEFINICIÓN DE PINES ===
const int PIN_PIR = 27;     // Sensor de movimiento
const int PIN_TRIG = 26;    // HC-SR04 Trigger
const int PIN_ECHO = 25;    // HC-SR04 Echo
const int PIN_SERVO = 13;   // Servo motor

// === OBJETOS GLOBALES ===
Servo gateServo;

// === VARIABLES DE ESTADO ===
unsigned long lastPollTime = 0;
unsigned long lastSensorTime = 0;
const long POLL_INTERVAL = 2000;    // Consultar comandos cada 2 segundos
const long SENSOR_INTERVAL = 5000;  // Enviar sensores cada 5 segundos (o cuando cambie drásticamente)

bool isGateOpen = false;
int currentDistance = 0;
bool motionDetected = false;

// Estado del servo (ángulos)
const int ANGLE_OPEN = 90;   // Ajustar según instalación (0-180)
const int ANGLE_CLOSED = 0;  // Ajustar según instalación

void setup() {
  Serial.begin(115200);
  
  // Configurar Pines
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  
  // Configurar Servo
  gateServo.attach(PIN_SERVO);
  gateServo.write(ANGLE_CLOSED); // Iniciar cerrado

  // Conectar a WiFi
  setupWiFi();
}

void loop() {
  // Mantener WiFi conectado
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  unsigned long now = millis();

  // 1. LEER SENSORES Y ENVIAR DATOS
  // Para evitar saturar, enviamos periódicamente o por eventos
  if (now - lastSensorTime > SENSOR_INTERVAL) {
    readAndSendSensors();
    lastSensorTime = now;
  }

  // 2. CONSULTAR COMANDOS PENDIENTES (POLLING)
  if (now - lastPollTime > POLL_INTERVAL) {
    pollCommands();
    lastPollTime = now;
  }
}

void setupWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFallo al conectar WiFi.");
  }
}

// === LÓGICA DE SENSORES ===

void readAndSendSensors() {
  // --- PIR ---
  int pirVal = digitalRead(PIN_PIR);
  // Solo enviar si hay movimiento (opcional, o enviar siempre estado)
  // Aquí enviamos el estado actual
  sendSensorData("motion", (float)pirVal, "boolean");

  // --- HC-SR04 ---
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  
  long duration = pulseIn(PIN_ECHO, HIGH);
  float distanceCm = duration * 0.034 / 2;
  
  // Filtro simple para evitar ruidos locos
  if (distanceCm > 0 && distanceCm < 400) {
    sendSensorData("distance", distanceCm, "cm");
    currentDistance = (int)distanceCm;
  }
}

void sendSensorData(const char* type, float value, const char* unit) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(API_BASE_URL) + "/sensors/data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  
  StaticJsonDocument<200> doc;
  doc["device_id"] = DEVICE_ID;
  doc["sensor_type"] = type;
  doc["value"] = value;
  doc["unit"] = unit;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode > 0) {
    // Serial.printf("Sensor %s enviado: %d\n", type, httpResponseCode);
  } else {
    Serial.printf("Error enviando sensor %s: %s\n", type, http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}

// === LÓGICA DE COMANDOS (CONTROL) ===

void pollCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  // Endpoint: GET /api/devices/:id/commands/poll
  String url = String(API_BASE_URL) + "/devices/" + String(DEVICE_ID) + "/commands/poll";
  
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) { // OK - Hay comando
    String payload = http.getString();
    Serial.println("Comando recibido: " + payload);
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      String command = doc["data"]["command"].as<String>();
      int cmdId = doc["data"]["id"]; // ID del comando para confirmar (ack)
      
      executeCommand(command, cmdId);
    } else {
      Serial.println("Error parseando JSON de comando");
    }
  } else if (httpCode == 204) {
    // No hay contenido (no pending commands) - normal loop
  } else {
    Serial.printf("Error polling commands: %d\n", httpCode);
  }
  
  http.end();
}

void executeCommand(String command, int cmdId) {
  bool success = false;
  String message = "";
  
  if (command == "open") {
    Serial.println("EJECUTANDO: ABRIR PORTÓN");
    gateServo.write(ANGLE_OPEN);
    isGateOpen = true;
    success = true;
    message = "Portón abierto";
  } else if (command == "close") {
    // Verificar obstrucción antes de cerrar (seguridad simple)
    if (currentDistance > 0 && currentDistance < 20) { // Si hay algo a menos de 20cm
       Serial.println("ABORTADO: Objeto detectado, no se puede cerrar.");
       success = false;
       message = "Obstrucción detectada por sensor de distancia";
    } else {
       Serial.println("EJECUTANDO: CERRAR PORTÓN");
       gateServo.write(ANGLE_CLOSED);
       isGateOpen = false;
       success = true;
       message = "Portón cerrado";
    }
  } else {
    Serial.println("Comando desconocido: " + command);
    message = "Comando desconocido";
    success = false;
  }
  
  // Confirmar ejecución al backend (ACK)
  ackCommand(cmdId, success, message);
}

void ackCommand(int cmdId, bool success, String message) {
  HTTPClient http;
  // Endpoint: POST /api/devices/:id/commands/:cmdId/ack
  String url = String(API_BASE_URL) + "/devices/" + String(DEVICE_ID) + "/commands/" + String(cmdId) + "/ack";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  
  StaticJsonDocument<200> doc;
  doc["success"] = success;
  doc["result"] = message; // Metadata
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpCode = http.POST(requestBody);
  Serial.printf("ACK enviado (%d): %s\n", httpCode, message.c_str());
  
  http.end();
}

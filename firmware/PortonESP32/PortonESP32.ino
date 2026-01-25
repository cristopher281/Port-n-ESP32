#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <Preferences.h>

// === OBJETOS GLOBALES ===
Servo gateServo;
Preferences preferences;
WiFiManager wifiManager;

// === VARIABLES DE CONFIGURACIÓN (Se cargan de NVS) ===
char api_base_url[100] = "http://192.168.1.XX:3000/api";
char device_token[256] = ""; // Token largo
char device_id_str[10] = "1"; // Como string para el input field
int DEVICE_ID = 1; // Entero para el código

// === DEFINICIÓN DE PINES ===
const int PIN_PIR = 27;
const int PIN_TRIG = 26;
const int PIN_ECHO = 25;
const int PIN_SERVO = 13;
const int PIN_RESET_CONFIG = 4; // Pin opcional para resetear configuración (Botón a GND)

// === VARIABLES DE ESTADO ===
unsigned long lastPollTime = 0;
unsigned long lastSensorTime = 0;
const long POLL_INTERVAL = 2000;
const long SENSOR_INTERVAL = 5000;
bool isGateOpen = false;
int currentDistance = 0;

// Estado del servo
const int ANGLE_OPEN = 90;
const int ANGLE_CLOSED = 0;

// Flag para guardar configuración
bool shouldSaveConfig = false;

// Callback cuando se guardan datos desde el portal WiFi
void saveConfigCallback () {
  Serial.println("Se guardó la configuración en el Portal");
  shouldSaveConfig = true;
}

void setup() {
  Serial.begin(115200);

  // 1. Configurar Pines
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_RESET_CONFIG, INPUT_PULLUP);
  
  gateServo.attach(PIN_SERVO);
  gateServo.write(ANGLE_CLOSED);

  // 2. Cargar variables guardadas (NVS)
  preferences.begin("porton_config", false);
  String stored_url = preferences.getString("api_url", "");
  String stored_token = preferences.getString("dev_token", "");
  String stored_id = preferences.getString("dev_id", "1");
  
  if (stored_url != "") stored_url.toCharArray(api_base_url, 100);
  if (stored_token != "") stored_token.toCharArray(device_token, 256);
  if (stored_id != "") stored_id.toCharArray(device_id_str, 10);
  
  DEVICE_ID = atoi(device_id_str);
  
  Serial.println("--- Configuración Cargada ---");
  Serial.print("API URL: "); Serial.println(api_base_url);
  Serial.print("ID: "); Serial.println(DEVICE_ID);

  // 3. Configurar WiFiManager
  // Callback para saber si debemos guardar params
  wifiManager.setSaveConfigCallback(saveConfigCallback);

  // Campos personalizados para el Portal
  WiFiManagerParameter custom_api_url("api_url", "API Base URL", api_base_url, 100);
  WiFiManagerParameter custom_device_token("dev_token", "Device Token (JWT)", device_token, 256);
  WiFiManagerParameter custom_device_id("dev_id", "Device ID", device_id_str, 10);

  wifiManager.addParameter(&custom_api_url);
  wifiManager.addParameter(&custom_device_id);
  wifiManager.addParameter(&custom_device_token);

  // Si se presiona el botón de reset al arrancar, se borran las credenciales
  if (digitalRead(PIN_RESET_CONFIG) == LOW) {
    Serial.println("Borrando configuración WiFi y datos...");
    wifiManager.resetSettings();
    preferences.clear();
    delay(1000);
  }

  // Intentar conectar. Si falla, crea un AP llamado "Porton-Config"
  // IP por defecto del AP: 192.168.4.1
  if (!wifiManager.autoConnect("Porton-Config")) {
    Serial.println("Fallo al conectar y timeout alcanzado");
    delay(3000);
    ESP.restart();
  }

  // 4. Si llegamos aquí, estamos conectados
  Serial.println("Conectado a la red WiFi :)");
  Serial.print("IP local: ");
  Serial.println(WiFi.localIP());

  // 5. Guardar configuración personalizada si hubo cambios
  if (shouldSaveConfig) {
    strcpy(api_base_url, custom_api_url.getValue());
    strcpy(device_token, custom_device_token.getValue());
    strcpy(device_id_str, custom_device_id.getValue());
    DEVICE_ID = atoi(device_id_str);

    Serial.println("Guardando configuración personalizada...");
    preferences.putString("api_url", api_base_url);
    preferences.putString("dev_token", device_token);
    preferences.putString("dev_id", device_id_str);
    preferences.end();
  }
}

void loop() {
  unsigned long now = millis();

  // 1. LEER SENSORES Y ENVIAR DATOS
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

// === LÓGICA DE SENSORES ===
void readAndSendSensors() {
  if (WiFi.status() != WL_CONNECTED) return;

  // --- PIR ---
  int pirVal = digitalRead(PIN_PIR);
  sendSensorData("motion", (float)pirVal, "boolean");

  // --- HC-SR04 ---
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  
  long duration = pulseIn(PIN_ECHO, HIGH);
  float distanceCm = duration * 0.034 / 2;
  
  if (distanceCm > 0 && distanceCm < 400) {
    sendSensorData("distance", distanceCm, "cm");
    currentDistance = (int)distanceCm;
  }
}

void sendSensorData(const char* type, float value, const char* unit) {
  if (WiFi.status() != WL_CONNECTED) return;
  if (strlen(api_base_url) < 10) return; // URL no válida

  HTTPClient http;
  String url = String(api_base_url) + "/sensors/data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + String(device_token));
  
  StaticJsonDocument<200> doc;
  doc["device_id"] = DEVICE_ID;
  doc["sensor_type"] = type;
  doc["value"] = value;
  doc["unit"] = unit;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode <= 0) {
     Serial.printf("Error POST %s: %s\n", type, http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

// === LÓGICA DE COMANDOS ===
void pollCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (strlen(api_base_url) < 10) return;

  HTTPClient http;
  String url = String(api_base_url) + "/devices/" + String(DEVICE_ID) + "/commands/poll";
  
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + String(device_token));
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("Comando: " + payload);
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      String command = doc["data"]["command"].as<String>();
      int cmdId = doc["data"]["id"];
      executeCommand(command, cmdId);
    }
  }
  http.end();
}

void executeCommand(String command, int cmdId) {
  bool success = false;
  String message = "";
  
  if (command == "open") {
    gateServo.write(ANGLE_OPEN);
    isGateOpen = true;
    success = true;
    message = "Portón abierto";
  } else if (command == "close") {
    if (currentDistance > 0 && currentDistance < 20) {
       success = false;
       message = "Obstrucción - Distancia < 20cm";
    } else {
       gateServo.write(ANGLE_CLOSED);
       isGateOpen = false;
       success = true;
       message = "Portón cerrado";
    }
  } else {
    success = false;
    message = "Comando desconocido";
  }
  
  ackCommand(cmdId, success, message);
}

void ackCommand(int cmdId, bool success, String message) {
  HTTPClient http;
  String url = String(api_base_url) + "/devices/" + String(DEVICE_ID) + "/commands/" + String(cmdId) + "/ack";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + String(device_token));
  
  StaticJsonDocument<200> doc;
  doc["success"] = success;
  doc["result"] = message;
  
  String requestBody;
  serializeJson(doc, requestBody);
  http.POST(requestBody);
  http.end();
}

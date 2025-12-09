#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===============================
// CONFIGURACIÓN
// ===============================
// TU_WIFI_SSID y TU_WIFI_PASSWORD deben ser actualizados antes de subir el código
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// ACTUALIZAR ESTA URL CON TU DOMINIO DE VERCEL O IP LOCAL
// Ejemplo Vercel: "https://mi-proyecto.vercel.app/api"
// Ejemplo Local: "http://192.168.1.100:3000/api"
const char* serverUrl = "http://192.168.1.100:3000/api";

const char* deviceToken = "TU_DEVICE_TOKEN";
const int deviceId = 1;

// Pines (ajusta según tu hardware)
const int RELAY_PIN = 2;          // Pin del relé del motor
const int MOTION_SENSOR_PIN = 4;  // Sensor de movimiento
const int POSITION_SENSOR_PIN = 34; // Sensor de posición (analógico)

// Timing para actualizaciones en TIEMPO REAL
unsigned long lastSensorSend = 0;
unsigned long lastCommandPoll = 0;
const long SENSOR_INTERVAL_MOVING = 300;    // Durante movimiento: cada 300ms (TIEMPO REAL)
const long SENSOR_INTERVAL_IDLE = 5000;     // Sin movimiento: cada 5 segundos
const long COMMAND_INTERVAL = 1000;         // Polling de comandos cada 1 segundo

// Estado
String currentState = "closed";  // "open", "closed", "opening", "closing"
int lastPosition = 0;            // Última posición enviada
bool isMoving = false;           // ¿El portón se está moviendo?

// ===============================
// SETUP
// ===============================
void setup() {
  Serial.begin(115200);
  
  // Configurar pines
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(MOTION_SENSOR_PIN, INPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  // Conectar WiFi
  connectWiFi();
}

// ===============================
// LOOP PRINCIPAL
// ===============================
void loop() {
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, reconectando...");
    connectWiFi();
    return;
  }
  
  unsigned long currentMillis = millis();
  
  // Leer posición actual
  int positionRaw = analogRead(POSITION_SENSOR_PIN);
  int currentPosition = map(positionRaw, 0, 4095, 0, 100);
  
  // Detectar si hay movimiento (cambio en posición)
  isMoving = (abs(currentPosition - lastPosition) > 1) || 
             (currentPosition > 0 && currentPosition < 100);
  
  // Determinar intervalo según si hay movimiento
  long sensorInterval = isMoving ? SENSOR_INTERVAL_MOVING : SENSOR_INTERVAL_IDLE;
  
  // Enviar datos de sensores (TIEMPO REAL durante movimiento)
  if (currentMillis - lastSensorSend >= sensorInterval) {
    lastSensorSend = currentMillis;
    sendSensorData();
    lastPosition = currentPosition;  // Actualizar última posición
  }
  
  // Polling de comandos del servidor
  if (currentMillis - lastCommandPoll >= COMMAND_INTERVAL) {
    lastCommandPoll = currentMillis;
    pollCommands();
  }
  
  delay(50);  // Pequeña pausa para no saturar el CPU
}

// ===============================
// CONEXIÓN WIFI
// ===============================
void connectWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ Error al conectar WiFi");
  }
}

// ===============================
// ENVIAR DATOS DE SENSORES
// ===============================
void sendSensorData() {
  // Leer sensores
  bool motion = digitalRead(MOTION_SENSOR_PIN);
  int positionRaw = analogRead(POSITION_SENSOR_PIN);
  int position = map(positionRaw, 0, 4095, 0, 100); // Convertir a porcentaje
  
  // Enviar movimiento
  sendSensor("motion", motion ? 1 : 0, "boolean");
  delay(100);
  
  // Enviar posición
  sendSensor("gate_position", position, "%");
  delay(100);
  
  // Enviar estado del sistema
  sendSensor("system_status", 1, "boolean"); // 1 = normal, 0 = error
}

void sendSensor(const char* sensorType, float value, const char* unit) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(serverUrl) + "/sensors/data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + deviceToken);
  
  // Crear JSON
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["sensor_type"] = sensorType;
  doc["value"] = value;
  doc["unit"] = unit;
  
  // Metadata adicional
  JsonObject metadata = doc.createNestedObject("metadata");
  metadata["signal_strength"] = WiFi.RSSI();
  metadata["uptime"] = millis() / 1000;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  // Enviar POST
  int httpCode = http.POST(jsonData);
  
  if (httpCode > 0) {
    if (httpCode == 201) {
      Serial.printf("[%s] ✓ Enviado: %.1f %s\n", sensorType, value, unit);
    } else {
      Serial.printf("[%s] HTTP %d\n", sensorType, httpCode);
    }
  } else {
    Serial.printf("[%s] Error: %s\n", sensorType, http.errorToString(httpCode).c_str());
  }
  
  http.end();
}

// ===============================
// POLLING DE COMANDOS
// ===============================
void pollCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(serverUrl) + "/devices/" + String(deviceId) + "/commands/poll";
  
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + deviceToken);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    // Parsear respuesta
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error && doc["success"] == true) {
      JsonObject data = doc["data"];
      
      if (!data.isNull()) {
        int commandId = data["id"];
        String command = data["command"].as<String>();
        
        Serial.printf("📥 Comando recibido: %s (ID: %d)\n", command.c_str(), commandId);
        
        // Ejecutar comando
        executeCommand(command);
        
        // Confirmar comando
        acknowledgeCommand(commandId);
      }
    }
  } else if (httpCode == 204) {
    // Sin comandos pendientes (normal)
  } else {
    Serial.printf("⚠️ Polling error: HTTP %d\n", httpCode);
  }
  
  http.end();
}

// ===============================
// EJECUTAR COMANDO
// ===============================
void executeCommand(String command) {
  command.toLowerCase();
  
  if (command == "open") {
    Serial.println("🔓 Abriendo portón...");
    currentState = "opening";
    digitalWrite(RELAY_PIN, HIGH);
    // Logica de movimiento real (start motor)
    
    // Simular tiempo de apertura (bloqueante solo por simplicidad)
    // En produccion usar millis() para no bloquear
    delay(5000); 
    
    digitalWrite(RELAY_PIN, LOW);
    currentState = "open";
    Serial.println("✓ Portón abierto");
    
  } else if (command == "close") {
    Serial.println("🔒 Cerrando portón...");
    currentState = "closing";
    digitalWrite(RELAY_PIN, HIGH);
    
    delay(5000); 
    
    digitalWrite(RELAY_PIN, LOW);
    currentState = "closed";
    Serial.println("✓ Portón cerrado");
    
  } else {
    Serial.printf("⚠️ Comando desconocido: %s\n", command.c_str());
  }
}

// ===============================
// CONFIRMAR COMANDO
// ===============================
void acknowledgeCommand(int commandId) {
  HTTPClient http;
  String url = String(serverUrl) + "/devices/" + String(deviceId) + 
               "/commands/" + String(commandId) + "/ack";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + deviceToken);
  
  // Enviar resultado
  StaticJsonDocument<128> doc;
  doc["status"] = "completed";
  doc["state"] = currentState;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  int httpCode = http.POST(jsonData);
  
  if (httpCode == 200) {
    Serial.println("✓ Comando confirmado");
  } else {
    Serial.printf("⚠️ Error al confirmar: HTTP %d\n", httpCode);
  }
  
  http.end();
}

// =============================================================================
//  Flostat RS485 Gateway – Industrial Version with Diagnostics & Watchdog
// =============================================================================

#include <WiFi.h>
#include <esp_now.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // Optional if HTTPS is used
#include <esp_wifi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <time.h>
#include <vector>
#include <HardwareSerial.h>
#include <esp_task_wdt.h>

// =============================================================================
//  CONFIGURATION
// =============================================================================

#define RS485_TXD 14
#define RS485_RXD 33
#define RS485_DE_RE 32
#define RS485_BAUDRATE 4800
HardwareSerial RS485Serial(1);

#define CMD_PUMP_ON   0x11
#define CMD_PUMP_OFF  0x12
#define CMD_VALVE_ON  0x21
#define CMD_VALVE_OFF 0x22
#define CMD_ACK       0xA1
#define DEVICE_ADDR   0x01
#define CMD_HEARTBEAT 0x99
#define CMD_DISCONNECTED 0xDD  // Custom RS485 code for ESP-NOW disconnection
#define CMD_CONNECTED 0xCC

#define WDT_TIMEOUT      30      // Watchdog timeout in seconds
#define DEBUG_MODE       true    // Set to false to disable logs

#define MAX_RETRIES 30
#define MAX_SCHEDULES 60
#define ACK_TEMP 999.0

#define VALVE_PIN 27
//#define PUMP_PIN 26
#define PUMP_PIN 2

// Your WiFi credentials
const char* ssid = "GITAM";
const char* password = "Gitam$$123";

// AWS IoT Core endpoint, e.g., "your-endpoint-ats.iot.<region>.amazonaws.com"
const char* mqtt_server = "a3a6bcyydw1uzn-ats.iot.ap-south-1.amazonaws.com";
const int mqtt_port = 8883;  // TLS port

// MQTT Topics
const char* publish_topic = "flostat/3/valve/1/state";
const char* valve_topic = "flostat/3/commands/valve/1";
const char* pump_topic = "flostat/3/commands/pump/1";
const char* client_id = "espnow-gateway";

const char* valve_schedule_url = "https://gv6dp7jmaj.execute-api.ap-south-1.amazonaws.com/First/testfunction/?org_id=3&service=fetch_schedules&machine=valve&id=1";
const char* pump_schedule_url  = "https://gv6dp7jmaj.execute-api.ap-south-1.amazonaws.com/First/testfunction/?org_id=3&service=fetch_schedules&machine=pump&id=1";

const char* valve_url = "https://gv6dp7jmaj.execute-api.ap-south-1.amazonaws.com/First/testfunction/?org_id=3&service=fetch_data&type=live&machine=valve&id=1";
const char* pump_url  = "https://gv6dp7jmaj.execute-api.ap-south-1.amazonaws.com/First/testfunction/?org_id=3&service=fetch_data&type=live&machine=pump&id=1";

// Certificates
const char* root_ca = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----
)EOF";

const char* device_cert = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUTYSQ2I5USPCs6+w2JC0vUKiQAfAwDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI1MDUwNjA5MzQ0
M1oXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMsI7gw2ChOQn1tT6ENR
o8LOxg/Lb0t3VbcAud7A7O3sJLCS2Jlc15lMRyL3T+GWwUeWShz+vj4Eq0Pea/Ke
3KNQz+PowQtMw+5tAXq60XIQbh6OxKG1GM+jUgENFyyUFmdgaoQOigzRrjQYSZq2
pB2CIwyTuKYyg2sg1tD9Bk4KpKgo01vDYglJreWZd+A7HLdquMJFxd4Z3TWUQ7yz
EM21Wm1OTHutWNIQbr0CHE+Wt7xzL5LIEVmb2w8JaDFQubG8peLpvYg53F3wqBZm
/V3WfSCAPiAF+DVm17FUU6EHpvpqpR+v4tIAqd9I5LMrHdY74pzkA77xD2Afz/a5
LOkCAwEAAaNgMF4wHwYDVR0jBBgwFoAU2PvElpOEIWOSIbqP7svA5EGTaBAwHQYD
VR0OBBYEFIQRP30gvkc3zr9Z3bg1L2O9R8o8MAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQCn2WD2j/nbcvxlBnam6RezMo33
IzEeV8IQeNCghXVlk7rb2Ex0krrxWOBxS8d0tuYO3uduF6BDGQbe1SnKEPskFHwX
9p8qEvd2ryeXaNP/B3atobvlIWJnppkODgRnyHu2/Ttn1kBQiIlYUDDsPvV8NPs0
o4dZa3UNq77DJVn5/AoOlTgVyfYQ4oI3LDJ5wAWb6nMbb+3/syyW5VdZwkns5pUt
Nt9YOxqgPQ+NKXqWzs6v8yrvaVZCc5uq1J/SD4tWYM9d/BOxyDVUz92NyBsfOEFz
wyjcvFXvBRHmIpaCuKemdNWamTvqk5O/PTklOzA4F8eP/rFENZrfW2u5PP7e
-----END CERTIFICATE-----
)EOF";

const char* private_key = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAywjuDDYKE5CfW1PoQ1Gjws7GD8tvS3dVtwC53sDs7ewksJLY
mVzXmUxHIvdP4ZbBR5ZKHP6+PgSrQ95r8p7co1DP4+jBC0zD7m0BerrRchBuHo7E
obUYz6NSAQ0XLJQWZ2BqhA6KDNGuNBhJmrakHYIjDJO4pjKDayDW0P0GTgqkqCjT
W8NiCUmt5Zl34Dsct2q4wkXF3hndNZRDvLMQzbVabU5Me61Y0hBuvQIcT5a3vHMv
ksgRWZvbDwloMVC5sbyl4um9iDncXfCoFmb9XdZ9IIA+IAX4NWbXsVRToQem+mql
H6/i0gCp30jksysd1jvinOQDvvEPYB/P9rks6QIDAQABAoIBAQCNtNzYfvsHbsAa
cPTBz4A5njHUoks6Y77abFJOK17yLAfriYJNf+QmZXuc5vnE3IBn43g0xoOnK4ER
bHLxMnmSLvv5+OCLb3esuD35F9zI/Liu8TxCFPCNM1Mv0qAjB/SfEEcnhjJKAirQ
x0bQCbt/sO2fgJa2wLjCk3f7Ay5cVoeeXCNGp30XRt6hYQt++VLWD2Wlrl9Sv1x+
9UihP4s7jGT8OxHTQTIzILPbRCy73xuQqvhp1Z+5n7i0WSx8et4BkfSoEEHZydOP
8q5lHvUQ1zw0Ubpe9L4z0q9yzSx6YuimamwsvcPr0wh5u+3W2X4ybxqjq5E0nkVL
GbPTdkdRAoGBAPsNLQ4s+lepAY95UAcwY7VQOPM1ngpoyit+gllrzbzZOfCiQPmP
DGW12FtCkza2UL8QUxO1kWyjN7mZ0HR2QtwcYKUmU1bQhSprE1oa6t98dBiRoDBd
9qq5wUvGuLPf7KLpBhHKOe3O/e7U23nhvUKQDVdZCTs9zTJBKUjjmoKdAoGBAM8J
dWw8L2lnfwGo9nx06hqJFNDauU/CfILuJgyNxqwGTd00ltofac7he18KNRgGZjTC
lnOD/XyJqkirDt8GVASRW6HZgC1W9P0GRFgV569QA2Hp0Ry5uFKwvOUDfjp75Oru
Y/kupGaPfSP/XEQC+DI8jcLAlnhhcXI0XWsXEgu9AoGASqAjCXizPcV+MkDUWh63
NNlQ5HLGtL9rgTxM0PnroTxNLct9VvF/tOg2FQKYMgZFwFXA7DXnsYxe7yvavBO/
UiCZVd4rnb3EJ9TGXt1rfd1HwVngbSAxR5SJ8dVzZ/yjIdX0uOsNBzSlZQ4e438H
vDaH0LQlu1dmnI6kEAegET0CgYAJFEcb+f+yRaGiNwCoMJBbnYtWJWFfCA5hx4PP
pSADRzt+6eF7q0j+k5DPeCkf5pfw1F+4rR8eqQLYsPez/BkPIji8fkdKtbeEqROy
MTO50m5zisdq1RIqPinqeR69/dTqII4tzUfUX5KDU51+NgsgWNt2oO94U/2fnoBC
Q/68mQKBgQCdBcjdpRG6ZPbSmODIYZKpurqi+guKmU17C+mU+DSJkT5knfkeVjHH
WKDedM4VfMBMgcBa4+1oAvw1tJna+Txl6KlqS/QV5t7kfExBBSRBQVfxl67suJX6
3ILWRjSBhvQds2/cydwjthn0SHu03uhUGhRp1HWq0w42Kjp+z7FyZQ==
-----END RSA PRIVATE KEY-----
)EOF";

// =============================================================================
//  GLOBAL OBJECTS & STATE
// =============================================================================

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

int VALVE_ID = 1;
int PUMP_ID = 1;

struct Schedule {
  String start_time;
  String end_time;
};

#define MAX_HTTP_RETRIES     3
#define HTTP_TIMEOUT_MS      2000
#define OFFLINE_BUFFER_LIMIT 10

struct LogEntry {
  String machineType;
  bool state;
};

std::vector<LogEntry> offlineLogBuffer;

std::vector<Schedule> valveSchedules;
std::vector<Schedule> pumpSchedules;

int wifi_retries = 30;

int rs485_totalCommands = 0;
int rs485_ackSuccess    = 0;
int mqtt_reconnects     = 0;

// Store last command sent
uint8_t lastPumpCommand = 0x00;
uint8_t lastValveCommand = 0x00;

// Store time of last command (for retry timing, optional)
unsigned long lastPumpCmdTime = 0;
unsigned long lastValveCmdTime = 0;
unsigned long lastScheduleCheck = 0;
unsigned long lastMqttReceived  = 0;
unsigned long lastMqttConnect   = 0;

unsigned long lastMqttReconnectAttempt = 0;
const unsigned long mqttReconnectInterval = 5000;  // 5 seconds

int mqttFailCount = 0;
const int maxMqttFailures = 12;  // 12 * 5s = 60s

unsigned long lastHeartbeatTime = 0;
const unsigned long heartbeatInterval = 20000; // every 20 seconds


// Schedule storage
String valveStart[MAX_SCHEDULES], valveEnd[MAX_SCHEDULES];
int valveCount = 0;

String pumpStart[MAX_SCHEDULES], pumpEnd[MAX_SCHEDULES];
int pumpCount = 0;


bool initial_valve_state = false;
bool initial_pump_state = false;


const unsigned long scheduleInterval = 1000;  // Check every 1 second

bool pumpManuallyOverridden = false;
bool valveManuallyOverridden = false;
bool pumpScheduleMatched = false;
bool valveScheduleMatched = false;

bool valveIsOn = false;
bool pumpIsOn = false;



// Time setup for IST
time_t now;
struct tm timeinfo;
const long gmtOffset_sec = 19800;           // adjust for your timezone
const int daylightOffset_sec = 0;

unsigned long lastTimeSync = 0;
const unsigned long TIME_RESYNC_INTERVAL = 6UL * 60 * 60 * 1000;  // every 6 hours

bool timeInitialized = false;
bool timeSyncInProgress = false;
unsigned long timeSyncStart = 0;
const unsigned long TIME_SYNC_TIMEOUT = 10 * 1000;  // 10 seconds timeout


// =============================================================================
//  HELPERS
// =============================================================================

// void fetchFilteredSchedules(const char* url, const char* key_name, const char* match_id,
//                             String* startArr, String* endArr, int& count) {
//   HTTPClient http;
//   http.begin(url);
//   int code = http.GET();
//   if (code != 200) {
//     Serial.println("❌ Failed to fetch schedule");
//     count = 0;
//     return;
//   }
//   String payload = http.getString();
//   DynamicJsonDocument doc(2048);
//   DeserializationError err = deserializeJson(doc, payload);
//   if (err) {
//     Serial.println("❌ JSON parse error");
//     count = 0;
//     return;
//   }
//   JsonArray schedules = doc["Schedules"];
//   count = 0;
//   for (JsonObject sched : schedules) {
//     const char* device_id = sched[key_name];
//     if (String(device_id) == match_id) {
//       startArr[count] = sched["start_time"].as<String>();
//       endArr[count] = sched["end_time"].as<String>();
//       Serial.printf("✅ Schedule %d - Start: %s | End: %s\n", count + 1, startArr[count].c_str(), endArr[count].c_str());
//       count++;
//       if (count >= MAX_SCHEDULES) break;
//     }
//   }
//     http.end();
// }

void debugLog(String msg) {
  if (DEBUG_MODE) Serial.println(msg);
}

bool timeInRange(String nowStr, String start, String end) {
  return nowStr >= start && nowStr < end;
}

// void checkAndTriggerSchedules() {
//   time_t now = time(nullptr);
//   struct tm timeinfo;
//   localtime_r(&now, &timeinfo);

//   char currentTime[6];
//   sprintf(currentTime, "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);

//   Serial.printf("🕒 Current Time: %s\n", currentTime);

//   // 🚰 Check Valve Schedules
//   bool valveMatchFound = false;
//   for (int i = 0; i < valveSchedules.size(); i++) {
//     String start = valveSchedules[i].start_time;
//     String end = valveSchedules[i].end_time;

//     Serial.printf("🔍 Valve Schedule %d - Start: %s | End: %s\n", i + 1, start.c_str(), end.c_str());

//     if (timeInRange(currentTime, start, end)) {
//       valveMatchFound = true;
//       if (!valveIsOn) {
//         sendRS485Command(CMD_PUMP_ON );
//         valveIsOn = true;
//         valveManuallyOverridden = false;
//         logDeviceStateToCloud("pump", true);
//         Serial.println("✅ Pump turned ON by schedule");
//       }
//     }
//   }

//   if (!valveMatchFound) {
//     if (valveIsOn && valveScheduleMatched && !valveManuallyOverridden) {
//       sendRS485Command(CMD_PUMP_OFF);
//       valveIsOn = false;
//       Serial.println("⛔ Pump turned OFF (schedule expired)");
//       logDeviceStateToCloud("pump", false);
//     } else {
//       Serial.println("🟡 No valve schedule match, preserving previous state");
//     }
//   }

//   valveScheduleMatched = valveMatchFound;

//   // 💧 Check Pump Schedules
//   // bool pumpMatchFound = false;
//   // for (int i = 0; i < pumpSchedules.size(); i++) {
//   //   String start = pumpSchedules[i].start_time;
//   //   String end = pumpSchedules[i].end_time;

//   //   Serial.printf("🔍 Pump Schedule %d - Start: %s | End: %s\n", i + 1, start.c_str(), end.c_str());

//   //   if (timeInRange(currentTime, start, end)) {
//   //     pumpMatchFound = true;
//   //     if (!pumpIsOn) {
//   //       sendRS485Command(CMD_PUMP_ON );
//   //       pumpIsOn = true;
//   //       pumpManuallyOverridden = false;
//   //       logDeviceStateToCloud("pump", true);
//   //       Serial.println("✅ Pump turned ON by schedule");
//   //     }
//   //   }
//   // }

//   // if (!pumpMatchFound) {
//   //   if (pumpIsOn && pumpScheduleMatched && !pumpManuallyOverridden) {
//   //     sendRS485Command(CMD_PUMP_OFF);
//   //     pumpIsOn = false;
//   //     Serial.println("⛔ Pump turned OFF (schedule expired)");
//   //     logDeviceStateToCloud("pump", false);
//   //   } else {
//   //     Serial.println("🟡 No pump schedule match, preserving previous state");
//   //   }
//   // }

//   // pumpScheduleMatched = pumpMatchFound;
// }


bool fetchInitialState(const char* url, bool& state) {
  HTTPClient http;
  http.begin(url);
  int httpCode = http.GET();
  if (httpCode != 200) {
    Serial.println("❌ Failed to fetch: " + String(url));
    http.end();
    return false;
  }

  String payload = http.getString();
  Serial.println("✅ Response: " + payload);
  http.end();

  DynamicJsonDocument doc(512);
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.println("❌ JSON Parse error");
    return false;
  }

  String stateStr = doc["state"];
  state = (stateStr == "1");
  return true;
}



void mqttCallback(char* topic, byte* payload, unsigned int length) {
  
  lastMqttReceived = millis();
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  message.trim();
  message.replace("\"", "");

  Serial.printf("📩 MQTT [%s] => %s\n", topic, message.c_str());

  if (String(topic) == pump_topic && (message == "ON" || message == "OFF")) {
    bool pumpCommand = (message == "ON");

    // 🚫 Don't send to valve via RS485 anymore — just log
    Serial.printf(pumpCommand ? "✅ Pump triggered ON via MQTT\n" : "⛔ Pump triggered OFF via MQTT\n");

    // ✅ Instead control pump based on valve command
    sendRS485Command(pumpCommand ? CMD_PUMP_ON : CMD_PUMP_OFF);
    pumpIsOn = pumpCommand;
    pumpManuallyOverridden = true;

    logDeviceStateToCloud("pump", pumpCommand);
    Serial.printf(pumpCommand ? "✅ Pump turned ON because valve is ON\n" : "⛔ Pump turned OFF because valve is OFF\n");
  }

  else if (message == "schedule") {
    Serial.println("🔄 Refreshing schedules from MQTT command...");

    fetchFilteredSchedules(valve_schedule_url, "valve_id", "1", valveStart, valveEnd, valveCount);
    valveSchedules.clear();
    for (int i = 0; i < valveCount; ++i) {
      valveSchedules.push_back({valveStart[i], valveEnd[i]});
    }
  }

  else {
    Serial.println("❌ Unknown or ignored MQTT command.");
  }
}



void connectToAWS() {
  mqttClient.setKeepAlive(60);
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);

  secureClient.setCACert(root_ca);
  secureClient.setCertificate(device_cert);
  secureClient.setPrivateKey(private_key);

  Serial.print("🔌 Attempting MQTT connection... ");
  if (mqttClient.connect(client_id)) {
    Serial.println("✅ MQTT connected");
    mqttClient.subscribe(valve_topic);
    mqttClient.subscribe(pump_topic);
    Serial.println("✅ Subscribed to topics");
    lastMqttConnect = millis();
    mqttFailCount = 0;
  } else {
    mqttFailCount++;
    Serial.print("❌ MQTT connect failed, rc=");
    Serial.println(mqttClient.state());

    if (mqttFailCount >= maxMqttFailures) {
      Serial.println("🚨 Too many MQTT failures. Rebooting...");
      delay(1000);
      ESP.restart();
    }
  }
}



void sendRS485Command(uint8_t cmd) {
  rs485_totalCommands++;
  uint8_t packet[6];
  packet[0] = 0xAA;
  packet[1] = DEVICE_ADDR;
  packet[2] = cmd;
  packet[3] = 0x00;
  packet[4] = packet[0] ^ packet[1] ^ packet[2] ^ packet[3]; // CRC
  packet[5] = 0x55;

  const int maxAttempts = 5;
  bool ack = false;

  for (int attempt = 1; attempt <= maxAttempts; attempt++) {
     
      mqttClient.loop();  // ✅ allow MQTT processing
    
    digitalWrite(RS485_DE_RE, HIGH);
    delay(2);
    RS485Serial.write(packet, 6);
    RS485Serial.flush();
    delay(2);
    digitalWrite(RS485_DE_RE, LOW);

    Serial.printf("📤 RS485 Attempt %d: ", attempt);
    for (int i = 0; i < 6; i++) {
      Serial.printf("%02X ", packet[i]);
    }
    Serial.println();

    ack = waitForACK();
    if (ack) {
    rs485_ackSuccess++;
    debugLog("✅ RS485 ACK received");
      Serial.println("✅ ACK received. Command successful.");
      digitalWrite(2,HIGH);
      break;
    } else {
      debugLog("❌ RS485 ACK NOT received");
      Serial.println("⚠ No ACK. Retrying...");
      delay(300);
      digitalWrite(2, LOW);
    }
  }

  if (!ack) {
    Serial.println("❌ Command failed after retries. Receiver may be disconnected.");
// Store the failed command for retry
    if (cmd == CMD_PUMP_ON || cmd == CMD_PUMP_OFF) {
      lastPumpCommand = cmd;
      lastPumpCmdTime = millis();
    } else if (cmd == CMD_VALVE_ON || cmd == CMD_VALVE_OFF) {
      lastValveCommand = cmd;
      lastValveCmdTime = millis();
    }
  } else {
    // Clear stored command if ACK received
    if (cmd == CMD_PUMP_ON || cmd == CMD_PUMP_OFF) {
      lastPumpCommand = 0x00;
    } else if (cmd == CMD_VALVE_ON || cmd == CMD_VALVE_OFF) {
      lastValveCommand = 0x00;
    }
  }
}
void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  Serial.println("SSID");
  Serial.println(ssid);
  Serial.println("PASS");
  Serial.println(password);
  
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    wifi_retries--;
    if(wifi_retries == 0){
      Serial.println("Restarting....");
      ESP.restart();
    }
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("\nWiFi connected!");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());


  //   // ⚠ Lock to sender's channel to make ESP-NOW work
  // esp_wifi_set_promiscuous(true);
  // esp_wifi_set_channel(ESP_NOW_CHANNEL, WIFI_SECOND_CHAN_NONE);
  // esp_wifi_set_promiscuous(false);
}

void maintainTimeSync() {
  if (!timeInitialized) return;

  unsigned long now = millis();

  // Trigger new time sync every 6 hours
  if (!timeSyncInProgress && now - lastTimeSync > TIME_RESYNC_INTERVAL) {
    Serial.println("🔄 Initiating periodic time re-sync...");
    configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org", "time.nist.gov");
    timeSyncInProgress = true;
    timeSyncStart = now;
  }

  // If sync was started, check for completion
  if (timeSyncInProgress) {
    if (getLocalTime(&timeinfo)) {
      lastTimeSync = now;
      timeSyncInProgress = false;
      Serial.println("✅ Time re-synced successfully.");
      Serial.printf("🕒 Current time: %02d:%02d\n", timeinfo.tm_hour, timeinfo.tm_min);
    } else if (now - timeSyncStart > TIME_SYNC_TIMEOUT) {
      Serial.println("❌ Time re-sync timed out.");
      timeSyncInProgress = false;  // Abort current sync attempt
    }
  }
}

void setupTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org", "time.nist.gov");

  Serial.print("⏱ Syncing time");
  int retries = 0;
  while (!getLocalTime(&timeinfo) && retries < 10) {
    Serial.print(".");
    delay(1000);
    retries++;
  }

  if (retries == 10) {
    Serial.println("❌ Failed to sync time");
    ESP.restart();
  } else {
    Serial.println("\n✅ Time synchronized");
    Serial.printf("Current time: %02d:%02d\n", timeinfo.tm_hour, timeinfo.tm_min);
  }
}

void logDeviceStateToCloud(String machineType, bool state) {
  // Add MQTT loop processing
  mqttClient.loop();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected! Buffering log.");
    bufferLog(machineType, state);
    return;
  }

  HTTPClient http;
  String url = "https://gv6dp7jmaj.execute-api.ap-south-1.amazonaws.com/First/testfunction/";
  url += "?org_id=3";
  url += "&service=update";
  url += "&machine=" + machineType;
  url += "&block_id=1";
  url += "&state=" + String(state ? "1" : "0");
  url += "&id=1";
  url += "&mode=ESP";

  Serial.println("🌐 Logging state to: " + url);

  int responseCode = -1;
  bool success = false;

  for (int attempt = 1; attempt <= MAX_HTTP_RETRIES; attempt++) {
    Serial.printf("📡 Attempt %d...\n", attempt);

    http.begin(url);
    http.setTimeout(HTTP_TIMEOUT_MS);

    esp_task_wdt_reset();  // WDT feed before request
    unsigned long start = millis();
    responseCode = http.GET();
    unsigned long end = millis();
    esp_task_wdt_reset();  // WDT feed after request

    if (responseCode == 200) {
      Serial.printf("✅ Log success in %lu ms (HTTP 200)\n", end - start);
      success = true;
      break;
    } else {
      Serial.printf("⚠  HTTP %d: %s\n", responseCode, http.errorToString(responseCode).c_str());
    }

    http.end();
    delay(300);  // Short delay before retry
  }

  if (!success) {
    Serial.println("🛑 All attempts failed. Buffering log.");
    bufferLog(machineType, state);
  }

  // Try flushing any offline logs if success now
  if (success && !offlineLogBuffer.empty()) {
    flushOfflineLogs();
  }
}

void bufferLog(String machineType, bool state) {
  if (offlineLogBuffer.size() >= OFFLINE_BUFFER_LIMIT) {
    Serial.println("⚠ Log buffer full. Discarding oldest entry.");
    offlineLogBuffer.erase(offlineLogBuffer.begin());  // remove oldest
  }

  LogEntry entry = { machineType, state };
  offlineLogBuffer.push_back(entry);

  Serial.printf("📦 Buffered log [%s → %s]. Total buffered: %d\n", 
                machineType.c_str(), state ? "ON" : "OFF", offlineLogBuffer.size());
}

void flushOfflineLogs() {
  if (offlineLogBuffer.empty()) {
    Serial.println("🧺 No offline logs to flush.");
    return;
  }

  Serial.printf("🧹 Flushing %d buffered log(s) (no cloud send)...\n", offlineLogBuffer.size());

  for (const auto& entry : offlineLogBuffer) {
    Serial.printf("🗑 Discarding buffered log: [%s → %s]\n",
                  entry.machineType.c_str(), entry.state ? "ON" : "OFF");
  }

  offlineLogBuffer.clear();

  Serial.println("✅ All buffered logs cleared.");
}


bool waitForACK() {
    
    mqttClient.loop();  // ✅ allow MQTT processing
  
  unsigned long start = millis();
  uint8_t buffer[8];
  int idx = 0;

  while (millis() - start < 5000) {
    if (RS485Serial.available()) {
      uint8_t b = RS485Serial.read();
      if (idx == 0 && b != 0xAA) continue;
      buffer[idx++] = b;
       
       
      if (idx >= 6 && buffer[5] == 0x55) {
 // 🔍 Print entire buffer
         Serial.print("📦 ACK Buffer: ");
        for (int i = 0; i < 6; i++) {
          Serial.printf("%02X ", buffer[i]);
        }
        Serial.println();

        uint8_t crc = buffer[4];
        uint8_t calc_crc = buffer[0] ^ buffer[1] ^ buffer[2] ^ buffer[3];
        if (buffer[2] == CMD_ACK && crc == calc_crc) {
          Serial.println("✅ ACK received");
          if (buffer[3] == CMD_CONNECTED) {
            Serial.println("✅ ACK received - ESP-NOW: CONNECTED");
          } else if (buffer[3] == CMD_DISCONNECTED) {
            Serial.println("✅ ACK received - ESP-NOW: DISCONNECTED");
          } else {
            Serial.println("✅ ACK received - Unknown ESP-NOW status");
          }
          return true;
        }
        else {
          Serial.println("⚠ Invalid ACK or CRC mismatch");
        }

        idx = 0; // 🔄 Reset index after processing
      }
      // Reset if over-read
      if (idx >= 6) idx = 0;
    }
  }
  Serial.println("❌ No ACK received");
  return false;
}

void printDiagnostics() {
  Serial.println("🔧 ===== Diagnostics =====");
  Serial.printf("⏱  Uptime (s):            %lu\n", millis() / 1000);
  Serial.printf("📡 MQTT reconnects:       %d\n", mqtt_reconnects);
  Serial.printf("🕓 Last MQTT msg (s ago): %lu\n", (millis() - lastMqttReceived) / 1000);
  Serial.printf("📨 RS485 cmds sent:       %d\n", rs485_totalCommands);
  Serial.printf("✅ RS485 ACKs received:    %d\n", rs485_ackSuccess);
  Serial.printf("🚰 Pump state:            %s\n", pumpIsOn ? "ON" : "OFF");

  Serial.printf("💡 Heap: %d bytes | MQTT: %s | MQTT State: %d | WiFi RSSI: %d dBm\n",
                ESP.getFreeHeap(),
                mqttClient.connected() ? "Connected" : "Disconnected",
                mqttClient.state(),
                WiFi.RSSI());

  Serial.printf("🌡  Chip temperature:      %.2f °C\n", temperatureRead());
  Serial.println("===========================\n");

  esp_task_wdt_reset();  // 🐶 Feed the watchdog
}



void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  connectToWiFi();

  RS485Serial.begin(RS485_BAUDRATE, SERIAL_8N1, RS485_RXD, RS485_TXD);
  pinMode(RS485_DE_RE, OUTPUT);
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  digitalWrite(RS485_DE_RE, LOW); // Set receiver mode by default

  delay(1000);
  setupTime(); 
  Serial.println("🔄 Fetching initial states...");
                  HTTPClient http;
                  http.begin(pump_url);
                  int httpCode = http.GET();

                  if (httpCode == 200) {
                    String payload = http.getString();
                    Serial.println("✅ Pump response: " + payload);

                    DynamicJsonDocument doc(512);
                    DeserializationError err = deserializeJson(doc, payload);
                    if (!err) {
                      String stateStr = doc["state"];
                      bool pumpState = (stateStr == "1");
                      if (stateStr == "1"){
        pumpIsOn = true;
                    sendRS485Command(CMD_PUMP_ON );  
                      }else{
                        pumpIsOn = false;
                      sendRS485Command(CMD_PUMP_OFF);
                      }
                      Serial.printf("✅ Parsed pump state: %s\n", pumpState ? "ON" : "OFF");
                      
                      String updateUrl = "https://gv6dp7jmaj.execute-api.ap-south-1.amazonaws.com/First/testfunction/";
                      updateUrl += "?org_id=3&service=update&machine=pump&block_id=1";
                      updateUrl += "&state=" + String(pumpState ? "1" : "0");
                      updateUrl += "&id=1&mode=ESP";

                      http.begin(updateUrl);
                      int code = http.GET();
                      if (code == 200) {
                        Serial.println("✅ Initial pump state update sent");
                      } else {
                        Serial.print("❌ Failed to send initial pump state, restarting ESP... Code: ");
                        Serial.println(code);
                        ESP.restart();
                      }
                      http.end();
                    }
                    
                    else {
                      Serial.println("❌ Pump JSON parse error");
                    }
                  } else {
                    Serial.println("❌ Failed to fetch pump state");
                    ESP.restart();
                  }
                  http.end();

  
  connectToAWS();
   // Populate schedules
  fetchFilteredSchedules(valve_schedule_url, "valve_id", "1", valveStart, valveEnd, valveCount);
valveSchedules.clear();
for (int i = 0; i < valveCount; ++i) {
  valveSchedules.push_back({valveStart[i], valveEnd[i]});


}

esp_task_wdt_config_t wdt_config = {
  .timeout_ms = WDT_TIMEOUT * 1000,
  .idle_core_mask = (1 << portNUM_PROCESSORS) - 1,
  .trigger_panic = true,
};
esp_task_wdt_init(&wdt_config);

  esp_task_wdt_add(NULL);  // Add current thread to WDT
    Serial.println("✅ Setup complete.");


}

void loop() {
    esp_task_wdt_reset(); // Feed the watchdog

  maintainTimeSync();  // non-blocking NTP time maintenance
    unsigned long now = millis();
if (millis() - lastTimeSync > 21600000UL) {
  configTime(19800, 0, "pool.ntp.org", "time.nist.gov");
  lastTimeSync = millis();
}

if (WiFi.status() != WL_CONNECTED) {
  Serial.println("🔄 WiFi lost. Reconnecting...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);
}

if (ESP.getFreeHeap() < 50000) {    // Threshold based on load
  Serial.println("⚠ Low heap! Restarting...");
  delay(100);
  ESP.restart();
}

 // Non-blocking reconnect attempt
  if (!mqttClient.connected() && now - lastMqttReconnectAttempt > mqttReconnectInterval) {
    lastMqttReconnectAttempt = now;
    connectToAWS();
  }

  if (WiFi.status() != WL_CONNECTED) ESP.restart();
  mqttClient.loop();

// 💓 Send heartbeat every 20 seconds
if (millis() - lastHeartbeatTime >= heartbeatInterval) {
  sendRS485Command(CMD_HEARTBEAT);
      printDiagnostics();
  lastHeartbeatTime = millis();
}

// ⏳ Retry unsent pump/valve command every 10 seconds
if (lastPumpCommand != 0x00 && millis() - lastPumpCmdTime > 10000) {
  Serial.println("♻ Retrying last pump command...");
  sendRS485Command(lastPumpCommand);
}

if (lastValveCommand != 0x00 && millis() - lastValveCmdTime > 10000) {
  Serial.println("♻ Retrying last valve command...");
  sendRS485Command(lastValveCommand);
}

// 🕒 Check schedules every 1 second
  if (millis() - lastScheduleCheck >= scheduleInterval) {
    Serial.println("Schedule check");
    checkAndTriggerSchedules();
    lastScheduleCheck = millis();
Serial.println("");
Serial.println("VALVEON");
Serial.println(valveIsOn);
Serial.println("PUMPON");
Serial.println(pumpIsOn);
Serial.println("");

  }

  if (millis() > 86400000UL) {
  Serial.println("🔁 24h reached. Restarting...");
  delay(100);
  ESP.restart();
}


}
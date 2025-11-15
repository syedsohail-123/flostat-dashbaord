#include <WiFi.h>
#include <esp_now.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>  // Optional if HTTPS is used
#include <esp_wifi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <time.h>
#include <vector>
#include <HardwareSerial.h>
// #include <esp_task_wdt.h>


// #define WDT_TIMEOUT      30      // Watchdog timeout in seconds
// #define DEBUG_MODE       true    // Set to false to disable logs

#define MAX_RETRIES 30
#define MAX_SCHEDULES 60

struct Schedule {
  String start_time;
  String end_time;
  String schedule_id;
  String device_type;
  String device_id;
};

// ---- Vector stores (used by executor)
std::vector<Schedule> valveSchedules;

// ---- Raw arrays used while parsing HTTP JSON
String valveStart[MAX_SCHEDULES], valveEnd[MAX_SCHEDULES];
int valveCount = 0;

#define MAX_HTTP_RETRIES 3
#define HTTP_TIMEOUT_MS 2000
#define OFFLINE_BUFFER_LIMIT 10

struct LogEntry {
  String machineType;
  bool state;
};

std::vector<LogEntry> offlineLogBuffer;

unsigned long lastScheduleCheck = 0;
unsigned long lastMqttReceived = 0;
unsigned long lastMqttConnect = 0;

unsigned long lastMqttReconnectAttempt = 0;
const unsigned long mqttReconnectInterval = 5000;  // 5 seconds

int mqttFailCount = 0;
const int maxMqttFailures = 12;  // 12 * 5s = 60s



bool initial_valve_state = false;
const unsigned long scheduleInterval = 1000;  // Check every 1 second
bool valveScheduleMatched = false;
bool valveManuallyOverridden = false;
bool valveIsOn = false;
// Time setup for IST




unsigned long lastTimeSync = 0;
const unsigned long TIME_RESYNC_INTERVAL = 6UL * 60 * 60 * 1000;  // every 6 hours

bool timeInitialized = false;
bool timeSyncInProgress = false;
unsigned long timeSyncStart = 0;
const unsigned long TIME_SYNC_TIMEOUT = 10 * 1000;  // 10 seconds timeout


// ==========================
// Global variables
// ==========================
String scheduleStatus = "";
String currentScheduleId = "";
String currentOrgId = "";
String currentDeviceType = "";
String currentDeviceId = "";
String startTime = "";
String status = "";
String endTime = "";
int count = 0;
// Time setup for IST
time_t now;
struct tm timeinfo;

const char* ssid = "Harsh";
const char* password = "12121212";

const long gmtOffset_sec = 19800;  // IST
const int daylightOffset_sec = 0;

const unsigned long PUBLISH_INTERVAL_MS = 30000;
unsigned long lastPublish = 0;
int currentLevel = 10;

// AWS IoT Core
const char* mqtt_server = "a3a6bcyydw1uzn-ats.iot.ap-south-1.amazonaws.com";
const int mqtt_port = 8883;
const char* thingName = "esp32_test";
bool timeInRange(String nowStr, String start, String end) {
  return nowStr >= start && nowStr < end;
}

// Certificates (properly formatted)

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

MIIDWTCCAkGgAwIBAgIUULm+AoRICVpendVTFh5VUHqcCBcwDQYJKoZIhvcNAQEL

BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g

SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI1MDkxODE2NDcz

NFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0

ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANzjwtK4M3NXz1gnQd4Z

iPDzSAESe4gMNANmNpwFzg+coXZdho8+7DPBOBq7kcY0TD1TxajzbCehGKqMp2us

wD5tP6S3zku1ej9t8lw/8Bmo2nV5b/lRzHb+cXJDIXAiY61FuQCJ570LJzr7RAl/

hYF9sRUWk/tu7YX8Ez6ue/6wHlx1Fyl0P7ICct1/2CT+n/BL0hs1UO4xnIGep4XI

3leS0iwOrRhrI+cVoD5MZu6fHXqRFNxnCYWWgl81SRzJNehWfPTocDNf0Zr9RE3m

fvIBhHXbvOJNAp6Z7Mw0BeZruxHq92Ixm79xtNSrXSUDQNkkXra6B35Z239uENiF

uCsCAwEAAaNgMF4wHwYDVR0jBBgwFoAUn+5SXW2WPztDsuhNfldC70PVODQwHQYD

VR0OBBYEFNNIDNZtGwvU4ucfr0LRrHBy1o7EMAwGA1UdEwEB/wQCMAAwDgYDVR0P

AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQAsJb0RKvfLlnBB5Wq/9bB2LkKf

Acllqzq7/qaSNtdQu9xJ44wgrqIw+4NIut4XLpEzt74EUtJ+VM/gm9QB7tnpb8Un

qMPmdbqIXQjI86+77Y6uy7ptejt7hQ/8EFGgfUAs8h1NkQMTZJAXKKTasYv2aZqM

41uI4oPRIC5mvGYmu+gLZvfX27GAJ6b90CDhwV/FKhM8TJfztieryNH3mcNFVSPO

nriofEqYK0HH0cQ04NxCl68amUiPKxnlJZma7to7ZAe+lYdSJx5HaM5hWBr0I3Hb

qzHno61uD3grhbe9Eeondbq0nwyGxC3g4q/zDbnSTWwJ8eXppxhPcn1qzTou

-----END CERTIFICATE----- 

)EOF";



const char* private_key = R"EOF(

-----BEGIN RSA PRIVATE KEY-----

MIIEpAIBAAKCAQEA3OPC0rgzc1fPWCdB3hmI8PNIARJ7iAw0A2Y2nAXOD5yhdl2G

jz7sM8E4GruRxjRMPVPFqPNsJ6EYqoyna6zAPm0/pLfOS7V6P23yXD/wGajadXlv

+VHMdv5xckMhcCJjrUW5AInnvQsnOvtECX+FgX2xFRaT+27thfwTPq57/rAeXHUX

KXQ/sgJy3X/YJP6f8EvSGzVQ7jGcgZ6nhcjeV5LSLA6tGGsj5xWgPkxm7p8depEU

3GcJhZaCXzVJHMk16FZ89OhwM1/Rmv1ETeZ+8gGEddu84k0CnpnszDQF5mu7Eer3

YjGbv3G01KtdJQNA2SRetroHflnbf24Q2IW4KwIDAQABAoIBABw82ZkKhzlFjnIc

gqUb6o+y6g+JB1W7CaMtm+mSLGd+hH2XMy54wsVS/BMey2HlKaHlZa1VgQwH4hlb

ZcO0D9drK+movaycBIa7TXJRkiYVmefOoGvk8xh7KpGK12l4W/m4og/ZkVBvbpJx

sJ7uOGj3Yn3ppv1Ljv3D3cnzkFJcgIb7brZLFTDEpPPDeLsxDR0k089PPIHX+LP0

29te1HtZBxzzoZOq65mzfbQ/rNvQTq2gbP5WhoVkl9OD9TtNKsYjGdQXnDVzYcNe

fAGK2yE4hlCtLB9HqC1d08p9oOUgubApU0G85edBXTAOxJYrTBUXsF2T7YO7Y3p4

oeSn45ECgYEA+VqinhGI4xagfnNYh4Ti71/JzH8Q3cB7VUB6yNt4DYYHTE97cjQe

ohns1Ir3CLSO/RvGdjYYZ39pr8YkUwQVSLf28dMAZJjBy0bfzG3JlcAInml9cXmr

pB9CePiI7OyD244d4PIiXgnrvI//RGPlqaT46CvxIA4l4fQHgoolir0CgYEA4sbp

N1hG7IgD2aKMIqYK74Eb/wFvUXj86Flaodn2X7GoyBuueFTKqlxvRsn2yxVrx7K5

6sW70Ih+bn4Pp7Y9D36KM3X0A6B/IDehD/vFQVEmcQrbLxmOvxW9OvuICazLIBVm

rlStKqMmnvCFk4AoGCOdg/K6YxRDJ6CqEvEf8QcCgYEAiI28FHhh0IrppZYhW0XI

yXJZnuXPJMFuSUegdjLKUg2eHYpBfk9Qn1E3Q0Y+9sN6st3tF3uUbcl25U3LQrMv

vL0SPWhiBLUrG9laYieVh668iZQXoHcTKjP8QSdKRQVZSHlRn4i6jWk9cewhzSAv

+3Fe5jZ6PCXDVTRAkJp66LkCgYA7rDWf/5WiFeRVd0VCtMh531JblqgRGzIJfcGw

hyciZSBRj58oQL+Xdn09dlV/eOKEiM4NLfzO0avbLUa3TefhVN3OzsHn1mq9MoYq

K4jrOAxSgJXOXf5G39SMWbWhPhuxFJCRXOy4JHg8KHQtrPJf77c6CjvraGCHY+p8

04AhLwKBgQCzMre8XkJ2UDtpDVMib9BratjbYOKW/MYPN2f4uDLE6k7pVg5s+H+W

MRZSIBtwMw3jRIy42blokkOXnsoKitrZrzPRztMmnSrdfgNSWCMNq0GJYOl/xeTR

wSy3po2ylMOp1LWE0sUl7McmhTQ4JBY3YI8ltZSETwbfu/xyv4QbiA==

-----END RSA PRIVATE KEY-----

)EOF";


// MQTT Topics
const char* statusTopic = "TOPIC";
// const char* acc1 = "flostat/abfce502-4a3a-42a4-8130-0ce0b559a827/command/fddc7a4e-4ea9-472d-b02f-574c0af41522/valve/8f834950-e6ab-40a3-b9a5-1baa6d5f191f";
// const char* acc1 = "flostat/818d6573-d344-424a-950d-87ca86361730/command/cb49906c-7389-4ca9-a65a-904964c3c091/valve/5dbe54d2-018e-424e-97f9-8e1a8d6f0284";
// const char* acc2 = "flostat/818d6573-d344-424a-950d-87ca86361730/command/cb49906c-7389-4ca9-a65a-904964c3c091/valve/5dbe54d2-018e-424e-97f9-8e1a8d6f0284/hardware";
// const char* acc1 = "flostat/58825c71-76ea-4140-8496-693ea1c27818/command/f3804ca6-e5f9-4b50-9ed7-dd66e53114e2/valve/3a2ed442-10a6-46a5-924b-dda349509ef3";
// const char* acc2 = "flostat/58825c71-76ea-4140-8496-693ea1c27818/command/f3804ca6-e5f9-4b50-9ed7-dd66e53114e2/valve/3a2ed442-10a6-46a5-924b-dda349509ef3/hardware";
const char* acc1 = "flostat/b595d605-fe74-416c-88c0-0e88ed280e56/command/816613d0-fc2f-46ed-973b-6ced08798784/valve/5ed59de5-6191-4900-9bd3-41a204bdf4f1";
const char* acc2 = "flostat/b595d605-fe74-416c-88c0-0e88ed280e56/command/816613d0-fc2f-46ed-973b-6ced08798784/valve/5ed59de5-6191-4900-9bd3-41a204bdf4f1/hardware";

//  sch_url_ https://us9si083nf.execute-api.ap-south-1.amazonaws.com/api/v1/org/getScheduleByOrgId | org_id
const char* scheduleAPI = "https://us9si083nf.execute-api.ap-south-1.amazonaws.com/api/v1/org/getScheduleByOrgId";
const char* updateDeviceStatusApi = "https://us9si083nf.execute-api.ap-south-1.amazonaws.com/api/v1/device/updateDeviceStatus";
// String org_id = "58825c71-76ea-4140-8496-693ea1c27818";
// String valve_id = "3a2ed442-10a6-46a5-924b-dda349509ef3";
String org_id = "b595d605-fe74-416c-88c0-0e88ed280e56";
String valve_id = "5ed59de5-6191-4900-9bd3-41a204bdf4f1";
String pump_id = "";
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ==========================
// Function declarations
// ==========================
void setupTime();
void connectAWS();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void handleScheduleCreatedPayload(String payload);
void handleScheduleUpdatePayload(String payload);
void handleScheduleDeletePayload(String payload);
void sendScheduleAck(String scheduleId, String orgId, String deviceType);
void sendScheduleUpdateAck(String scheduleId, String orgId, String deviceType);
void sendScheduleDeleteAck(String scheduleId, String orgId, String deviceType);
void publishDeviceUpdate();
void checkAndTriggerSchedules();
void fetchFilteredSchedules(const char* url, const String& org_id, const String& device_id, int& count);
void updateDeviceStatus(const char* url, const String& org_id, const String& device_id, const String& device_type, const String& status);
// ==========================
// Setup
// ==========================
void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  pinMode(2, OUTPUT);
  setupTime();
  fetchFilteredSchedules(scheduleAPI, org_id, valve_id, count);
  connectAWS();
}

// ==========================
// Loop
// ==========================
void loop() {
  if (!client.connected()) {
    connectAWS();
  }
  client.loop();

  unsigned long now = millis();
  if (millis() - lastTimeSync > 21600000UL) {
    configTime(19800, 0, "pool.ntp.org", "time.nist.gov");
    lastTimeSync = millis();
  }
  maintainTimeSync();  // non-blocking NTP time maintenance

  // 🕒 Check schedules every 1 second
  if (millis() - lastScheduleCheck >= scheduleInterval) {
    Serial.println("Schedule check");
    checkAndTriggerSchedules();
    lastScheduleCheck = millis();
    Serial.println("");
    Serial.println("VALVEON");
    Serial.println(valveIsOn);
    Serial.println("");
  }
}

// ==========================
// Time setup
// ==========================
void setupTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org", "time.nist.gov");
  Serial.print("⏱ Syncing time");
  struct tm timeinfo;
  int retries = 0;
  while (!getLocalTime(&timeinfo) && retries < 10) {
    Serial.print(".");
    delay(1000);
    retries++;
  }
  if (retries == 10) {
    Serial.println("❌ Failed to obtain time, restarting...");
    ESP.restart();
  }
  Serial.printf("\n✅ Time: %02d:%02d:%02d\n",
                timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
}

// ==========================
// AWS IoT Connect
// ==========================
void connectAWS() {
  client.setKeepAlive(15);
  client.setCallback(mqttCallback);
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(2048);

  espClient.setCACert(root_ca);
  espClient.setCertificate(device_cert);
  espClient.setPrivateKey(private_key);

  while (!client.connected()) {
    Serial.print("Connecting to AWS IoT...");
    if (client.connect(thingName, NULL, NULL, statusTopic, 1, true, "{\"status\":\"ESP32 disconnected\"}")) {
      Serial.println("connected!");
      client.subscribe(statusTopic);
      client.subscribe(acc1);
      client.subscribe(acc2);
      client.publish(statusTopic, "{\"status\":\"connected with AWS\"}", true);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// ==========================
// MQTT Callback
// ==========================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String incomingPayload;
  for (unsigned int i = 0; i < length; i++) {
    incomingPayload += (char)payload[i];
  }
  Serial.println("📩 MQTT Message Received:");
  Serial.println(incomingPayload);

  if (incomingPayload.indexOf("SCHEDULE_CREATED") != -1) {

    handleScheduleCreatedPayload(incomingPayload);
  } else if (incomingPayload.indexOf("SCHEDULE_UPDATE") != -1) {
    handleScheduleUpdatePayload(incomingPayload);
  } else if (incomingPayload.indexOf("SCHEDULE_DELETE") != -1) {
    handleScheduleDeletePayload(incomingPayload);
  }
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

// void fetchFilteredSchedules(const char* url, const String& org_id, const String& valve_id, int& count) {
//   HTTPClient http;
//   http.begin(url);
//   http.addHeader("Content-Type", "application/json");

//   // Create POST body
//   DynamicJsonDocument body(256);
//   body["org_id"] = org_id;
//   String jsonBody;
//   serializeJson(body, jsonBody);
//   Serial.printf("📡 Sending POST request to fetch schedules... %s \n", org_id);
//   Serial.println(jsonBody);

//   int httpCode = http.POST(jsonBody);
//   if (httpCode != 200) {
//     Serial.printf("❌ Failed to fetch schedules, HTTP code: %d\n", httpCode);
//     http.end();
//     return;
//   }

//   String payload = http.getString();
//   http.end();

//   Serial.println("✅ Got response:");
//   Serial.println(payload);
//   DynamicJsonDocument doc(8192);
//   DeserializationError error = deserializeJson(doc, payload);
//   if (error) {
//     Serial.println("❌ JSON parse error");
//     return;
//   }

//   // Clear the previous schedules
//   valveSchedules.clear();

//   JsonArray schedules = doc["schedules"];
//   if (schedules.isNull()) {
//     Serial.println("⚠️ No 'Schedules' array found in response.");
//     return;
//   }
//   for (JsonObject sched : schedules) {
//     Schedule s;
//     s.schedule_id = sched["schedule_id"].as<String>();
//     s.start_time = sched["start_time"].as<String>();
//     s.end_time = sched["end_time"].as<String>();
//     s.device_id = sched["device_id"].as<String>();
//     s.device_type = sched["device_type"].as<String>();
//     JsonObject acknowledge = sched["acknowledge"];
//     bool valve_ack = sched["valve_ack"].as<bool>();
//     bool pump_ack = sched["pump_ack"].as<bool>();
//     String schedule_status = sched["schedule_status"].as<String>();
//     currentOrgId = sched["org_id"].as<String>();
//     Serial.printf("Schedule org_id pump_ack and valve_ack %s ",valve_ack);

//       // Only add valve-type devices
//       if (s.device_id == valve_id && s.device_type == "valve") {

//       // if (!valve_ack) {
//       //   //  send ack for valve
//       //   sendScheduleUpdateAck(s.schedule_id, schedule_status, currentOrgId, s.start_time, s.end_time, "valve");
//       // }
//       // if (!pump_ack) {
//       //   // send ack for pump
//       //   sendScheduleUpdateAck(s.schedule_id, schedule_status, currentOrgId, s.start_time, s.end_time, "pump");
//       // }
//       Serial.printf("Schedule acks v: %d | p: %d |\n",
//                     valve_ack, pump_ack);
//       valveSchedules.push_back(s);
//       Serial.printf("✅ Added Schedule ID: %s | Start: %s | End: %s\n",
//                     s.schedule_id.c_str(),
//                     s.start_time.c_str(),
//                     s.end_time.c_str());
//     }
//     if (valveSchedules.size() >= MAX_SCHEDULES) break;
//   }
//   Serial.printf("📋 Total valve schedules stored: %d\n", valveSchedules.size());
//   for (const auto& sch : valveSchedules) {
//     Serial.printf("⏱ Start: %s | End: %s\n", sch.start_time.c_str(), sch.end_time.c_str());
//   }
//   http.end();
// }
void fetchFilteredSchedules(const char* url, const String& org_id, const String& valve_id, int& count) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument body(256);
  body["org_id"] = org_id;
  String jsonBody;
  serializeJson(body, jsonBody);
  
  Serial.printf("📡 Sending POST request to fetch schedules for org %s\n", org_id.c_str());
  Serial.println(jsonBody);

  int httpCode = http.POST(jsonBody);
  if (httpCode != 200) {
    Serial.printf("❌ Failed to fetch schedules, HTTP code: %d\n", httpCode);
    http.end();
    return;
  }

  String payload = http.getString();
  Serial.println("✅ Got response:");
  Serial.println(payload);

  DynamicJsonDocument doc(16384);
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.printf("❌ JSON parse error: %s\n", error.c_str());
    http.end();
    return;
  }

  valveSchedules.clear();
  JsonArray schedules = doc["schedules"];
  if (schedules.isNull()) {
    Serial.println("⚠️ No 'schedules' array found in response.");
    http.end();
    return;
  }

  for (JsonObject sched : schedules) {
    Schedule s;
    s.schedule_id = sched["schedule_id"].as<String>();
    s.start_time  = sched["start_time"].as<String>();
    s.end_time    = sched["end_time"].as<String>();
    s.device_id   = sched["device_id"].as<String>();
    s.device_type = sched["device_type"].as<String>();
    currentOrgId  = sched["org_id"].as<String>();
    JsonObject ack = sched["acknowledge"];
    Serial.println("🔍 Schedule JSON:");
    serializeJson(sched, Serial);
    Serial.println(); // newline
    bool valve_ack = sched["valve_ack"].as<bool>();
    bool pump_ack  = sched["pump_ack"].as<bool>();
    String schedule_status = sched["schedule_status"].as<String>();

    Serial.printf("Schedule ACKs -> valve:%d | pump:%d\n", valve_ack, pump_ack);

    if (s.device_id == valve_id && s.device_type == "valve" && valve_ack && pump_ack) {
      //   if (!valve_ack) {
      //   //  send ack for valve
      //   sendScheduleUpdateAck(s.schedule_id, schedule_status, currentOrgId, s.start_time, s.end_time, "valve");
      // }
      // if (!pump_ack) {
      //   // send ack for pump
      //   sendScheduleUpdateAck(s.schedule_id, schedule_status, currentOrgId, s.start_time, s.end_time, "pump");
      // }
      valveSchedules.push_back(s);
      Serial.printf("✅ Added Schedule ID: %s | Start: %s | End: %s\n",
                    s.schedule_id.c_str(), s.start_time.c_str(), s.end_time.c_str());
    }

    if (valveSchedules.size() >= MAX_SCHEDULES) break;
  }

  Serial.printf("📋 Total valve schedules stored: %d\n", valveSchedules.size());
  for (const auto& sch : valveSchedules) {
    Serial.printf("⏱ Start: %s | End: %s\n", sch.start_time.c_str(), sch.end_time.c_str());
  }

  http.end();
}


void updateDeviceStatus(const char* url, const String& org_id, const String& device_id, const String& device_type, const String& status) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("hardware", "true");
  // Create POST body
  DynamicJsonDocument body(256);
  body["org_id"] = org_id;
  body["device_type"] = device_type;
  body["device_id"] = device_id;
  body["status"] = status;
  String jsonBody;
  serializeJson(body, jsonBody);
  Serial.printf("📡 Sending PUT request to Update the status... %s \n", org_id);
  Serial.println(jsonBody);

  int httpCode = http.PUT(jsonBody);
  if (httpCode != 200) {
    Serial.printf("❌ Failed to  Update the status, HTTP code: %d\n", httpCode);
    http.end();
    return;
  }

  String payload = http.getString();
  http.end();

  Serial.println("✅ Got response:");
  Serial.println(payload);
  DynamicJsonDocument doc(8192);
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.println("❌ JSON parse error");
    return;
  }


  http.end();
}



// ==========================
// Handle Schedule Payloads
// ==========================
void handleScheduleCreatedPayload(String payload) {
  StaticJsonDocument<2048> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.println("JSON Parse failed for CREATE");
    return;
  }

  JsonObject data = doc["data"];
  Serial.println(data);
  currentScheduleId = data["schedule_id"].as<String>();
  // scheduleStatus = data["valve_ack"].as<String>();
  currentOrgId = data["org_id"].as<String>();
  currentDeviceId = data["device_id"].as<String>();
  currentDeviceType = data["device_type"].as<String>();
  startTime = data["start_time"].as<String>();
  endTime = data["end_time"].as<String>();

  Schedule schedule;
  schedule.start_time = startTime;
  schedule.end_time = endTime;
  schedule.schedule_id = currentScheduleId;
  schedule.device_type = currentDeviceType;
  schedule.device_id = currentDeviceId;
  valveSchedules.push_back(schedule);
  //
  Serial.println("✅ Schedule CREATED: " + currentScheduleId);
  Serial.println("Print All the schedule: ");
  for (const auto& sch : valveSchedules) {
    Serial.printf("⏱ Start: %s | End: %s\n", sch.start_time.c_str(), sch.end_time.c_str());
  }
  // Now send ACKs using the **same incoming payload**
  sendScheduleAck(doc, "pump");
  sendScheduleAck(doc, "valve");
}


void handleScheduleUpdatePayload(String payload) {
  StaticJsonDocument<2048> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.println("JSON Parse failed for UPDATE");
    return;
  }
  JsonObject data = doc["data"];
  currentScheduleId = data["schedule_id"].as<String>();
  currentOrgId = data["org_id"].as<String>();
  scheduleStatus = data["schedule_status"].as<String>();
  currentDeviceType = data["device_type"].as<String>();
  startTime = data["start_time"].as<String>();
  endTime = data["end_time"].as<String>();
  currentDeviceId = data["device_id"].as<String>();
  Serial.printf(" curr device id: %s",currentDeviceId);
 bool isUpdate = false;
  // Serial.println("In comming update: "+startTime+ " "+endTime+" "+currentScheduleId);
  for (int i = 0; i < valveSchedules.size(); ++i) {
    // Serial.println("i");
    // Serial.printf("⏱ curr: %s | storeSch: %s | comp %d \n ", currentScheduleId, valveSchedules[i].schedule_id,valveSchedules[i].schedule_id == currentScheduleId);
    // Serial.printf("valve sch: %s ",valveSchedules[i].schedule_id);
    // Serial.println("sch id check: "+currentScheduleId+" "+ valveSchedules[i].schedule_id + " eq: "+valveSchedules[i].schedule_id == currentScheduleId);

    if (valveSchedules[i].schedule_id == currentScheduleId) {
      Serial.println("Update sch");
      isUpdate = true;
      valveSchedules[i].start_time = startTime;
      valveSchedules[i].end_time = endTime;
    }
  }
  if(!isUpdate){
    Serial.println("Added new Schedule: ");
     Schedule schedule;
  schedule.start_time = startTime;
  schedule.end_time = endTime;
  schedule.schedule_id = currentScheduleId;
  schedule.device_type = currentDeviceType;
  schedule.device_id = currentDeviceId ?currentDeviceId: valve_id;
  valveSchedules.push_back(schedule);
  }
  // Serial.println("✅ Schedule UPDATE: " + currentScheduleId);
  Serial.println("Print All the schedule: ");
  for (const auto& sch : valveSchedules) {
    Serial.printf("⏱ Start: %s |  %s | End: %s\n", sch.schedule_id.c_str(), sch.start_time.c_str(), sch.end_time.c_str());
  }
  sendScheduleUpdateAck(currentScheduleId, scheduleStatus, currentOrgId, startTime, endTime, "pump");
  sendScheduleUpdateAck(currentScheduleId, scheduleStatus, currentOrgId, startTime, endTime, "valve");
}

void handleScheduleDeletePayload(String payload) {
  StaticJsonDocument<2048> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.println("JSON Parse failed for DELETE");
    return;
  }
  JsonObject data = doc["data"];
  currentScheduleId = data["schedule_id"].as<String>();
  scheduleStatus = data["schedule_status"].as<String>();
  currentOrgId = data["org_id"].as<String>();
  currentDeviceType = data["device_type"].as<String>();


  // valveSchedules.push_back(schedule);
  // for(int &sch: valveSchedules){
  //   if(sch.schedule_id==currentScheduleId){
  //     sch.start_time = startTime;
  //     sch.end_time = endTime;
  //   }
  // }

  for (auto it = valveSchedules.begin(); it != valveSchedules.end(); ++it) {
    Serial.println("sch id check: " + currentScheduleId + " " + it->schedule_id + " eq: " + it->schedule_id == currentScheduleId);
    if (it->schedule_id == currentScheduleId) {
      valveSchedules.erase(it);
      Serial.println("🗑 Schedule removed: ");
      break;  // stop after removing one
    }
  }


  Serial.println("✅ Schedule DELETE: " + currentScheduleId);
  Serial.println("Print All the schedule: ");
  for (const auto& sch : valveSchedules) {
    Serial.printf("⏱ Start: %s | End: %s\n", sch.start_time.c_str(), sch.end_time.c_str());
  }
  // sendScheduleDeleteAck(currentScheduleId,scheduleStatus, currentOrgId, currentDeviceType);
  sendScheduleDeleteAck(currentScheduleId, scheduleStatus, currentOrgId, "pump");
  sendScheduleDeleteAck(currentScheduleId, scheduleStatus, currentOrgId, "valve");
}

// ==========================
// Send ACKs
// ==========================
void sendScheduleAck(StaticJsonDocument<2048>& doc, String newDeviceType) {
  JsonObject data = doc["data"];

  // Modify only what is required:
  data["device_type"] = newDeviceType;
  data["ack"] = true;  // Add ACK flag if not present

  // Change the message type
  doc["type"] = "SCHEDULE_ACK";

  // Serialize updated JSON and publish
  String ackPayload;
  serializeJson(doc, ackPayload);

  client.publish(acc1, ackPayload.c_str());
  Serial.println("📤 Sent ACK for device: " + newDeviceType);
}

void checkAndTriggerSchedules() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  localtime_r(&now, &timeinfo);

  char currentTime[6];
  sprintf(currentTime, "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);

  Serial.printf("🕒 Current Time: %s\n", currentTime);

  // 🚰 Check Valve Schedules
  bool valveMatchFound = false;
  for (int i = 0; i < valveSchedules.size(); i++) {
    String start = valveSchedules[i].start_time;
    String end = valveSchedules[i].end_time;

    Serial.printf("🔍 Valve Schedule %d - Start: %s | End: %s\n", i + 1, start.c_str(), end.c_str());

    if (timeInRange(currentTime, start, end)) {
      valveMatchFound = true;
      if (!valveIsOn) {
        // sendRS485Command(CMD_PUMP_ON );
        valveIsOn = true;
        digitalWrite(2, HIGH);
        updateDeviceStatus(updateDeviceStatusApi, org_id, valve_id, "valve", "OPEN");
        valveManuallyOverridden = false;
        // logDeviceStateToCloud("pump", true);
        Serial.println("✅ Pump turned ON by schedule");
      }
    }
  }

  if (!valveMatchFound) {
    if (valveIsOn && valveScheduleMatched && !valveManuallyOverridden) {
      // sendRS485Command(CMD_PUMP_OFF);
      valveIsOn = false;
      digitalWrite(2, LOW);
      Serial.println("⛔ Pump turned OFF (schedule expired)");
      updateDeviceStatus(updateDeviceStatusApi, org_id, valve_id, "valve", "CLOSE");
      // logDeviceStateToCloud("pump", false);
    } else {
      Serial.println("🟡 No valve schedule match, preserving previous state");
    }
  }

  valveScheduleMatched = valveMatchFound;
}
void sendScheduleUpdateAck(String scheduleId, String scheduleStatus, String orgId, String startTime, String endTime, String deviceType) {
  StaticJsonDocument<256> ackDoc;
  ackDoc["type"] = "SCHEDULE_ACK_UPDATE";
  JsonObject data = ackDoc.createNestedObject("data");
  data["schedule_id"] = scheduleId;
  data["schedule_status"] = scheduleStatus;
  data["org_id"] = orgId;
  data["start_time"] = startTime;
  data["end_time"] = endTime;
  data["device_type"] = deviceType;
  data["ack"] = true;
  String ackPayload;
  serializeJson(ackDoc, ackPayload);
  client.publish(acc1, ackPayload.c_str());
}

void sendScheduleDeleteAck(String scheduleId, String scheduleStatus, String orgId, String deviceType) {
  StaticJsonDocument<256> ackDoc;
  ackDoc["type"] = "SCHEDULE_ACK_DELETE";
  JsonObject data = ackDoc.createNestedObject("data");
  data["schedule_id"] = scheduleId;
  data["schedule_status"] = scheduleStatus;
  data["org_id"] = orgId;
  data["device_type"] = deviceType;
  data["ack"] = true;
  String ackPayload;
  serializeJson(ackDoc, ackPayload);
  client.publish(acc1, ackPayload.c_str());
}

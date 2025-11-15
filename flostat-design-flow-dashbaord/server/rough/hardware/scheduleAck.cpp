#include <WiFi.h>

#include <WiFiClientSecure.h>

#include <PubSubClient.h>

#include <time.h>
#include <ArduinoJson.h> 
// Define global variables to store schedule times
String currentScheduleId = "";
String currentOrgId = "";
String currentDeviceType = "";
String startTime = "";
String endTime = "";// Define global variables to store schedule times




// WiFi credential

const char* ssid = "sonysanjay";

const char* password = "Sony1975@sanjay";



const long gmtOffset_sec = 19800;   // IST offset

const int daylightOffset_sec = 0;



const unsigned long PUBLISH_INTERVAL_MS = 30000;

unsigned long lastPublish = 0;

int currentLevel = 10;  // starting level





// AWS IoT Core endpoint



const char* mqtt_server = "a3a6bcyydw1uzn-ats.iot.ap-south-1.amazonaws.com";

const int mqtt_port = 8883;

const char* thingName = "esp32_test";



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



// Topics

const char* statusTopic = "TOPIC";
const char* acc1 ="flostat/b595d605-fe74-416c-88c0-0e88ed280e56/command/816613d0-fc2f-46ed-973b-6ced08798784/valve/5ed59de5-6191-4900-9bd3-41a204bdf4f1";
const char* acc2 ="flostat/b595d605-fe74-416c-88c0-0e88ed280e56/command/816613d0-fc2f-46ed-973b-6ced08798784/valve/5ed59de5-6191-4900-9bd3-41a204bdf4f1/hardware";



WiFiClientSecure espClient;

PubSubClient client(espClient);



void setupTime() {

  configTime(gmtOffset_sec, daylightOffset_sec,

             "pool.ntp.org", "time.nist.gov");

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
void handleScheduleCreatedPayload(String payload) {
  StaticJsonDocument<1024> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.print("❌ JSON Parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  const char* type = doc["type"];
  if (strcmp(type, "SCHEDULE_CREATED") != 0) {
    Serial.println("⚠ Not a SCHEDULE_CREATED message, ignoring...");
    return;
  }

  // Extract main data fields
  JsonObject data = doc["data"];
  currentScheduleId = data["schedule_id"].as<String>();
  currentOrgId      = data["org_id"].as<String>();
  currentDeviceType = data["device_type"].as<String>();
  startTime         = data["start_time"].as<String>();
  endTime           = data["end_time"].as<String>();

  Serial.println("✅ New Schedule Received:");
  Serial.println("  Schedule ID: " + currentScheduleId);
  Serial.println("  Org ID: " + currentOrgId);
  Serial.println("  Device Type: " + currentDeviceType);
  Serial.println("  Start: " + startTime + " | End: " + endTime);

  // Now send acknowledgment back to AWS IoT
  sendScheduleAck(currentScheduleId, currentOrgId, currentDeviceType);
}

void sendScheduleAck(String scheduleId, String orgId, String deviceType) {
  StaticJsonDocument<256> ackDoc;
  
  ackDoc["type"] = "SCHEDULE_ACK";
  JsonObject data = ackDoc.createNestedObject("data");
  data["schedule_id"] = scheduleId;
  data["org_id"] = orgId;
  data["device_type"] = deviceType;
  data["ack"] = true;

  String ackPayload;
  serializeJson(ackDoc, ackPayload);

  // Publish to your AWS IoT MQTT topic

  if (client.publish(acc1, ackPayload.c_str())) {
    Serial.println("📨 Sent Schedule ACK:");
    Serial.println(ackPayload);
  } else {
    Serial.println("❌ Failed to send Schedule ACK");
  }
}


void connectAWS() {

  

  client.setKeepAlive(15);

  client.setCallback(mqttCallback);

  client.setServer(mqtt_server, mqtt_port);

  client.setBufferSize(2048);



  espClient.setCACert(root_ca);

  espClient.setCertificate(device_cert);

  espClient.setPrivateKey(private_key);



  while (!client.connected()) {

    Serial.println();

    Serial.print("Connecting to AWS IoT...");

    // Configure Last Will & Testament

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



// -----------------------------------------------------------------------------

// MQTT callback

// -----------------------------------------------------------------------------

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String incomingPayload;
  for (unsigned int i = 0; i < length; i++) {
    incomingPayload += (char)payload[i];
  }

  Serial.println("📩 MQTT Message Received:");
  Serial.println(incomingPayload);

  // If payload contains a schedule creation event
  if (incomingPayload.indexOf("SCHEDULE_CREATED") != -1) {
    handleScheduleCreatedPayload(incomingPayload);
  }
  // You can keep your other conditions here (for pump/valve control)
}



void setup() {

  Serial.begin(115200);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(1000);

    Serial.println("Connecting to WiFi...");

  }

  Serial.println("WiFi connected");



setupTime();

 



  connectAWS();

}



void loop() {

  if (!client.connected()) {

    connectAWS();

  }

  client.loop();



  unsigned long now = millis();

  if ((now - lastPublish) >= PUBLISH_INTERVAL_MS || now < lastPublish) {

    lastPublish = now;

    publishDeviceUpdate();

  }



  // // Heartbeat every 10 seconds

  // static unsigned long lastMsg = 0;

  // if (millis() - lastMsg > 10000) {

  //   lastMsg = millis();

  //   client.publish("flostat/devices/esp32_test/heartbeat", "{\"ping\":1}");

  // }

}



// -----------------------------------------------------------------------------

// Payload publishing logic

// -----------------------------------------------------------------------------



void publishDeviceUpdate() {

  currentLevel += 10;

  if (currentLevel > 100) currentLevel = 0;



  // Build payload dynamically

  String payload = "{";

  payload += "\"type\":\"DEVICE_UPDATE\",";

  payload += "\"data\":{";

  payload += "\"last_updated\":\"2025-10-03T14:48:17.872Z\",";

  payload += "\"device_id\":\"4f0bb69a-da8a-418d-82d7-fa59fbbfceec\",";

  payload += "\"device_type\":\"tank\",";

  payload += "\"wifi_strength\":65,";

  payload += "\"battery\":85,";

  payload += "\"source\":\"hardware\",";

  payload += "\"org_id\":\"eb507b9c-2059-4e70-8f33-251d08e8e030\",";

  payload += "\"current_level\":" + String(currentLevel) + ",";

  payload += "\"updated_by\":\"hardware\"";

  payload += "},";

  payload += "\"updated_by\":\"hardware\"";

  payload += "}";



  bool ok = client.publish(statusTopic, payload.c_str(), false);

  Serial.printf("📤 Publish DEVICE_UPDATE (current_level=%d) -> %s [%s]\n",

                currentLevel, statusTopic, ok ? "OK" : "FAIL");

}
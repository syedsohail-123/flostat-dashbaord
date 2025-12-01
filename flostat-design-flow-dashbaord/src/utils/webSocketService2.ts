// websocket.ts
import mqtt, { MqttClient } from "mqtt";
import {
  AWS_REGION,
  BASE_RECONNECT_MS,
  DEFAULT_TOPICS,
  IDENTITY_POOL,
  KEEPALIVE_SEC,
  MAX_RECONNECT_MS,
  REFRESH_COOLDOWN_MS,
} from "./constants";
import { store } from "@/store";
import {
  addDisconnectEvent,
  setError,
  setStatus,
} from "@/slice/webSocketSlice";
import { addLog, setBlockMode } from "@/slice/orgSlice";
import { updateDeviceStatus, updateDevicethreshold } from "@/slice/deviceSlice";
import {
  ackScheduleCreate,
  ackScheduleDelete,
  ackScheduleUpdate,
} from "@/slice/scheduleSlice";

// AWS SDK v3 imports
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-browser";
import type { Credentials } from "@aws-sdk/types";
import { createSignedUrl } from "./createSignUrl";

// ---- Types ----
interface MqttMessage {
  type: string;
  data: any;
}

// ---- Module State ----
let client: MqttClient | null = null;
let subscribedTopics: Set<string> = new Set([...DEFAULT_TOPICS]);
let disconnectStartedAt: number | null = null;
let refreshInProgress = false;
let lastRefreshAt = 0;
let forcedClose = false;

// Backoff
let reconnectAttempts = 0;

function nextBackoffMs(): number {
  const exp = Math.min(
    MAX_RECONNECT_MS,
    BASE_RECONNECT_MS * 2 ** reconnectAttempts
  );
  const jitter = Math.floor(Math.random() * (exp * 0.3));
  return Math.max(BASE_RECONNECT_MS, exp - jitter);
}

function resetBackoff() {
  reconnectAttempts = 0;
}

// ---- Public API ----
export function startWebSocket() {
  if (client?.connected || client?.reconnecting) return;

  forcedClose = false;
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  connectInitial();
}

export function stopWebSocket() {
  forcedClose = true;
  window.removeEventListener("online", onOnline);
  window.removeEventListener("offline", onOffline);

  safeEndClient();
  store.dispatch(setStatus("disconnected"));
}

export function publish(
  topic: string,
  payload: any,
  opts: mqtt.IClientPublishOptions = {}
) {
  if (!client || !client.connected) throw new Error("MQTT not connected");

  client.publish(
    topic,
    typeof payload === "string" ? payload : JSON.stringify(payload),
    opts
  );
}

export function subscribe(topic: string) {
  subscribedTopics.add(topic);
  if (client?.connected) client.subscribe(topic);
}

export function subscribeInBatch(topics: Set<string>, batchSize = 5) {
  const topicArray = Array.from(topics);
  for (let i = 0; i < topicArray.length; i += batchSize) {
    const batch = topicArray.slice(i, i + batchSize);

    client?.subscribe(batch, (err, granted) => {
      if (err) {
        console.error("❌ Failed to subscribe batch:", batch, err.message);
      } else {
        console.log(
          "✅ Subscribed batch:",
          granted.map((g) => g.topic)
        );
      }
    });
  }
}

export function unsubscribe(topic: string) {
  subscribedTopics.delete(topic);
  console.log("Unsubscribe all");
  if (client?.connected) client.unsubscribe(topic);
}

export function unsubscribeAll() {
  if (client?.connected) {
    for (const topic of subscribedTopics) client.unsubscribe(topic);
  }
  subscribedTopics.clear();
}

// ---- Connection Flow ----

// --- V3 AWS: Get Cognito Credentials ---
async function getAwsCredentials(): Promise<Credentials> {
  console.log("getAwsCredentials");
  const credsProvider = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: AWS_REGION }),
    identityPoolId: IDENTITY_POOL,
  });
  return credsProvider();
}

// --- Connect Initial ---
async function connectInitial() {
  console.log("Connecting...");
  store.dispatch(setStatus("connecting"));

  try {
    await openMqttWithCurrentCreds();
  } catch (err: any) {
    console.error("Cognito Error:", err);
    store.dispatch(setError(`Cognito Error: ${err.message}`));
    await scheduleReconnect();
  }
}

// --- Open MQTT with given URL ---
async function openMqttWithCurrentCreds() {
  console.log("openMqttWithCurrentCreds");
  const creds = await getAwsCredentials();
  console.log("AWS CREAD: ", creds);
  if (!creds || !creds.accessKeyId) {
    console.error("MISSING AWS CRED", creds);
    store.dispatch(setError("Missing AWS credentials"));
    await scheduleReconnect();
    return;
  }
  const url = await createSignedUrl(creds);
  console.log("Url connect mqtt: ", url);
  client = mqtt.connect(url, {
    clientId: `mqtt-client-${Math.floor(Math.random() * 1e9)}`,
    keepalive: KEEPALIVE_SEC,
    reconnectPeriod: 0,
    clean: true,
  });

  wireClientEvents();
}

// ---- Rest of your code stays the same ----
function wireClientEvents() {
  console.log("wireClientEvents");
  if (!client) return;

  client.on("connect", () => {
    resetBackoff();
    store.dispatch(setStatus("connected"));
    console.log("✅ Connected to AWS IoT");

    if (subscribedTopics.size) subscribeInBatch(subscribedTopics);

    if (disconnectStartedAt) {
      const seconds = Math.round((Date.now() - disconnectStartedAt) / 1000);
      store.dispatch(
        addDisconnectEvent({
          disconnectTime: new Date(disconnectStartedAt).toISOString(),
          duration: seconds,
        })
      );
      disconnectStartedAt = null;
    }
  });

  client.on("message", (topic: string, message: Buffer) => {
    console.log("MSG RECEIVED:", topic, message.toString());
    try {
      const msg: MqttMessage = JSON.parse(message.toString());
      console.log("Parsed message:", msg);

      switch (msg.type) {
        case "DEVICE_UPDATE":
          store.dispatch(addLog(msg.data));
          store.dispatch(updateDeviceStatus(msg.data));
          break;

        case "BLOCK_MODE_UPDATE":
          store.dispatch(setBlockMode(msg.data));
          break;

        case "SCHEDULE_ACK":
          console.log("Schedule ack");
          store.dispatch(ackScheduleCreate(msg.data));
          break;

        case "SCHEDULE_ACK_DELETE":
          console.log("Schedule del ack");
          store.dispatch(ackScheduleDelete(msg.data));
          break;

        case "SCHEDULE_ACK_UPDATE":
          console.log("Schedule update ack");
          store.dispatch(ackScheduleUpdate(msg.data));
          break;

        case "UPDATE_THRESHOLD":
          store.dispatch(updateDevicethreshold(msg.data));
          break;
        case "CONNECT_DISCONNECT_UPDATE":
          store.dispatch(updateDeviceStatus(msg.data));
          break;
      }
    } catch (err) {
      console.error("Invalid JSON:", err);
    }
  });

  client.on("error", async (err: any) => {
    console.error("MQTT Error:", err.message);

    if (String(err.message).includes("403")) {
      await credentialRefreshAndReconnect("403");
      return;
    }

    await scheduleReconnect();
  });

  client.on("close", async () => {
    console.warn("Disconnected, forcedClose:", forcedClose);

    if (forcedClose) return;

    if (!disconnectStartedAt) disconnectStartedAt = Date.now();
    store.dispatch(setStatus("disconnected"));

    if (!navigator.onLine) {
      console.warn("Offline detected, waiting...");
      return;
    }

    await scheduleReconnect();
  });
}

function safeEndClient() {
  console.warn("safeEndClient");
  try {
    client?.removeAllListeners();
    client?.end(true);
  } catch {}
  client = null;
}

// ---- Reconnect Logic ----
let reconnectTimer: NodeJS.Timeout | null = null;

function clearReconnectTimer() {
  console.warn("clearReconnectTimer");
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

async function scheduleReconnect() {
  console.warn("Schedule reconnect ");
  if (forcedClose) return;

  clearReconnectTimer();

  const delay = nextBackoffMs();
  reconnectAttempts++;

  console.warn(`🔁 Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);

  reconnectTimer = setTimeout(async () => {
    clearReconnectTimer();

    if (!navigator.onLine) return;

    safeEndClient();

    try {
      // Get current Cognito creds (AWS SDK v3)
      const creds = await getAwsCredentials();
      const now = Date.now();

      const expireAt = creds.expiration?.getTime?.() || 0;
      const msLeft = expireAt - now;

      const credsExist = !!creds.accessKeyId;
      const credsExpiredSoon = credsExist && msLeft < 60_000; // less than 1 min

      console.warn("🪪 Credential status:", {
        credsExist,
        credsExpiredSoon,
        msLeft,
      });

      if (!credsExist || credsExpiredSoon) {
        console.warn(
          "🔄 Credentials missing/near expiry → refresh & reconnect"
        );
        await credentialRefreshAndReconnect("expire cred");
        return; // Reconnect will happen inside refresh function
      }

      console.warn("🔁 Credentials OK → reconnect with existing creds");
      await openMqttWithCurrentCreds();
    } catch (err) {
      console.error("❌ Error checking credentials:", err);

      // fallback → force refresh and reconnect
      await credentialRefreshAndReconnect("expire cred");
    }
  }, delay);
}

// ---- Credential Refresh ----
async function credentialRefreshAndReconnect(reason = "unknown") {
   console.warn("creds refresh for aws resion ",reason);
  if (refreshInProgress) return;

  const now = Date.now();
  if (now - lastRefreshAt < REFRESH_COOLDOWN_MS) {
    await scheduleReconnect();
    return;
  }

  refreshInProgress = true;
  await getAwsCredentials()
    .then(async (creds) => {
      lastRefreshAt = Date.now();
      refreshInProgress = false;
      clearReconnectTimer();
      safeEndClient();
      // connectInitial();
      await openMqttWithCurrentCreds();
    })
    .catch(async (err) => {
      refreshInProgress = false;
      store.dispatch(setError(`Credential Refresh Failed: ${err.message}`));
      await scheduleReconnect();
    });
}

// ---- Browser Network Events ----
function onOnline() {
  console.log("Browser is online");

  if (forcedClose) return;
  if (client?.connected) return;

  safeEndClient();
  connectInitial();
}

function onOffline() {
  console.warn("Browser offline");
}

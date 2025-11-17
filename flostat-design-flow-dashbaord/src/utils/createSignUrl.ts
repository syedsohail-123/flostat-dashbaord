import { Sha256 } from "@aws-crypto/sha256-browser";
import { toHex } from "@aws-sdk/util-hex-encoding";
import type { Credentials } from "@aws-sdk/types";

import { IOT_ENDPOINT ,AWS_REGION} from "./constants";


// HMAC helper using AWS SDK v3 crypto
async function hmac(key: Uint8Array, data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}

async function sha256(data: string): Promise<string> {
  const hash = new Sha256();
  hash.update(data);
  const digest = await hash.digest();
  return toHex(digest);
}


export async function createSignedUrl(credentials: Credentials) {
  if (!credentials) return null;
 console.log("Create url");
  const endpoint = `wss://${IOT_ENDPOINT}/mqtt`;

  const now = new Date();
  const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const datestamp = amzdate.substring(0, 8);

  const service = "iotdevicegateway";
  const algorithm = "AWS4-HMAC-SHA256";
  const method = "GET";
  const canonicalUri = "/mqtt";

  const credentialScope = `${datestamp}/${AWS_REGION}/${service}/aws4_request`;
  const credential = `${credentials.accessKeyId}/${credentialScope}`;

  // Step 1: Canonical Query
  let canonicalQuerystring = `X-Amz-Algorithm=${algorithm}`;
  canonicalQuerystring += `&X-Amz-Credential=${encodeURIComponent(credential)}`;
  canonicalQuerystring += `&X-Amz-Date=${amzdate}`;
  canonicalQuerystring += `&X-Amz-SignedHeaders=host`;

  const canonicalHeaders = `host:${IOT_ENDPOINT}\n`;
  const signedHeaders = "host";
  const payloadHash = await sha256("");

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const stringToSign = `${algorithm}\n${amzdate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

  // Step 2: Derive key
  const kDate = await hmac(new TextEncoder().encode("AWS4" + credentials.secretAccessKey), datestamp);
  const kRegion = await hmac(kDate, AWS_REGION);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");

  const signature = toHex(await hmac(kSigning, stringToSign));

  // Final URL
  let signedUrl = `${endpoint}?${canonicalQuerystring}&X-Amz-Signature=${signature}`;

  if (credentials.sessionToken) {
    signedUrl += `&X-Amz-Security-Token=${encodeURIComponent(credentials.sessionToken)}`;
  }

  return signedUrl;
}

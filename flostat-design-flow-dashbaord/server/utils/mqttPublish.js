import AWS from "aws-sdk";

// Configure AWS region (optional if using default)
AWS.config.update({ region: process.env.AWS_REGION || "ap-south-1" });

/**
 * Publish a message to AWS IoT Core
 * @param {string} topic - The MQTT topic
 * @param {object} payload - The message payload
 * @returns {Promise<object>} - Success/failure
 */
export async function mqttPublish(topic, payload) {
  try {
    if (!topic) throw new Error("Topic is required");
    if (!payload) throw new Error("Payload is required");

    // Replace with your IoT Core endpoint
    const iotEndpoint = process.env.AWS_IOT_ENDPOINT;
    console.log("IOT END: ",iotEndpoint)
    AWS.config.update({ region: "ap-south-1" });
    const iotData = new AWS.IotData({ endpoint: iotEndpoint });

    console.log("Region:", AWS.config.region);
  
    await iotData.publish({
      topic,
      payload: JSON.stringify(payload),
      qos: 0
    }).promise();

    console.log(`Published to ${topic}:`, payload);
    return { success: true };
  } catch (err) {
    console.error("MQTT publish error:", err);
    return { success: false, error: err.message };
  }
}

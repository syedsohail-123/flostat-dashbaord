import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isLocal = process.env.IS_OFFLINE === "true" || process.env.NODE_ENV === "development";
console.log("LOCAL: ", isLocal);

const dbConfig = {
  region: process.env.AWS_REGION || "ap-south-1",
};

// Only set endpoint for local development
if (isLocal && process.env.DYNAMODB_LOCAL_ENDPOINT) {
  dbConfig.endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT;
}

console.log("DynamoDB Config: ", dbConfig);

let dbClient;
try {
  dbClient = new DynamoDBClient(dbConfig);
  console.log("DynamoDB client created successfully");
} catch (error) {
  console.error("Failed to create DynamoDB client:", error);
  throw error;
}

let ddbDocClient;
try {
  ddbDocClient = DynamoDBDocumentClient.from(dbClient);
  console.log("DynamoDB Document client created successfully");
} catch (error) {
  console.error("Failed to create DynamoDB Document client:", error);
  throw error;
}

export { ddbDocClient };
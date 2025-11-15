import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

console.log("Testing DynamoDB connection...");
console.log("AWS Region:", process.env.AWS_REGION);
console.log("Access Key ID exists:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("Secret Access Key exists:", !!process.env.AWS_SECRET_ACCESS_KEY);

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

async function testConnection() {
  try {
    console.log("Attempting to scan Users table...");
    const command = new ScanCommand({ TableName: process.env.USER_TABLE || "Users" });
    const response = await client.send(command);
    console.log("Successfully connected to DynamoDB!");
    console.log("Found", response.Count, "items in Users table");
    console.log("Sample items:", response.Items.slice(0, 3));
  } catch (error) {
    console.error("Failed to connect to DynamoDB:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    // Print stack trace for more details
    console.error("Stack trace:", error.stack);
  }
}

testConnection();
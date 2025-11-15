// Script to create DynamoDB tables in AWS
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

async function createTable(params) {
  try {
    console.log(`Creating table ${params.TableName}...`);
    const command = new CreateTableCommand(params);
    const response = await client.send(command);
    console.log(`Table ${params.TableName} created successfully:`, response.TableDescription.TableStatus);
    return response;
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`Table ${params.TableName} already exists`);
    } else {
      console.error(`Error creating table ${params.TableName}:`, error.message);
    }
  }
}

async function createAllTables() {
  console.log("Creating DynamoDB tables...");

  // Users table
  await createTable({
    TableName: "Users",
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "email", KeyType: "HASH" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // OtpTable
  await createTable({
    TableName: "OtpTable",
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "email", KeyType: "HASH" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // UserOrgRole table
  await createTable({
    TableName: "UserOrgRole",
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "org_id", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "email", KeyType: "HASH" },
      { AttributeName: "org_id", KeyType: "RANGE" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // OrgTable
  await createTable({
    TableName: "OrgTable",
    AttributeDefinitions: [
      { AttributeName: "org_id", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "org_id", KeyType: "HASH" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // BlockTable
  await createTable({
    TableName: "BlockTable",
    AttributeDefinitions: [
      { AttributeName: "block_id", AttributeType: "S" },
      { AttributeName: "org_id", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "block_id", KeyType: "HASH" },
      { AttributeName: "org_id", KeyType: "RANGE" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // deviceTable
  await createTable({
    TableName: "deviceTable",
    AttributeDefinitions: [
      { AttributeName: "org_id", AttributeType: "S" },
      { AttributeName: "device_id", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "org_id", KeyType: "HASH" },
      { AttributeName: "device_id", KeyType: "RANGE" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // DeviceTokensTable
  await createTable({
    TableName: "DeviceTokensTable",
    AttributeDefinitions: [
      { AttributeName: "token_id", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "token_id", KeyType: "HASH" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // DeviceStatus
  await createTable({
    TableName: "DeviceStatus",
    AttributeDefinitions: [
      { AttributeName: "org_id", AttributeType: "S" },
      { AttributeName: "device_id", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "org_id", KeyType: "HASH" },
      { AttributeName: "device_id", KeyType: "RANGE" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  // LogsTable
  await createTable({
    TableName: "AWS_LogsTable_Table",
    AttributeDefinitions: [
      { AttributeName: "uuid", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "uuid", KeyType: "HASH" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  });

  console.log("All tables processed!");
}

createAllTables().catch(console.error);
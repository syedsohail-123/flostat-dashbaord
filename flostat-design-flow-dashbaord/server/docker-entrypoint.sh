#!/bin/bash
set -e

echo "🚀 Starting DynamoDB Local..."

# Ensure the data directory exists
mkdir -p /home/dynamodblocal/data

# Start DynamoDB Local in background
java -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data &
DYNAMO_PID=$!

# Wait a few seconds for DynamoDB Local to be ready
sleep 5

# Check AWS CLI version
aws --version

# AWS CLI command wrapper for local DynamoDB
AWS="aws --endpoint-url http://localhost:8000 --region ${AWS_DEFAULT_REGION:-ap-south-1}"

echo "✅ AWS CLI wrapper ready"

# ---------- Table Creation Functions ----------
create_table_if_not_exists() {
  local TABLE_NAME=$1
  shift
  if ! $AWS dynamodb describe-table --table-name "$TABLE_NAME" >/dev/null 2>&1; then
    echo "📌 Creating $TABLE_NAME..."
    $AWS dynamodb create-table "$@"
  else
    echo "ℹ️  $TABLE_NAME already exists"
  fi
}

# ---------- Create Tables ----------
create_table_if_not_exists Users \
  --table-name Users \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists OtpTable \
  --table-name OtpTable \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Enable TTL on OtpTable
echo "🔄 Enabling TTL on OtpTable..."
$AWS dynamodb update-time-to-live \
  --table-name OtpTable \
  --time-to-live-specification "Enabled=true, AttributeName=expiresAt" \
  || echo "⚠️  TTL already enabled or update failed"

create_table_if_not_exists UserOrgRole \
  --table-name UserOrgRole \
  --attribute-definitions AttributeName=email,AttributeType=S AttributeName=org_id,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH AttributeName=org_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists OrgTable \
  --table-name OrgTable \
  --attribute-definitions AttributeName=org_id,AttributeType=S \
  --key-schema AttributeName=org_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists BlockTable \
  --table-name BlockTable \
  --attribute-definitions AttributeName=block_id,AttributeType=S AttributeName=org_id,AttributeType=S \
  --key-schema AttributeName=block_id,KeyType=HASH AttributeName=org_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists deviceTable \
  --table-name deviceTable \
  --attribute-definitions AttributeName=org_id,AttributeType=S AttributeName=device_id,AttributeType=S \
  --key-schema AttributeName=org_id,KeyType=HASH AttributeName=device_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists DeviceTokensTable \
  --table-name DeviceTokensTable \
  --attribute-definitions AttributeName=token_id,AttributeType=S \
  --key-schema AttributeName=token_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists DeviceStatus \
  --table-name DeviceStatus \
  --attribute-definitions AttributeName=org_id,AttributeType=S AttributeName=device_id,AttributeType=S \
  --key-schema AttributeName=org_id,KeyType=HASH AttributeName=device_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists LogsTable \
  --table-name LogsTable \
  --attribute-definitions AttributeName=uuid,AttributeType=S \
  --key-schema AttributeName=uuid,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists ValveSchedules \
  --table-name ValveSchedules \
  --attribute-definitions AttributeName=org_id,AttributeType=S AttributeName=schedule_id,AttributeType=S\
  --key-schema AttributeName=org_id,KeyType=HASH AttributeName=schedule_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table_if_not_exists CustomerQuery \
  --table-name CustomerQuery \
  --attribute-definitions AttributeName=org_id,AttributeType=S AttributeName=query_id,AttributeType=S\
  --key-schema AttributeName=org_id,KeyType=HASH AttributeName=query_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
echo "✅ All tables created successfully"
echo "📡 DynamoDB Local is running and ready!"

# Keep the container running by waiting for DynamoDB Local
wait $DYNAMO_PID

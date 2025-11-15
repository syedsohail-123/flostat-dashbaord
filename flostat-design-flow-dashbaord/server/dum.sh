#!/bin/bash
set -e

echo "Starting DynamoDB Local..."
mkdir -p /home/dynamodblocal/data
java -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data &

wait
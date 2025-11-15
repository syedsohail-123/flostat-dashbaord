import json
import boto3
from decimal import Decimal
import datetime
import logging

# Initialize logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("AWS_ValveSchedule_Table")


# Helper class for JSON encoding
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


def handle_schedule_ack(data):
    """Handle schedule acknowledgment update (no nested 'acknowledge' object)."""
    org_id = data.get("org_id")
    schedule_id = data.get("schedule_id")
    device_type = data.get("device_type")
    ack = data.get("ack")

    logger.info(f"Processing ACK for org_id={org_id}, schedule_id={schedule_id}, device_type={device_type}")

    # Validate input
    if not org_id or not schedule_id or not device_type or ack is None:
        raise ValueError("Missing required fields: org_id, schedule_id, device_type, or ack")

    # Determine which ack field to update based on device type
    if device_type == "pump":
        ack_field = "pump_ack"
    elif device_type == "valve":
        ack_field = "valve_ack"
    else:
        raise ValueError(f"Invalid device_type: {device_type}")
    print("Worknasdafs")
    # Build the update expression
    update_expr = f"SET #{ack_field} = :ack, #last_ack_time = :ts"
    expr_attr_names = {
        f"#{ack_field}": ack_field,
        "#last_ack_time": "last_ack_time"
    }
    expr_attr_values = {
        ":ack": ack,
        ":ts": datetime.datetime.utcnow().isoformat()
    }

    # Perform the update
    response = table.update_item(
        Key={
            "org_id": org_id,
            "schedule_id": schedule_id
        },
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values,
        ReturnValues="UPDATED_NEW"
    )

    print("DynamoDB update response: %s", json.dumps(response, cls=DecimalEncoder))

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"Acknowledgement updated for {device_type}",
            "updated": response.get("Attributes", {})
        }, cls=DecimalEncoder)
    }


def lambda_handler(event, context):
    """Main Lambda entry point"""
    logger.info("Received event: %s", json.dumps(event, cls=DecimalEncoder))

    try:
        # If event comes from IoT Rule, decode payload
        if "base64OriginalPayload" in event:
            import base64
            payload = base64.b64decode(event["base64OriginalPayload"]).decode("utf-8")
            event = json.loads(payload)

        action_type = event.get("type")
        data = event.get("data", {})

        if action_type == "SCHEDULE_ACK":
            logger.info("Handling SCHEDULE_ACK event")
            return handle_schedule_ack(data)
        else:
            logger.info("Unhandled event type: %s", action_type)
            return {
                "statusCode": 200,
                "body": json.dumps("Event type not handled")
            }

    except Exception as e:
        logger.error("Error processing event: %s", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

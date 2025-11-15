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
    """Handle schedule creation acknowledgment."""
    org_id = data.get("org_id")
    schedule_id = data.get("schedule_id")
    device_type = data.get("device_type")
    ack = data.get("ack")
    schedule_status = data.get("schedule_status")

    if not org_id or not schedule_id or not device_type or ack is None:
        raise ValueError("Missing required fields: org_id, schedule_id, device_type, or ack")

    if device_type == "pump":
        ack_field = "pump_ack"
    elif device_type == "valve":
        ack_field = "valve_ack"
    else:
        raise ValueError(f"Invalid device_type: {device_type}")

    # Update specific ack field
    update_expr = f"SET #{ack_field} = :ack, #last_ack_time = :ts"
    expr_attr_names = {
        f"#{ack_field}": ack_field,
        "#last_ack_time": "last_ack_time"
    }
    expr_attr_values = {
        ":ack": ack,
        ":ts": datetime.datetime.utcnow().isoformat()
    }

    # Perform partial update
    response = table.update_item(
        Key={
            "org_id": org_id,
            "schedule_id": schedule_id
        },
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values,
        ReturnValues="ALL_NEW"
    )

    # Check both acks — if both True, set status to CREATED
    attributes = response.get("Attributes", {})
    if attributes.get("pump_ack") and attributes.get("valve_ack"):
        table.update_item(
            Key={"org_id": org_id, "schedule_id": schedule_id},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "schedule_status"},
            ExpressionAttributeValues={":status": "CREATED"}
        )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"Creation ACK updated for {device_type}",
            "updated": response.get("Attributes", {})
        }, cls=DecimalEncoder)
    }
def handle_schedule_update_ack(data):
    """Handle schedule update acknowledgment."""
    org_id = data.get("org_id")
    schedule_id = data.get("schedule_id")
    device_type = data.get("device_type")
    ack = data.get("ack")
    schedule_status = data.get("schedule_status")

    if not org_id or not schedule_id or not device_type or ack is None:
        raise ValueError("Missing required fields")

    ack_field = "pump_ack" if device_type == "pump" else "valve_ack"

    # Update the device ACK
    response = table.update_item(
        Key={"org_id": org_id, "schedule_id": schedule_id},
        UpdateExpression=f"SET #{ack_field} = :ack, #last_ack_time = :ts, #status = :status",
        ExpressionAttributeNames={
            f"#{ack_field}": ack_field,
            "#last_ack_time": "last_ack_time",
            "#status": "schedule_status"
        },
        ExpressionAttributeValues={
            ":ack": ack,
            ":ts": datetime.datetime.utcnow().isoformat(),
            ":status": schedule_status
        },
        ReturnValues="ALL_NEW"
    )

    attributes = response.get("Attributes", {})
    # When both ack true → mark schedule_status as UPDATED
    if attributes.get("pump_ack") and attributes.get("valve_ack"):
        table.update_item(
            Key={"org_id": org_id, "schedule_id": schedule_id},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "schedule_status"},
            ExpressionAttributeValues={":status": "UPDATED"}
        )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"Update ACK processed for {device_type}",
            "updated": response.get("Attributes", {})
        }, cls=DecimalEncoder)
    }


def handle_schedule_delete_ack(data):
    """Handle schedule delete acknowledgment."""
    org_id = data.get("org_id")
    schedule_id = data.get("schedule_id")
    device_type = data.get("device_type")
    ack = data.get("ack")
    schedule_status = data.get("schedule_status")

    if not org_id or not schedule_id or not device_type or ack is None:
        raise ValueError("Missing required fields")

    ack_field = "pump_ack" if device_type == "pump" else "valve_ack"

    # Mark delete ack
    response = table.update_item(
        Key={"org_id": org_id, "schedule_id": schedule_id},
        UpdateExpression=f"SET #{ack_field} = :ack, #last_ack_time = :ts, #status = :status",
        ExpressionAttributeNames={
            f"#{ack_field}": ack_field,
            "#last_ack_time": "last_ack_time",
            "#status": "schedule_status"
        },
        ExpressionAttributeValues={
            ":ack": ack,
            ":ts": datetime.datetime.utcnow().isoformat(),
            ":status": schedule_status
        },
        ReturnValues="ALL_NEW"
    )

    attributes = response.get("Attributes", {})

    # ✅ If both acks true → delete schedule
    if attributes.get("pump_ack") and attributes.get("valve_ack"):
        table.delete_item(Key={"org_id": org_id, "schedule_id": schedule_id})
        message = f"Schedule {schedule_id} deleted (both ACKs received)"
    else:
        message = f"Delete ACK received for {device_type}, waiting for other device"

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": message,
            "updated": attributes
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
        elif action_type == "SCHEDULE_ACK_UPDATE":
            print("Update schedule")
            return handle_schedule_update_ack(data)
        elif action_type == "SCHEDULE_ACK_DELETE":
            print("delete schedule")
            return handle_schedule_delete_ack(data)
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

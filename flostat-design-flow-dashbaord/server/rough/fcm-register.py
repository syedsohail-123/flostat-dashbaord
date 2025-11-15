

def register_or_update_fcm_token(org_id, unique_id, fcm_token, device_type):
    """
    Registers or updates an FCM token for a given organization and unique device ID.
    
    Steps:
      1. Checks if an entry for the unique_id (within the org_id) exists.
      2. If it exists:
           a. If the stored FCM token is the same, returns a 200 response indicating "Updated FCM already exists".
           b. If the FCM token is different, updates the SNS endpoint attributes so that the token is updated 
              and then updates the record in DynamoDB with the new datetime. Returns 200 with "FCM Token updated".
      3. If the UID does not exist, creates a new SNS endpoint, stores the UID along with the FCM token, 
         the SNS endpoint ARN, and the registration datetime, then returns 200 with "UID Stored with the FCM".
    """
    table_name = 'device_fcm_tokens_test'
    table = dynamodb.Table(table_name)
    
    # Get current datetime in IST (Indian Standard Time)
    ist_now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    registration_datetime = ist_now.strftime('%Y-%m-%d %H:%M:%S')

    try:
        # Check if the device record exists
        response = table.get_item(Key={'org_id': org_id, 'unique_id': unique_id})
        
        if 'Item' in response:
            # UID exists; get the stored token and endpoint ARN
            stored_item = response['Item']
            stored_fcm_token = stored_item.get('fcm_token')
            stored_device_type = stored_item.get('device_type', None)  # Existing device type (if any)
            endpoint_arn = stored_item.get('sns_endpoint_arn')
            
            if stored_fcm_token == fcm_token and stored_device_type == device_type:
                # FCM token is already up-to-date
                return cors_enabled_response(200, "Updated FCM already exists")
            else:
                # Update the existing SNS endpoint with the new token
                sns.set_endpoint_attributes(
                    EndpointArn=endpoint_arn,
                    Attributes={
                        'Token': fcm_token,
                        'Enabled': 'true'
                    }
                )
                # Update the FCM token and datetime in the DynamoDB record
                table.update_item(
                    Key={'org_id': org_id, 'unique_id': unique_id},
                    UpdateExpression='SET fcm_token = :fcm, registration_datetime = :dt, device_type = :dtype',
                    ExpressionAttributeValues={':fcm': fcm_token, ':dt': registration_datetime, ':dtype': device_type}
                )
                return cors_enabled_response(200, "FCM Token updated")
        else:
            # UID does not exist; create a new SNS endpoint
            sns_response = sns.create_platform_endpoint(
                PlatformApplicationArn=SNS_APPLICATION_ARN,
                Token=fcm_token
            )
            endpoint_arn = sns_response['EndpointArn']
            
            # Store the new record in DynamoDB with the registration datetime
            table.put_item(
                Item={
                    'org_id': org_id,
                    'unique_id': unique_id,
                    'fcm_token': fcm_token,
                    'sns_endpoint_arn': endpoint_arn,
                    'registration_datetime': registration_datetime,  # New field added
                    'device_type': device_type  # Storing the device type
                }
            )
            return cors_enabled_response(200, "UID Stored with the FCM")

    except Exception as e:
        return cors_enabled_response(500, f"Error: {str(e)}")

      
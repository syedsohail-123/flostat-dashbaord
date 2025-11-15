import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

export const createRepository = (tableName, client) => {
  const getById = async (key) => {
    try {
      // console.log("Table: ",tableName)
      console.log(`Attempting to get item from ${tableName} with key:`, key);
      const result = await client.send(
        new GetCommand({ TableName: tableName, Key: key })
      );
      console.log(`Successfully retrieved item from ${tableName}:`, result.Item);
      return result.Item;
    } catch (error) {
      console.error(`Error in getById for table ${tableName}:`, error);
      throw error;
    }
  };

  const create = async (item) => {
    try {
      console.log(`Attempting to create item in ${tableName}:`, item);
      await client.send(
        new PutCommand({ TableName: tableName, Item: item })
      );
      console.log(`Successfully created item in ${tableName}`);
      return item;
    } catch (error) {
      console.error(`Error in create for table ${tableName}:`, error);
      throw error;
    }
  };

  const update = async (key, updates) => {
    try {
      console.log(`Attempting to update item in ${tableName} with key:`, key, "updates:", updates);
      const updateExpression =
        "SET " +
        Object.keys(updates)
          .map((k, i) => `#${k} = :val${i}`)
          .join(", ");

      const expressionAttributeNames = Object.fromEntries(
        Object.keys(updates).map((k) => [`#${k}`, k])
      );
      const expressionAttributeValues = Object.fromEntries(
        Object.values(updates).map((v, i) => [`:val${i}`, v])
      );

      const result = await client.send(
        new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );
      console.log(`Successfully updated item in ${tableName}:`, result.Attributes);
      return result.Attributes;
    } catch (error) {
      console.error(`Error in update for table ${tableName}:`, error);
      throw error;
    }
  };

  const remove = async (key) => {
    try {
      console.log(`Attempting to delete item from ${tableName} with key:`, key);
      await client.send(
        new DeleteCommand({ TableName: tableName, Key: key })
      );
      console.log(`Successfully deleted item from ${tableName}`);
      return true;
    } catch (error) {
      console.error(`Error in remove for table ${tableName}:`, error);
      throw error;
    }
  };
  
  const deleteByTokenOrDeviceId = async (id) => {
    try {
      console.log(`Attempting to delete items from ${tableName} with id:`, id);
      // Scan to find matching items
      const result = await client.send(
        new ScanCommand({
          TableName: tableName,
          FilterExpression: "#tid = :val OR #did = :val",
          ExpressionAttributeNames: {
            "#tid": "token_id",
            "#did": "device_id",
          },
          ExpressionAttributeValues: {
            ":val": id,
          },
        })
      );

      if (!result.Items || result.Items.length === 0) {
        console.log(`No items found in ${tableName} with id:`, id);
        return false; // nothing found
      }
      console.log(`Found items in ${tableName}:`, result.Items);
      // Delete each matching item using token_id (PK)
      for (const item of result.Items) {
        await client.send(
          new DeleteCommand({
            TableName: tableName,
            Key: { token_id: item.token_id },
          })
        );
      }
      console.log(`Successfully deleted items from ${tableName}`);
      return true;
    } catch (error) {
      console.error(`Error in deleteByTokenOrDeviceId for table ${tableName}:`, error);
      throw error;
    }
  };

  const getAll = async () => {
    try {
      console.log(`Attempting to scan all items from ${tableName}`);
      const result = await client.send(new ScanCommand({ TableName: tableName }));
      console.log(`Successfully scanned ${result.Items?.length || 0} items from ${tableName}`);
      return result.Items;
    } catch (error) {
      console.error(`Error in getAll for table ${tableName}:`, error);
      throw error;
    }
  };

  /**
   * Get all items where a given field matches a value.
   * Uses Query if possible (field is part of key schema), otherwise Scan + Filter.
   */
  const getByField = async (fieldName, value) => {
    try {
      console.log(`Attempting to query items from ${tableName} where ${fieldName} =`, value);
      // Try query first
      const result = await client.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: undefined, // set a GSI name here if using one
          KeyConditionExpression: "#field = :val",
          ExpressionAttributeNames: { "#field": fieldName },
          ExpressionAttributeValues: { ":val": value },
        })
      );
      console.log(`Successfully queried ${result.Items?.length || 0} items from ${tableName}`);
      return result.Items;
    } catch (err) {
      console.warn(`Query failed for ${tableName}, falling back to scan:`, err);
      // Fallback to scan + filter
      try {
        const result = await client.send(
          new ScanCommand({
            TableName: tableName,
            FilterExpression: "#field = :val",
            ExpressionAttributeNames: { "#field": fieldName },
            ExpressionAttributeValues: { ":val": value },
          })
        );
        console.log(`Successfully scanned ${result.Items?.length || 0} items from ${tableName}`);
        return result.Items;
      } catch (scanError) {
        console.error(`Error in getByField for table ${tableName}:`, scanError);
        throw scanError;
      }
    }
  };

    /**
   * Append a single object to a list-type field (like "messages").
   * Creates the field if it doesn't exist.
   *
   * @param {Object} key - The primary key (e.g. { org_id, query_id })
   * @param {string} fieldName - The field name to append to (e.g. "messages")
   * @param {Object} newValue - The message object to append
   */
  const appendToListField = async (key, fieldName, newValue) => {
    try {
      console.log(`Appending new object to field "${fieldName}" in ${tableName} for key:`, key);

      const params = {
        TableName: tableName,
        Key: key,
        UpdateExpression: `
          SET #field = list_append(if_not_exists(#field, :emptyList), :newItem),
              updated_at = :now
        `,
        ExpressionAttributeNames: {
          "#field": fieldName,
        },
        ExpressionAttributeValues: {
          ":emptyList": [],
          ":newItem": [newValue], // wraps single object in an array
          ":now": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      };

      const result = await client.send(new UpdateCommand(params));
      console.log(`Successfully appended to ${fieldName} in ${tableName}`);
      return result.Attributes;
    } catch (error) {
      console.error(`Error in appendToListField for ${tableName}:`, error);
      throw error;
    }
  };

    /**
   * Batch update multiple items efficiently.
   * @param {Array<Object>} keys - Array of primary keys ({ org_id, device_id })
   * @param {Object} updates - Fields to update for all items
   */
   const batchUpdate = async(keys,updates)=>{
    console.log(`Batch updating ${keys.length} items in ${tableName}`);
    
    // Build reusable update expression
    const updateExpression = 
        "SET "+
        Object.keys(updates)
        .map((k,i)=> `#${k} = :val${i}`)
        .join(", ");
    
     const expressionAttributeNames = Object.fromEntries(
      Object.keys(updates).map((k) => [`#${k}`, k])
    );
    const expressionAttributeValues = Object.fromEntries(
      Object.values(updates).map((v, i) => [`:val${i}`, v])
    );

      // Run updates in parallel (safe up to ~50–100 at once)
    const updatedValues = await Promise.all(
      keys.map((key) =>
        client.send(
          new UpdateCommand({
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
          })
        )
      )
    );

    console.log(`Batch update complete for ${keys.length} items`);
    // return { updated: keys.length};
    return updatedValues;
   }
  /**
   * Get all items where given fields match values.
   * Uses Query if possible (when fields match key schema), otherwise Scan + Filter.
   *
   * @param {Object} fieldValues - key-value pairs of fields and values
   */
  const getByFields = async (fieldValues) => {
    try {
      console.log(`Attempting to query items from ${tableName} with fields:`, fieldValues);
      // Build KeyConditionExpression (only works if fields match a key or GSI)
      const expressions = [];
      const ExpressionAttributeNames = {};
      const ExpressionAttributeValues = {};

      Object.entries(fieldValues).forEach(([field, value], i) => {
        const nameKey = `#f${i}`;
        const valueKey = `:v${i}`;
        ExpressionAttributeNames[nameKey] = field;
        ExpressionAttributeValues[valueKey] = value;
        expressions.push(`${nameKey} = ${valueKey}`);
      });

      const KeyConditionExpression = expressions.join(" AND ");

      // Try query
      const result = await client.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: undefined, // set if using a GSI
          KeyConditionExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
        })
      );
      console.log(`Successfully queried ${result.Items?.length || 0} items from ${tableName}`);
      return result.Items;
    } catch (err) {
      console.warn(`Query failed for ${tableName}, falling back to scan:`, err);
      // Fallback to Scan + Filter
      try {
        const filterExpressions = [];
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};

        Object.entries(fieldValues).forEach(([field, value], i) => {
          const nameKey = `#f${i}`;
          const valueKey = `:v${i}`;
          ExpressionAttributeNames[nameKey] = field;
          ExpressionAttributeValues[valueKey] = value;
          filterExpressions.push(`${nameKey} = ${valueKey}`);
        });

        const FilterExpression = filterExpressions.join(" AND ");

        const result = await client.send(
          new ScanCommand({
            TableName: tableName,
            FilterExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
          })
        );
        console.log(`Successfully scanned ${result.Items?.length || 0} items from ${tableName}`);
        return result.Items;
      } catch (scanError) {
        console.error(`Error in getByFields for table ${tableName}:`, scanError);
        throw scanError;
      }
    }
  };

  return { appendToListField, getById,deleteByTokenOrDeviceId, batchUpdate, create, update,getByField,getByFields, remove, getAll };
};
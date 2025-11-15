import { LogsTableRepository } from "../models/Models.js";

export const getLogs = async (req, res) => {
  try {
    const { org_id } = req.body;
    
    if (!org_id) {
      return res.status(400).json({
        success: false,
        message: "org_id is required"
      });
    }
    
    // Fetch logs from DynamoDB
    // Try to get logs for the specific org_id
    let logs = [];
    try {
      logs = await LogsTableRepository.getByField("org_id", org_id);
    } catch (queryError) {
      console.warn("Primary query failed, trying scan:", queryError);
      // Fallback to scan if query fails
      try {
        const allLogs = await LogsTableRepository.getAll();
        logs = allLogs.filter(log => log.org_id === org_id);
      } catch (scanError) {
        console.error("Scan also failed:", scanError);
        logs = [];
      }
    }

    // Sort logs by timestamp if available
    if (Array.isArray(logs) && logs.length > 0) {
      logs.sort((a, b) => {
        // Try different timestamp fields that might exist
        const aTime = a.last_updated || a.updated_at || a.timestamp || 0;
        const bTime = b.last_updated || b.updated_at || b.timestamp || 0;
        return new Date(bTime) - new Date(aTime);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logs retrieved successfully",
      logs: Array.isArray(logs) ? logs : [],
      logsCount: Array.isArray(logs) ? logs.length : 0
    });
  } catch (error) {
    console.error("Error in getLogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve logs. Please try again later.",
      error: error.message
    });
  }
};
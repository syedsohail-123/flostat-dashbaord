import {
    DeviceRepository,
    DeviceStatusRepository,
    BlockRepository,
} from "../models/Models.js";
import { device_Type } from "../utils/constants.js";

/**
 * Get SCADA Data - Fetch all devices with their current status for SCADA visualization
 */
export const getSCADAData = async (req, res) => {
    try {
        console.log("SCADA getSCADAData");
        const { org_id } = req.params;

        if (!org_id) {
            return res.status(400).json({
                success: false,
                message: "org_id is required",
            });
        }

        // 1. Get all devices for the organization
        const devices = await DeviceRepository.getByField("org_id", org_id);

        // 2. Get device statuses
        const deviceStatuses = await DeviceStatusRepository.getByField("org_id", org_id);

        // 3. Get blocks to map block_id to block_name
        const blocks = await BlockRepository.getByField("org_id", org_id);
        const blockMap = {};
        if (blocks && blocks.length > 0) {
            blocks.forEach((block) => {
                blockMap[block.block_id] = block.block_name;
            });
        }

        // Convert status to map for quick lookup
        const statusMap = {};
        if (deviceStatuses && deviceStatuses.length > 0) {
            deviceStatuses.forEach((status) => {
                statusMap[status.device_id] = status;
            });
        }

        if (!devices || devices.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No devices found for this organization",
                devices: [],
                tanks: [],
                pumps: [],
                valves: [],
                motors: [],
                sumps: [],
            });
        }

        // 4. Merge device metadata with status and block info
        const devicesWithStatus = devices.map((device) => {
            const statusRecord = statusMap[device.device_id] || {};
            const blockName = blockMap[device.block_id] || device.block_id || "";

            let status = "inactive";
            let value = 0;
            let isOn = false;
            let lastUpdated = null;

            // Determine status based on device type
            if (device.device_type === device_Type.PUMP || device.device_type === device_Type.VALVE) {
                // For pumps and valves, check the status field
                status = statusRecord.status || "inactive";
                isOn = status === "active" || status === "on";

                if (device.device_type === device_Type.PUMP) {
                    value = statusRecord.rpm || (isOn ? 3000 : 0);
                } else {
                    value = statusRecord.opening_percentage || (isOn ? 100 : 0);
                }

                lastUpdated = statusRecord.last_updated || statusRecord.updated_at || null;
            } else if (device.device_type === device_Type.TANK || device.device_type === device_Type.SUMP) {
                // For tanks and sumps, use current_level
                value = statusRecord.current_level || 0;

                // Determine status based on level
                if (value < 10) {
                    status = "error";
                } else if (value < 30) {
                    status = "warning";
                } else {
                    status = "active";
                }

                isOn = true; // Tanks and sumps are always "on"
                lastUpdated = statusRecord.last_updated || null;
            }

            return {
                id: device.device_id,
                device_id: device.device_id,
                name: device.device_name || `${device.device_type} ${device.device_id.slice(0, 8)}`,
                type: device.device_type,
                status,
                value,
                unit: device.device_type === device_Type.PUMP ? "RPM" : "%",
                isOn,
                location: device.location || "Unknown",
                block: blockName,
                block_id: device.block_id,
                parent_id: device.parent_id,
                updated_at: lastUpdated,
            };
        });

        // 5. Group devices by type for easier frontend consumption
        const tanks = devicesWithStatus.filter(d => d.type === device_Type.TANK);
        const pumps = devicesWithStatus.filter(d => d.type === device_Type.PUMP);
        const valves = devicesWithStatus.filter(d => d.type === device_Type.VALVE);
        const sumps = devicesWithStatus.filter(d => d.type === device_Type.SUMP);

        // Motors are typically pumps in this system
        const motors = pumps;

        console.log(`SCADA data fetched: ${devices.length} devices (${tanks.length} tanks, ${pumps.length} pumps, ${valves.length} valves, ${sumps.length} sumps)`);

        return res.status(200).json({
            success: true,
            message: "SCADA data fetched successfully",
            devices: devicesWithStatus,
            tanks,
            pumps,
            valves,
            motors,
            sumps,
        });
    } catch (error) {
        console.error("Error in getSCADAData:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update Device State - Control device on/off state (pumps and valves)
 */
export const updateDeviceState = async (req, res) => {
    try {
        console.log("SCADA updateDeviceState");
        const { device_id, org_id, isOn } = req.body;

        if (!device_id || !org_id || isOn === undefined) {
            return res.status(400).json({
                success: false,
                message: "device_id, org_id, and isOn are required",
            });
        }

        // 1. Get the device to check its type
        const device = await DeviceRepository.getById({ org_id, device_id });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: "Device not found",
            });
        }

        // 2. Only pumps and valves can be controlled
        if (device.device_type !== device_Type.PUMP && device.device_type !== device_Type.VALVE) {
            return res.status(400).json({
                success: false,
                message: "Only pumps and valves can be controlled",
            });
        }

        // 3. Update device status
        const newStatus = isOn ? "active" : "inactive";
        const statusUpdate = {
            status: newStatus,
            last_updated: new Date().toISOString(),
        };

        // Add type-specific fields
        if (device.device_type === device_Type.PUMP) {
            statusUpdate.rpm = isOn ? 3000 : 0; // Default RPM when turning on
        } else if (device.device_type === device_Type.VALVE) {
            statusUpdate.opening_percentage = isOn ? 100 : 0;
        }

        // Check if status record exists
        const existingStatus = await DeviceStatusRepository.getById({ org_id, device_id });

        let updatedStatus;
        if (existingStatus) {
            // Update existing status
            updatedStatus = await DeviceStatusRepository.update(
                { org_id, device_id },
                statusUpdate
            );
        } else {
            // Create new status record
            updatedStatus = await DeviceStatusRepository.create({
                org_id,
                device_id,
                ...statusUpdate,
                created_at: new Date().toISOString(),
            });
        }

        console.log(`Device ${device_id} state updated to ${newStatus}`);

        // TODO: Publish MQTT message for hardware control
        // const mqttPayload = {
        //   type: "DEVICE_CONTROL",
        //   device_id,
        //   org_id,
        //   command: isOn ? "ON" : "OFF",
        //   timestamp: new Date().toISOString(),
        // };
        // await publishMqttMessage(mqttPayload);

        return res.status(200).json({
            success: true,
            message: `Device ${isOn ? "turned on" : "turned off"} successfully`,
            device: {
                device_id,
                status: newStatus,
                isOn,
                updated_at: statusUpdate.last_updated,
            },
        });
    } catch (error) {
        console.error("Error in updateDeviceState:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update SCADA Mode - Switch between auto and manual control modes
 */
export const updateSCADAMode = async (req, res) => {
    try {
        console.log("SCADA updateSCADAMode");
        const { org_id, mode } = req.body;

        if (!org_id || !mode) {
            return res.status(400).json({
                success: false,
                message: "org_id and mode are required",
            });
        }

        if (mode !== "auto" && mode !== "manual") {
            return res.status(400).json({
                success: false,
                message: "mode must be either 'auto' or 'manual'",
            });
        }

        // For now, SCADA mode is primarily frontend state
        // In the future, this could be stored in a settings table or org preferences
        // TODO: Store mode in database for persistence across sessions
        // await OrgSettingsRepository.update({ org_id }, { scada_mode: mode });

        console.log(`SCADA mode for org ${org_id} changed to ${mode}`);

        return res.status(200).json({
            success: true,
            message: `SCADA mode changed to ${mode}`,
            mode,
            org_id,
        });
    } catch (error) {
        console.error("Error in updateSCADAMode:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

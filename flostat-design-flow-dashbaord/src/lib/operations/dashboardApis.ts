// src/services/deviceService.ts
import toast from "react-hot-toast";
import { deviceEndpoints } from "../endPoints";
import { apiClient } from "../httpClient";
import { Device, UpdateDeviceStatusPayload } from "@/components/types/types";

const { GET_DEVICE_WITH_STATUS, UPDATE_DEVICE_STATUS } = deviceEndpoints;

// ------------------ TYPES ------------------



// ------------------ API FUNCTIONS ------------------

// Fetch devices with status
export const getDeviceWithStatus = async (
  org_id: string,
  token: string
): Promise<Device[] | null> => {
  const toastId = toast.loading("Loading devices...");
  try {
    const url = GET_DEVICE_WITH_STATUS.replace(":org_id", org_id);
     const res = await apiClient({
      method: "GET",
      url,
      bodyData: null,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data.success) {
      toast.error(res.data.message || "Failed to fetch devices");
      return null;
    }
    toast.success(res.data.message || "Devices fetched successfully");
    return res.data.devices ?? [];
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch devices";
    toast.error(errorMessage);
    console.error("Error in getDeviceWithStatus:", error);
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Update device status
export const updateDeviceStatus = async (
  data: UpdateDeviceStatusPayload | UpdateDeviceStatusPayload[],
  token: string
): Promise<Device[] | null> => {
  console.log("Update status: ",data);
  const toastId = toast.loading("Updating device status...");
  try {
     const res = await apiClient({
          method: "PUT",
          url:UPDATE_DEVICE_STATUS,
          bodyData: data,
          headers: { Authorization: `Bearer ${token}` },
        });
  
    if (!res.data.success) {
      toast.error(res.data.message || "Failed to update device status");
      return null;
    }
    toast.success(res.data.message || "Device status updated successfully");
    return res.data.devices ?? [];
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to update device status";
    toast.error(errorMessage);
    console.error("Error in updateDeviceStatus:", error);
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

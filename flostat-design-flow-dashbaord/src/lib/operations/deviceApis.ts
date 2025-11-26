// src/services/deviceCrudService.ts

import { apiClient } from "../httpClient";
import { deviceEndpoints } from "../endPoints";
import { Device } from "@/components/types/types";
import { toast } from "sonner";

const {
  DEVICE_CREATE,
  DEVICE_UPDATE,
  DEVICE_DELETE,
  DEVICE_REGISTER,
  GET_ORG_ALL_DEVICE,
  GET_DEVICE_PARENTS_API,
  GET_BLOCK_VALVE,
  UPDATE_THRESHOLD,
} = deviceEndpoints;

// ------------------ TYPES ------------------


export interface DevicePayload {
  org_id: string;
  device_type?: string;
  [key: string]: any;
}

// Helper to avoid repeating headers
const apiClientWithAuth = async (config: any, token: string) => {
  return apiClient({
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};

// ------------------ API FUNCTIONS ------------------

// Update threshold
export const updateThreshold = async (data: any, token: string): Promise<Device | null> => {
  const toastId = toast.loading("Updating threshold...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "PUT",
        url: UPDATE_THRESHOLD,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to update threshold");
      return null;
    }

    toast.success(res.data.message || "Threshold updated successfully");
    return res.data.device || res.data.data;
  } catch (error: any) {
    console.error("Error in updateThreshold:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to update threshold");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Create device
export const deviceCreate = async (
  data: any,
  token: string
): Promise<Device[] | null> => {
  const toastId = toast.loading("Creating device...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "POST",
        url: DEVICE_CREATE,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to create device");
      return null;
    }

    toast.success(res.data.message || "Device created successfully");
    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in deviceCreate:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to create device");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Update device
export const deviceUpdate = async (data: DevicePayload, token: string): Promise<Device[] | null> => {
  const toastId = toast.loading("Updating device...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "PUT",
        url: DEVICE_UPDATE,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to update device");
      return null;
    }

    toast.success(res.data.message || "Device updated successfully");
    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in deviceUpdate:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to update device");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete device
export const deviceDelete = async (data: DevicePayload, token: string): Promise<Device[] | null> => {
  const toastId = toast.loading("Deleting device...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "DELETE",
        url: DEVICE_DELETE,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to delete device");
      return null;
    }

    toast.success(res.data.message || "Device deleted successfully");
    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in deviceDelete:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to delete device");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Register device
export const deviceRegister = async (data: DevicePayload, token: string): Promise<Device[] | null> => {
  const toastId = toast.loading("Registering device...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "POST",
        url: DEVICE_REGISTER,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to register device");
      return null;
    }

    toast.success(res.data.message || "Device registered successfully");
    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in deviceRegister:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to register device");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get all organization devices
export const getOrgAllDevice = async (org_id: string, token: string): Promise<Device[] | null> => {
  const toastId = toast.loading("Fetching devices...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "POST",
        url: GET_ORG_ALL_DEVICE,
        bodyData: { org_id },
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to fetch devices");
      return null;
    }

    toast.dismiss(toastId); // Dismiss loading, show success only if needed
    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in getOrgAllDevice:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to fetch devices");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get device parents
export const getDeviceParents = async (data: any, token: string): Promise<Device[] | null> => {
  const toastId = toast.loading("Fetching parent devices...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "POST",
        url: GET_DEVICE_PARENTS_API,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to fetch parent devices");
      return null;
    }

    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in getDeviceParents:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to fetch parent devices");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get block valve devices
export const getBlockValveApis = async (data: any, token: string): Promise<Device[] | null> => {
  const toastId = toast.loading("Fetching block valves...");
  try {
    const res = await apiClientWithAuth(
      {
        method: "POST",
        url: GET_BLOCK_VALVE,
        bodyData: data,
      },
      token
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to fetch block valves");
      return null;
    }

    return res.data.devices ?? [];
  } catch (error: any) {
    console.error("Error in getBlockValveApis:", error);
    toast.error(error?.response?.data?.message || error?.message || "Failed to fetch block valves");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
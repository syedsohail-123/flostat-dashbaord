import { toast } from "sonner";
import { userEndpoints } from "../endPoints";
import { apiClient } from "../httpClient";

// Extract endpoints
const {
  GET_ALL_ORG_OF_USER,
  INVITE_USER_API,
  ACCEPT_INVITE_API,
  UPDATE_ACCESS_API,
  REMORE_USER_API,
  REGISTER_FCM_API
} = userEndpoints;

// --------------------- Interfaces --------------------- //

export interface Org {
  id: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  users?: T[];
  orgs?: Org[];
  data?: T;
}

// --------------------- Utility --------------------- //

const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unknown error occurred";
};

// --------------------- REGISTER FCM --------------------- //

export const registerFcm = async (
  data: any,
  token: string
): Promise<boolean> => {
  const toastId = toast.loading("Loading...");
  let result = false;

  try {
    const res = await apiClient({
      method: "POST",
      url: REGISTER_FCM_API,
      bodyData: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ApiResponse = res.data;

    if (!response.success) {
      toast.error(response.message || "Failed to register FCM");
      return false;
    }

    toast.success(response.message || "FCM registered successfully");
    result = true;

  } catch (error: any) {
    console.error("Error in registerFcm:", error);
    toast.error(getErrorMessage(error));
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

// --------------------- GET ALL ORGS OF USER --------------------- //

export const getAllOrgsOfUser = async (
  token: string
): Promise<Org[] | null> => {
  const toastId = toast.loading("Loading...");
  let result: Org[] | null = null;

  try {
    const res = await apiClient({
      method: "GET",
      url: GET_ALL_ORG_OF_USER,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ApiResponse = res.data;

    if (!response.success) {
      toast.error(response.message || "Failed to fetch organizations");
      return null;
    }

    result = response.orgs || [];
    toast.success(response.message || "Organizations fetched successfully");

  } catch (error: any) {
    console.error("Error in getAllOrgsOfUser:", error);
    toast.error(getErrorMessage(error));
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

// --------------------- INVITE USER --------------------- //

export const inviteUser = async (
  email: string,
  org_id: string,
  role: string,
  token: string
): Promise<User[] | null> => {
  const toastId = toast.loading("Loading...");
  let result: User[] | null = null;

  try {
    const res = await apiClient({
      method: "POST",
      url: INVITE_USER_API,
      bodyData: { email, org_id, role },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ApiResponse<User> = res.data;

    if (!response.success) {
      toast.error(response.message || "Failed to send invite");
      return null;
    }

    result = response.users || [];
    toast.success(response.message || "User invited successfully");

  } catch (error: any) {
    console.error("Error in inviteUser:", error);
    toast.error(getErrorMessage(error));
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

// --------------------- ACCEPT INVITE --------------------- //

export const acceptInvite = async (
  org_id: string,
  token: string
): Promise<Org[] | null> => {
  const toastId = toast.loading("Loading...");
  let result: Org[] | null = null;

  try {
    const res = await apiClient({
      method: "PUT",
      url: ACCEPT_INVITE_API,
      bodyData: { org_id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ApiResponse = res.data;

    if (!response.success) {
      toast.error(response.message || "Failed to accept invite");
      return null;
    }

    result = response.orgs || [];
    toast.success(response.message || "Invitation accepted successfully");

  } catch (error: any) {
    console.error("Error in acceptInvite:", error);
    toast.error(getErrorMessage(error));
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

// --------------------- UPDATE ACCESS --------------------- //

export const updateAccess = async (
  email: string,
  org_id: string,
  role: string,
  token: string
): Promise<User[] | null> => {
  const toastId = toast.loading("Loading...");
  let result: User[] | null = null;

  try {
    const res = await apiClient({
      method: "PUT",
      url: UPDATE_ACCESS_API,
      bodyData: { email, org_id, role },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ApiResponse<User> = res.data;

    if (!response.success) {
      toast.error(response.message || "Failed to update access");
      return null;
    }

    result = response.users || [];
    toast.success(response.message || "Access updated successfully");

  } catch (error: any) {
    console.error("Error in updateAccess:", error);
    toast.error(getErrorMessage(error));
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

// --------------------- REMOVE USER --------------------- //

export const removeUser = async (
  email: string,
  org_id: string,
  role: string,
  token: string
): Promise<User[] | null> => {
  const toastId = toast.loading("Loading...");
  let result: User[] | null = null;

  try {
    const res = await apiClient({
      method: "DELETE",
      url: REMORE_USER_API,
      bodyData: { email, org_id, role },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response: ApiResponse<User> = res.data;

    if (!response.success) {
      toast.error(response.message || "Failed to remove user");
      return null;
    }

    result = response.users || [];
    toast.success(response.message || "User removed successfully");

  } catch (error: any) {
    console.error("Error in removeUser:", error);
    toast.error(getErrorMessage(error));
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

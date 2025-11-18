import axios, { AxiosRequestConfig, AxiosResponse, Method, AxiosError } from "axios";

// Create axios instance
const axiosInstance = axios.create({});

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error("=== API ERROR ===");
    console.error("Error details:", error);

    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("Request error:", {
        request: error.request,
        message: "No response received from server",
      });
    } else {
      console.error("General error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Request interceptor to log all requests
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => config,
  (error: any) => {
    console.error("=== REQUEST ERROR ===");
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Define interface for apiClient function parameters
interface ApiClientParams {
  method: Method;
  url: string;
  bodyData?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

/**
 * Generic API client function
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param url - API endpoint
 * @param bodyData - Request body data
 * @param headers - Request headers
 * @param params - Query parameters
 * @returns AxiosResponse of type T
 */
export const apiClient = async <T = any>({
  method,
  url,
  bodyData,
  headers,
  params,
}: ApiClientParams): Promise<AxiosResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: bodyData || null,
      headers: {
        ...(bodyData instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      params: params || null,
      withCredentials: false,
    };

    const response = await axiosInstance(config);
    return response as AxiosResponse<T>;
  } catch (error: any) {
    console.error("=== API CLIENT ERROR ===", error);

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - server took too long to respond");
    } else if (error.message.includes("Network Error")) {
      throw new Error("Network error - check if backend is running");
    }
    throw error;
  }
};

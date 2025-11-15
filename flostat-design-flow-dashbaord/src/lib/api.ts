const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

interface OrgData {
  name: string;
  description?: string;
  location?: string;
}

interface CreateDeviceData {
  name: string;
  type: string;
  location: string;
  blockId: string;
}

// Exported request/types expected by the app
export type LoginRequest = LoginCredentials;
export type SignUpRequest = SignUpData;
export interface OtpRequest {
  email: string;
  otp?: string;
}

export interface Device {
  id?: string;
  name: string;
  type: string;
  location?: string;
  blockId?: string;
}

export interface Block {
  id?: string;
  name: string;
  description?: string;
  location?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  }

  async signUp(data: SignUpData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/signUp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Sign up failed');
    }
    
    return response.json();
  }

  // Organization endpoints
  async getOrganizations(): Promise<any> {
    // This would typically require authentication
    // For now, returning mock data
    return Promise.resolve({
      success: true,
      data: []
    });
  }

  async createOrganization(orgData: OrgData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/org/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Would need to include auth token in real implementation
      },
      body: JSON.stringify(orgData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create organization');
    }
    
    return response.json();
  }

  // Device endpoints
  async getDevices(orgId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/device/getOrgDevices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Would need to include auth token and org_id in real implementation
      },
      body: JSON.stringify({ org_id: orgId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    
    return response.json();
  }

  async createDevice(deviceData: CreateDeviceData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/device/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Would need to include auth token in real implementation
      },
      body: JSON.stringify(deviceData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create device');
    }
    
    return response.json();
  }

  // User endpoints
  async getUsers(orgId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/user/getOrgsUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Would need to include auth token and org_id in real implementation
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  }

  // Additional convenience wrappers used by hooks
  async sendOtp(data: OtpRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/sendOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to send OTP');
    return response.json();
  }

  async verifyOtp(data: OtpRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/verifyOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to verify OTP');
    return response.json();
  }

  // Wrapper to match older method name used in hooks
  async getDevicesByOrg(orgId: string): Promise<any> {
    return this.getDevices(orgId);
  }

  // Placeholder: return same as getDevices for now
  async getDevicesWithStatus(orgId: string): Promise<any> {
    return this.getDevices(orgId);
  }

  async updateDevice(deviceData: Partial<CreateDeviceData> & { id?: string }): Promise<any> {
    const id = deviceData.id;
    const response = await fetch(`${this.baseUrl}/api/v1/device/update${id ? `/${id}` : ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) throw new Error('Failed to update device');
    return response.json();
  }

  async deleteDevice(deviceId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/device/delete/${deviceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete device');
    return response.json();
  }

  // Block endpoints (basic implementations)
  async getBlocksByOrg(orgId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/block/getByOrg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org_id: orgId }),
    });
    if (!response.ok) throw new Error('Failed to fetch blocks');
    return response.json();
  }

  async createBlock(blockData: Partial<Block>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/block/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData),
    });
    if (!response.ok) throw new Error('Failed to create block');
    return response.json();
  }

  async updateBlock(blockData: Partial<Block> & { id?: string }): Promise<any> {
    const id = blockData.id;
    const response = await fetch(`${this.baseUrl}/api/v1/block/update${id ? `/${id}` : ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData),
    });
    if (!response.ok) throw new Error('Failed to update block');
    return response.json();
  }

  async deleteBlock(blockId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/block/delete/${blockId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete block');
    return response.json();
  }
}

export const apiService = new ApiService();

// Keep backward-compatible name used across the app
export const apiClient = apiService;
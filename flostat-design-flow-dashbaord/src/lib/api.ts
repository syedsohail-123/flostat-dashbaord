const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  conformPassword?: string;
  contactNumber?: string;
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

// Report interfaces
interface TankRelatedReportParams {
  org_id: string;
  date: string;
  tank_id: string;
}

interface DeviceReportParams {
  org_id: string;
  from_date: string;
  to_date: string;
  device_id: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Method to set the auth token
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<any> {
    console.log("Sending login request with credentials:", credentials);
    
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log("Login response status:", response);
    console.log("Login response headers:", response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login error response:", errorText);
      throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("Login response data:", responseData);
    return responseData;
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
      const errorText = await response.text();
      throw new Error(`Sign up failed: ${response.status} ${response.statusText} - ${errorText}`);
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
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
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
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
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
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
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

  async getUserOrganizations(): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const response = await fetch(`${this.baseUrl}/api/v1/user/getOrgsUser`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // If it's an auth error, provide a more helpful message
      if (response.status === 400 && errorText.includes("No token provided")) {
        throw new Error("Authentication required. Please log in to view organizations.");
      }
      
      throw new Error(`Failed to fetch user organizations: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }

  // Report endpoints
  async getTankRelatedReport(params: TankRelatedReportParams): Promise<any> {
    console.log("Sending request to tankRelatedReport with params:", params);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const response = await fetch(`${this.baseUrl}/api/v1/report/tankRelatedReport`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      // If it's an auth error, provide a more helpful message
      if (response.status === 400 && errorText.includes("No token provided")) {
        throw new Error("Authentication required. Please log in to view reports.");
      }
      
      // Handle organization access error
      if (response.status === 404 && errorText.includes("User does not exit in this org")) {
        throw new Error("User does not exit in this org!");
      }
      
      throw new Error(`Failed to fetch tank related report: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }

  async getDeviceReport(params: DeviceReportParams): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const response = await fetch(`${this.baseUrl}/api/v1/report/deviceReport`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // If it's an auth error, provide a more helpful message
      if (response.status === 400 && errorText.includes("No token provided")) {
        throw new Error("Authentication required. Please log in to view reports.");
      }
      
      throw new Error(`Failed to fetch device report: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }

  
}

export const apiService = new ApiService();
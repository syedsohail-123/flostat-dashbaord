export interface AppSidebarProps {
  components: string;
  setComponents: React.Dispatch<React.SetStateAction<string>>;
}

export interface CreateUserModalProps {
  setUserModel: (open: boolean) => void;
  mode?: "add" | "remove" | "update";
  user?: { email?: string; role?: string } | null;
}

export interface User {
  org_id: string;
  email: string;
  orgName: string;
  role?: "admin" | "controller" | "guest"; // Make role optional
 status: string;
}
export interface Block{
    org_id: string;
    block_name: string;
    block_id?:  string;
    location?: string;
    description?: string;
}
export interface Device {
  device_id: string;
  device_name?: string;
  device_type?: string;
  org_id?: string;
  status?: any;
  current_level?: number;
  min_threshold?: number;
  max_threshold?: number;
  [key: string]: any;
}

export interface Log {
  uuid: string;
  device_type: string;
  status: string;
  last_updated?: string;
  updated_at?: string;
  org_id: string;
  device_id: string;
updated_by: string;
  [key: string]: any;
}
export interface ThresholdPayload {
  org_id?: string;
  device_id?: string;
  block_id?: string;
  min_threshold?: number;
  max_threshold?: number;
}
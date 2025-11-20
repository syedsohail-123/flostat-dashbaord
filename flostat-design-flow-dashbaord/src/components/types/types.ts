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
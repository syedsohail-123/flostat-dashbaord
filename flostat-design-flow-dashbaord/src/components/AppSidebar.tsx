import {
  LayoutDashboard,
  Cpu,
  Users,
  Calendar,
  FileText,
  BarChart3,
  ScanText,
  Activity,
  Settings as SettingsIcon,
  LogOut,
  Headset,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AppSidebarProps {
  components: string;
  setComponents: (component: string) => void;
}

export function AppSidebar({ components, setComponents }: AppSidebarProps) {
  const { open } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      logout();
      navigate("/signin");
      toast.success("You have been signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    }
  };

  const handleBackToOrganizations = () => {
    navigate("/organizations");
  };

  const navigationItems = [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Device Management", id: "devices", icon: Cpu },
    { title: "User Management", id: "users", icon: Users },
    { title: "Schedule Manager", id: "schedule", icon: Calendar },
    { title: "Logs", id: "logs", icon: FileText },
    { title: "Reports", id: "reports", icon: BarChart3 },
    { title: "Text Extractor", id: "ocr", icon: ScanText },
    { title: "SCADA Control", id: "scada", icon: Activity },
    { title: "Customer Support", id: "support", icon: Headset },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Activity className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            {open && (
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">Flostat</h1>
                <p className="text-xs text-sidebar-foreground/70">Industrial IoT Platform</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleBackToOrganizations}
            className="flex items-center gap-2 rounded-md border border-sidebar-border/60 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {open && <span>Back to Organizations</span>}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setComponents(item.id)}
                    isActive={components === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {open && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/80">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-semibold">
              {(user?.name || user?.email || "User")
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            {open && (
              <div className="flex-1">
                <div className="text-sm font-medium truncate">
                  {user?.name || user?.email || "User"}
                </div>
                <div className="text-xs text-sidebar-foreground/70">
                  {user?.email || "Logged in"}
                </div>
              </div>
            )}
          </div>

          <SidebarMenuButton
            onClick={() => setComponents("setting")}
            isActive={components === "setting"}
            className="w-full justify-start"
          >
            <SettingsIcon className="h-5 w-5" />
            {open && <span>Settings</span>}
          </SidebarMenuButton>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-left text-sidebar-foreground/80"
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Sign out</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
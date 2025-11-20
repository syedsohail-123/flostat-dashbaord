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
  LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationSelector } from "@/components/OrganizationSelector";

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
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebarProps } from "./types/types";

const navigationItems = [
  { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
  { title: "Device Management", url: "devices", icon: Cpu },
  { title: "User Management", url: "users", icon: Users },
  { title: "Schedule Manager", url: "schedule", icon: Calendar },
  { title: "Logs", url: "logs", icon: FileText },
  { title: "Reports", url: "reports", icon: BarChart3 },
  { title: "Text Extractor", url: "ocr", icon: ScanText },
  { title: "SCADA Control", url: "scada", icon: Activity },
];



export function AppSidebar({ components, setComponents }: AppSidebarProps) {
  const { open } = useSidebar();
  const { logout, user, currentOrganization } = useAuth();
  const navigate = useNavigate();
  console.log("Selected : ",components)
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

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-6">
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
        {open && currentOrganization && (
          <div className="mt-4">
            <div className="text-xs text-sidebar-foreground/70 mb-1">Current Organization</div>
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {currentOrganization.name}
            </div>
          </div>
        )}
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
                  <SidebarMenuButton asChild>
                    <div 
                     onClick={()=> setComponents(item.url)}
                     
                      className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors rounded-md"
                      // activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Settings link moved to bottom section */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Organization selector */}
        {open && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider px-3">
              Organization
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <OrganizationSelector />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Profile / Sign out section at bottom */}
        <div className="mt-auto p-3 border-t border-sidebar-border space-y-2">
          {/* Profile (non-link) */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/80">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-semibold">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            {open && user && (
              <div className="flex-1">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-sidebar-foreground/70 truncate">{user.email}</div>
              </div>
            )}
          </div>
          {/* Settings (at bottom) */}
          <NavLink 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          >
            <SettingsIcon className="h-5 w-5" />
            {open && <span>Settings</span>}
          </NavLink>
          {/* Sign out */}
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
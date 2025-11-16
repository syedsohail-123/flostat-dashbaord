import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateDeviceModal, EditDeviceModal } from "@/components/CreateDeviceModal"; // Import the new modal
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, QrCode, Search, Edit, Trash2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

// Define types
interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  block: string;
  status: "active" | "inactive" | "warning";
  lastSeen: string;
}

export default function Devices() {
  const { addDevice } = useAuth(); // Get addDevice function from context
  const [createDeviceOpen, setCreateDeviceOpen] = useState(false); // State for device modal
  const [editDeviceOpen, setEditDeviceOpen] = useState(false); // State for edit device modal
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null); // State for device being edited
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch from the backend
      // const response = await apiService.getDevices("current-org-id");
      // For now, we'll use mock data
      const mockDevices: Device[] = [
        { id: "DEV-001", name: "Pump 2", type: "pump", location: "Building A - Floor 1", block: "Block A", status: "active", lastSeen: "2 min ago" },
        { id: "DEV-002", name: "Tank 4", type: "tank", location: "Building A - Floor 2", block: "Block A", status: "active", lastSeen: "5 min ago" },
        { id: "DEV-003", name: "Valve 3", type: "valve", location: "Building B - Ground", block: "Block B", status: "active", lastSeen: "1 min ago" },
        { id: "DEV-004", name: "Pump 1", type: "pump", location: "Building B - Floor 1", block: "Block B", status: "inactive", lastSeen: "1 hour ago" },
        { id: "DEV-005", name: "Valve 1", type: "valve", location: "Building A - Floor 3", block: "Block A", status: "active", lastSeen: "3 min ago" },
        { id: "DEV-006", name: "Valve 4", type: "valve", location: "Building C - Ground", block: "Block C", status: "active", lastSeen: "10 min ago" },
        { id: "DEV-007", name: "Pump AHub", type: "pump", location: "Building C - Floor 2", block: "Block C", status: "active", lastSeen: "4 min ago" },
        { id: "DEV-008", name: "Tank Staff quaters", type: "tank", location: "Building A - Floor 1", block: "Block A", status: "warning", lastSeen: "1 min ago" },
        { id: "DEV-009", name: "Tank AHub", type: "tank", location: "Building D - Floor 1", block: "Block D", status: "warning", lastSeen: "2 min ago" },
        { id: "DEV-010", name: "Pump 3", type: "pump", location: "Building B - Ground", block: "Block B", status: "active", lastSeen: "5 min ago" },
        { id: "DEV-011", name: "Valve 2", type: "valve", location: "Building C - Floor 1", block: "Block C", status: "inactive", lastSeen: "15 min ago" },
      ];
      setDevices(mockDevices);
    } catch (error) {
      toast.error("Failed to fetch devices");
      console.error("Fetch devices error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle device creation
  const handleCreateDevice = (device: {
    name: string;
    type: string;
    location: string;
    description: string;
    blockName: string;
  }) => {
    console.log("Creating device:", device);
    // In a real implementation, this would call the backend
    // await apiService.createDevice(device);
    
    // Add the new device to the list
    const newDevice: Device = {
      id: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: device.name,
      type: device.type,
      location: device.location || "Not specified",
      block: device.blockName, // Use the entered block name
      status: "active", // Default to active
      lastSeen: "Just now"
    };
    
    // Add to local state
    setDevices(prev => [...prev, newDevice]);
    
    // Add to global context so it appears on dashboard
    const dashboardDevice = {
      id: newDevice.id.toLowerCase().replace(/\s+/g, '-'),
      name: device.name,
      type: device.type,
      status: "active",
      value: device.type === "pump" ? 0 : device.type === "tank" ? 5000 : 75,
      unit: device.type === "pump" ? "RPM" : device.type === "tank" ? "L" : "%",
      threshold: device.type === "pump" ? { min: 2000, max: 4000 } : 
                device.type === "tank" ? { min: 5000, max: 10000 } : 
                { min: 0, max: 100 },
      location: device.location || "Not specified",
      block: device.blockName, // Use the entered block name
      uptime: "0%",
      lastSync: "Just now"
    };
    
    addDevice(dashboardDevice);
    
    // Save block to localStorage so it appears in dashboard
    saveBlockToDeviceStorage(device.blockName);
    
    // Save device to localStorage so dashboard can access it
    saveDeviceToDashboardStorage(dashboardDevice);
    
    toast.success("Device created successfully");
  };
  
  // Handle device editing
  const handleEditDevice = (updatedDevice: Device) => {
    // Update device in local state
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
    
    // Update device in localStorage for dashboard
    const storedDevices = localStorage.getItem('dashboardDevices');
    if (storedDevices) {
      try {
        let devices = JSON.parse(storedDevices);
        const dashboardDevice = {
          id: updatedDevice.id.toLowerCase().replace(/\s+/g, '-'),
          name: updatedDevice.name,
          type: updatedDevice.type,
          status: updatedDevice.status,
          value: updatedDevice.type === "pump" ? 0 : updatedDevice.type === "tank" ? 5000 : 75,
          unit: updatedDevice.type === "pump" ? "RPM" : updatedDevice.type === "tank" ? "L" : "%",
          threshold: updatedDevice.type === "pump" ? { min: 2000, max: 4000 } : 
                    updatedDevice.type === "tank" ? { min: 5000, max: 10000 } : 
                    { min: 0, max: 100 },
          location: updatedDevice.location || "Not specified",
          block: updatedDevice.block,
          uptime: "0%",
          lastSync: "Just now"
        };
        
        devices = devices.map((device: any) => 
          device.id === dashboardDevice.id ? dashboardDevice : device
        );
        
        localStorage.setItem('dashboardDevices', JSON.stringify(devices));
        // Dispatch event to notify dashboard of the update
        window.dispatchEvent(new CustomEvent('devicesUpdated'));
      } catch (e) {
        console.error('Failed to update devices in localStorage', e);
      }
    }
    
    toast.success("Device updated successfully");
  };
  
  // Handle device deletion
  const handleDeleteDevice = (deviceId: string) => {
    setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
    
    // Remove device from localStorage
    const storedDevices = localStorage.getItem('dashboardDevices');
    if (storedDevices) {
      try {
        let devices = JSON.parse(storedDevices);
        devices = devices.filter((device: any) => device.id !== deviceId.toLowerCase().replace(/\s+/g, '-'));
        localStorage.setItem('dashboardDevices', JSON.stringify(devices));
        // Dispatch event to notify dashboard of the update
        window.dispatchEvent(new CustomEvent('devicesUpdated'));
      } catch (e) {
        console.error('Failed to update devices in localStorage', e);
      }
    }
    
    toast.success("Device deleted successfully");
  };

  // Save device to localStorage for dashboard
  const saveDeviceToDashboardStorage = (device: any) => {
    // Get existing dashboard devices from localStorage
    const storedDevices = localStorage.getItem('dashboardDevices');
    let devices = storedDevices ? JSON.parse(storedDevices) : [];
    
    // Add new device
    devices = [...devices, device];
    localStorage.setItem('dashboardDevices', JSON.stringify(devices));
    
    // Dispatch a custom event to notify dashboard of the update
    window.dispatchEvent(new CustomEvent('devicesUpdated'));
  };
  
  // Save block to localStorage
  const saveBlockToDeviceStorage = (blockName: string) => {
    // Get existing blocks from localStorage
    const storedBlocks = localStorage.getItem('blocks');
    let blocks = storedBlocks ? JSON.parse(storedBlocks) : [];
    
    // Check if block already exists
    const blockExists = blocks.some((block: any) => block.name === blockName);
    
    // If block doesn't exist, add it
    if (!blockExists) {
      const newBlock = {
        id: `block-${Date.now()}`, // Generate unique ID
        name: blockName,
        location: "Not specified"
      };
      
      blocks = [...blocks, newBlock];
      localStorage.setItem('blocks', JSON.stringify(blocks));
      
      // Dispatch a custom event to notify other components of the update
      window.dispatchEvent(new CustomEvent('blocksUpdated'));
    }
  };

  const filteredDevices = devices.filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--aqua))] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-soft">Device Management</h1>
          <p className="text-soft-muted mt-1">Manage and monitor all connected devices</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="gap-2 h-10 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5"
            onClick={() => setCreateDeviceOpen(true)} // Open device creation modal
          >
            <Plus className="h-4 w-4" />
            Create Device
          </Button>
          <Button className="gap-2 h-10 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5">
            <QrCode className="h-4 w-4" />
            QR Register
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-muted" />
          <Input
            placeholder="Search devices by name or ID..."
            className="pl-9 transition-smooth focus:shadow-soft-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card shadow-soft-lg animate-slideUp">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold text-soft">Device ID</TableHead>
              <TableHead className="font-semibold text-soft">Name</TableHead>
              <TableHead className="font-semibold text-soft">Type</TableHead>
              <TableHead className="font-semibold text-soft">Block</TableHead>
              <TableHead className="font-semibold text-soft">Status</TableHead>
              <TableHead className="text-right font-semibold text-soft">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => (
              <TableRow key={device.id} className="hover:bg-muted/20 transition-smooth">
                <TableCell className="font-mono text-sm text-soft">{device.id}</TableCell>
                <TableCell className="font-medium text-soft">{device.name}</TableCell>
                <TableCell>
                  <span className="rounded-md bg-muted/50 px-2 py-1 text-xs font-medium capitalize text-soft-muted">
                    {device.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-[hsl(var(--navy))] text-white shadow-soft-sm">
                    {device.block}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={device.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:shadow-soft-sm transition-smooth"
                      onClick={() => {
                        setDeviceToEdit(device);
                        setEditDeviceOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:shadow-soft-sm transition-smooth"
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive/90" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Add the CreateDeviceModal */}
      <CreateDeviceModal
        open={createDeviceOpen}
        onOpenChange={setCreateDeviceOpen}
        onCreateDevice={handleCreateDevice}
      />
      
      {/* Add the EditDeviceModal */}
      <EditDeviceModal
        open={editDeviceOpen}
        onOpenChange={setEditDeviceOpen}
        onEditDevice={handleEditDevice}
        deviceToEdit={deviceToEdit}
      />
    </div>
  );
}
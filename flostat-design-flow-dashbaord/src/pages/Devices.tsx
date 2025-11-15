import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateBlockModal } from "@/components/CreateBlockModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, QrCode, Search, Edit, Trash2, Building2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

// Mock data - in a real implementation, this would come from the backend
const blocks = [
  { id: "block-a", name: "Block A" },
  { id: "block-b", name: "Block B" },
  { id: "block-c", name: "Block C" },
  { id: "block-d", name: "Block D" },
];

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
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
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
        { id: "DEV-001", name: "Pump 2", type: "pump", location: "Building A - Floor 1", block: "block-a", status: "active", lastSeen: "2 min ago" },
        { id: "DEV-002", name: "Tank 4", type: "tank", location: "Building A - Floor 2", block: "block-a", status: "active", lastSeen: "5 min ago" },
        { id: "DEV-003", name: "Valve 3", type: "valve", location: "Building B - Ground", block: "block-b", status: "active", lastSeen: "1 min ago" },
        { id: "DEV-004", name: "Pump 1", type: "pump", location: "Building B - Floor 1", block: "block-b", status: "inactive", lastSeen: "1 hour ago" },
        { id: "DEV-005", name: "Valve 1", type: "valve", location: "Building A - Floor 3", block: "block-a", status: "active", lastSeen: "3 min ago" },
        { id: "DEV-006", name: "Valve 4", type: "valve", location: "Building C - Ground", block: "block-c", status: "active", lastSeen: "10 min ago" },
        { id: "DEV-007", name: "Pump AHub", type: "pump", location: "Building C - Floor 2", block: "block-c", status: "active", lastSeen: "4 min ago" },
        { id: "DEV-008", name: "Tank Staff quaters", type: "tank", location: "Building A - Floor 1", block: "block-a", status: "warning", lastSeen: "1 min ago" },
        { id: "DEV-009", name: "Tank AHub", type: "tank", location: "Building D - Floor 1", block: "block-d", status: "warning", lastSeen: "2 min ago" },
        { id: "DEV-010", name: "Pump 3", type: "pump", location: "Building B - Ground", block: "block-b", status: "active", lastSeen: "5 min ago" },
        { id: "DEV-011", name: "Valve 2", type: "valve", location: "Building C - Floor 1", block: "block-c", status: "inactive", lastSeen: "15 min ago" },
      ];
      setDevices(mockDevices);
    } catch (error) {
      toast.error("Failed to fetch devices");
      console.error("Fetch devices error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlock = (block: {
    name: string;
    location: string;
    description: string;
  }) => {
    console.log("Creating block:", block);
    // In a real implementation, this would call the backend
    // await apiService.createBlock(block);
    toast.success("Block created successfully");
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
          >
            <Plus className="h-4 w-4" />
            Create Device
          </Button>
          <Button className="gap-2 h-10 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5">
            <QrCode className="h-4 w-4" />
            QR Register
          </Button>
          <Button
            className="gap-2 h-10 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5"
            onClick={() => setCreateBlockOpen(true)}
          >
            <Building2 className="h-4 w-4" />
            Create Block
          </Button>
        </div>
      </div>

      <CreateBlockModal
        open={createBlockOpen}
        onOpenChange={setCreateBlockOpen}
        onCreateBlock={handleCreateBlock}
      />

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
                    {blocks.find(b => b.id === device.block)?.name || device.block}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={device.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="hover:shadow-soft-sm transition-smooth">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:shadow-soft-sm transition-smooth">
                      <Trash2 className="h-4 w-4 text-destructive/90" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
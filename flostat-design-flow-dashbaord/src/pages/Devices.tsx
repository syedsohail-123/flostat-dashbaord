import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, QrCode, Search, Edit, Trash2, Building2 } from "lucide-react";
import { CreateBlockModal } from "@/components/CreateBlockModal";

const blocks = [
  { id: "block-a", name: "Block A" },
  { id: "block-b", name: "Block B" },
  { id: "block-c", name: "Block C" },
  { id: "block-d", name: "Block D" },
];

const devices = [
  { id: "DEV-001", name: "Pump 2", type: "pump", location: "Building A - Floor 1", block: "block-a", status: "active" as const, lastSeen: "2 min ago" },
  { id: "DEV-002", name: "Tank 4", type: "tank", location: "Building A - Floor 2", block: "block-a", status: "active" as const, lastSeen: "5 min ago" },
  { id: "DEV-003", name: "Valve 3", type: "valve", location: "Building B - Ground", block: "block-b", status: "active" as const, lastSeen: "1 min ago" },
  { id: "DEV-004", name: "Pump 1", type: "pump", location: "Building B - Floor 1", block: "block-b", status: "inactive" as const, lastSeen: "1 hour ago" },
  { id: "DEV-005", name: "Valve 1", type: "valve", location: "Building A - Floor 3", block: "block-a", status: "active" as const, lastSeen: "3 min ago" },
  { id: "DEV-006", name: "Valve 4", type: "valve", location: "Building C - Ground", block: "block-c", status: "active" as const, lastSeen: "10 min ago" },
  { id: "DEV-007", name: "Pump AHub", type: "pump", location: "Building C - Floor 2", block: "block-c", status: "active" as const, lastSeen: "4 min ago" },
  { id: "DEV-008", name: "Tank Staff quaters", type: "tank", location: "Building A - Floor 1", block: "block-a", status: "warning" as const, lastSeen: "1 min ago" },
  { id: "DEV-009", name: "Tank AHub", type: "tank", location: "Building D - Floor 1", block: "block-d", status: "warning" as const, lastSeen: "2 min ago" },
  { id: "DEV-010", name: "Pump 3", type: "pump", location: "Building B - Ground", block: "block-b", status: "active" as const, lastSeen: "5 min ago" },
  { id: "DEV-011", name: "Valve 2", type: "valve", location: "Building C - Floor 1", block: "block-c", status: "inactive" as const, lastSeen: "15 min ago" },
];

export default function Devices() {
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [createDeviceOpen, setCreateDeviceOpen] = useState(false);
  const [qrRegisterOpen, setQrRegisterOpen] = useState(false);
  const [updateDeviceOpen, setUpdateDeviceOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [deviceList, setDeviceList] = useState(devices);
  const [qrForm, setQrForm] = useState({
    block: "",
    token: "",
    name: "",
  });
  const [editingDevice, setEditingDevice] = useState<typeof devices[0] | null>(null);
  const [editForm, setEditForm] = useState({
    block: "",
    name: "",
  });
  const [removeDeviceOpen, setRemoveDeviceOpen] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState<typeof devices[0] | null>(null);

  const handleCreateBlock = (block: {
    name: string;
    location: string;
    description: string;
  }) => {
    console.log("Creating block:", block);
    // Handle block creation
  };

  const handleCreateDevice = () => {
    if (!selectedDeviceType) {
      alert("Please select a device type");
      return;
    }
    
    // Generate new device ID
    const newId = `DEV-${String(deviceList.length + 1).padStart(3, "0")}`;
    
    // Create new device object
    const newDevice = {
      id: newId,
      name: `${selectedDeviceType.charAt(0).toUpperCase() + selectedDeviceType.slice(1)} ${deviceList.length + 1}`,
      type: selectedDeviceType,
      location: "New Location",
      block: "block-a",
      status: "active" as const,
      lastSeen: "just now"
    };
    
    // Add to device list
    setDeviceList([...deviceList, newDevice]);
    
    console.log("Device created:", newDevice);
    alert(`Device created: ${newDevice.name}`);
    setCreateDeviceOpen(false);
    setSelectedDeviceType("");
  };

  const handleQrRegister = () => {
    if (!qrForm.block || !qrForm.token || !qrForm.name) {
      alert("Please fill in all fields");
      return;
    }

    // Generate new device ID
    const newId = `DEV-${String(deviceList.length + 1).padStart(3, "0")}`;
    
    // Create new device object from QR
    const newDevice = {
      id: newId,
      name: qrForm.name,
      type: "sensor",
      location: "QR Registered",
      block: qrForm.block,
      status: "active" as const,
      lastSeen: "just now"
    };
    
    // Add to device list
    setDeviceList([...deviceList, newDevice]);
    
    console.log("Device registered via QR:", newDevice);
    alert(`Device registered: ${newDevice.name}`);
    setQrRegisterOpen(false);
    setQrForm({ block: "", token: "", name: "" });
  };

  const handleEditDevice = (device: typeof devices[0]) => {
    setEditingDevice(device);
    setEditForm({
      block: device.block,
      name: device.name,
    });
    setUpdateDeviceOpen(true);
  };

  const handleUpdateDevice = () => {
    if (!editForm.block || !editForm.name) {
      alert("Please fill in all fields");
      return;
    }

    if (editingDevice) {
      // Update device in list
      const updatedList = deviceList.map((device) =>
        device.id === editingDevice.id
          ? { ...device, block: editForm.block, name: editForm.name }
          : device
      );
      setDeviceList(updatedList);
      console.log("Device updated:", { id: editingDevice.id, ...editForm });
      alert(`Device updated: ${editForm.name}`);
      setUpdateDeviceOpen(false);
      setEditingDevice(null);
      setEditForm({ block: "", name: "" });
    }
  };

  const handleRemoveDeviceClick = (device: typeof devices[0]) => {
    setDeviceToRemove(device);
    setRemoveDeviceOpen(true);
  };

  const handleConfirmRemoveDevice = () => {
    if (deviceToRemove) {
      // Remove device from list
      const updatedList = deviceList.filter((device) => device.id !== deviceToRemove.id);
      setDeviceList(updatedList);
      console.log("Device removed:", deviceToRemove.id);
      setRemoveDeviceOpen(false);
      setDeviceToRemove(null);
    }
  };

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
            onClick={() => setCreateDeviceOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Device
          </Button>
          <Button 
            className="gap-2 h-10 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5"
            onClick={() => setQrRegisterOpen(true)}
          >
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

      {/* Create Device Modal */}
      <Dialog open={createDeviceOpen} onOpenChange={setCreateDeviceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Create New Device</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Device Type */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Device Type</label>
              <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pump">Pump</SelectItem>
                  <SelectItem value="tank">Tank</SelectItem>
                  <SelectItem value="valve">Valve</SelectItem>
                  <SelectItem value="sump">Sump</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreateDevice}
              className="w-full bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white"
            >
              Create Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Register Modal */}
      <Dialog open={qrRegisterOpen} onOpenChange={setQrRegisterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">QR Register Device</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Select Block */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Select Block</label>
              <Select value={qrForm.block} onValueChange={(value) => setQrForm({ ...qrForm, block: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((block) => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Token */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Device Token</label>
              <Input
                placeholder="Enter device token"
                value={qrForm.token}
                onChange={(e) => setQrForm({ ...qrForm, token: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Device Name */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Device Name</label>
              <Input
                placeholder="Enter device name"
                value={qrForm.name}
                onChange={(e) => setQrForm({ ...qrForm, name: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex">
            <Button
              variant="outline"
              onClick={() => {
                setQrRegisterOpen(false);
                setQrForm({ block: "", token: "", name: "" });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleQrRegister}
              className="flex-1 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white"
            >
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-muted" />
          <Input
            placeholder="Search devices by name or ID..."
            className="pl-9 transition-smooth focus:shadow-soft-md"
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
            {deviceList.map((device) => (
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:shadow-soft-sm transition-smooth"
                      onClick={() => handleEditDevice(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-[#C00000] hover:text-white transition-smooth"
                      onClick={() => handleRemoveDeviceClick(device)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update Device Modal */}
      <Dialog open={updateDeviceOpen} onOpenChange={setUpdateDeviceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Update Device</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Select Block */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Select Block</label>
              <Select value={editForm.block} onValueChange={(value) => setEditForm({ ...editForm, block: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((block) => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Name */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Device Name</label>
              <Input
                placeholder="Enter device name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex">
            <Button
              variant="outline"
              onClick={() => {
                setUpdateDeviceOpen(false);
                setEditingDevice(null);
                setEditForm({ block: "", name: "" });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleQrRegister}
              className="flex-1 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white"
            >
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Device Modal */}
      <Dialog open={removeDeviceOpen} onOpenChange={setRemoveDeviceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold">Remove Device</DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center">
            <p className="text-gray-700 text-sm">
              Are you sure you want to remove device <span className="font-semibold">{deviceToRemove?.name}</span>?
            </p>
          </div>

          <DialogFooter className="gap-2 flex">
            <Button
              variant="outline"
              onClick={() => setRemoveDeviceOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemoveDevice}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

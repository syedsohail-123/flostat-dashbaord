import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Droplets, Gauge, ThermometerSun } from "lucide-react";
import { toast } from "sonner";

interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  block: string;
  status: "active" | "inactive" | "warning";
  lastSeen: string;
}

interface CreateDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDevice: (device: {
    name: string;
    type: string;
    location: string;
    description: string;
    blockName: string;
  }) => void;
}

interface EditDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditDevice: (device: Device) => void;
  deviceToEdit: Device | null;
}

const deviceTypes = [
  { value: "tank", label: "Tank", icon: ThermometerSun },
  { value: "valve", label: "Valve", icon: Gauge },
  { value: "pump", label: "Pump", icon: Droplets },
  { value: "sump", label: "Sump", icon: Droplets },
];

export function CreateDeviceModal({ open, onOpenChange, onCreateDevice }: CreateDeviceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [blockName, setBlockName] = useState(""); // Use block name instead of ID

  const handleSubmit = () => {
    if (!name.trim() || !type || !blockName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    onCreateDevice({
      name,
      type,
      location,
      description,
      blockName, // Pass block name instead of ID
    });

    // Reset form
    setName("");
    setType("");
    setLocation("");
    setDescription("");
    setBlockName("");
    onOpenChange(false); // Close the modal
  };

  const handleTypeSelect = (value: string) => {
    setType(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Device</DialogTitle>
          <DialogDescription>
            Add a new device to your system. First select a block, then choose a device type and fill in the details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="block">Block <span className="text-destructive">*</span></Label>
            <Input
              id="block"
              placeholder="Enter block name"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Device Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="Enter device name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!blockName.trim()} // Disable until block name is entered
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Device Type <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={handleTypeSelect} disabled={!blockName.trim()}>
              <SelectTrigger>
                <SelectValue placeholder={blockName.trim() ? "Select device type" : "Enter block name first"} />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((deviceType) => {
                  const Icon = deviceType.icon;
                  return (
                    <SelectItem key={deviceType.value} value={deviceType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {deviceType.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter device location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={!blockName.trim()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter device description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!blockName.trim()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!blockName.trim() || !name.trim() || !type}>
            Create Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditDeviceModal({ open, onOpenChange, onEditDevice, deviceToEdit }: EditDeviceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [blockName, setBlockName] = useState(""); // Use block name instead of ID

  // Populate form when deviceToEdit changes
  useEffect(() => {
    if (deviceToEdit) {
      setName(deviceToEdit.name);
      setType(deviceToEdit.type);
      setLocation(deviceToEdit.location);
      setBlockName(deviceToEdit.block);
      // Description is not in the device object, so we leave it empty
      setDescription("");
    } else {
      // Reset form when closing
      setName("");
      setType("");
      setLocation("");
      setBlockName("");
      setDescription("");
    }
  }, [deviceToEdit, open]);

  const handleSubmit = () => {
    if (!name.trim() || !type || !blockName.trim() || !deviceToEdit) {
      toast.error("Please fill in all required fields");
      return;
    }

    onEditDevice({
      ...deviceToEdit,
      name,
      type,
      location,
      block: blockName,
    });

    // Reset form and close modal
    setName("");
    setType("");
    setLocation("");
    setBlockName("");
    setDescription("");
    onOpenChange(false);
  };

  const handleTypeSelect = (value: string) => {
    setType(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
          <DialogDescription>
            Modify the device details. First select a block, then choose a device type and update the details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-block">Block <span className="text-destructive">*</span></Label>
            <Input
              id="edit-block"
              placeholder="Enter block name"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-name">Device Name <span className="text-destructive">*</span></Label>
            <Input
              id="edit-name"
              placeholder="Enter device name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-type">Device Type <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={handleTypeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((deviceType) => {
                  const Icon = deviceType.icon;
                  return (
                    <SelectItem key={deviceType.value} value={deviceType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {deviceType.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              placeholder="Enter device location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter device description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!blockName.trim() || !name.trim() || !type}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
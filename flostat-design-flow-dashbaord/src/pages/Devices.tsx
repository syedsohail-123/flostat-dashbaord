import { useEffect, useState } from "react";
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
import { createBlock } from "@/lib/operations/blockApis";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { deviceCreate, getOrgAllDevice } from "@/lib/operations/deviceApis";
import { useDispatch } from "react-redux";
import { setDevices } from "@/slice/deviceSlice";
import { QrRegisterModal } from "@/components/QrRegisterModal";
import { Device } from "@/components/types/types";

const devices = [
  {
    id: "DEV-001",
    name: "Pump 2",
    type: "pump",
    location: "Building A - Floor 1",
    block: "block-a",
    status: "active" as const,
    lastSeen: "2 min ago",
  },
  {
    id: "DEV-002",
    name: "Tank 4",
    type: "tank",
    location: "Building A - Floor 2",
    block: "block-a",
    status: "active" as const,
    lastSeen: "5 min ago",
  },
  {
    id: "DEV-003",
    name: "Valve 3",
    type: "valve",
    location: "Building B - Ground",
    block: "block-b",
    status: "active" as const,
    lastSeen: "1 min ago",
  },
  {
    id: "DEV-004",
    name: "Pump 1",
    type: "pump",
    location: "Building B - Floor 1",
    block: "block-b",
    status: "inactive" as const,
    lastSeen: "1 hour ago",
  },
  {
    id: "DEV-005",
    name: "Valve 1",
    type: "valve",
    location: "Building A - Floor 3",
    block: "block-a",
    status: "active" as const,
    lastSeen: "3 min ago",
  },
  {
    id: "DEV-006",
    name: "Valve 4",
    type: "valve",
    location: "Building C - Ground",
    block: "block-c",
    status: "active" as const,
    lastSeen: "10 min ago",
  },
  {
    id: "DEV-007",
    name: "Pump AHub",
    type: "pump",
    location: "Building C - Floor 2",
    block: "block-c",
    status: "active" as const,
    lastSeen: "4 min ago",
  },
  {
    id: "DEV-008",
    name: "Tank Staff quaters",
    type: "tank",
    location: "Building A - Floor 1",
    block: "block-a",
    status: "warning" as const,
    lastSeen: "1 min ago",
  },
  {
    id: "DEV-009",
    name: "Tank AHub",
    type: "tank",
    location: "Building D - Floor 1",
    block: "block-d",
    status: "warning" as const,
    lastSeen: "2 min ago",
  },
  {
    id: "DEV-010",
    name: "Pump 3",
    type: "pump",
    location: "Building B - Ground",
    block: "block-b",
    status: "active" as const,
    lastSeen: "5 min ago",
  },
  {
    id: "DEV-011",
    name: "Valve 2",
    type: "valve",
    location: "Building C - Floor 1",
    block: "block-c",
    status: "inactive" as const,
    lastSeen: "15 min ago",
  },
];

export default function Devices() {
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [createDeviceOpen, setCreateDeviceOpen] = useState(false);
  const [qrRegisterOpen, setQrRegisterOpen] = useState(false);
  const [updateDeviceOpen, setUpdateDeviceOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [modalMode, setModalMode] = useState<"qr" | "update" | "remove">("qr");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  // const [deviceList, setDeviceList] = useState(devices);
  const org_id = useSelector((state: RootState) => state.org.org_id);
  const token = useSelector((state: RootState) => state.auth.token);
  const devices = useSelector((state: RootState) => state.device.devices);
  const dispatch = useDispatch();
  const [qrForm, setQrForm] = useState({
    block_name: "",
    token: "",
    name: "",
  });
  const [editingDevice, setEditingDevice] = useState<
    (typeof devices)[0] | null
  >(null);
  const [editForm, setEditForm] = useState({
    block: "",
    name: "",
  });
  const [removeDeviceOpen, setRemoveDeviceOpen] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState<
    (typeof devices)[0] | null
  >(null);

  const handleCreateBlock = async (block: {
    block_name: string;
    location: string;
    description: string;
  }) => {
    const data = { ...block, org_id };
    console.log("Creating block:", data);
    const result = await createBlock(data, token);
    console.log("Result block: ", result);
  };

  const handleCreateDevice = async () => {
    if (!selectedDeviceType) {
      alert("Please select a device type");
      return;
    }

    const result = await deviceCreate(org_id, selectedDeviceType, token);
    if (result) {
      dispatch(setDevices(result));
    }

    console.log("Device created:", result);
    setCreateDeviceOpen(false);
    setSelectedDeviceType("");
  };
 useEffect(()=>{
    
    const fetchDevicesOfOrg = async()=>{
       const result = await getOrgAllDevice(org_id,token);
       if(result){
        dispatch(setDevices(result));
       }
    }
    fetchDevicesOfOrg();
 },[])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-soft">
            Device Management
          </h1>
          <p className="text-soft-muted mt-1">
            Manage and monitor all connected devices
          </p>
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
            onClick={() => {
              setSelectedDevice(null); // or set a device to edit
              setModalMode("qr"); // choose "qr" | "update" | "remove"
              setQrRegisterOpen(true);
            }}
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
            <DialogTitle className="text-center text-lg font-bold">
              Create New Device
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Device Type */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">
                Device Type
              </label>
              <Select
                value={selectedDeviceType}
                onValueChange={setSelectedDeviceType}
              >
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
              <TableHead className="font-semibold text-soft">
                Device ID/Name
              </TableHead>
              <TableHead className="font-semibold text-soft">Type</TableHead>
              <TableHead className="font-semibold text-soft">Block</TableHead>
              <TableHead className="font-semibold text-soft">Status</TableHead>
              <TableHead className="text-right font-semibold text-soft">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device, i) => (
              <TableRow key={i} className="hover:bg-muted/20 transition-smooth">
                <TableCell className="font-mono text-sm text-soft">
                  {device.device_name || device.device_id}
                </TableCell>

                <TableCell>
                  <span className="rounded-md bg-muted/50 px-2 py-1 text-xs font-medium capitalize text-soft-muted">
                    {device.device_type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-[hsl(var(--navy))] text-white shadow-soft-sm">
                    {device?.block_id}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      typeof device.status === "string" &&
                      device.status.toLowerCase() === "active"
                        ? "bg-green-100 text-green-600"
                        : typeof device.status === "string" &&
                          device.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {typeof device.status === "string"
                      ? device.status
                      : device.status?.current_level || "unknown"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:shadow-soft-sm transition-smooth"
                      onClick={() =>{
                          setSelectedDevice(device); // or set a device to edit
              setModalMode("update"); // choose "qr" | "update" | "remove"
              setQrRegisterOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-[#C00000] hover:text-white transition-smooth"
                      onClick={() =>
                      {
                          setSelectedDevice(device); // or set a device to edit
              setModalMode("remove"); // choose "qr" | "update" | "remove"
              setQrRegisterOpen(true);
                      }
                      }
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

      <QrRegisterModal
        qrRegisterOpen={qrRegisterOpen}
        setQrRegisterOpen={setQrRegisterOpen}
        modalMode={modalMode}
        device={selectedDevice}
      />
    </div>
  );
}

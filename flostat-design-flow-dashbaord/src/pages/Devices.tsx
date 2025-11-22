import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createBlock, getBlocksOfOrgId } from "@/lib/operations/blockApis";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { deviceCreate, getOrgAllDevice } from "@/lib/operations/deviceApis";
import { setDevices } from "@/slice/deviceSlice";
import { QrRegisterModal } from "@/components/QrRegisterModal";
import { Device, Block } from "@/components/types/types";

export default function Devices() {
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [createDeviceOpen, setCreateDeviceOpen] = useState(false);
  const [qrRegisterOpen, setQrRegisterOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [modalMode, setModalMode] = useState<"qr" | "update" | "remove">("qr");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const org_id = useSelector((state: RootState) => state.org.org_id);
  const token = useSelector((state: RootState) => state.auth.token);
  const devices = useSelector((state: RootState) => state.device.devices);
  const dispatch = useDispatch();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState("");

  const handleCreateBlock = async (block: {
    block_name: string;
    location: string;
    description: string;
  }) => {
    const data = { ...block, org_id };
    console.log("Creating block:", data);
    const result = await createBlock(data, token);
    console.log("Result block: ", result);
    // Refresh blocks
    const blockRes = await getBlocksOfOrgId(org_id, token);
    if (blockRes) setBlocks(blockRes);
  };

  const handleCreateDevice = async () => {
    if (!selectedDeviceType) {
      alert("Please select a device type");
      return;
    }
    if (!selectedBlockId) {
      alert("Please select a block");
      return;
    }

    const data = {
      org_id,
      device_type: selectedDeviceType,
      block_id: selectedBlockId
    };

    const result = await deviceCreate(data, token);
    if (result) {
      dispatch(setDevices(result));
    }

    console.log("Device created:", result);
    setCreateDeviceOpen(false);
    setSelectedDeviceType("");
    setSelectedBlockId("");
  };

  useEffect(() => {
    const fetchDevicesOfOrg = async () => {
      const result = await getOrgAllDevice(org_id, token);
      if (result) {
        dispatch(setDevices(result));
      }
    }
    const fetchBlocks = async () => {
      const result = await getBlocksOfOrgId(org_id, token);
      if (result) setBlocks(result);
    };

    fetchDevicesOfOrg();
    fetchBlocks();
  }, [org_id, token, dispatch]);

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
              setSelectedDevice(null);
              setModalMode("qr");
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

      <QrRegisterModal
        qrRegisterOpen={qrRegisterOpen}
        setQrRegisterOpen={setQrRegisterOpen}
        modalMode={modalMode}
        device={selectedDevice}
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
            {/* Block Selection */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">
                Select Block
              </label>
              <Select
                value={selectedBlockId}
                onValueChange={setSelectedBlockId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((block) => (
                    <SelectItem key={block.block_id} value={block.block_id!}>
                      {block.block_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    className={`px-3 py-1 text-xs rounded-full ${typeof device.status === "string" &&
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
                      onClick={() => {
                        setSelectedDevice(device);
                        setModalMode("update");
                        setQrRegisterOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-[#C00000] hover:text-white transition-smooth"
                      onClick={() => {
                        setSelectedDevice(device);
                        setModalMode("remove");
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
    </div>
  );
}

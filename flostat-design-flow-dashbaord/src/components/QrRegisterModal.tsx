import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RootState } from "@/store";
import { getBlocksOfOrgId } from "@/lib/operations/blockApis";
import { Block, Device } from "./types/types";
import {
  deviceDelete,
  deviceRegister,
  deviceUpdate,
  getDeviceParents,
} from "@/lib/operations/deviceApis";
import { setDevices } from "@/slice/deviceSlice";

type ModalMode = "qr" | "update" | "remove";

interface QrRegisterModalProps {
  qrRegisterOpen: boolean;
  setQrRegisterOpen: (open: boolean) => void;
  modalMode: ModalMode;
  device?: Device | null;
}

export function QrRegisterModal({
  qrRegisterOpen,
  setQrRegisterOpen,
  modalMode,
  device,
}: QrRegisterModalProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [parents, setParents] = useState<Device[]>([]);
  const [step, setStep] = useState(1);
  console.log("QR details: ", device);

  const [qrForm, setQrForm] = useState({
    block_id: device?.block_id || "",
    org_id: device?.org_id || "",
    device_name: device?.device_name || "",
    token: device?.token || "",
    name: device?.device_name || "",
    device_id: device?.device_id || "",
    parent_id: device?.parent_id || "",
  });
  console.log("Qr from: ",qrForm);
 useEffect(()=>{
    setQrForm({
    block_id: device?.block_id || "",
    org_id: device?.org_id || "",
    device_name: device?.device_name || "",
    token: device?.token || "",
    name: device?.device_name || "",
    device_id: device?.device_id || "",
    parent_id: device?.parent_id || "",
    })
    setStep(1);
 },[device])
  const { org_id } = useSelector((state: RootState) => state.org);
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Fetch blocks when modal opens
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const result = await getBlocksOfOrgId(org_id, token);
        if (result) setBlocks(result);
      } catch (err) {
        console.error("Fetch blocks error:", err);
        toast.error("Failed to load blocks");
      }
    };
    if (modalMode !== "remove" && qrRegisterOpen) {
      fetchBlocks();
    }
  }, [org_id, modalMode, qrRegisterOpen]);

  // Step 2: fetch parent devices
  const goToStep2 = async () => {
    if (!qrForm.device_name.trim()) return toast.error("Device name required");
    if (modalMode === "qr" && !qrForm.token.trim())
      return toast.error("Device token required");

    try {
      const data = {
        org_id,
        token_id: qrForm.token || device?.token_id,
        device_id: device?.device_id,
        ...(qrForm.block_id && { block_id: qrForm.block_id }),
      };
      const result = await getDeviceParents(data, token);
      if (result) {
        setParents(result);
        setStep(2);
      }
    } catch (err) {
      toast.error("Failed to fetch parent devices");
    }
  };

  const handleRegister = async () => {
    const data = {
      token_id: qrForm.token,
      org_id,
      device_name: qrForm.device_name,
      ...(qrForm.block_id && { block_id: qrForm.block_id}),
      parent_id: qrForm.parent_id || null,
    };
    try {
      const result = await deviceRegister(data, token);
      if (result) {
        dispatch(setDevices(result));
        setQrRegisterOpen(false);
      }
    } catch (err) {
      toast.error("Device registration failed");
    }
  };

  const handleUpdate = async () => {
    if (!device) return;
    const data = {
      device_id: device.device_id,
      device_name: qrForm.device_name,
      org_id,
      ...(qrForm.block_id && { block_id: qrForm.block_id }),
      parent_id: qrForm.parent_id || null,
    };
    try {
      const result = await deviceUpdate(data, token);
      if (result) {
        dispatch(setDevices(result));
        
        setQrRegisterOpen(false);
      }
    } catch (err) {
      toast.error("Device update failed");
    }
  };

  const handleDelete = async () => {
    if (!device) return;
    try {
      const result = await deviceDelete(
        { org_id, device_id: device.device_id },
        token
      );
      console.log("Delete : ",result);
      if (result) {
        dispatch(setDevices(result));
        setQrRegisterOpen(false);
      }
    } catch (err) {
      toast.error("Device deletion failed");
    }
  };

  return (
    <Dialog open={qrRegisterOpen} onOpenChange={setQrRegisterOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            {modalMode === "qr"
              ? step === 1
                ? "QR Register Device"
                : "Select Parent Device"
              : modalMode === "update"
              ? step === 1
                ? "Update Device"
                : "Select Parent Device"
              : "Remove Device"}
          </DialogTitle>
        </DialogHeader>

        {modalMode === "remove" ? (
          <div>
            <p className="mb-4">
              Are you sure you want to remove device{" "}
              <strong>{device?.device_name || device?.device_id}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setQrRegisterOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Select Block
                  </label>
                  <Select
                    value={qrForm.block_id} // stores the block_id
                    onValueChange={(value) =>
                      setQrForm({ ...qrForm, block_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a block" />
                    </SelectTrigger>

                    <SelectContent>
                      {blocks.map((block) => (
                        <SelectItem key={block.block_id} value={block.block_id}>
                          {block.block_name} {/* user sees this */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modalMode === "qr" && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Device Token
                    </label>
                    <Input
                      placeholder="Enter device token"
                      value={qrForm.token}
                      onChange={(e) =>
                        setQrForm({ ...qrForm, token: e.target.value })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Device Name
                  </label>
                  <Input
                    placeholder="Enter device name"
                    value={qrForm.device_name}
                    onChange={(e) =>
                      setQrForm({ ...qrForm, device_name: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setQrRegisterOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={goToStep2}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Select Parent Device (optional)
                </label>
                <Select
                  value={qrForm.parent_id}
                  onValueChange={(value) =>
                    setQrForm({ ...qrForm, parent_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">No parent</SelectItem> */}
                    {parents.length > 0 && parents.map((p) => (
                      <SelectItem key={p.device_id} value={p.device_id}>
                        {p.device_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={modalMode === "qr" ? handleRegister : handleUpdate}
                  >
                    {modalMode === "qr" ? "Register Device" : "Update Device"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

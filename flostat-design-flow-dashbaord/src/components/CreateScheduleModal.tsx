import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { createSchedule } from "@/lib/operations/scheduleApis";
import { getBlocksOfOrgId } from "@/lib/operations/blockApis";
import { getOrgAllDevice } from "@/lib/operations/deviceApis";
import { addSchedule } from "@/slice/scheduleSlice";
import { Block, Device } from "./types/types";
import { RootState } from "@/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DEVICE_TYPE } from "@/utils/constants";

interface CreateScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    org_id: string;
}

interface ScheduleFormData {
    block_id: string;
    device_id: string;
    device_type: string;
    start_time: string;
    end_time: string;
    recurrence: string;
}

export const CreateScheduleModal = ({
    open,
    onOpenChange,
    org_id,
}: CreateScheduleModalProps) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(false);

    const [form, setForm] = useState<ScheduleFormData>({
        block_id: "",
        device_id: "",
        device_type: "valve",
        start_time: "12:00",
        end_time: "13:00",
        recurrence: "daily",
    });

    // 🔹 Fetch blocks when modal opens
    useEffect(() => {
        if (open && org_id && token) {
            fetchBlocks();
        }
    }, [open, org_id, token]);

    const fetchBlocks = async () => {
        try {
            const res = await getBlocksOfOrgId(org_id, token!);
            if (res) setBlocks(res);
        } catch (err) {
            console.error("Error fetching blocks:", err);
            toast.error("Failed to load blocks");
        }
    };

    // 🔹 Fetch devices when block changes
    const handleBlockChange = async (selectedBlockId: string) => {
        setForm({ ...form, block_id: selectedBlockId, device_id: "" });
        setDevices([]);

        if (!selectedBlockId) return;

        setLoadingDevices(true);
        try {
            const res = await getOrgAllDevice(org_id, token!);
   
            if (res) {
                // Filter devices by block_id
                const blockDevices = res.filter((d: Device) => (d.device_type===DEVICE_TYPE.PUMP || d.device_type===DEVICE_TYPE.VALVE ) && d.block_id === selectedBlockId);
                setDevices(blockDevices);
            }
        } catch (err) {
            toast.error("Failed to load devices");
            console.error("Error fetching devices:", err);
        } finally {
            setLoadingDevices(false);
        }
    };

    // 🔹 Handle submit
    const handleSubmit = async () => {
        const { block_id, device_id, start_time, end_time } = form;

        if (!block_id || !device_id || !start_time || !end_time) {
            toast.error("All fields are required!");
            return;
        }

        // Add seconds to time format for backend (HH:mm:ss)
        const data = {
            org_id,
            ...form,
            start_time: start_time + ':00',
            end_time: end_time + ':00'
        };

        const res = await createSchedule(data, token!);
        console.log("RES create sch: ",res);
        if (res) {
            toast.success("Schedule created successfully!");
            dispatch(addSchedule(res));
            onOpenChange(false);
            // Reset form
            setForm({
                block_id: "",
                device_id: "",
                device_type: "valve",
                start_time: "12:00",
                end_time: "13:00",
                recurrence: "daily",
            });
            setDevices([]);
        }
    };

    // Helper to get display hour for 12-hour format
    const getDisplayHour = (time: string) => {
        if (!time) return '12';
        const hour = parseInt(time.split(':')[0]);
        if (hour === 0) return '12';
        if (hour > 12) return String(hour - 12).padStart(2, '0');
        return String(hour).padStart(2, '0');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Schedule</DialogTitle>
                    <DialogDescription>
                        Create a new schedule for a device. Select a block and device, then set the time range.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* 🔹 Block dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="block">Block</Label>
                        <Select
                            value={form.block_id}
                            onValueChange={handleBlockChange}
                        >
                            <SelectTrigger id="block">
                                <SelectValue placeholder="Select Block" />
                            </SelectTrigger>
                            <SelectContent>
                                {blocks.map((b) => (
                                    <SelectItem key={b.block_id} value={b.block_id!}>
                                        {b.block_name || b.block_id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 🔹 Device dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="device">Device</Label>
                        <Select
                            value={form.device_id}
                            onValueChange={(value) => setForm({ ...form, device_id: value })}
                            disabled={!form.block_id || loadingDevices}
                        >
                            <SelectTrigger id="device">
                                <SelectValue
                                    placeholder={
                                        loadingDevices
                                            ? "Loading devices..."
                                            : form.block_id
                                                ? "Select Device"
                                                : "Select Block First"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {devices.map((d) => (
                                    <SelectItem key={d.device_id} value={d.device_id}>
                                        {d.device_name || d.device_id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 🔹 Start Time - 12 Hour Format */}
                    <div className="space-y-2 col-span-2">
                        <Label>Start Time</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Select
                                value={getDisplayHour(form.start_time)}
                                onValueChange={(hour) => {
                                    const [_, min] = form.start_time.split(':');
                                    const isPM = parseInt(form.start_time.split(':')[0]) >= 12;
                                    let hour24 = parseInt(hour);
                                    if (isPM && hour24 !== 12) hour24 += 12;
                                    if (!isPM && hour24 === 12) hour24 = 0;
                                    setForm({ ...form, start_time: `${String(hour24).padStart(2, '0')}:${min || '00'}` });
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                        <SelectItem key={h} value={String(h).padStart(2, '0')}>{h}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={form.start_time.split(':')[1] || '00'}
                                onValueChange={(min) => {
                                    const [hour] = form.start_time.split(':');
                                    setForm({ ...form, start_time: `${hour || '00'}:${min}` });
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                        <SelectItem key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={parseInt(form.start_time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                onValueChange={(period) => {
                                    const [hour, min] = form.start_time.split(':');
                                    let hour24 = parseInt(hour);
                                    if (period === 'PM' && hour24 < 12) hour24 += 12;
                                    if (period === 'AM' && hour24 >= 12) hour24 -= 12;
                                    setForm({ ...form, start_time: `${String(hour24).padStart(2, '0')}:${min || '00'}` });
                                }}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 🔹 End Time - 12 Hour Format */}
                    <div className="space-y-2 col-span-2">
                        <Label>End Time</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Select
                                value={getDisplayHour(form.end_time)}
                                onValueChange={(hour) => {
                                    const [_, min] = form.end_time.split(':');
                                    const isPM = parseInt(form.end_time.split(':')[0]) >= 12;
                                    let hour24 = parseInt(hour);
                                    if (isPM && hour24 !== 12) hour24 += 12;
                                    if (!isPM && hour24 === 12) hour24 = 0;
                                    setForm({ ...form, end_time: `${String(hour24).padStart(2, '0')}:${min || '00'}` });
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                        <SelectItem key={h} value={String(h).padStart(2, '0')}>{h}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={form.end_time.split(':')[1] || '00'}
                                onValueChange={(min) => {
                                    const [hour] = form.end_time.split(':');
                                    setForm({ ...form, end_time: `${hour || '00'}:${min}` });
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                        <SelectItem key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={parseInt(form.end_time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                onValueChange={(period) => {
                                    const [hour, min] = form.end_time.split(':');
                                    let hour24 = parseInt(hour);
                                    if (period === 'PM' && hour24 < 12) hour24 += 12;
                                    if (period === 'AM' && hour24 >= 12) hour24 -= 12;
                                    setForm({ ...form, end_time: `${String(hour24).padStart(2, '0')}:${min || '00'}` });
                                }}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 🔹 Recurrence dropdown */}
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="recurrence">Recurrence</Label>
                        <Select
                            value={form.recurrence}
                            onValueChange={(value) => setForm({ ...form, recurrence: value })}
                        >
                            <SelectTrigger id="recurrence">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">One Time</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 🔹 Action buttons */}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Create Schedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

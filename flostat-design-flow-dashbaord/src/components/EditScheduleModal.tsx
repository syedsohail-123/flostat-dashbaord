import { useState } from "react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { updateScheduleApis } from "@/lib/operations/scheduleApis";
import { updateSchedule } from "@/slice/scheduleSlice";
import { Schedule } from "@/slice/scheduleSlice";
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
import { Input } from "@/components/ui/input";

interface EditScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: Schedule;
}

export const EditScheduleModal = ({
    open,
    onOpenChange,
    schedule,
}: EditScheduleModalProps) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [form, setForm] = useState<Schedule>({ ...schedule });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        console.log("handleUpdate called", form);
        if (!form.start_time || !form.end_time) {
            toast.error("Start time and end time are required!");
            return;
        }

        // Add seconds to time format if not already present
        const formatTime = (time: string) => {
            return time.includes(':') && time.split(':').length === 2 ? time + ':00' : time;
        };

        // Update the schedule in Redux state (frontend only)
        const updatedSchedule = {
            ...form,
            start_time: formatTime(form.start_time),
            end_time: formatTime(form.end_time),
        };

        console.log("Updating schedule in Redux:", updatedSchedule);

        // Dispatch to Redux to update the local state
        dispatch(updateSchedule(updatedSchedule));
        toast.success("Schedule updated successfully!");
        onOpenChange(false);
    };

    // Helper to strip seconds for time input
    const getTimeValue = (time: string | undefined) => {
        if (!time) return "";
        return time.split(':').slice(0, 2).join(':');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Schedule</DialogTitle>
                    <DialogDescription>
                        Update the schedule time and linked pump information.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* 🔹 Time pickers */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                            id="start_time"
                            name="start_time"
                            type="time"
                            value={getTimeValue(form.start_time)}
                            onChange={handleChange}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Select start time</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                            id="end_time"
                            name="end_time"
                            type="time"
                            value={getTimeValue(form.end_time)}
                            onChange={handleChange}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Select end time</p>
                    </div>


                </div>

                {/* 🔹 Action buttons */}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate}>Update Schedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

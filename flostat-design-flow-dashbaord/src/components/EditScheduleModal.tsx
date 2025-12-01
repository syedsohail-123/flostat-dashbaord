import { useState } from "react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { Clock, Edit, Trash2 } from "lucide-react";

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
import { updateSchedule } from "@/lib/operations/scheduleApis";
import { Schedule } from "./types/types";
import { scheduleUpdate } from "@/slice/scheduleSlice";

interface EditScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: Schedule;
    onCreateNew?: (blockId: string) => void;
    onDelete?: () => void;
}

export const EditScheduleModal = ({
    open,
    onOpenChange,
    schedule,
    onCreateNew,
    onDelete,
}: EditScheduleModalProps) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [form, setForm] = useState<Schedule>({ ...schedule });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
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
        const updated = {
            ...form,
            start_time: formatTime(form.start_time),
            end_time: formatTime(form.end_time),
        };

        console.log("Updating schedule in Redux:", updated);
        console.log("Token : ",token);
        const res = await updateSchedule(updated,token);
        console.log("Edit response: ",res);
        if(res){
            dispatch(scheduleUpdate(res));
            toast.success("Schedule updated successfully!");
        }
        // Dispatch to Redux to update the local state
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

                <div className="grid grid-cols-2 gap-8 py-4">
                    {/* 🔹 Time pickers */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time" className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Start Time
                        </Label>
                        <Input
                            id="start_time"
                            name="start_time"
                            type="time"
                            min="00:00"
                            max="23:59"
                            value={getTimeValue(form.start_time)}
                            onChange={handleChange}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Select start time</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_time" className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            End Time
                        </Label>
                        <Input
                            id="end_time"
                            name="end_time"
                            type="time"
                            min="00:00"
                            max="23:59"
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
                    {onDelete && (
                        <Button
                            variant="destructive"
                            className="gap-2"
                            onClick={() => {
                                onOpenChange(false);
                                onDelete();
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    )}
                    <Button className="bg-black hover:bg-black/90 text-white gap-2" onClick={handleUpdate}>
                        <Edit className="h-4 w-4" />
                        Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

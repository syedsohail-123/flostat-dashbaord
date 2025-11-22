import { toast } from "sonner";
import { formatTimeTo12H } from "@/utils/timeUtils";
import { useDispatch, useSelector } from "react-redux";
import { deleteScheduleCall } from "@/lib/operations/scheduleApis";
import { deleteSchedule } from "@/slice/scheduleSlice";
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
import { AlertCircle } from "lucide-react";

interface DeleteScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: Schedule;
}

export const DeleteScheduleModal = ({
    open,
    onOpenChange,
    schedule,
}: DeleteScheduleModalProps) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const handleDelete = () => {
        console.log("handleDelete called for schedule:", schedule);

        // Delete the schedule from Redux state (frontend only)
        dispatch(deleteSchedule(schedule.schedule_id));
        toast.success("Schedule removed successfully!");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Remove Schedule
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to remove the schedule{" "}
                        <strong className="text-foreground">
                            {schedule?.start_time && formatTimeTo12H(schedule.start_time)} -{" "}
                            {schedule?.end_time && formatTimeTo12H(schedule.end_time)}
                        </strong>
                        ?
                    </p>
                </div>

                {/* 🔹 Action buttons */}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Remove Schedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

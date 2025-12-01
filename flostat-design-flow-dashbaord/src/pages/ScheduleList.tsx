import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setSchedules } from "@/slice/scheduleSlice";
import { getScheduleByOrgId } from "@/lib/operations/scheduleApis";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatTimeTo12H } from "@/utils/timeUtils";
import {
  RotateCw,
  Edit,
  Trash2,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Zap,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CreateScheduleModal } from "@/components/CreateScheduleModal";
import { EditScheduleModal } from "@/components/EditScheduleModal";
import { DeleteScheduleModal } from "@/components/DeleteScheduleModal";
import { SCHEDULE_COMPLETED_STATUS } from "@/utils/constants";
import { Schedule } from "@/components/types/types";

type ModalMode = "create" | "edit" | "delete" | null;

export default function ScheduleList() {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { org_id, blocksName } = useSelector((state: RootState) => state.org);
  const { schedules } = useSelector((state: RootState) => state.schedule);
  const { devicesObject } = useSelector((state: RootState) => state.device);

  const [isLoading, setIsLoading] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [lastUsedBlockId, setLastUsedBlockId] = useState<string | undefined>();
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>("all");
  const [timeStart, setTimeStart] = useState<number>(13);
  const [timeEnd, setTimeEnd] = useState<number>(19);

  console.log("Schedule lists: ", schedules);
  // Fetch schedules on component mount
  useEffect(() => {
    if (org_id && token) {
      fetchSchedules();
    }
  }, [org_id, token]);

  const fetchSchedules = async () => {
    if (!org_id || !token) return;

    try {
      setIsLoading(true);
      const data = { org_id };
      const result = await getScheduleByOrgId(data, token);
      if (result) {
        dispatch(setSchedules(result));
        toast.success("Schedules loaded successfully");
      }
    } catch (error) {
      toast.error("Failed to fetch schedules");
      console.error("Fetch schedules error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalMode("edit");
  };

  const handleDelete = (schedule: Schedule) => {
    console.log("Delete schedule");
    setSelectedSchedule(schedule);
    setModalMode("delete");
  };

  const handleCreate = () => {
    setLastUsedBlockId(selectedBlock !== "all" ? selectedBlock : undefined);
    setModalMode("create");
  };

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-soft">
            Schedule Manager
          </h1>
          <p className="text-soft-muted mt-1">
            Create and manage automated device schedules
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 border border-border/50 rounded-md p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSchedules}
            disabled={isLoading}
            className="gap-2 transition-smooth hover:shadow-soft-sm"
          >
            <RotateCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            className="gap-2 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="shadow-soft-lg border-border/50">
          <CardContent className="p-0">
            <div className="border-b border-border/50 p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="border border-border/50 rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="all">All Blocks</option>
                  {Object.entries(blocksName).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      const span = timeEnd - timeStart;
                      const newStart = Math.max(0, timeStart - 1);
                      setTimeStart(newStart);
                      setTimeEnd(newStart + span);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="border border-border/50 rounded-md px-3 py-2 text-sm bg-background flex items-center gap-1 min-w-[140px] justify-center font-medium">
                    {String(timeStart).padStart(2, '0')}:00 - {String(timeEnd).padStart(2, '0')}:00
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      const span = timeEnd - timeStart;
                      const newStart = Math.min(24 - span, timeStart + 1);
                      setTimeStart(newStart);
                      setTimeEnd(newStart + span);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <select
                  value={selectedDeviceFilter}
                  onChange={(e) => setSelectedDeviceFilter(e.target.value)}
                  className="border border-border/50 rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="all">All Devices</option>
                  {Object.entries(devicesObject).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 text-xs text-soft-muted">
                <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" /> Scheduled</div>
                <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" /> Active</div>
                <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-500" /> Completed</div>
                <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Cancelled</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 bg-secondary/5 border-b border-border/50">
                  <div className="p-3 font-semibold text-sm text-soft border-r border-border/50">Device / Hour</div>
                  {Array.from({ length: timeEnd - timeStart }, (_, i) => i + timeStart).map((hour) => (
                    <div key={hour} className="p-3 text-center font-medium text-xs text-soft-muted border-r border-border/50">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                {Object.keys(devicesObject)
                  .filter(deviceId => selectedDeviceFilter === "all" || deviceId === selectedDeviceFilter)
                  .map((deviceId, idx) => {
                    const deviceSchedulesForBlock = schedules.filter(
                      (s) => s.device_id === deviceId && (selectedBlock === "all" || s.block_id === selectedBlock)
                    );
                    if (deviceSchedulesForBlock.length === 0) return null;
                    return (
                      <div key={deviceId} className="grid border-b border-border/50 hover:bg-secondary/5 transition-smooth" style={{ gridTemplateColumns: `200px repeat(${timeEnd - timeStart}, minmax(0, 1fr))` }}>
                        <div className="p-3 font-medium text-sm text-soft border-r border-border/50">
                          {devicesObject[deviceId]}
                        </div>
                        {Array.from({ length: timeEnd - timeStart }, (_, i) => i + timeStart).map((hour) => {
                          const deviceSchedules = deviceSchedulesForBlock.filter(
                            (s) => s.start_time && parseInt(s.start_time.split(':')[0]) === hour
                          );
                      return (
                        <div key={hour} className="p-1 relative min-h-20 border-r border-border/30">
                          {deviceSchedules.map((schedule) => {
                            const startHour = schedule.start_time ? parseInt(schedule.start_time.split(':')[0]) : 0;
                            const startMin = schedule.start_time ? parseInt(schedule.start_time.split(':')[1]) : 0;
                            const endHour = schedule.end_time ? parseInt(schedule.end_time.split(':')[0]) : 0;
                            const endMin = schedule.end_time ? parseInt(schedule.end_time.split(':')[1]) : 0;
                            const duration = (endHour - startHour) + (endMin - startMin) / 60;
                            return (
                              <div
                                key={schedule.schedule_id}
                                className="absolute top-2 left-1 bg-blue-600 text-white text-xs rounded px-2 py-1.5 cursor-pointer hover:bg-blue-700 transition-colors border border-blue-500 shadow-md z-20 flex items-center justify-between overflow-hidden group"
                                style={{
                                  width: `calc(${duration * 100}% - 8px)`,
                                  minWidth: '90px',
                                  height: '36px',
                                }}
                                onClick={() => handleEdit(schedule)}
                              >
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                                  <span className="truncate text-white">
                                    {String(startHour).padStart(2, '0')}:{String(startMin).padStart(2, '0')}-{String(endHour).padStart(2, '0')}:{String(endMin).padStart(2, '0')}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLastUsedBlockId(schedule.block_id);
                                    setModalMode("create");
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-sm font-bold flex-shrink-0"
                                  title="Create new schedule in this block"
                                >
                                  +
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RotateCw className="h-12 w-12 animate-spin mx-auto mb-4 text-[hsl(var(--aqua))]" />
            <p className="text-lg font-medium text-soft">
              Loading schedules...
            </p>
            <p className="text-sm text-soft-muted mt-1">Please wait</p>
          </div>
        </div>
      ) : schedules.length === 0 ? (
        <Card className="border-dashed border-2 shadow-soft-lg animate-slideUp">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted/50 p-6 mb-4">
              <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold mb-2 text-soft">
              No schedules yet
            </p>
            <p className="text-sm text-soft-muted mb-6 text-center max-w-md">
              Create your first automated schedule to control devices at
              specific times
            </p>
            <Button
              onClick={handleCreate}
              className="gap-2 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm hover:shadow-soft-md transition-smooth"
            >
              <Plus className="h-4 w-4" />
              Create First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule, index) => (
            <Card
              key={schedule.schedule_id}
              className="group hover:shadow-soft-lg transition-smooth hover:-translate-y-1 border-border/50 shadow-soft-md animate-slideUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[hsl(var(--aqua))]/10 p-2">
                      <Clock className="h-5 w-5 text-[hsl(var(--aqua))]" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-soft">
                        {schedule.start_time &&
                          formatTimeTo12H(schedule.start_time)}
                      </p>
                      <p className="text-xs text-soft-muted">Start Time</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-soft-sm ${
                      schedule?.schedule_status === "active" ||
                      schedule?.schedule_status ===
                        SCHEDULE_COMPLETED_STATUS.CREATED ||
                      schedule?.schedule_status ===
                        SCHEDULE_COMPLETED_STATUS.UPDATED
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {schedule?.schedule_status ===
                      SCHEDULE_COMPLETED_STATUS.CREATED ||
                    schedule?.schedule_status ===
                      SCHEDULE_COMPLETED_STATUS.UPDATED
                      ? "Scheduled"
                      : schedule?.schedule_status || "Scheduled"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* End Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-soft-muted" />
                  <span className="text-soft-muted">End:</span>
                  <span className="font-medium text-soft">
                    {schedule?.end_time && formatTimeTo12H(schedule.end_time)}
                  </span>
                </div>

                {/* Device Info */}
                <div className="rounded-lg bg-muted/30 p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-soft-muted">Device:</span>
                    <span className="font-medium text-soft truncate ml-2">
                      {devicesObject[schedule.device_id] || schedule.device_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-muted">Block:</span>
                    <span className="font-medium text-soft truncate ml-2">
                      {blocksName[schedule.block_id] || schedule.block_id}
                    </span>
                  </div>
                  {schedule?.recurrence && (
                    <div className="flex justify-between">
                      <span className="text-soft-muted">Recurrence:</span>
                      <span className="font-medium text-soft capitalize">
                        {typeof schedule.recurrence === "object"
                          ? `${schedule.recurrence.type} every ${schedule.recurrence.interval}`
                          : schedule.recurrence}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                    className="flex-1 gap-2 transition-smooth hover:shadow-soft-sm"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(schedule)}
                    className="flex-1 gap-2 hover:bg-destructive hover:text-destructive-foreground transition-smooth hover:shadow-soft-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          )}
        </>
      )}

      {/* Modals */}
      {modalMode === "create" && org_id && (
        <CreateScheduleModal
          open={true}
          onOpenChange={(open) => !open && setModalMode(null)}
          org_id={org_id}
          defaultBlockId={lastUsedBlockId}
        />
      )}

      {modalMode === "edit" && selectedSchedule && (
        <EditScheduleModal
          open={true}
          onOpenChange={(open) => !open && setModalMode(null)}
          schedule={selectedSchedule}
          onCreateNew={(blockId) => {
            setLastUsedBlockId(blockId);
            setModalMode("create");
          }}
          onDelete={() => handleDelete(selectedSchedule)}
        />
      )}

      {modalMode === "delete" && selectedSchedule && (
        <DeleteScheduleModal
          open={true}
          onOpenChange={(open) => !open && setModalMode(null)}
          schedule={selectedSchedule}
        />
      )}
    </div>
  );
}

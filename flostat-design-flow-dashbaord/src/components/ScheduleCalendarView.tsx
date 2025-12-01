import { useState, useMemo } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Schedule, Device } from "@/components/types/types";
import { cn } from "@/lib/utils";
import { SCHEDULE_COMPLETED_STATUS } from "@/utils/constants";

interface ScheduleCalendarViewProps {
  schedules: Schedule[];
  devices: Device[];
  devicesObject: Record<string, string>;
  blocksName: Record<string, string>;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onCreate: () => void;
}

export function ScheduleCalendarView({
  schedules,
  devices,
  devicesObject,
  blocksName,
  onEdit,
  onCreate,
}: ScheduleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedBlock, setSelectedBlock] = useState<string>("all");

  // Generate hours for the timeline (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter schedules for the current date
  const daySchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (!schedule.start_time) return false;
      const start = parseISO(schedule.start_time);
      return isSameDay(start, currentDate);
    });
  }, [schedules, currentDate]);

  // Group devices by Block
  const groupedDevices = useMemo(() => {
    const groups: Record<string, Device[]> = {};
    const deviceBlockMap: Record<string, string> = {};

    // First try to get block from device object if available (assuming property exists)
    // If not, try to infer from schedules

    // Map device to block from schedules first (as it's explicit in schedule)
    schedules.forEach(s => {
      if (s.device_id && s.block_id) {
        deviceBlockMap[s.device_id] = s.block_id;
      }
    });

    // Also check devices array if they have block_id
    devices.forEach(d => {
      // @ts-ignore - block_id might be in dynamic props
      if (d.block_id) {
        // @ts-ignore
        deviceBlockMap[d.device_id] = d.block_id;
      }
    });

    // Now group devices
    // We want to list ALL devices that are in the devicesObject/devices list
    // If a device has no block assigned, put it in "Unassigned"

    const allDeviceIds = Object.keys(devicesObject);

    allDeviceIds.forEach(deviceId => {
      const blockId = deviceBlockMap[deviceId] || "unassigned";

      // Filter by selected block
      if (selectedBlock !== "all" && blockId !== selectedBlock) return;

      if (!groups[blockId]) {
        groups[blockId] = [];
      }

      // Find full device object or create partial
      const device = devices.find(d => d.device_id === deviceId) || {
        device_id: deviceId,
        device_name: devicesObject[deviceId]
      } as Device;

      groups[blockId].push(device);
    });

    return groups;
  }, [devices, devicesObject, schedules, selectedBlock]);

  const sortedBlockIds = useMemo(() => {
    return Object.keys(groupedDevices).sort((a, b) => {
      if (a === "unassigned") return 1;
      if (b === "unassigned") return -1;
      return (blocksName[a] || a).localeCompare(blocksName[b] || b);
    });
  }, [groupedDevices, blocksName]);

  // Get unique blocks for filter (from schedules AND devices)
  const uniqueBlocks = useMemo(() => {
    const blocks = new Set<string>();
    schedules.forEach(s => {
      if (s.block_id) blocks.add(s.block_id);
    });
    devices.forEach(d => {
      // @ts-ignore
      if (d.block_id) blocks.add(d.block_id);
    });

    return Array.from(blocks).map(id => ({
      id,
      name: blocksName[id] || id
    }));
  }, [schedules, devices, blocksName]);

  const getScheduleStyle = (schedule: Schedule) => {
    if (!schedule.start_time || !schedule.end_time) return {};

    const start = parseISO(schedule.start_time);
    const end = parseISO(schedule.end_time);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = endHour - startHour;

    return {
      left: `${(startHour / 24) * 100}%`,
      width: `${(duration / 24) * 100}%`,
    };
  };

  const getStatusColor = (status?: string) => {
    if (status === "active" || status === SCHEDULE_COMPLETED_STATUS.CREATED || status === SCHEDULE_COMPLETED_STATUS.UPDATED) {
      return "bg-blue-600 hover:bg-blue-700 border-blue-800";
    }
    if (status === "completed") return "bg-green-600 hover:bg-green-700 border-green-800";
    if (status === "cancelled") return "bg-red-600 hover:bg-red-700 border-red-800";
    return "bg-gray-600 hover:bg-gray-700 border-gray-800";
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 font-medium min-w-[140px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(currentDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="hidden sm:flex"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedBlock} onValueChange={setSelectedBlock}>
            <SelectTrigger className="w-[180px] h-9">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Filter by Block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {uniqueBlocks.map(block => (
                <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={onCreate} size="sm" className="gap-2 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white">
            <Plus className="h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      <Card className="overflow-hidden border shadow-soft-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header - Hours */}
              <div className="grid grid-cols-[200px_1fr] border-b bg-muted/30 sticky top-0 z-20">
                <div className="p-3 font-medium text-sm text-muted-foreground border-r flex items-center bg-muted/30">
                  Device / Hour
                </div>
                <div className="relative h-10 bg-muted/30">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l text-[10px] text-muted-foreground pl-1 pt-2"
                      style={{ left: `${(hour / 24) * 100}%` }}
                    >
                      {hour}:00
                    </div>
                  ))}
                  {/* 24:00 marker */}
                  <div
                    className="absolute top-0 bottom-0 border-l text-[10px] text-muted-foreground pl-1 pt-2"
                    style={{ left: '100%', transform: 'translateX(-100%)' }}
                  >
                    24:00
                  </div>
                </div>
              </div>

              {/* Rows Grouped by Block */}
              <div className="divide-y">
                {sortedBlockIds.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No devices found.
                  </div>
                ) : (
                  sortedBlockIds.map((blockId) => (
                    <div key={blockId} className="divide-y">
                      {/* Block Header */}
                      {blockId !== "unassigned" && (
                        <div className="bg-muted/10 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-t sticky left-0 z-10">
                          {blocksName[blockId] || blockId}
                        </div>
                      )}

                      {/* Devices in Block */}
                      {groupedDevices[blockId].map((device) => {
                        // Find schedules for this device on this day
                        const deviceSchedules = daySchedules.filter(
                          s => s.device_id === device.device_id
                        );

                        return (
                          <div key={device.device_id} className="grid grid-cols-[200px_1fr] hover:bg-muted/5 transition-colors group">
                            <div className="p-3 text-sm font-medium border-r flex items-center truncate bg-card sticky left-0 z-10" title={device.device_name}>
                              {device.device_name}
                            </div>
                            <div className="relative h-16 border-l-0">
                              {/* Grid lines */}
                              {hours.map((hour) => (
                                <div
                                  key={hour}
                                  className="absolute top-0 bottom-0 border-l border-dashed border-muted/50 h-full"
                                  style={{ left: `${(hour / 24) * 100}%` }}
                                />
                              ))}
                              {/* End of day grid line */}
                              <div
                                className="absolute top-0 bottom-0 border-l border-dashed border-muted/50 h-full"
                                style={{ left: '100%' }}
                              />

                              {/* Schedule Bars */}
                              {deviceSchedules.map((schedule) => (
                                <div
                                  key={schedule.schedule_id}
                                  className={cn(
                                    "absolute top-2 bottom-2 rounded-md border text-white text-xs flex flex-col justify-center px-2 cursor-pointer shadow-sm transition-all hover:brightness-110 z-10 overflow-hidden",
                                    getStatusColor(schedule.schedule_status)
                                  )}
                                  style={getScheduleStyle(schedule)}
                                  onClick={() => onEdit(schedule)}
                                  title={`${format(parseISO(schedule.start_time!), "HH:mm")} - ${format(parseISO(schedule.end_time!), "HH:mm")}\n${schedule.schedule_status}`}
                                >
                                  <div className="font-semibold truncate">
                                    {format(parseISO(schedule.start_time!), "HH:mm")} - {format(parseISO(schedule.end_time!), "HH:mm")}
                                  </div>
                                  <div className="truncate opacity-90 text-[10px]">
                                    {schedule.schedule_status}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

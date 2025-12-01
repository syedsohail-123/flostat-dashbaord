import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, RotateCw, Plus, Calendar as CalendarIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Schedule, Device } from "@/components/types/types";
import { cn } from "@/lib/utils";
import { SCHEDULE_COMPLETED_STATUS } from "@/utils/constants";

interface SidebarCalendarViewProps {
    schedules: Schedule[];
    devices: Device[];
    devicesObject: Record<string, string>;
    blocksName: Record<string, string>;
    onEdit: (schedule: Schedule) => void;
    onDelete: (schedule: Schedule) => void;
    onCreate: () => void;
    onRefresh: () => void;
    isLoading?: boolean;
    viewMode: "card" | "calendar";
    onViewModeChange: (mode: "card" | "calendar") => void;
}

export function SidebarCalendarView({
    schedules,
    devices,
    devicesObject,
    blocksName,
    onEdit,
    onCreate,
    onRefresh,
    isLoading,
    viewMode,
    onViewModeChange
}: SidebarCalendarViewProps) {
    const [selectedBlock, setSelectedBlock] = useState<string>("all");
    const [selectedDevice, setSelectedDevice] = useState<string>("all");

    const timeRanges = [
        { start: 0, end: 6, label: "00:00 - 06:00" },
        { start: 6, end: 12, label: "06:00 - 12:00" },
        { start: 12, end: 18, label: "12:00 - 18:00" },
        { start: 18, end: 24, label: "18:00 - 24:00" }
    ];
    const [currentTimeRangeIndex, setCurrentTimeRangeIndex] = useState<number>(2);
    const currentTimeRange = timeRanges[currentTimeRangeIndex];

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const daySchedules = useMemo(() => {
        const filtered = schedules.filter(schedule => {
            if (selectedBlock !== "all" && schedule.block_id !== selectedBlock) {
                return false;
            }
            
            if (selectedDevice !== "all" && schedule.device_id !== selectedDevice) {
                return false;
            }

            return true;
        });

        console.log('=== SCHEDULE FILTERING DEBUG ===');
        console.log('Total schedules:', schedules.length);
        console.log('Filtered schedules:', filtered.length);
        console.log('Selected block:', selectedBlock);
        console.log('Selected device:', selectedDevice);

        return filtered;
    }, [schedules, selectedBlock, selectedDevice]);

    const groupedDevices = useMemo(() => {
        const groups: Record<string, Device[]> = {};
        const deviceBlockMap: Record<string, string> = {};
        const processedDevices = new Set<string>();

        schedules.forEach(s => {
            if (s.device_id && s.block_id && !deviceBlockMap[s.device_id]) {
                deviceBlockMap[s.device_id] = s.block_id;
            }
        });
        
        console.log('Device-Block mapping:', deviceBlockMap);
        console.log('Selected block:', selectedBlock);

        devices.forEach(d => {
            // @ts-ignore
            if (d.block_id && d.device_id && !deviceBlockMap[d.device_id]) {
                // @ts-ignore
                deviceBlockMap[d.device_id] = d.block_id;
            }
        });

        const allDeviceIds = Object.keys(devicesObject);

        allDeviceIds.forEach(deviceId => {
            if (processedDevices.has(deviceId)) return;

            const blockId = deviceBlockMap[deviceId] || "unassigned";
            
            // Only show devices from selected block
            if (selectedBlock !== "all" && blockId !== selectedBlock) return;
            if (selectedDevice !== "all" && deviceId !== selectedDevice) return;

            if (!groups[blockId]) {
                groups[blockId] = [];
            }

            const device = devices.find(d => d.device_id === deviceId) || {
                device_id: deviceId,
                device_name: devicesObject[deviceId]
            } as Device;

            groups[blockId].push(device);
            processedDevices.add(deviceId);
        });

        return groups;
    }, [devices, devicesObject, schedules, selectedBlock, selectedDevice]);

    const sortedBlockIds = useMemo(() => {
        return Object.keys(groupedDevices).sort((a, b) => {
            if (a === "unassigned") return 1;
            if (b === "unassigned") return -1;
            return (blocksName[a] || a).localeCompare(blocksName[b] || b);
        });
    }, [groupedDevices, blocksName]);

    const uniqueBlocks = useMemo(() => {
        const blocks = new Set<string>();
        schedules.forEach(s => {
            if (s.block_id) blocks.add(s.block_id);
        });
        devices.forEach(d => {
            // @ts-ignore
            if (d.block_id) blocks.add(d.block_id);
        });

        return [...new Set(Array.from(blocks))].map(id => ({
            id,
            name: blocksName[id] || id
        }));
    }, [schedules, devices, blocksName]);

    const uniqueDevices = useMemo(() => {
        const deviceIds = [...new Set(Object.keys(devicesObject))];
        return deviceIds.map(id => ({
            id,
            name: devicesObject[id] || id
        }));
    }, [devicesObject]);

    const getScheduleStyle = (schedule: Schedule) => {
        if (!schedule.start_time || !schedule.end_time) return {};

        const [startHour, startMin] = schedule.start_time.split(':').map(Number);
        const [endHour, endMin] = schedule.end_time.split(':').map(Number);
        
        const start = new Date();
        start.setHours(startHour, startMin, 0, 0);
        
        const end = new Date();
        end.setHours(endHour, endMin, 0, 0);

        const startHourFloat = start.getHours() + start.getMinutes() / 60;
        const endHourFloat = end.getHours() + end.getMinutes() / 60;
        const duration = endHourFloat - startHourFloat;

        return {
            left: `${(startHourFloat / 24) * 100}%`,
            width: `${(duration / 24) * 100}%`,
        };
    };

    const getStatusColor = (status?: string) => {
        if (status === "active" || status === SCHEDULE_COMPLETED_STATUS.CREATED || status === SCHEDULE_COMPLETED_STATUS.UPDATED) {
            return "bg-[#0F172A] border-[#1E293B]";
        }
        if (status === "completed") return "bg-green-600 border-green-800";
        if (status === "cancelled") return "bg-red-600 border-red-800";
        return "bg-gray-600 border-gray-800";
    };

    const getStatusDotColor = (status?: string) => {
        if (status === "active" || status === SCHEDULE_COMPLETED_STATUS.CREATED || status === SCHEDULE_COMPLETED_STATUS.UPDATED) {
            return "bg-yellow-500";
        }
        return "bg-gray-400";
    }

    return (
        <div className="space-y-6 animate-fadeIn p-6 bg-background min-h-screen">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">CALENDAR</p>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule Manager</h1>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center bg-muted rounded-md p-1 mr-2">
                            <Button
                                variant={viewMode === "card" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => onViewModeChange("card")}
                                className="h-8 px-2"
                                title="Card View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => onViewModeChange("calendar")}
                                className="h-8 px-2"
                                title="Calendar View"
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card p-2 rounded-lg">
                    <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
                        <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                            <SelectTrigger className="w-[180px] bg-background border-input">
                                <SelectValue placeholder="1 Block" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Blocks</SelectItem>
                                {uniqueBlocks.map((block, index) => (
                                    <SelectItem key={`${block.id}-${index}`} value={block.id}>{block.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1 bg-background border rounded-md p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentTimeRangeIndex((prev) => (prev - 1 + timeRanges.length) % timeRanges.length)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-4 font-medium text-sm min-w-[120px] text-center">
                                {currentTimeRange.label}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentTimeRangeIndex((prev) => (prev + 1) % timeRanges.length)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                            <SelectTrigger className="w-[180px] bg-background border-input">
                                <SelectValue placeholder="All Devices" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Devices</SelectItem>
                                {uniqueDevices.map((device, index) => (
                                    <SelectItem key={`${device.id}-${index}`} value={device.id}>{device.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                        <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedBlock("all");
                            setSelectedDevice("all");
                            setCurrentTimeRangeIndex(2);
                        }}>
                            Reset
                        </Button>

                        <Button onClick={onCreate} className="gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white">
                            <Plus className="h-4 w-4" />
                            Add Schedule
                        </Button>

                        <Button variant="ghost" size="icon" onClick={onRefresh}>
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Cancelled</span>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border shadow-sm bg-card">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                            <div className="grid grid-cols-[200px_1fr] border-b bg-muted/10 sticky top-0 z-20">
                                <div className="p-4 font-semibold text-sm text-muted-foreground border-r flex items-center">
                                    Device / Hour
                                </div>
                                <div className="relative h-12">
                                    {hours.map((hour) => (
                                        <div
                                            key={hour}
                                            className="absolute top-0 bottom-0 flex items-center justify-center text-xs text-muted-foreground"
                                            style={{ left: `${(hour / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
                                        >
                                            {String(hour).padStart(2, '0')}
                                        </div>
                                    ))}
                                    {/* 24:00 label */}
                                    <div
                                        className="absolute top-0 bottom-0 flex items-center text-xs text-muted-foreground"
                                        style={{ left: '100%', transform: 'translateX(-100%)' }}
                                    >
                                        24
                                    </div>

                                </div>
                            </div>

                            <div className="divide-y">
                                {sortedBlockIds.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground">
                                        No devices found for the selected criteria.
                                    </div>
                                ) : (
                                    sortedBlockIds.map((blockId) => (
                                        <div key={blockId} className="divide-y">
                                            {groupedDevices[blockId].map((device) => {
                                                const deviceSchedules = daySchedules.filter(
                                                    s => s.device_id === device.device_id
                                                );

                                                console.log(`Device ${device.device_name} has ${deviceSchedules.length} schedules`);

                                                return (
                                                    <div key={device.device_id} className="grid grid-cols-[200px_1fr] hover:bg-muted/5 transition-colors group min-h-[80px]">
                                                        <div className="p-4 text-sm font-medium border-r flex items-center truncate bg-card sticky left-0 z-10" title={device.device_name}>
                                                            {device.device_name}
                                                        </div>
                                                        <div className="relative h-full border-l-0">
                                                            {hours.map((hour) => (
                                                                <div
                                                                    key={hour}
                                                                    className="absolute top-0 bottom-0 border-l border-border/40 h-full"
                                                                    style={{ left: `${(hour / 24) * 100}%` }}
                                                                />
                                                            ))}
                                                            {/* End of day line (24:00) */}
                                                            <div
                                                                className="absolute top-0 bottom-0 border-l border-border/40 h-full"
                                                                style={{ left: '100%' }}
                                                            />


                                                            {deviceSchedules.map((schedule) => {
                                                                if (!schedule.start_time || !schedule.end_time) {
                                                                    console.log('Schedule missing times:', schedule.schedule_id);
                                                                    return null;
                                                                }

                                                                try {
                                                                    // Create dates from time strings (HH:mm:ss)
                                                                    const today = new Date().toISOString().split('T')[0];
                                                                    const startDate = new Date(`${today}T${schedule.start_time}`);
                                                                    const endDate = new Date(`${today}T${schedule.end_time}`);

                                                                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                                                                        console.log('Invalid dates for schedule:', schedule.schedule_id, 'Start:', schedule.start_time, 'End:', schedule.end_time);
                                                                        return null;
                                                                    }

                                                                    const style = getScheduleStyle(schedule);
                                                                    console.log('Rendering schedule:', schedule.schedule_id, 'Style:', style);

                                                                    return (
                                                                        <div
                                                                            key={schedule.schedule_id}
                                                                            className="absolute top-1/2 -translate-y-1/2 rounded bg-black text-white text-sm font-bold flex items-center justify-center cursor-pointer shadow-md z-10 px-2 py-1"
                                                                            style={style}
                                                                            onClick={() => onEdit(schedule)}
                                                                        >
                                                                            {schedule.start_time.substring(0, 5)}-{schedule.end_time.substring(0, 5)}
                                                                        </div>
                                                                    );
                                                                } catch (error) {
                                                                    console.log('Error rendering schedule:', schedule.schedule_id, error);
                                                                    return null;
                                                                }
                                                            })}
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

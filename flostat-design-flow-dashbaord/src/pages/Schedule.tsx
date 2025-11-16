import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BlockSelector } from "@/components/BlockSelector";
import { EventPill, EventStatus } from "@/components/EventPill";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, RotateCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ScheduleEvent {
  id: string;
  title: string;
  device: string;
  startHour: number;
  durationHours: number;
  status: EventStatus;
  deviceId: string;
}

const devices = [
  { id: "pump-2", name: "Pump 2" },
  { id: "valve-3", name: "Valve 3" },
  { id: "pump-1", name: "Pump 1" },
  { id: "valve-1", name: "Valve 1" },
  { id: "valve-4", name: "Valve 4" },
  { id: "pump-ahub", name: "Pump AHub" },
  { id: "pump-3", name: "Pump 3" },
  { id: "valve-2", name: "Valve 2" },
];

const events: ScheduleEvent[] = [
  {
    id: "evt-1",
    title: "Scheduled",
    device: "Pump 2",
    startHour: 13,
    durationHours: 1,
    status: "scheduled",
    deviceId: "pump-2",
  },
  {
    id: "evt-2",
    title: "Scheduled",
    device: "Pump 2",
    startHour: 14,
    durationHours: 1,
    status: "scheduled",
    deviceId: "pump-2",
  },
  {
    id: "evt-3",
    title: "Scheduled",
    device: "Pump 2",
    startHour: 16,
    durationHours: 1,
    status: "scheduled",
    deviceId: "pump-2",
  },
  {
    id: "evt-4",
    title: "Scheduled",
    device: "Pump 2",
    startHour: 16.5,
    durationHours: 0.5,
    status: "scheduled",
    deviceId: "pump-2",
  },
  {
    id: "evt-5",
    title: "Scheduled",
    device: "Pump 2",
    startHour: 17,
    durationHours: 1,
    status: "scheduled",
    deviceId: "pump-2",
  },
  {
    id: "evt-6",
    title: "Scheduled",
    device: "Valve 3",
    startHour: 13,
    durationHours: 1,
    status: "scheduled",
    deviceId: "valve-3",
  },
  {
    id: "evt-7",
    title: "Scheduled",
    device: "Valve 1",
    startHour: 15,
    durationHours: 1.5,
    status: "scheduled",
    deviceId: "valve-1",
  },
  {
    id: "evt-8",
    title: "Scheduled",
    device: "Valve 1",
    startHour: 17,
    durationHours: 0.75,
    status: "scheduled",
    deviceId: "valve-1",
  },
  {
    id: "evt-9",
    title: "Scheduled",
    device: "Valve 4",
    startHour: 16,
    durationHours: 1,
    status: "scheduled",
    deviceId: "valve-4",
  },
  {
    id: "evt-10",
    title: "Scheduled",
    device: "Valve 2",
    startHour: 16,
    durationHours: 0.3,
    status: "scheduled",
    deviceId: "valve-2",
  },
  {
    id: "evt-11",
    title: "Scheduled",
    device: "Valve 2",
    startHour: 17.5,
    durationHours: 0.3,
    status: "scheduled",
    deviceId: "valve-2",
  },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  deviceId: z.string().min(1, "Device is required"),
  startHour: z.coerce.number().min(0).max(24),
  durationHours: z.coerce.number().min(0.25).max(24),
});

type FormValues = z.infer<typeof formSchema>;

export default function Schedule() {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [timeWindow, setTimeWindow] = useState<string>("today");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowStart, setWindowStart] = useState<number>(12);
  const [windowEnd, setWindowEnd] = useState<number>(18);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(events);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Live 'now' time, updates periodically for the moving timeline
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    // Update every 30s to keep the line fresh without over-rendering
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const hours = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      deviceId: "",
      startHour: 12,
      durationHours: 1,
    },
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch from the backend
      // const response = await apiService.getSchedule();
      // For now, we'll use mock data
      setScheduleEvents(events);
    } catch (error) {
      setError("Failed to fetch schedule");
      toast.error("Failed to fetch schedule");
      console.error("Fetch schedule error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shiftWindow = (delta: number) => {
    const span = windowEnd - windowStart;
    const nextStart = Math.max(0, Math.min(24 - span, windowStart + delta));
    const nextEnd = nextStart + span;
    setWindowStart(nextStart);
    setWindowEnd(nextEnd);
  };

  const filteredEvents =
    selectedDevice === "all"
      ? scheduleEvents
      : scheduleEvents.filter((evt) => evt.deviceId === selectedDevice);

  const handleReset = () => {
    setSelectedBlocks([]);
    setSelectedDevice("all");
    setSelectedEventId(null);
  };

  const handleRefresh = async () => {
    await fetchSchedule();
    toast.success("Schedule refreshed");
  };

  const handleAddSchedule = () => {
    // Open the create schedule modal
    setIsCreateModalOpen(true);
  };

  const handleCreateSchedule = (data: FormValues) => {
    // Create a new schedule event
    const newEvent: ScheduleEvent = {
      id: `evt-${Date.now()}`,
      title: data.title,
      device: devices.find(d => d.id === data.deviceId)?.name || "Unknown Device",
      startHour: data.startHour,
      durationHours: data.durationHours,
      status: "scheduled",
      deviceId: data.deviceId,
    };

    // Add to the schedule events
    setScheduleEvents(prev => [...prev, newEvent]);
    
    // Close the modal
    setIsCreateModalOpen(false);
    
    // Reset the form
    form.reset();
    
    // Show success message
    toast.success("Schedule created successfully");
  };

  // keyboard navigation across events
  const handleKeyNav: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const sorted = [...filteredEvents].sort((a, b) => a.startHour - b.startHour);
    const idx = sorted.findIndex((ev) => ev.id === selectedEventId);
    if (e.key === 'ArrowRight') {
      const next = idx < 0 ? 0 : Math.min(sorted.length - 1, idx + 1);
      setSelectedEventId(sorted[next]?.id ?? null);
    } else if (e.key === 'ArrowLeft') {
      const prev = idx < 0 ? 0 : Math.max(0, idx - 1);
      setSelectedEventId(sorted[prev]?.id ?? null);
    } else if (e.key === 'Home') {
      setSelectedEventId(sorted[0]?.id ?? null);
    } else if (e.key === 'End') {
      setSelectedEventId(sorted[sorted.length - 1]?.id ?? null);
    }
  };

  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  return (
    <div className="space-y-4 animate-fadeIn" tabIndex={0} onKeyDown={handleKeyNav}>
      {/* Create Schedule Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
            <DialogDescription>
              Create a new schedule for a device. Set the time and duration for the scheduled event.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSchedule)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Schedule title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Hour</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="24" step="0.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0.25" max="24" step="0.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Top Toolbar */}
      <Card className="bg-gradient-card shadow-soft-lg border-border/50">
        <CardHeader className="border-b border-border/50 bg-secondary/5 p-4 transition-smooth">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-soft-muted uppercase tracking-wide">
              CALENDAR
            </div>
            <Button title="Refresh" aria-label="Refresh" variant="default" size="sm" className="bg-success/90 hover:bg-success/80 gap-2 shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5" onClick={handleRefresh}>
              <RotateCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight mb-6 text-soft">Schedule Manager</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* 1. Block Selector */}
            <BlockSelector
              selectedBlocks={selectedBlocks}
              onBlocksChange={setSelectedBlocks}
              compact
            />

            {/* 2. Time Window with chevrons */}
            <div className="flex items-center gap-2">
              <Button title="Previous window" aria-label="Previous window" onClick={() => shiftWindow(-1)} variant="outline" size="icon" className="h-9 w-9 hover:shadow-soft-sm transition-smooth">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 border border-border/50 rounded-md bg-background/80 text-sm font-medium min-w-[140px] text-center h-9 flex items-center justify-center shadow-soft-sm">
                {String(windowStart).padStart(2, '0')}:00 - {String(windowEnd).padStart(2, '0')}:00
              </div>
              <Button title="Next window" aria-label="Next window" onClick={() => shiftWindow(1)} variant="outline" size="icon" className="h-9 w-9 hover:shadow-soft-sm transition-smooth">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 3. Device Filter 'All Devices' with chevrons */}
            <div className="flex items-center gap-2">
              <Button title="Previous device" aria-label="Previous device" variant="outline" size="icon" className="h-9 w-9 hover:shadow-soft-sm transition-smooth">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="w-[160px] h-9 transition-smooth focus:shadow-soft-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button title="Next device" aria-label="Next device" variant="outline" size="icon" className="h-9 w-9 hover:shadow-soft-sm transition-smooth">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1" />

            {/* 4. Reset (ghost) */}
            <Button title="Reset filters" aria-label="Reset filters" variant="ghost" onClick={handleReset} className="text-soft-muted h-9 hover:text-soft transition-smooth">
              Reset
            </Button>
            
            {/* 5. Add Schedule (primary) */}
            <Button title="Add schedule" aria-label="Add schedule" className="gap-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 h-9 shadow-soft-sm hover:shadow-soft-md transition-smooth hover:-translate-y-0.5" onClick={handleAddSchedule}>
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
            
            {/* 6. Refresh */}
            <Button title="Refresh" aria-label="Refresh" variant="outline" size="icon" className="h-9 w-9 hover:shadow-soft-sm transition-smooth" onClick={handleRefresh}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-soft-muted">
            <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(220,70%,62%)]" /> Scheduled</div>
            <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-success/90" /> Active</div>
            <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-muted" /> Completed</div>
            <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive/90" /> Cancelled</div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Timeline Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-soft-sm">
            <div className="flex">
              <div className="w-48 shrink-0 border-r border-border/50 bg-secondary/5 px-4 py-3 text-sm font-semibold text-soft">
                Device / Hour
              </div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0, 1fr))` }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-r border-border/50 px-2 py-3 text-center text-xs font-medium text-soft-muted"
                  >
                    {hour}:00
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="relative min-h-[400px]">
            {/* Global current time indicator */}
            {currentHour >= windowStart && currentHour <= windowEnd && (
              <div
                className="pointer-events-none absolute top-[48px] bottom-0 w-0.5 bg-destructive/90 z-20"
                style={{ left: `${((currentHour - windowStart) / (windowEnd - windowStart)) * 100}%` }}
              >
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-destructive shadow-sm" />
                <div className="absolute -top-6 -translate-x-1/2 px-1.5 py-0.5 rounded bg-destructive text-white text-[10px] font-semibold tracking-wide shadow-soft-sm">
                  Now
                </div>
              </div>
            )}
            {devices.map((device, idx) => {
              const deviceEvents = filteredEvents.filter(
                (evt) => evt.deviceId === device.id
              );

              return (
                <div key={device.id} className="flex border-b border-border/50 last:border-b-0 hover:bg-secondary/5 transition-smooth">
                  <div className="w-48 shrink-0 border-r border-border/50 bg-background px-4 py-6 text-sm font-medium text-soft">
                    {device.name}
                  </div>
                  <div
                    className="flex-1 relative h-20 grid"
                    style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(0, 1fr))` }}
                    onMouseMove={(e) => {
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const col = Math.floor((x / rect.width) * (hours.length));
                      const h = windowStart + Math.max(0, Math.min(hours.length - 1, col));
                      setHoveredHour(h);
                    }}
                    onMouseLeave={() => setHoveredHour(null)}
                    onDoubleClick={(e) => {
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const col = Math.floor((x / rect.width) * (hours.length));
                      const h = windowStart + Math.max(0, Math.min(hours.length - 1, col));
                      console.log('Create event at', device.id, '@', h, ':00');
                    }}
                    role="grid"
                    aria-label={`Timeline for ${device.name}`}
                  >
                    {hours.map((hour) => (
                      <div key={hour} className="border-r border-border/30 h-full" />
                    ))}

                    {/* Hovered column highlight */}
                    {hoveredHour !== null && hoveredHour >= windowStart && hoveredHour <= windowEnd && (
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 bg-[hsl(var(--aqua))]/10 z-10"
                        style={{
                          left: `${((hoveredHour - windowStart) / (windowEnd - windowStart)) * 100}%`,
                          width: `${(1 / (windowEnd - windowStart)) * 100}%`,
                        }}
                      />
                    )}

                    {/* Event pills */}
                    {/* TODO: Add drag-to-create functionality on empty grid spaces */}
                    {/* TODO: Add drag-to-resize handles on pill edges */}
                    {/* TODO: Add overlap detection and warning states */}
                    {deviceEvents.map((event) => (
                      <EventPill
                        key={event.id}
                        {...event}
                        startHour={event.startHour}
                        durationHours={event.durationHours}
                        timeRangeStart={windowStart}
                        timeRangeEnd={windowEnd}
                        selected={selectedEventId === event.id}
                        onSelect={() =>
                          setSelectedEventId(
                            selectedEventId === event.id ? null : event.id
                          )
                        }
                        onEdit={() => console.log("Edit event:", event.id)}
                        onDelete={() => console.log("Delete event:", event.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {!isLoading && !error && filteredEvents.length === 0 && (
              <div className="flex items-center justify-center py-20 text-center">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">No scheduled events</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Click "Add Schedule" to create a new event for your devices
                  </p>
                  <Button className="mt-4 gap-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90" onClick={handleAddSchedule}>
                    <Plus className="h-4 w-4" />
                    Add Schedule
                  </Button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="space-y-3 text-center">
                  <RotateCw className="h-8 w-8 animate-spin mx-auto text-[hsl(var(--aqua))]" />
                  <p className="text-sm text-muted-foreground">Loading schedule...</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error loading schedule</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
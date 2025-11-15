import { useState } from "react";
import { cn } from "@/lib/utils";
import { DeviceCard } from "@/components/DeviceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockSelector, availableBlocks } from "@/components/BlockSelector";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, XCircle, X, MoreVertical, Power, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const devices = [
  {
    id: "pump-001",
    name: "Primary Pump A1",
    type: "pump" as const,
    status: "active" as const,
    value: 3250,
    unit: "RPM",
    threshold: { min: 2000, max: 4000 },
    location: "Building A - Floor 1",
    block: "block-a",
    uptime: "99.8%",
    lastSync: "2 min ago",
  },
  {
    id: "valve-001",
    name: "Main Control Valve",
    type: "valve" as const,
    status: "active" as const,
    value: 75,
    unit: "%",
    threshold: { min: 0, max: 100 },
    location: "Building A - Floor 2",
    block: "block-a",
    uptime: "98.5%",
    lastSync: "1 min ago",
  },
  {
    id: "tank-001",
    name: "Storage Tank T1",
    type: "tank" as const,
    status: "warning" as const,
    value: 8500,
    unit: "L",
    threshold: { min: 5000, max: 10000 },
    location: "Building B - Ground",
    block: "block-b",
    uptime: "97.2%",
    lastSync: "5 min ago",
  },
  {
    id: "pump-002",
    name: "Secondary Pump B2",
    type: "pump" as const,
    status: "inactive" as const,
    value: 0,
    unit: "RPM",
    threshold: { min: 2000, max: 4000 },
    location: "Building B - Floor 1",
    block: "block-b",
    uptime: "0%",
    lastSync: "30 min ago",
  },
  {
    id: "tank-003",
    name: "Tank",
    type: "tank" as const,
    status: "active" as const,
    value: 7600,
    unit: "L",
    threshold: { min: 5000, max: 10000 },
    location: "Building A - Floor 3",
    block: "block-a",
    uptime: "99.9%",
    lastSync: "1 min ago",
  },
  {
    id: "tank-002",
    name: "Reserve Tank T2",
    type: "tank" as const,
    status: "error" as const,
    value: 2100,
    unit: "L",
    threshold: { min: 5000, max: 10000 },
    location: "Building C - Ground",
    block: "block-c",
    uptime: "45.3%",
    lastSync: "15 min ago",
  },
  {
    id: "sump-001",
    name: "Main Sump S1",
    type: "sump" as const,
    status: "active" as const,
    value: 3200, // raw level units (e.g. liters) converted to % in card using max threshold
    unit: "L",
    threshold: { min: 500, max: 5000 }, // max used for percent conversion; min retained for potential alerts
    location: "Building B - Basement",
    block: "block-b",
    uptime: "99.1%",
    lastSync: "3 min ago",
  },
];

const stats = [
  { label: "Total Devices", value: "48", icon: Activity, color: "text-aqua" },
  { label: "Active", value: "42", icon: CheckCircle, color: "text-success" },
  { label: "Warnings", value: "4", icon: AlertTriangle, color: "text-warning" },
  { label: "Offline", value: "2", icon: XCircle, color: "text-destructive" },
];

const getStatusBadge = (status: string) => {
  const variants = {
    active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-muted" },
    warning: { label: "Warning", className: "bg-warning/10 text-warning border-warning/20" },
    error: { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  return variants[status as keyof typeof variants] || variants.inactive;
};

export default function Dashboard() {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [multiTypes, setMultiTypes] = useState<string[]>([]); // multi device types
  const [minThreshold, setMinThreshold] = useState("");
  const [maxThreshold, setMaxThreshold] = useState("");
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [controls, setControls] = useState({
    pump2: true,
    pump1: false,
    pumpAHub: true,
    valve3: true,
    valve1: true,
    valve4: true,
  });

  // Tank levels (%, 0-100)
  const [tank4Level, setTank4Level] = useState<number>(1);
  const [tankStaffLevel, setTankStaffLevel] = useState<number>(4);
  const [tankAHubLevel, setTankAHubLevel] = useState<number>(23);

  const clampPercent = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  const filteredDevices = devices
    .filter((device) => (selectedBlocks.length === 0 ? true : selectedBlocks.includes(device.block)))
    .filter((device) => (multiTypes.length === 0 ? true : multiTypes.includes(device.type)));

  const filteredStats =
    selectedBlocks.length === 0
      ? stats
      : [
          { ...stats[0], value: filteredDevices.length.toString() },
          {
            ...stats[1],
            value: filteredDevices.filter((d) => d.status === "active").length.toString(),
          },
          {
            ...stats[2],
            value: filteredDevices.filter((d) => d.status === "warning").length.toString(),
          },
          {
            ...stats[3],
            value: filteredDevices.filter((d) => d.status === "inactive" || d.status === "error").length.toString(),
          },
        ];

  const handleSaveThresholds = () => {
    console.log("Saving thresholds:", { min: minThreshold, max: maxThreshold });
  };

  const showFilterChip = selectedBlocks.length > 0;
  
  // Apply common filters once, then render by device type group order
  const visibleDevices = filteredDevices
    .filter((d) => (statusFilter === 'all' ? true : d.status === statusFilter))
    .filter((d) => (search.trim() ? (d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())) : true));
  const typeOrder: Array<'tank' | 'valve' | 'pump' | 'sump'> = ['tank', 'valve', 'pump', 'sump'];
  const groupTitles: Record<'tank' | 'valve' | 'pump' | 'sump', string> = {
    tank: 'Tanks',
    valve: 'Valves',
    pump: 'Pumps',
    sump: 'Sumps',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Select Block:</label>
          <Select value={selectedBlocks.length === 0 ? "all" : selectedBlocks[0]} onValueChange={(value) => setSelectedBlocks(value === "all" ? [] : [value])}>
            <SelectTrigger className={cn(
              "w-[160px] h-9",
              selectedBlocks.length > 0 &&
                "border-[hsl(var(--aqua))] ring-2 ring-[hsl(var(--aqua))]/40 bg-[hsl(var(--aqua))]/5 shadow-soft-sm"
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {availableBlocks.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showFilterChip && (
            <button
              onClick={() => setSelectedBlocks([])}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium bg-[hsl(var(--aqua))]/10 text-[hsl(var(--aqua))] border-[hsl(var(--aqua))]/20 hover:bg-[hsl(var(--aqua))]/20 transition-colors"
              title="Clear block filter"
            >
              {availableBlocks.find((b) => b.id === selectedBlocks[0])?.name || selectedBlocks[0]}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Device Filters */}
      <Card className="shadow-soft-sm border-border/50">
        <CardContent className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Input
                placeholder="Search devices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            {/* Multi-device type selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "h-9 w-full rounded-md border px-3 text-left text-sm flex items-center justify-between",
                    multiTypes.length > 0 && "border-[hsl(var(--aqua))] bg-[hsl(var(--aqua))]/5"
                  )}
                >
                  <span className="truncate">
                    {multiTypes.length === 0
                      ? "All Device Types"
                      : multiTypes
                          .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                          .join(", ")}
                  </span>
                  <span className="text-xs opacity-60">{multiTypes.length === 0 ? "(All)" : `${multiTypes.length} selected`}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52">
                {['pump','valve','tank','sump'].map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={multiTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      setMultiTypes((prev) => {
                        if (checked) return [...prev, type];
                        return prev.filter((t) => t !== type);
                      });
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuCheckboxItem
                  checked={multiTypes.length === 0}
                  onCheckedChange={() => setMultiTypes([])}
                >
                  All Types
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organization Thresholds removed per request; moved to Settings page */}

      {/* Device Grid segregated by type: Tanks → Valves → Pumps → Sumps */}
      <div className="space-y-6">
        {typeOrder.map((t) => {
          const group = visibleDevices.filter((d) => d.type === t);
          if (group.length === 0) return null;
          return (
            <div key={t} className="space-y-3">
              <h2 className="text-sm font-semibold text-soft flex items-center gap-2">
                {groupTitles[t]}
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-[hsl(var(--aqua))]/10 text-[hsl(var(--aqua))] border-[hsl(var(--aqua))]/20">
                  {group.length}
                </span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.map((d) => (
                  <DeviceCard key={d.id} {...d} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* End device grid */}
    </div>
  );
}

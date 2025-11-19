import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DeviceCard } from "@/components/DeviceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockSelector } from "@/components/BlockSelector";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, XCircle, X, MoreVertical, Power, Settings, Plus } from "lucide-react";
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
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getOrgTopics } from "@/lib/operations/orgApis";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setTopics } from "@/slice/webSocketSlice";

// Add state to store devices
const initialDevices = [
  {
    id: "pump-001",
    name: "Primary Pump A1",
    type: "pump" as const,
    status: "active" as const,
    value: 3250,
    unit: "RPM",
    threshold: { min: 2000, max: 4000 },
    location: "Building A - Floor 1",
    block: "Block A",
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
    block: "Block A",
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
    block: "Block B",
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
    block: "Block B",
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
    block: "Block A",
    uptime: "99.9%",
    lastSync: "1 min ago",
  },
  {
    id: "valve-002",
    name: "Backup Valve",
    type: "valve" as const,
    status: "active" as const,
    value: 100,
    unit: "%",
    threshold: { min: 0, max: 100 },
    location: "Building C - Floor 1",
    block: "Block C",
    uptime: "96.7%",
    lastSync: "3 min ago",
  },
  {
    id: "pump-003",
    name: "Auxiliary Pump",
    type: "pump" as const,
    status: "warning" as const,
    value: 1800,
    unit: "RPM",
    threshold: { min: 2000, max: 4000 },
    location: "Building A - Floor 2",
    block: "Block A",
    uptime: "92.4%",
    lastSync: "Just now",
  },
  {
    id: "tank-staff",
    name: "Staff Quarters Tank",
    type: "tank" as const,
    status: "warning" as const,
    value: 4200,
    unit: "L",
    threshold: { min: 5000, max: 10000 },
    location: "Building A - Floor 1",
    block: "Block A",
    uptime: "95.1%",
    lastSync: "1 min ago",
  },
  {
    id: "tank-ahub",
    name: "AHub Tank",
    type: "tank" as const,
    status: "active" as const,
    value: 9100,
    unit: "L",
    threshold: { min: 5000, max: 10000 },
    location: "Building D - Floor 1",
    block: "Block D",
    uptime: "98.9%",
    lastSync: "4 min ago",
  },
  {
    id: "pump-ahub",
    name: "AHub Pump",
    type: "pump" as const,
    status: "active" as const,
    value: 3800,
    unit: "RPM",
    threshold: { min: 2000, max: 4000 },
    location: "Building D - Floor 1",
    block: "Block D",
    uptime: "99.2%",
    lastSync: "3 min ago",
  },
  {
    id: "sump-001",
    name: "Main Sump",
    type: "sump" as const,
    status: "active" as const,
    value: 30,
    unit: "cm",
    threshold: { min: 0, max: 100 },
    location: "Building A - Basement",
    block: "Block A",
    uptime: "100%",
    lastSync: "Just now",
  },
];

// Stats data
const stats = [
  { label: "Total Devices", value: "11", icon: Activity, color: "text-blue-500" },
  { label: "Active", value: "8", icon: CheckCircle, color: "text-green-500" },
  { label: "Warnings", value: "2", icon: AlertTriangle, color: "text-yellow-500" },
  { label: "Errors", value: "1", icon: XCircle, color: "text-red-500" },
];

export default function Dashboard() {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [multiTypes, setMultiTypes] = useState<string[]>([]);
  const [devices, setDevices] = useState<any[]>(initialDevices);
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
  const dispatch = useDispatch();
  const org_id = useSelector((state: RootState)=> state.org.org_id);
  const token = useSelector((state: RootState)=> state.auth.token);
  console.log("Token :",token)
  // fetch topics of the org
  useEffect(()=>{
    const fetchTopicsOfOrg = async(org_id)=>{
       const result = await getOrgTopics(org_id,token);
       console.log("Result topic fetch : ",result);
       if(result){
        dispatch(setTopics(result));
       }
    }
    if(org_id && token){
      fetchTopicsOfOrg(org_id);
    }else{
      console.error("Missing: ",token,org_id)
      toast.error("Missing params like org_id or token ");
    }
  },[org_id])
  // Load devices from localStorage when component mounts
  useEffect(() => {
    const loadDevicesFromStorage = () => {
      const storedDevices = localStorage.getItem('dashboardDevices');
      if (storedDevices) {
        try {
          const parsedDevices = JSON.parse(storedDevices);
          setDevices([...initialDevices, ...parsedDevices]);
        } catch (e) {
          console.error('Failed to parse devices from localStorage', e);
          setDevices(initialDevices);
        }
      } else {
        setDevices(initialDevices);
      }
    };

    loadDevicesFromStorage();

    // Listen for updates to dashboard devices
    const handleDevicesUpdate = () => {
      loadDevicesFromStorage();
    };

    window.addEventListener('devicesUpdated', handleDevicesUpdate);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('devicesUpdated', handleDevicesUpdate);
    };
  }, []);

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
    .filter((d) => typeFilter === "all" || d.type === typeFilter)
    .filter((d) => statusFilter === "all" || d.status === statusFilter)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  const pumpDevices = visibleDevices.filter((d) => d.type === "pump");
  const valveDevices = visibleDevices.filter((d) => d.type === "valve");
  const tankDevices = visibleDevices.filter((d) => d.type === "tank");
  const sumpDevices = visibleDevices.filter((d) => d.type === "sump");

  // Function to add a new device to the dashboard
  const addDeviceToDashboard = (newDevice: any) => {
    const storedDevices = localStorage.getItem('dashboardDevices');
    const existingDevices = storedDevices ? JSON.parse(storedDevices) : [];
    
    const updatedDevices = [...existingDevices, newDevice];
    
    localStorage.setItem('dashboardDevices', JSON.stringify(updatedDevices));
    
    // Dispatch event to notify the dashboard to refresh devices
    const event = new CustomEvent('devicesUpdated');
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and control your industrial systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button size="sm">Export Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-elevation-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <BlockSelector
              selectedBlocks={selectedBlocks}
              onBlocksChange={setSelectedBlocks}
            />
            <div className="relative">
              <Input
                placeholder="Search devices..."
                className="w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pump">Pumps</SelectItem>
                <SelectItem value="valve">Valves</SelectItem>
                <SelectItem value="tank">Tanks</SelectItem>
                <SelectItem value="sump">Sumps</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showFilterChip && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 pl-2 pr-3 py-1 rounded-full text-xs font-normal hover:bg-secondary/80"
              onClick={() => setSelectedBlocks([])}
            >
              <X className="h-3.5 w-3.5" />
              Filters applied
            </Badge>
          )}
        </div>

        {/* Device Sections */}
        {pumpDevices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pumps</h2>
              <Badge variant="secondary">{pumpDevices.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pumpDevices.map((device) => (
                <DeviceCard key={device.id} {...device} />
              ))}
            </div>
          </div>
        )}

        {valveDevices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Valves</h2>
              <Badge variant="secondary">{valveDevices.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {valveDevices.map((device) => (
                <DeviceCard key={device.id} {...device} />
              ))}
            </div>
          </div>
        )}

        {tankDevices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tanks</h2>
              <Badge variant="secondary">{tankDevices.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tankDevices.map((device) => (
                <DeviceCard key={device.id} {...device} />
              ))}
            </div>
          </div>
        )}

        {sumpDevices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Sumps</h2>
              <Badge variant="secondary">{sumpDevices.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sumpDevices.map((device) => (
                <DeviceCard key={device.id} {...device} />
              ))}
            </div>
          </div>
        )}

        {visibleDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No devices found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or create a new device.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity Table */}
      <Card className="shadow-elevation-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Pump A1</div>
                  <div className="text-sm text-muted-foreground">DEV-001</div>
                </TableCell>
                <TableCell>Started</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>2 min ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Tank T2</div>
                  <div className="text-sm text-muted-foreground">DEV-002</div>
                </TableCell>
                <TableCell>Level Alert</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Warning
                  </Badge>
                </TableCell>
                <TableCell>5 min ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Valve V3</div>
                  <div className="text-sm text-muted-foreground">DEV-003</div>
                </TableCell>
                <TableCell>Opened</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>10 min ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
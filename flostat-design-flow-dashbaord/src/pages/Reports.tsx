import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Download } from "lucide-react";
<<<<<<< HEAD
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationSelector } from "@/components/OrganizationSelector";
=======
>>>>>>> added-mqtt-connection-with-redux-store

const reports = [
  { id: "092ab42a-7190-4c79-a08a-9ce182a75fa1", deviceType: "Pump", status: "ON", level: null, lastUpdated: "11/10/2025, 10:20:30 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "092ab42a-7190-4c79-a08a-9ce182a75fa1", deviceType: "Pump", status: "OFF", level: null, lastUpdated: "11/10/2025, 10:19:29 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "092ab42a-7190-4c79-a08a-9ce182a75fa1", deviceType: "Pump", status: "ON", level: null, lastUpdated: "11/10/2025, 8:37:24 PM", updatedBy: "ahmedsyedsonal176@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "70%", lastUpdated: "11/8/2025, 3:20:15 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "70%", lastUpdated: "11/8/2025, 3:20:15 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "75%", lastUpdated: "11/8/2025, 3:20:10 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "75%", lastUpdated: "11/8/2025, 3:20:10 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "78%", lastUpdated: "11/8/2025, 3:20:03 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "78%", lastUpdated: "11/8/2025, 3:20:03 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "1e0514a2-38b1-4e50-adc4-6eb05b445bf9", deviceType: "Pump", status: "OFF", level: null, lastUpdated: "11/8/2025, 3:19:06 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "80%", lastUpdated: "11/8/2025, 3:19:06 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "80%", lastUpdated: "11/8/2025, 3:19:06 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "70%", lastUpdated: "11/8/2025, 3:19:00 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "70%", lastUpdated: "11/8/2025, 3:19:00 PM", updatedBy: "hrnh6531@gmail.com" },
  { id: "9d3f2c6a-5452-4910-a59e-d4ecd15c66ba", deviceType: "Tank", status: null, level: "60%", lastUpdated: "11/8/2025, 3:18:53 PM", updatedBy: "hrnh6531@gmail.com" },
];

export default function Reports() {
<<<<<<< HEAD
  const { authToken, currentOrganization, organizations } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [tankDevices, setTankDevices] = useState<TankDevice[]>([]);
  const [selectedTank, setSelectedTank] = useState<string>("no-tanks");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch tank devices when organization changes
  useEffect(() => {
    if (authToken && currentOrganization) {
      fetchTankDevices();
    }
  }, [authToken, currentOrganization]);

  const fetchTankDevices = async () => {
    try {
      if (!authToken || !currentOrganization) return;

      apiService.setAuthToken(authToken);

      const response = await apiService.getDevices(currentOrganization.org_id);

      if (response.success && response.devices) {
        const tanks = response.devices.filter((device: any) =>
          device.device_type === 'tank'
        );
        setTankDevices(tanks);

        if (tanks.length > 0 && (!selectedTank || selectedTank === "no-tanks")) {
          setSelectedTank(tanks[0].device_id);
        } else if (tanks.length === 0) {
          setSelectedTank("no-tanks");
        }
      }
    } catch (error) {
      console.error("Fetch tank devices error:", error);
      toast.error("Failed to fetch tank devices");
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Validation checks with specific error messages
      if (!authToken) {
        toast.error("Authentication required", {
          description: "Please log in to view reports.",
        });
        setReports([]);
        return;
      }

      if (!currentOrganization) {
        toast.error("Organization required", {
          description: "Please select an organization to view reports.",
        });
        setReports([]);
        return;
      }

      if (!selectedTank || selectedTank === "no-tanks") {
        toast.error("Tank selection required", {
          description: "Please select a tank to view reports.",
        });
        setReports([]);
        return;
      }

      apiService.setAuthToken(authToken);

      const params = {
        org_id: currentOrganization.org_id,
        date: selectedDate || new Date().toISOString().split('T')[0],
        tank_id: selectedTank
      };

      // Ensure date is in the correct format (YYYY-MM-DD)
      if (params.date && !/\d{4}-\d{2}-\d{2}/.test(params.date)) {
        const dateObj = new Date(params.date);
        params.date = dateObj.toISOString().split('T')[0];
      }

      console.log("Fetch Reports Params:", JSON.stringify(params, null, 2));
      const response = await apiService.getTankRelatedReport(params);
      console.log("Fetch Reports Response:", JSON.stringify(response, null, 2));

      if (!response) {
        throw new Error("Invalid response from server");
      }

      // Aggregate all logs
      const connectedLogs = [
        ...(response.connectedLogs || []),
        ...(response.tank_logs || []),
        ...(response.pump_logs || []),
        ...(response.sump_logs || []),
        ...(response.valve_logs || []),
        ...(response.data || []),
        ...(response.logs || []),
        ...(response.Items || [])
      ];

      // Remove duplicates based on ID if necessary (optional but good practice)
      const uniqueLogs = Array.from(new Map(connectedLogs.map((item: any) => [item.device_id || item.id || item.uuid, item])).values());

      console.log("Extracted unique logs:", JSON.stringify(uniqueLogs, null, 2));

      const transformedReports: Report[] = uniqueLogs.map((log: any) => ({
        id: log.device_id || log.id || log.uuid || "Unknown",
        deviceType: log.device_type || "Unknown",
        status: log.status !== undefined ? log.status : null,
        level: log.current_level ? `${log.current_level}%` : (log.level !== undefined ? log.level : null),
        lastUpdated: log.last_updated ? new Date(log.last_updated).toLocaleString() : "Unknown",
        updatedBy: log.updated_by || log.email || "System"
      }));

      setReports(transformedReports);

      if (uniqueLogs.length === 0) {
        toast.info("No data found", {
          description: `No reports found for the selected tank on ${params.date}`,
        });
      } else {
        toast.success("Data fetched successfully", {
          description: `Retrieved ${uniqueLogs.length} records`,
        });
      }

    } catch (error) {
      console.error("Fetch reports error:", error);
      const errorMessage = (error as Error).message;

      if (errorMessage.includes("Authentication required")) {
        toast.error("Authentication failed", {
          description: "Your session may have expired. Please log in again.",
        });
      } else if (errorMessage.includes("User does not exit in this org")) {
        toast.error("Access denied", {
          description: "You don't have access to this organization.",
        });
      } else if (errorMessage.includes("Tank device not Found")) {
        toast.error("Tank not found", {
          description: "The selected tank device does not exist.",
        });
      } else {
        toast.error("Failed to fetch reports", {
          description: errorMessage,
        });
      }
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    await fetchReports();
  };

  const handleDownloadPDF = async () => {
    toast.info("Download PDF functionality would be implemented here");
  };

  const levelSeries = useMemo(() => {
    const chartData: Record<string, any> = {};

    reports.forEach(report => {
      const timeMatch = report.lastUpdated?.match(/\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/i);
      if (timeMatch && (report.level || report.status !== null)) {
        let timeStr = timeMatch[0];
        let [time, modifier] = timeStr.split(' ');
        let [hours, minutes, seconds] = time.split(':');

        if (modifier?.toUpperCase() === 'PM' && hours !== '12') {
          hours = (parseInt(hours, 10) + 12).toString();
        }
        if (modifier?.toUpperCase() === 'AM' && hours === '12') {
          hours = '00';
        }

        hours = hours.padStart(2, '0');
        minutes = minutes.padStart(2, '0');
        seconds = seconds.padStart(2, '0');

        const formattedTime = `${hours}:${minutes}:${seconds}`;

        if (!chartData[formattedTime]) {
          chartData[formattedTime] = { ts: formattedTime };
        }

        if (report.level) {
          const levelValue = parseInt(report.level);
          if (!isNaN(levelValue)) {
            chartData[formattedTime][report.deviceType.toLowerCase()] = levelValue;
          }
        } else if (report.status !== null) {
          chartData[formattedTime][report.deviceType.toLowerCase()] = report.status === 'ON' ? 1 : 0;
        }
      }
    });

    const dataArray = Object.values(chartData);
    dataArray.sort((a, b) => a.ts.localeCompare(b.ts));

    return dataArray;
  }, [reports]);
=======
  const [selectedTank, setSelectedTank] = useState("tank-1");
  const [selectedDate, setSelectedDate] = useState("");

  // Demo time series (aggregated tank levels) for chart
  const levelSeries = useMemo(
    () => [
      { ts: "08:00", tank1: 62, tank2: 55, tank3: 78 },
      { ts: "09:00", tank1: 64, tank2: 57, tank3: 79 },
      { ts: "10:00", tank1: 65, tank2: 59, tank3: 77 },
      { ts: "11:00", tank1: 67, tank2: 60, tank3: 80 },
      { ts: "12:00", tank1: 69, tank2: 63, tank3: 81 },
      { ts: "13:00", tank1: 70, tank2: 65, tank3: 82 },
      { ts: "14:00", tank1: 72, tank2: 66, tank3: 83 },
      { ts: "15:00", tank1: 73, tank2: 67, tank3: 84 },
      { ts: "16:00", tank1: 74, tank2: 68, tank3: 85 },
    ],
    []
  );
>>>>>>> added-mqtt-connection-with-redux-store

  const chartConfig = {
    tank1: { label: "Tank 1", color: "hsl(192 100% 42%)" },
    tank2: { label: "Tank 2", color: "hsl(220 70% 62%)" },
    tank3: { label: "Tank 3", color: "hsl(142 65% 40%)" },
  };

<<<<<<< HEAD
  const filteredReports = reports;
=======
  const filteredReports = reports; // simple pass-through to match screenshot layout
>>>>>>> added-mqtt-connection-with-redux-store

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold tracking-tight text-soft text-center">Reports</h1>
<<<<<<< HEAD

      {authToken && organizations && organizations.length > 1 && (
        <div className="p-4 rounded-md border bg-muted/30">
          <div className="font-medium mb-2">Select Organization</div>
          <div className="max-w-xs">
            <OrganizationSelector />
          </div>
          {currentOrganization && (
            <div className="mt-2 text-sm text-muted-foreground">
              Currently viewing reports for: <span className="font-medium">{currentOrganization.name}</span>
            </div>
          )}
        </div>
      )}
=======
>>>>>>> added-mqtt-connection-with-redux-store

      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-soft-muted">Select Tank</label>
            <Select value={selectedTank} onValueChange={setSelectedTank}>
              <SelectTrigger className="w-[160px] h-9">
<<<<<<< HEAD
                <SelectValue placeholder="Select Tank">
                  {selectedTank
                    ? tankDevices.find(t => t.device_id === selectedTank)?.device_name || selectedTank
                    : "Select Tank"}
                </SelectValue>
=======
                <SelectValue placeholder="Select Tank" />
>>>>>>> added-mqtt-connection-with-redux-store
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tank-1">Tank 1</SelectItem>
                <SelectItem value="tank-2">Tank 2</SelectItem>
                <SelectItem value="tank-3">Tank 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-soft-muted">Select Date</label>
            <Input
              placeholder="mm/dd/yyyy"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 w-[140px]"
            />
          </div>
<<<<<<< HEAD
          <Button
            className="h-9 px-3 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm"
            onClick={handleFetchData}
          >
            Fetch Data
          </Button>
          <Button
            className="h-9 px-3 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white shadow-soft-sm"
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              "Refresh Data"
            )}
          </Button>
=======
          <Button className="h-9 px-3 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm">Fetch Data</Button>
>>>>>>> added-mqtt-connection-with-redux-store
        </div>
        <Button className="h-9 gap-2 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white"><Download className="h-4 w-4" /> Download PDF</Button>
      </div>

      <div className="rounded-lg border border-border/50 bg-card shadow-soft-lg animate-slideUp">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold text-soft">DEVICE ID</TableHead>
              <TableHead className="font-semibold text-soft">STATUS/LEVEL</TableHead>
              <TableHead className="font-semibold text-soft">DEVICE TYPE</TableHead>
              <TableHead className="font-semibold text-soft">LAST UPDATED</TableHead>
              <TableHead className="font-semibold text-soft">UPDATED BY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <TableRow key={index} className="hover:bg-muted/20 transition-smooth">
                  <TableCell className="font-mono text-xs text-soft">{report.id}</TableCell>
                  <TableCell className="space-x-1">
                    {report.status && (
                      <Badge
                        variant="outline"
                        className={report.status === "ON" ? "bg-success/15 text-success/90 border-success/25 shadow-soft-sm" : "bg-destructive/15 text-destructive/90 border-destructive/25 shadow-soft-sm"}
                      >
                        {report.status}
                      </Badge>
                    )}
                    {report.level && (
                      <Badge variant="outline" className="bg-[hsl(var(--aqua))]/15 text-[hsl(var(--aqua))] border-[hsl(var(--aqua))]/25 shadow-soft-sm">
                        {report.level}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-soft">{report.deviceType}</TableCell>
                  <TableCell className="text-sm text-soft-muted">{report.lastUpdated}</TableCell>
                  <TableCell className="text-sm text-[hsl(var(--aqua))]">{report.updatedBy}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No reports found. Select a tank and date, then click Fetch Data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

<<<<<<< HEAD
=======
      {/* Debug Information */}
      <div className="p-4 rounded-md border bg-warning/10 border-warning/30 text-xs text-soft">
        <div className="font-medium text-center text-warning">Debug Information</div>
        <div className="mt-2 grid gap-1 sm:grid-cols-2 md:grid-cols-3">
          <div>Current City: Los Estacas</div>
          <div>Device Count: 1657</div>
          <div>Logs: Available</div>
          <div>Water Level Alerts: 23</div>
          <div>Flow Rate Data Points: 447</div>
          <div>Last Sync: 2m ago</div>
        </div>
      </div>

      {/* Visualization */}
>>>>>>> added-mqtt-connection-with-redux-store
      <h2 className="text-center text-sm font-semibold text-soft">Device Data Visualization</h2>
      <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
        <CardHeader className="border-b bg-muted/30 py-3">
          <CardTitle className="text-sm font-medium">Water Level</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={chartConfig} className="w-full aspect-[16/6]">
            <AreaChart data={levelSeries} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="tank2Fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(220 70% 62%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(220 70% 62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="ts" tickLine={false} axisLine={false} />
<<<<<<< HEAD
              <YAxis width={28} tickLine={false} axisLine={false} />
              <Area
                dataKey="tank"
                stroke="var(--color-tank)"
                fill="var(--color-tank)"
                type="monotone"
                strokeWidth={2}
                fillOpacity={0.3}
              />
              <Area
                dataKey="pump"
                stroke="var(--color-pump)"
                fill="var(--color-pump)"
                type="monotone"
                strokeWidth={2}
                fillOpacity={0.3}
              />
              <Area
                dataKey="sump"
                stroke="var(--color-sump)"
                fill="var(--color-sump)"
                type="monotone"
                strokeWidth={2}
                fillOpacity={0.3}
              />
              <Area
                dataKey="valve"
                stroke="var(--color-valve)"
                fill="var(--color-valve)"
                type="monotone"
                strokeWidth={2}
                fillOpacity={0.3}
              />
=======
              <YAxis width={28} tickLine={false} axisLine={false} domain={[50, 90]} />
              <Area dataKey="tank2" stroke="var(--color-tank2)" fill="url(#tank2Fill)" type="monotone" strokeWidth={2} />
>>>>>>> added-mqtt-connection-with-redux-store
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Valve State Card */}
      <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
        <CardHeader className="border-b bg-muted/30 py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">Valve State</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--aqua))]"></span> Open</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground/60"></span> Closed</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#C00000]"></span> Disconnected</div>
          </div>
          <div className="relative w-full h-6 rounded-full border overflow-hidden flex" aria-label="Valve timeline state demo">
            <div className="h-full bg-muted-foreground/60" style={{ width: "55%" }} />
            <div className="h-full bg-[hsl(var(--aqua))]" style={{ width: "30%" }} />
            <div className="h-full bg-[#C00000]" style={{ width: "15%" }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </CardContent>
      </Card>

      {/* Pump State Card */}
      <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
        <CardHeader className="border-b bg-muted/30 py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">Pump State</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--aqua))]"></span> On</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground/60"></span> Off</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#C00000]"></span> Disconnected</div>
          </div>
          <div className="relative w-full h-6 rounded-full border overflow-hidden flex" aria-label="Pump timeline state demo">
            <div className="h-full bg-[hsl(var(--aqua))]" style={{ width: "40%" }} />
            <div className="h-full bg-muted-foreground/60" style={{ width: "45%" }} />
            <div className="h-full bg-[#C00000]" style={{ width: "15%" }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

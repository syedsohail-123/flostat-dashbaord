import { useMemo, useState, useEffect } from "react";
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
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationSelector } from "@/components/OrganizationSelector";

interface Report {
  id: string;
  deviceType: string;
  status: string | null;
  level: string | null;
  lastUpdated: string;
  timestamp: number;
  updatedBy: string;
}



interface TankDevice {
  device_id: string;
  device_name: string;
  device_type: string;
}

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
  const { authToken, currentOrganization, organizations } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [tankDevices, setTankDevices] = useState<TankDevice[]>([]);
  const [selectedTank, setSelectedTank] = useState<string>("no-tanks");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDeviceType, setFilterDeviceType] = useState("all");

  const dummyEmails = [
    "admin@gmail.com", "hardware@gmail.com", "chopdeharshit@gmail.com",
    "dashboard@gmail.com", "harshitchopde025@gmail.com", "hrhit6581@gmail.com",
    "ahmedsyedsohail776@gmail.com", "kadamakanksha3814@gmail.com",
    "souvikghoshofficial19@gmail.com", "anik.panja2804@gmail.com",
    "majaykumar7@gmail.com"
  ];

  const getRandomEmail = () => dummyEmails[Math.floor(Math.random() * dummyEmails.length)];

  const generateDummyLogs = (date: string, tankId: string) => {
    const logs = [];

    // Generate data for the full 24 hours
    for (let i = 0; i <= 23; i++) {
      const hour = i.toString().padStart(2, '0');

      // Tank Level Log
      logs.push({
        uuid: `dummy-level-${date}-${hour}`,
        device_id: tankId,
        device_type: "Tank",
        current_level: Math.floor(Math.random() * (90 - 40) + 40), // Random level between 40 and 90
        last_updated: `${date}T${hour}:00:00`,
        updated_by: getRandomEmail()
      });

      // Pump Status Log (randomly ON/OFF)
      if (Math.random() > 0.5) {
        logs.push({
          uuid: `dummy-pump-${date}-${hour}`,
          device_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          device_type: "Pump",
          status: Math.random() > 0.5 ? "ON" : "OFF",
          last_updated: `${date}T${hour}:30:00`,
          updated_by: getRandomEmail()
        });
      }

      // Valve Status Log (randomly ON/OFF)
      if (Math.random() > 0.5) {
        logs.push({
          uuid: `dummy-valve-${date}-${hour}`,
          device_id: "b2c3d4e5-f678-9012-3456-7890abcdef12",
          device_type: "Valve",
          status: Math.random() > 0.5 ? "ON" : "OFF",
          last_updated: `${date}T${hour}:15:00`,
          updated_by: getRandomEmail()
        });
      }

      // Sump Level Log
      logs.push({
        uuid: `dummy-sump-${date}-${hour}`,
        device_id: "c3d4e5f6-7890-1234-5678-90abcdef1234",
        device_type: "Sump",
        current_level: Math.floor(Math.random() * (60 - 20) + 20), // Random level between 20 and 60
        last_updated: `${date}T${hour}:45:00`,
        updated_by: getRandomEmail()
      });
    }
    return logs;
  };

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

      // Check if date is within the dummy data range (Nov 5 - Nov 21, 2025)
      // AND exclude Nov 14
      const checkDate = new Date(params.date);
      const startDate = new Date('2025-11-05');
      const endDate = new Date('2025-11-21');
      const excludeDate = new Date('2025-11-14');

      // Normalize times to compare dates only
      checkDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      excludeDate.setHours(0, 0, 0, 0);

      if (checkDate >= startDate && checkDate <= endDate && checkDate.getTime() !== excludeDate.getTime()) {
        console.log("Generating dummy data for:", params.date);
        const dummyLogs = generateDummyLogs(params.date, params.tank_id);
        connectedLogs.push(...dummyLogs);
      }

      // Remove duplicates based on ID if necessary (optional but good practice)
      // Remove duplicates based on UUID or create a composite key for uniqueness
      const uniqueLogs = Array.from(new Map(connectedLogs.map((item: any) => {
        const key = item.uuid || item.id || `${item.device_id}-${item.last_updated}-${item.status}-${item.current_level}`;
        return [key, item];
      })).values());

      // Sort logs by date (newest first)
      uniqueLogs.sort((a: any, b: any) => {
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      });

      console.log("Extracted unique logs:", JSON.stringify(uniqueLogs, null, 2));

      const transformedReports: Report[] = uniqueLogs.map((log: any) => ({
        id: log.device_id || log.id || log.uuid || "Unknown",
        deviceType: log.device_type || "Unknown",
        status: log.status !== undefined ? log.status : null,
        level: log.current_level ? `${log.current_level}%` : (log.level !== undefined ? log.level : null),
        lastUpdated: log.last_updated ? new Date(log.last_updated).toLocaleString() : "Unknown",
        timestamp: log.last_updated ? new Date(log.last_updated).getTime() : 0,
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
      if (report.timestamp && (report.level || report.status !== null)) {
        const date = new Date(report.timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
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

  const chartConfig = {
    tank: { label: "Tank Level", color: "hsl(var(--aqua))" },
    sump: { label: "Sump Level", color: "hsl(220 70% 50%)" },
  };

  const calculateDeviceTimeline = (deviceType: string) => {
    const deviceLogs = reports
      .filter(r => r.deviceType.toLowerCase() === deviceType.toLowerCase())
      .sort((a, b) => a.timestamp - b.timestamp);

    if (deviceLogs.length === 0) return [];

    const segments = [];
    const startOfDay = new Date(selectedDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate).setHours(23, 59, 59, 999);
    const totalDuration = endOfDay - startOfDay;

    // Initial segment (from start of day to first log) - Unknown/Disconnected
    if (deviceLogs[0].timestamp > startOfDay) {
      const duration = deviceLogs[0].timestamp - startOfDay;
      segments.push({
        width: (duration / totalDuration) * 100,
        color: "bg-muted-foreground/30", // Unknown
        status: "Unknown"
      });
    }

    // Segments between logs
    for (let i = 0; i < deviceLogs.length; i++) {
      const currentLog = deviceLogs[i];
      const nextLog = deviceLogs[i + 1];
      const endTime = nextLog ? nextLog.timestamp : endOfDay;

      const duration = endTime - currentLog.timestamp;
      let color = "bg-muted-foreground/30";

      if (currentLog.status === "ON" || currentLog.status === "OPEN") {
        color = "bg-[hsl(var(--aqua))]";
      } else if (currentLog.status === "OFF" || currentLog.status === "CLOSED") {
        color = "bg-muted-foreground/60";
      } else if (currentLog.status === "DISCONNECTED") {
        color = "bg-[#C00000]";
      }

      segments.push({
        width: (duration / totalDuration) * 100,
        color: color,
        status: currentLog.status
      });
    }

    return segments;
  };

  const valveTimeline = useMemo(() => calculateDeviceTimeline("valve"), [reports, selectedDate]);
  const pumpTimeline = useMemo(() => calculateDeviceTimeline("pump"), [reports, selectedDate]);

  const filteredReports = useMemo(() => {
    if (filterDeviceType === "all") return reports;
    return reports.filter(report => report.deviceType.toLowerCase() === filterDeviceType.toLowerCase());
  }, [reports, filterDeviceType]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold tracking-tight text-soft text-center">Reports</h1>

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

      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-soft-muted">Select Tank</label>
            <Select value={selectedTank} onValueChange={setSelectedTank}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Select Tank">
                  {selectedTank
                    ? tankDevices.find(t => t.device_id === selectedTank)?.device_name || selectedTank
                    : "Select Tank"}
                </SelectValue>
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
          <div className="flex flex-col gap-1">
            <label className="text-xs text-soft-muted">Device Type</label>
            <Select value={filterDeviceType} onValueChange={setFilterDeviceType}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="tank">Tank</SelectItem>
                <SelectItem value="pump">Pump</SelectItem>
                <SelectItem value="valve">Valve</SelectItem>
                <SelectItem value="sump">Sump</SelectItem>
              </SelectContent>
            </Select>
          </div>
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


      <h2 className="text-center text-sm font-semibold text-soft">Device Data Visualization</h2>
      <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
        <CardHeader className="border-b bg-muted/30 py-3">
          <CardTitle className="text-sm font-medium">Water Level</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={chartConfig} className="w-full aspect-[16/6]">
            <AreaChart data={levelSeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillTank" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--aqua))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--aqua))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="ts"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={[0, 100]}
              />
              <Area
                dataKey="tank"
                type="monotone"
                stroke="hsl(var(--aqua))"
                fill="url(#fillTank)"
                strokeWidth={2}
              />
              <Area
                dataKey="sump"
                type="monotone"
                stroke="hsl(220 70% 50%)"
                fill="none"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
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
          <div className="relative w-full h-6 rounded-full border overflow-hidden flex" aria-label="Valve timeline state">
            {valveTimeline.length > 0 ? (
              valveTimeline.map((segment, index) => (
                <div
                  key={index}
                  className={`h-full ${segment.color}`}
                  style={{ width: `${segment.width}%` }}
                  title={`${segment.status}`}
                />
              ))
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                No Data
              </div>
            )}
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
          <div className="relative w-full h-6 rounded-full border overflow-hidden flex" aria-label="Pump timeline state">
            {pumpTimeline.length > 0 ? (
              pumpTimeline.map((segment, index) => (
                <div
                  key={index}
                  className={`h-full ${segment.color}`}
                  style={{ width: `${segment.width}%` }}
                  title={`${segment.status}`}
                />
              ))
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                No Data
              </div>
            )}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

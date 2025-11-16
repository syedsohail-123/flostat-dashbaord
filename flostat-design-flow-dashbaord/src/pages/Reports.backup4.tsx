import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Download, Calendar } from "lucide-react";
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
  updatedBy: string;
}

export default function Reports() {
  const { authToken, currentOrganization, organizations, setCurrentOrganization } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTank, setSelectedTank] = useState("tank-1");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  console.log("Reports: Component rendered with context values:", { 
    authToken: !!authToken, 
    currentOrganization,
    organizations
  });

  useEffect(() => {
    // Make sure the API service has the current auth token
    if (authToken) {
      apiService.setAuthToken(authToken);
    }
    fetchReports();
  }, [selectedTank, selectedDate, currentOrganization]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      console.log("Reports: Fetching reports with context:", { 
        authToken, 
        currentOrganization,
        selectedDate,
        selectedTank
      });
      
      // Log more details about the auth state
      console.log("Reports: Auth token exists:", !!authToken);
      console.log("Reports: Current organization exists:", !!currentOrganization);
      
      if (authToken && currentOrganization) {
        console.log("Reports: Both auth token and organization are present, proceeding with real fetch");
        
        // Make sure the API service has the current auth token
        apiService.setAuthToken(authToken);
        
        const params = {
          org_id: currentOrganization.org_id, // Use actual organization ID
          date: selectedDate || new Date().toISOString().split('T')[0], // Today's date if not selected
          tank_id: selectedTank
        };
        
        console.log("Reports: Fetching with params:", params);
        
        const response = await apiService.getTankRelatedReport(params);
        
        console.log("Reports: API response:", response);
        
        // Check if response has the expected structure
        if (!response || !response.connectedLogs) {
          throw new Error("Invalid response structure from server");
        }
        
        // Transform the response data to match our Report interface
        const transformedReports: Report[] = response.connectedLogs.map((log: any) => ({
          id: log.id || log.uuid || log.device_id, // Use available ID
          deviceType: log.device_type,
          status: log.status || null,
          level: log.level || null,
          lastUpdated: log.last_updated ? new Date(log.last_updated).toLocaleString() : "Unknown",
          updatedBy: log.updated_by || "System"
        }));
        
        setReports(transformedReports);
        console.log("Reports: Successfully set real data");
      } else {
        // Show mock data if not authenticated or no organization
        console.log("Reports: Missing auth token or organization, showing demo data");
        console.log("Reports: Auth token missing:", !authToken);
        console.log("Reports: Organization missing:", !currentOrganization);
        
        if (!authToken) {
          toast.info("Please log in to see real-time reports from DynamoDB.");
        } else if (!currentOrganization) {
          if (organizations && organizations.length === 0) {
            toast.info("You are not part of any organization. Please contact your administrator to be added to an organization.");
          } else {
            toast.info("Please select an organization to see real-time reports.");
          }
        } else {
          toast.info("Showing demo data. Log in and select an organization to see real reports.");
        }
        
        const mockReports: Report[] = [
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
        setReports(mockReports);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
      const errorMessage = (error as Error).message;
      
      // Handle authentication errors specifically
      if (errorMessage.includes("Authentication required")) {
        toast.error("Authentication required", {
          description: "Please log in to view real-time reports. Currently showing demo data.",
        });
      } else if (errorMessage.includes("User does not exit in this org")) {
        toast.error("Organization access error", {
          description: "You don't have access to this organization. Please contact your administrator.",
        });
      } else {
        toast.error("Failed to fetch reports", {
          description: errorMessage,
        });
      }
      
      // Fallback to mock data in case of error
      console.log("Reports: Error occurred, showing demo data as fallback");
      const mockReports: Report[] = [
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
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    // In a real implementation, this would fetch data based on selected tank and date
    toast.info(`Fetching data for ${selectedTank} on ${selectedDate || 'today'}`);
    await fetchReports();
  };

  const handleDownloadPDF = async () => {
    // In a real implementation, this would download a PDF report
    toast.info("Download PDF functionality would be implemented here");
  };

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

  const chartConfig = {
    tank1: { label: "Tank 1", color: "hsl(192 100% 42%)" },
    tank2: { label: "Tank 2", color: "hsl(220 70% 62%)" },
    tank3: { label: "Tank 3", color: "hsl(142 65% 40%)" },
  };

  const filteredReports = reports; // simple pass-through to match screenshot layout

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--aqua))] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-soft text-center">Reports</h1>
      
      {/* Organization Selector */}
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

      {/* Controls Row */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-soft-muted">Select Tank</label>
            <Select value={selectedTank} onValueChange={setSelectedTank}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Select Tank" />
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
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 w-[140px]"
              />
            </div>
          </div>
          <Button 
            className="h-9 px-3 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm" 
            onClick={handleFetchData}
            disabled={!authToken || !currentOrganization}
          >
            Fetch Data
          </Button>
          <Button 
            className="h-9 px-3 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white shadow-soft-sm" 
            onClick={fetchReports}
            disabled={loading || !authToken || !currentOrganization}
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
        <Button className="h-9 gap-2 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Reports Table */}
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
            {filteredReports.map((report, index) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Visualization */}
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
              <YAxis width={28} tickLine={false} axisLine={false} domain={[50, 90]} />
              <Area dataKey="tank2" stroke="var(--color-tank2)" fill="url(#tank2Fill)" type="monotone" strokeWidth={2} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
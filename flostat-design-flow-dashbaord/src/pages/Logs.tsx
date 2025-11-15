import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Calendar, Filter } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const logLevelColors = {
  info: "bg-aqua/10 text-aqua border-aqua/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-success/10 text-success border-success/20",
};

interface Log {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  device: string;
  event: string;
  user: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // const response = await apiService.getLogs();
      // For now, we'll use mock data
      const mockLogs: Log[] = [
        { id: "LOG-2847", timestamp: "2024-01-15 14:23:45", level: "info", device: "Pump A1", event: "Device started successfully", user: "John Martinez" },
        { id: "LOG-2846", timestamp: "2024-01-15 14:20:12", level: "success", device: "Valve V-03", event: "Calibration completed", user: "Sarah Chen" },
        { id: "LOG-2845", timestamp: "2024-01-15 14:15:33", level: "warning", device: "Tank T1", event: "Low level warning triggered", user: "System" },
        { id: "LOG-2844", timestamp: "2024-01-15 14:10:55", level: "error", device: "Pump B2", event: "Connection timeout - device offline", user: "System" },
        { id: "LOG-2843", timestamp: "2024-01-15 14:05:21", level: "info", device: "Sensor FS-01", event: "Data sync completed", user: "System" },
        { id: "LOG-2842", timestamp: "2024-01-15 14:00:07", level: "info", device: "Valve V-05", event: "Position adjusted to 75%", user: "Michael Roberts" },
        { id: "LOG-2841", timestamp: "2024-01-15 13:55:42", level: "warning", device: "Tank T2", event: "Pressure threshold exceeded", user: "System" },
        { id: "LOG-2840", timestamp: "2024-01-15 13:50:18", level: "success", device: "Pump C1", event: "Maintenance check passed", user: "Emily Davis" },
      ];
      setLogs(mockLogs);
    } catch (error) {
      toast.error("Failed to fetch logs");
      console.error("Fetch logs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    // In a real implementation, this would call the backend API to export logs
    toast.info("Export logs functionality would be implemented here");
  };

  const filteredLogs = logs.filter(log => 
    log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--aqua))] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor and review system events</p>
        </div>
        <Button variant="aqua" className="gap-2" onClick={handleExportLogs}>
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-elevation-2">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Log ID</TableHead>
              <TableHead className="font-semibold">Timestamp</TableHead>
              <TableHead className="font-semibold">Level</TableHead>
              <TableHead className="font-semibold">Device</TableHead>
              <TableHead className="font-semibold">Event</TableHead>
              <TableHead className="font-semibold">User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{log.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={logLevelColors[log.level]}>
                    {log.level.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium">
                    {log.device}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{log.event}</TableCell>
                <TableCell className="text-muted-foreground">{log.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
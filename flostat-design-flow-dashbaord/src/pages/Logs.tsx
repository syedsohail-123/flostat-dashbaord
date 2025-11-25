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
import { useDispatch } from "react-redux";
import { logsOrgTopics } from "@/lib/operations/orgApis";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLogs } from "@/slice/orgSlice";
import LogsExportDropdown from "@/components/logs/LogsExportDropdown";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const devicesObject = useSelector((state: RootState) => state.device.devicesObject);
  const { org_id, logs } = useSelector((state: RootState) => state.org);
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = {
        org_id
      }
      const result = await logsOrgTopics(data, token)

      console.log("Result log: ", logs, result);
      if (result) {
        dispatch(setLogs(result));
      }
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
    log.device_type?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    log.updated_by?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    log.device_id?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--aqua))] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">
            View and analyze system logs and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LogsExportDropdown data={filteredLogs} />
          <Button onClick={handleExportLogs} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
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
      </div >

  <div className="rounded-lg border bg-card shadow-elevation-2">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="font-semibold">Device</TableHead>
          <TableHead className="font-semibold">Log ID</TableHead>
          <TableHead className="font-semibold">Timestamp</TableHead>
          <TableHead className="font-semibold">Level</TableHead>
          <TableHead className="font-semibold">Event</TableHead>
          <TableHead className="font-semibold">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredLogs.map((log) => (
          <TableRow key={log.uuid || log.id || `log-${Math.random()}`} className="hover:bg-muted/30">
            <TableCell>
              <span className="rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium">
                {devicesObject[log.device_id] || log.device_id}
              </span>
            </TableCell>
            <TableCell className="font-mono text-sm">{log.uuid}</TableCell>
            <TableCell className="text-sm text-muted-foreground font-mono">
              {log.last_updated}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={logLevelColors[log.status]}>
                {log.status?.toUpperCase()}
              </Badge>
            </TableCell>

            <TableCell className="font-medium">{log.event || "Event"}</TableCell>
            <TableCell className="text-muted-foreground">{log.updated_by}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
    </div >
  );
}
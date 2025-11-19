import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Activity, Droplets, Gauge, ThermometerSun, Power, AlertTriangle, Settings, Waves, Container } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { BlockSelector } from "@/components/BlockSelector";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const tanks = [
  { id: 1, name: "Tank 4", level: 1, status: "error" as const, position: { top: 20, left: 8 } },
  { id: 2, name: "Tank Staff gas", level: 5, status: "error" as const, position: { top: 20, left: 16 } },
  { id: 3, name: "Tank AHub", level: 23, status: "error" as const, position: { top: 20, left: 24 } },
  { id: 4, name: "Tank 4", level: 45, status: "active" as const, position: { top: 20, left: 32 } },
  { id: 5, name: "Tank 5", level: 56, status: "active" as const, position: { top: 20, left: 40 } },
  { id: 6, name: "Tank 6", level: 67, status: "active" as const, position: { top: 20, left: 48 } },
  { id: 7, name: "Tank 1", level: 78, status: "active" as const, position: { top: 20, left: 56 } },
  { id: 8, name: "Tank 3", level: 89, status: "error" as const, position: { top: 20, left: 64 } },
  { id: 9, name: "Tank 2", level: 34, status: "active" as const, position: { top: 20, left: 72 } },
  { id: 10, name: "Tank 10", level: 100, status: "active" as const, position: { top: 20, left: 80 } },
  { id: 11, name: "device 7", level: 77, status: "active" as const, position: { top: 20, left: 88 } },
  { id: 12, name: "Tank 17", level: 46, status: "error" as const, position: { top: 20, left: 96 } },
  { id: 13, name: "Tank 9", level: 73, status: "active" as const, position: { top: 20, left: 104 } },
];

const pumps = [
  { id: 1, name: "Pump 1", rpm: 0, status: "inactive" as const, position: { top: 55, left: 30 } },
  { id: 2, name: "Pump 4", rpm: 0, status: "inactive" as const, position: { top: 55, left: 45 } },
  { id: 3, name: "Pump 3", rpm: 0, status: "active" as const, position: { top: 55, left: 60 } },
  { id: 4, name: "Pump 5", rpm: 0, status: "error" as const, position: { top: 55, left: 75 } },
];

const motors = [
  { id: 1, name: "motor 10PP", status: "active" as const, position: { top: 40, left: 30 } },
  { id: 2, name: "motor DOWN", status: "active" as const, position: { top: 40, left: 45 } },
  { id: 3, name: "motor DOWN", status: "active" as const, position: { top: 40, left: 60 } },
  { id: 4, name: "motor X10SS", status: "error" as const, position: { top: 40, left: 75 } },
];

const sumps = [
  { id: 1, name: "sump 1", level: 48, position: { top: 68, left: 38 } },
  { id: 2, name: "sump 3", level: 60, position: { top: 68, left: 65 } },
];

const initialDevices = [
  { id: 1, name: "Valve 3", type: "valve", status: "active" as const, value: 100, unit: "%", isOn: true, location: "Building A - Floor 1", block: "Block A" },
  { id: 2, name: "Valve 1", type: "valve", status: "active" as const, value: 100, unit: "%", isOn: true, location: "Building A - Floor 2", block: "Block A" },
  { id: 3, name: "Valve 4", type: "valve", status: "active" as const, value: 100, unit: "%", isOn: true, location: "Building B - Ground", block: "Block B" },
  { id: 4, name: "Valve 2", type: "valve", status: "inactive" as const, value: 0, unit: "%", isOn: false, location: "Building B - Floor 1", block: "Block B" },
  { id: 5, name: "Pump 2", type: "pump", status: "active" as const, value: 2900, unit: "RPM", isOn: true, location: "Building C - Floor 1", block: "Block C" },
  { id: 6, name: "Pump 1", type: "pump", status: "inactive" as const, value: 0, unit: "RPM", isOn: false, location: "Building C - Ground", block: "Block C" },
  { id: 7, name: "Pump AHub", type: "pump", status: "active" as const, value: 3100, unit: "RPM", isOn: true, location: "Building D - Floor 1", block: "Block D" },
  { id: 8, name: "Pump 3", type: "pump", status: "active" as const, value: 2850, unit: "RPM", isOn: true, location: "Building D - Floor 2", block: "Block D" },
  { id: 9, name: "Tank 4", type: "tank", status: "inactive" as const, value: 1, unit: "%", isOn: true, location: "Storage A", block: "Block A" },
  { id: 10, name: "Tank Staff quarters", type: "tank", status: "warning" as const, value: 4, unit: "%", isOn: true, location: "Storage B", block: "Block A" },
  { id: 11, name: "Tank AHub", type: "tank", status: "warning" as const, value: 23, unit: "%", isOn: true, location: "Storage C", block: "Block D" },
  { id: 12, name: "Tank 4", type: "tank", status: "active" as const, value: 100, unit: "%", isOn: true, location: "Storage D", block: "Block D" },
];

export default function SCADA() {
  const [devices, setDevices] = useState(initialDevices);
  const [selectedDevice, setSelectedDevice] = useState<typeof initialDevices[0] | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  // SCADA operating mode: 'auto' disables manual device interaction; 'manual' enables it.
  const [scadaMode, setScadaMode] = useState<'auto' | 'manual'>("auto");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSCADAData();
  }, []);

  const fetchSCADAData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // const response = await apiService.getSCADAData();
      // For now, we'll use mock data
      setDevices(initialDevices);
    } catch (error) {
      toast.error("Failed to fetch SCADA data");
      console.error("Fetch SCADA data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePower = async (id: number) => {
    try {
      setDevices(prev => prev.map(d => {
        if (d.id === id && (d.type === 'pump' || d.type === 'valve')) {
          const isOn = !d.isOn;
          return { ...d, isOn, status: isOn ? 'active' : 'inactive', value: d.type === 'pump' ? (isOn ? d.value || 3000 : 0) : d.value };
        }
        return d;
      }));
      
      // In a real implementation, this would call the backend API to update the device state
      // await apiService.updateDeviceState(id, !devices.find(d => d.id === id)?.isOn);
      toast.success("Device state updated successfully");
    } catch (error) {
      toast.error("Failed to update device state");
      console.error("Update device state error:", error);
      // Revert the state change if the API call fails
      setDevices(prev => prev.map(d => {
        if (d.id === id && (d.type === 'pump' || d.type === 'valve')) {
          const isOn = !d.isOn;
          return { ...d, isOn, status: isOn ? 'active' : 'inactive', value: d.type === 'pump' ? (isOn ? d.value || 3000 : 0) : d.value };
        }
        return d;
      }));
    }
  };

  const handleModeChange = async (mode: 'auto' | 'manual') => {
    try {
      setScadaMode(mode);
      // In a real implementation, this would call the backend API to update the SCADA mode
      // await apiService.updateSCADAMode(mode);
      toast.success(`SCADA mode changed to ${mode}`);
    } catch (error) {
      toast.error("Failed to change SCADA mode");
      console.error("Update SCADA mode error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--aqua))] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SCADA Control</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring and control interface</p>
        </div>
        <div className="flex gap-3 items-center">
          <BlockSelector
            selectedBlocks={selectedBlocks}
            onBlocksChange={setSelectedBlocks}
            label="Block"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Mode:</label>
            <ToggleGroup
              type="single"
              value={scadaMode}
              onValueChange={(val) => val && handleModeChange(val as 'auto' | 'manual')}
              className="bg-muted/40 rounded-md p-0.5 border"
            >
              <ToggleGroupItem
                value="auto"
                className="data-[state=on]:bg-[hsl(var(--aqua))] data-[state=on]:text-white text-xs h-8 px-3"
              >Auto</ToggleGroupItem>
              <ToggleGroupItem
                value="manual"
                className="data-[state=on]:bg-[hsl(var(--aqua))] data-[state=on]:text-white text-xs h-8 px-3"
              >Manual</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main SCADA Visualization */}
        <Card className="shadow-elevation-2">
          <CardContent className="p-0">
            <div className="relative h-[600px] bg-background border-2 border-[hsl(var(--aqua))] rounded-lg overflow-auto">
              <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
                {/* Connection Lines from Tanks to Motors */}
                <g className="connections" stroke="hsl(var(--aqua))" strokeWidth="2" fill="none">
                  {/* Tank to Motor connections */}
                  <line x1="100" y1="180" x2="360" y2="260" opacity="0.6" />
                  <line x1="200" y1="180" x2="360" y2="260" opacity="0.6" />
                  <line x1="300" y1="180" x2="360" y2="260" opacity="0.6" />
                  <line x1="400" y1="180" x2="360" y2="260" />
                  <line x1="500" y1="180" x2="540" y2="260" />
                  <line x1="600" y1="180" x2="540" y2="260" opacity="0.3" />
                  <line x1="700" y1="180" x2="540" y2="260" opacity="0.3" />
                  <line x1="700" y1="180" x2="720" y2="260" />
                  <line x1="800" y1="180" x2="720" y2="260" />
                  <line x1="900" y1="180" x2="720" y2="260" opacity="0.3" />
                  <line x1="900" y1="180" x2="900" y2="260" />
                  <line x1="1000" y1="180" x2="900" y2="260" opacity="0.3" />
                  <line x1="1100" y1="180" x2="900" y2="260" />
                  
                  {/* Motor to Pump connections */}
                  <line x1="360" y1="290" x2="360" y2="350" />
                  <line x1="540" y1="290" x2="540" y2="350" />
                  <line x1="720" y1="290" x2="720" y2="350" />
                  <line x1="900" y1="290" x2="900" y2="350" />
                  
                  {/* Pump to Sump connections */}
                  <line x1="360" y1="380" x2="460" y2="460" />
                  <line x1="540" y1="380" x2="460" y2="460" opacity="0.3" />
                  <line x1="720" y1="380" x2="780" y2="460" />
                  <line x1="900" y1="380" x2="780" y2="460" opacity="0.3" />
                </g>

                {/* Tanks (Top Row) */}
                {tanks.map((tank, idx) => (
                  <g key={tank.id} transform={`translate(${80 + idx * 100}, 120)`}>
                    {/* Tank body */}
                    <rect
                      x="-30"
                      y="0"
                      width="60"
                      height="80"
                      rx="8"
                      className={`cursor-pointer transition-all ${
                        tank.status === 'error' ? 'fill-destructive/80' : 'fill-[hsl(var(--aqua))]/80'
                      }`}
                      stroke={tank.status === 'error' ? 'hsl(var(--destructive))' : 'hsl(var(--aqua))'}
                      strokeWidth="2"
                    />
                    {/* Fill level */}
                    <rect
                      x="-25"
                      y={75 - (tank.level * 0.65)}
                      width="50"
                      height={tank.level * 0.65}
                      className={tank.status === 'error' ? 'fill-destructive' : 'fill-[hsl(var(--aqua))]'}
                      opacity="0.9"
                    />
                    {/* Tank name */}
                    <text x="0" y="95" textAnchor="middle" className="fill-foreground text-[10px] font-medium">
                      {tank.name}
                    </text>
                    {/* Level percentage */}
                    <text x="0" y="107" textAnchor="middle" className="fill-foreground text-[9px]">
                      ({tank.level}%)
                    </text>
                  </g>
                ))}

                {/* Motors (Middle Row) */}
                {motors.map((motor, idx) => (
                  <g key={motor.id} transform={`translate(${340 + idx * 180}, 260)`}>
                    <rect
                      x="-40"
                      y="0"
                      width="80"
                      height="30"
                      rx="4"
                      className={`cursor-pointer ${
                        motor.status === 'error' ? 'fill-destructive/80' : 'fill-success/80'
                      }`}
                      stroke={motor.status === 'error' ? 'hsl(var(--destructive))' : 'hsl(var(--success))'}
                      strokeWidth="2"
                    />
                    <text x="0" y="20" textAnchor="middle" className="fill-white text-[9px] font-medium">
                      {motor.name}
                    </text>
                  </g>
                ))}

                {/* Pumps (Below Motors) */}
                {pumps.map((pump, idx) => (
                  <g key={pump.id} transform={`translate(${340 + idx * 180}, 350)`}>
                    <circle
                      cx="0"
                      cy="15"
                      r="25"
                      className={`cursor-pointer ${
                        pump.status === 'error' ? 'fill-destructive/80' : 
                        pump.status === 'active' ? 'fill-success/80' : 'fill-muted/80'
                      }`}
                      stroke={
                        pump.status === 'error' ? 'hsl(var(--destructive))' : 
                        pump.status === 'active' ? 'hsl(var(--success))' : 'hsl(var(--muted))'
                      }
                      strokeWidth="2"
                    />
                    <text x="0" y="20" textAnchor="middle" className="fill-white text-[8px] font-semibold">
                      {pump.name}
                    </text>
                  </g>
                ))}

                {/* Sumps (Bottom Row) */}
                {sumps.map((sump, idx) => (
                  <g key={sump.id} transform={`translate(${440 + idx * 320}, 460)`}>
                    <rect
                      x="-50"
                      y="0"
                      width="100"
                      height="50"
                      rx="6"
                      className="fill-[hsl(var(--primary))]/80 cursor-pointer"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <text x="0" y="25" textAnchor="middle" className="fill-white text-[10px] font-medium">
                      {sump.name}
                    </text>
                    <text x="0" y="38" textAnchor="middle" className="fill-white text-[9px]">
                      ({sump.level}%)
                    </text>
                  </g>
                ))}
              </svg>

              {/* Info Footer */}
              <div className="absolute bottom-4 left-4">
                <Badge variant="outline" className="bg-card/90 backdrop-blur">
                  <Activity className="h-3 w-3 mr-1.5 text-success" />
                  Flow: Sump → Pump → Valve → Tank (Smart Connections)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side Panel */}
        <div className="space-y-4">
          {/* Control Details */}
          <Card className="shadow-elevation-2">
            <CardHeader className="border-b bg-muted/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Device Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {devices
                .filter((device) => {
                  // Filter devices based on selected blocks
                  if (selectedBlocks.length === 0) return true;
                  return selectedBlocks.includes(device.block || '');
                })
                .map(device => {
                const isExpanded = expanded.has(device.id);
                const interactionDisabled = scadaMode === 'auto';
                const panelId = `device-panel-${device.id}`;
                return (
                  <div
                    key={device.id}
                    className={`border rounded-md transition-all ${selectedDevice?.id === device.id ? 'ring-2 ring-[hsl(var(--aqua))] bg-muted/40' : 'bg-card'} hover:bg-muted/30 ${interactionDisabled ? 'opacity-60' : ''}`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <button
                        type="button"
                        onClick={() => { toggleExpand(device.id); setSelectedDevice(device); }}
                        className="flex items-center gap-2 text-left flex-1 min-w-0"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                      >
                        {device.type === 'pump' && <Droplets className="h-4 w-4 text-[hsl(var(--aqua))]" />}
                        {device.type === 'valve' && <Gauge className="h-4 w-4 text-success" />}
                        {device.type === 'tank' && <Container className="h-4 w-4 text-warning" />}
                        <span className="font-medium text-sm truncate">{device.name}</span>
                        <span className="text-xs text-muted-foreground">#{device.id}</span>
                      </button>
                      <div className="flex items-center gap-2 ml-2">
                        {(device.type === 'pump' || device.type === 'valve') && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{device.isOn ? (device.type === 'pump' ? 'RUN' : 'OPEN') : (device.type === 'pump' ? 'STOP' : 'CLOSE')}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Switch
                                      checked={device.isOn}
                                      onCheckedChange={() => togglePower(device.id)}
                                      disabled={interactionDisabled}
                                      aria-label={interactionDisabled ? 'Disabled in Auto mode' : (device.type === 'pump' ? (device.isOn ? 'Turn pump off' : 'Turn pump on') : (device.isOn ? 'Close valve' : 'Open valve'))}
                                    />
                                  </span>
                                </TooltipTrigger>
                                {interactionDisabled && (
                                  <TooltipContent>Manual controls disabled in Auto mode</TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 ${device.isOn ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {device.isOn ? 'ON' : 'OFF'}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => { toggleExpand(device.id); setSelectedDevice(device); }}
                          className="text-xs transition-transform"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                        >
                          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        </button>
                      </div>
                    </div>
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div id={panelId} role="region" aria-label={`${device.name} details`} className="px-3 pb-3 space-y-2 text-xs animate-slideUp">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-sm">Value:</span>
                            <span className="font-mono text-sm">{device.value}{device.unit}</span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-sm">Status:</span>
                            <StatusBadge status={device.status} />
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-sm">Location:</span>
                            <span className="text-muted-foreground">{device.location}</span>
                          </div>
                        </div>
                        {device.type === 'pump' && (
                          <div className="pt-1">
                            <div className="text-[10px] font-medium text-muted-foreground mb-1">Speed Control (simulated)</div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Slider
                                      defaultValue={[device.value ? Math.min(100, Math.round(device.value / 3200 * 100)) : 0]}
                                      max={100}
                                      step={5}
                                      className="w-[140px]"
                                      disabled={interactionDisabled}
                                      aria-label={interactionDisabled ? 'Disabled in Auto mode' : 'Adjust pump speed'}
                                    />
                                  </span>
                                </TooltipTrigger>
                                {interactionDisabled && (
                                  <TooltipContent>Manual controls disabled in Auto mode</TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="shadow-elevation-2">
            <CardHeader className="border-b bg-muted/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm p-3 border rounded-lg bg-warning/5 border-warning/20">
                <p className="font-medium text-warning">Tank Staff Low Level</p>
                <p className="text-xs text-muted-foreground mt-1">Level at 4% - 3 min ago</p>
              </div>
              <div className="text-sm p-3 border rounded-lg bg-destructive/5 border-destructive/20">
                <p className="font-medium text-destructive">Tank 4 Critical</p>
                <p className="text-xs text-muted-foreground mt-1">Level at 1% - 1 min ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
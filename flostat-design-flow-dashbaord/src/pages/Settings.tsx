import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateOrgThreshold } from '@/lib/operations/orgApis';
import { useDispatch } from 'react-redux';

export default function Settings() {
  const [sumpThreshold, setSumpThreshold] = useState<number>(50);
  const [tankRange, setTankRange] = useState<number[]>([20, 80]);
  const [savedSump, setSavedSump] = useState(false);
  const [savedTank, setSavedTank] = useState(false);
  const [loading, setLoading] = useState(true);
 const { org_id} = useSelector((state: RootState)=> state.org);
 const token = useSelector((state: RootState)=> state.auth.token);
 const dispatch = useDispatch();
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      setSumpThreshold(50);
      setTankRange([20, 80]);
    } catch (error) {
      toast.error("Failed to fetch settings");
      console.error("Fetch settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSump = async () => {
    try {

      
      console.log('Saving sump threshold', sumpThreshold);
      setSavedSump(true);
      toast.success("Sump threshold saved successfully");
      setTimeout(() => setSavedSump(false), 3000);
    } catch (error) {
      toast.error("Failed to save sump threshold");
      console.error("Save sump threshold error:", error);
    }
  };

  const saveTank = async () => {
    try {
      console.log("save tank :",tankRange)
      const data = {
      org_id,
     min_threshold:tankRange[0],
     max_threshold: tankRange[1]
      }
      const result = await updateOrgThreshold(data,token);
      if(result){
        console.log('Saving tank threshold', tankRange);
      setSavedTank(true);
      // toast.success("Tank threshold saved successfully");
      }
      // In a real implementation, this would call the backend API to save the tank range
      // await apiService.saveTankRange(tankRange);
      

    } catch (error) {
      toast.error("Failed to save tank threshold");
      console.error("Save tank threshold error:", error);
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
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold tracking-tight text-soft text-center">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
  {/* Sump Threshold */}
      <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
        <CardHeader className="border-b bg-muted/30 py-3">
          <CardTitle className="text-sm font-medium">Sump Threshold</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-soft-muted">
            <span>Value: <span className="font-semibold text-soft">{sumpThreshold}%</span></span>
          </div>
          <Slider
            value={[sumpThreshold]}
            onValueChange={(v) => setSumpThreshold(v[0])}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span><span>100%</span>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveSump}
              className="h-8 px-4 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white text-xs"
            >
              Save Sump
            </Button>
          </div>
          {savedSump && <p className="text-[10px] text-success text-right mt-1">Saved.</p>}
        </CardContent>
  </Card>

  {/* Tank Threshold */}
  <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
        <CardHeader className="border-b bg-muted/30 py-3">
          <CardTitle className="text-sm font-medium">Tank Threshold</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-soft-muted">
            <span>Range: <span className="font-semibold text-soft">{tankRange[0]}% - {tankRange[1]}%</span></span>
          </div>
          <Slider
            value={tankRange}
            onValueChange={(v) => setTankRange(v as number[])}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span><span>100%</span>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveTank}
              className="h-8 px-4 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white text-xs"
            >
              Save Tank
            </Button>
          </div>
          {savedTank && <p className="text-[10px] text-success text-right mt-1">Saved.</p>}
        </CardContent>
  </Card>
  </div>

      {/* Combined save removed; individual buttons per card */}
    </div>
  );
}
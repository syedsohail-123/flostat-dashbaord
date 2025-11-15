import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface Org {
  id: string;
  name: string;
  description?: string;
  location?: string;
}

export default function Organizations() {
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // const response = await apiService.getOrganizations();
      // For now, we'll use mock data
      const mockOrgs = [
        { id: "1", name: "Main Building", description: "Primary facility", location: "Downtown" },
        { id: "2", name: "Warehouse", description: "Storage facility", location: "Industrial Area" },
      ];
      setOrgs(mockOrgs);
    } catch (error) {
      toast.error("Failed to fetch organizations");
      console.error("Fetch organizations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async () => {
    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    try {
      const orgData = {
        name,
        description: desc,
        location: loc
      };

      // In a real implementation, this would call the backend
      // const response = await apiService.createOrganization(orgData);
      
      // For now, we'll simulate the creation
      const newOrg = {
        id: Math.random().toString(36).slice(2),
        name,
        description: desc,
        location: loc
      };
      
      setOrgs((prev) => [...prev, newOrg]);
      setName(""); 
      setDesc(""); 
      setLoc(""); 
      setOpen(false);
      toast.success("Organization created successfully");
    } catch (error) {
      toast.error("Failed to create organization");
      console.error("Create organization error:", error);
    }
  };

  const handleSelectOrg = (orgId: string) => {
    // In a real implementation, you would store the selected organization
    // For now, we'll just navigate to the dashboard
    navigate('/dashboard');
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
      <h1 className="text-2xl font-semibold tracking-tight text-center">Your Organizations</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Create Organization card */}
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-12 text-soft hover:bg-muted/50 transition-colors"
        >
          + Create Organization
        </button>

        {/* Existing orgs */}
        {orgs.map((o) => (
          <Card key={o.id} className="shadow-soft-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{o.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {o.description && <p className="text-sm text-soft-muted">{o.description}</p>}
              {o.location && <p className="text-xs text-soft-muted">Location: {o.location}</p>}
              <Button className="mt-2 w-full bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white" onClick={() => handleSelectOrg(o.id)}>Enter Dashboard</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-soft-muted">Organization Name</label>
              <Input 
                placeholder="Enter org name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-soft-muted">Description</label>
              <Textarea 
                placeholder="Enter description" 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-soft-muted">Location</label>
              <Input 
                placeholder="Enter location" 
                value={loc} 
                onChange={(e) => setLoc(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                onClick={onCreate} 
                className="bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white"
                disabled={!name.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
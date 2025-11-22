import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAllOrgsOfUser } from "@/lib/operations/userApis";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUserOrgs } from "@/slice/userSlice";
import { setOrgId } from "@/slice/orgSlice";


export default function Organizations() {
  const [open, setOpen] = useState(false);
const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const navigate = useNavigate();
  const token = useSelector((state: RootState)=>state.auth.token);
  const userOrgs = useSelector((state: RootState)=>state.user.userOrgs);
  console.log("User org in redux: ",userOrgs);
  useEffect(() => {
    if(token){
      fetchOrganizations();
    }
  }, [token]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const result = await getAllOrgsOfUser(token);
      console.log("Orgs of the user: ",result);
      if (result) {
        dispatch(setUserOrgs(result));
      }
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

      // Call the API service to create organization
      const response = await apiService.createOrganization(orgData);
      
      if (response.success) {
        toast.success("Organization created successfully");
        
        // Close the dialog
        setOpen(false);
        
        // Reset form
        setName("");
        setDesc("");
        setLoc("");
        
        // Fetch updated organizations
        await fetchOrganizations();
      } else {
        throw new Error(response.message || "Failed to create organization");
      }
    } catch (error) {
      toast.error("Failed to create organization");
      console.error("Create organization error:", error);
    }
  };

  const handleSelectOrg = (orgId: string) => {
    // In a real implementation, you would store the selected organization
    // For now, we'll just navigate to the dashboard
    // first select org_id save to redux then navigate
    console.log("Org id selected: ",orgId);
    dispatch(setOrgId(orgId));
    navigate(`/org/${orgId}`);
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
        {userOrgs?.map((o) => (
          <Card key={o.org_id} className="shadow-soft-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{o.orgName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {o.role && <p className="text-sm text-soft-muted">Your Role: {o.role}</p>}
              {o.status && <p className="text-xs text-soft-muted">Status: {o.status}</p>}
              <Button className="mt-2 w-full bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white" onClick={() => handleSelectOrg(o.org_id)}>Enter Dashboard</Button>
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
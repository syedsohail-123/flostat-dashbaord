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
import { Plus, Search, Edit, Trash2, Mail, Shield } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const roleColors = {
  Admin: "bg-destructive/10 text-destructive border-destructive/20",
  "Pending Request": "bg-warning/10 text-warning border-warning/20",
  Controller: "bg-aqua/10 text-aqua border-aqua/20",
  Guest: "bg-muted text-muted-foreground border-border",
} as const;

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Pending Request" | "Controller" | "Guest";
  lastActive: string;
  department: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // const response = await apiService.getUsers("current-org-id");
      // For now, we'll use mock data
      const mockUsers: User[] = [
        { id: "USR-001", name: "John Martinez", email: "john.m@flostat.io", role: "Admin", lastActive: "Active now", department: "Operations" },
        { id: "USR-002", name: "Sarah Chen", email: "sarah.c@flostat.io", role: "Pending Request", lastActive: "5 min ago", department: "Engineering" },
        { id: "USR-003", name: "Michael Roberts", email: "michael.r@flostat.io", role: "Controller", lastActive: "15 min ago", department: "Maintenance" },
        { id: "USR-004", name: "Emily Davis", email: "emily.d@flostat.io", role: "Controller", lastActive: "1 hour ago", department: "Operations" },
        { id: "USR-005", name: "David Kim", email: "david.k@flostat.io", role: "Admin", lastActive: "2 hours ago", department: "IT" },
        { id: "USR-006", name: "Lisa Anderson", email: "lisa.a@flostat.io", role: "Guest", lastActive: "1 day ago", department: "Visitor" },
        { id: "USR-007", name: "James Wilson", email: "james.w@flostat.io", role: "Controller", lastActive: "3 hours ago", department: "Quality Control" },
      ];
      setUsers(mockUsers);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    // In a real implementation, this would open a modal or form to add a user
    // and then call the backend API to create the user
    toast.info("Add user functionality would be implemented here");
  };

  const handleEditUser = async (userId: string) => {
    // In a real implementation, this would open a modal or form to edit a user
    // and then call the backend API to update the user
    toast.info(`Edit user ${userId} functionality would be implemented here`);
  };

  const handleDeleteUser = async (userId: string) => {
    // In a real implementation, this would call the backend API to delete the user
    toast.info(`Delete user ${userId} functionality would be implemented here`);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and their roles</p>
        </div>
        <Button variant="aqua" className="gap-2" onClick={handleAddUser}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Role summary cards moved below search */}
      <div className="grid gap-4 md:grid-cols-4">
        {['Admin','Controller','Guest','Pending Request'].map((role) => {
          const count = filteredUsers.filter((u) => u.role === role).length;
          const label = role === 'Pending Request' ? 'Pending Requests' : `${role}s`;
          const isPending = role === 'Pending Request';
          return (
            <div key={role} className={"rounded-lg border bg-card p-4 shadow-elevation-1 flex flex-col"}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <span
                  className={"inline-flex items-center justify-center rounded-full font-bold text-sm h-10 w-10 " + (isPending ? "bg-[#C00000] text-white shadow-[0_0_0_6px_rgba(192,0,0,0.25)]" : "bg-muted text-soft")}
                  aria-label={`${count} ${label}`}
                >
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card shadow-elevation-2">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">User ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Last Active</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColors[user.role]}>
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.department}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary cards moved above; removed from bottom */}
    </div>
  );
}
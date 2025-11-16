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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Mail, Shield } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const roleColors = {
  Admin: "bg-destructive/10 text-destructive border-destructive/20",
  "Pending Request": "bg-warning/10 text-warning border-warning/20",
  Controller: "bg-aqua/10 text-aqua border-aqua/20",
  Guest: "bg-muted text-muted-foreground border-border",
} as const;

// Updated User interface to match what we're storing
interface User {
  id: string;
  email: string;
  name: string;
  role?: "Admin" | "Pending Request" | "Controller" | "Guest"; // Make role optional
  lastActive?: string; // Make lastActive optional
  department?: string; // Make department optional
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditUser: (user: User) => void;
  userToEdit: User | null;
}

function EditUserModal({ open, onOpenChange, onEditUser, userToEdit }: EditUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Admin" | "Pending Request" | "Controller" | "Guest">("Pending Request");
  const [department, setDepartment] = useState("");

  // Populate form when userToEdit changes
  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setEmail(userToEdit.email || "");
      setRole(userToEdit.role || "Pending Request");
      setDepartment(userToEdit.department || "");
    } else {
      // Reset form when closing
      setName("");
      setEmail("");
      setRole("Pending Request");
      setDepartment("");
    }
  }, [userToEdit, open]);

  const handleSubmit = () => {
    if (!email.trim() || !userToEdit) {
      toast.error("Email is required");
      return;
    }

    onEditUser({
      ...userToEdit,
      name,
      email,
      role,
      department,
    });

    // Close modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to user details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Controller">Controller</SelectItem>
                <SelectItem value="Guest">Guest</SelectItem>
                <SelectItem value="Pending Request">Pending Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { users: contextUsers } = useAuth(); // Get users from AuthContext
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [contextUsers]); // Add contextUsers as dependency

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Use users from AuthContext and add default values for missing properties
      const formattedUsers: User[] = contextUsers.map(user => ({
        ...user,
        role: user.role || "Pending Request", // Default to "Pending Request"
        lastActive: user.lastActive || "Recently joined",
        department: user.department || "Not assigned"
      }));
      
      setUsers(formattedUsers);
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

  const handleEditUser = async (updatedUser: User) => {
    // In a real implementation, this would call the backend API to update the user
    // For now, we'll just update it in the local state to demonstrate the functionality
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    toast.success(`User ${updatedUser.email} updated successfully`);
  };

  const handleDeleteUser = async (userId: string) => {
    // Find the user to delete
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete) {
      // In a real implementation, this would call the backend API to delete the user
      // For now, we'll just remove it from the local state to demonstrate the functionality
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success(`User ${userToDelete.email} deleted successfully`);
    }
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
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColors[user.role || "Pending Request"]}>
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role || "Pending Request"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${user.lastActive === 'Active now' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">{user.lastActive}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setUserToEdit(user);
                        setEditUserOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit User Modal */}
      <EditUserModal
        open={editUserOpen}
        onOpenChange={setEditUserOpen}
        onEditUser={handleEditUser}
        userToEdit={userToEdit}
      />

      {/* Summary cards moved above; removed from bottom */}
    </div>
  );
}
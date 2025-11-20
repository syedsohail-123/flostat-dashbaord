import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, MessageSquare, CheckCircle, AlertCircle, Headphones, Upload } from "lucide-react";

const initialActiveTickets = [
  { id: "CST-001", type: "TECHNICAL", title: "System connectivity issue", description: "unable to connect to dashboard", createdDate: "11/15/2025", priority: "high", status: "open" },
  { id: "CST-002", type: "BILLING", title: "Invoice discrepancy", description: "billing amount incorrect for last month", createdDate: "11/14/2025", priority: "medium", status: "open" },
  { id: "CST-003", type: "TECHNICAL", title: "Data sync problem", description: "real-time data not syncing", createdDate: "11/13/2025", priority: "high", status: "open" },
  { id: "CST-004", type: "GENERAL", title: "Feature request", description: "request for new report functionality", createdDate: "11/12/2025", priority: "low", status: "open" },
  { id: "CST-005", type: "OTHER", title: "Account access issue", description: "unable to reset password", createdDate: "11/11/2025", priority: "high", status: "open" },
];

const completedTickets = [
  { id: "CST-101", type: "TECHNICAL", title: "Login timeout resolved", description: "extended session timeout", closedDate: "11/10/2025", resolvedBy: "support@flostat.io" },
  { id: "CST-102", type: "GENERAL", title: "User guide provided", description: "sent detailed documentation", closedDate: "11/09/2025", resolvedBy: "admin@flostat.io" },
  { id: "CST-103", type: "BILLING", title: "Refund processed", description: "refund of $500 issued", closedDate: "11/08/2025", resolvedBy: "billing@flostat.io" },
];

const typeColors = {
  TECHNICAL: "bg-[hsl(var(--navy))] text-white border-[hsl(var(--navy))]",
  BILLING: "bg-yellow-600 text-white border-yellow-700",
  GENERAL: "bg-sky-500 text-white border-sky-600",
  OTHER: "bg-[#4B5563] text-white border-[#4B5563]",
};

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-[#C00000]/10 text-[#C00000] border-[#C00000]/20",
};

export default function CustomerService() {
  const [activeTickets, setActiveTickets] = useState(initialActiveTickets);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<(typeof initialActiveTickets[0] | typeof completedTickets[0]) | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "support"; text: string; timestamp: string }>>([
    { sender: "support", text: "Thanks for reaching out to us, our executive will get back to you within 24 hours", timestamp: "11/11/2025, 12:31:50 PM" },
    { sender: "user", text: "hi", timestamp: "11/13/2025, 4:24:14 PM" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    attachment: null as File | null,
  });

  const filteredActiveTickets = activeTickets.filter(ticket =>
    (typeFilter === "all" || ticket.type === typeFilter) &&
    (search.trim() === "" || ticket.title.toLowerCase().includes(search.toLowerCase()) || ticket.id.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredCompletedTickets = completedTickets.filter(ticket =>
    (typeFilter === "all" || ticket.type === typeFilter) &&
    (search.trim() === "" || ticket.title.toLowerCase().includes(search.toLowerCase()) || ticket.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmitTicket = () => {
    if (!formData.type || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    const newTicket = {
      id: `CST-${String(activeTickets.length + 1).padStart(3, "0")}`,
      type: formData.type as "TECHNICAL" | "BILLING" | "GENERAL" | "OTHER",
      title: formData.description.substring(0, 30) + (formData.description.length > 30 ? "..." : ""),
      description: formData.description,
      createdDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("/"),
      priority: "high" as const,
      status: "open" as const,
    };

    setActiveTickets([newTicket, ...activeTickets]);
    setFormData({ type: "", description: "", attachment: null });
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  const handleViewTicket = (ticket: typeof initialActiveTickets[0] | typeof completedTickets[0]) => {
    setSelectedTicket(ticket);
    setIsChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      sender: "user" as const,
      text: chatInput,
      timestamp: new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/\//g, "/"),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Support</h1>
          <p className="text-muted-foreground mt-1">Manage support tickets and customer inquiries</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] text-white">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-elevation-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Active Tickets</div>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <span
              className="inline-flex items-center justify-center rounded-full font-bold text-sm h-10 w-10 bg-[#C00000] text-white shadow-[0_0_0_6px_rgba(192,0,0,0.25)]"
              aria-label={`${activeTickets.length} active tickets`}
            >
              {activeTickets.length}
            </span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-elevation-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Completed Tickets</div>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <span
              className="inline-flex items-center justify-center rounded-full font-bold text-sm h-10 w-10 bg-[hsl(var(--navy))] text-white shadow-[0_0_0_6px_rgba(20,50,100,0.25)]"
              aria-label={`${completedTickets.length} completed tickets`}
            >
              {completedTickets.length}
            </span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-elevation-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Total Inquiries</div>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <span
              className="inline-flex items-center justify-center rounded-full font-bold text-sm h-10 w-10 bg-[hsl(var(--aqua))] text-white shadow-[0_0_0_6px_rgba(0,255,255,0.25)]"
              aria-label={`${activeTickets.length + completedTickets.length} total inquiries`}
            >
              {activeTickets.length + completedTickets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-soft-sm border-border/50">
        <CardContent className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets by ID or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="BILLING">Billing</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "active"
              ? "text-[hsl(var(--aqua))] border-b-2 border-[hsl(var(--aqua))]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Tickets ({filteredActiveTickets.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "completed"
              ? "text-[hsl(var(--aqua))] border-b-2 border-[hsl(var(--aqua))]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed Tickets ({filteredCompletedTickets.length})
        </button>
      </div>

      {/* Active Tickets Table */}
      {activeTab === "active" && (
        <div className="rounded-lg border bg-card shadow-elevation-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Ticket ID</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Created Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActiveTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[ticket.type as keyof typeof typeColors]}>
                      {ticket.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ticket.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ticket.createdDate}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))] hover:text-white"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredActiveTickets.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              No active tickets found
            </div>
          )}
        </div>
      )}

      {/* Completed Tickets Table */}
      {activeTab === "completed" && (
        <div className="rounded-lg border bg-[hsl(var(--navy))]/5 shadow-elevation-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--navy))]/10">
                <TableHead className="font-semibold text-[hsl(var(--navy))]">Ticket ID</TableHead>
                <TableHead className="font-semibold text-[hsl(var(--navy))]">Type</TableHead>
                <TableHead className="font-semibold text-[hsl(var(--navy))]">Description</TableHead>
                <TableHead className="font-semibold text-[hsl(var(--navy))]">Closed Date</TableHead>
                <TableHead className="font-semibold text-[hsl(var(--navy))]">Resolved By</TableHead>
                <TableHead className="text-right font-semibold text-[hsl(var(--navy))]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompletedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-[hsl(var(--navy))]/10">
                  <TableCell className="font-mono text-sm font-medium">{ticket.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[ticket.type as keyof typeof typeColors]}>
                      {ticket.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ticket.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ticket.closedDate}</TableCell>
                  <TableCell className="text-sm text-[hsl(var(--navy))]">{ticket.resolvedBy}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[hsl(var(--navy))] hover:bg-[hsl(var(--navy))] hover:text-white"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCompletedTickets.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              No completed tickets found
            </div>
          )}
        </div>
      )}

      {/* Raise a Query Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Raise a Query</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Organization (Read-only) */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Organization</label>
              <div className="bg-muted px-3 py-2 rounded-md text-sm text-muted-foreground">
                b595d605-fe74-416c-88c0-0e88ed280e56
              </div>
            </div>

            {/* Query Type */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Query Type</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select query type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Description</label>
              <textarea
                placeholder="Enter detailed description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={4}
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="text-sm font-medium text-center block mb-2">Attachments</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{formData.attachment ? formData.attachment.name : "Choose File"}</span>
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 flex">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ type: "", description: "", attachment: null });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTicket}
              className="flex-1 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      {selectedTicket && (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="max-w-2xl max-h-96 flex flex-col">
            <DialogHeader>
              <DialogTitle>Chat - {selectedTicket.type.toLowerCase()}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">Ticket ID: {selectedTicket.id}</p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === "support" 
                        ? "bg-[hsl(var(--aqua))] text-white" 
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white"
              >
                Send
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

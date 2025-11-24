import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    MessageSquare,
    Plus,
    Send,
    Paperclip,
    X,
    FileText,
    Image as ImageIcon,
    File,
    Download,
    Clock,
    Bell,
    BellOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    getAllOrgQuery,
    updateQuery,
    deleteQuery,
    CustomerQuery,
    ChatMessage
} from "@/lib/operations/customerQuery";
import { apiClient } from "@/lib/httpClient";
import { querySupportEndpoints } from "@/lib/endPoints";
import { toast } from "sonner";
import { OrganizationSelector } from "@/components/OrganizationSelector";

const QUERY_TYPES = ["Technical", "Billing", "General", "Feature Request", "Bug Report"];
const QUERY_STATUSES = ["ACTIVE", "RESOLVED", "CLOSED"];

export default function Support() {
    const { authToken, currentOrganization, organizations, user } = useAuth();
    const [queries, setQueries] = useState<CustomerQuery[]>([]);
    const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
    const [loading, setLoading] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    // Create query form state
    const [queryType, setQueryType] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Chat state
    const [chatMessage, setChatMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authToken && currentOrganization) {
            fetchQueries();
        }
    }, [authToken, currentOrganization]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedQuery?.messages]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Esc to close dialog
            if (e.key === "Escape" && createDialogOpen) {
                setCreateDialogOpen(false);
                resetForm();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [createDialogOpen]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Extract user name from email
    const getUserName = (email: string) => {
        const name = email?.split('@')[0];
        return name?.charAt(0).toUpperCase() + name?.slice(1).replace(/[._-]/g, ' ');
    };

    // Format file size
    const formatFileSize = (url: string) => {
        // Since we don't have the actual file size from the backend,
        // we'll show a placeholder. In production, the backend should return file size.
        return "File";
    };

    // Generate timeline events from ticket data
    const getTimelineEvents = (query: CustomerQuery) => {
        const events = [];

        // Ticket created event
        events.push({
            type: 'created',
            timestamp: query.created_at,
            user: getUserName(query.created_by),
            description: 'Ticket created'
        });

        // Status change events (if we had update history)
        if (query.updated_at && query.updated_at !== query.created_at) {
            events.push({
                type: 'status_change',
                timestamp: query.updated_at,
                user: query.updated_by ? getUserName(query.updated_by) : 'System',
                description: `Status changed to ${query.status}`
            });
        }

        // Message events
        if (query.messages && query.messages.length > 0) {
            query.messages.forEach(msg => {
                events.push({
                    type: 'message',
                    timestamp: msg.timestamp,
                    user: msg.userType === 'FLOSTAT' ? 'Support Team' : getUserName(msg.user),
                    description: msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : '')
                });
            });
        }

        // Sort by timestamp
        return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    };

    const fetchQueries = async () => {
        setLoading(true);
        try {
            if (!authToken || !currentOrganization) {
                toast.error("Authentication required");
                return;
            }
            console.log("Fetch all query")
            const result = await getAllOrgQuery(
                { org_id: currentOrganization.org_id },
                authToken
            );

            if (result) {
                setQueries(result);
            }
        } catch (error) {
            console.error("Fetch tickets error:", error);
            toast.error("Failed to fetch support tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuery = async () => {
        if (!queryType || !description) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!authToken || !currentOrganization) {
            toast.error("Authentication required");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("org_id", currentOrganization.org_id);
            formData.append("queryType", queryType);
            formData.append("description", description);

            if (attachment) {
                formData.append("attachment", attachment);
            }

            const response = await apiClient({
                method: "POST",
                url: querySupportEndpoints.CREATE_QUERY_API,
                bodyData: formData,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    org_id: currentOrganization.org_id,
                },
            });

            if (response.data.success) {
                toast.success("Ticket created successfully");
                setCreateDialogOpen(false);
                resetForm();
                fetchQueries();
            } else {
                toast.error(response.data.message || "Failed to create ticket");
            }
        } catch (error: any) {
            console.error("Create ticket error:", error);
            toast.error(error?.response?.data?.message || "Failed to create ticket");
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !selectedQuery) {
            return;
        }

        if (!authToken || !currentOrganization) {
            toast.error("Authentication required");
            return;
        }

        setSendingMessage(true);
        try {
            const response = await apiClient({
                method: "POST",
                url: querySupportEndpoints.CUSTOMER_SUPPORT_CHAT_API,
                bodyData: {
                    org_id: currentOrganization.org_id,
                    query_id: selectedQuery.query_id,
                    message: chatMessage,
                    userType: (user as any)?.role === "admin" ? "FLOSTAT" : "CUSTOMER",
                },
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                // Update selected query with new messages
                setSelectedQuery({
                    ...selectedQuery,
                    messages: response.data.chats.messages || [],
                });

                // Update in queries list
                setQueries(queries.map(q =>
                    q.query_id === selectedQuery.query_id
                        ? { ...q, messages: response.data.chats.messages || [] }
                        : q
                ));

                setChatMessage("");
                toast.success("Message sent");
            } else {
                toast.error(response.data.message || "Failed to send message");
            }
        } catch (error: any) {
            console.error("Send message error:", error);
            toast.error(error?.response?.data?.message || "Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleUpdateStatus = async (queryId: string, newStatus: string) => {
        if (!authToken || !currentOrganization) {
            toast.error("Authentication required");
            return;
        }

        try {
            const result = await updateQuery(
                {
                    query_id: queryId,
                    org_id: currentOrganization.org_id,
                    status: newStatus,
                },
                authToken
            );

            if (result) {
                toast.success("Ticket status updated");
                fetchQueries();
                if (selectedQuery?.query_id === queryId) {
                    setSelectedQuery({ ...selectedQuery, status: newStatus });
                }
            }
        } catch (error) {
            console.error("Update status error:", error);
            toast.error("Failed to update ticket status");
        }
    };

    const resetForm = () => {
        setQueryType("");
        setDescription("");
        setAttachment(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }
            setAttachment(file);
        }
    };

    const getFileIcon = (filename: string) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <ImageIcon className="h-4 w-4" />;
        } else if (ext === 'pdf') {
            return <FileText className="h-4 w-4" />;
        }
        return <File className="h-4 w-4" />;
    };

    const filteredQueries = queries.filter(query => {
        const statusMatch = statusFilter === "ALL" || query.status?.toUpperCase() === statusFilter?.toUpperCase();
        const typeMatch = typeFilter === "ALL" || query.queryType === typeFilter;
        return statusMatch && typeMatch;
    });

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return "bg-[hsl(var(--aqua))]/15 text-[hsl(var(--aqua))] border-[hsl(var(--aqua))]/25";
            case "RESOLVED":
                return "bg-success/15 text-success/90 border-success/25";
            case "CLOSED":
                return "bg-destructive/15 text-destructive/90 border-destructive/25";
            default:
                return "bg-muted/15 text-muted-foreground border-muted/25";
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-soft">Customer Support</h1>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90 text-white shadow-soft-sm">
                            <Plus className="h-4 w-4" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Support Ticket</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Organization ID</label>
                                <Input
                                    value={currentOrganization?.org_id || 'No organization selected'}
                                    disabled
                                    className="bg-muted/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ticket Type *</label>
                                <Select value={queryType} onValueChange={setQueryType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {QUERY_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description *</label>
                                <Textarea
                                    placeholder="Describe your issue or question..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Attachment (Optional)</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        Choose File
                                    </label>
                                    {attachment && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                                            {getFileIcon(attachment.name)}
                                            <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                                            <button
                                                onClick={() => setAttachment(null)}
                                                className="hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCreateDialogOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateQuery}
                                disabled={uploading || !queryType || !description}
                                className="bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90"
                            >
                                {uploading ? "Creating..." : "Create Ticket"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {authToken && organizations && organizations.length > 1 && (
                <div className="p-4 rounded-md border bg-muted/30">
                    <div className="font-medium mb-2">Select Organization</div>
                    <div className="max-w-xs">
                        <OrganizationSelector />
                    </div>
                    {currentOrganization && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            Currently viewing support for: <span className="font-medium">{currentOrganization.name}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-soft-muted">Status:</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            {QUERY_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-soft-muted">Type:</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[160px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            {QUERY_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={fetchQueries}
                    disabled={loading}
                    variant="outline"
                    className="h-9 ml-auto"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket List */}
                <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
                    <CardHeader className="border-b bg-muted/30 py-3">
                        <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="border-b pb-4 animate-pulse">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-5 w-20 bg-muted rounded"></div>
                                                <div className="h-4 w-24 bg-muted rounded"></div>
                                            </div>
                                            <div className="h-4 w-full bg-muted rounded mb-2"></div>
                                            <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                                            <div className="h-3 w-32 bg-muted rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredQueries.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                                            <TableHead className="font-semibold text-soft">Ticket</TableHead>
                                            <TableHead className="font-semibold text-soft">Status</TableHead>
                                            <TableHead className="font-semibold text-soft">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQueries.map((query) => (
                                            <TableRow
                                                key={query.query_id}
                                                className={`cursor-pointer hover:bg-muted/20 transition-smooth ${selectedQuery?.query_id === query.query_id ? "bg-muted/30" : ""
                                                    }`}
                                                onClick={() => setSelectedQuery(query)}
                                            >
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {query.queryType}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                #{query.query_id.slice(0, 8)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-soft line-clamp-2">{query.description}</p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>By {getUserName(query.created_by)}</span>
                                                            <span>•</span>
                                                            <span>{new Date(query.created_at).toLocaleDateString()}</span>
                                                            {query.attachment && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Paperclip className="h-3 w-3" />
                                                                        Attachment
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(query.status)}>
                                                        {query.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Toggle: if already selected, deselect it; otherwise select it
                                                            setSelectedQuery(
                                                                selectedQuery?.query_id === query.query_id ? null : query
                                                            );
                                                        }}
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                                    <p>No support tickets found</p>
                                    <p className="text-sm">Create your first ticket to get started</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Chat Interface */}
                <Card className="rounded-lg border border-border/50 bg-card shadow-soft-lg">
                    <CardHeader className="border-b bg-muted/30 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-sm font-medium">
                                    {selectedQuery ? `Ticket #${selectedQuery.query_id.slice(0, 8)}` : "Select a Ticket"}
                                </CardTitle>
                                {selectedQuery && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowTimeline(!showTimeline)}
                                            className="h-7 text-xs"
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            {showTimeline ? "Chat" : "Timeline"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEmailNotifications(!emailNotifications)}
                                            className="h-7 text-xs"
                                            title={emailNotifications ? "Email notifications enabled" : "Email notifications disabled"}
                                        >
                                            {emailNotifications ? (
                                                <Bell className="h-3 w-3 text-[hsl(var(--aqua))]" />
                                            ) : (
                                                <BellOff className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {selectedQuery && (user as any)?.role === "admin" && (
                                <Select
                                    value={selectedQuery.status}
                                    onValueChange={(value) => handleUpdateStatus(selectedQuery.query_id, value)}
                                >
                                    <SelectTrigger className="w-[120px] h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {QUERY_STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {selectedQuery ? (
                            <div className="flex flex-col h-[600px]">
                                {/* Ticket Details */}
                                <div className="p-4 border-b bg-muted/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <Badge variant="outline" className="mb-2">{selectedQuery.queryType}</Badge>
                                            <p className="text-sm text-soft">{selectedQuery.description}</p>
                                        </div>
                                    </div>
                                    {selectedQuery.attachment && (
                                        <a
                                            href={selectedQuery.attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-[hsl(var(--aqua))] hover:underline mt-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            View Attachment
                                        </a>
                                    )}
                                </div>

                                {/* Messages or Timeline */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {showTimeline ? (
                                        // Timeline View
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-soft mb-4">Ticket Timeline</h3>
                                            {getTimelineEvents(selectedQuery).map((event, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-2 h-2 rounded-full ${event.type === 'created' ? 'bg-[hsl(var(--aqua))]' :
                                                            event.type === 'status_change' ? 'bg-success' :
                                                                'bg-muted-foreground'
                                                            }`}></div>
                                                        {idx < getTimelineEvents(selectedQuery).length - 1 && (
                                                            <div className="w-0.5 h-full bg-border mt-1"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-soft">
                                                                {event.user}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(event.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Chat View
                                        <>
                                            {selectedQuery.messages && selectedQuery.messages.length > 0 ? (
                                                selectedQuery.messages.map((msg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex ${msg.userType === "FLOSTAT" ? "justify-start" : "justify-end"}`}
                                                    >
                                                        <div
                                                            className={`max-w-[80%] rounded-lg p-3 ${msg.userType === "FLOSTAT"
                                                                ? "bg-muted/50 text-soft"
                                                                : "bg-[hsl(var(--aqua))]/15 text-soft border border-[hsl(var(--aqua))]/25"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-medium">
                                                                    {msg.userType === "FLOSTAT" ? "Support Team" : msg.user}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(msg.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm">{msg.message}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                    <p className="text-sm">No messages yet. Start the conversation!</p>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Message Input - Only show in chat view */}
                                {!showTimeline && (
                                    <div className="p-4 border-t bg-muted/10">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Type your message..."
                                                value={chatMessage}
                                                onChange={(e) => setChatMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    // Ctrl+Enter or Cmd+Enter to send
                                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                    // Regular Enter to send (if not shift)
                                                    else if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                disabled={sendingMessage}
                                            />
                                            <Button
                                                onClick={handleSendMessage}
                                                disabled={sendingMessage || !chatMessage.trim()}
                                                className="bg-[hsl(var(--aqua))] hover:bg-[hsl(var(--aqua))]/90"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                                <div className="text-center">
                                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <p>Select a ticket to view the conversation</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

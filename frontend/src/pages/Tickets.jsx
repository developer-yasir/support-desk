import React, { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TicketsSkeleton } from "@/components/ui/page-skeletons";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bookmark,
  Star,
  User,
  GitBranch,
  ChevronDown,
  MessageSquareText,
  Activity,
  Clock3,
  PanelRight,
  Columns3,
  ChevronUp,
  Reply,
  Copy,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { STATUSES, PRIORITIES } from "../data/mockData";
import TicketFiltersSidebar from "../components/TicketFiltersSidebar";
import SavedViewsPanel from "../components/tickets/SavedViewsPanel";
import BulkActionsBar from "../components/tickets/BulkActionsBar";
import { exportTicketsToCsv } from "../utils/exportCsv";
import { toast } from "sonner";

// Avatar colors based on name initial
const getAvatarColor = (name) => {
  const colors = [
    "bg-orange-400",
    "bg-teal-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-red-400",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const PriorityDropdown = ({ priority, ticketId, onUpdate }) => {
  const config = {
    low: { color: "bg-green-500", label: "Low" },
    medium: { color: "bg-yellow-500", label: "Medium" },
    high: { color: "bg-orange-500", label: "High" },
    urgent: { color: "bg-red-500", label: "Urgent" },
  };
  const { color, label } = config[priority] || config.low;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-accent rounded px-2 py-1 transition-colors" onClick={(e) => e.stopPropagation()}>
          <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
          <span className="text-sm">{label}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 z-50 bg-popover">
        <DropdownMenuLabel className="text-xs">Set Priority</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PRIORITIES.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(ticketId, 'priority', p.id);
            }}
            className="cursor-pointer"
          >
            <span className={`h-2.5 w-2.5 rounded-sm mr-2 ${config[p.id]?.color}`} />
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StatusDropdown = ({ status, ticketId, onUpdate }) => {
  const statusConfig = STATUSES.find((s) => s.id === status);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-sm hover:bg-accent rounded px-2 py-1 transition-colors" onClick={(e) => e.stopPropagation()}>
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{statusConfig?.label || status}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 z-50 bg-popover">
        <DropdownMenuLabel className="text-xs">Set Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(ticketId, 'status', s.id);
            }}
            className="cursor-pointer"
          >
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AgentDropdown = ({ ticketId, agentId, onUpdate, agents }) => {
  const agent = agents.find(a => a._id === agentId);
  const agentName = agent?.name || (agentId ? 'Unknown' : 'Unassigned');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent rounded px-2 py-1 transition-colors border border-transparent hover:border-border" onClick={(e) => e.stopPropagation()}>
          <User className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{agentName}</span>
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 z-50 bg-popover">
        <DropdownMenuLabel className="text-xs">Assign Agent</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(ticketId, 'assignedTo', null);
          }}
          className="cursor-pointer"
        >
          Unassigned
        </DropdownMenuItem>
        {agents.map((a) => (
          <DropdownMenuItem
            key={a._id}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(ticketId, 'assignedTo', a._id);
            }}
            className="cursor-pointer"
          >
            {a.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const formatTicketSnippet = (ticket) => {
  const latestComment = [...(ticket.comments || [])].find((comment) => !comment.isInternal);
  const raw = latestComment?.message || latestComment?.content || ticket.description || "";
  const cleaned = String(raw).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return cleaned;
};

const TicketQueueRow = ({
  ticket,
  selected,
  density,
  onSelect,
  onToggleSelect,
  onUpdate,
  agents,
  user,
}) => {
  const requesterName = ticket.createdBy?.name || "Unknown";
  const assignee = agents.find((agent) => agent._id === ticket.assignedTo?._id || agent._id === ticket.assignedTo);
  const priority = PRIORITIES.find((p) => p.id === ticket.priority);
  const status = STATUSES.find((s) => s.id === ticket.status);
  const snippet = formatTicketSnippet(ticket);
  const noteCount = Array.isArray(ticket.comments) ? ticket.comments.length : 0;
  const hasCustomerResponse = ticket.comments && ticket.comments.length > 0 && ticket.comments[0].user?._id !== user?.id;
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && !["resolved", "closed"].includes(ticket.status);
  const isCompact = density === "compact";

  return (
    <article
      className={`group relative grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b transition-all ${
        isCompact ? "px-4 md:px-5 py-3" : "px-4 md:px-6 py-4"
      } ${
        selected
          ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent ring-1 ring-inset ring-primary/20 shadow-[inset_4px_0_0_hsl(var(--primary))]"
          : "hover:bg-muted/40"
      }`}
      onClick={() => onSelect(ticket)}
    >
      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(ticket._id)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className={`h-10 w-10 rounded-full ${getAvatarColor(requesterName)} flex items-center justify-center flex-shrink-0 text-white font-semibold shadow-sm`}>
          {requesterName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/tickets/${ticket._id}`}
            className="text-[15px] font-semibold leading-snug text-foreground hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(ticket);
            }}
          >
            {ticket.subject}
          </Link>
          <span className="text-sm text-muted-foreground">#{ticket.ticketNumber}</span>
          {selected && (
            <Badge variant="outline" className="rounded-full border-primary/25 bg-primary/10 text-primary">
              Previewing
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{requesterName}</span>
          {ticket.company && <span>• {ticket.company}</span>}
          <span>• {ticket.updatedAt ? formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true }) : "—"}</span>
          <span>• {noteCount} activity</span>
          {hasCustomerResponse && <Badge variant="outline" className="h-6 rounded-full border-teal-500/30 bg-teal-500/10 text-[11px] text-teal-700 dark:text-teal-300">Customer replied</Badge>}
          {isOverdue && <Badge variant="destructive" className="h-6 rounded-full text-[11px]">Overdue</Badge>}
        </div>

        {snippet && (
          <p className="max-w-3xl truncate text-sm text-muted-foreground">
            {snippet}
          </p>
        )}
      </div>

      <div className="flex min-w-[170px] flex-col items-end gap-2 pt-1">
        <div className="flex flex-wrap justify-end gap-2">
          <PriorityDropdown priority={ticket.priority} ticketId={ticket._id} onUpdate={onUpdate} />
          <StatusDropdown status={ticket.status} ticketId={ticket._id} onUpdate={onUpdate} />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {assignee ? (
            <Badge variant="outline" className="rounded-full bg-background/80 text-[11px]">
              {assignee.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full bg-background/80 text-[11px]">Unassigned</Badge>
          )}
        </div>
      </div>
    </article>
  );
};

const DEFAULT_FILTERS = {
  searchFields: "",
  agent: "any",
  group: "any",
  priority: "any",
  created: "any",
  closedAt: "any",
  resolvedAt: "any",
  resolutionDue: "any",
  firstResponseDue: "any",
  statuses: [],
};

const TicketPreviewPanel = ({
  ticket,
  agents,
  ticketIndex,
  ticketCount,
  onPrev,
  onNext,
  onOpenFull,
  onQuickUpdate,
  compact = false,
}) => {
  if (!ticket) {
    return (
      <Card className="h-full border-dashed bg-gradient-to-b from-background to-muted/20">
        <CardContent className="flex h-full min-h-[420px] items-center justify-center text-center text-muted-foreground">
          <div className="max-w-xs space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border bg-background shadow-sm">
              <PanelRight className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Select a ticket</p>
              <p className="text-sm">
                Choose a row to see summary, actions, and recent activity without leaving the queue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = STATUSES.find((s) => s.id === ticket.status);
  const priority = PRIORITIES.find((p) => p.id === ticket.priority);
  const assignedAgent = agents.find((agent) => agent._id === ticket.assignedTo?._id || agent._id === ticket.assignedTo);
  const comments = Array.isArray(ticket.comments) ? ticket.comments : [];
  const recentComments = comments.slice(0, 3);
  const internalCount = comments.filter((comment) => comment.isInternal).length;
  const externalCount = Math.max(0, comments.length - internalCount);
  const snippet = formatTicketSnippet(ticket);
  const activityTone = comments.length > 0 ? "Warm" : "Quiet";
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Ticket link copied");
    } catch {
      toast.error("Unable to copy the link");
    }
  };

  return (
    <Card className="h-full overflow-hidden border-border/60 bg-gradient-to-b from-background via-background to-muted/20 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <CardHeader className="sticky top-0 z-10 space-y-4 border-b bg-background/95 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="max-w-[22rem] text-lg leading-tight">{ticket.subject}</CardTitle>
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                {status?.label || ticket.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              #{ticket.ticketNumber || ticket._id?.slice(-6)} • {ticket.createdBy?.name || "Unknown"} • {activityTone}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onPrev} disabled={ticketIndex <= 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onNext} disabled={ticketIndex < 0 || ticketIndex >= ticketCount - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Priority</div>
            <div className="mt-1 text-sm font-semibold">{priority?.label || ticket.priority}</div>
          </div>
          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Company</div>
            <div className="mt-1 truncate text-sm font-semibold">{ticket.company || "No company"}</div>
          </div>
          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Assignee</div>
            <div className="mt-1 truncate text-sm font-semibold">{assignedAgent?.name || "Unassigned"}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${compact ? "space-y-4 p-3 md:p-4" : "space-y-5 p-4"}`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Created
            </div>
            <p className="mt-2 text-sm font-medium">
              {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "—"}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              Activity
            </div>
            <p className="mt-2 text-sm font-medium">
              {comments.length} comment{comments.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquareText className="h-3.5 w-3.5" />
              Notes
            </div>
            <p className="mt-2 text-sm font-medium">
              {internalCount} internal, {externalCount} public
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Quick Actions</p>
              <p className="text-xs text-muted-foreground">Triage, assign, and share from the preview.</p>
            </div>
            <Badge variant="outline" className="rounded-full text-[11px]">Live</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={onOpenFull}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open full ticket
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full" onClick={() => onQuickUpdate?.(ticket._id, "status", "pending")}>
              <Reply className="mr-2 h-4 w-4" />
              Set pending
            </Button>
            <Button variant="ghost" size="sm" className="h-8 rounded-full" onClick={() => onQuickUpdate?.(ticket._id, "assignedTo", null)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Unassign
            </Button>
          </div>
          {onQuickUpdate && (
            <div className="mt-3 flex flex-wrap gap-2">
              <PriorityDropdown priority={ticket.priority} ticketId={ticket._id} onUpdate={onQuickUpdate} />
              <StatusDropdown status={ticket.status} ticketId={ticket._id} onUpdate={onQuickUpdate} />
              <AgentDropdown ticketId={ticket._id} agentId={ticket.assignedTo?._id || ticket.assignedTo} onUpdate={onQuickUpdate} agents={agents} />
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Description</p>
              <Badge variant="outline" className="rounded-full text-[11px]">{ticket.comments?.length || 0} updates</Badge>
            </div>
            <ScrollArea className="h-48 rounded-2xl border bg-muted/20 p-3">
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {ticket.description || "No description available."}
              </p>
              {snippet && (
                <div className="mt-3 rounded-xl border bg-background p-3 text-sm text-foreground">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Latest snippet</p>
                  <p className="mt-1 text-sm text-muted-foreground">{snippet}</p>
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Recent Activity</p>
                <Badge variant="outline" className="rounded-full text-[11px]">Latest {recentComments.length}</Badge>
              </div>
              {recentComments.length > 0 ? (
                <ScrollArea className="mt-3 h-56 rounded-xl">
                  <div className="space-y-3 pr-1">
                    {recentComments.map((comment, index) => {
                      const authorName = comment.user?.name || "Unknown";
                      const initials = authorName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <div key={comment._id || index} className="rounded-2xl border bg-muted/20 p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {initials || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium">{authorName}</p>
                                {comment.isInternal && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Internal
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                                {comment.message || comment.content || "No content"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No comments yet. This ticket is waiting for a response.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="flex-1" onClick={onOpenFull}>
            <Link to={`/tickets/${ticket._id}`}>Open full ticket</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Tickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get("search") || "";
  const initialTicketId = searchParams.get("ticket") || "";

  const [search, setSearch] = useState(initialSearch);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [sortBy, setSortBy] = useState("dateCreated");
  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem("ticketsLayout");
    return savedLayout === "split" ? "drawer" : savedLayout || "card";
  });
  const [density, setDensity] = useState(() => localStorage.getItem("ticketsDensity") || "comfortable");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("ticketFilters");
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 20 });
  const { user, isAgent } = useAuth();

  // Strict check for the 'agent' role to enforce isolation
  const isStrictAgent = user?.role === 'agent';
  const [activeTab, setActiveTab] = useState(isStrictAgent ? "mine" : "all");

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ticketFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("ticketsLayout", layout);
    if (layout !== "drawer") {
      setPreviewDrawerOpen(false);
    }
  }, [layout]);

  useEffect(() => {
    localStorage.setItem("ticketsDensity", density);
  }, [density]);
  const [activeViewId, setActiveViewId] = useState(null);

  const fetchData = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);

      // Determine assignedTo filter based on activeTab
      let assignedToFilter = filters.agent;
      if (activeTab === "mine") assignedToFilter = user?.id;
      if (activeTab === "unassigned") assignedToFilter = "unassigned";

      const fetchParams = {
        page: overrides.page ?? pagination.page,
        limit: overrides.limit ?? pagination.limit
      };

      if (search) fetchParams.search = search;
      if (assignedToFilter !== "any") fetchParams.assignedTo = assignedToFilter;
      if (filters.statuses.length > 0) fetchParams.status = filters.statuses[0];
      if (filters.priority !== "any") fetchParams.priority = filters.priority;

      const [ticketsData, agentsData] = await Promise.all([
        api.getTickets(fetchParams),
        api.getAgents()
      ]);

      setTickets(ticketsData.data.tickets);
      if (ticketsData.pagination) {
        setPagination(ticketsData.pagination);
      } else {
        const total = ticketsData.results ?? 0;
        const limit = fetchParams.limit || 20;
        const page = fetchParams.page || 1;
        const pages = Math.max(1, Math.ceil(total / limit));
        setPagination({ total, page, pages, limit });
      }
      setAgents(agentsData.data.users);
    } catch (error) {
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, pagination.page, pagination.limit, search, user?.id]);

  // Auto-refresh tickets list (helps pull in newly-synced inbound emails without manual refresh)
  useEffect(() => {
    const intervalSeconds = 30;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchData();
    }, intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [pagination.page, activeTab, filters, search]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchFields) count++;
    if (filters.agent !== "any") count++;
    if (filters.group !== "any") count++;
    if (filters.priority !== "any") count++;
    if (filters.created !== "any") count++;
    if (filters.closedAt !== "any") count++;
    if (filters.resolvedAt !== "any") count++;
    if (filters.resolutionDue !== "any") count++;
    if (filters.firstResponseDue !== "any") count++;
    if (filters.statuses.length > 0) count++;
    return count;
  }, [filters]);

  const filteredTickets = useMemo(() => {
    // Sorting only as server handles filtering/search mostly
    // We still keep a tiny bit of local filtering if searchFields (advanced search) is used but not sent to server
    // Actually better to simplify. 
    let currentTickets = tickets;

    // Search fields filter (local for now)
    if (filters.searchFields) {
      const searchLower = filters.searchFields.toLowerCase();
      currentTickets = currentTickets.filter(
        (t) =>
          (t.subject || "").toLowerCase().includes(searchLower) ||
          (t.description || "").toLowerCase().includes(searchLower)
      );
    }

    // Status filter (multiple)
    if (filters.statuses.length > 0) {
      currentTickets = currentTickets.filter((t) => filters.statuses.includes(t.status));
    }

    // Priority filter
    if (filters.priority !== "any") {
      currentTickets = currentTickets.filter((t) => t.priority === filters.priority);
    }

    // Agent filter
    if (filters.agent !== "any") {
      if (filters.agent === "unassigned") {
        currentTickets = currentTickets.filter((t) => !t.assignedTo);
      } else if (filters.agent === "current") {
        currentTickets = currentTickets.filter((t) => t.assignedTo?._id === user?.id);
      } else {
        currentTickets = currentTickets.filter((t) => t.assignedTo?._id === filters.agent);
      }
    }

    // Sort tickets
    return [...currentTickets].sort((a, b) => {
      switch (sortBy) {
        case "dateCreated":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "dateUpdated":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "priority":
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "status":
          const statusOrder = { open: 0, pending: 1, resolved: 2, closed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });
  }, [search, filters, user?.id, sortBy, tickets]);

  useEffect(() => {
    if (filteredTickets.length === 0) {
      setSelectedTicket(null);
      setPreviewDrawerOpen(false);
      return;
    }

    const urlSelectedTicket = initialTicketId ? filteredTickets.find((ticket) => ticket._id === initialTicketId) : null;
    if (urlSelectedTicket) {
      setSelectedTicket(urlSelectedTicket);
      return;
    }

    setSelectedTicket((prev) => {
      if (prev && filteredTickets.some((ticket) => ticket._id === prev._id)) {
        return prev;
      }
      return filteredTickets[0];
    });
  }, [filteredTickets, initialTicketId]);

  useEffect(() => {
    if (selectedTicket?._id) {
      const next = new URLSearchParams(searchParams);
      next.set("ticket", selectedTicket._id);
      if (search) {
        next.set("search", search);
      } else {
        next.delete("search");
      }
      setSearchParams(next, { replace: true });
      return;
    }

    if (searchParams.get("ticket")) {
      const next = new URLSearchParams(searchParams);
      next.delete("ticket");
      if (search) {
        next.set("search", search);
      } else {
        next.delete("search");
      }
      setSearchParams(next, { replace: true });
    }
  }, [selectedTicket?._id, search, searchParams, setSearchParams]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable;

      if (isTypingField) return;

      if (event.key === "Escape" && previewDrawerOpen) {
        setPreviewDrawerOpen(false);
        return;
      }

      if (!filteredTickets.length) return;

      const currentIndex = Math.max(
        0,
        filteredTickets.findIndex((ticket) => ticket._id === selectedTicket?._id)
      );

      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        const nextTicket = filteredTickets[Math.min(filteredTickets.length - 1, currentIndex + 1)];
        if (nextTicket) {
          setSelectedTicket(nextTicket);
          if (layout === "drawer") setPreviewDrawerOpen(true);
        }
      }

      if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        const prevTicket = filteredTickets[Math.max(0, currentIndex - 1)];
        if (prevTicket) {
          setSelectedTicket(prevTicket);
          if (layout === "drawer") setPreviewDrawerOpen(true);
        }
      }

      if (event.key === "Enter" && selectedTicket?._id) {
        event.preventDefault();
        navigate(`/tickets/${selectedTicket._id}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredTickets, layout, navigate, previewDrawerOpen, selectedTicket]);

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((t) => t._id));
    }
  };

  const toggleSelect = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setActiveViewId(null);
  };

  const handleApplyFilters = () => {
    // Filters are already applied reactively
  };

  const handleApplyView = (view) => {
    setActiveViewId(view.id);
    setFilters({
      ...DEFAULT_FILTERS,
      ...view.filters,
    });
    setShowSavedViews(false);
  };

  const handleExport = () => {
    const ticketsToExport =
      selectedTickets.length > 0
        ? filteredTickets.filter((t) => selectedTickets.includes(t._id))
        : filteredTickets;
    exportTicketsToCsv(ticketsToExport);
    toast.success(`Exported ${ticketsToExport.length} ticket(s) to CSV`);
  };

  const handleTicketSelect = useCallback((ticket) => {
    setSelectedTicket(ticket);
    if (layout === "drawer") {
      setPreviewDrawerOpen(true);
    }
  }, [layout]);

  const selectedTicketIndex = useMemo(
    () => filteredTickets.findIndex((ticket) => ticket._id === selectedTicket?._id),
    [filteredTickets, selectedTicket?._id]
  );
  const isCompact = density === "compact";
  const rowPadClass = isCompact ? "py-2.5 md:py-3" : "py-3 md:py-4";

  if (loading) {
    return <TicketsSkeleton />;
  }

  const handleBulkAction = async (action, params) => {
    const ticketIds = [...selectedTickets];
    if (ticketIds.length === 0) return;

    try {
      if (action === "delete") {
        const currentPageCount = tickets.length;
        const results = await Promise.allSettled(ticketIds.map((id) => api.deleteTicket(id)));
        const deletedIds = ticketIds.filter((_, idx) => results[idx]?.status === "fulfilled");
        const succeeded = deletedIds.length;
        const failed = results.length - succeeded;

        if (succeeded > 0) {
          setTickets((prev) => prev.filter((t) => !deletedIds.includes(t._id)));
          setPagination((prev) => {
            const newTotal = Math.max(0, (prev.total || 0) - succeeded);
            const pages = Math.max(1, Math.ceil(newTotal / (prev.limit || 20)));
            const page = Math.min(prev.page || 1, pages);
            return { ...prev, total: newTotal, pages, page };
          });
          toast.success(`Deleted ${succeeded} ticket(s)`);

          // If we deleted everything on the current page but there are still tickets overall,
          // re-fetch so the next page items fill in (otherwise UI shows "No tickets found").
          const remainingOnPage = currentPageCount - succeeded;
          if (remainingOnPage <= 0) {
            const newTotal = Math.max(0, (pagination.total || 0) - succeeded);
            if (newTotal > 0) {
              const pages = Math.max(1, Math.ceil(newTotal / (pagination.limit || 20)));
              const targetPage = Math.min(pagination.page || 1, pages);
              if (targetPage !== (pagination.page || 1)) {
                setPagination((prev) => ({ ...prev, page: targetPage }));
              }
              await fetchData({ page: targetPage });
            }
          }
        }
        if (failed > 0) {
          toast.error(`Failed to delete ${failed} ticket(s)`);
        }
      } else if (action === "changeStatus") {
        const status = params?.status;
        if (!status) return;

        const results = await Promise.allSettled(ticketIds.map((id) => api.updateTicket(id, { status })));
        const succeeded = results.filter((r) => r.status === "fulfilled");
        const failed = results.length - succeeded.length;

        if (succeeded.length > 0) {
          const byId = new Map(succeeded.map((r) => [r.value?.data?.ticket?._id, r.value?.data?.ticket]));
          setTickets((prev) => prev.map((t) => byId.get(t._id) || t));
          const label = STATUSES.find((s) => s.id === status)?.label || status;
          toast.success(`Updated ${succeeded.length} ticket(s) to "${label}"`);
        }
        if (failed > 0) toast.error(`Failed to update ${failed} ticket(s)`);
      } else if (action === "changePriority") {
        const priority = params?.priority;
        if (!priority) return;

        const results = await Promise.allSettled(ticketIds.map((id) => api.updateTicket(id, { priority })));
        const succeeded = results.filter((r) => r.status === "fulfilled");
        const failed = results.length - succeeded.length;

        if (succeeded.length > 0) {
          const byId = new Map(succeeded.map((r) => [r.value?.data?.ticket?._id, r.value?.data?.ticket]));
          setTickets((prev) => prev.map((t) => byId.get(t._id) || t));
          const label = PRIORITIES.find((p) => p.id === priority)?.label || priority;
          toast.success(`Updated ${succeeded.length} ticket(s) to "${label}"`);
        }
        if (failed > 0) toast.error(`Failed to update ${failed} ticket(s)`);
      } else if (action === "assign") {
        const agentId = params?.agentId;
        const assignedTo = agentId === "unassigned" ? null : agentId;

        const results = await Promise.allSettled(ticketIds.map((id) => api.updateTicket(id, { assignedTo })));
        const succeeded = results.filter((r) => r.status === "fulfilled");
        const failed = results.length - succeeded.length;

        if (succeeded.length > 0) {
          const byId = new Map(succeeded.map((r) => [r.value?.data?.ticket?._id, r.value?.data?.ticket]));
          setTickets((prev) => prev.map((t) => byId.get(t._id) || t));
          const name = assignedTo ? agents.find((a) => a._id === assignedTo)?.name : "Unassigned";
          toast.success(`Assigned ${succeeded.length} ticket(s) to "${name || "Unknown"}"`);
        }
        if (failed > 0) toast.error(`Failed to assign ${failed} ticket(s)`);
      } else {
        toast.info("This bulk action is not implemented yet.");
      }
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error(error.message || "Bulk action failed");
    } finally {
      setSelectedTickets([]);
    }
  };

  const handleTicketQuickUpdate = async (ticketId, field, value) => {
    try {
      const updateData = { [field]: value };

      // Call API
      const res = await api.updateTicket(ticketId, updateData);

      // Update local state
      setTickets(prev => prev.map(t =>
        t._id === ticketId ? res.data.ticket : t
      ));

      const fieldLabels = { priority: 'Priority', status: 'Status', assignedTo: 'Agent' };

      // Determine label for toast
      let valueLabel = value;
      if (field === 'assignedTo') {
        valueLabel = value ? agents.find(a => a._id === value)?.name : 'Unassigned';
      } else if (field === 'status') {
        valueLabel = STATUSES.find(s => s.id === value)?.label;
      } else if (field === 'priority') {
        valueLabel = PRIORITIES.find(p => p.id === value)?.label;
      }

      toast.success(`${fieldLabels[field] || field} updated to "${valueLabel}"`);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error("Failed to update ticket: " + error.message);
    }
  };

  const ticketListView = (
    <div className="flex-1 overflow-auto min-w-0">
      {filteredTickets.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No tickets found</p>
        </div>
      ) : layout === "table" ? (
        <div className="px-4 md:px-6 py-4">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredTickets.length > 0 && selectedTickets.length === filteredTickets.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[320px]">Ticket</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[150px]">Priority</TableHead>
                <TableHead className="hidden lg:table-cell w-[180px]">Assignee</TableHead>
                <TableHead className="hidden md:table-cell w-[160px]">Updated</TableHead>
                <TableHead className="text-right w-[110px]">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket._id}
                  className={`group cursor-pointer transition-all ${
                    selectedTicket?._id === ticket._id
                      ? "bg-primary/5 ring-1 ring-primary/30 shadow-[inset_3px_0_0_hsl(var(--primary))]"
                      : "hover:bg-accent/30"
                  }`}
                  onClick={() => handleTicketSelect(ticket)}
                >
                  <TableCell className="align-top">
                    <Checkbox
                      checked={selectedTickets.includes(ticket._id)}
                      onCheckedChange={() => toggleSelect(ticket._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-8 w-8 rounded-full ${getAvatarColor(ticket.createdBy?.name || "User")} flex items-center justify-center flex-shrink-0 text-white font-medium text-sm`}>
                        {(ticket.createdBy?.name || "User").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="font-medium leading-5 hover:underline block truncate max-w-[520px]"
                        >
                          {ticket.subject}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-2">
                          <span className="truncate max-w-[220px]">
                            {(ticket.createdBy?.name || "Unknown")}{ticket.company ? ` • ${ticket.company}` : ""}
                          </span>
                          {ticket.ticketNumber && <span>• #{ticket.ticketNumber}</span>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <StatusDropdown status={ticket.status} ticketId={ticket._id} onUpdate={handleTicketQuickUpdate} />
                  </TableCell>
                  <TableCell className="align-top">
                    <PriorityDropdown priority={ticket.priority} ticketId={ticket._id} onUpdate={handleTicketQuickUpdate} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell align-top">
                    <AgentDropdown ticketId={ticket._id} agentId={ticket.assignedTo?._id || ticket.assignedTo} onUpdate={handleTicketQuickUpdate} agents={agents} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell align-top text-muted-foreground text-sm">
                    {ticket.updatedAt ? formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true }) : "—"}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <Button asChild variant="outline" size="sm" className="h-8 px-3">
                      <Link to={`/tickets/${ticket._id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="divide-y">
          {filteredTickets.map((ticket) => (
            <TicketQueueRow
              key={ticket._id}
              ticket={ticket}
              selected={selectedTicket?._id === ticket._id}
              density={density}
              onSelect={handleTicketSelect}
              onToggleSelect={toggleSelect}
              onUpdate={handleTicketQuickUpdate}
              agents={agents}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );

  const filtersSidebar = showFilters ? (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowFilters(false)} />
      <div className="fixed right-0 top-0 h-full z-50 md:relative md:z-auto md:h-auto md:border-l md:bg-card">
        <TicketFiltersSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          onApply={() => {
            handleApplyFilters();
            if (window.innerWidth < 768) {
              setShowFilters(false);
            }
          }}
          activeFilterCount={activeFilterCount}
          onClose={() => setShowFilters(false)}
        />
      </div>
    </>
  ) : null;

  const headerBlock = (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-3 border-b gap-3 bg-muted/20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className={`grid w-full ${isStrictAgent ? 'grid-cols-1 sm:w-[100px]' : 'grid-cols-3 sm:w-[300px]'}`}>
            <TabsTrigger value="mine">Mine</TabsTrigger>
            {!isStrictAgent && <TabsTrigger value="unassigned">Unassigned</TabsTrigger>}
            {!isStrictAgent && <TabsTrigger value="all">All</TabsTrigger>}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => fetchData()} title="Refresh tickets">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button asChild size="sm">
            <Link to="/tickets/new">
              <Plus className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Ticket</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-2 md:py-3 border-b bg-muted/30 gap-2">
        <div className="flex items-center gap-3 md:gap-4">
          <Checkbox
            checked={filteredTickets.length > 0 && selectedTickets.length === filteredTickets.length}
            onCheckedChange={toggleSelectAll}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-28 sm:w-36 h-8 border-0 bg-transparent p-0 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="dateCreated">Date created</SelectItem>
                <SelectItem value="dateUpdated">Date updated</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden md:inline">Layout:</span>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger className="w-24 h-8 border-0 bg-transparent p-0 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="drawer">Drawer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDensity((prev) => (prev === "compact" ? "comfortable" : "compact"))}
            className="hidden sm:flex"
          >
            {isCompact ? "Comfortable" : "Compact"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <Pagination className="w-auto ml-2">
              <PaginationContent>
                <PaginationItem>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))} disabled={pagination.page === pagination.pages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="hidden md:flex">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>
    </>
  );

  if (layout === "drawer") {
    return (
      <div className="flex h-full -m-4 md:-m-6">
        {showSavedViews && (
          <div className="hidden md:block w-56 border-r bg-card p-4">
            <SavedViewsPanel currentFilters={filters} onApplyView={handleApplyView} activeViewId={activeViewId} />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {headerBlock}
          {selectedTickets.length > 0 && (
            <BulkActionsBar selectedCount={selectedTickets.length} onClearSelection={() => setSelectedTickets([])} onBulkAction={handleBulkAction} agents={agents} />
          )}
        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 xl:hidden" onClick={() => setShowFilters(false)} />
            <div className="fixed right-0 top-0 h-full z-50 xl:hidden bg-card">
              <TicketFiltersSidebar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                onApply={() => {
                  handleApplyFilters();
                  if (window.innerWidth < 1280) {
                    setShowFilters(false);
                  }
                }}
                activeFilterCount={activeFilterCount}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </>
        )}
        <div className="grid flex-1 min-h-0 grid-cols-1">
          <div className="min-w-0">{ticketListView}</div>
        </div>
        </div>

        <Sheet open={previewDrawerOpen} onOpenChange={setPreviewDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedTicket?.subject || "Ticket preview"}</SheetTitle>
              <SheetDescription>
                Quick context for the selected ticket. Open the full detail page for the complete conversation.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <TicketPreviewPanel
                ticket={selectedTicket}
                agents={agents}
                ticketIndex={selectedTicketIndex}
                ticketCount={filteredTickets.length}
                onPrev={() => {
                  const prevTicket = filteredTickets[Math.max(0, selectedTicketIndex - 1)];
                  if (prevTicket) handleTicketSelect(prevTicket);
                }}
                onNext={() => {
                  const nextTicket = filteredTickets[Math.min(filteredTickets.length - 1, selectedTicketIndex + 1)];
                  if (nextTicket) handleTicketSelect(nextTicket);
                }}
                onOpenFull={() => selectedTicket?._id && navigate(`/tickets/${selectedTicket._id}`)}
                onQuickUpdate={handleTicketQuickUpdate}
                compact={isCompact}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex h-full -m-4 md:-m-6">
      {showSavedViews && (
        <div className="hidden md:block w-56 border-r bg-card p-4">
          <SavedViewsPanel currentFilters={filters} onApplyView={handleApplyView} activeViewId={activeViewId} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {headerBlock}
        {selectedTickets.length > 0 && (
          <BulkActionsBar selectedCount={selectedTickets.length} onClearSelection={() => setSelectedTickets([])} onBulkAction={handleBulkAction} agents={agents} />
        )}
        <div className="flex-1 flex overflow-hidden">
          {ticketListView}
          {showFilters && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowFilters(false)} />
              <div className="fixed right-0 top-0 h-full z-50 md:relative md:z-auto md:h-auto md:border-l md:bg-card">
                <TicketFiltersSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  onClearFilters={clearFilters}
                  onApply={() => {
                    handleApplyFilters();
                    if (window.innerWidth < 768) {
                      setShowFilters(false);
                    }
                  }}
                  activeFilterCount={activeFilterCount}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { api } from "../lib/api";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Star,
  Mail,
  User,
  GitBranch,
  ChevronDown,
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

const AgentDropdown = ({ ticketId, agentId, customerName, onUpdate, agents }) => {
  const agent = agents.find(a => a._id === agentId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:bg-accent rounded px-2 py-1 transition-colors" onClick={(e) => e.stopPropagation()}>
          <User className="h-3.5 w-3.5" />
          <span className="truncate max-w-[80px]">{customerName?.slice(0, 10)}...</span>
          <span>/</span>
          <span>{agent?.name?.split(' ')[0] || (agentId ? 'Unknown' : '--')}</span>
          <ChevronDown className="h-3 w-3" />
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

export default function Tickets() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [sortBy, setSortBy] = useState("dateCreated");
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("ticketFilters");
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ticketFilters", JSON.stringify(filters));
  }, [filters]);
  const [activeViewId, setActiveViewId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsData, agentsData] = await Promise.all([
          api.getTickets(),
          api.getAgents()
        ]);

        setTickets(ticketsData.data.tickets);
        setAgents(agentsData.data.users);
      } catch (error) {
        toast.error("Failed to fetch data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    let currentTickets = tickets;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      currentTickets = currentTickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(searchLower) ||
          t._id?.toLowerCase().includes(searchLower) ||
          t.createdBy?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Search fields filter
    if (filters.searchFields) {
      const searchLower = filters.searchFields.toLowerCase();
      currentTickets = currentTickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
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

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((t) => t.id));
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
        ? filteredTickets.filter((t) => selectedTickets.includes(t.id))
        : filteredTickets;
    exportTicketsToCsv(ticketsToExport);
    toast.success(`Exported ${ticketsToExport.length} ticket(s) to CSV`);
  };

  const handleBulkAction = (action, params) => {
    console.log("Bulk action:", action, params, "on tickets:", selectedTickets);
    setSelectedTickets([]);
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

  return (
    <div className="flex h-full -m-4 md:-m-6">
      {/* Saved Views Panel - Hidden on mobile */}
      {showSavedViews && (
        <div className="hidden md:block w-56 border-r bg-card p-4">
          <SavedViewsPanel
            currentFilters={filters}
            onApplyView={handleApplyView}
            activeViewId={activeViewId}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 hidden sm:flex"
              onClick={() => setShowSavedViews(!showSavedViews)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base md:text-lg font-semibold truncate">All unresolved tickets</h1>
              <Star className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-yellow-500 hidden sm:block" />
              <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground flex-shrink-0">
                {filteredTickets.length}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="hidden lg:flex">
              Explore your plan
            </Button>
            <Button asChild size="sm">
              <Link to="/tickets/new">
                <Plus className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-2 md:py-3 border-b bg-muted/30 gap-2">
          <div className="flex items-center gap-3 md:gap-4">
            <Checkbox
              checked={
                filteredTickets.length > 0 &&
                selectedTickets.length === filteredTickets.length
              }
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
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Layout:</span>
              <Select defaultValue="card">
                <SelectTrigger className="w-20 h-8 border-0 bg-transparent p-0 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                1 - {filteredTickets.length} of {filteredTickets.length}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTickets.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTickets.length}
            onClearSelection={() => setSelectedTickets([])}
            onBulkAction={handleBulkAction}
          />
        )}

        {/* Content Area with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tickets List */}
          <div className="flex-1 overflow-auto">
            {filteredTickets.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No tickets found</p>
              </div>
            ) : (
              <div>
                {filteredTickets.map((ticket, index) => {

                  return (
                    <div
                      key={ticket._id}
                      className="flex items-start gap-2 sm:gap-4 px-4 md:px-6 py-3 md:py-4 border-b hover:bg-accent/30 transition-colors group"
                    >
                      <Checkbox
                        checked={selectedTickets.includes(ticket._id)}
                        onCheckedChange={() => toggleSelect(ticket._id)}
                        className="mt-2 sm:mt-3"
                      />

                      {/* Left border indicator - hidden on mobile */}
                      <div className="hidden sm:block w-1 h-full min-h-[60px] bg-primary/20 rounded-full" />

                      {/* Avatar */}
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${getAvatarColor(ticket.createdBy?.name || 'User')} flex items-center justify-center flex-shrink-0 text-white font-medium text-sm`}>
                        {(ticket.createdBy?.name || 'User').charAt(0).toUpperCase()}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-2 mb-1">
                          {/* Customer responded badge */}
                          {ticket.comments && ticket.comments.length > 0 && ticket.comments[0].user?._id !== user?.id && (
                            <Badge variant="outline" className="text-xs border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400">
                              Customer responded
                            </Badge>
                          )}

                          {/* Overdue Badge */}
                          {ticket.dueDate && new Date(ticket.dueDate) < new Date() && !['resolved', 'closed'].includes(ticket.status) && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}

                          {/* Response Due Badge (Computed SLA) */}
                          {(() => {
                            // Check if agent has responded (exclude system comments if possible, but for now check if ANY comment exists from non-customer)
                            // This logic assumes if ticket.comments is empty or last comment is customer, we might need to respond.
                            // Better logic: If status is Open/Pending and NO agent comments yet?

                            // Let's simplified assumption: If status is New/Open and no comments? 
                            // Or just check time since creation vs priority SLA if no comments exist.
                            const hasAgentComment = ticket.comments?.some(c => c.user?.role !== 'customer');
                            if (hasAgentComment) return null;

                            const slaHours = { urgent: 4, high: 8, medium: 24, low: 48 };
                            const hoursAllowed = slaHours[ticket.priority] || 24;
                            const dueTime = new Date(new Date(ticket.createdAt).getTime() + hoursAllowed * 60 * 60 * 1000);

                            if (new Date() > dueTime && !['resolved', 'closed'].includes(ticket.status)) {
                              return (
                                <Badge variant="outline" className="text-xs border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400">
                                  First Response Overdue
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="font-medium hover:underline block text-sm sm:text-base truncate"
                        >
                          {ticket.subject}{" "}
                          <span className="text-muted-foreground font-normal">
                            #{ticket.ticketNumber}
                          </span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                          <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:block" />
                          <span className="font-medium text-foreground truncate max-w-[100px] sm:max-w-none">{ticket.createdBy?.name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: false })} ago
                          </span>
                          <span className="hidden md:inline">•</span>
                          {ticket.dueDate && (
                            <span className="hidden md:inline">
                              Due: {formatDistanceToNow(new Date(ticket.dueDate))}
                            </span>
                          )}
                        </div>

                        {/* Mobile: Priority & Status inline */}
                        <div className="flex items-center gap-1 mt-2 sm:hidden">
                          <PriorityDropdown priority={ticket.priority} ticketId={ticket._id} onUpdate={handleTicketQuickUpdate} />
                          <StatusDropdown status={ticket.status} ticketId={ticket._id} onUpdate={handleTicketQuickUpdate} />
                        </div>
                      </div>

                      {/* Right side info - Desktop only */}
                      <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 min-w-[140px] lg:min-w-[160px]">
                        <PriorityDropdown priority={ticket.priority} ticketId={ticket._id} onUpdate={handleTicketQuickUpdate} />

                        <div className="hidden lg:block">
                          <AgentDropdown
                            ticketId={ticket._id}
                            agentId={ticket.assignedTo?._id || ticket.assignedTo}
                            customerName={ticket.createdBy?.name}
                            onUpdate={handleTicketQuickUpdate}
                            agents={agents}
                          />
                        </div>

                        <StatusDropdown status={ticket.status} ticketId={ticket._id} onUpdate={handleTicketQuickUpdate} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filters Sidebar - Slide-in on mobile, Inline on desktop */}
          {showFilters && (
            <>
              {/* Mobile overlay */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setShowFilters(false)}
              />
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

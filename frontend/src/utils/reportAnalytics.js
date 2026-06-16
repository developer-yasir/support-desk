export const EMPTY_TICKET_FILTERS = {
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

export const REPORT_COLORS = {
  primary: "hsl(var(--primary))",
  green: "#16a34a",
  red: "#dc2626",
  blue: "#2563eb",
};

export const PRIORITY_LABELS = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_COLORS = {
  urgent: REPORT_COLORS.red,
  high: "#ea580c",
  medium: "#eab308",
  low: "#22c55e",
};

const STATUS_LABELS = {
  open: "Open",
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const formatPercent = (value) => `${Math.round(Number.isFinite(value) ? value : 0)}%`;

export const isOpenTicket = (ticket) => !["resolved", "closed"].includes(ticket.status);

export const getAssigneeId = (ticket) => ticket.assignedTo?._id || ticket.assignedTo || "unassigned";

const getAssigneeName = (ticket) => ticket.assignedTo?.name || (ticket.assignedTo ? "Assigned agent" : "Unassigned");

export const getTicketChannel = (ticket) => {
  if (ticket.email?.messageId || ticket.email?.from) return "Email";
  if (ticket.source) return ticket.source;
  return "Manual";
};

const getDateKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const groupCount = (items, getKey) => {
  const counts = new Map();
  items.forEach((item) => {
    const key = getKey(item) || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].map(([name, value]) => ({ name, value }));
};

export const getCompanyOptions = (tickets, companies) => {
  const fromTickets = tickets.map((ticket) => ticket.company || ticket.companyId?.name).filter(Boolean);
  const fromCompanies = companies.map((company) => company.name).filter(Boolean);
  return [...new Set([...fromTickets, ...fromCompanies])].sort();
};

export const buildReportModel = ({ reportData, filteredTickets }) => {
  const now = new Date();
  const openTickets = filteredTickets.filter(isOpenTicket);
  const resolvedTickets = filteredTickets.filter((ticket) => ticket.status === "resolved");
  const overdueTickets = openTickets.filter((ticket) => ticket.dueDate && new Date(ticket.dueDate) < now);
  const urgentHighTickets = openTickets.filter((ticket) => ["urgent", "high"].includes(ticket.priority));
  const unassignedTickets = openTickets.filter((ticket) => !ticket.assignedTo);
  const emailTickets = filteredTickets.filter((ticket) => getTicketChannel(ticket) === "Email");
  const created = reportData.summary?.created ?? filteredTickets.length;
  const resolved = reportData.summary?.resolved ?? resolvedTickets.length;
  const resolutionRate = created ? (resolved / created) * 100 : 0;
  const slaBreachRate = openTickets.length ? (overdueTickets.length / openTickets.length) * 100 : 0;

  const createdByDate = new Map((reportData.volume || []).map((item) => [item.date, item.tickets]));
  const resolvedByDate = new Map();
  resolvedTickets.forEach((ticket) => {
    const key = getDateKey(ticket.resolvedAt || ticket.updatedAt);
    if (key) resolvedByDate.set(key, (resolvedByDate.get(key) || 0) + 1);
  });

  const volumeDates = [...new Set([...createdByDate.keys(), ...resolvedByDate.keys()])].sort();
  const volume = volumeDates.map((date) => ({
    date,
    created: createdByDate.get(date) || 0,
    resolved: resolvedByDate.get(date) || 0,
  }));

  const statusDistribution = (reportData.statusDistribution?.length
    ? reportData.statusDistribution
    : groupCount(filteredTickets, (ticket) => ticket.status)
  ).map((item) => ({
    ...item,
    name: STATUS_LABELS[item.name] || item.name,
  }));

  const priorityData = ["urgent", "high", "medium", "low"].map((priority) => {
    const priorityTickets = filteredTickets.filter((ticket) => ticket.priority === priority);
    const breached = priorityTickets.filter((ticket) => isOpenTicket(ticket) && ticket.dueDate && new Date(ticket.dueDate) < now).length;
    return {
      priority,
      name: PRIORITY_LABELS[priority],
      tickets: priorityTickets.length,
      breached,
      breachRate: priorityTickets.length ? Math.round((breached / priorityTickets.length) * 100) : 0,
    };
  });

  const companyData = groupCount(filteredTickets, (ticket) => ticket.company || ticket.companyId?.name || "Unknown")
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const agentMap = new Map();
  filteredTickets.forEach((ticket) => {
    const id = getAssigneeId(ticket);
    const entry = agentMap.get(id) || {
      id,
      name: getAssigneeName(ticket),
      total: 0,
      open: 0,
      resolved: 0,
      urgent: 0,
      overdue: 0,
    };
    entry.total += 1;
    if (isOpenTicket(ticket)) entry.open += 1;
    if (ticket.status === "resolved") entry.resolved += 1;
    if (ticket.priority === "urgent") entry.urgent += 1;
    if (ticket.dueDate && new Date(ticket.dueDate) < now && isOpenTicket(ticket)) entry.overdue += 1;
    agentMap.set(id, entry);
  });

  const agentWorkload = [...agentMap.values()]
    .map((agent) => ({ ...agent, resolutionRate: agent.total ? Math.round((agent.resolved / agent.total) * 100) : 0 }))
    .sort((a, b) => b.open - a.open || b.overdue - a.overdue);

  return {
    created,
    resolved,
    resolutionRate,
    openBacklog: openTickets.length,
    overdueTickets,
    urgentHighTickets,
    unassignedTickets,
    slaBreachRate,
    emailShare: filteredTickets.length ? (emailTickets.length / filteredTickets.length) * 100 : 0,
    volume,
    statusDistribution,
    priorityData,
    channelData: groupCount(filteredTickets, getTicketChannel),
    companyData,
    agentWorkload,
  };
};

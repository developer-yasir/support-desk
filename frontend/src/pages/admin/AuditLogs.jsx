import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  Filter,
  User,
  Ticket,
  Settings,
  Shield,
  Clock,
  Eye,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// Mock audit log data
const AUDIT_LOGS = [
  {
    id: "1",
    action: "ticket.created",
    actor: "Praveen",
    actorRole: "customer",
    target: "TKT-005",
    details: "Created ticket: 'Inventory report issue'",
    ip: "192.168.1.100",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    action: "ticket.assigned",
    actor: "Super Admin",
    actorRole: "superadmin",
    target: "TKT-005",
    details: "Assigned ticket to Sarah Wilson",
    ip: "192.168.1.1",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "3",
    action: "user.login",
    actor: "Company Manager",
    actorRole: "company_manager",
    target: "Session",
    details: "Logged in successfully",
    ip: "192.168.1.50",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "4",
    action: "ticket.status_changed",
    actor: "Sarah Wilson",
    actorRole: "agent",
    target: "TKT-003",
    details: "Changed status from 'Open' to 'Pending'",
    ip: "192.168.1.25",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "5",
    action: "settings.updated",
    actor: "Super Admin",
    actorRole: "superadmin",
    target: "SLA Policy",
    details: "Updated 'Premium Support' SLA response time to 2 hours",
    ip: "192.168.1.1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "6",
    action: "user.created",
    actor: "Super Admin",
    actorRole: "superadmin",
    target: "Mike Johnson",
    details: "Created new agent account",
    ip: "192.168.1.1",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "7",
    action: "ticket.deleted",
    actor: "Company Manager",
    actorRole: "company_manager",
    target: "TKT-001",
    details: "Deleted spam ticket",
    ip: "192.168.1.50",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "8",
    action: "user.logout",
    actor: "Sarah Wilson",
    actorRole: "agent",
    target: "Session",
    details: "Logged out",
    ip: "192.168.1.25",
    timestamp: new Date(Date.now() - 1000 * 60 * 150),
  },
  {
    id: "9",
    action: "automation.triggered",
    actor: "System",
    actorRole: "system",
    target: "Auto-Assignment Rule",
    details: "Assigned TKT-004 to Mike Johnson based on workload",
    ip: "System",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: "10",
    action: "ticket.priority_changed",
    actor: "Mike Johnson",
    actorRole: "agent",
    target: "TKT-002",
    details: "Changed priority from 'Medium' to 'High'",
    ip: "192.168.1.30",
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
  },
];

const ACTION_TYPES = [
  { id: "all", label: "All Actions" },
  { id: "ticket", label: "Ticket Actions" },
  { id: "user", label: "User Actions" },
  { id: "settings", label: "Settings Changes" },
  { id: "automation", label: "Automation Events" },
];

const getActionIcon = (action) => {
  if (action.startsWith("ticket")) return <Ticket className="h-4 w-4" />;
  if (action.startsWith("user.login")) return <LogIn className="h-4 w-4" />;
  if (action.startsWith("user.logout")) return <LogOut className="h-4 w-4" />;
  if (action.startsWith("user.created")) return <UserPlus className="h-4 w-4" />;
  if (action.startsWith("user")) return <User className="h-4 w-4" />;
  if (action.startsWith("settings")) return <Settings className="h-4 w-4" />;
  if (action.startsWith("automation")) return <RefreshCw className="h-4 w-4" />;
  return <Eye className="h-4 w-4" />;
};

const getActionColor = (action) => {
  if (action.includes("created") || action.includes("login")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (action.includes("deleted") || action.includes("logout")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  if (action.includes("updated") || action.includes("changed")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (action.includes("assigned")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

const getRoleBadge = (role) => {
  const config = {
    superadmin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    company_manager: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    agent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    customer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    system: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };
  return config[role] || config.customer;
};

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  const filteredLogs = AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action.startsWith(actionFilter);
    
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system activities and user actions
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{AUDIT_LOGS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {AUDIT_LOGS.filter(l => l.action.startsWith("ticket")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {AUDIT_LOGS.filter(l => l.action.startsWith("user")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {AUDIT_LOGS.filter(l => l.action.startsWith("automation") || l.action.startsWith("settings")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by actor, target, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                  <TableHead className="hidden md:table-cell">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      <div>{format(log.timestamp, "MMM d, HH:mm")}</div>
                      <div className="text-muted-foreground">
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="hidden sm:inline">{log.action.replace(".", " ").replace("_", " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {log.actor.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{log.actor}</div>
                          <Badge variant="outline" className={`text-[10px] ${getRoleBadge(log.actorRole)}`}>
                            {log.actorRole.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.target}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[300px] truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                      {log.ip}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

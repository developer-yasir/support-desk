import { useState } from "react";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, UserCheck, UserX, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const TEAMS = [
  { id: "1", name: "Technical Support" },
  { id: "2", name: "Billing Support" },
  { id: "3", name: "Customer Success" },
];

const INITIAL_AGENTS = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "alex.t@workdesks.com",
    teamId: "1",
    teamName: "Technical Support",
    role: "agent",
    ticketsAssigned: 12,
    ticketsResolved: 145,
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.g@workdesks.com",
    teamId: "2",
    teamName: "Billing Support",
    role: "agent",
    ticketsAssigned: 8,
    ticketsResolved: 98,
    status: "active",
    createdAt: "2024-02-15",
  },
  {
    id: "3",
    name: "James Wilson",
    email: "james.w@workdesks.com",
    teamId: "1",
    teamName: "Technical Support",
    role: "agent",
    ticketsAssigned: 15,
    ticketsResolved: 203,
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    name: "Sarah Kim",
    email: "sarah.k@workdesks.com",
    teamId: "3",
    teamName: "Customer Success",
    role: "agent",
    ticketsAssigned: 5,
    ticketsResolved: 67,
    status: "inactive",
    createdAt: "2024-03-01",
  },
];

export default function AgentManagement() {
  const { isManager, isSuperAdmin } = useAuth();
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    teamId: "",
    role: "agent",
  });

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === "all" || agent.teamId === teamFilter;
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const team = TEAMS.find((t) => t.id === formData.teamId);

    if (editingAgent) {
      setAgents(
        agents.map((a) =>
          a.id === editingAgent.id
            ? { ...a, ...formData, teamName: team?.name || "" }
            : a
        )
      );
      toast.success("Agent updated successfully");
    } else {
      const newAgent = {
        id: String(agents.length + 1),
        ...formData,
        teamName: team?.name || "",
        ticketsAssigned: 0,
        ticketsResolved: 0,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAgents([...agents, newAgent]);
      toast.success("Agent created successfully");
    }
    resetForm();
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      teamId: agent.teamId,
      role: agent.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (agentId) => {
    setAgents(agents.filter((a) => a.id !== agentId));
    toast.success("Agent removed successfully");
  };

  const handleToggleStatus = (agent) => {
    setAgents(
      agents.map((a) =>
        a.id === agent.id
          ? { ...a, status: a.status === "active" ? "inactive" : "active" }
          : a
      )
    );
    toast.success(
      `Agent ${agent.status === "active" ? "deactivated" : "activated"} successfully`
    );
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", teamId: "", role: "agent" });
    setEditingAgent(null);
    setIsDialogOpen(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isManager) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage support agents for your company
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Edit Agent" : "Add New Agent"}
              </DialogTitle>
              <DialogDescription>
                {editingAgent
                  ? "Update agent information"
                  : "Create a new support agent"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Alex Thompson"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="alex@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teamId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAMS.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="company_manager">Company Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAgent ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter((a) => a.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.reduce((sum, a) => sum + a.ticketsAssigned, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {agents.reduce((sum, a) => sum + a.ticketsResolved, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {TEAMS.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Assigned</TableHead>
                <TableHead className="text-center">Resolved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{agent.teamName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {agent.role === "company_manager" ? "Manager" : agent.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{agent.ticketsAssigned}</TableCell>
                  <TableCell className="text-center">{agent.ticketsResolved}</TableCell>
                  <TableCell>
                    <Badge
                      variant={agent.status === "active" ? "default" : "secondary"}
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(agent)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(agent)}>
                          {agent.status === "active" ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(agent.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAgents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No agents found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

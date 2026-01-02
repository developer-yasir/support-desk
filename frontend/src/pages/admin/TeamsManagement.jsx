import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

// Mock teams data
const INITIAL_TEAMS = [
  {
    id: "1",
    name: "Customer Support",
    description: "Front-line customer support team",
    manager: "Sarah Wilson",
    members: ["Sarah Wilson", "Mike Johnson", "Emily Chen"],
    ticketCount: 45,
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Technical Support",
    description: "Technical issues and escalations",
    manager: "Mike Johnson",
    members: ["Mike Johnson", "David Lee"],
    ticketCount: 28,
    color: "bg-purple-500",
  },
  {
    id: "3",
    name: "Billing",
    description: "Payment and subscription inquiries",
    manager: "Emily Chen",
    members: ["Emily Chen"],
    ticketCount: 12,
    color: "bg-green-500",
  },
  {
    id: "4",
    name: "Sales",
    description: "Pre-sales and onboarding support",
    manager: "Super Admin",
    members: ["Super Admin", "Company Manager"],
    ticketCount: 8,
    color: "bg-orange-500",
  },
];

const AGENTS = [
  { id: "1", name: "Super Admin", email: "superadmin@workdesks.com" },
  { id: "2", name: "Company Manager", email: "manager@workdesks.com" },
  { id: "3", name: "Sarah Wilson", email: "sarah@workdesks.com" },
  { id: "4", name: "Mike Johnson", email: "mike@workdesks.com" },
  { id: "5", name: "Emily Chen", email: "emily@workdesks.com" },
  { id: "6", name: "David Lee", email: "david@workdesks.com" },
];

export default function TeamsManagement() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    manager: "",
    color: "bg-blue-500",
  });

  const handleCreateTeam = () => {
    if (!newTeam.name) {
      toast.error("Please enter a team name");
      return;
    }

    const team = {
      id: String(teams.length + 1),
      ...newTeam,
      members: newTeam.manager ? [AGENTS.find(a => a.id === newTeam.manager)?.name || ""] : [],
      ticketCount: 0,
    };

    setTeams([...teams, team]);
    setNewTeam({ name: "", description: "", manager: "", color: "bg-blue-500" });
    setIsCreateDialogOpen(false);
    toast.success("Team created successfully!");
  };

  const handleDeleteTeam = (teamId) => {
    setTeams(teams.filter(t => t.id !== teamId));
    toast.success("Team deleted");
  };

  const colorOptions = [
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-orange-500", label: "Orange" },
    { value: "bg-red-500", label: "Red" },
    { value: "bg-pink-500", label: "Pink" },
    { value: "bg-teal-500", label: "Teal" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Teams & Departments</h1>
          <p className="text-muted-foreground">
            Organize agents into teams with managers and assignments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team to organize your support agents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input
                  placeholder="e.g., Technical Support"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of the team..."
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Team Manager</Label>
                <Select
                  value={newTeam.manager}
                  onValueChange={(value) => setNewTeam({ ...newTeam, manager: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {AGENTS.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Color</Label>
                <Select
                  value={newTeam.color}
                  onValueChange={(value) => setNewTeam({ ...newTeam, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded ${color.value}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{AGENTS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.reduce((sum, t) => sum + t.ticketCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${team.color}`} />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${team.color} flex items-center justify-center`}>
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover z-50">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Team
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Members
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Manager:</span>
                <span className="font-medium">{team.manager}</span>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Members ({team.members.length})</p>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map((member, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-background"
                      title={member}
                    >
                      <span className="text-xs font-medium text-primary-foreground">
                        {member.charAt(0)}
                      </span>
                    </div>
                  ))}
                  {team.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                      <span className="text-xs font-medium">+{team.members.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant="secondary">
                  {team.ticketCount} active tickets
                </Badge>
                <Button variant="outline" size="sm">
                  <Mail className="mr-1 h-3 w-3" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

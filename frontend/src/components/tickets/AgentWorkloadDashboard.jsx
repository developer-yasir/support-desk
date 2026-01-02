import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Ticket, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { AGENTS, TICKETS } from "@/data/mockData";

// Calculate workload for each agent
function calculateAgentWorkload() {
  return AGENTS.map((agent) => {
    const agentTickets = TICKETS.filter((t) => t.agentId === agent.id);
    const openTickets = agentTickets.filter((t) => t.status === "open").length;
    const pendingTickets = agentTickets.filter((t) => t.status === "pending").length;
    const resolvedTickets = agentTickets.filter((t) => t.status === "resolved").length;
    const totalActive = openTickets + pendingTickets;
    
    // Calculate SLA risk (tickets nearing deadline)
    const slaRisk = agentTickets.filter((t) => {
      const deadline = new Date(t.slaDeadline);
      const hoursRemaining = (deadline - new Date()) / (1000 * 60 * 60);
      return hoursRemaining > 0 && hoursRemaining < 4 && t.status !== "resolved" && t.status !== "closed";
    }).length;

    // Workload score (0-100)
    const maxCapacity = 15; // Assumed max tickets per agent
    const workloadScore = Math.min((totalActive / maxCapacity) * 100, 100);

    return {
      ...agent,
      openTickets,
      pendingTickets,
      resolvedTickets,
      totalActive,
      slaRisk,
      workloadScore,
      status: workloadScore > 80 ? "overloaded" : workloadScore > 50 ? "busy" : "available",
    };
  });
}

// Calculate unassigned tickets
function getUnassignedStats() {
  const unassigned = TICKETS.filter((t) => !t.agentId);
  return {
    total: unassigned.length,
    urgent: unassigned.filter((t) => t.priority === "urgent").length,
    high: unassigned.filter((t) => t.priority === "high").length,
  };
}

export default function AgentWorkloadDashboard() {
  const agentWorkload = calculateAgentWorkload();
  const unassigned = getUnassignedStats();

  const chartData = agentWorkload.map((agent) => ({
    name: agent.name.split(" ")[0],
    open: agent.openTickets,
    pending: agent.pendingTickets,
    resolved: agent.resolvedTickets,
  }));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentWorkload.reduce((sum, a) => sum + a.totalActive, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unassigned
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassigned.total}</div>
            {unassigned.urgent > 0 && (
              <p className="text-xs text-destructive">
                {unassigned.urgent} urgent need assignment
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SLA at Risk
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {agentWorkload.reduce((sum, a) => sum + a.slaRisk, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Due within 4 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Load
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                agentWorkload.reduce((sum, a) => sum + a.workloadScore, 0) /
                  agentWorkload.length
              )}%
            </div>
            <p className="text-xs text-muted-foreground">Team capacity used</p>
          </CardContent>
        </Card>
      </div>

      {/* Workload Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Distribution by Agent</CardTitle>
          <CardDescription>Open, pending, and resolved tickets per agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="open" stackId="a" fill="hsl(var(--primary))" name="Open" />
                <Bar dataKey="pending" stackId="a" fill="hsl(var(--muted-foreground))" name="Pending" />
                <Bar dataKey="resolved" stackId="a" fill="hsl(142 71% 45%)" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted-foreground" />
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(142 71% 45%)" }} />
              <span className="text-sm">Resolved</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {agentWorkload.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {agent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
                <Badge
                  variant={
                    agent.status === "overloaded"
                      ? "destructive"
                      : agent.status === "busy"
                      ? "default"
                      : "secondary"
                  }
                >
                  {agent.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Workload</span>
                  <span className="font-medium">{Math.round(agent.workloadScore)}%</span>
                </div>
                <Progress value={agent.workloadScore} className="h-2" />

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-lg font-bold text-blue-600">{agent.openTickets}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-lg font-bold text-yellow-600">{agent.pendingTickets}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p className="text-lg font-bold text-green-600">{agent.resolvedTickets}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>

                {agent.slaRisk > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-400">
                      {agent.slaRisk} ticket{agent.slaRisk > 1 ? "s" : ""} at SLA risk
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
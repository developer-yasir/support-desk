import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, Clock, CheckCircle, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { TICKET_VOLUME_DATA, AGENT_PERFORMANCE, DASHBOARD_STATS } from "../data/mockData";
import AgentWorkloadDashboard from "../components/tickets/AgentWorkloadDashboard";

const weeklyData = [
  { week: "Week 1", created: 120, resolved: 115 },
  { week: "Week 2", created: 145, resolved: 138 },
  { week: "Week 3", created: 132, resolved: 140 },
  { week: "Week 4", created: 158, resolved: 152 },
];

const slaData = [
  { month: "Jan", compliance: 94 },
  { month: "Feb", compliance: 92 },
  { month: "Mar", compliance: 95 },
  { month: "Apr", compliance: 93 },
  { month: "May", compliance: 96 },
  { month: "Jun", compliance: 98 },
];

const responseTimeData = [
  { day: "Mon", avgTime: 2.5 },
  { day: "Tue", avgTime: 2.2 },
  { day: "Wed", avgTime: 3.1 },
  { day: "Thu", avgTime: 2.8 },
  { day: "Fri", avgTime: 2.4 },
  { day: "Sat", avgTime: 4.2 },
  { day: "Sun", avgTime: 5.1 },
];

const MetricCard = ({ title, value, change, changeType, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div
        className={`flex items-center text-xs mt-1 ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`}
      >
        {changeType === "positive" ? (
          <TrendingUp className="h-3 w-3 mr-1" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-1" />
        )}
        {change}
      </div>
    </CardContent>
  </Card>
);

export default function Reports() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and performance metrics for your support team
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value="1,284"
          change="+12% from last period"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Response Time"
          value="2.5h"
          change="-8% from last period"
          changeType="positive"
          icon={Clock}
        />
        <MetricCard
          title="Resolution Rate"
          value="94%"
          change="+3% from last period"
          changeType="positive"
          icon={CheckCircle}
        />
        <MetricCard
          title="Customer Satisfaction"
          value="96%"
          change="+2% from last period"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="volume">
        <TabsList>
          <TabsTrigger value="volume">Ticket Volume</TabsTrigger>
          <TabsTrigger value="workload">
            <Users className="mr-2 h-4 w-4" />
            Agent Workload
          </TabsTrigger>
          <TabsTrigger value="sla">SLA Compliance</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="response">Response Times</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Ticket Volume</CardTitle>
                <CardDescription>Tickets created per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TICKET_VOLUME_DATA}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Created vs Resolved</CardTitle>
                <CardDescription>Weekly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="created" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm">Resolved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="workload" className="space-y-4 mt-4">
          <AgentWorkloadDashboard />
        </TabsContent>

        <TabsContent value="sla" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance Trend</CardTitle>
              <CardDescription>Monthly SLA compliance percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={slaData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="compliance"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Individual agent metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {AGENT_PERFORMANCE.map((agent, index) => (
                  <div key={agent.name} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">{agent.name}</p>
                      <div className="flex gap-6 mt-1 text-sm text-muted-foreground">
                        <span>{agent.resolved} tickets resolved</span>
                        <span>Avg time: {agent.avgTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{agent.satisfaction}%</p>
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                    </div>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${agent.satisfaction}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
              <CardDescription>Response time in hours by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value) => [`${value}h`, "Avg Response Time"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

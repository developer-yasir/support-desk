import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DASHBOARD_STATS,
  TICKET_VOLUME_DATA,
  TICKETS_BY_PRIORITY,
  TICKETS,
  AGENT_PERFORMANCE,
} from "../data/mockData";

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">{description}</p>
      )}
      {trend && (
        <div className="hidden sm:flex items-center text-xs text-green-600 mt-1">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user, isSuperAdmin, isManager } = useAuth();

  const recentTickets = TICKETS.slice(0, 5);
  const customerTickets = TICKETS.filter((t) => t.customerId === user?.id);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your support queue today.
          </p>
        </div>
        <Button asChild size="sm" className="w-fit">
          <Link to="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Tickets"
          value={DASHBOARD_STATS.openTickets}
          icon={Ticket}
          description="Awaiting response"
          trend="+12% from yesterday"
        />
        <StatCard
          title="Pending"
          value={DASHBOARD_STATS.pendingTickets}
          icon={Clock}
          description="Waiting on customer"
        />
        <StatCard
          title="Resolved Today"
          value={DASHBOARD_STATS.resolvedToday}
          icon={CheckCircle}
          description="Great progress!"
          trend="+8% from yesterday"
        />
        <StatCard
          title="SLA Breaches"
          value={DASHBOARD_STATS.slaBreaches}
          icon={AlertTriangle}
          description="Needs attention"
        />
      </div>

      {/* Charts */}
      {isManager && (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {/* Ticket Volume Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Ticket Volume</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tickets created this week</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TICKET_VOLUME_DATA}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
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

          {/* Priority Distribution */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Tickets by Priority</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Current distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TICKETS_BY_PRIORITY}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {TICKETS_BY_PRIORITY.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                {TICKETS_BY_PRIORITY.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Tickets / Agent Performance */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">Recent Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Latest tickets requiring attention
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/tickets">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-2 sm:space-y-4">
              {recentTickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-medium truncate text-sm sm:text-base">{ticket.subject}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {ticket.id} • {ticket.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        ticket.priority === "urgent"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : ticket.priority === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                          : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Performance - Managers and Superadmins */}
        {isManager && (
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Agent Performance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">This week's top performers</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="space-y-2 sm:space-y-4">
                {AGENT_PERFORMANCE.map((agent, index) => (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-xs sm:text-sm font-medium text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">{agent.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {agent.resolved} resolved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600 text-sm sm:text-base">{agent.satisfaction}%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Satisfaction</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

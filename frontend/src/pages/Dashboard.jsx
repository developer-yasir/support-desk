import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useFeatures } from "../contexts/FeaturesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
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
  const { user, isManager, isSuperAdmin } = useAuth();
  const { hasFeature } = useFeatures();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Super admins don't need ticket data
        if (isSuperAdmin) {
          setLoading(false);
          return;
        }

        // Parallel fetch for better performance
        const [statsData, ticketsData] = await Promise.all([
          api.getDashboardStats(),
          api.getTickets()
        ]);

        setStats(statsData.data.stats);
        setRecentTickets(ticketsData.data.tickets.slice(0, 5));
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Safe defaults
  const openCount = stats?.status?.open || 0;
  const pendingCount = stats?.status?.pending || 0;
  const resolvedCount = stats?.status?.resolved || 0; // In a real app we might want "resolved today" logic separately
  const volumeData = stats?.volume || [];
  const priorityData = stats?.priority || [];

  // Colors for Priority Chart
  const COLORS = {
    low: '#22c55e',    // green-500
    medium: '#eab308', // yellow-500
    high: '#f97316',   // orange-500
    urgent: '#ef4444'  // red-500
  };

  const priorityChartData = priorityData.map(item => ({
    name: item.name,
    value: item.value,
    fill: COLORS[item.name] || '#8884d8'
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isSuperAdmin
              ? "Manage your companies, users, and system settings."
              : "Here's what's happening with your support queue."}
          </p>
        </div>
        {!isSuperAdmin && (
          <Button asChild size="sm" className="w-fit">
            <Link to="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid - Hidden for Super Admin */}
      {!isSuperAdmin && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Open Tickets"
            value={openCount}
            icon={Ticket}
            description="Awaiting response"
          />
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            description="Waiting on customer"
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon={CheckCircle}
            description="Total resolved"
          />
          <StatCard
            title="Total Tickets"
            value={stats?.total || 0}
            icon={AlertTriangle}
            description="All time"
          />
        </div>
      )}

      {/* Charts - Hidden for Super Admin or if reports feature disabled */}
      {!isSuperAdmin && isManager && hasFeature('reports') && (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {/* Ticket Volume Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Ticket Volume (Last 7 Days)</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Daily ticket creation trend</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {volumeData.length > 0 ? (
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No data available
                    </div>
                  )}
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
                  {priorityChartData.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityChartData.map((entry, index) => (
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No data available
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                {priorityChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground capitalize">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Tickets / Agent Performance - Hidden for Super Admin */}
      {!isSuperAdmin && (
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
                {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium truncate text-sm sm:text-base">{ticket.subject}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {ticket.ticketNumber} • {ticket.createdBy?.name || 'User'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${ticket.priority === "urgent"
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
                )) : (
                  <div className="text-center text-muted-foreground py-4 text-sm">No recent tickets</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance - Placeholder or Future Implementation */}
          {isManager && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Agent Performance</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Coming soon</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 flex items-center justify-center h-48">
                <p className="text-muted-foreground text-sm">Detailed agent metrics coming in v2.0</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

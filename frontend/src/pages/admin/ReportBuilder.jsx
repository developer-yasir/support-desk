import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  FileText,
  Download,
  Trash2,
  Play,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Users,
  Ticket,
  Edit,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Mock saved reports
const SAVED_REPORTS = [
  {
    id: "1",
    name: "Weekly Ticket Volume",
    description: "Tickets created per day over the last 7 days",
    type: "bar",
    metrics: ["tickets_created"],
    groupBy: "day",
    filters: { period: "7days" },
    createdBy: "Super Admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isScheduled: true,
    schedule: "weekly",
  },
  {
    id: "2",
    name: "Agent Performance Summary",
    description: "Resolution rates and response times by agent",
    type: "table",
    metrics: ["tickets_resolved", "avg_response_time", "satisfaction_score"],
    groupBy: "agent",
    filters: { period: "30days" },
    createdBy: "Company Manager",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isScheduled: true,
    schedule: "daily",
  },
  {
    id: "3",
    name: "SLA Compliance Report",
    description: "SLA breach rate and compliance percentage",
    type: "pie",
    metrics: ["sla_met", "sla_breached"],
    groupBy: "priority",
    filters: { period: "30days" },
    createdBy: "Super Admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    lastRun: new Date(Date.now() - 1000 * 60 * 30),
    isScheduled: false,
  },
  {
    id: "4",
    name: "Customer Satisfaction Trends",
    description: "CSAT scores over time with trend analysis",
    type: "line",
    metrics: ["csat_score"],
    groupBy: "week",
    filters: { period: "90days" },
    createdBy: "Company Manager",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isScheduled: true,
    schedule: "monthly",
  },
];

const METRICS = [
  { id: "tickets_created", label: "Tickets Created", category: "Tickets" },
  { id: "tickets_resolved", label: "Tickets Resolved", category: "Tickets" },
  { id: "tickets_open", label: "Open Tickets", category: "Tickets" },
  { id: "avg_response_time", label: "Avg Response Time", category: "Performance" },
  { id: "avg_resolution_time", label: "Avg Resolution Time", category: "Performance" },
  { id: "satisfaction_score", label: "Satisfaction Score", category: "Customer" },
  { id: "csat_score", label: "CSAT Score", category: "Customer" },
  { id: "sla_met", label: "SLA Met", category: "SLA" },
  { id: "sla_breached", label: "SLA Breached", category: "SLA" },
];

const CHART_TYPES = [
  { id: "bar", label: "Bar Chart", icon: BarChart3 },
  { id: "line", label: "Line Chart", icon: TrendingUp },
  { id: "pie", label: "Pie Chart", icon: PieChart },
  { id: "table", label: "Data Table", icon: FileText },
];

export default function ReportBuilder() {
  const [reports, setReports] = useState(SAVED_REPORTS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: "",
    description: "",
    type: "bar",
    metrics: [],
    groupBy: "day",
    period: "7days",
  });

  const handleCreateReport = () => {
    if (!newReport.name) {
      toast.error("Please enter a report name");
      return;
    }
    if (newReport.metrics.length === 0) {
      toast.error("Please select at least one metric");
      return;
    }

    const report = {
      id: String(reports.length + 1),
      ...newReport,
      filters: { period: newReport.period },
      createdBy: "Super Admin",
      createdAt: new Date(),
      lastRun: null,
      isScheduled: false,
    };

    setReports([report, ...reports]);
    setNewReport({
      name: "",
      description: "",
      type: "bar",
      metrics: [],
      groupBy: "day",
      period: "7days",
    });
    setIsCreateDialogOpen(false);
    toast.success("Report created successfully!");
  };

  const handleRunReport = (reportId) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, lastRun: new Date() } : r
    ));
    toast.success("Report generated! Check the Reports tab.");
  };

  const handleDeleteReport = (reportId) => {
    setReports(reports.filter(r => r.id !== reportId));
    toast.success("Report deleted");
  };

  const toggleMetric = (metricId) => {
    setNewReport(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  const getChartIcon = (type) => {
    const chart = CHART_TYPES.find(c => c.id === type);
    return chart ? chart.icon : BarChart3;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Custom Report Builder</h1>
          <p className="text-muted-foreground">
            Create, save, and schedule custom analytics reports
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
              <DialogDescription>
                Build a custom report by selecting metrics and visualization type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    placeholder="e.g., Monthly Performance"
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {CHART_TYPES.map((chart) => (
                        <SelectItem key={chart.id} value={chart.id}>
                          <div className="flex items-center gap-2">
                            <chart.icon className="h-4 w-4" />
                            {chart.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of the report..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select
                    value={newReport.groupBy}
                    onValueChange={(value) => setNewReport({ ...newReport, groupBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <Select
                    value={newReport.period}
                    onValueChange={(value) => setNewReport({ ...newReport, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Metrics ({newReport.metrics.length} selected)</Label>
                <div className="grid gap-2 sm:grid-cols-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                  {METRICS.map((metric) => (
                    <div key={metric.id} className="flex items-center gap-2">
                      <Checkbox
                        id={metric.id}
                        checked={newReport.metrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                      />
                      <Label htmlFor={metric.id} className="text-sm cursor-pointer">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport}>Create Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.isScheduled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Run Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.lastRun && new Date(r.lastRun).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{METRICS.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Reports</CardTitle>
          <CardDescription>Manage your custom reports and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Created By</TableHead>
                <TableHead className="hidden sm:table-cell">Last Run</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const ChartIcon = getChartIcon(report.type);
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ChartIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {report.type}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {report.createdBy}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {report.lastRun ? (
                        <span className="text-sm">
                          {format(report.lastRun, "MMM d, HH:mm")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.isScheduled ? (
                        <Badge variant="secondary" className="capitalize">
                          <Clock className="mr-1 h-3 w-3" />
                          {report.schedule}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRunReport(report.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

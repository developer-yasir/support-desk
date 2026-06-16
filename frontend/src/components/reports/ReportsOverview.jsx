import { AlertTriangle, BarChart3, Users } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ChartTooltip from "./ChartTooltip";
import { formatPercent, REPORT_COLORS } from "@/utils/reportAnalytics";

export default function ReportsOverview({ report, applySavedView, applyTicketFilters }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Created vs Resolved</CardTitle>
          <CardDescription>Ticket movement over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.volume}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" minTickGap={24} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line name="Created" type="monotone" dataKey="created" stroke={REPORT_COLORS.blue} strokeWidth={2} dot={false} />
              <Line name="Resolved" type="monotone" dataKey="resolved" stroke={REPORT_COLORS.green} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Views</CardTitle>
          <CardDescription>Common manager reviews.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => applySavedView({ dateRange: "7d", priority: "urgent" })}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Weekly SLA Review
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => applySavedView({ dateRange: "30d", agent: "all" })}>
            <Users className="mr-2 h-4 w-4" />
            Agent Workload
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => applySavedView({ dateRange: "30d", priority: "all", company: "all" })}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Executive Snapshot
          </Button>
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Email Channel Share</span>
              <Badge variant="outline">{formatPercent(report.emailShare)}</Badge>
            </div>
            <Progress value={report.emailShare} />
          </div>
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">High Risk Queue</span>
              <Badge variant={report.urgentHighTickets.length ? "destructive" : "secondary"}>{report.urgentHighTickets.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-0"
              onClick={() => applyTicketFilters({ priority: "urgent", statuses: ["open", "pending", "in_progress"] })}
            >
              Open high-risk tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

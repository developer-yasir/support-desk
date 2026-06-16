import { AlertTriangle, Building2, Clock, Mail } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ChartTooltip from "./ChartTooltip";
import { formatPercent, PRIORITY_COLORS, REPORT_COLORS } from "@/utils/reportAnalytics";

export default function ReportsTabs({ report, filteredTickets, applyTicketFilters }) {
  return (
    <Tabs defaultValue="sla" className="space-y-4">
      <TabsList className="flex h-auto flex-wrap justify-start">
        <TabsTrigger value="sla">SLA Performance</TabsTrigger>
        <TabsTrigger value="workload">Agent Workload</TabsTrigger>
        <TabsTrigger value="customers">Customers & Channels</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
      </TabsList>

      <TabsContent value="sla" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Breaches By Priority</CardTitle>
              <CardDescription>Open tickets past their due date by priority.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.priorityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar name="Tickets" dataKey="tickets" radius={[4, 4, 0, 0]}>
                    {report.priorityData.map((entry) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                    ))}
                  </Bar>
                  <Bar name="Breached" dataKey="breached" fill={REPORT_COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority SLA Table</CardTitle>
              <CardDescription>Risk concentration by urgency.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Tickets</TableHead>
                    <TableHead className="text-right">Breached</TableHead>
                    <TableHead className="text-right">Breach Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.priorityData.map((item) => (
                    <TableRow key={item.priority} className="cursor-pointer" onClick={() => applyTicketFilters({ priority: item.priority })}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[item.priority] }} />
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.tickets}</TableCell>
                      <TableCell className="text-right">{item.breached}</TableCell>
                      <TableCell className="text-right">{item.breachRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="workload" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent Workload</CardTitle>
            <CardDescription>Assigned, open, resolved, urgent, and overdue ticket load.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">Resolved</TableHead>
                  <TableHead className="text-right">Urgent</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="text-right">Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.agentWorkload.map((agent) => (
                  <TableRow key={agent.id} className="cursor-pointer" onClick={() => applyTicketFilters({ agent: agent.id })}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="text-right">{agent.total}</TableCell>
                    <TableCell className="text-right">{agent.open}</TableCell>
                    <TableCell className="text-right">{agent.resolved}</TableCell>
                    <TableCell className="text-right">{agent.urgent}</TableCell>
                    <TableCell className="text-right">{agent.overdue}</TableCell>
                    <TableCell className="text-right">{agent.resolutionRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {report.agentWorkload.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No agent workload data available.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="customers" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Companies</CardTitle>
              <CardDescription>Companies with the most support demand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.companyData.map((company) => {
                const share = filteredTickets.length ? (company.value / filteredTickets.length) * 100 : 0;
                return (
                  <button
                    key={company.name}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                    onClick={() => applyTicketFilters({ searchFields: company.name })}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{company.name}</span>
                      <Badge variant="outline">{company.value}</Badge>
                    </div>
                    <Progress value={share} />
                  </button>
                );
              })}
              {report.companyData.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No company data available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel Breakdown</CardTitle>
              <CardDescription>Ticket sources in the current sample.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.channelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar name="Tickets" dataKey="value" fill={REPORT_COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="distribution" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Current ticket status breakdown.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.statusDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={110} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar name="Tickets" dataKey="value" fill={REPORT_COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operations Snapshot</CardTitle>
              <CardDescription>Backlog pressure and immediate risk.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <Clock className="mb-3 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Overdue Open</p>
                <p className="text-2xl font-bold">{report.overdueTickets.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <AlertTriangle className="mb-3 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Urgent/High Open</p>
                <p className="text-2xl font-bold">{report.urgentHighTickets.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <Building2 className="mb-3 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Active Companies</p>
                <p className="text-2xl font-bold">{report.companyData.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <Mail className="mb-3 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Email Tickets</p>
                <p className="text-2xl font-bold">{formatPercent(report.emailShare)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

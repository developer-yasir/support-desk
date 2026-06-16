import { CheckCircle, ShieldAlert, Ticket, TrendingUp, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatPercent } from "@/utils/reportAnalytics";

export default function ReportsKpiGrid({ report, applyTicketFilters }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Created"
        value={report.created}
        subtext="Tickets in selected period"
        icon={TrendingUp}
        tone="info"
      />
      <MetricCard
        title="Open Backlog"
        value={report.openBacklog}
        subtext="Open, pending, or in progress"
        icon={Ticket}
        tone={report.openBacklog > 20 ? "warning" : "default"}
        onClick={() => applyTicketFilters({ statuses: ["open", "pending", "in_progress"] })}
      />
      <MetricCard
        title="SLA Breach Rate"
        value={formatPercent(report.slaBreachRate)}
        subtext={`${report.overdueTickets.length} overdue open tickets`}
        icon={ShieldAlert}
        tone={report.slaBreachRate > 20 ? "danger" : "success"}
        onClick={() => applyTicketFilters({ resolutionDue: "overdue" })}
      />
      <MetricCard
        title="Resolution Rate"
        value={formatPercent(report.resolutionRate)}
        subtext={`${report.resolved} resolved`}
        icon={CheckCircle}
        tone="success"
      />
      <MetricCard
        title="Unassigned"
        value={report.unassignedTickets.length}
        subtext="Open tickets without owner"
        icon={Users}
        tone={report.unassignedTickets.length ? "warning" : "success"}
        onClick={() => applyTicketFilters({ agent: "unassigned" })}
      />
    </div>
  );
}

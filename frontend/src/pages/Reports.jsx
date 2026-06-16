import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import ReportsFilters from "@/components/reports/ReportsFilters";
import ReportsKpiGrid from "@/components/reports/ReportsKpiGrid";
import ReportsOverview from "@/components/reports/ReportsOverview";
import ReportsSkeleton from "@/components/reports/ReportsSkeleton";
import ReportsTabs from "@/components/reports/ReportsTabs";
import { api } from "@/lib/api";
import { exportToCsv } from "@/utils/exportCsv";
import {
  buildReportModel,
  EMPTY_TICKET_FILTERS,
  formatPercent,
  getAssigneeId,
  getCompanyOptions,
} from "@/utils/reportAnalytics";
import { toast } from "sonner";

export default function Reports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("30d");
  const [agentFilter, setAgentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    volume: [],
    summary: { created: 0, resolved: 0 },
    statusDistribution: [],
    agentPerformance: [],
  });
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [reportResponse, ticketsResponse, agentsResponse, companiesResponse] = await Promise.all([
        api.getReportData(dateRange),
        api.getTickets({ limit: 500 }),
        api.getAgents(),
        api.getCompanies({ limit: 500 }),
      ]);

      setReportData(reportResponse.data || {});
      setTickets(ticketsResponse.data?.tickets || []);
      setAgents(agentsResponse.data?.users || []);
      setCompanies(companiesResponse.data?.companies || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketCompany = ticket.company || ticket.companyId?.name || "Unknown";
      return (
        (agentFilter === "all" || getAssigneeId(ticket) === agentFilter) &&
        (priorityFilter === "all" || ticket.priority === priorityFilter) &&
        (companyFilter === "all" || ticketCompany === companyFilter)
      );
    });
  }, [agentFilter, companyFilter, priorityFilter, tickets]);

  const report = useMemo(
    () => buildReportModel({ reportData, filteredTickets }),
    [filteredTickets, reportData]
  );

  const companyOptions = useMemo(
    () => getCompanyOptions(tickets, companies),
    [companies, tickets]
  );

  const applyTicketFilters = (nextFilters) => {
    localStorage.setItem("ticketFilters", JSON.stringify({ ...EMPTY_TICKET_FILTERS, ...nextFilters }));
    navigate("/tickets");
  };

  const applySavedView = (view) => {
    if (view.dateRange) setDateRange(view.dateRange);
    setAgentFilter(view.agent || "all");
    setPriorityFilter(view.priority || "all");
    setCompanyFilter(view.company || "all");
  };

  const handleExport = () => {
    exportToCsv(
      [
        { metric: "Created tickets", value: report.created },
        { metric: "Resolved tickets", value: report.resolved },
        { metric: "Open backlog", value: report.openBacklog },
        { metric: "SLA breach rate", value: formatPercent(report.slaBreachRate) },
        { metric: "Urgent/high open", value: report.urgentHighTickets.length },
        { metric: "Unassigned open", value: report.unassignedTickets.length },
      ],
      "reports_summary"
    );
    toast.success("Report exported");
  };

  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Operational analytics for backlog, SLA risk, workload, and customer demand.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <ReportsFilters
        agentFilter={agentFilter}
        setAgentFilter={setAgentFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        agents={agents}
        companyOptions={companyOptions}
      />

      <ReportsKpiGrid report={report} applyTicketFilters={applyTicketFilters} />
      <ReportsOverview report={report} applySavedView={applySavedView} applyTicketFilters={applyTicketFilters} />
      <ReportsTabs report={report} filteredTickets={filteredTickets} applyTicketFilters={applyTicketFilters} />
    </div>
  );
}

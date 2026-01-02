import { format } from "date-fns";

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Object} options - Export options
 */
export function exportToCsv(data, filename = "export", options = {}) {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const {
    columns = null, // Array of column configs: { key: 'field', label: 'Header' }
    dateFormat = "yyyy-MM-dd HH:mm",
  } = options;

  // Determine columns from data if not provided
  const cols = columns || Object.keys(data[0]).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
  }));

  // Create header row
  const headers = cols.map((col) => `"${col.label}"`).join(",");

  // Create data rows
  const rows = data.map((item) => {
    return cols
      .map((col) => {
        let value = item[col.key];

        // Handle different types
        if (value === null || value === undefined) {
          return '""';
        }

        if (value instanceof Date) {
          value = format(value, dateFormat);
        } else if (typeof value === "object") {
          // Handle arrays and objects
          value = JSON.stringify(value);
        }

        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });

  // Combine headers and rows
  const csv = [headers, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export tickets to CSV with predefined columns
 */
export function exportTicketsToCsv(tickets) {
  const columns = [
    { key: "id", label: "Ticket ID" },
    { key: "subject", label: "Subject" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "category", label: "Category" },
    { key: "customerName", label: "Customer Name" },
    { key: "customerEmail", label: "Customer Email" },
    { key: "agentName", label: "Assigned Agent" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "slaDeadline", label: "SLA Deadline" },
    { key: "tags", label: "Tags" },
  ];

  // Transform data for export
  const exportData = tickets.map((ticket) => ({
    ...ticket,
    tags: ticket.tags?.join(", ") || "",
    agentName: ticket.agentName || "Unassigned",
  }));

  exportToCsv(exportData, "tickets", { columns });
}
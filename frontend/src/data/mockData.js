// Mock data for the application

export const PRIORITIES = [
  { id: "low", label: "Low", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  { id: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { id: "high", label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  { id: "urgent", label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
];

export const STATUSES = [
  { id: "open", label: "Open", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  { id: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { id: "resolved", label: "Resolved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  { id: "closed", label: "Closed", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
];

export const CATEGORIES = [
  { id: "technical", label: "Technical Support" },
  { id: "billing", label: "Billing" },
  { id: "sales", label: "Sales" },
  { id: "general", label: "General Inquiry" },
  { id: "feature", label: "Feature Request" },
  { id: "bug", label: "Bug Report" },
];

export const AGENTS = [
  { id: "2", name: "Support Agent", email: "agent@workdesks.com", avatar: null },
  { id: "4", name: "Sarah Wilson", email: "sarah@workdesks.com", avatar: null },
  { id: "5", name: "Mike Johnson", email: "mike@workdesks.com", avatar: null },
];

export const COMPANIES = [
  { id: "comp-1", name: "Acme Corp", domain: "acme.com", industry: "Technology" },
  { id: "comp-2", name: "TechCo", domain: "techco.com", industry: "Software" },
  { id: "comp-3", name: "Startup Inc", domain: "startup.io", industry: "Fintech" },
  { id: "comp-4", name: "Enterprise Ltd", domain: "enterprise.com", industry: "Manufacturing" },
];

export const CONTACTS = [
  { id: "3", name: "John Customer", email: "customer@example.com", companyId: "comp-1", companyName: "Acme Corp", phone: "+1 234 567 890", role: "IT Manager" },
  { id: "6", name: "Jane Smith", email: "jane@techco.com", companyId: "comp-2", companyName: "TechCo", phone: "+1 234 567 891", role: "Operations Director" },
  { id: "7", name: "Bob Wilson", email: "bob@startup.io", companyId: "comp-3", companyName: "Startup Inc", phone: "+1 234 567 892", role: "CTO" },
  { id: "8", name: "Alice Brown", email: "alice@enterprise.com", companyId: "comp-4", companyName: "Enterprise Ltd", phone: "+1 234 567 893", role: "Support Lead" },
];

// Keep CUSTOMERS for backward compatibility
export const CUSTOMERS = CONTACTS;

export const TICKETS = [
  {
    id: "TKT-001",
    subject: "Cannot login to my account",
    description: "I've been trying to login but keep getting an error message saying my credentials are invalid.",
    status: "open",
    priority: "high",
    category: "technical",
    customerId: "3",
    customerName: "John Customer",
    customerEmail: "customer@example.com",
    companyId: "comp-1",
    companyName: "Acme Corp",
    agentId: "2",
    agentName: "Support Agent",
    createdAt: "2024-12-28T10:30:00Z",
    updatedAt: "2024-12-28T14:45:00Z",
    slaDeadline: "2024-12-29T10:30:00Z",
    tags: ["login", "authentication"],
    messages: [
      {
        id: "msg-1",
        content: "I've been trying to login but keep getting an error message saying my credentials are invalid. I've tried resetting my password but still no luck.",
        author: "John Customer",
        authorId: "3",
        isInternal: false,
        createdAt: "2024-12-28T10:30:00Z",
      },
      {
        id: "msg-2",
        content: "Hi John, I'm sorry to hear you're having trouble. Let me check your account status.",
        author: "Support Agent",
        authorId: "2",
        isInternal: false,
        createdAt: "2024-12-28T11:00:00Z",
      },
      {
        id: "msg-3",
        content: "Checked the logs - looks like account was locked due to multiple failed attempts.",
        author: "Support Agent",
        authorId: "2",
        isInternal: true,
        createdAt: "2024-12-28T11:05:00Z",
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Billing discrepancy on last invoice",
    description: "My last invoice shows charges that I don't recognize.",
    status: "pending",
    priority: "medium",
    category: "billing",
    customerId: "6",
    customerName: "Jane Smith",
    customerEmail: "jane@techco.com",
    companyId: "comp-2",
    companyName: "TechCo",
    agentId: "4",
    agentName: "Sarah Wilson",
    createdAt: "2024-12-27T09:15:00Z",
    updatedAt: "2024-12-28T16:20:00Z",
    slaDeadline: "2024-12-29T09:15:00Z",
    tags: ["billing", "invoice"],
    messages: [
      {
        id: "msg-4",
        content: "My last invoice shows charges that I don't recognize. Can someone please explain?",
        author: "Jane Smith",
        authorId: "6",
        isInternal: false,
        createdAt: "2024-12-27T09:15:00Z",
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Feature request: Dark mode",
    description: "Would love to see a dark mode option in the dashboard.",
    status: "open",
    priority: "low",
    category: "feature",
    customerId: "7",
    customerName: "Bob Wilson",
    customerEmail: "bob@startup.io",
    companyId: "comp-3",
    companyName: "Startup Inc",
    agentId: null,
    agentName: null,
    createdAt: "2024-12-28T08:00:00Z",
    updatedAt: "2024-12-28T08:00:00Z",
    slaDeadline: "2024-12-30T08:00:00Z",
    tags: ["feature-request", "ui"],
    messages: [
      {
        id: "msg-5",
        content: "Would love to see a dark mode option in the dashboard. My eyes would thank you!",
        author: "Bob Wilson",
        authorId: "7",
        isInternal: false,
        createdAt: "2024-12-28T08:00:00Z",
      },
    ],
  },
  {
    id: "TKT-004",
    subject: "App crashes when uploading files",
    description: "The application crashes every time I try to upload a file larger than 5MB.",
    status: "open",
    priority: "urgent",
    category: "bug",
    customerId: "8",
    customerName: "Alice Brown",
    customerEmail: "alice@enterprise.com",
    companyId: "comp-4",
    companyName: "Enterprise Ltd",
    agentId: "5",
    agentName: "Mike Johnson",
    createdAt: "2024-12-28T15:00:00Z",
    updatedAt: "2024-12-28T15:30:00Z",
    slaDeadline: "2024-12-28T19:00:00Z",
    tags: ["bug", "crash", "upload"],
    messages: [
      {
        id: "msg-6",
        content: "The application crashes every time I try to upload a file larger than 5MB. This is blocking our team's work.",
        author: "Alice Brown",
        authorId: "8",
        isInternal: false,
        createdAt: "2024-12-28T15:00:00Z",
      },
    ],
  },
  {
    id: "TKT-005",
    subject: "Need help with API integration",
    description: "Looking for documentation on how to integrate your API.",
    status: "resolved",
    priority: "medium",
    category: "technical",
    customerId: "3",
    customerName: "John Customer",
    customerEmail: "customer@example.com",
    companyId: "comp-1",
    companyName: "Acme Corp",
    agentId: "2",
    agentName: "Support Agent",
    createdAt: "2024-12-25T11:00:00Z",
    updatedAt: "2024-12-26T14:00:00Z",
    slaDeadline: "2024-12-27T11:00:00Z",
    tags: ["api", "documentation"],
    messages: [
      {
        id: "msg-7",
        content: "Looking for documentation on how to integrate your API with our system.",
        author: "John Customer",
        authorId: "3",
        isInternal: false,
        createdAt: "2024-12-25T11:00:00Z",
      },
      {
        id: "msg-8",
        content: "Here's the link to our API documentation: docs.workdesks.com/api. Let me know if you need any help!",
        author: "Support Agent",
        authorId: "2",
        isInternal: false,
        createdAt: "2024-12-25T14:00:00Z",
      },
      {
        id: "msg-9",
        content: "Perfect, that's exactly what I needed. Thank you!",
        author: "John Customer",
        authorId: "3",
        isInternal: false,
        createdAt: "2024-12-26T14:00:00Z",
      },
    ],
  },
  {
    id: "TKT-006",
    subject: "Database connection timeout",
    description: "Our application is experiencing database connection timeouts.",
    status: "open",
    priority: "high",
    category: "technical",
    customerId: "6",
    customerName: "Jane Smith",
    customerEmail: "jane@techco.com",
    companyId: "comp-2",
    companyName: "TechCo",
    agentId: "5",
    agentName: "Mike Johnson",
    createdAt: "2024-12-29T09:00:00Z",
    updatedAt: "2024-12-29T09:30:00Z",
    slaDeadline: "2024-12-29T17:00:00Z",
    tags: ["database", "timeout"],
    messages: [
      {
        id: "msg-10",
        content: "Our application is experiencing database connection timeouts during peak hours.",
        author: "Jane Smith",
        authorId: "6",
        isInternal: false,
        createdAt: "2024-12-29T09:00:00Z",
      },
    ],
  },
];

export const DASHBOARD_STATS = {
  openTickets: 12,
  pendingTickets: 5,
  resolvedToday: 8,
  slaBreaches: 2,
  avgResponseTime: "2.5h",
  customerSatisfaction: 94,
};

export const TICKET_VOLUME_DATA = [
  { date: "Mon", tickets: 45 },
  { date: "Tue", tickets: 52 },
  { date: "Wed", tickets: 38 },
  { date: "Thu", tickets: 65 },
  { date: "Fri", tickets: 48 },
  { date: "Sat", tickets: 20 },
  { date: "Sun", tickets: 15 },
];

export const TICKETS_BY_PRIORITY = [
  { name: "Low", value: 30, fill: "hsl(var(--primary))" },
  { name: "Medium", value: 45, fill: "hsl(var(--muted-foreground))" },
  { name: "High", value: 20, fill: "hsl(var(--destructive))" },
  { name: "Urgent", value: 5, fill: "hsl(var(--accent-foreground))" },
];

export const AGENT_PERFORMANCE = [
  { name: "Support Agent", resolved: 45, avgTime: "1.8h", satisfaction: 96 },
  { name: "Sarah Wilson", resolved: 38, avgTime: "2.1h", satisfaction: 94 },
  { name: "Mike Johnson", resolved: 52, avgTime: "1.5h", satisfaction: 98 },
];

// Canned Responses
export const CANNED_RESPONSES = [
  {
    id: "cr-1",
    title: "Greeting",
    content: "Hello! Thank you for reaching out to our support team. I'm here to help you with your inquiry.",
    category: "general",
    shortcut: "/greet",
  },
  {
    id: "cr-2",
    title: "Password Reset",
    content: "To reset your password, please click on 'Forgot Password' on the login page. You'll receive an email with instructions to create a new password. If you don't receive the email within 5 minutes, please check your spam folder.",
    category: "technical",
    shortcut: "/password",
  },
  {
    id: "cr-3",
    title: "Billing Inquiry",
    content: "I understand you have questions about your billing. I'm reviewing your account now and will provide you with a detailed breakdown shortly. In the meantime, could you please confirm the invoice number you're referring to?",
    category: "billing",
    shortcut: "/billing",
  },
  {
    id: "cr-4",
    title: "Feature Request Acknowledgment",
    content: "Thank you for your feature suggestion! We really appreciate customers taking the time to share their ideas. I've forwarded your request to our product team for consideration in future updates.",
    category: "feature",
    shortcut: "/feature",
  },
  {
    id: "cr-5",
    title: "Bug Report Acknowledgment",
    content: "Thank you for reporting this issue. I've logged it in our system and our development team will investigate. Could you please provide any additional details such as your browser version, operating system, and steps to reproduce the issue?",
    category: "bug",
    shortcut: "/bug",
  },
  {
    id: "cr-6",
    title: "Closing - Resolved",
    content: "I'm glad we could resolve your issue today! If you have any other questions in the future, please don't hesitate to reach out. Have a great day!",
    category: "general",
    shortcut: "/close",
  },
  {
    id: "cr-7",
    title: "Escalation Notice",
    content: "I'm escalating this ticket to our senior support team for further assistance. They will review your case and get back to you within 24 hours. Thank you for your patience.",
    category: "general",
    shortcut: "/escalate",
  },
  {
    id: "cr-8",
    title: "Awaiting Customer Response",
    content: "I wanted to follow up on our previous conversation. Could you please provide the additional information requested? This will help us resolve your issue more quickly.",
    category: "general",
    shortcut: "/followup",
  },
];

// Ticket Templates
export const TICKET_TEMPLATES = [
  {
    id: "tpl-1",
    name: "Bug Report",
    subject: "[Bug] ",
    description: "**Description:**\n\n**Steps to reproduce:**\n1. \n2. \n3. \n\n**Expected behavior:**\n\n**Actual behavior:**\n\n**Browser/OS:**\n\n**Screenshots:**",
    category: "bug",
    priority: "high",
    tags: ["bug"],
  },
  {
    id: "tpl-2",
    name: "Feature Request",
    subject: "[Feature Request] ",
    description: "**Feature description:**\n\n**Use case:**\n\n**Expected benefit:**\n\n**Priority (from your perspective):**",
    category: "feature",
    priority: "low",
    tags: ["feature-request"],
  },
  {
    id: "tpl-3",
    name: "Billing Issue",
    subject: "[Billing] ",
    description: "**Invoice number:**\n\n**Issue type:**\n- [ ] Incorrect charge\n- [ ] Missing refund\n- [ ] Payment failed\n- [ ] Other\n\n**Details:**\n\n**Amount in question:**",
    category: "billing",
    priority: "medium",
    tags: ["billing"],
  },
  {
    id: "tpl-4",
    name: "Account Access",
    subject: "[Access] ",
    description: "**Account email:**\n\n**Issue type:**\n- [ ] Cannot login\n- [ ] Account locked\n- [ ] Password reset not working\n- [ ] Two-factor authentication issue\n\n**Error message (if any):**\n\n**Last successful login:**",
    category: "technical",
    priority: "high",
    tags: ["login", "authentication"],
  },
  {
    id: "tpl-5",
    name: "General Inquiry",
    subject: "[Inquiry] ",
    description: "**Question:**\n\n**Additional context:**",
    category: "general",
    priority: "low",
    tags: [],
  },
];

// Saved Filter Views
export const SAVED_VIEWS = [
  {
    id: "view-1",
    name: "My Open Tickets",
    icon: "User",
    filters: {
      agent: "current",
      statuses: ["open"],
    },
    isDefault: true,
  },
  {
    id: "view-2",
    name: "Unassigned Tickets",
    icon: "UserX",
    filters: {
      agent: "unassigned",
      statuses: ["open", "pending"],
    },
    isDefault: true,
  },
  {
    id: "view-3",
    name: "Urgent & High Priority",
    icon: "AlertTriangle",
    filters: {
      priority: "urgent",
      statuses: ["open", "pending"],
    },
    isDefault: true,
  },
  {
    id: "view-4",
    name: "Overdue Tickets",
    icon: "Clock",
    filters: {
      slaStatus: "breached",
      statuses: ["open", "pending"],
    },
    isDefault: true,
  },
  {
    id: "view-5",
    name: "Resolved This Week",
    icon: "CheckCircle",
    filters: {
      statuses: ["resolved"],
      resolvedAt: "last7days",
    },
    isDefault: true,
  },
];
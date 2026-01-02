// Automation data for Phase 3 features

// SLA Policies
export const SLA_POLICIES = [
  {
    id: "sla-1",
    name: "Default Policy",
    description: "Standard SLA for all tickets",
    isDefault: true,
    enabled: true,
    conditions: [],
    responseTime: { hours: 4, businessHours: true },
    resolutionTime: { hours: 24, businessHours: true },
    escalation: {
      enabled: true,
      levels: [
        { threshold: 75, action: "notify", target: "assigned_agent" },
        { threshold: 100, action: "escalate", target: "team_lead" },
      ],
    },
  },
  {
    id: "sla-2",
    name: "Urgent Priority",
    description: "Urgent tickets require immediate attention",
    isDefault: false,
    enabled: true,
    conditions: [{ field: "priority", operator: "equals", value: "urgent" }],
    responseTime: { hours: 1, businessHours: false },
    resolutionTime: { hours: 4, businessHours: false },
    escalation: {
      enabled: true,
      levels: [
        { threshold: 50, action: "notify", target: "assigned_agent" },
        { threshold: 75, action: "escalate", target: "team_lead" },
        { threshold: 100, action: "escalate", target: "manager" },
      ],
    },
  },
  {
    id: "sla-3",
    name: "VIP Customers",
    description: "Priority handling for VIP customer tickets",
    isDefault: false,
    enabled: true,
    conditions: [{ field: "customer_type", operator: "equals", value: "vip" }],
    responseTime: { hours: 2, businessHours: true },
    resolutionTime: { hours: 8, businessHours: true },
    escalation: {
      enabled: true,
      levels: [
        { threshold: 50, action: "notify", target: "assigned_agent" },
        { threshold: 100, action: "escalate", target: "manager" },
      ],
    },
  },
];

// Auto-Assignment Rules
export const ASSIGNMENT_RULES = [
  {
    id: "assign-1",
    name: "Round Robin - All Agents",
    description: "Distribute tickets evenly among all available agents",
    enabled: true,
    priority: 1,
    method: "round_robin",
    conditions: [],
    agentPool: "all",
  },
  {
    id: "assign-2",
    name: "Technical Issues to Tech Team",
    description: "Route technical and bug tickets to technical support agents",
    enabled: true,
    priority: 2,
    method: "skill_based",
    conditions: [
      { field: "category", operator: "in", value: ["technical", "bug"] },
    ],
    agentPool: "technical_team",
    skills: ["technical_support"],
  },
  {
    id: "assign-3",
    name: "Billing to Finance Team",
    description: "Route billing tickets to finance team",
    enabled: true,
    priority: 3,
    method: "skill_based",
    conditions: [{ field: "category", operator: "equals", value: "billing" }],
    agentPool: "finance_team",
    skills: ["billing"],
  },
  {
    id: "assign-4",
    name: "Urgent to Senior Agents",
    description: "Assign urgent tickets to senior agents only",
    enabled: true,
    priority: 4,
    method: "load_balanced",
    conditions: [{ field: "priority", operator: "equals", value: "urgent" }],
    agentPool: "senior_agents",
  },
];

// Escalation Rules
export const ESCALATION_RULES = [
  {
    id: "esc-1",
    name: "SLA Warning",
    description: "Notify when SLA is 75% consumed",
    enabled: true,
    trigger: { type: "sla_percentage", value: 75 },
    actions: [
      { type: "notify", target: "assigned_agent", method: "in_app" },
      { type: "notify", target: "assigned_agent", method: "email" },
    ],
  },
  {
    id: "esc-2",
    name: "SLA Breach - Level 1",
    description: "Escalate to team lead on SLA breach",
    enabled: true,
    trigger: { type: "sla_percentage", value: 100 },
    actions: [
      { type: "escalate", target: "team_lead" },
      { type: "notify", target: "team_lead", method: "email" },
      { type: "update_priority", value: "high" },
    ],
  },
  {
    id: "esc-3",
    name: "Critical Escalation",
    description: "Escalate unresolved urgent tickets after 2 hours",
    enabled: true,
    trigger: { type: "time_elapsed", value: 2, unit: "hours" },
    conditions: [
      { field: "priority", operator: "equals", value: "urgent" },
      { field: "status", operator: "not_in", value: ["resolved", "closed"] },
    ],
    actions: [
      { type: "escalate", target: "manager" },
      { type: "notify", target: "manager", method: "email" },
      { type: "add_tag", value: "critical_escalation" },
    ],
  },
  {
    id: "esc-4",
    name: "No Response Escalation",
    description: "Escalate if no agent response in 30 minutes",
    enabled: true,
    trigger: { type: "no_response", value: 30, unit: "minutes" },
    conditions: [{ field: "status", operator: "equals", value: "open" }],
    actions: [
      { type: "notify", target: "team_lead", method: "in_app" },
      { type: "reassign", method: "next_available" },
    ],
  },
];

// Automation Rules (Event-triggered)
export const AUTOMATION_RULES = [
  {
    id: "auto-1",
    name: "Auto-Respond New Tickets",
    description: "Send automatic acknowledgment for new tickets",
    enabled: true,
    trigger: { event: "ticket_created" },
    conditions: [],
    actions: [
      { type: "send_email", template: "ticket_acknowledgment" },
      { type: "add_tag", value: "auto_responded" },
    ],
  },
  {
    id: "auto-2",
    name: "Tag Password Reset",
    description: "Auto-tag tickets mentioning password issues",
    enabled: true,
    trigger: { event: "ticket_created" },
    conditions: [
      {
        field: "subject_or_description",
        operator: "contains",
        value: ["password", "reset", "forgot", "login"],
      },
    ],
    actions: [
      { type: "add_tag", value: "password_reset" },
      { type: "set_category", value: "technical" },
    ],
  },
  {
    id: "auto-3",
    name: "Customer Replied - Reopen",
    description: "Reopen resolved tickets when customer replies",
    enabled: true,
    trigger: { event: "customer_reply" },
    conditions: [
      { field: "status", operator: "in", value: ["resolved", "closed"] },
    ],
    actions: [
      { type: "set_status", value: "open" },
      { type: "notify", target: "assigned_agent", method: "in_app" },
    ],
  },
  {
    id: "auto-4",
    name: "Auto-Close Resolved Tickets",
    description: "Close resolved tickets after 48 hours of inactivity",
    enabled: true,
    trigger: { event: "time_based", schedule: "hourly" },
    conditions: [
      { field: "status", operator: "equals", value: "resolved" },
      { field: "last_activity", operator: "older_than", value: 48, unit: "hours" },
    ],
    actions: [
      { type: "set_status", value: "closed" },
      { type: "send_email", template: "ticket_closed" },
    ],
  },
  {
    id: "auto-5",
    name: "High Priority Alert",
    description: "Notify team lead for new high/urgent priority tickets",
    enabled: true,
    trigger: { event: "ticket_created" },
    conditions: [
      { field: "priority", operator: "in", value: ["high", "urgent"] },
    ],
    actions: [
      { type: "notify", target: "team_lead", method: "in_app" },
      { type: "notify", target: "team_lead", method: "email" },
    ],
  },
];

// Scenario Automations (Multi-action macros)
export const SCENARIOS = [
  {
    id: "scenario-1",
    name: "Escalate to Manager",
    description: "Escalate ticket to manager with full context",
    icon: "AlertTriangle",
    actions: [
      { type: "escalate", target: "manager" },
      { type: "update_priority", value: "urgent" },
      { type: "add_tag", value: "escalated" },
      { type: "notify", target: "manager", method: "email" },
      { type: "add_note", value: "Ticket escalated to manager for immediate attention.", isInternal: true },
    ],
  },
  {
    id: "scenario-2",
    name: "Request More Info",
    description: "Send template requesting additional information",
    icon: "HelpCircle",
    actions: [
      { type: "set_status", value: "pending" },
      { type: "send_reply", template: "request_more_info" },
      { type: "add_tag", value: "awaiting_customer" },
    ],
  },
  {
    id: "scenario-3",
    name: "Transfer to Billing",
    description: "Transfer ticket to billing team",
    icon: "DollarSign",
    actions: [
      { type: "set_category", value: "billing" },
      { type: "reassign", target: "billing_team" },
      { type: "add_note", value: "Transferred to billing team.", isInternal: true },
    ],
  },
  {
    id: "scenario-4",
    name: "Close as Duplicate",
    description: "Close ticket and mark as duplicate",
    icon: "Copy",
    actions: [
      { type: "add_tag", value: "duplicate" },
      { type: "send_reply", template: "duplicate_ticket" },
      { type: "set_status", value: "closed" },
    ],
  },
  {
    id: "scenario-5",
    name: "Mark as Resolved",
    description: "Send resolution confirmation and close",
    icon: "CheckCircle",
    actions: [
      { type: "send_reply", template: "resolution_confirmation" },
      { type: "set_status", value: "resolved" },
      { type: "add_tag", value: "resolved" },
    ],
  },
];
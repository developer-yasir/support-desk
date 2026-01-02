import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Zap,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Permission categories with granular permissions
const PERMISSION_CATEGORIES = [
  {
    id: "tickets",
    label: "Tickets",
    icon: Ticket,
    permissions: [
      { id: "tickets.view", label: "View tickets", description: "View all tickets in the system" },
      { id: "tickets.view_own", label: "View own tickets only", description: "View only assigned tickets" },
      { id: "tickets.create", label: "Create tickets", description: "Create new support tickets" },
      { id: "tickets.edit", label: "Edit tickets", description: "Edit ticket details and properties" },
      { id: "tickets.delete", label: "Delete tickets", description: "Permanently delete tickets" },
      { id: "tickets.assign", label: "Assign tickets", description: "Assign tickets to agents" },
      { id: "tickets.merge", label: "Merge tickets", description: "Merge duplicate tickets" },
      { id: "tickets.export", label: "Export tickets", description: "Export ticket data to CSV" },
    ],
  },
  {
    id: "users",
    label: "Users & Teams",
    icon: Users,
    permissions: [
      { id: "users.view", label: "View users", description: "View user profiles and lists" },
      { id: "users.create", label: "Create users", description: "Add new users to the system" },
      { id: "users.edit", label: "Edit users", description: "Modify user details and roles" },
      { id: "users.delete", label: "Delete users", description: "Remove users from the system" },
      { id: "users.manage_teams", label: "Manage teams", description: "Create and edit teams" },
      { id: "users.assign_roles", label: "Assign roles", description: "Change user roles" },
    ],
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: BarChart3,
    permissions: [
      { id: "reports.view", label: "View reports", description: "Access analytics dashboard" },
      { id: "reports.create", label: "Create custom reports", description: "Build custom report queries" },
      { id: "reports.export", label: "Export reports", description: "Download report data" },
      { id: "reports.view_agent_performance", label: "View agent performance", description: "See individual agent metrics" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: Zap,
    permissions: [
      { id: "automation.view", label: "View automations", description: "See automation rules" },
      { id: "automation.create", label: "Create automations", description: "Create new automation rules" },
      { id: "automation.edit", label: "Edit automations", description: "Modify existing rules" },
      { id: "automation.delete", label: "Delete automations", description: "Remove automation rules" },
      { id: "automation.manage_sla", label: "Manage SLA policies", description: "Configure SLA settings" },
    ],
  },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    permissions: [
      { id: "settings.view", label: "View settings", description: "Access system configuration" },
      { id: "settings.edit", label: "Edit settings", description: "Modify system settings" },
      { id: "settings.billing", label: "Manage billing", description: "Access billing and subscriptions" },
      { id: "settings.audit_logs", label: "View audit logs", description: "Access system audit logs" },
      { id: "settings.integrations", label: "Manage integrations", description: "Configure third-party integrations" },
    ],
  },
];

// Role templates
const ROLE_TEMPLATES = {
  superadmin: {
    name: "Super Admin",
    description: "Full system access with all permissions",
    permissions: PERMISSION_CATEGORIES.flatMap(cat => cat.permissions.map(p => p.id)),
  },
  company_manager: {
    name: "Company Manager",
    description: "Manage teams, reports, and most settings",
    permissions: [
      "tickets.view", "tickets.create", "tickets.edit", "tickets.assign", "tickets.merge", "tickets.export",
      "users.view", "users.create", "users.edit", "users.manage_teams",
      "reports.view", "reports.create", "reports.export", "reports.view_agent_performance",
      "automation.view", "automation.create", "automation.edit", "automation.manage_sla",
      "settings.view",
    ],
  },
  agent: {
    name: "Agent",
    description: "Handle tickets and view basic reports",
    permissions: [
      "tickets.view_own", "tickets.create", "tickets.edit",
      "users.view",
      "reports.view",
    ],
  },
};

export default function RolePermissions() {
  const [selectedRole, setSelectedRole] = useState("superadmin");
  const [rolePermissions, setRolePermissions] = useState(ROLE_TEMPLATES);
  const [hasChanges, setHasChanges] = useState(false);

  const currentRole = rolePermissions[selectedRole];

  const togglePermission = (permissionId) => {
    const currentPerms = currentRole.permissions;
    const newPerms = currentPerms.includes(permissionId)
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: {
        ...currentRole,
        permissions: newPerms,
      },
    });
    setHasChanges(true);
  };

  const toggleCategory = (categoryId) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const categoryPermIds = category.permissions.map(p => p.id);
    const allSelected = categoryPermIds.every(id => currentRole.permissions.includes(id));

    let newPerms;
    if (allSelected) {
      newPerms = currentRole.permissions.filter(p => !categoryPermIds.includes(p));
    } else {
      newPerms = [...new Set([...currentRole.permissions, ...categoryPermIds])];
    }

    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: {
        ...currentRole,
        permissions: newPerms,
      },
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success("Role permissions saved successfully!");
    setHasChanges(false);
  };

  const getCategoryStats = (categoryId) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return { selected: 0, total: 0 };
    
    const total = category.permissions.length;
    const selected = category.permissions.filter(p => currentRole.permissions.includes(p.id)).length;
    return { selected, total };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Role Permissions</h1>
          <p className="text-muted-foreground">
            Configure granular access permissions for each role
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Warning */}
      <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-400">
              Changes affect all users with this role
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-500">
              Permission changes will take effect immediately for all users assigned to this role.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Role Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Roles</CardTitle>
            <CardDescription>Select a role to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(rolePermissions).map(([roleId, role]) => (
              <button
                key={roleId}
                onClick={() => setSelectedRole(roleId)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedRole === roleId
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${selectedRole === roleId ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium">{role.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {role.permissions.length} permissions
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Permissions Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {currentRole.name}
                </CardTitle>
                <CardDescription>{currentRole.description}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{currentRole.permissions.length}</p>
                <p className="text-xs text-muted-foreground">permissions enabled</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <Accordion type="multiple" className="space-y-2" defaultValue={PERMISSION_CATEGORIES.map(c => c.id)}>
                {PERMISSION_CATEGORIES.map((category) => {
                  const { selected, total } = getCategoryStats(category.id);
                  const allSelected = selected === total;
                  const someSelected = selected > 0 && selected < total;

                  return (
                    <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={allSelected}
                            // Use data attribute to indicate partial state for styling
                            data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                            onCheckedChange={() => toggleCategory(category.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <category.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{category.label}</span>
                          <span className="text-xs text-muted-foreground ml-auto mr-4">
                            {selected}/{total}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2">
                          {category.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 pl-7"
                            >
                              <Checkbox
                                id={permission.id}
                                checked={currentRole.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={permission.id}
                                  className="font-medium cursor-pointer"
                                >
                                  {permission.label}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

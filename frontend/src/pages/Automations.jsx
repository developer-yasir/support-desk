import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  UserPlus,
  AlertTriangle,
  Zap,
  Settings2,
} from "lucide-react";
import SLAPoliciesManager from "@/components/automation/SLAPoliciesManager";
import AssignmentRulesManager from "@/components/automation/AssignmentRulesManager";
import EscalationRulesManager from "@/components/automation/EscalationRulesManager";
import AutomationRulesManager from "@/components/automation/AutomationRulesManager";
import { SLA_POLICIES, ASSIGNMENT_RULES, ESCALATION_RULES, AUTOMATION_RULES } from "@/data/automationData";

export default function Automations() {
  const stats = {
    sla: SLA_POLICIES.filter((p) => p.enabled).length,
    assignment: ASSIGNMENT_RULES.filter((r) => r.enabled).length,
    escalation: ESCALATION_RULES.filter((r) => r.enabled).length,
    automation: AUTOMATION_RULES.filter((r) => r.enabled).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Automations</h1>
        <p className="text-muted-foreground">
          Configure automated workflows, SLA policies, and escalation rules
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SLA Policies
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sla}</div>
            <p className="text-xs text-muted-foreground">active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assignment Rules
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignment}</div>
            <p className="text-xs text-muted-foreground">active rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escalation Rules
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalation}</div>
            <p className="text-xs text-muted-foreground">active rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Automations
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.automation}</div>
            <p className="text-xs text-muted-foreground">active automations</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different automation types */}
      <Tabs defaultValue="sla">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">SLA Policies</span>
            <Badge variant="secondary" className="ml-1">{stats.sla}</Badge>
          </TabsTrigger>
          <TabsTrigger value="assignment" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Assignment</span>
            <Badge variant="secondary" className="ml-1">{stats.assignment}</Badge>
          </TabsTrigger>
          <TabsTrigger value="escalation" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Escalation</span>
            <Badge variant="secondary" className="ml-1">{stats.escalation}</Badge>
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Automations</span>
            <Badge variant="secondary" className="ml-1">{stats.automation}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sla" className="mt-6">
          <SLAPoliciesManager />
        </TabsContent>

        <TabsContent value="assignment" className="mt-6">
          <AssignmentRulesManager />
        </TabsContent>

        <TabsContent value="escalation" className="mt-6">
          <EscalationRulesManager />
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <AutomationRulesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
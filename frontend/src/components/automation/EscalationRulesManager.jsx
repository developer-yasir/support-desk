import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Bell,
  ArrowUp,
  Mail,
  Tag,
  RefreshCw,
} from "lucide-react";
import { ESCALATION_RULES } from "@/data/automationData";
import { toast } from "sonner";

const actionIcons = {
  notify: Bell,
  escalate: ArrowUp,
  update_priority: AlertTriangle,
  add_tag: Tag,
  reassign: RefreshCw,
};

export default function EscalationRulesManager() {
  const [rules, setRules] = useState(ESCALATION_RULES);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    );
    toast.success("Rule updated");
  };

  const handleDelete = (ruleId) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast.success("Rule deleted");
  };

  const formatTrigger = (trigger) => {
    if (trigger.type === "sla_percentage") {
      return `SLA at ${trigger.value}%`;
    }
    if (trigger.type === "time_elapsed") {
      return `After ${trigger.value} ${trigger.unit}`;
    }
    if (trigger.type === "no_response") {
      return `No response for ${trigger.value} ${trigger.unit}`;
    }
    return trigger.type;
  };

  const formatAction = (action) => {
    switch (action.type) {
      case "notify":
        return `Notify ${action.target} via ${action.method}`;
      case "escalate":
        return `Escalate to ${action.target}`;
      case "update_priority":
        return `Set priority to ${action.value}`;
      case "add_tag":
        return `Add tag "${action.value}"`;
      case "reassign":
        return `Reassign to ${action.method}`;
      default:
        return action.type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Escalation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Automatically escalate tickets based on SLA or time conditions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Escalation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input placeholder="e.g., SLA Breach Alert" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Describe the escalation" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Trigger When</Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sla_percentage">SLA Percentage</SelectItem>
                      <SelectItem value="time_elapsed">Time Elapsed</SelectItem>
                      <SelectItem value="no_response">No Response</SelectItem>
                      <SelectItem value="status_unchanged">Status Unchanged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="75" className="w-20" />
                  <Select>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">%</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Then Perform Actions</Label>
                <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notify">Notify</SelectItem>
                        <SelectItem value="escalate">Escalate</SelectItem>
                        <SelectItem value="reassign">Reassign</SelectItem>
                        <SelectItem value="update_priority">Update Priority</SelectItem>
                        <SelectItem value="add_tag">Add Tag</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Target" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assigned_agent">Assigned Agent</SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_app">In-App</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Rule created");
                setDialogOpen(false);
              }}>
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={!rule.enabled ? "opacity-60" : ""}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${rule.enabled ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-muted"}`}>
                    <AlertTriangle className={`h-5 w-5 ${rule.enabled ? "text-yellow-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>

                    {/* Trigger */}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        Trigger: {formatTrigger(rule.trigger)}
                      </Badge>
                      {rule.conditions?.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {c.field} {c.operator} {Array.isArray(c.value) ? c.value.join(", ") : c.value}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rule.actions.map((action, i) => {
                        const ActionIcon = actionIcons[action.type] || Bell;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted"
                          >
                            <ActionIcon className="h-3 w-3" />
                            {formatAction(action)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
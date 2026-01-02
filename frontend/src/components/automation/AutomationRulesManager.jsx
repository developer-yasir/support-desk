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
  Zap,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Tag,
  RefreshCw,
  Bell,
  FileText,
} from "lucide-react";
import { AUTOMATION_RULES } from "@/data/automationData";
import { toast } from "sonner";

const eventLabels = {
  ticket_created: "Ticket Created",
  customer_reply: "Customer Reply",
  agent_reply: "Agent Reply",
  status_changed: "Status Changed",
  priority_changed: "Priority Changed",
  assigned: "Ticket Assigned",
  time_based: "Scheduled",
};

export default function AutomationRulesManager() {
  const [rules, setRules] = useState(AUTOMATION_RULES);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    );
    toast.success("Automation updated");
  };

  const handleDelete = (ruleId) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast.success("Automation deleted");
  };

  const formatAction = (action) => {
    switch (action.type) {
      case "send_email":
        return `Send email: ${action.template}`;
      case "add_tag":
        return `Add tag: ${action.value}`;
      case "set_status":
        return `Set status: ${action.value}`;
      case "set_category":
        return `Set category: ${action.value}`;
      case "notify":
        return `Notify ${action.target}`;
      default:
        return action.type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Automate actions based on ticket events
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Automation Name</Label>
                <Input placeholder="e.g., Auto-tag password issues" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Describe what this automation does" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>When This Event Happens</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ticket_created">Ticket Created</SelectItem>
                    <SelectItem value="customer_reply">Customer Reply</SelectItem>
                    <SelectItem value="agent_reply">Agent Reply</SelectItem>
                    <SelectItem value="status_changed">Status Changed</SelectItem>
                    <SelectItem value="priority_changed">Priority Changed</SelectItem>
                    <SelectItem value="assigned">Ticket Assigned</SelectItem>
                    <SelectItem value="time_based">Scheduled (Time-based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>If These Conditions Match (optional)</Label>
                <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subject">Subject</SelectItem>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="in">is one of</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Value" className="flex-1" />
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Then Perform These Actions</Label>
                <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send_email">Send Email</SelectItem>
                        <SelectItem value="add_tag">Add Tag</SelectItem>
                        <SelectItem value="set_status">Set Status</SelectItem>
                        <SelectItem value="set_category">Set Category</SelectItem>
                        <SelectItem value="set_priority">Set Priority</SelectItem>
                        <SelectItem value="assign">Assign To</SelectItem>
                        <SelectItem value="notify">Notify</SelectItem>
                        <SelectItem value="add_note">Add Note</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Value or template" className="flex-1" />
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
                toast.success("Automation created");
                setDialogOpen(false);
              }}>
                Create Automation
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
                  <div className={`p-2 rounded-lg ${rule.enabled ? "bg-purple-100 dark:bg-purple-900/20" : "bg-muted"}`}>
                    <Zap className={`h-5 w-5 ${rule.enabled ? "text-purple-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>

                    {/* Trigger & Conditions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        On: {eventLabels[rule.trigger.event] || rule.trigger.event}
                      </Badge>
                      {rule.conditions?.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {c.field} {c.operator} {Array.isArray(c.value) ? c.value.slice(0, 2).join(", ") + (c.value.length > 2 ? "..." : "") : c.value}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rule.actions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted"
                        >
                          {action.type === "send_email" && <Mail className="h-3 w-3" />}
                          {action.type === "add_tag" && <Tag className="h-3 w-3" />}
                          {action.type === "set_status" && <RefreshCw className="h-3 w-3" />}
                          {action.type === "notify" && <Bell className="h-3 w-3" />}
                          {action.type === "set_category" && <FileText className="h-3 w-3" />}
                          {formatAction(action)}
                        </div>
                      ))}
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
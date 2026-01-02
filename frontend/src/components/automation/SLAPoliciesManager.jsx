import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Bell,
} from "lucide-react";
import { SLA_POLICIES } from "@/data/automationData";
import { toast } from "sonner";

export default function SLAPoliciesManager() {
  const [policies, setPolicies] = useState(SLA_POLICIES);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePolicy = (policyId) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId ? { ...p, enabled: !p.enabled } : p
      )
    );
    toast.success("Policy updated");
  };

  const handleDelete = (policyId) => {
    const policy = policies.find((p) => p.id === policyId);
    if (policy?.isDefault) {
      toast.error("Cannot delete default policy");
      return;
    }
    setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    toast.success("Policy deleted");
  };

  const formatTime = (time) => {
    const hours = time.hours;
    if (hours >= 24) {
      return `${hours / 24} day${hours / 24 > 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SLA Policies</h3>
          <p className="text-sm text-muted-foreground">
            Define response and resolution time targets
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? "Edit SLA Policy" : "Create SLA Policy"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Name</Label>
                  <Input placeholder="e.g., High Priority SLA" />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Response Time</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="4" className="w-20" />
                    <Select defaultValue="hours">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Resolution Time</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="24" className="w-20" />
                    <Select defaultValue="hours">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Switch id="business-hours" />
                <Label htmlFor="business-hours">
                  Count only business hours (Mon-Fri 9AM-6PM)
                </Label>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Escalation Rules</Label>
                <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-32">At 75% of SLA:</span>
                    <Select defaultValue="notify">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notify">Notify</SelectItem>
                        <SelectItem value="escalate">Escalate</SelectItem>
                        <SelectItem value="reassign">Reassign</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="agent">
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Assigned Agent</SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-32">At 100% of SLA:</span>
                    <Select defaultValue="escalate">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notify">Notify</SelectItem>
                        <SelectItem value="escalate">Escalate</SelectItem>
                        <SelectItem value="reassign">Reassign</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="team_lead">
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Assigned Agent</SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Policy saved");
                setDialogOpen(false);
              }}>
                Save Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy.id} className={!policy.enabled ? "opacity-60" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${policy.enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <Clock className={`h-5 w-5 ${policy.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{policy.name}</h4>
                      {policy.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {policy.description}
                    </p>
                    
                    {/* Conditions */}
                    {policy.conditions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {policy.conditions.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {c.field} {c.operator} {c.value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* SLA Times */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Response</p>
                      <p className="font-medium">{formatTime(policy.responseTime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Resolution</p>
                      <p className="font-medium">{formatTime(policy.resolutionTime)}</p>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-10" />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => togglePolicy(policy.id)}
                    />
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(policy.id)}
                      disabled={policy.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Escalation Info */}
              {policy.escalation?.enabled && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Escalation: {policy.escalation.levels.map((l, i) => (
                      <span key={i}>
                        {l.threshold}% → {l.action} {l.target}
                        {i < policy.escalation.levels.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
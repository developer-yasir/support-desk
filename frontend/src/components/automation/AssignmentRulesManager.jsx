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
  UserPlus,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  Users,
  RefreshCw,
  Scale,
} from "lucide-react";
import { ASSIGNMENT_RULES } from "@/data/automationData";
import { AGENTS, CATEGORIES } from "@/data/mockData";
import { toast } from "sonner";

const methodIcons = {
  round_robin: RefreshCw,
  skill_based: Users,
  load_balanced: Scale,
};

const methodLabels = {
  round_robin: "Round Robin",
  skill_based: "Skill-Based",
  load_balanced: "Load Balanced",
};

export default function AssignmentRulesManager() {
  const [rules, setRules] = useState(ASSIGNMENT_RULES);
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

  const moveRule = (ruleId, direction) => {
    setRules((prev) => {
      const index = prev.findIndex((r) => r.id === ruleId);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prev.length - 1)
      ) {
        return prev;
      }
      const newRules = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newRules[index], newRules[targetIndex]] = [
        newRules[targetIndex],
        newRules[index],
      ];
      return newRules.map((r, i) => ({ ...r, priority: i + 1 }));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Auto-Assignment Rules</h3>
          <p className="text-sm text-muted-foreground">
            Automatically assign tickets to agents based on conditions
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
              <DialogTitle>Create Assignment Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input placeholder="e.g., Route billing tickets to finance" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Describe what this rule does" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>When ticket matches</Label>
                <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="subject">Subject</SelectItem>
                        <SelectItem value="customer_type">Customer Type</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="in">is one of</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Value" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assignment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Round Robin
                        </div>
                      </SelectItem>
                      <SelectItem value="load_balanced">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          Load Balanced
                        </div>
                      </SelectItem>
                      <SelectItem value="skill_based">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Skill-Based
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Agent Pool</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      <SelectItem value="technical_team">Technical Team</SelectItem>
                      <SelectItem value="billing_team">Billing Team</SelectItem>
                      <SelectItem value="senior_agents">Senior Agents</SelectItem>
                    </SelectContent>
                  </Select>
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

      <div className="space-y-2">
        {rules.map((rule, index) => {
          const MethodIcon = methodIcons[rule.method] || UserPlus;
          return (
            <Card key={rule.id} className={!rule.enabled ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Priority/Order */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveRule(rule.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUpDown className="h-3 w-3 rotate-180" />
                    </Button>
                    <span className="text-xs text-center text-muted-foreground">
                      #{rule.priority}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveRule(rule.id, "down")}
                      disabled={index === rules.length - 1}
                    >
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${rule.enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <MethodIcon className={`h-5 w-5 ${rule.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {methodLabels[rule.method]}
                      </Badge>
                      {rule.conditions.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {c.field}: {Array.isArray(c.value) ? c.value.join(", ") : c.value}
                        </Badge>
                      ))}
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
          );
        })}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AGENTS, CATEGORIES, PRIORITIES, STATUSES } from "@/data/mockData";

const DEFAULT_TICKET_DEFAULTS = {
    status: "open",
    priority: "medium",
    category: "general",
    assignee: "unassigned",
    group: "customer-support",
    autoCloseEnabled: true,
    autoCloseDays: "3",
    requireCategory: true,
    internalNoteOnAssignment: true,
};

const GROUPS = [
    { id: "customer-support", label: "Customer Support" },
    { id: "technical", label: "Technical" },
    { id: "billing", label: "Billing" },
    { id: "sales", label: "Sales" },
];

const TicketDefaultsSettings = () => {
    const navigate = useNavigate();
    const [defaults, setDefaults] = useState(() => {
        const saved = localStorage.getItem("admin_ticketDefaults");
        return saved ? { ...DEFAULT_TICKET_DEFAULTS, ...JSON.parse(saved) } : DEFAULT_TICKET_DEFAULTS;
    });

    const updateDefault = (key, value) => {
        setDefaults((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        localStorage.setItem("admin_ticketDefaults", JSON.stringify(defaults));
        toast.success("Ticket defaults saved");
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate("/admin/settings")}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Ticket Defaults</h1>
                    <p className="text-muted-foreground">Configure how new tickets are initialized.</p>
                </div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save Defaults
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>New Ticket Defaults</CardTitle>
                    <CardDescription>Applied when agents or inbound email create a ticket.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Default Status</Label>
                        <Select value={defaults.status} onValueChange={(value) => updateDefault("status", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                                {STATUSES.map((status) => (
                                    <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Default Priority</Label>
                        <Select value={defaults.priority} onValueChange={(value) => updateDefault("priority", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                                {PRIORITIES.map((priority) => (
                                    <SelectItem key={priority.id} value={priority.id}>{priority.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Default Category</Label>
                        <Select value={defaults.category} onValueChange={(value) => updateDefault("category", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                                {CATEGORIES.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Default Assignee</Label>
                        <Select value={defaults.assignee} onValueChange={(value) => updateDefault("assignee", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {AGENTS.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Default Group</Label>
                        <Select value={defaults.group} onValueChange={(value) => updateDefault("group", value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                                {GROUPS.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Handling Rules</CardTitle>
                    <CardDescription>Small guardrails that keep ticket data clean.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Require category</p>
                            <p className="text-sm text-muted-foreground">Agents must categorize tickets before saving.</p>
                        </div>
                        <Switch checked={defaults.requireCategory} onCheckedChange={(checked) => updateDefault("requireCategory", checked)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Add internal note on assignment</p>
                            <p className="text-sm text-muted-foreground">Record assignment changes in ticket activity.</p>
                        </div>
                        <Switch checked={defaults.internalNoteOnAssignment} onCheckedChange={(checked) => updateDefault("internalNoteOnAssignment", checked)} />
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium">Auto-close resolved tickets</p>
                                <p className="text-sm text-muted-foreground">Close resolved tickets after a quiet period.</p>
                            </div>
                            <Switch checked={defaults.autoCloseEnabled} onCheckedChange={(checked) => updateDefault("autoCloseEnabled", checked)} />
                        </div>
                        {defaults.autoCloseEnabled && (
                            <div className="mt-4 max-w-xs space-y-2">
                                <Label>Days after resolution</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={defaults.autoCloseDays}
                                    onChange={(event) => updateDefault("autoCloseDays", event.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TicketDefaultsSettings;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_INBOX_PREFERENCES = {
    layout: "drawer",
    density: "compact",
    sortBy: "dateCreated",
    pageSize: "20",
    autoRefresh: true,
    rememberFilters: true,
    openDrawerOnSelect: true,
};

const InboxPreferencesSettings = () => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem("admin_inboxPreferences");
        if (saved) return { ...DEFAULT_INBOX_PREFERENCES, ...JSON.parse(saved) };

        return {
            ...DEFAULT_INBOX_PREFERENCES,
            layout: localStorage.getItem("ticketsLayout") || DEFAULT_INBOX_PREFERENCES.layout,
            density: localStorage.getItem("ticketsDensity") || DEFAULT_INBOX_PREFERENCES.density,
        };
    });

    const updatePreference = (key, value) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        localStorage.setItem("admin_inboxPreferences", JSON.stringify(preferences));
        localStorage.setItem("ticketsLayout", preferences.layout);
        localStorage.setItem("ticketsDensity", preferences.density);
        toast.success("Inbox preferences saved");
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
                    <h1 className="text-2xl font-bold">Inbox Preferences</h1>
                    <p className="text-muted-foreground">Set the default ticket queue experience for agents.</p>
                </div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save Preferences
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Queue Defaults</CardTitle>
                    <CardDescription>These defaults are used when agents open the tickets page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Default Layout</Label>
                            <Select value={preferences.layout} onValueChange={(value) => updatePreference("layout", value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="table">Table</SelectItem>
                                    <SelectItem value="drawer">Drawer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Density</Label>
                            <Select value={preferences.density} onValueChange={(value) => updatePreference("density", value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    <SelectItem value="compact">Compact</SelectItem>
                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Default Sort</Label>
                            <Select value={preferences.sortBy} onValueChange={(value) => updatePreference("sortBy", value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    <SelectItem value="dateCreated">Date created</SelectItem>
                                    <SelectItem value="dateUpdated">Date updated</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tickets Per Page</Label>
                            <Select value={preferences.pageSize} onValueChange={(value) => updatePreference("pageSize", value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    <SelectItem value="10">10 tickets</SelectItem>
                                    <SelectItem value="20">20 tickets</SelectItem>
                                    <SelectItem value="50">50 tickets</SelectItem>
                                    <SelectItem value="100">100 tickets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Agent Workflow</CardTitle>
                    <CardDescription>Keep repeated ticket handling fast and predictable.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Auto-refresh ticket queue</p>
                            <p className="text-sm text-muted-foreground">Refresh open queues periodically while the tab is active.</p>
                        </div>
                        <Switch checked={preferences.autoRefresh} onCheckedChange={(checked) => updatePreference("autoRefresh", checked)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Remember filters</p>
                            <p className="text-sm text-muted-foreground">Preserve filter choices between sessions.</p>
                        </div>
                        <Switch checked={preferences.rememberFilters} onCheckedChange={(checked) => updatePreference("rememberFilters", checked)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium">Open drawer on row select</p>
                            <p className="text-sm text-muted-foreground">Show ticket preview immediately in Drawer layout.</p>
                        </div>
                        <Switch checked={preferences.openDrawerOnSelect} onCheckedChange={(checked) => updatePreference("openDrawerOnSelect", checked)} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="outline">Layout: {preferences.layout}</Badge>
                        <Badge variant="outline">Density: {preferences.density}</Badge>
                        <Badge variant="outline">Page size: {preferences.pageSize}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InboxPreferencesSettings;

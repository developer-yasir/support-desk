import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Save, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PRIORITIES } from "@/data/mockData";

const SlaSettings = () => {
    const navigate = useNavigate();
    // Initialize state from localStorage or defaults
    const [slaSettings, setSlaSettings] = useState(() => {
        const saved = localStorage.getItem('admin_slaSettings');
        return saved ? JSON.parse(saved) : {
            defaultResponse: "4",
            defaultResolution: "24",
            businessHours: "Mon-Fri 9:00 AM - 6:00 PM",
            prioritySla: {
                urgent: { response: "1", resolution: "4" },
                high: { response: "4", resolution: "12" },
                medium: { response: "8", resolution: "24" },
                low: { response: "24", resolution: "48" }
            }
        };
    });

    const handleSave = () => {
        localStorage.setItem('admin_slaSettings', JSON.stringify(slaSettings));
        toast.success("SLA policies saved successfully");
    };

    const updatePrioritySla = (priority, field, value) => {
        setSlaSettings(prev => ({
            ...prev,
            prioritySla: {
                ...prev.prioritySla,
                [priority]: {
                    ...prev.prioritySla[priority],
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">SLA Policies</h1>
                    <p className="text-muted-foreground">Configure Service Level Agreement policies</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Default Policy</CardTitle>
                    <CardDescription>Applied to all tickets unless a more specific policy matches</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Default Response Time (hours)</Label>
                            <Input
                                type="number"
                                value={slaSettings.defaultResponse}
                                onChange={(e) => setSlaSettings({ ...slaSettings, defaultResponse: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Resolution Time (hours)</Label>
                            <Input
                                type="number"
                                value={slaSettings.defaultResolution}
                                onChange={(e) => setSlaSettings({ ...slaSettings, defaultResolution: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Business Hours</Label>
                        <Input
                            value={slaSettings.businessHours}
                            onChange={(e) => setSlaSettings({ ...slaSettings, businessHours: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" /> Save SLA Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Priority Levels</CardTitle>
                    <CardDescription>Configure ticket priority levels</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Priority</TableHead>
                                <TableHead>SLA Response (hours)</TableHead>
                                <TableHead>SLA Resolution (hours)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PRIORITIES.map((priority) => (
                                <TableRow key={priority.id}>
                                    <TableCell>
                                        <Badge variant="secondary" className={priority.color}>{priority.label}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            className="w-24"
                                            type="number"
                                            value={slaSettings.prioritySla[priority.id]?.response || ""}
                                            onChange={(e) => updatePrioritySla(priority.id, 'response', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            className="w-24"
                                            type="number"
                                            value={slaSettings.prioritySla[priority.id]?.resolution || ""}
                                            onChange={(e) => updatePrioritySla(priority.id, 'resolution', e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SlaSettings;

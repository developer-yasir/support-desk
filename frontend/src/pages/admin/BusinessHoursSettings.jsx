import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

const BusinessHoursSettings = () => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Business Hours</h1>
                    <p className="text-muted-foreground">Define your operating hours to calculate SLAs correctly</p>
                </div>
                <Button onClick={() => toast.success("Changes saved")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Timezone</CardTitle>
                    <CardDescription>Set your default timezone for business hours configuration</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Label>Default Timezone</Label>
                        <div className="mt-2">
                            <select className="w-full h-10 px-3 rounded-md border bg-background text-sm">
                                <option>Pacific Time (US & Canada) (GMT-08:00)</option>
                                <option>Eastern Time (US & Canada) (GMT-05:00)</option>
                                <option>London (GMT+00:00)</option>
                                <option>Dubai (GMT+04:00)</option>
                                <option>Singapore (GMT+08:00)</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                    <CardDescription>Select the days and hours your support team is available</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <div key={day} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="w-32 flex items-center gap-2">
                                    <Switch defaultChecked={!['Saturday', 'Sunday'].includes(day)} />
                                    <span className="font-medium">{day}</span>
                                </div>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Input type="time" defaultValue="09:00" className="w-32" disabled={['Saturday', 'Sunday'].includes(day)} />
                                        <span className="text-muted-foreground">to</span>
                                        <Input type="time" defaultValue="18:00" className="w-32" disabled={['Saturday', 'Sunday'].includes(day)} />
                                    </div>
                                    {['Saturday', 'Sunday'].includes(day) && (
                                        <Badge variant="outline" className="text-muted-foreground">Closed</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BusinessHoursSettings;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Save, Shield } from "lucide-react";
import { toast } from "sonner";

const SecuritySettings = () => {
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
                    <h1 className="text-2xl font-bold">Security</h1>
                    <p className="text-muted-foreground">Manage your account security and password policies</p>
                </div>
                <Button onClick={() => toast.success("Security settings saved")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Password Policy</CardTitle>
                    <CardDescription>Set requirements for user passwords</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Minimum Length</Label>
                            <p className="text-sm text-muted-foreground">Minimum number of characters</p>
                        </div>
                        <Input type="number" className="w-24" defaultValue="8" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Require Special Character</Label>
                            <p className="text-sm text-muted-foreground">User must include at least one special character</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Require Number</Label>
                            <p className="text-sm text-muted-foreground">User must include at least one number</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Single Sign-On (SSO)</CardTitle>
                    <CardDescription>Configure SAML or OIDC for your organization</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Enterprise Feature</h3>
                        <p className="text-muted-foreground mb-4">SSO is available on the Enterprise plan.</p>
                        <Button variant="outline">Upgrade to Enterprise</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SecuritySettings;

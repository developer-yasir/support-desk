import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Save, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const NotificationEditDialog = ({ open, onOpenChange, notification, onSave }) => {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    useEffect(() => {
        if (notification) {
            setSubject(notification.subject || "");
            setBody(notification.body || "");
        }
    }, [notification]);

    const handleSave = () => {
        onSave(notification.id, { subject, body });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Notification Template</DialogTitle>
                    <DialogDescription>
                        Customize the email template for {notification?.label}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email Subject"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="body">Body</Label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Email Body Content..."
                            className="h-[200px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EmailSettings = ({ companyData, onUpdate }) => {
    const navigate = useNavigate();
    const [emailConfig, setEmailConfig] = useState({
        enabled: false,
        host: "",
        port: 587,
        secure: false,
        user: "",
        pass: "",
        from: "",
        notifications: {}
    });
    const [testRecipient, setTestRecipient] = useState("");
    const [testingEmail, setTestingEmail] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    useEffect(() => {
        if (companyData?.emailConfig) {
            setEmailConfig({
                enabled: companyData.emailConfig.enabled || false,
                host: companyData.emailConfig.host || "",
                port: companyData.emailConfig.port || 587,
                secure: companyData.emailConfig.secure || false,
                user: companyData.emailConfig.user || "",
                pass: "",
                from: companyData.emailConfig.from || "",
                notifications: companyData.emailConfig.notifications || {}
            });
        }
    }, [companyData]);

    const handleNotificationToggle = (id, checked) => {
        setEmailConfig(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [id]: {
                    ...prev.notifications?.[id],
                    enabled: checked
                }
            }
        }));
    };

    const handleSaveTemplate = (id, templateData) => {
        setEmailConfig(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [id]: {
                    ...prev.notifications?.[id],
                    ...templateData
                }
            }
        }));
    };

    const handleEditClick = (item) => {
        const currentSettings = emailConfig.notifications?.[item.id] || {};
        setEditingNotification({
            id: item.id,
            label: item.label,
            subject: currentSettings.subject,
            body: currentSettings.body
        });
    };

    const handleEmailConfigSave = async () => {
        if (!companyData?._id) return;
        try {
            if (emailConfig.enabled) {
                if (!emailConfig.host || !emailConfig.user) {
                    toast.error("Host and User are required when email is enabled");
                    return;
                }
            }

            const response = await api.updateEmailConfig(companyData._id, emailConfig);
            toast.success("Email configuration saved successfully!");

            const updatedConfig = response.data.emailConfig;
            setEmailConfig(prev => ({
                ...prev,
                ...updatedConfig,
                pass: ""
            }));

            onUpdate({ ...companyData, emailConfig: response.data.emailConfig });
        } catch (error) {
            toast.error(error.message || "Failed to save email configuration");
        }
    };

    const handleTestEmail = async () => {
        if (!companyData?._id) return;
        if (!testRecipient) {
            toast.error("Please enter a recipient email address");
            return;
        }

        setTestingEmail(true);
        try {
            await api.testEmailConfig(companyData._id, testRecipient);
            toast.success("Test email sent successfully! Check your inbox.");
        } catch (error) {
            toast.error(error.message || "Failed to send test email");
        } finally {
            setTestingEmail(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Email Notifications</h1>
                    <p className="text-muted-foreground">Configure email settings and automated notifications</p>
                </div>
            </div>

            <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="notifications">Email Notifications</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="mt-6">
                    {companyData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>SMTP Configuration</CardTitle>
                                <CardDescription>
                                    Configure your company's email for sending ticket replies
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Use Company Email</p>
                                        <p className="text-sm text-muted-foreground">Enable to use your own SMTP server instead of system default</p>
                                    </div>
                                    <Switch checked={emailConfig.enabled} onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, enabled: checked })} />
                                </div>
                                {emailConfig.enabled && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="smtpHost">SMTP Host</Label>
                                                <Input
                                                    id="smtpHost"
                                                    placeholder="smtp.gmail.com"
                                                    value={emailConfig.host}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="smtpPort">SMTP Port</Label>
                                                <Input
                                                    id="smtpPort"
                                                    type="number"
                                                    placeholder="587"
                                                    value={emailConfig.port}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, port: parseInt(e.target.value) || 587 })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="smtpUser">Email User</Label>
                                                <Input
                                                    id="smtpUser"
                                                    type="email"
                                                    placeholder="support@company.com"
                                                    value={emailConfig.user}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="smtpPass">SMTP Password</Label>
                                                <Input
                                                    id="smtpPass"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={emailConfig.pass}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, pass: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtpFrom">From Address (Optional)</Label>
                                            <Input
                                                id="smtpFrom"
                                                placeholder='My Company Support <support@mycompany.com>'
                                                value={emailConfig.from}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="secure"
                                                checked={emailConfig.secure}
                                                onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, secure: checked })}
                                            />
                                            <Label htmlFor="secure">Use SSL/TLS</Label>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h4 className="text-sm font-medium mb-4">Test Configuration</h4>
                                            <div className="flex gap-4">
                                                <Input
                                                    placeholder="recipient@example.com"
                                                    value={testRecipient}
                                                    onChange={(e) => setTestRecipient(e.target.value)}
                                                    className="max-w-sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={handleTestEmail}
                                                    disabled={testingEmail}
                                                >
                                                    {testingEmail ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        "Send Test Email"
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end pt-4 border-t">
                                    <Button onClick={handleEmailConfigSave}>
                                        <Save className="mr-2 h-4 w-4" /> Save Configuration
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <Tabs defaultValue="agent" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                                    <TabsTrigger
                                        value="agent"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        Agent Notifications
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="requester"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        Requester Notifications
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="cc"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        CC Notifications
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="templates"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        Templates
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="agent" className="mt-6">
                                    <div className="space-y-4">
                                        {[
                                            { label: "New Ticket Created", id: "new_ticket" },
                                            { label: "Ticket Assigned to Group", id: "ticket_assigned_group" },
                                            { label: "Ticket Assigned to Agent", id: "ticket_assigned_agent" },
                                            { label: "Requester Replies to Ticket", id: "requester_reply" },
                                            { label: "Note added to ticket", id: "note_added" }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <Switch
                                                        checked={emailConfig.notifications?.[item.id]?.enabled ?? true}
                                                        onCheckedChange={(checked) => handleNotificationToggle(item.id, checked)}
                                                        id={item.id}
                                                    />
                                                    <Label htmlFor={item.id} className="text-base font-medium text-blue-600 cursor-pointer">
                                                        {item.label}
                                                    </Label>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="requester" className="mt-6">
                                    <div className="space-y-4">
                                        {[
                                            { label: "New Ticket Created", id: "new_ticket_requester" },
                                            { label: "Agent Adds Comment to Ticket", id: "agent_comment" },
                                            { label: "Agent Solves the Ticket", id: "agent_solved" },
                                            { label: "Agent Closes the Ticket", id: "agent_closed" },
                                            { label: "User Activation Email", id: "user_activation" },
                                            { label: "Password Reset Email", id: "password_reset" }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <Switch
                                                        checked={emailConfig.notifications?.[item.id]?.enabled ?? true}
                                                        onCheckedChange={(checked) => handleNotificationToggle(item.id, checked)}
                                                        id={item.id}
                                                    />
                                                    <Label htmlFor={item.id} className="text-base font-medium text-blue-600 cursor-pointer">
                                                        {item.label}
                                                    </Label>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="cc" className="mt-6">
                                    <div className="space-y-4">
                                        {[
                                            { label: "New Ticket Created", id: "new_ticket_cc" },
                                            { label: "Note added to ticket", id: "note_added_cc" }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <Switch
                                                        checked={emailConfig.notifications?.[item.id]?.enabled ?? true}
                                                        onCheckedChange={(checked) => handleNotificationToggle(item.id, checked)}
                                                        id={item.id}
                                                    />
                                                    <Label htmlFor={item.id} className="text-base font-medium text-blue-600 cursor-pointer">
                                                        {item.label}
                                                    </Label>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="templates" className="mt-6">
                                    <div className="space-y-4">
                                        {[
                                            { label: "Agent Reply Template", id: "agent_reply_template" },
                                            { label: "Agent Forward Template", id: "agent_forward_template" }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <Switch
                                                        checked={emailConfig.notifications?.[item.id]?.enabled ?? true}
                                                        onCheckedChange={(checked) => handleNotificationToggle(item.id, checked)}
                                                        id={item.id}
                                                    />
                                                    <Label htmlFor={item.id} className="text-base font-medium text-blue-600 cursor-pointer">
                                                        {item.label}
                                                    </Label>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <NotificationEditDialog
                open={!!editingNotification}
                onOpenChange={(open) => !open && setEditingNotification(null)}
                notification={editingNotification}
                onSave={handleSaveTemplate}
            />
        </div>
    );
};

export default EmailSettings;

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
        provider: "custom",
        host: "",
        port: 587,
        secure: false,
        user: "",
        pass: "",
        from: "",
        inboundEnabled: false,
        imapHost: "",
        imapPort: 993,
        imapSecure: true,
        imapUser: "",
        imapPass: "",
        inboxFolder: "INBOX",
        useSameCredentialsForImap: true,
        notifications: {}
    });
    const [testRecipient, setTestRecipient] = useState("");
    const [testingEmail, setTestingEmail] = useState(false);
    const [testingImap, setTestingImap] = useState(false);
    const [syncingInbound, setSyncingInbound] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    useEffect(() => {
        if (companyData?.emailConfig) {
            setEmailConfig({
                enabled: companyData.emailConfig.enabled || false,
                provider: companyData.emailConfig.provider || "custom",
                host: companyData.emailConfig.host || "",
                port: companyData.emailConfig.port || 587,
                secure: companyData.emailConfig.secure || false,
                user: companyData.emailConfig.user || "",
                pass: "",
                from: companyData.emailConfig.from || "",
                inboundEnabled: companyData.emailConfig.inboundEnabled || false,
                imapHost: companyData.emailConfig.imapHost || "",
                imapPort: companyData.emailConfig.imapPort || 993,
                imapSecure: typeof companyData.emailConfig.imapSecure === "boolean" ? companyData.emailConfig.imapSecure : true,
                imapUser: companyData.emailConfig.imapUser || "",
                imapPass: "",
                inboxFolder: companyData.emailConfig.inboxFolder || "INBOX",
                useSameCredentialsForImap: true,
                notifications: companyData.emailConfig.notifications || {}
            });
        }
    }, [companyData]);

    const applyProviderPreset = (provider) => {
        const presets = {
            gmail: {
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                imapHost: "imap.gmail.com",
                imapPort: 993,
                imapSecure: true,
            },
            outlook: {
                host: "smtp.office365.com",
                port: 587,
                secure: false,
                imapHost: "outlook.office365.com",
                imapPort: 993,
                imapSecure: true,
            },
            custom: {}
        };

        const preset = presets[provider] || presets.custom;
        setEmailConfig((prev) => ({
            ...prev,
            provider,
            ...preset,
        }));
    };

    const buildPayload = () => {
        const payload = { ...emailConfig };
        delete payload.useSameCredentialsForImap;

        if (emailConfig.useSameCredentialsForImap) {
            payload.imapUser = emailConfig.user;
            payload.imapPass = emailConfig.pass;
        }

        return payload;
    };

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

            if (emailConfig.inboundEnabled && !emailConfig.imapHost) {
                toast.error("IMAP host is required when inbound email is enabled");
                return;
            }

            const response = await api.updateEmailConfig(companyData._id, buildPayload());
            toast.success("Email configuration saved successfully!");

            const updatedConfig = response.data.emailConfig;
            setEmailConfig(prev => ({
                ...prev,
                ...updatedConfig,
                pass: "",
                imapPass: "",
                useSameCredentialsForImap: true
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

    const handleTestImap = async () => {
        if (!companyData?._id) return;
        setTestingImap(true);
        try {
            const res = await api.testImapConfig(companyData._id);
            toast.success(res.message || "IMAP connected successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to connect to IMAP");
        } finally {
            setTestingImap(false);
        }
    };

    const handleSyncInboundNow = async () => {
        if (!companyData?._id) return;
        setSyncingInbound(true);
        try {
            const res = await api.syncInboundNow(companyData._id);
            toast.success(`Inbound sync complete: +${res.data?.synced ?? 0} ticket(s)`);
        } catch (error) {
            toast.error(error.message || "Inbound sync failed");
        } finally {
            setSyncingInbound(false);
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
                                <CardTitle>Email Configuration</CardTitle>
                                <CardDescription>
                                    Configure outbound (SMTP) and inbound (IMAP) so emails can create tickets automatically
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
                                                <Label>Provider</Label>
                                                <Select value={emailConfig.provider} onValueChange={applyProviderPreset}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select provider" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover z-50">
                                                        <SelectItem value="gmail">Gmail</SelectItem>
                                                        <SelectItem value="outlook">Outlook</SelectItem>
                                                        <SelectItem value="custom">Custom</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">Gmail/Outlook presets auto-fill server fields.</p>
                                            </div>
                                        </div>
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
                                                <p className="text-xs text-muted-foreground">For Gmail/Outlook, use an App Password.</p>
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

                                        <div className="border-t pt-6 space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                                <div>
                                                    <p className="font-medium">Inbound Email (Auto-create tickets)</p>
                                                    <p className="text-sm text-muted-foreground">Enable IMAP polling for this mailbox</p>
                                                </div>
                                                <Switch
                                                    checked={emailConfig.inboundEnabled}
                                                    onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, inboundEnabled: checked })}
                                                />
                                            </div>

                                            {emailConfig.inboundEnabled && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            id="useSame"
                                                            checked={emailConfig.useSameCredentialsForImap}
                                                            onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, useSameCredentialsForImap: checked })}
                                                        />
                                                        <Label htmlFor="useSame">Use same credentials as SMTP</Label>
                                                    </div>

                                                    {!emailConfig.useSameCredentialsForImap && (
                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="imapUser">IMAP User</Label>
                                                                <Input
                                                                    id="imapUser"
                                                                    type="email"
                                                                    placeholder="support@company.com"
                                                                    value={emailConfig.imapUser}
                                                                    onChange={(e) => setEmailConfig({ ...emailConfig, imapUser: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="imapPass">IMAP Password</Label>
                                                                <Input
                                                                    id="imapPass"
                                                                    type="password"
                                                                    placeholder="••••••••"
                                                                    value={emailConfig.imapPass}
                                                                    onChange={(e) => setEmailConfig({ ...emailConfig, imapPass: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid gap-6 md:grid-cols-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="imapHost">IMAP Host</Label>
                                                            <Input
                                                                id="imapHost"
                                                                placeholder="imap.gmail.com"
                                                                value={emailConfig.imapHost}
                                                                onChange={(e) => setEmailConfig({ ...emailConfig, imapHost: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="imapPort">IMAP Port</Label>
                                                            <Input
                                                                id="imapPort"
                                                                type="number"
                                                                placeholder="993"
                                                                value={emailConfig.imapPort}
                                                                onChange={(e) => setEmailConfig({ ...emailConfig, imapPort: parseInt(e.target.value) || 993 })}
                                                            />
                                                        </div>
                                                        <div className="flex items-end space-x-2 pb-1">
                                                            <Switch
                                                                id="imapSecure"
                                                                checked={emailConfig.imapSecure}
                                                                onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, imapSecure: checked })}
                                                            />
                                                            <Label htmlFor="imapSecure">Use SSL/TLS</Label>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-6 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="inboxFolder">Inbox Folder</Label>
                                                            <Input
                                                                id="inboxFolder"
                                                                placeholder="INBOX"
                                                                value={emailConfig.inboxFolder}
                                                                onChange={(e) => setEmailConfig({ ...emailConfig, inboxFolder: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <Button variant="outline" onClick={handleTestImap} disabled={testingImap}>
                                                                {testingImap ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Testing...
                                                                    </>
                                                                ) : (
                                                                    "Test IMAP"
                                                                )}
                                                            </Button>
                                                            <Button variant="outline" onClick={handleSyncInboundNow} disabled={syncingInbound}>
                                                                {syncingInbound ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Syncing...
                                                                    </>
                                                                ) : (
                                                                    "Sync Now"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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

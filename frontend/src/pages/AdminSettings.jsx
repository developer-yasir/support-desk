import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Users,
  Shield,
  Briefcase,
  LayoutGrid,
  Zap,
  Phone,
  Facebook,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  Loader2,
  Save,
  ChevronLeft,
  Search,
  Layers,
  Lock,
  UserCog
} from "lucide-react";
import { PRIORITIES } from "@/data/mockData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Automations from "./Automations";
import AdminUsers from "./AdminUsers";
import CompanyLogoUpload from "@/components/CompanyLogoUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Components ---

function SettingsCard({ icon: Icon, title, description, configured, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer rounded-lg p-6 border shadow-sm
        flex flex-col h-full relative group
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        {configured && (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
          </Badge>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      )}
    </div>
  );
}

const DashboardView = ({ companyData }) => {
  const navigate = useNavigate();
  const emailEnabled = companyData?.emailConfig?.enabled || false;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          className="pl-10 h-12 text-lg bg-background"
          placeholder="Search settings"
        />
      </div>

      {/* Recent */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Recent</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SettingsCard
            icon={CreditCard}
            title="Plans & Billing"
            onClick={() => navigate('plans')}
          />
          <SettingsCard
            icon={Users}
            title="SLA Policies"
            onClick={() => navigate('sla')}
          />
        </div>
      </div>

      {/* Team */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Team</h2>
          <Badge variant="secondary">2 of 3 Configured</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SettingsCard
            icon={Users}
            title="Agents"
            description="Define agents' scope of work, type, language, and other details."
            configured
            onClick={() => navigate('agents')}
          />
          <SettingsCard
            icon={Layers}
            title="Groups"
            description="Organize agents and receive notifications on unattended tickets."
            configured
            onClick={() => navigate('groups')}
          />
          <SettingsCard
            icon={Clock}
            title="Business Hours"
            description="Define working hours and holidays to set expectations with customers."
            onClick={() => navigate('business_hours')}
          />
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Channels</h2>
          <Badge variant="secondary">{emailEnabled ? '2' : '1'} of 9 Configured</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SettingsCard
            icon={LayoutGrid}
            title="Portals"
            description="Customize the branding, visibility, and structure of your self-service portal"
            configured
            onClick={() => navigate('portals')}
          />
          <SettingsCard
            icon={Mail}
            title="Email"
            description="Integrate support mailboxes, configure DKIM, custom mail servers, Bcc and more"
            configured={emailEnabled}
            onClick={() => navigate('email')}
          />
          <SettingsCard
            icon={Zap}
            title="Automations"
            description="Configure automated workflows, SLA policies, and escalation rules"
            onClick={() => navigate('automations')}
          />
          <SettingsCard
            icon={Facebook}
            title="Facebook"
            description="Associate your Facebook page to pull in customer posts as tickets"
            onClick={() => navigate('facebook')}
          />
          <SettingsCard
            icon={Phone}
            title="Phone"
            description="Run a virtual call center and manage phone conversations"
            configured
            onClick={() => navigate('phone')}
          />
        </div>
      </div>

      {/* Account */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SettingsCard
            icon={Briefcase}
            title="Account Details"
            description="View your account's status and invoice email address"
            onClick={() => navigate('account')}
          />
          <SettingsCard
            icon={Lock}
            title="Security"
            description="Secure your helpdesk account with advanced SSO configuration"
            onClick={() => navigate('security')}
          />
          <SettingsCard
            icon={Building2}
            title="Helpdesk Settings"
            description="Brand your helpdesk (Logo, specific settings)"
            configured={!!companyData?.logo}
            onClick={() => navigate('company')}
          />
        </div>
      </div>
    </div>
  );
};

const CompanyView = ({ companyData, onUpdate, loading }) => {
  const navigate = useNavigate();
  const [companyForm, setCompanyForm] = useState({
    name: "",
    domain: "",
    industry: "",
    notes: ""
  });

  useEffect(() => {
    if (companyData) {
      setCompanyForm({
        name: companyData.name || "",
        domain: companyData.domain || "",
        industry: companyData.industry || "",
        notes: companyData.notes || ""
      });
    }
  }, [companyData]);

  const handleCompanySave = async () => {
    if (!companyData?._id) return;
    try {
      await api.updateCompany(companyData._id, companyForm);
      toast.success("Company profile updated successfully!");
      onUpdate({ ...companyData, ...companyForm });
    } catch (error) {
      toast.error(error.message || "Failed to update company profile");
    }
  };

  const handleLogoUpdate = async (logoData) => {
    if (!companyData?._id) return;
    try {
      await api.updateCompany(companyData._id, { logo: logoData });
      toast.success("Logo updated successfully");
      onUpdate({ ...companyData, logo: logoData });
    } catch (error) {
      throw new Error(error.message || "Failed to update logo");
    }
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
          <h1 className="text-2xl font-bold">Helpdesk Settings</h1>
          <p className="text-muted-foreground">Manage your company information and branding</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : companyData ? (
            <>
              <div className="pb-6 border-b">
                <CompanyLogoUpload company={companyData} onLogoUpdate={handleLogoUpdate} />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={companyForm.domain}
                    onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNotes">Notes</Label>
                  <Input
                    id="companyNotes"
                    value={companyForm.notes}
                    onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleCompanySave}>
                  <Save className="mr-2 h-4 w-4" /> Save Company Profile
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


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

const EmailView = ({ companyData, onUpdate }) => {
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


const SlaView = () => {
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

const BusinessHoursView = () => {
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

const GroupsView = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([
    { id: 1, name: 'General Support', description: 'Default group for general inquiries', agents: 3 },
    { id: 2, name: 'Billing', description: 'Handling invoices and payments', agents: 1 },
    { id: 3, name: 'Technical Issues', description: 'L2 support for bugs and technical problems', agents: 2 }
  ]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Agent Groups</h1>
          <p className="text-muted-foreground">Organize agents into groups for better ticket assignment</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New Group
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      {group.name}
                    </div>
                  </TableCell>
                  <TableCell>{group.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.agents} Agents</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

const PlansView = ({ paymentMethod, setPaymentMethod, currentPlan, setCurrentPlan }) => {
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const PLANS = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for small teams just getting started.",
      features: ["3 Agents", "Email Support", "Basic Reporting", "1 Knowledge Base"],
      current: currentPlan === "Free"
    },
    {
      name: "Growth",
      price: "$29",
      period: "/agent/month",
      description: "For growing teams that need more automation.",
      features: ["Unlimited Agents", "Automation Rules", "Advanced Reporting", "SLA Policies", "Connect 3 Mailboxes"],
      recommended: true,
      current: currentPlan === "Growth"
    },
    {
      name: "Enterprise",
      price: "$79",
      period: "/agent/month",
      description: "Advanced security and control for large organizations.",
      features: ["Unlimited Agents", "Audit Logs", "SAML SSO", "Sandboxes", "24/7 Phone Support"],
      current: currentPlan === "Enterprise"
    }
  ];

  const MOCK_INVOICES = paymentMethod ? [
    { date: "Oct 01, 2025", amount: currentPlan === "Enterprise" ? "$79.00" : currentPlan === "Growth" ? "$29.00" : "$0.00", status: "Paid" },
    { date: "Sep 01, 2025", amount: currentPlan === "Enterprise" ? "$79.00" : currentPlan === "Growth" ? "$29.00" : "$0.00", status: "Paid" },
  ] : [];

  const handleSaveCard = () => {
    // Simulate saving card
    setPaymentMethod({
      type: 'Visa',
      last4: '4242',
      expiry: '12/28'
    });
    toast.success("Payment method added successfully");
    setShowPaymentModal(false);
  };

  const handleConfirmUpgrade = () => {
    toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
    setCurrentPlan(selectedPlan.name);
    setShowConfirmModal(false);
    setShowUpgradeModal(false);
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
          <h1 className="text-2xl font-bold">Plans & Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-32 h-32 text-primary rotate-12" />
          </div>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Zap className="h-5 w-5" /> Current Plan: {currentPlan}
            </CardTitle>
            <CardDescription>Your account is currently on the {currentPlan} tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Agent Seats</span>
                <span className="font-medium">
                  {currentPlan === "Free" ? "2 / 3 used" : "2 / Unlimited used"}
                </span>
              </div>
              <div className="bg-background/50 h-2 rounded-full overflow-hidden border">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: currentPlan === "Free" ? "66%" : "5%" }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentPlan === "Free" ? "Upgrade to add more agents to your team." : "You have unlimited agent seats."}
              </p>
            </div>

            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Included in {currentPlan}:</div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {PLANS.find(p => p.name === currentPlan)?.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> {f}</li>
                ))}
              </ul>
            </div>

            <Button className="w-full" onClick={() => setShowUpgradeModal(true)}>Upgrade Plan</Button>
          </CardContent>
        </Card>

        {/* Billing Method */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Billing Method</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4">
            {paymentMethod ? (
              <>
                <div className="w-full p-4 border rounded-xl bg-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{paymentMethod.type} ending in {paymentMethod.last4}</p>
                      <p className="text-xs text-muted-foreground">Expires {paymentMethod.expiry}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Default</Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setShowPaymentModal(true)}>Update Card</Button>
              </>
            ) : (
              <>
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">No payment method</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">Add a credit card to process payments for your subscription.</p>
                </div>
                <Button variant="outline" onClick={() => setShowPaymentModal(true)}>Add Payment Method</Button>
              </>
            )}

          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {MOCK_INVOICES.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INVOICES.map((inv, i) => (
                  <TableRow key={i}>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.amount}</TableCell>
                    <TableCell><Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Paid</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm">Download</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
              <div className="p-3 bg-muted rounded-full">
                <Briefcase className="h-6 w-6 opacity-50" />
              </div>
              <p>No invoices available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border shadow-lg rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-2xl font-bold">Upgrade your plan</h2>
                <p className="text-muted-foreground">Choose the plan that fits your needs</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowUpgradeModal(false)}>
                <ChevronLeft className="h-6 w-6 rotate-180" /> {/* Hacky close icon replacement, should technically optionally use X */}
              </Button>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div key={plan.name} className={`relative rounded-xl border p-6 flex flex-col ${plan.recommended ? 'border-primary ring-1 ring-primary shadow-md bg-primary/5' : 'bg-card'}`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                    className="w-full"
                    onClick={() => {
                      if (paymentMethod) {
                        setSelectedPlan(plan);
                        setShowConfirmModal(true);
                      } else {
                        toast.info(`Select a payment method for ${plan.name} plan`);
                        setShowUpgradeModal(false);
                        setShowPaymentModal(true);
                      }
                    }}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-muted/20 text-center">
              <p className="text-sm text-muted-foreground">Need a custom plan? <a href="#" className="text-primary underline">Contact Sales</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border shadow-lg rounded-xl max-w-md w-full mx-4 p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Add Payment Method</h2>
              <p className="text-muted-foreground text-sm">Enter your card details to proceed</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input placeholder="123" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveCard}>Save Card</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlan && paymentMethod && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border shadow-lg rounded-xl max-w-md w-full mx-4 p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">Confirm Subscription</h2>
              <p className="text-muted-foreground text-sm">Review your plan details below</p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Plan</span>
                  <span>{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Price</span>
                  <span>{selectedPlan.price} {selectedPlan.period}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pay with {paymentMethod.type}</p>
                  <p className="text-xs text-muted-foreground">Ending in {paymentMethod.last4}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleConfirmUpgrade}>Confirm & Pay</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const SecurityView = () => {
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

const AccountView = ({ user, companyData }) => {
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
          <h1 className="text-2xl font-bold">Account Details</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Account Owner</Label>
              <Input value={user?.name} disabled />
            </div>
            <div>
              <Label>Owner Email</Label>
              <Input value={user?.email} disabled />
            </div>
            <div>
              <Label>Account ID</Label>
              <Input value={companyData?._id} disabled />
            </div>
            <div>
              <Label>Created At</Label>
              <Input value={companyData?.createdAt ? new Date(companyData.createdAt).toLocaleDateString() : 'N/A'} disabled />
            </div>
          </div>
          <div className="pt-6 border-t mt-6">
            <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
            <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ChannelPlaceholderView = ({ title, icon: Icon, description }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
        </Button>
      </div>
      <div className="text-center py-20">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">{description}</p>
        <Button onClick={() => navigate('/admin/settings')}>Return to Dashboard</Button>
      </div>
    </div>
  );
};

// --- Main Container ---

const AgentsView = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
        </Button>
      </div>
      <AdminUsers />
    </div>
  );
};

const AutomationsView = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
        </Button>
      </div>
      <Automations />
    </div>
  );
};

export default function AdminSettings() {
  const { user, updateUserCompany } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  // Lifted state for persistence with localStorage initialization
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const saved = localStorage.getItem('admin_paymentMethod');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPlan, setCurrentPlan] = useState(() => {
    return localStorage.getItem('admin_currentPlan') || "Free";
  });

  // Persist state changes
  useEffect(() => {
    if (paymentMethod) {
      localStorage.setItem('admin_paymentMethod', JSON.stringify(paymentMethod));
    } else {
      localStorage.removeItem('admin_paymentMethod');
    }
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem('admin_currentPlan', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  const fetchCompanyData = async () => {
    if (!user?.company) {
      setLoading(false);
      return;
    }
    try {
      if (typeof user.company === 'object') {
        const company = user.company;
        setCompanyData(company);
      }
    } catch (error) {
      toast.error("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = (updatedCompany) => {
    setCompanyData(updatedCompany);
    updateUserCompany(updatedCompany);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Routes>
        <Route index element={<DashboardView companyData={companyData} />} />

        {/* Sub-routes */}
        <Route path="company" element={<CompanyView companyData={companyData} onUpdate={handleUpdateCompany} loading={loading} />} />
        <Route path="email" element={<EmailView companyData={companyData} onUpdate={handleUpdateCompany} />} />
        <Route path="sla" element={<SlaView />} />
        <Route path="business_hours" element={<BusinessHoursView />} />
        <Route path="groups" element={<GroupsView />} />
        <Route path="agents" element={<AgentsView />} />
        <Route path="automations" element={<AutomationsView />} />
        <Route path="plans" element={<PlansView paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} />} />
        <Route path="security" element={<SecurityView />} />
        <Route path="account" element={<AccountView user={user} companyData={companyData} />} />

        {/* Placeholders */}
        <Route path="portals" element={<ChannelPlaceholderView title="Customer Portals" icon={LayoutGrid} description="Build a knowledge base and self-service portal for your customers." />} />
        <Route path="widgets" element={<ChannelPlaceholderView title="Web Widgets" icon={Zap} description="Embed support widgets directly on your website." />} />
        <Route path="facebook" element={<ChannelPlaceholderView title="Facebook Integration" icon={Facebook} description="Connect your Facebook page to manage messages as tickets." />} />
        <Route path="phone" element={<ChannelPlaceholderView title="Cloud Telephony" icon={Phone} description="Make and receive calls directly from your helpdesk." />} />
      </Routes>
    </div>
  );
}

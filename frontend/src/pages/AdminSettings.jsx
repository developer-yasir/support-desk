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
import EmailView from "./admin/EmailSettings";
import SlaView from "./admin/SlaSettings";
import CompanyView from "./admin/CompanySettings";
import BusinessHoursView from "./admin/BusinessHoursSettings";
import GroupsView from "./admin/GroupsSettings";
import PlansView from "./admin/PlansSettings";
import SecurityView from "./admin/SecuritySettings";
import AccountView from "./admin/AccountSettings";
import CompanyLogoUpload from "@/components/CompanyLogoUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// EmailView extracted to ./admin/EmailSettings.jsx
// SlaView extracted to ./admin/SlaSettings.jsx
// CompanyView extracted to ./admin/CompanySettings.jsx




// BusinessHoursView extracted to ./admin/BusinessHoursSettings.jsx
// GroupsView extracted to ./admin/GroupsSettings.jsx
// PlansView extracted to ./admin/PlansSettings.jsx
// SecurityView extracted to ./admin/SecuritySettings.jsx
// AccountView extracted to ./admin/AccountSettings.jsx

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

import { useState, useEffect } from "react";
import CompanyTicketHistory from "@/components/CompanyTicketHistory";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Building2, Users, Pencil, Trash2, MoreHorizontal, Ticket, ChevronDown, ChevronUp, Contact, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import CompanyLogoUpload from "@/components/CompanyLogoUpload";
import { Switch } from "@/components/ui/switch";

export default function ClientCompanies() {
  const { isManager, isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [isFeaturesDialogOpen, setIsFeaturesDialogOpen] = useState(false);
  const [managingFeaturesCompany, setManagingFeaturesCompany] = useState(null);
  const [features, setFeatures] = useState({
    emailIntegration: false,
    reports: true,
    clientCompanies: false,
    customBranding: false,
    apiAccess: false
  });
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    industry: "",
    notes: "",
    features: { ticketing: true }, // Default features
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Super Admin and Admin see all companies, Managers see only client companies
      const isAdmin = isSuperAdmin || user?.role === 'admin';
      const params = isAdmin ? {} : { type: 'client-company' };
      const response = await api.getCompanies(params);
      setCompanies(response.data.companies);
    } catch (error) {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100"
    };
    return (
      <Badge className={styles[status] || styles.active}>
        {status || 'active'}
      </Badge>
    );
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.domain && company.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.updateCompany(editingCompany._id, formData);
        toast.success("Company updated successfully");
      } else {
        await api.createCompany(formData);
        toast.success("Company created successfully");
      }
      fetchCompanies();
      resetForm();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      domain: company.domain || "",
      industry: company.industry || "",
      industry: company.industry || "",
      notes: company.notes || "",
      features: company.features || { ticketing: true },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await api.deleteCompany(companyId);
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error) {
      toast.error(error.message || "Failed to delete company");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", domain: "", industry: "", notes: "" });
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

  const handleLogoUpdate = async (logoData) => {
    if (!editingCompany) return;

    try {
      await api.updateCompany(editingCompany._id, { logo: logoData });
      toast.success("Logo updated successfully");
      fetchCompanies();
      // Update the editing company to reflect the change
      setEditingCompany({ ...editingCompany, logo: logoData });
    } catch (error) {
      throw new Error(error.message || "Failed to update logo");
    }
  };

  const toggleExpanded = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const handleManageFeatures = (company) => {
    setManagingFeaturesCompany(company);
    setFeatures(company.features || {
      emailIntegration: false,
      reports: true,
      clientCompanies: false,
      customBranding: false,
      apiAccess: false
    });
    setIsFeaturesDialogOpen(true);
  };

  const handleFeatureToggle = (featureName) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
  };

  const handleSaveFeatures = async () => {
    try {
      await api.updateCompanyFeatures(managingFeaturesCompany._id, features);
      toast.success("Features updated successfully");
      fetchCompanies();
      setIsFeaturesDialogOpen(false);
      setManagingFeaturesCompany(null);
    } catch (error) {
      toast.error(error.message || "Failed to update features");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdminAccess = isManager || isSuperAdmin || user?.role === 'admin';
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Companies</h1>
          <p className="text-muted-foreground">
            Manage companies and view their ticket history
          </p>
        </div>
        {isAdminAccess && (
          <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {editingCompany ? "Edit Company" : "Add New Company"}
                </SheetTitle>
                <SheetDescription>
                  {editingCompany
                    ? "Manage company details, feature settings, and branding."
                    : "Create a new client company in the system."}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    {editingCompany && <TabsTrigger value="branding">Branding</TabsTrigger>}
                  </TabsList>

                  <form id="company-form" onSubmit={handleSubmit}>
                    <TabsContent value="details" className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Acme Corporation"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                          id="domain"
                          value={formData.domain}
                          onChange={(e) =>
                            setFormData({ ...formData, domain: e.target.value })
                          }
                          placeholder="acme.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          value={formData.industry}
                          onChange={(e) =>
                            setFormData({ ...formData, industry: e.target.value })
                          }
                          placeholder="Technology"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Internal notes about this client..."
                          rows={4}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 py-4">
                      <div className="rounded-lg border p-4 space-y-4">
                        <div>
                          <h4 className="font-medium">Feature Management</h4>
                          <p className="text-sm text-muted-foreground">Toggle specific features for this company.</p>
                        </div>
                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-ticketing" className="text-base">Ticketing System</Label>
                            <p className="text-xs text-muted-foreground">Allow users to create and manage support tickets.</p>
                          </div>
                          <Switch
                            id="feature-ticketing"
                            checked={formData.features?.ticketing ?? true}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, ticketing: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-knowledgebase" className="text-base">Knowledge Base</Label>
                            <p className="text-xs text-muted-foreground">Enable self-service documentation and articles.</p>
                          </div>
                          <Switch
                            id="feature-knowledgebase"
                            checked={formData.features?.knowledgeBase ?? true}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, knowledgeBase: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-livechat" className="text-base">Live Chat</Label>
                            <p className="text-xs text-muted-foreground">Enable real-time chat support for customers.</p>
                          </div>
                          <Switch
                            id="feature-livechat"
                            checked={formData.features?.liveChat ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, liveChat: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-reports" className="text-base">Reports & Analytics</Label>
                            <p className="text-xs text-muted-foreground">Access to advanced reporting and analytics.</p>
                          </div>
                          <Switch
                            id="feature-reports"
                            checked={formData.features?.reports ?? true}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, reports: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-api" className="text-base">API Access</Label>
                            <p className="text-xs text-muted-foreground">Allow programmatic access via REST API.</p>
                          </div>
                          <Switch
                            id="feature-api"
                            checked={formData.features?.apiAccess ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, apiAccess: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-email-notifications" className="text-base">Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">Automated email updates for ticket status changes.</p>
                          </div>
                          <Switch
                            id="feature-email-notifications"
                            checked={formData.features?.emailNotifications ?? true}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, emailNotifications: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-sla" className="text-base">SLA Management</Label>
                            <p className="text-xs text-muted-foreground">Service Level Agreement tracking and enforcement.</p>
                          </div>
                          <Switch
                            id="feature-sla"
                            checked={formData.features?.slaManagement ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, slaManagement: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-custom-fields" className="text-base">Custom Fields</Label>
                            <p className="text-xs text-muted-foreground">Add company-specific fields to tickets.</p>
                          </div>
                          <Switch
                            id="feature-custom-fields"
                            checked={formData.features?.customFields ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, customFields: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-automation" className="text-base">Automation Rules</Label>
                            <p className="text-xs text-muted-foreground">Automated ticket routing and responses.</p>
                          </div>
                          <Switch
                            id="feature-automation"
                            checked={formData.features?.automationRules ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, automationRules: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-file-attachments" className="text-base">File Attachments</Label>
                            <p className="text-xs text-muted-foreground">Allow uploading files to tickets (with size limits).</p>
                          </div>
                          <Switch
                            id="feature-file-attachments"
                            checked={formData.features?.fileAttachments ?? true}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, fileAttachments: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-time-tracking" className="text-base">Time Tracking</Label>
                            <p className="text-xs text-muted-foreground">Log time spent on tickets for billing and reporting.</p>
                          </div>
                          <Switch
                            id="feature-time-tracking"
                            checked={formData.features?.timeTracking ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, timeTracking: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-ai-suggestions" className="text-base">AI-Powered Suggestions</Label>
                            <p className="text-xs text-muted-foreground">Smart reply recommendations and automated insights.</p>
                          </div>
                          <Switch
                            id="feature-ai-suggestions"
                            checked={formData.features?.aiSuggestions ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, aiSuggestions: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-custom-branding" className="text-base">Custom Branding</Label>
                            <p className="text-xs text-muted-foreground">White-label the support portal with company branding.</p>
                          </div>
                          <Switch
                            id="feature-custom-branding"
                            checked={formData.features?.customBranding ?? false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, customBranding: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="feature-data-export" className="text-base">Data Export</Label>
                            <p className="text-xs text-muted-foreground">Bulk export of tickets, reports, and analytics data.</p>
                          </div>
                          <Switch
                            id="feature-data-export"
                            checked={formData.features?.dataExport ?? true}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...formData.features, dataExport: checked };
                              setFormData({ ...formData, features: newFeatures });
                            }}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-4 py-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Company Logo</h4>
                          <p className="text-sm text-muted-foreground">Upload a logo to personalize the portal for this client.</p>
                        </div>
                        {editingCompany && (
                          <CompanyLogoUpload
                            company={editingCompany}
                            onLogoUpdate={handleLogoUpdate}
                          />
                        )}
                      </div>
                    </TabsContent>

                    <SheetFooter className="mt-4 sm:justify-end">
                      <SheetClose asChild>
                        <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                      </SheetClose>
                      <Button type="submit">
                        {editingCompany ? "Save Changes" : "Create Company"}
                      </Button>
                    </SheetFooter>
                  </form>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCompanies.map((company) => {
              const isExpanded = expandedCompany === company._id;
              const hasClientCompanies = company.clientCompanies && company.clientCompanies.length > 0;

              return (
                <Collapsible
                  key={company._id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(company._id)}
                >
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{company.name}</p>
                            {company.type === 'main-company' && (
                              <Badge variant="outline" className="text-xs">Main</Badge>
                            )}
                            {hasClientCompanies && (
                              <Badge variant="secondary" className="text-xs">
                                {company.clientCompanies.length} {company.clientCompanies.length === 1 ? 'Client' : 'Clients'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {company.domain} • {company.industry}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {/* Company Statistics */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Ticket className="h-4 w-4" />
                            <span>{company.ticketCount || 0} tickets</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{company.agentCount || 0} agents</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Contact className="h-4 w-4" />
                            <span>{company.contactCount || 0} contacts</span>
                          </div>
                          <Badge
                            variant={company.status === "active" ? "default" : "secondary"}
                          >
                            {company.status}
                          </Badge>
                        </div>
                      </div>
                      {isAdminAccess && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(company)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {isSuperAdmin && (
                              <DropdownMenuItem onClick={() => handleManageFeatures(company)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Features
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(company._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <CollapsibleContent>
                      <div className="border-t p-4 bg-muted/30">
                        {/* Show client companies if this is a main company */}
                        {hasClientCompanies ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Client Companies</h4>
                            {company.clientCompanies.map((clientCompany) => (
                              <div key={clientCompany._id} className="bg-background border rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm">{clientCompany.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {clientCompany.domain} • {clientCompany.industry}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1" title="Tickets">
                                        <Ticket className="h-3 w-3" />
                                        <span>{clientCompany.ticketCount || 0}</span>
                                      </div>
                                      <div className="flex items-center gap-1" title="Agents">
                                        <Headphones className="h-3 w-3" />
                                        <span>{clientCompany.agentCount || 0}</span>
                                      </div>
                                      <div className="flex items-center gap-1" title="Contacts">
                                        <Users className="h-3 w-3" />
                                        <span>{clientCompany.contactCount || 0}</span>
                                      </div>
                                    </div>
                                    <Badge
                                      variant={clientCompany.status === "active" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {clientCompany.status}
                                    </Badge>
                                  </div>
                                  {isAdminAccess && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(clientCompany)}>
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDelete(clientCompany._id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <CompanyTicketHistory companyName={company.name} />
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
            {filteredCompanies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No companies found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Management Dialog */}
      <Dialog open={isFeaturesDialogOpen} onOpenChange={setIsFeaturesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Features - {managingFeaturesCompany?.name}</DialogTitle>
            <DialogDescription>
              Enable or disable features for this company
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailIntegration">Email Integration</Label>
                <p className="text-sm text-muted-foreground">Send/receive tickets via email</p>
              </div>
              <Switch
                id="emailIntegration"
                checked={features.emailIntegration}
                onCheckedChange={() => handleFeatureToggle('emailIntegration')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reports">Reports & Analytics</Label>
                <p className="text-sm text-muted-foreground">Advanced reporting dashboard</p>
              </div>
              <Switch
                id="reports"
                checked={features.reports}
                onCheckedChange={() => handleFeatureToggle('reports')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="clientCompanies">Client Companies</Label>
                <p className="text-sm text-muted-foreground">Sub-company management</p>
              </div>
              <Switch
                id="clientCompanies"
                checked={features.clientCompanies}
                onCheckedChange={() => handleFeatureToggle('clientCompanies')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="customBranding">Custom Branding</Label>
                <p className="text-sm text-muted-foreground">Company logo and branding</p>
              </div>
              <Switch
                id="customBranding"
                checked={features.customBranding}
                onCheckedChange={() => handleFeatureToggle('customBranding')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="apiAccess">API Access</Label>
                <p className="text-sm text-muted-foreground">REST API for integrations</p>
              </div>
              <Switch
                id="apiAccess"
                checked={features.apiAccess}
                onCheckedChange={() => handleFeatureToggle('apiAccess')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsFeaturesDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveFeatures}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

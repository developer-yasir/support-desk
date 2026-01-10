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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import CompanyLogoUpload from "@/components/CompanyLogoUpload";
import { Switch } from "@/components/ui/switch";

export default function ClientCompanies() {
  const { isManager, isSuperAdmin } = useAuth();
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
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Super Admin sees all companies, Managers see only client companies
      const params = isSuperAdmin ? {} : { type: 'client-company' };
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
      notes: company.notes || "",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Companies</h1>
          <p className="text-muted-foreground">
            Manage companies and view their ticket history
          </p>
        </div>
        {isManager && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Edit Company" : "Add New Company"}
                </DialogTitle>
                <DialogDescription>
                  {editingCompany
                    ? "Update company information"
                    : "Create a new client company"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
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
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>

                  {/* Logo Upload - Only for editing existing companies */}
                  {editingCompany && (
                    <div className="pt-2 border-t">
                      <CompanyLogoUpload
                        company={editingCompany}
                        onLogoUpdate={handleLogoUpdate}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCompany ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                          <p className="font-medium">{company.name}</p>
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
                      {isManager && (
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
                      <div className="border-t px-4 py-4 bg-muted/30">
                        <CompanyTicketHistory companyName={company.name} />
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

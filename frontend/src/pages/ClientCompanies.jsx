import { useState, useEffect, useCallback } from "react";
import CompanyTicketHistory from "@/components/CompanyTicketHistory";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, Building2, Users, Pencil, Trash2, MoreHorizontal, 
  Ticket, ChevronDown, ChevronUp, Contact, Settings, Headphones, 
  LayoutGrid, List, ArrowUpRight, Globe, Inbox, ExternalLink,
  ChevronRight
} from "lucide-react";
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
  Sheet, SheetContent, SheetDescription, SheetHeader, 
  SheetTitle, SheetTrigger, SheetFooter, SheetClose 
} from "@/components/ui/sheet";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import CompanyLogoUpload from "@/components/CompanyLogoUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ChevronLeft } from "lucide-react";
import { CompaniesSkeleton } from "@/components/ui/page-skeletons";

export default function ClientCompanies() {
  const { isManager, isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 8 });
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
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

  const fetchCompanies = useCallback(async (overrides = {}) => {
    const nextPage = overrides.page ?? pagination.page;
    const nextLimit = overrides.limit ?? pagination.limit;
    const nextSearch = overrides.searchQuery ?? searchQuery;

    try {
      // Super Admin and Admin see all companies, Managers see only client companies
      const isAdmin = isSuperAdmin || user?.role === 'admin';
      const params = {
        page: nextPage,
        limit: nextLimit,
        search: nextSearch.trim(),
        ...(isAdmin ? {} : { type: 'client-company' }),
      };
      const response = await api.getCompanies(params);
      const companiesData = response.data.companies || [];
      setCompanies(companiesData);
      if (response.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination({
          total: companiesData.length,
          page: nextPage,
          pages: 1,
          limit: nextLimit,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, searchQuery, isSuperAdmin, user?.role]);

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
    };
    return (
      <Badge variant="outline" className={styles[status] || styles.active}>
        <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${status === 'inactive' ? 'bg-gray-400' : 'bg-green-500'}`} />
        {status || 'active'}
      </Badge>
    );
  };

  const filteredCompanies = companies;

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
    setFormData({ name: "", domain: "", industry: "", notes: "", features: { ticketing: true } });
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

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
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
    return <CompaniesSkeleton />;
  }

  const isAdminAccess = isManager || isSuperAdmin || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Client Companies
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your client portfolio, view engagement metrics, and configure features.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border mr-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
            {isAdminAccess && (
              <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <SheetTrigger asChild>
                  <Button onClick={() => resetForm()} className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Company
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
                              <h4 className="font-medium">Module Preferences</h4>
                              <p className="text-sm text-muted-foreground">Enable specific modules for this company.</p>
                            </div>
                            <Separator />
                            
                            <div className="space-y-6">
                              {[
                                { id: "ticketing", label: "Ticketing System", desc: "Core support ticket lifecycle management." },
                                { id: "knowledgeBase", label: "Knowledge Base", desc: "Self-service documentation and articles." },
                                { id: "reports", label: "Reports", desc: "Access to analytics and performance metrics." },
                                { id: "apiAccess", label: "REST API", desc: "Programmatic access for integrations." },
                                { id: "customBranding", label: "Branding", desc: "White-label support portal experience." },
                              ].map((f) => (
                                <div key={f.id} className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label htmlFor={`feature-${f.id}`} className="text-base">{f.label}</Label>
                                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                                  </div>
                                  <Switch
                                    id={`feature-${f.id}`}
                                    checked={formData.features?.[f.id] ?? true}
                                    onCheckedChange={(checked) => {
                                      const newFeatures = { ...formData.features, [f.id]: checked };
                                      setFormData({ ...formData, features: newFeatures });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="branding" className="space-y-4 py-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Company Identity</h4>
                              <p className="text-sm text-muted-foreground">Upload a logo to personalize the portal.</p>
                            </div>
                            {editingCompany && (
                              <CompanyLogoUpload
                                company={editingCompany}
                                onLogoUpdate={handleLogoUpdate}
                              />
                            )}
                          </div>
                        </TabsContent>

                        <SheetFooter className="mt-8 pt-6 border-t">
                          <SheetClose asChild>
                            <Button type="button" variant="ghost">Cancel</Button>
                          </SheetClose>
                          <Button type="submit" className="shadow-sm">
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
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Building2 className="h-16 w-16" />
            </div>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Clients</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-extrabold">{companies.length}</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/5 border-orange-500/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Ticket className="h-16 w-16" />
            </div>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Active Tickets</p>
                <p className="text-3xl font-extrabold mt-1">
                  {companies.reduce((acc, c) => acc + (c.ticketCount || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Contact className="h-16 w-16" />
            </div>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Contacts</p>
                <p className="text-3xl font-extrabold mt-1">
                  {companies.reduce((acc, c) => acc + (c.contactCount || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-indigo-500/5 border-indigo-500/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Users className="h-16 w-16" />
            </div>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Agents</p>
                <p className="text-3xl font-extrabold mt-1">
                  {companies.reduce((acc, c) => acc + (c.agentCount || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-xl border-muted/40 overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find a company, domain, or industry..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 bg-background focus-visible:ring-primary shadow-inner"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-muted/20">
                <Building2 className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold">No matches found</h3>
              <p className="text-muted-foreground max-w-xs mt-2 text-balance">
                {searchQuery
                  ? `We couldn't find any results for "${searchQuery}". Try a different term.`
                  : "Your client list is currently empty."}
              </p>
              {!searchQuery && isAdminAccess && (
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-8 px-8">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Company
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCompanies.map((company) => (
                <Card key={company._id} className="group overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 bg-card">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 border-2 border-transparent group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-300 overflow-hidden shadow-sm">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="h-12 w-12 object-contain" />
                          ) : (
                            <Building2 className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-all duration-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-xl leading-snug truncate group-hover:text-primary transition-colors">
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter h-5">
                              {company.industry || "General"}
                            </Badge>
                            {company.domain && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                <Globe className="h-3 w-3" />
                                {company.domain}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted opacity-40 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2">
                          <DropdownMenuItem onClick={() => handleEdit(company)} className="h-10 border-none rounded-md">
                            <Pencil className="mr-3 h-4 w-4 text-blue-500" /> <span className="font-semibold">Modify Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageFeatures(company)} className="h-10 border-none rounded-md">
                            <Settings className="mr-3 h-4 w-4 text-orange-500" /> <span className="font-semibold">Toggle Features</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="h-10 text-destructive focus:text-destructive focus:bg-destructive/10 border-none rounded-md"
                            onClick={() => handleDelete(company._id)}
                          >
                            <Trash2 className="mr-3 h-4 w-4" /> <span className="font-semibold">Terminate Record</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { icon: Ticket, label: "Tickets", val: company.ticketCount || 0, color: "text-orange-600" },
                        { icon: Contact, label: "Users", val: company.contactCount || 0, color: "text-blue-600" },
                        { icon: Users, label: "Agents", val: company.agentCount || 0, color: "text-indigo-600" },
                      ].map((item) => (
                        <div key={item.label} className="bg-muted/30 rounded-xl p-2.5 transition-colors group-hover:bg-muted/50 border border-transparent group-hover:border-muted-foreground/10 text-center">
                          <div className="flex items-center justify-center mb-1">
                             <item.icon className={`h-3.5 w-3.5 ${item.color} opacity-70 group-hover:scale-110 transition-transform`} />
                          </div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{item.label}</p>
                          <p className="text-xl font-black tabular-nums">{item.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-muted-foreground/5 mt-auto">
                      {getStatusBadge(company.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(company._id)}
                        className="h-9 px-4 text-primary font-bold hover:bg-primary/5 rounded-full transition-all group/btn"
                      >
                        Insights
                        {expandedCompany === company._id ? (
                          <ChevronUp className="ml-2 h-4 w-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4 group-hover/btn:translate-y-0.5 transition-transform" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedCompany === company._id && (
                    <div className="border-t bg-muted/20 p-6 animate-in slide-in-from-top-4 duration-500">
                      <CompanyTicketHistory companyId={company._id} />
                      <div className="mt-6 flex justify-end">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="font-bold border-primary/20 hover:bg-primary/5 shadow-sm"
                           onClick={() => navigate(`/tickets?company=${company._id}`)}
                         >
                           Access Portal <ExternalLink className="ml-2 h-3 w-3" />
                         </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="border-t overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="w-[350px] font-black py-5 pl-8 text-xs uppercase tracking-widest">Client Identity</TableHead>
                    <TableHead className="font-black py-5 text-xs uppercase tracking-widest">Industry Segment</TableHead>
                    <TableHead className="text-center font-black py-5 text-xs uppercase tracking-widest">Metrics</TableHead>
                    <TableHead className="font-black py-5 text-xs uppercase tracking-widest">System Status</TableHead>
                    <TableHead className="text-right pr-8 font-black py-5 text-xs uppercase tracking-widest">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company._id} className="group transition-all hover:bg-muted/20 border-b border-muted/30">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border group-hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-inner">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="h-9 w-9 object-contain" />
                            ) : (
                              <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-base group-hover:text-primary transition-colors">{company.name}</div>
                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                              <Globe className="h-3 w-3" /> {company.domain || "no-domain.com"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="font-bold border-muted-foreground/20 bg-background/50">
                           {company.industry || "General"}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-6">
                           <div className="flex flex-col items-center">
                              <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Tickets</span>
                              <span className="text-lg font-black">{company.ticketCount || 0}</span>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Users</span>
                              <span className="text-lg font-black">{company.contactCount || 0}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-600 hover:bg-blue-500/10 rounded-xl" onClick={() => handleEdit(company)}>
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-orange-600 hover:bg-orange-500/10 rounded-xl" onClick={() => handleManageFeatures(company)}>
                            <Settings className="h-5 w-5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="p-1">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 h-10 px-4 font-bold"
                                onClick={() => handleDelete(company._id)}
                              >
                                <Trash2 className="mr-3 h-4 w-4" /> Terminate Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )} of ${pagination.total}`
              : "0 companies"}
          </p>
          <Pagination className="w-auto ml-auto sm:ml-0">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      {/* Features Management Dialog */}
      <Dialog open={isFeaturesDialogOpen} onOpenChange={setIsFeaturesDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md shadow-2xl border-primary/10">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              Module Control
            </DialogTitle>
            <DialogDescription className="pt-2">
              Configure advanced capabilities for <span className="font-black text-foreground underline decoration-primary underline-offset-4">{managingFeaturesCompany?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6 max-h-[60vh] overflow-y-auto px-1">
            {[
              { id: "emailIntegration", label: "Email Bridge", desc: "Omnichannel ticket synchronization", icon: Inbox },
              { id: "reports", label: "Analytics Hub", desc: "Advanced performance visualization", icon: ArrowUpRight },
              { id: "clientCompanies", label: "Client Hierarchies", desc: "Sub-company management engine", icon: Building2 },
              { id: "customBranding", label: "White Labeling", desc: "Full visual identity customization", icon: Globe },
              { id: "apiAccess", label: "Developer API", desc: "Webhooks and REST endpoint access", icon: ExternalLink },
            ].map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <f.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={`feature-dialog-${f.id}`} className="font-black text-sm uppercase tracking-wider">{f.label}</Label>
                    <p className="text-[11px] text-muted-foreground font-medium">{f.desc}</p>
                  </div>
                </div>
                <Switch
                  id={`feature-dialog-${f.id}`}
                  checked={features[f.id]}
                  onCheckedChange={() => handleFeatureToggle(f.id)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="sm:justify-between border-t pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsFeaturesDialogOpen(false)} className="font-bold">
              Dismiss
            </Button>
            <Button type="button" onClick={handleSaveFeatures} className="shadow-lg shadow-primary/20 px-8 font-black uppercase tracking-widest text-xs">
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

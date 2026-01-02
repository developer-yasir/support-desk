import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Building2, Users, Pencil, Trash2, MoreHorizontal, Ticket, ChevronDown, ChevronUp } from "lucide-react";
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
import { COMPANIES as MOCK_COMPANIES, TICKETS, CONTACTS, STATUSES, PRIORITIES } from "@/data/mockData";

export default function ClientCompanies() {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(
    MOCK_COMPANIES.map((c) => ({
      ...c,
      status: "active",
      createdAt: "2024-01-15",
    }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    industry: "",
    notes: "",
  });

  // Get tickets for a company
  const getCompanyTickets = (companyId) => {
    return TICKETS.filter((ticket) => ticket.companyId === companyId);
  };

  // Get contacts for a company
  const getCompanyContacts = (companyId) => {
    return CONTACTS.filter((contact) => contact.companyId === companyId);
  };

  const getStatusBadge = (statusId) => {
    const status = STATUSES.find((s) => s.id === statusId);
    return status ? (
      <Badge className={status.color}>{status.label}</Badge>
    ) : null;
  };

  const getPriorityBadge = (priorityId) => {
    const priority = PRIORITIES.find((p) => p.id === priorityId);
    return priority ? (
      <Badge variant="outline" className={priority.color}>
        {priority.label}
      </Badge>
    ) : null;
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCompany) {
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id ? { ...c, ...formData } : c
        )
      );
      toast.success("Company updated successfully");
    } else {
      const newCompany = {
        id: `comp-${companies.length + 1}`,
        ...formData,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCompanies([...companies, newCompany]);
      toast.success("Company created successfully");
    }
    resetForm();
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      notes: company.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (companyId) => {
    setCompanies(companies.filter((c) => c.id !== companyId));
    toast.success("Company deleted successfully");
  };

  const resetForm = () => {
    setFormData({ name: "", domain: "", industry: "", notes: "" });
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

  const toggleExpanded = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

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
              const companyTickets = getCompanyTickets(company.id);
              const companyContacts = getCompanyContacts(company.id);
              const isExpanded = expandedCompany === company.id;

              return (
                <Collapsible
                  key={company.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(company.id)}
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
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{companyContacts.length} contacts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span>{companyTickets.length} tickets</span>
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
                            <DropdownMenuItem
                              onClick={() => handleDelete(company.id)}
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
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          Ticket History ({companyTickets.length})
                        </h4>
                        {companyTickets.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {companyTickets.map((ticket) => (
                                <TableRow
                                  key={ticket.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                                >
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{ticket.id}</p>
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {ticket.subject}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{ticket.customerName}</TableCell>
                                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No tickets found for this company
                          </p>
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
    </div>
  );
}

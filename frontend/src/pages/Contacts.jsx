import { useState, useEffect, useCallback } from "react";
import ContactTicketHistory from "@/components/ContactTicketHistory";
import { Plus, Search, Mail, Building2, Pencil, Trash2, MoreHorizontal, ChevronDown, ChevronUp, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ContactsSkeleton } from "@/components/ui/page-skeletons";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function Contacts() {
  const { isManager } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [expandedContact, setExpandedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "customer",
    jobTitle: "",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesRes = await api.getCompanies();
        setCompanies(companiesRes.data.companies || []);
      } catch (error) {
        toast.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, []);

  const fetchData = useCallback(async (overrides = {}) => {
    const nextPage = overrides.page ?? pagination.page;
    const nextLimit = overrides.limit ?? pagination.limit;
    const nextSearch = overrides.searchQuery ?? searchQuery;
    const nextCompanyFilter = overrides.companyFilter ?? companyFilter;

    try {
      setLoading(true);
      const usersRes = await api.getUsers({
        role: "customer,agent,company_manager",
        page: nextPage,
        limit: nextLimit,
        search: nextSearch.trim(),
        ...(nextCompanyFilter !== "all" ? { companyId: nextCompanyFilter } : {}),
      });

      const usersData = usersRes.data?.users || [];
      setContacts(usersData);

      if (usersRes.pagination) {
        const { page: currentPage, pages, total, limit } = usersRes.pagination;
        if (nextPage > pages) {
          setPagination((prev) => ({ ...prev, page: pages }));
          return;
        }
        setPagination({ total, page: currentPage, pages, limit });
      } else {
        setPagination({
          total: usersData.length,
          page: nextPage,
          pages: 1,
          limit: nextLimit,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [companyFilter, pagination.limit, pagination.page, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCompanyFilterChange = (value) => {
    setCompanyFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const filteredContacts = contacts;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await api.updateContact(editingContact._id, formData);
        toast.success("Contact updated successfully");
      } else {
        await api.createContact(formData);
        toast.success("Contact created successfully");
      }
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      company: contact.company?._id || "",
      role: contact.role || "customer",
      jobTitle: contact.jobTitle || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.deleteContact(contactId);
      toast.success("Contact deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const handlePromoteToAgent = async (contact) => {
    if (!window.confirm(`Are you sure you want to promote ${contact.name} to Agent?`)) return;
    try {
      await api.updateUser(contact._id, { role: 'agent' });
      toast.success(`${contact.name} promoted to Agent`);
      fetchData();
    } catch (error) {
      toast.error("Failed to promote user");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", company: "", role: "customer", jobTitle: "" });
    setEditingContact(null);
    setIsDialogOpen(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleExpanded = (contactId) => {
    setExpandedContact(expandedContact === contactId ? null : contactId);
  };

  if (loading) {
    return <ContactsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">
            Manage contacts and view their ticket history
          </p>
        </div>
        {isManager && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </DialogTitle>
                <DialogDescription>
                  {editingContact
                    ? "Update contact information"
                    : "Create a new contact"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 555-0100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Select
                      value={formData.company}
                      onValueChange={(value) =>
                        setFormData({ ...formData, company: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      placeholder="IT Manager"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingContact ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company._id} value={company._id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredContacts.map((contact) => {
              const isExpanded = expandedContact === contact._id;

              return (
                <Collapsible
                  key={contact._id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(contact._id)}
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
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{contact.name}</p>
                            <Badge variant={contact.role === 'agent' ? 'default' : (contact.role === 'company_manager' ? 'secondary' : 'outline')} className="text-xs h-5 px-1.5 capitalize">
                              {contact.role === 'company_manager' ? 'Manager' : contact.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                            {contact.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {contact.company.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{contact.jobTitle || contact.role}</span>
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
                            <DropdownMenuItem onClick={() => handleEdit(contact)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {contact.role === 'customer' && (
                              <DropdownMenuItem onClick={() => handlePromoteToAgent(contact)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Promote to Agent
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(contact._id)}
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
                        <ContactTicketHistory contactId={contact._id} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
            {filteredContacts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No contacts found</p>
              </div>
            )}
          </div>
        </CardContent>
        <div className="border-t px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )} of ${pagination.total}`
              : "0 contacts"}
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
    </div>
  );
}

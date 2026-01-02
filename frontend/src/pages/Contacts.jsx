import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Mail, Building2, Pencil, Trash2, MoreHorizontal, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CONTACTS as MOCK_CONTACTS, COMPANIES, TICKETS, STATUSES, PRIORITIES } from "@/data/mockData";

export default function Contacts() {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState(
    MOCK_CONTACTS.map((c) => ({ ...c, status: "active" }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [expandedContact, setExpandedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    role: "",
  });

  // Get tickets for a contact
  const getContactTickets = (contactId) => {
    return TICKETS.filter((ticket) => ticket.customerId === contactId);
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

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany =
      companyFilter === "all" || contact.companyId === companyFilter;
    return matchesSearch && matchesCompany;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const company = COMPANIES.find((c) => c.id === formData.companyId);

    if (editingContact) {
      setContacts(
        contacts.map((c) =>
          c.id === editingContact.id
            ? { ...c, ...formData, companyName: company?.name || "" }
            : c
        )
      );
      toast.success("Contact updated successfully");
    } else {
      const newContact = {
        id: String(contacts.length + 10),
        ...formData,
        companyName: company?.name || "",
        status: "active",
      };
      setContacts([...contacts, newContact]);
      toast.success("Contact created successfully");
    }
    resetForm();
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      companyId: contact.companyId,
      role: contact.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (contactId) => {
    setContacts(contacts.filter((c) => c.id !== contactId));
    toast.success("Contact deleted successfully");
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", companyId: "", role: "" });
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
                      value={formData.companyId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, companyId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANIES.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Title</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {COMPANIES.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
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
              const contactTickets = getContactTickets(contact.id);
              const isExpanded = expandedContact === contact.id;

              return (
                <Collapsible
                  key={contact.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(contact.id)}
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
                          <p className="font-medium">{contact.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contact.companyName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{contact.role}</span>
                          <div className="flex items-center gap-1">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span>{contactTickets.length} tickets</span>
                          </div>
                          <Badge
                            variant={contact.status === "active" ? "default" : "secondary"}
                          >
                            {contact.status}
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
                            <DropdownMenuItem onClick={() => handleEdit(contact)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(contact.id)}
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
                          Ticket History ({contactTickets.length})
                        </h4>
                        {contactTickets.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {contactTickets.map((ticket) => (
                                <TableRow
                                  key={ticket.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                                >
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{ticket.id}</p>
                                      <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                                        {ticket.subject}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                  <TableCell>
                                    {ticket.agentName || (
                                      <span className="text-muted-foreground">Unassigned</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No tickets found for this contact
                          </p>
                        )}
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
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Paperclip, FileText, Building2, Check, ChevronsUpDown, X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, PRIORITIES, CONTACTS as INITIAL_CONTACTS, COMPANIES, AGENTS } from "../data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TicketTemplatesDialog from "../components/tickets/TicketTemplatesDialog";

export default function CreateTicket() {
  const { user, isCustomer, isAgent } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [toOpen, setToOpen] = useState(false);
  const [ccOpen, setCcOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [newContactData, setNewContactData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    role: "",
  });

  // Check if search looks like an email
  const isEmail = (str) => str.includes("@");

  // Quick create contact from search
  const handleQuickCreateContact = () => {
    const searchTerm = contactSearch.trim();
    if (!searchTerm) return;

    const name = isEmail(searchTerm) ? searchTerm.split("@")[0] : searchTerm;
    const email = isEmail(searchTerm) ? searchTerm : "";

    setNewContactData({
      name: name,
      email: email,
      phone: "",
      companyId: "",
      role: "",
    });
    setContactOpen(false);
    setNewContactOpen(true);
  };

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
    contactId: isCustomer ? user?.id : "",
    companyId: "",
    companyName: "",
    agentId: "",
    toContacts: [],
    ccContacts: [],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddToContact = (contactId) => {
    if (!formData.toContacts.includes(contactId)) {
      setFormData((prev) => ({
        ...prev,
        toContacts: [...prev.toContacts, contactId],
      }));
    }
    setToOpen(false);
  };

  const handleRemoveToContact = (contactId) => {
    setFormData((prev) => ({
      ...prev,
      toContacts: prev.toContacts.filter((id) => id !== contactId),
    }));
  };

  const handleAddCcContact = (contactId) => {
    if (!formData.ccContacts.includes(contactId)) {
      setFormData((prev) => ({
        ...prev,
        ccContacts: [...prev.ccContacts, contactId],
      }));
    }
    setCcOpen(false);
  };

  const handleRemoveCcContact = (contactId) => {
    setFormData((prev) => ({
      ...prev,
      ccContacts: prev.ccContacts.filter((id) => id !== contactId),
    }));
  };

  const handleCreateNewContact = () => {
    if (!newContactData.name.trim() || !newContactData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const company = COMPANIES.find((c) => c.id === newContactData.companyId);
    const newContact = {
      id: `contact-${Date.now()}`,
      name: newContactData.name,
      email: newContactData.email,
      phone: newContactData.phone,
      companyId: newContactData.companyId,
      companyName: company?.name || "",
      role: newContactData.role,
    };

    setContacts((prev) => [...prev, newContact]);
    
    // Auto-select the new contact
    setFormData((prev) => ({
      ...prev,
      contactId: newContact.id,
      companyId: newContact.companyId,
      companyName: newContact.companyName,
    }));

    // Reset form and close dialog
    setNewContactData({ name: "", email: "", phone: "", companyId: "", role: "" });
    setNewContactOpen(false);
    toast.success(`Contact "${newContact.name}" created and selected`);
  };

  const handleContactChange = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setFormData((prev) => ({
        ...prev,
        contactId: contactId,
        companyId: contact.companyId,
        companyName: contact.companyName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contactId: contactId,
        companyId: "",
        companyName: "",
      }));
    }
  };

  const handleTemplateSelect = (template) => {
    setFormData((prev) => ({
      ...prev,
      subject: template.subject,
      description: template.description,
      category: template.category,
      priority: template.priority,
    }));
    toast.success(`Template "${template.name}" applied`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (isAgent && !formData.contactId) {
      toast.error("Please select a contact");
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Ticket created successfully!");
    navigate("/tickets");

    setLoading(false);
  };

  // Get company info for display
  const selectedCompany = formData.companyId 
    ? COMPANIES.find((c) => c.id === formData.companyId)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Ticket</h1>
          <p className="text-muted-foreground">
            Fill out the form below to submit a support request
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ticket Information</CardTitle>
                <CardDescription>
                  Provide details about your issue or request
                </CardDescription>
              </div>
              <TicketTemplatesDialog
                onSelect={handleTemplateSelect}
                trigger={
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Selection with Search - Only for agents */}
            {isAgent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact">Contact *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewContactOpen(true)}
                      className="h-auto py-1 px-2 text-primary"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      New Contact
                    </Button>
                  </div>
                  <Popover open={contactOpen} onOpenChange={setContactOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={contactOpen}
                        className="w-full justify-between font-normal"
                      >
                        {formData.contactId ? (
                          <span className="flex items-center gap-2">
                            <span>
                              {contacts.find((c) => c.id === formData.contactId)?.name}
                            </span>
                            <span className="text-muted-foreground">
                              ({contacts.find((c) => c.id === formData.contactId)?.email})
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Search contacts...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Search by name, email, or company..." 
                          value={contactSearch}
                          onValueChange={setContactSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="py-2 px-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                No contact found for "{contactSearch}"
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={handleQuickCreateContact}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create "{contactSearch}"
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {contacts
                              .filter((contact) => {
                                if (!contactSearch) return true;
                                const search = contactSearch.toLowerCase();
                                return (
                                  contact.name.toLowerCase().includes(search) ||
                                  contact.email.toLowerCase().includes(search) ||
                                  contact.companyName?.toLowerCase().includes(search)
                                );
                              })
                              .map((contact) => (
                              <CommandItem
                                key={contact.id}
                                value={`${contact.name} ${contact.email} ${contact.companyName}`}
                                onSelect={() => {
                                  handleContactChange(contact.id);
                                  setContactOpen(false);
                                  setContactSearch("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.contactId === contact.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{contact.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {contact.email} • {contact.companyName}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Auto-filled Company Info */}
                {selectedCompany && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedCompany.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCompany.domain} • {selectedCompany.industry}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* To Field - Multi-select contacts */}
            {isAgent && (
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.toContacts.map((contactId) => {
                    const contact = contacts.find((c) => c.id === contactId);
                    return contact ? (
                      <Badge key={contactId} variant="secondary" className="gap-1 pr-1">
                        {contact.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveToContact(contactId)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Popover open={toOpen} onOpenChange={setToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      <span className="text-muted-foreground">Add recipients...</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search contacts..." />
                      <CommandList>
                        <CommandEmpty>No contact found.</CommandEmpty>
                        <CommandGroup>
                          {contacts.filter((c) => !formData.toContacts.includes(c.id)).map((contact) => (
                            <CommandItem
                              key={contact.id}
                              value={`${contact.name} ${contact.email}`}
                              onSelect={() => handleAddToContact(contact.id)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{contact.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {contact.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* CC Field - Multi-select contacts */}
            {isAgent && (
              <div className="space-y-2">
                <Label>CC</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.ccContacts.map((contactId) => {
                    const contact = contacts.find((c) => c.id === contactId);
                    return contact ? (
                      <Badge key={contactId} variant="outline" className="gap-1 pr-1">
                        {contact.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCcContact(contactId)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Popover open={ccOpen} onOpenChange={setCcOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      <span className="text-muted-foreground">Add CC recipients...</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search contacts..." />
                      <CommandList>
                        <CommandEmpty>No contact found.</CommandEmpty>
                        <CommandGroup>
                          {contacts.filter((c) => !formData.ccContacts.includes(c.id)).map((contact) => (
                            <CommandItem
                              key={contact.id}
                              value={`${contact.name} ${contact.email}`}
                              onSelect={() => handleAddCcContact(contact.id)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{contact.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {contact.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief summary of your issue"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Assignment - Only for agents/admins */}
            {isAgent && (
              <div className="space-y-2">
                <Label htmlFor="agent">Assign To</Label>
                <Select
                  value={formData.agentId}
                  onValueChange={(value) => handleChange("agentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {AGENTS.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={6}
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 10MB
                </p>
                <Button variant="outline" size="sm" className="mt-4" type="button">
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/tickets">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* New Contact Dialog */}
      <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact and automatically select them for this ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Full Name *</Label>
              <Input
                id="newName"
                value={newContactData.name}
                onChange={(e) =>
                  setNewContactData({ ...newContactData, name: e.target.value })
                }
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email *</Label>
              <Input
                id="newEmail"
                type="email"
                value={newContactData.email}
                onChange={(e) =>
                  setNewContactData({ ...newContactData, email: e.target.value })
                }
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPhone">Phone</Label>
              <Input
                id="newPhone"
                value={newContactData.phone}
                onChange={(e) =>
                  setNewContactData({ ...newContactData, phone: e.target.value })
                }
                placeholder="+1 555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCompany">Company</Label>
              <Select
                value={newContactData.companyId}
                onValueChange={(value) =>
                  setNewContactData({ ...newContactData, companyId: value })
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
              <Label htmlFor="newRole">Role / Title</Label>
              <Input
                id="newRole"
                value={newContactData.role}
                onChange={(e) =>
                  setNewContactData({ ...newContactData, role: e.target.value })
                }
                placeholder="IT Manager"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNewContactData({ name: "", email: "", phone: "", companyId: "", role: "" });
                setNewContactOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateNewContact}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create & Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
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
import { CATEGORIES, PRIORITIES } from "../data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TicketTemplatesDialog from "../components/tickets/TicketTemplatesDialog";

export default function CreateTicket() {
  const { user, isCustomer, isAgent, isStaff } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [ccOpen, setCcOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);

  // State for dynamic data
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [agents, setAgents] = useState([]);

  const [newContactData, setNewContactData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    role: "",
  });

  const [companyOpen, setCompanyOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [contactsRes, companiesRes, agentsRes] = await Promise.all([
          api.getContacts(),
          api.getCompanies(),
          api.getAgents()
        ]);

        setContacts(contactsRes.data.users || []);
        setCompanies(companiesRes.data.companies || []);
        setAgents(agentsRes.data.users || []); // Assuming getAgents returns users with role='agent'
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if search looks like an email
  const isEmail = (str) => str.includes("@");

  // Auto-create contact without dialog
  const autoCreateContact = async (email, companyId, companyName) => {
    if (!email || !email.includes("@")) return null;
    try {
      const name = email.split("@")[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const res = await api.createContact({
        name,
        email,
        company: companyId,
        role: "customer"
      });
      const newContact = res.data.user;
      setContacts(prev => [...prev, newContact]);
      toast.success(`Auto-created contact for ${email}`);
      return newContact;
    } catch (err) {
      console.error("Auto-create failed:", err);
      toast.error(`Failed to auto-create contact for ${email}`);
      return null;
    }
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
    cc: [], // Can contain { type: 'user', id: string, email: string } or { type: 'company', id: string, name: string }
  });

  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Simple validation (10MB limit per file example)
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped (max 10MB limit)");
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCcEntity = async (entity) => {
    // entity: { type: 'user' | 'company' | 'email', value: string }

    let ccItem = null;
    if (entity.type === 'user') {
      const user = [...contacts, ...agents].find(u => u._id === entity.value);
      if (user) ccItem = { type: 'user', id: user._id, label: user.name, email: user.email };
    } else if (entity.type === 'company') {
      const company = companies.find(c => c._id === entity.value);
      if (company) ccItem = { type: 'company', id: company._id, label: company.name };
    } else if (entity.type === 'email') {
      // Auto-create for CC
      const newContact = await autoCreateContact(entity.value, formData.companyId);
      if (newContact) {
        ccItem = { type: 'user', id: newContact._id, label: newContact.name, email: newContact.email };
      }
    }

    if (ccItem && !formData.cc.some(item => (item.id && item.id === ccItem.id) || (item.email && item.email === ccItem.email))) {
      setFormData(prev => ({
        ...prev,
        cc: [...prev.cc, ccItem]
      }));
    }
    setCcOpen(false);
  };

  const handleRemoveCcItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      cc: prev.cc.filter((_, i) => i !== index),
    }));
  };

  const handleCreateNewContact = async () => {
    if (!newContactData.name.trim() || !newContactData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      const company = companies.find((c) => c._id === newContactData.companyId);

      const payload = {
        name: newContactData.name,
        email: newContactData.email,
        phone: newContactData.phone,
        company: newContactData.companyId, // Send ID to backend
        role: 'customer'
      };

      const res = await api.createContact(payload);
      const newContact = res.data.user;

      setContacts((prev) => [...prev, newContact]);

      // Auto-select the new contact
      setFormData((prev) => ({
        ...prev,
        contactId: newContact._id,
        companyId: newContact.company?._id || newContact.company || prev.companyId,
        companyName: company?.name || prev.companyName,
      }));

      // Reset form and close dialog
      setNewContactData({ name: "", email: "", phone: "", companyId: "", role: "" });
      setNewContactOpen(false);
      toast.success(`Contact "${newContact.name}" created and selected`);
    } catch (error) {
      console.error("Create contact error:", error);
      toast.error(error.message || "Failed to create contact");
    }
  };

  const handleCompanyChange = (companyId) => {
    const company = companies.find((c) => c._id === companyId);
    setFormData((prev) => {
      // Check if current contact belongs to the new company
      const currentContact = contacts.find(c => c._id === prev.contactId);
      const contactBelongsToCompany = currentContact && (
        currentContact.company?._id === companyId ||
        currentContact.company === companyId
      );

      return {
        ...prev,
        companyId: companyId,
        companyName: company?.name || "",
        // Clear contact if it doesn't belong to this company
        contactId: contactBelongsToCompany ? prev.contactId : ""
      };
    });
  };

  const handleContactChange = (contactId) => {
    const contact = contacts.find((c) => c._id === contactId);
    if (contact) {
      const companyId = contact.company?._id || contact.company;
      const company = companies.find(c => c._id === companyId);

      setFormData((prev) => ({
        ...prev,
        contactId: contactId,
        companyId: companyId || prev.companyId, // Prefer contact's company, but keep existing if undefined (though contact should have company)
        companyName: company?.name || prev.companyName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contactId: contactId,
        // Don't clear company when clearing contact, user might want to select another contact from same company
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

    try {
      const formDataToSend = new FormData();

      // Append simple fields
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      if (formData.companyId) {
        const company = companies.find(c => c._id === formData.companyId);
        if (company) formDataToSend.append('company', company.name);
      }
      if (isStaff && formData.contactId) formDataToSend.append('createdBy', formData.contactId);

      // Append CC Entities
      formData.cc.forEach(item => {
        if (item.type === 'user') {
          formDataToSend.append('cc', item.email);
        } else if (item.type === 'company') {
          formDataToSend.append('cc', item.label); // Send company name
        }
      });

      // Append attachments
      attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      await api.createTicket(formDataToSend);

      toast.success("Ticket created successfully!");
      navigate("/tickets");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  // Get company info for display (Only show if we didn't just select it in the dropdown to avoid redundancy, 
  // currently we are showing the dropdown so maybe we don't need this info box anymore? 
  // actually keeping it is fine as it shows extra details like domain/industry)
  const selectedCompany = formData.companyId
    ? companies.find((c) => c._id === formData.companyId)
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
            {isStaff && (
              <div className="space-y-4">

                {/* Company Selection */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={companyOpen}
                        className="w-full justify-between font-normal"
                        disabled={dataLoading}
                      >
                        {formData.companyId ? (
                          companies.find((c) => c._id === formData.companyId)?.name || "Select company"
                        ) : (
                          "Select company (Optional)"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search company..." />
                        <CommandList>
                          <CommandEmpty>No company found.</CommandEmpty>
                          <CommandGroup>
                            {companies
                              .filter((company) => {
                                // Filter: Show own company or client companies that belong to user's company
                                if (user.company?._id) {
                                  const userCompanyId = user.company._id;
                                  return company._id === userCompanyId || (company.parentCompany === userCompanyId || (company.parentCompany?._id === userCompanyId));
                                }
                                return true; // Fallback for Superadmins or if company not loaded
                              })
                              .map((company) => (
                                <CommandItem
                                  key={company._id}
                                  value={company.name}
                                  onSelect={() => {
                                    handleCompanyChange(company._id);
                                    setCompanyOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.companyId === company._id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {company.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact">From (Requester) *</Label>
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
                        disabled={dataLoading}
                      >
                        {formData.contactId ? (
                          <span className="flex items-center gap-2">
                            <span>
                              {contacts.find((c) => c._id === formData.contactId)?.name}
                            </span>
                            <span className="text-muted-foreground">
                              ({contacts.find((c) => c._id === formData.contactId)?.email})
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {dataLoading ? "Loading contacts..." : "Search contacts..."}
                          </span>
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
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              const val = contactSearch.trim();
                              if (isEmail(val)) {
                                const newContact = await autoCreateContact(val, formData.companyId);
                                if (newContact) {
                                  handleContactChange(newContact._id);
                                  setContactOpen(false);
                                  setContactSearch("");
                                }
                              }
                            }
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="py-2 px-2 text-sm text-muted-foreground">
                              {contacts.length === 0 ? "No contacts available." :
                                `No contact found for "${contactSearch}"`
                              }
                              {contactSearch && isEmail(contactSearch) && " Press Enter to create automatically."}
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {contacts
                              .filter((contact) => {
                                // Filter by selected company if preset (unless searching)
                                if (formData.companyId && !contactSearch) {
                                  const cId = contact.company?._id || contact.company;
                                  if (cId !== formData.companyId) return false;
                                }

                                if (!contactSearch) return true;
                                const search = contactSearch.toLowerCase();
                                return (
                                  contact.name?.toLowerCase().includes(search) ||
                                  contact.email?.toLowerCase().includes(search) ||
                                  contact.company?.name?.toLowerCase().includes(search)
                                );
                              })
                              .map((contact) => (
                                <CommandItem
                                  key={contact._id}
                                  value={`${contact.name} ${contact.email} ${contact.company?.name}`}
                                  onSelect={() => {
                                    handleContactChange(contact._id);
                                    setContactOpen(false);
                                    setContactSearch("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.contactId === contact._id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{contact.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {contact.email} • {contact.company?.name || 'No Company'}
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

                {/* Auto-filled Company Info - Keep it for confirm visual */}
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

            {/* CC Field - Multi-select companies, agents, or new emails */}
            {isStaff && (
              <div className="space-y-2">
                <Label>CC</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.cc.map((item, index) => (
                    <Badge key={index} variant="outline" className="gap-1 pr-1">
                      {item.type === 'company' && <Building2 className="h-3 w-3 mr-1 opacity-70" />}
                      {item.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveCcItem(index)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover open={ccOpen} onOpenChange={setCcOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      <span className="text-muted-foreground">Add CC (Company, Agent, or Email)...</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search or enter email..."
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (isEmail(val)) {
                              await handleAddCcEntity({ type: 'email', value: val });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 text-sm text-muted-foreground">
                            No results. Enter an email and press Enter to add.
                          </div>
                        </CommandEmpty>
                        <CommandGroup heading="Companies">
                          {companies
                            .filter(company => {
                              if (!user.company?._id) return true;
                              const userCompanyId = user.company._id;
                              return company._id === userCompanyId || (company.parentCompany === userCompanyId || company.parentCompany?._id === userCompanyId);
                            })
                            .map((company) => (
                              <CommandItem
                                key={company._id}
                                value={company.name}
                                onSelect={() => handleAddCcEntity({ type: 'company', value: company._id })}
                              >
                                <Building2 className="mr-2 h-4 w-4 opacity-70" />
                                {company.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Agents">
                          {agents
                            .filter(agent => {
                              if (!user.company?._id) return true;
                              const userCompanyId = user.company._id;
                              const agentCompanyId = agent.company?._id || agent.company;
                              return agentCompanyId === userCompanyId;
                            })
                            .map((agent) => (
                              <CommandItem
                                key={agent._id}
                                value={agent.name}
                                onSelect={() => handleAddCcEntity({ type: 'user', value: agent._id })}
                              >
                                {agent.name} ({agent.email})
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Contacts">
                          {contacts
                            .filter(contact => {
                              if (!user.company?._id) return true;
                              const userCompanyId = user.company._id;
                              const contactCompanyId = contact.company?._id || contact.company;
                              const contactCompany = companies.find(c => c._id === contactCompanyId);

                              return contactCompanyId === userCompanyId ||
                                (contactCompany && (contactCompany.parentCompany === userCompanyId || contactCompany.parentCompany?._id === userCompanyId));
                            })
                            .map((contact) => (
                              <CommandItem
                                key={contact._id}
                                value={contact.name}
                                onSelect={() => handleAddCcEntity({ type: 'user', value: contact._id })}
                              >
                                {contact.name} ({contact.email})
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
            {isStaff && (
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
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  type="button"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Browse Files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>

              {/* Selected Files List */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="truncate max-w-[80%]">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
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
    </div >
  );
}

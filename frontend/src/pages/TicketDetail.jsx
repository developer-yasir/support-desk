import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api, API_URL } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Reply,
  FileText,
  Forward,
  CheckCircle,
  Merge,
  Trash2,
  MoreHorizontal,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  Paperclip,
  Send,
  Zap,
  LayoutGrid,
  Settings,
  Printer,
  Timer,
  Calendar,
  Eye,
} from "lucide-react";
import { TICKETS, STATUSES, PRIORITIES, AGENTS, CATEGORIES, CANNED_RESPONSES } from "../data/mockData";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CannedResponsesDialog from "../components/tickets/CannedResponsesDialog";
import TimeTracker from "../components/tickets/TimeTracker";
import CollisionDetector from "../components/tickets/CollisionDetector";
import { useAgentSignature, AgentSignatureSettings, SignaturePreview } from "../components/tickets/AgentSignature";
import ForwardTicketDialog from "../components/tickets/ForwardTicketDialog";
import { TicketRecipientSelector } from "../components/tickets/TicketRecipientSelector";

// Avatar colors based on name initial
const getAvatarColor = (name) => {
  const colors = [
    "bg-orange-400",
    "bg-teal-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-red-400",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const PriorityIndicator = ({ priority }) => {
  const config = {
    low: { color: "bg-green-500", label: "Low" },
    medium: { color: "bg-yellow-500", label: "Medium" },
    high: { color: "bg-orange-500", label: "High" },
    urgent: { color: "bg-red-500", label: "Urgent" },
  };
  const { color, label } = config[priority] || config.low;

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
};

const GROUPS = [
  { id: "customer-support", label: "Customer Support" },
  { id: "technical", label: "Technical" },
  { id: "billing", label: "Billing" },
  { id: "sales", label: "Sales" },
];

import FilePreviewModal from "@/components/FilePreviewModal"; // Import modal

export default function TicketDetail() {
  const { id } = useParams();
  const { user, isAgent } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // Preview state
  const [to, setTo] = useState([]); // Changed to array
  const [cc, setCc] = useState([]); // Changed to array
  const [allContacts, setAllContacts] = useState([]); // Cache for contacts
  const [suggestedContacts, setSuggestedContacts] = useState([]);

  const { signature, appendSignature } = useAgentSignature(user?.id);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReplyBoxOpen, setIsReplyBoxOpen] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = React.useRef(null);
  const editorRef = React.useRef(null);

  // Auto-focus editor when opened
  useEffect(() => {
    if (isReplyBoxOpen) {
      // Small timeout to ensure editor is mounted and ready
      const timer = setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReplyBoxOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Load draft from local storage
  useEffect(() => {
    const draft = localStorage.getItem(`ticket_reply_draft_${id}`);
    if (draft) {
      setReplyContent(draft);
    }
  }, [id]);

  // Save draft to local storage
  useEffect(() => {
    if (replyContent) {
      localStorage.setItem(`ticket_reply_draft_${id}`, replyContent);
    } else {
      localStorage.removeItem(`ticket_reply_draft_${id}`);
    }
  }, [replyContent, id]);



  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const data = await api.getTicket(id);
        const fetchedTicket = data.data.ticket;

        // Map backend fields to frontend expected structure
        // Specifically map 'comments' to 'messages' if messages doesn't exist
        if (!fetchedTicket.messages && fetchedTicket.comments) {
          fetchedTicket.messages = fetchedTicket.comments.map(c => ({
            id: c._id,
            content: c.message,
            author: c.user?.name || "Unknown",
            authorId: c.user?._id,
            isInternal: c.isInternal,
            createdAt: c.createdAt,
            attachments: c.attachments || [] // Map attachments
          }));
        }

        // Ensure messages array exists
        fetchedTicket.messages = fetchedTicket.messages || [];

        // Map common backend fields to frontend expected props
        fetchedTicket.slaDeadline = fetchedTicket.dueDate || fetchedTicket.createdAt || new Date().toISOString();
        fetchedTicket.id = fetchedTicket._id;

        setTicket(fetchedTicket);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    // Fetch contacts for the recipient selector
    const fetchContacts = async () => {
      try {
        const [contactsRes, agentsRes] = await Promise.all([
          api.getContacts(), // Assuming this exists and returns { data: { users: [] } }
          api.getAgents()
        ]);
        // Combine and dedup
        const all = [...(contactsRes.data.users || []), ...(agentsRes.data.users || [])];
        // Simple dedup by email
        const unique = Array.from(new Map(all.map(item => [item.email, item])).values());
        setAllContacts(unique);
      } catch (e) {
        console.error("Failed to fetch contacts/agents", e);
      }
    };
    fetchContacts();
  }, [id]);

  // key effect to derive suggestions when ticket loads
  useEffect(() => {
    if (!ticket) return;

    const participants = new Map();

    // Add creator
    if (ticket.createdBy) participants.set(ticket.createdBy.email, ticket.createdBy);

    // Add assignee
    if (ticket.assignedTo) participants.set(ticket.assignedTo.email, ticket.assignedTo);

    // Add commenters
    if (ticket.messages) {
      ticket.messages.forEach(msg => {
        // We need email, but messages might only have author name?
        // Wait, message authorId usually links to user.
        // If we have access to user details from messages...
        // The message object in frontend is mapped: author, authorId. 
        // It doesn't have email directly in the mapped object.
        // We can try to find the user in allContacts if we have authorId?
        if (msg.authorId && allContacts.length > 0) {
          const user = allContacts.find(c => c._id === msg.authorId);
          if (user) participants.set(user.email, user);
        }
      });
    }

    setSuggestedContacts(Array.from(participants.values()));
  }, [ticket, allContacts]);

  // Controlled state for quick action dropdowns
  const [ticketStatus, setTicketStatus] = useState(ticket?.status || "open");
  const [ticketPriority, setTicketPriority] = useState(ticket?.priority || "medium");
  const [ticketAgent, setTicketAgent] = useState(ticket?.agentId || "unassigned");
  const [ticketGroup, setTicketGroup] = useState("customer-support");
  const [ticketType, setTicketType] = useState("");
  const [ticketCategory, setTicketCategory] = useState(ticket?.category || "");
  const [ticketCompany, setTicketCompany] = useState("");

  // Sync state when ticket changes
  useEffect(() => {
    if (ticket) {
      setTicketStatus(ticket.status);
      setTicketPriority(ticket.priority);
      setTicketAgent(ticket.assignedTo?._id || "unassigned");
      setTicketCategory(ticket.category || "");
      if (ticket.company) setTicketCompany(ticket.company);
    }
  }, [ticket]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Ticket not found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you are looking for does not exist.
        </p>
        <Button asChild>
          <Link to="/tickets">Back to Tickets</Link>
        </Button>
      </div>
    );
  }


  const handleReply = async () => {
    // Strip HTML tags to check if content is empty (ignoring empty p tags)
    const textContent = replyContent.replace(/<[^>]*>/g, "").trim();
    if (!textContent && attachments.length === 0) {
      toast.error("Please enter a reply or add an attachment");
      return;
    }

    try {
      // Append signature if enabled
      let finalMessage = replyContent;
      // Signature is now pre-filled, so we don't append it here to avoid duplication
      // if (!isInternal && signature?.enabled) {
      //   finalMessage = appendSignature(replyContent);
      // }

      const payload = new FormData();
      payload.append('message', finalMessage);
      payload.append('isInternal', isInternal);

      attachments.forEach(file => {
        payload.append('attachments', file);
      });

      // Append To and CC
      // Backend expects array or comma-separated. Let's send multiple fields if array.
      if (to && to.length > 0) {
        to.forEach(email => payload.append('to', email));
      }
      if (cc && cc.length > 0) {
        cc.forEach(email => payload.append('cc', email));
      }

      await api.addComment(id, payload);

      toast.success("Reply sent successfully");
      setReplyContent("");
      setAttachments([]);

      // Refresh ticket data to show new comment
      const data = await api.getTicket(id);
      const fetchedTicket = data.data.ticket;

      fetchedTicket.messages = fetchedTicket.comments?.map(c => ({
        id: c._id,
        content: c.message,
        author: c.user?.name || "Unknown",
        authorId: c.user?._id,
        isInternal: c.isInternal,
        createdAt: c.createdAt,
        attachments: c.attachments // Ensure attachments are mapped back to view
      })) || [];

      // Ensure other fields are preserved or updated
      fetchedTicket.slaDeadline = fetchedTicket.dueDate || fetchedTicket.createdAt;
      fetchedTicket.id = fetchedTicket._id;

      setTicket(fetchedTicket);

      // Clear draft
      localStorage.removeItem(`ticket_reply_draft_${id}`);
      setIsReplyBoxOpen(false);

    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply");
    }
    setIsInternal(false);
  };

  const handleCannedResponseSelect = (content) => {
    // Append to existing content
    setReplyContent((prev) => (prev ? prev + "<br/>" + content : content));
  };

  const handleTimeLogged = (seconds) => {
    console.log(`Logged ${seconds} seconds for ticket ${id}`);
  };

  const handleAddNote = () => {
    setIsInternal(true);
    setIsReplyBoxOpen(true);
    // Scroll to reply box? Maybe just opening is enough.
  };

  const handleCloseTicket = async () => {
    try {
      await api.updateTicket(id, { status: 'closed' });
      setTicket((prev) => ({ ...prev, status: 'closed' }));
      setTicketStatus('closed');
      toast.success("Ticket closed successfully");
    } catch (error) {
      console.error("Failed to close ticket:", error);
      toast.error("Failed to close ticket");
    }
  };

  const handleDeleteTicket = async () => {
    if (confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      try {
        await api.deleteTicket(id);
        toast.success("Ticket deleted successfully");
        // Redirect logic would need useNavigate, assuming it's available or we add it
        // Actually Link is imported, but useNavigate is not.
        // I need to add useNavigate import and hook.
        // For now let's just use window.location or assume useNavigate is next step.
        // Wait, useNavigate IS imported in line 2? Let me check file view.
        // Line 2: import { useParams, Link } from "react-router-dom"; -> useNavigate is MISSING.
        // I will add it in next step. For now leaving the call.
        window.location.href = "/tickets";
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        toast.error("Failed to delete ticket");
      }
    }
  };

  const handleForward = () => setIsForwardDialogOpen(true);
  const handleMerge = () => toast.info("Merging feature coming soon");

  // Sidebar actions
  const handleSettings = () => toast.info("Settings feature coming soon");
  const handlePrint = () => window.print();
  const handleTimer = () => setShowActivities(!showActivities); // Toggle for now
  const handleCalendar = () => toast.info("Use the 'Edit' button under Resolution Due to change date");

  const statusConfig = STATUSES.find((s) => s.id === ticket.status);
  const isOverdue =
    new Date(ticket.slaDeadline) < new Date() &&
    ticket.status !== "resolved" &&
    ticket.status !== "closed";

  const ticketNumber = ticket.ticketNumber || ticket._id?.slice(-6);

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6">
      {/* Collision Detection Banner */}
      {isAgent && (
        <CollisionDetector ticketId={id} currentUserId={user?.id} />
      )}

      {/* Dialogs */}
      <ForwardTicketDialog
        ticketId={id}
        open={isForwardDialogOpen}
        onOpenChange={setIsForwardDialogOpen}
      />

      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/tickets" className="text-primary hover:underline font-medium">
            All unresolved tickets
          </Link>
          <span className="text-muted-foreground">&gt;</span>
          <span className="font-medium">{ticketNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            Explore your plan
          </Button>
          <Button size="sm">
            <span className="mr-1">+</span> New
          </Button>
        </div>
      </div>

      {/* Action toolbar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Star className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            variant={isReplyBoxOpen ? "default" : "outline"}
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => {
              // Check if content is effectively empty (ignoring HTML tags like <p></p>)
              const isContentEmpty = !replyContent || replyContent.replace(/<[^>]*>/g, '').trim() === '';

              if (!isReplyBoxOpen && isContentEmpty) {
                // Auto-generate template
                const name = ticket.createdBy?.name || "Customer";
                let template = `<p>Hi ${name},</p><p><br></p>`;

                if (signature?.enabled && signature?.content) {
                  // Basic format: Newlines to <br>, **bold** to <strong>
                  const sigHtml = signature.content
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                  // Add spacing and separator
                  template += `<p><br/></p><p>---<br/>${sigHtml}</p>`;
                }
                setReplyContent(template);
              }

              if (!isReplyBoxOpen) {
                // Pre-fill with array of emails
                setTo(ticket.createdBy?.email ? [ticket.createdBy.email] : []);
              }
              setIsReplyBoxOpen(!isReplyBoxOpen);
            }}
          >
            <Reply className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reply</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={handleAddNote}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add note</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 hidden md:flex"
            onClick={handleForward}
          >
            <Forward className="h-3.5 w-3.5" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 hidden md:flex"
            onClick={handleCloseTicket}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 hidden lg:flex"
            onClick={handleMerge}
          >
            <Merge className="h-3.5 w-3.5" />
            Merge
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 hidden lg:flex text-destructive hover:text-destructive"
            onClick={handleDeleteTicket}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showActivities ? "default" : "outline"}
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => setShowActivities(!showActivities)}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Show activities</span>
          </Button>
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* Ticket header */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-semibold">{ticket.subject}</h1>
              </div>
            </div>

            {/* Ticket Description & Attachments (Main Ticket Body) */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-8 w-8 rounded-full ${getAvatarColor(ticket.createdBy?.name || "U")} flex items-center justify-center text-white font-medium text-xs`}>
                  {(ticket.createdBy?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{ticket.createdBy?.name || "Unknown User"}</div>
                  <div className="text-xs text-muted-foreground">
                    reported {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({ticket.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.attachments.map((file, i) => {
                      const baseUrl = API_URL.replace('/api', '');
                      const fullUrl = file.url.startsWith('http') ? file.url : `${baseUrl}${file.url}`;

                      return (
                        <a
                          key={i}
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg border transition-colors group"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium group-hover:underline">{file.filename}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-4" label="Replies" />

            {/* Messages (Comments) */}
            {ticket.messages.map((message, index) => (
              <div key={message.id} className="relative">
                {/* Internal note indicator */}
                {message.isInternal && (
                  <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 text-xs mb-2 ml-12">
                    <Lock className="h-3 w-3" />
                    Internal Note - Only visible to agents
                  </div>
                )}

                <div className={`flex gap-3 ${message.isInternal ? "bg-yellow-50/50 dark:bg-yellow-900/10 -mx-4 px-4 py-3 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50" : ""}`}>
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-full ${getAvatarColor(message.author)} flex items-center justify-center flex-shrink-0 text-white font-medium text-sm`}>
                    {message.author.charAt(0).toUpperCase()}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    {/* Author info */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {message.author}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {message.authorId === ticket.customerId ? "reported via email" : "replied"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })} ago
                        <span className="hidden sm:inline"> ({format(new Date(message.createdAt), "EEE, d MMM yyyy 'at' h:mm a")})</span>
                      </span>

                      {/* Action buttons */}
                      <div className="ml-auto flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Forward className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Email recipients */}
                    {index === 0 && (
                      <div className="text-sm text-muted-foreground mb-3 space-y-1">
                        <div className="flex items-start gap-2">
                          <Mail className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">To:</span> {ticket.agentName ? `"${ticket.agentName}" <agent@workdesks.com>` : "Support Team <support@workdesks.com>"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message body */}
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />

                    {/* Attachments */}
                    {/* Attachments - TODO: Implement real attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.attachments.map((att, i) => {
                          // Construct full URL
                          // API_URL is http://localhost:5000/api
                          // We need http://localhost:5000/uploads/filename
                          const baseUrl = API_URL.replace('/api', '');
                          const fullUrl = att.url.startsWith('http') ? att.url : `${baseUrl}${att.url}`;

                          return (
                            <div key={i} className="flex items-center gap-1">
                              <a
                                href={fullUrl}
                                download={att.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg border transition-colors group text-primary underline"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="text-sm font-medium">{att.filename || "Attachment"}</span>
                              </a>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setPreviewFile({ ...att, url: fullUrl })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Reply actions at bottom of each message */}
                    {index === ticket.messages.length - 1 && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <div className={`h-8 w-8 rounded-full ${getAvatarColor(user?.name || "A")} flex items-center justify-center flex-shrink-0 text-white font-medium text-sm`}>
                          {(user?.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            const paramsName = ticket.createdBy?.name || "Customer";
                            const greetingText = `Hi ${paramsName},`;

                            // Check for empty content
                            const isContentEmpty = !replyContent || replyContent.replace(/<[^>]*>/g, '').trim() === '';

                            // Check for stale greeting (has greeting but NO signature separator)
                            // We check for the raw text because HTML can vary
                            const hasGreeting = replyContent.includes(greetingText);
                            const hasSignature = replyContent.includes("---");
                            const isStaleGreeting = hasGreeting && !hasSignature;

                            if (!isReplyBoxOpen && (isContentEmpty || isStaleGreeting)) {
                              const name = ticket.createdBy?.name || "Customer";
                              let template = `<p>Hi ${name},</p><p><br></p>`;

                              if (signature?.enabled && signature?.content) {
                                const sigHtml = signature.content
                                  .replace(/\n/g, '<br/>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                template += `<p><br/></p><p>---<br/>${sigHtml}</p>`;
                              }
                              setReplyContent(template);
                            }

                            if (!isReplyBoxOpen) {
                              setTo(ticket.createdBy?.email ? [ticket.createdBy.email] : []);
                            }
                            setIsReplyBoxOpen(!isReplyBoxOpen);
                          }}
                        >
                          <Reply className="h-3.5 w-3.5" />
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={handleAddNote}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Add note
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={handleForward}
                        >
                          <Forward className="h-3.5 w-3.5" />
                          Forward
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Expanded Reply Box with Rich Text Editor */}
            {isReplyBoxOpen && (
              <div className="border rounded-lg bg-card overflow-hidden">
                <div className="p-3 border-b flex flex-wrap items-center gap-2 bg-muted/30">
                  <Button
                    variant={!isInternal ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsInternal(false)}
                  >
                    Reply
                  </Button>
                  <Button
                    variant={isInternal ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsInternal(true)}
                  >
                    <Lock className="mr-1 h-3 w-3" />
                    Add note
                  </Button>
                  <div className="flex-1" />
                  <CannedResponsesDialog
                    onSelect={handleCannedResponseSelect}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Zap className="mr-2 h-4 w-4" />
                        Canned
                      </Button>
                    }
                  />
                  <AgentSignatureSettings
                    agentId={user?.id}
                    trigger={
                      <Button variant="ghost" size="sm">
                        {signature?.enabled ? "✓ Signature" : "Signature"}
                      </Button>
                    }
                  />
                </div>

                {/* To and CC Fields */}
                <div className="px-4 py-2 border-b space-y-2 bg-muted/10">
                  <div className="px-4 py-2 border-b space-y-2 bg-muted/10">
                    <div className="flex items-start gap-2">
                      <Label className="w-8 text-xs font-medium text-muted-foreground pt-2">To</Label>
                      <div className="flex-1">
                        <TicketRecipientSelector
                          selectedEmails={to}
                          onChange={setTo}
                          contacts={allContacts}
                          suggestedContacts={suggestedContacts}
                          placeholder="Add recipients..."
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Label className="w-8 text-xs font-medium text-muted-foreground pt-2">Cc</Label>
                      <div className="flex-1">
                        <TicketRecipientSelector
                          selectedEmails={cc}
                          onChange={setCc}
                          contacts={allContacts}
                          suggestedContacts={suggestedContacts}
                          placeholder="Add Cc..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  ref={editorRef}
                  content={replyContent}
                  onChange={setReplyContent}
                  placeholder={
                    isInternal
                      ? "Add an internal note (only visible to agents)..."
                      : "Type your reply..."
                  }
                  className="border-0 rounded-none"
                  minHeight="120px"
                />

                {/* Attachments List in Reply Box */}
                {attachments.length > 0 && (
                  <div className="px-4 py-2 border-t space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <span className="truncate max-w-[80%]">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border-t bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                  <Button onClick={handleReply}>
                    <Send className="mr-2 h-4 w-4" />
                    {isInternal ? "Add Note" : "Send"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>



        {/* Properties sidebar */}
        <div className="w-72 xl:w-80 border-l bg-card flex-col hidden md:flex">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Status header */}
              <div>
                <h2 className="text-xl font-semibold capitalize">{statusConfig?.label}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-green-500"}`} />
                  <span className="font-medium">RESOLUTION DUE</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  by {format(new Date(ticket.slaDeadline), "EEE, MMM d, yyyy h:mm a")}
                </p>
              </div>

              <Separator />

              <h3 className="font-semibold text-sm tracking-wide">PROPERTIES</h3>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm">Tags</Label>
                <Input placeholder="Add tags..." className="h-9" />
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-sm">Type</Label>
                <Select value={ticketType} onValueChange={(val) => {
                  setTicketType(val);
                  toast.success(`Type changed to ${val}`);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="problem">Problem</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select value={ticketStatus} onValueChange={(val) => {
                  setTicketStatus(val);
                  toast.success(`Status changed to ${STATUSES.find(s => s.id === val)?.label}`);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm">Priority</Label>
                <Select value={ticketPriority} onValueChange={(val) => {
                  setTicketPriority(val);
                  toast.success(`Priority changed to ${val}`);
                }}>
                  <SelectTrigger className="h-9">
                    <PriorityIndicator priority={ticketPriority} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        <PriorityIndicator priority={priority.id} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group */}
              <div className="space-y-2">
                <Label className="text-sm">Group</Label>
                <Select value={ticketGroup} onValueChange={(val) => {
                  setTicketGroup(val);
                  toast.success(`Group changed to ${GROUPS.find(g => g.id === val)?.label}`);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {GROUPS.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agent */}
              <div className="space-y-2">
                <Label className="text-sm">Agent</Label>
                <Select value={ticketAgent} onValueChange={(val) => {
                  setTicketAgent(val);
                  const agentName = val === "unassigned" ? "Unassigned" : AGENTS.find(a => a.id === val)?.name;
                  toast.success(`Agent changed to ${agentName}`);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {AGENTS.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label className="text-sm">Company</Label>
                <Select value={ticketCompany} onValueChange={(val) => {
                  setTicketCompany(val);
                  toast.success(`Company changed`);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="acme">Acme Corp</SelectItem>
                    <SelectItem value="globex">Globex Inc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={ticketCategory} onValueChange={(val) => {
                  setTicketCategory(val);
                  toast.success(`Category changed to ${CATEGORIES.find(c => c.id === val)?.label}`);
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Tracker */}
              {isAgent && (
                <div className="pt-2">
                  <TimeTracker ticketId={id} onTimeLogged={handleTimeLogged} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Update button */}
          <div className="p-4 border-t">
            <Button className="w-full" onClick={() => toast.success("Ticket updated!")}>
              Update
            </Button>
          </div>
        </div>

        {/* Right sidebar icons */}
        <div className="hidden lg:flex flex-col items-center py-4 px-2 border-l bg-muted/20 gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTimer}>
            <Timer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCalendar}>
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </div>
  );
}

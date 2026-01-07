import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";

export default function ForwardTicketDialog({ ticketId, open, onOpenChange }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [includeHistory, setIncludeHistory] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleForward = async () => {
        if (!email) {
            toast.error("Please enter a recipient email");
            return;
        }

        try {
            setLoading(true);
            await api.forwardTicket(ticketId, {
                email,
                message,
                includeHistory
            });
            toast.success(`Ticket forwarded to ${email}`);
            onOpenChange(false);
            setEmail("");
            setMessage("");
        } catch (error) {
            toast.error(error.message || "Failed to forward ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Forward Ticket</DialogTitle>
                    <DialogDescription>
                        Forward this ticket to another person via email.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">To (Email)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="recipient@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Add a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="includeHistory"
                            checked={includeHistory}
                            onCheckedChange={setIncludeHistory}
                        />
                        <Label htmlFor="includeHistory" className="text-sm font-normal cursor-pointer">
                            Include ticket history
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleForward} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

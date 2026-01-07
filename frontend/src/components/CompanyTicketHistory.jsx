import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";

export default function CompanyTicketHistory({ companyName }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!companyName) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.getTickets({ company: companyName });
                setTickets(res.data.tickets);
            } catch (err) {
                setError("Failed to load history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [companyName]);

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;
    if (error) return <div className="p-4 text-red-500 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</div>;
    if (tickets.length === 0) return <div className="p-4 text-muted-foreground text-sm italic">No tickets found for this company.</div>;

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-2">Recent Tickets</h4>
            <div className="space-y-2">
                {tickets.map(ticket => (
                    <div key={ticket._id} className="flex items-center justify-between p-2 bg-background border rounded text-sm">
                        <div className="flex items-center gap-3">
                            <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} className="w-20 justify-center">
                                {ticket.status}
                            </Badge>
                            <span className="font-medium">{ticket.subject}</span>
                            <span className="text-muted-foreground text-xs">#{ticket.ticketNumber}</span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(ticket.createdAt))} ago
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

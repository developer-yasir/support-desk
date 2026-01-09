import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function CompanySetupModal({ open, onComplete }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        domain: "",
        industry: "",
        notes: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.domain || !formData.industry) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await api.updateCompany(user.company._id || user.company, formData);
            toast.success("Company setup completed successfully!");
            onComplete();
        } catch (error) {
            toast.error(error.message || "Failed to update company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-[500px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        Welcome to WorkDesks! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Let's set up your company profile to get started. This will only take a moment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            value={user?.company?.name || ""}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domain">
                            Company Domain <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="domain"
                            placeholder="example.com"
                            value={formData.domain}
                            onChange={(e) =>
                                setFormData({ ...formData, domain: e.target.value })
                            }
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Your company's website domain
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">
                            Industry <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="industry"
                            placeholder="Technology, Healthcare, Finance, etc."
                            value={formData.industry}
                            onChange={(e) =>
                                setFormData({ ...formData, industry: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional information about your company..."
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            You can update these details anytime from the Companies page
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Setting up..." : "Complete Setup"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

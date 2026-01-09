import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Zap, CheckCircle2, CreditCard, Briefcase } from "lucide-react";
import { toast } from "sonner";

const PlansSettings = ({ paymentMethod, setPaymentMethod, currentPlan, setCurrentPlan }) => {
    const navigate = useNavigate();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const PLANS = [
        {
            name: "Free",
            price: "$0",
            description: "Perfect for small teams just getting started.",
            features: ["3 Agents", "Email Support", "Basic Reporting", "1 Knowledge Base"],
            current: currentPlan === "Free"
        },
        {
            name: "Growth",
            price: "$29",
            period: "/agent/month",
            description: "For growing teams that need more automation.",
            features: ["Unlimited Agents", "Automation Rules", "Advanced Reporting", "SLA Policies", "Connect 3 Mailboxes"],
            recommended: true,
            current: currentPlan === "Growth"
        },
        {
            name: "Enterprise",
            price: "$79",
            period: "/agent/month",
            description: "Advanced security and control for large organizations.",
            features: ["Unlimited Agents", "Audit Logs", "SAML SSO", "Sandboxes", "24/7 Phone Support"],
            current: currentPlan === "Enterprise"
        }
    ];

    const MOCK_INVOICES = paymentMethod ? [
        { date: "Oct 01, 2025", amount: currentPlan === "Enterprise" ? "$79.00" : currentPlan === "Growth" ? "$29.00" : "$0.00", status: "Paid" },
        { date: "Sep 01, 2025", amount: currentPlan === "Enterprise" ? "$79.00" : currentPlan === "Growth" ? "$29.00" : "$0.00", status: "Paid" },
    ] : [];

    const handleSaveCard = () => {
        // Simulate saving card
        setPaymentMethod({
            type: 'Visa',
            last4: '4242',
            expiry: '12/28'
        });
        toast.success("Payment method added successfully");
        setShowPaymentModal(false);
    };

    const handleConfirmUpgrade = () => {
        toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
        setCurrentPlan(selectedPlan.name);
        setShowConfirmModal(false);
        setShowUpgradeModal(false);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Plans & Billing</h1>
                    <p className="text-muted-foreground">Manage your subscription and billing details</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan */}
                <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-32 h-32 text-primary rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Zap className="h-5 w-5" /> Current Plan: {currentPlan}
                        </CardTitle>
                        <CardDescription>Your account is currently on the {currentPlan} tier</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Agent Seats</span>
                                <span className="font-medium">
                                    {currentPlan === "Free" ? "2 / 3 used" : "2 / Unlimited used"}
                                </span>
                            </div>
                            <div className="bg-background/50 h-2 rounded-full overflow-hidden border">
                                <div
                                    className="bg-primary h-full rounded-full transition-all duration-500"
                                    style={{ width: currentPlan === "Free" ? "66%" : "5%" }}
                                ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {currentPlan === "Free" ? "Upgrade to add more agents to your team." : "You have unlimited agent seats."}
                            </p>
                        </div>

                        <div className="pt-2">
                            <div className="text-sm font-medium mb-2">Included in {currentPlan}:</div>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                {PLANS.find(p => p.name === currentPlan)?.features.slice(0, 3).map((f, i) => (
                                    <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> {f}</li>
                                ))}
                            </ul>
                        </div>

                        <Button className="w-full" onClick={() => setShowUpgradeModal(true)}>Upgrade Plan</Button>
                    </CardContent>
                </Card>

                {/* Billing Method */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Billing Method</CardTitle>
                        <CardDescription>Manage your payment methods</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4">
                        {paymentMethod ? (
                            <>
                                <div className="w-full p-4 border rounded-xl bg-card flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">{paymentMethod.type} ending in {paymentMethod.last4}</p>
                                            <p className="text-xs text-muted-foreground">Expires {paymentMethod.expiry}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Default</Badge>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => setShowPaymentModal(true)}>Update Card</Button>
                            </>
                        ) : (
                            <>
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium">No payment method</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Add a credit card to process payments for your subscription.</p>
                                </div>
                                <Button variant="outline" onClick={() => setShowPaymentModal(true)}>Add Payment Method</Button>
                            </>
                        )}

                    </CardContent>
                </Card>
            </div>

            {/* Invoice History */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                </CardHeader>
                <CardContent>
                    {MOCK_INVOICES.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Invoice</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_INVOICES.map((inv, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{inv.date}</TableCell>
                                        <TableCell>{inv.amount}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Paid</Badge></TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">Download</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                            <div className="p-3 bg-muted rounded-full">
                                <Briefcase className="h-6 w-6 opacity-50" />
                            </div>
                            <p>No invoices available yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border shadow-lg rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-card z-10">
                            <div>
                                <h2 className="text-2xl font-bold">Upgrade your plan</h2>
                                <p className="text-muted-foreground">Choose the plan that fits your needs</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowUpgradeModal(false)}>
                                <ChevronLeft className="h-6 w-6 rotate-180" /> {/* Hacky close icon replacement, should technically optionally use X */}
                            </Button>
                        </div>
                        <div className="p-8 grid md:grid-cols-3 gap-6">
                            {PLANS.map((plan) => (
                                <div key={plan.name} className={`relative rounded-xl border p-6 flex flex-col ${plan.recommended ? 'border-primary ring-1 ring-primary shadow-md bg-primary/5' : 'bg-card'}`}>
                                    {plan.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg">{plan.name}</h3>
                                        <div className="mt-2 flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">{plan.price}</span>
                                            {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                                    </div>
                                    <ul className="space-y-3 mb-6 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="text-sm flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant={plan.current ? "outline" : "default"}
                                        disabled={plan.current}
                                        className="w-full"
                                        onClick={() => {
                                            if (paymentMethod) {
                                                setSelectedPlan(plan);
                                                setShowConfirmModal(true);
                                            } else {
                                                toast.info(`Select a payment method for ${plan.name} plan`);
                                                setShowUpgradeModal(false);
                                                setShowPaymentModal(true);
                                            }
                                        }}
                                    >
                                        {plan.current ? "Current Plan" : "Upgrade"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t bg-muted/20 text-center">
                            <p className="text-sm text-muted-foreground">Need a custom plan? <a href="#" className="text-primary underline">Contact Sales</a></p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border shadow-lg rounded-xl max-w-md w-full mx-4 p-6 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold">Add Payment Method</h2>
                            <p className="text-muted-foreground text-sm">Enter your card details to proceed</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cardholder Name</Label>
                                <Input placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Card Number</Label>
                                <Input placeholder="0000 0000 0000 0000" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    <Input placeholder="MM/YY" />
                                </div>
                                <div className="space-y-2">
                                    <Label>CVC</Label>
                                    <Input placeholder="123" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleSaveCard}>Save Card</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedPlan && paymentMethod && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border shadow-lg rounded-xl max-w-md w-full mx-4 p-6 space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">Confirm Subscription</h2>
                            <p className="text-muted-foreground text-sm">Review your plan details below</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between font-medium">
                                    <span>Plan</span>
                                    <span>{selectedPlan.name}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Price</span>
                                    <span>{selectedPlan.price} {selectedPlan.period}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Pay with {paymentMethod.type}</p>
                                    <p className="text-xs text-muted-foreground">Ending in {paymentMethod.last4}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleConfirmUpgrade}>Confirm & Pay</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlansSettings;

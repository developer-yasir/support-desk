import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

const AccountSettings = ({ user, companyData }) => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Account Details</h1>
                    <p className="text-muted-foreground">View and manage your account information</p>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Account Owner</Label>
                            <Input value={user?.name} disabled />
                        </div>
                        <div>
                            <Label>Owner Email</Label>
                            <Input value={user?.email} disabled />
                        </div>
                        <div>
                            <Label>Account ID</Label>
                            <Input value={companyData?._id} disabled />
                        </div>
                        <div>
                            <Label>Created At</Label>
                            <Input value={companyData?.createdAt ? new Date(companyData.createdAt).toLocaleDateString() : 'N/A'} disabled />
                        </div>
                    </div>
                    <div className="pt-6 border-t mt-6">
                        <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                        <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                            <div>
                                <p className="font-medium text-destructive">Delete Account</p>
                                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                            </div>
                            <Button variant="destructive">Delete Account</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountSettings;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import CompanyLogoUpload from "@/components/CompanyLogoUpload";

const CompanySettings = ({ companyData, onUpdate, loading }) => {
    const navigate = useNavigate();
    const [companyForm, setCompanyForm] = useState({
        name: "",
        domain: "",
        industry: "",
        notes: ""
    });

    useEffect(() => {
        if (companyData) {
            setCompanyForm({
                name: companyData.name || "",
                domain: companyData.domain || "",
                industry: companyData.industry || "",
                notes: companyData.notes || ""
            });
        }
    }, [companyData]);

    const handleCompanySave = async () => {
        if (!companyData?._id) return;
        try {
            await api.updateCompany(companyData._id, companyForm);
            toast.success("Company profile updated successfully!");
            onUpdate({ ...companyData, ...companyForm });
        } catch (error) {
            toast.error(error.message || "Failed to update company profile");
        }
    };

    const handleLogoUpdate = async (logoData) => {
        if (!companyData?._id) return;
        try {
            await api.updateCompany(companyData._id, { logo: logoData });
            toast.success("Logo updated successfully");
            onUpdate({ ...companyData, logo: logoData });
        } catch (error) {
            throw new Error(error.message || "Failed to update logo");
        }
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
                    <h1 className="text-2xl font-bold">Helpdesk Settings</h1>
                    <p className="text-muted-foreground">Manage your company information and branding</p>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : companyData ? (
                        <>
                            <div className="pb-6 border-b">
                                <CompanyLogoUpload company={companyData} onLogoUpdate={handleLogoUpdate} />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={companyForm.name}
                                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="domain">Domain</Label>
                                    <Input
                                        id="domain"
                                        value={companyForm.domain}
                                        onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })}
                                        placeholder="example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input
                                        id="industry"
                                        value={companyForm.industry}
                                        onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyNotes">Notes</Label>
                                    <Input
                                        id="companyNotes"
                                        value={companyForm.notes}
                                        onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleCompanySave}>
                                    <Save className="mr-2 h-4 w-4" /> Save Company Profile
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">No data available</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CompanySettings;

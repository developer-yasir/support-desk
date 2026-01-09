import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CompanyLogoUpload({ company, onLogoUpdate }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PNG, JPG, or SVG image");
            return;
        }

        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            toast.error("Image size must be less than 2MB");
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!preview) return;

        setUploading(true);
        try {
            // Call parent callback with base64 image
            await onLogoUpdate(preview);
            toast.success("Logo uploaded successfully!");
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            toast.error(error.message || "Failed to upload logo");
        } finally {
            setUploading(false);
        }
    };

    const handleClear = async () => {
        setUploading(true);
        try {
            await onLogoUpdate("");
            toast.success("Logo cleared. Using default text logo.");
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            toast.error(error.message || "Failed to clear logo");
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
    };

    const currentLogo = preview || company?.logo;
    const hasLogo = Boolean(company?.logo);

    return (
        <div className="space-y-4">
            <div>
                <Label>Company Logo</Label>
                <p className="text-xs text-muted-foreground mt-1">
                    Upload a custom logo or use the default text logo
                </p>
            </div>

            {/* Current/Preview Logo */}
            <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30">
                {currentLogo ? (
                    <div className="relative">
                        <img
                            src={currentLogo}
                            alt="Logo preview"
                            className="max-h-24 max-w-full object-contain"
                        />
                        {preview && (
                            <div className="absolute -top-2 -right-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={handleCancel}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 mx-auto mb-2">
                            <span className="text-2xl font-bold text-primary-foreground">
                                {company?.name?.slice(0, 2).toUpperCase() || "CO"}
                            </span>
                        </div>
                        <p className="text-sm font-medium">{company?.name || "Company Name"}</p>
                        <p className="text-xs text-muted-foreground">Default text logo</p>
                    </div>
                )}
            </div>

            {/* Upload Button */}
            {!preview && (
                <div>
                    <input
                        type="file"
                        id="logo-upload"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors">
                            <Upload className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {hasLogo ? "Change Logo" : "Upload Logo"}
                            </span>
                        </div>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG or SVG. Max size 2MB.
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            {preview && (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1"
                    >
                        {uploading ? "Uploading..." : "Save Logo"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Clear Logo Button */}
            {hasLogo && !preview && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    disabled={uploading}
                    className="w-full"
                >
                    {uploading ? "Clearing..." : "Clear Logo (Use Text)"}
                </Button>
            )}
        </div>
    );
}

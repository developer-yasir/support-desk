import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Bell, Moon, Sun, Palette, Save, Camera, Upload, Trash2 } from "lucide-react";

const PROFILE_STORAGE_KEY = "workdesks_profile_preferences";
const AVATAR_STORAGE_KEY = "workdesks_user_avatar";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function Profile() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    weeklyDigest: false,
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeZone: "UTC",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Load saved preferences and avatar on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        avatarUrl: savedAvatar || user.avatar || "",
      });
    }
    
    const savedPrefs = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error("Failed to parse saved preferences", e);
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Update user in localStorage (mock)
    const savedUser = localStorage.getItem("workdesks_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const updated = { ...parsed, name: formData.name, avatar: formData.avatarUrl };
      localStorage.setItem("workdesks_user", JSON.stringify(updated));
    }
    
    // Save preferences
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(preferences));
    
    setIsSaving(false);
    toast({
      title: "Profile updated",
      description: "Your profile and preferences have been saved.",
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert to base64 for localStorage (mock storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
        localStorage.setItem(AVATAR_STORAGE_KEY, base64);
        
        // Also update user in localStorage
        const savedUser = localStorage.getItem("workdesks_user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const updated = { ...parsed, avatar: base64 };
          localStorage.setItem("workdesks_user", JSON.stringify(updated));
        }

        setIsUploadingAvatar(false);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been changed.",
        });
      };
      reader.onerror = () => {
        setIsUploadingAvatar(false);
        toast({
          title: "Upload failed",
          description: "Failed to read the image file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploadingAvatar(false);
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    
    const savedUser = localStorage.getItem("workdesks_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const updated = { ...parsed, avatar: null };
      localStorage.setItem("workdesks_user", JSON.stringify(updated));
    }

    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed.",
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "company_manager":
        return "Manager";
      case "customer":
        return "Customer";
      default:
        return "Agent";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-lg">{formData.name || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{getRoleDisplay(user?.role)}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {isUploadingAvatar ? "Uploading..." : "Upload"}
                </Button>
                {formData.avatarUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveAvatar}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF. Max 2MB.</p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="pl-10"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how WorkDesks looks for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about ticket activity
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show browser notifications for new tickets
              </p>
            </div>
            <Switch
              checked={preferences.desktopNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, desktopNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Get a weekly summary of your ticket activity
              </p>
            </div>
            <Switch
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, weeklyDigest: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isSaving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

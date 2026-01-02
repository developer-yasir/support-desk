import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { CATEGORIES, PRIORITIES, STATUSES } from "../data/mockData";
import { toast } from "sonner";

export default function AdminSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [slaReminders, setSlaReminders] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your helpdesk settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="sla">SLA Policies</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="WorkDesks Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input id="supportEmail" defaultValue="support@workdesks.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="America/New_York" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for new tickets and updates
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-assign Tickets</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign new tickets to available agents
                  </p>
                </div>
                <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SLA Breach Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Send reminders when tickets are approaching SLA deadline
                  </p>
                </div>
                <Switch checked={slaReminders} onCheckedChange={setSlaReminders} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ticket Categories</CardTitle>
                <CardDescription>
                  Manage categories for organizing tickets
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CATEGORIES.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.label}</TableCell>
                      <TableCell>--</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Priority Levels</CardTitle>
                <CardDescription>
                  Configure ticket priority levels
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>SLA Response Time</TableHead>
                    <TableHead>SLA Resolution Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRIORITIES.map((priority) => (
                    <TableRow key={priority.id}>
                      <TableCell>
                        <Badge variant="secondary" className={priority.color}>
                          {priority.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {priority.id === "urgent" && "1 hour"}
                        {priority.id === "high" && "4 hours"}
                        {priority.id === "medium" && "8 hours"}
                        {priority.id === "low" && "24 hours"}
                      </TableCell>
                      <TableCell>
                        {priority.id === "urgent" && "4 hours"}
                        {priority.id === "high" && "12 hours"}
                        {priority.id === "medium" && "24 hours"}
                        {priority.id === "low" && "48 hours"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SLA Policies</CardTitle>
              <CardDescription>
                Configure Service Level Agreement policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Response Time (hours)</Label>
                  <Input type="number" defaultValue="4" />
                </div>
                <div className="space-y-2">
                  <Label>Default Resolution Time (hours)</Label>
                  <Input type="number" defaultValue="24" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Business Hours</Label>
                <Input defaultValue="Mon-Fri 9:00 AM - 6:00 PM" />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save SLA Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize email templates for ticket notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>New Ticket Confirmation</Label>
                <Textarea
                  rows={6}
                  defaultValue={`Hi {{customer_name}},

Thank you for contacting us. We've received your support request and created ticket #{{ticket_id}}.

Subject: {{ticket_subject}}

Our team will review your request and get back to you shortly.

Best regards,
WorkDesks Support Team`}
                />
              </div>
              <div className="space-y-2">
                <Label>Ticket Reply Notification</Label>
                <Textarea
                  rows={6}
                  defaultValue={`Hi {{customer_name}},

There's a new reply on your support ticket #{{ticket_id}}.

{{reply_preview}}

Click here to view the full conversation: {{ticket_url}}

Best regards,
WorkDesks Support Team`}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

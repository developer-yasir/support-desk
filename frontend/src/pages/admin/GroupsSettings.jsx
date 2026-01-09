import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Layers, Pencil, Trash2 } from "lucide-react";

const GroupsSettings = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([
        { id: 1, name: 'General Support', description: 'Default group for general inquiries', agents: 3 },
        { id: 2, name: 'Billing', description: 'Handling invoices and payments', agents: 1 },
        { id: 3, name: 'Technical Issues', description: 'L2 support for bugs and technical problems', agents: 2 }
    ]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/admin/settings')}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Agent Groups</h1>
                    <p className="text-muted-foreground">Organize agents into groups for better ticket assignment</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create New Group
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Group Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Agents</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-muted-foreground" />
                                            {group.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{group.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{group.agents} Agents</Badge>
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
        </div>
    );
};

export default GroupsSettings;

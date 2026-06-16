import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CANNED_RESPONSES, CATEGORIES } from "@/data/mockData";

const createEmptyResponse = () => ({
    id: `custom-${Date.now()}`,
    title: "",
    shortcut: "/",
    category: "general",
    content: "",
});

const CannedResponsesSettings = () => {
    const navigate = useNavigate();
    const [responses, setResponses] = useState(() => {
        const saved = localStorage.getItem("admin_cannedResponses");
        return saved ? JSON.parse(saved) : CANNED_RESPONSES.slice(0, 6);
    });
    const [draft, setDraft] = useState(createEmptyResponse);

    const updateDraft = (key, value) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveDraft = () => {
        if (!draft.title.trim() || !draft.content.trim()) {
            toast.error("Title and response content are required");
            return;
        }

        const normalizedShortcut = draft.shortcut.startsWith("/") ? draft.shortcut : `/${draft.shortcut}`;
        const nextResponses = [
            { ...draft, shortcut: normalizedShortcut },
            ...responses.filter((response) => response.id !== draft.id),
        ];
        setResponses(nextResponses);
        localStorage.setItem("admin_cannedResponses", JSON.stringify(nextResponses));
        setDraft(createEmptyResponse());
        toast.success("Canned response saved");
    };

    const handleEdit = (response) => {
        setDraft(response);
    };

    const handleDelete = (responseId) => {
        const nextResponses = responses.filter((response) => response.id !== responseId);
        setResponses(nextResponses);
        localStorage.setItem("admin_cannedResponses", JSON.stringify(nextResponses));
        if (draft.id === responseId) setDraft(createEmptyResponse());
        toast.success("Canned response removed");
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate("/admin/settings")}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back to Settings
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Canned Responses</h1>
                    <p className="text-muted-foreground">Create reusable replies for common support conversations.</p>
                </div>
                <Button variant="outline" onClick={() => setDraft(createEmptyResponse())}>
                    <Plus className="mr-2 h-4 w-4" /> New Response
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Response Library</CardTitle>
                        <CardDescription>Shortcuts can be used by agents while replying to tickets.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[560px] pr-3">
                            <div className="space-y-3">
                                {responses.map((response) => {
                                    const category = CATEGORIES.find((item) => item.id === response.category);
                                    return (
                                        <button
                                            key={response.id}
                                            type="button"
                                            onClick={() => handleEdit(response)}
                                            className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent ${draft.id === response.id ? "border-primary bg-primary/5" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium">{response.title}</p>
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{response.content}</p>
                                                </div>
                                                <Badge variant="outline" className="font-mono">{response.shortcut}</Badge>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Badge variant="secondary">{category?.label || response.category}</Badge>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{responses.some((response) => response.id === draft.id) ? "Edit Response" : "New Response"}</CardTitle>
                        <CardDescription>Keep responses concise and easy to personalize.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Password reset follow-up" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Shortcut</Label>
                                <Input value={draft.shortcut} onChange={(event) => updateDraft("shortcut", event.target.value)} placeholder="/reset" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={draft.category} onValueChange={(value) => updateDraft("category", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover z-50">
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Response</Label>
                            <Textarea
                                className="min-h-[220px]"
                                value={draft.content}
                                onChange={(event) => updateDraft("content", event.target.value)}
                                placeholder="Hi {{customer.name}}, thanks for contacting support..."
                            />
                        </div>
                        <div className="flex justify-between gap-3">
                            <Button variant="outline" onClick={() => handleDelete(draft.id)} disabled={!responses.some((response) => response.id === draft.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                            <Button onClick={handleSaveDraft}>
                                <Save className="mr-2 h-4 w-4" /> Save Response
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CannedResponsesSettings;

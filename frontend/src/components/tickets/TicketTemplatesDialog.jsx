import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, Plus } from "lucide-react";
import { TICKET_TEMPLATES, CATEGORIES, PRIORITIES } from "@/data/mockData";

export default function TicketTemplatesDialog({ onSelect, trigger }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTemplates = TICKET_TEMPLATES.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (template) => {
    onSelect(template);
    setOpen(false);
    setSearch("");
  };

  const getCategoryLabel = (catId) => {
    return CATEGORIES.find((c) => c.id === catId)?.label || catId;
  };

  const getPriorityConfig = (priorityId) => {
    return PRIORITIES.find((p) => p.id === priorityId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ticket Templates
          </DialogTitle>
          <DialogDescription>
            Select a template to quickly fill in ticket details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Templates List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const priorityConfig = getPriorityConfig(template.priority);
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{template.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(template.category)}
                          </Badge>
                          {priorityConfig && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${priorityConfig.color}`}
                            >
                              {priorityConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {template.subject}...
                      </p>
                      {template.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 border-t">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
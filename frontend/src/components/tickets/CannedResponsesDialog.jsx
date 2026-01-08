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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Zap, Plus } from "lucide-react";
import { CANNED_RESPONSES, CATEGORIES } from "@/data/mockData";

export default function CannedResponsesDialog({ onSelect, trigger }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredResponses = CANNED_RESPONSES.filter((response) => {
    const matchesSearch =
      response.title.toLowerCase().includes(search.toLowerCase()) ||
      response.content.toLowerCase().includes(search.toLowerCase()) ||
      response.shortcut.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || response.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (response) => {
    onSelect(response.content);
    setOpen(false);
    setSearch("");
  };

  const categories = [
    { id: "all", label: "All" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Zap className="mr-2 h-4 w-4" />
            Canned Responses
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Canned Responses
          </DialogTitle>
          <DialogDescription>
            Select a pre-written response to insert into your reply.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search responses or type shortcut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex-wrap h-auto gap-1">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Responses List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredResponses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No canned responses found
                </div>
              ) : (
                filteredResponses.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleSelect(response)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{response.title}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {response.shortcut}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {response.content}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Tip: Type shortcuts like <code>/greet</code> in the reply box
            </p>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
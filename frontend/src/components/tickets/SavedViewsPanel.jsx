import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
  Plus,
  User,
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import { SAVED_VIEWS } from "@/data/mockData";

const iconMap = {
  User,
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle,
};

export default function SavedViewsPanel({
  currentFilters,
  onApplyView,
  activeViewId,
}) {
  const [views, setViews] = useState(SAVED_VIEWS);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const handleSaveView = () => {
    if (!newViewName.trim()) return;

    const newView = {
      id: `view-${Date.now()}`,
      name: newViewName,
      icon: "Bookmark",
      filters: currentFilters,
      isDefault: false,
    };

    setViews([...views, newView]);
    setNewViewName("");
    setSaveDialogOpen(false);
  };

  const handleDeleteView = (viewId) => {
    setViews(views.filter((v) => v.id !== viewId));
  };

  const defaultViews = views.filter((v) => v.isDefault);
  const customViews = views.filter((v) => !v.isDefault);

  return (
    <div className="space-y-4">
      {/* Default Views */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-muted-foreground px-2">
          DEFAULT VIEWS
        </h4>
        {defaultViews.map((view) => {
          const IconComponent = iconMap[view.icon] || Bookmark;
          const isActive = activeViewId === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onApplyView(view)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="flex-1 text-left">{view.name}</span>
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Custom Views */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-xs font-medium text-muted-foreground">
            MY VIEWS
          </h4>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current View</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="View name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This will save your current filter configuration as a reusable view.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveView}>Save View</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {customViews.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-2">
            No saved views yet
          </p>
        ) : (
          customViews.map((view) => {
            const isActive = activeViewId === view.id;
            return (
              <div
                key={view.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm group ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <button
                  onClick={() => onApplyView(view)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <Star className="h-4 w-4" />
                  <span>{view.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteView(view.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
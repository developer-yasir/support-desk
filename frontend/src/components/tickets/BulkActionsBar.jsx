import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  RefreshCw,
  Tag,
  Trash2,
  MoreHorizontal,
  X,
  Merge,
  Forward,
  Archive,
} from "lucide-react";
import { STATUSES, PRIORITIES, AGENTS } from "@/data/mockData";
import { toast } from "sonner";

export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleStatusChange = (status) => {
    onBulkAction("changeStatus", { status });
    toast.success(`Changed status to ${status} for ${selectedCount} ticket(s)`);
  };

  const handlePriorityChange = (priority) => {
    onBulkAction("changePriority", { priority });
    toast.success(`Changed priority to ${priority} for ${selectedCount} ticket(s)`);
  };

  const handleAssign = (agentId) => {
    const agent = AGENTS.find((a) => a.id === agentId);
    onBulkAction("assign", { agentId });
    toast.success(
      `Assigned ${selectedCount} ticket(s) to ${agent?.name || "Unassigned"}`
    );
  };

  const handleDelete = () => {
    onBulkAction("delete", {});
    toast.success(`Deleted ${selectedCount} ticket(s)`);
    setDeleteDialogOpen(false);
  };

  const handleMerge = () => {
    if (selectedCount < 2) {
      toast.error("Select at least 2 tickets to merge");
      return;
    }
    onBulkAction("merge", {});
    toast.success("Tickets merged successfully");
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-accent border-b">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {selectedCount}
          </Badge>
          <span className="text-sm font-medium">ticket(s) selected</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {/* Status Change */}
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32 h-8">
              <RefreshCw className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {STATUSES.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Change */}
          <Select onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-32 h-8">
              <Tag className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority.id} value={priority.id}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Assign Agent */}
          <Select onValueChange={handleAssign}>
            <SelectTrigger className="w-36 h-8">
              <UserPlus className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Assign" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {AGENTS.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={handleMerge}>
                <Merge className="mr-2 h-4 w-4" />
                Merge Tickets
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Forward className="mr-2 h-4 w-4" />
                Forward
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} ticket(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected tickets will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
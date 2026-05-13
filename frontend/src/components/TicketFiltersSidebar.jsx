import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Search, X } from "lucide-react";
import { STATUSES, AGENTS } from "../data/mockData";

const DATE_OPTIONS = [
  { id: "any", label: "Any time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7days", label: "Last 7 days" },
  { id: "last30days", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
];

const GROUPS = [
  { id: "any", label: "Any group" },
  { id: "customer-support", label: "Customer Support" },
  { id: "technical", label: "Technical" },
  { id: "billing", label: "Billing" },
  { id: "sales", label: "Sales" },
];

export default function TicketFiltersSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  onApply,
  activeFilterCount,
  onClose,
}) {
  const stableStringify = (value) => {
    const seen = new WeakSet();
    const stringify = (val) => {
      if (val === null || typeof val !== "object") return JSON.stringify(val);
      if (seen.has(val)) return "\"[Circular]\"";
      seen.add(val);
      if (Array.isArray(val)) return `[${val.map(stringify).join(",")}]`;
      const keys = Object.keys(val).sort();
      return `{${keys.map((k) => `${JSON.stringify(k)}:${stringify(val[k])}`).join(",")}}`;
    };
    return stringify(value);
  };

  const [justApplied, setJustApplied] = useState(false);
  const appliedSnapshotRef = useRef(stableStringify(filters));
  const filtersKey = useMemo(() => stableStringify(filters), [filters]);
  const isDirty = filtersKey !== appliedSnapshotRef.current;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleApply = () => {
    onApply?.();
    appliedSnapshotRef.current = filtersKey;
    setJustApplied(true);
  };

  useEffect(() => {
    if (!justApplied) return;
    const t = setTimeout(() => setJustApplied(false), 1200);
    return () => clearTimeout(t);
  }, [justApplied]);

  const removeStatusFilter = (statusToRemove) => {
    const newStatuses = filters.statuses.filter((s) => s !== statusToRemove);
    handleChange("statuses", newStatuses);
  };

  const toggleStatus = (statusId) => {
    const currentStatuses = filters.statuses || [];
    if (currentStatuses.includes(statusId)) {
      handleChange("statuses", currentStatuses.filter((s) => s !== statusId));
    } else {
      handleChange("statuses", [...currentStatuses, statusId]);
    }
  };

  return (
    <div className="w-[85vw] sm:w-80 border-l bg-card flex flex-col h-full max-w-sm">
      {/* Header */}
      <div className="px-4 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm tracking-wide">FILTERS</h3>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="text-primary h-auto p-0 text-sm hidden sm:inline-flex"
            >
              Clear all
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Quick filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                handleChange("agent", "unassigned");
                handleChange("statuses", ["open", "pending"]);
              }}
            >
              Unassigned
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleChange("statuses", ["open", "pending"])}
            >
              Unresolved
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleChange("priority", "urgent")}
            >
              Urgent
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleChange("created", "today")}
            >
              Today
            </Button>
          </div>

          {/* Search fields */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets (subject, requester, #TKT-000123)"
                value={filters.searchFields || ""}
                onChange={(e) => handleChange("searchFields", e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          {/* Agents Include */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Agents Include <span className="text-muted-foreground">∨</span>
            </Label>
            <Select
              value={filters.agent || "any"}
              onValueChange={(value) => handleChange("agent", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any agent" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="any">Any agent</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Groups Include */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Groups Include <span className="text-muted-foreground">∨</span>
            </Label>
            <Select
              value={filters.group || "any"}
              onValueChange={(value) => handleChange("group", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any group" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {GROUPS.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Created */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Created</Label>
            <Select
              value={filters.created || "any"}
              onValueChange={(value) => handleChange("created", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Closed at */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Closed at</Label>
            <Select
              value={filters.closedAt || "any"}
              onValueChange={(value) => handleChange("closedAt", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resolved at */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Resolved at</Label>
            <Select
              value={filters.resolvedAt || "any"}
              onValueChange={(value) => handleChange("resolvedAt", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resolution due by */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Resolution due by</Label>
            <Select
              value={filters.resolutionDue || "any"}
              onValueChange={(value) => handleChange("resolutionDue", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* First response due by */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">First response due by</Label>
            <Select
              value={filters.firstResponseDue || "any"}
              onValueChange={(value) => handleChange("firstResponseDue", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Include */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Status Include <span className="text-muted-foreground">∨</span>
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(filters.statuses || []).map((statusId) => {
                const status = STATUSES.find((s) => s.id === statusId);
                return (
                  <Badge
                    key={statusId}
                    variant="secondary"
                    className="gap-1 pr-1.5 bg-muted"
                  >
                    {statusId === "open" || statusId === "pending" ? "All unresolved" : status?.label}
                    <button
                      onClick={() => removeStatusFilter(statusId)}
                      className="ml-1 hover:bg-background rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !(filters.statuses || []).includes(value)) {
                  toggleStatus(value);
                }
              }}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Add status filter" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {STATUSES.filter(
                  (s) => !(filters.statuses || []).includes(s.id)
                ).map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 pt-3 pb-2 border-t bg-card">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-xs text-muted-foreground">
            Active: <span className="font-medium text-foreground">{activeFilterCount || 0}</span>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onClearFilters}
            className="h-auto p-0 text-xs"
            disabled={!activeFilterCount}
          >
            Clear
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleApply}
          className="w-full"
          disabled={!isDirty}
        >
          {justApplied ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" /> Applied
            </span>
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
}

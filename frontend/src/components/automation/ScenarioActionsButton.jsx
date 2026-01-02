import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Zap,
  AlertTriangle,
  HelpCircle,
  DollarSign,
  Copy,
  CheckCircle,
} from "lucide-react";
import { SCENARIOS } from "@/data/automationData";
import { toast } from "sonner";

const iconMap = {
  AlertTriangle,
  HelpCircle,
  DollarSign,
  Copy,
  CheckCircle,
};

export default function ScenarioActionsButton({ ticketId, onExecute }) {
  const [executing, setExecuting] = useState(null);

  const handleExecute = async (scenario) => {
    setExecuting(scenario.id);
    
    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success(`Executed: ${scenario.name}`, {
      description: `${scenario.actions.length} actions performed`,
    });
    
    onExecute?.(scenario);
    setExecuting(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="mr-2 h-4 w-4" />
          Scenarios
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Quick Actions
          </p>
        </div>
        <DropdownMenuSeparator />
        {SCENARIOS.map((scenario) => {
          const IconComponent = iconMap[scenario.icon] || Zap;
          return (
            <DropdownMenuItem
              key={scenario.id}
              onClick={() => handleExecute(scenario)}
              disabled={executing === scenario.id}
              className="flex items-start gap-3 py-2"
            >
              <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{scenario.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {scenario.description}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {scenario.actions.length}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
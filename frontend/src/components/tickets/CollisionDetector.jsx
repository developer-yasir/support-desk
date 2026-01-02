import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Edit3, AlertCircle } from "lucide-react";

// Mock data for agents currently viewing/editing
const MOCK_ACTIVE_AGENTS = [
  { id: "4", name: "Sarah Wilson", status: "viewing", since: Date.now() - 120000 },
  { id: "5", name: "Mike Johnson", status: "editing", since: Date.now() - 30000 },
];

export default function CollisionDetector({ ticketId, currentUserId }) {
  const [activeAgents, setActiveAgents] = useState([]);

  // Simulate real-time collision detection
  useEffect(() => {
    // In a real app, this would use Supabase Realtime presence
    // For demo, randomly show/hide other agents
    const showCollision = Math.random() > 0.3; // 70% chance to show collision
    
    if (showCollision) {
      const agents = MOCK_ACTIVE_AGENTS.filter((a) => a.id !== currentUserId);
      setActiveAgents(agents.slice(0, Math.floor(Math.random() * 2) + 1));
    }

    // Simulate presence updates
    const interval = setInterval(() => {
      setActiveAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          since: agent.since, // Keep the original time
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [ticketId, currentUserId]);

  if (activeAgents.length === 0) return null;

  const hasEditor = activeAgents.some((a) => a.status === "editing");

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg border ${
        hasEditor
          ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
          : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
      }`}
    >
      {hasEditor ? (
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      ) : (
        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      )}

      <div className="flex -space-x-2">
        {activeAgents.map((agent) => (
          <Tooltip key={agent.id}>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border-2 border-background cursor-pointer">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{agent.name}</p>
              <p className="text-xs text-muted-foreground">
                {agent.status === "editing" ? "Currently editing" : "Viewing this ticket"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <span className="text-xs">
        {activeAgents.length === 1 ? (
          <>
            <span className="font-medium">{activeAgents[0].name}</span>
            {activeAgents[0].status === "editing" ? (
              <span className="text-yellow-700 dark:text-yellow-400">
                {" "}is editing this ticket
              </span>
            ) : (
              <span className="text-blue-700 dark:text-blue-400">
                {" "}is viewing this ticket
              </span>
            )}
          </>
        ) : (
          <>
            <span className="font-medium">{activeAgents.length} agents</span>
            <span className="text-muted-foreground"> are viewing this ticket</span>
          </>
        )}
      </span>

      {hasEditor && (
        <Badge variant="outline" className="ml-auto text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
          <Edit3 className="mr-1 h-3 w-3" />
          Locked
        </Badge>
      )}
    </div>
  );
}
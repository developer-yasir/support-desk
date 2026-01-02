import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Square, Clock, History } from "lucide-react";
import { toast } from "sonner";

// Format seconds to HH:MM:SS
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Format seconds to readable duration
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function TimeTracker({ ticketId, onTimeLogged }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [manualTime, setManualTime] = useState("");
  const [description, setDescription] = useState("");
  
  // Mock logged time entries
  const [timeEntries, setTimeEntries] = useState([
    { id: 1, duration: 1800, description: "Initial investigation", timestamp: new Date(Date.now() - 86400000) },
    { id: 2, duration: 900, description: "Customer follow-up", timestamp: new Date(Date.now() - 43200000) },
  ]);

  const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    toast.success("Timer started");
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info("Timer paused");
  };

  const handleStop = () => {
    if (elapsedTime > 0) {
      const newEntry = {
        id: Date.now(),
        duration: elapsedTime,
        description: "Time tracked",
        timestamp: new Date(),
      };
      setTimeEntries((prev) => [...prev, newEntry]);
      onTimeLogged?.(elapsedTime);
      toast.success(`Logged ${formatDuration(elapsedTime)}`);
    }
    setIsRunning(false);
    setElapsedTime(0);
  };

  const handleManualLog = () => {
    const minutes = parseInt(manualTime, 10);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error("Please enter a valid number of minutes");
      return;
    }
    
    const seconds = minutes * 60;
    const newEntry = {
      id: Date.now(),
      duration: seconds,
      description: description || "Manual time entry",
      timestamp: new Date(),
    };
    setTimeEntries((prev) => [...prev, newEntry]);
    onTimeLogged?.(seconds);
    toast.success(`Logged ${minutes} minutes`);
    setManualTime("");
    setDescription("");
    setLogDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time Tracking</span>
        </div>
        <Badge variant="outline" className="font-mono">
          {formatTime(elapsedTime)}
        </Badge>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleStart}
          >
            <Play className="mr-2 h-4 w-4" />
            {elapsedTime > 0 ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePause}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={elapsedTime === 0}
        >
          <Square className="h-4 w-4" />
        </Button>

        <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Manually</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Time (minutes)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="What did you work on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleManualLog}>Log Time</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Time */}
      <div className="flex items-center justify-between text-sm border-t pt-3">
        <span className="text-muted-foreground">Total logged:</span>
        <span className="font-medium">{formatDuration(totalTimeLogged + elapsedTime)}</span>
      </div>

      {/* Recent Entries */}
      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Recent entries:</span>
          {timeEntries.slice(-3).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
            >
              <span className="text-muted-foreground truncate flex-1">
                {entry.description}
              </span>
              <span className="font-mono ml-2">{formatDuration(entry.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
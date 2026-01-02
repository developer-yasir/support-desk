import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Keyboard shortcut definitions
const SHORTCUTS = [
  { key: "n", ctrl: true, description: "New ticket", action: "newTicket" },
  { key: "t", ctrl: true, description: "Go to tickets", action: "goTickets" },
  { key: "d", ctrl: true, description: "Go to dashboard", action: "goDashboard" },
  { key: "r", ctrl: true, description: "Go to reports", action: "goReports" },
  { key: "/", ctrl: false, description: "Focus search", action: "focusSearch" },
  { key: "?", ctrl: false, shift: true, description: "Show shortcuts", action: "showHelp" },
  { key: "Escape", ctrl: false, description: "Close modal/dialog", action: "escape" },
];

export function useKeyboardShortcuts(options = {}) {
  const navigate = useNavigate();
  const { onShowHelp, onFocusSearch, onEscape, customShortcuts = [] } = options;

  const handleKeyDown = useCallback(
    (event) => {
      // Ignore if typing in an input
      const target = event.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow escape to work in inputs
        if (event.key !== "Escape") return;
      }

      const allShortcuts = [...SHORTCUTS, ...customShortcuts];

      for (const shortcut of allShortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey || shortcut.key === "?";
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && keyMatch && (shortcut.shift ? event.shiftKey : true)) {
          event.preventDefault();

          switch (shortcut.action) {
            case "newTicket":
              navigate("/tickets/new");
              toast.success("Creating new ticket...");
              break;
            case "goTickets":
              navigate("/tickets");
              break;
            case "goDashboard":
              navigate("/dashboard");
              break;
            case "goReports":
              navigate("/reports");
              break;
            case "focusSearch":
              onFocusSearch?.();
              break;
            case "showHelp":
              onShowHelp?.();
              break;
            case "escape":
              onEscape?.();
              break;
            default:
              // Custom action handler
              if (typeof shortcut.handler === "function") {
                shortcut.handler();
              }
          }
          break;
        }
      }
    },
    [navigate, onShowHelp, onFocusSearch, onEscape, customShortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts: SHORTCUTS };
}

export function KeyboardShortcutsHelp({ shortcuts = SHORTCUTS }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Navigation</h4>
        <div className="space-y-1">
          {shortcuts
            .filter((s) => s.action.startsWith("go") || s.action === "newTicket")
            .map((shortcut) => (
              <ShortcutRow key={shortcut.key + shortcut.action} shortcut={shortcut} />
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
        <div className="space-y-1">
          {shortcuts
            .filter((s) => !s.action.startsWith("go") && s.action !== "newTicket")
            .map((shortcut) => (
              <ShortcutRow key={shortcut.key + shortcut.action} shortcut={shortcut} />
            ))}
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.ctrl && (
          <>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
              ⌘/Ctrl
            </kbd>
            <span className="text-muted-foreground">+</span>
          </>
        )}
        {shortcut.shift && (
          <>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
              Shift
            </kbd>
            <span className="text-muted-foreground">+</span>
          </>
        )}
        <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
          {shortcut.key.toUpperCase()}
        </kbd>
      </div>
    </div>
  );
}

export default function KeyboardShortcutsProvider({ children }) {
  return <>{children}</>;
}
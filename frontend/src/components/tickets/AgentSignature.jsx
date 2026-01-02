import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PenLine, Settings } from "lucide-react";
import { toast } from "sonner";

// Default signatures for demo
const DEFAULT_SIGNATURES = {
  "2": {
    enabled: true,
    content: "Best regards,\n**Support Agent**\nWorkDesks Support Team\n📧 support@workdesks.com",
  },
  "4": {
    enabled: true,
    content: "Thanks for reaching out!\n\n**Sarah Wilson**\nSenior Support Specialist\nWorkDesks | Making work easier",
  },
  "5": {
    enabled: true,
    content: "Let me know if you need anything else!\n\n**Mike Johnson**\nTechnical Support Engineer\n🔧 Here to help!",
  },
};

export function useAgentSignature(agentId) {
  const [signatures, setSignatures] = useState(DEFAULT_SIGNATURES);

  const signature = signatures[agentId];
  
  const appendSignature = (message) => {
    if (!signature?.enabled || !signature?.content) return message;
    return message.trim() + "\n\n---\n" + signature.content;
  };

  const updateSignature = (content, enabled) => {
    setSignatures((prev) => ({
      ...prev,
      [agentId]: { content, enabled },
    }));
  };

  return {
    signature,
    appendSignature,
    updateSignature,
    isEnabled: signature?.enabled ?? false,
  };
}

export function AgentSignatureSettings({ agentId, trigger }) {
  const { signature, updateSignature, isEnabled } = useAgentSignature(agentId);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(signature?.content || "");
  const [enabled, setEnabled] = useState(isEnabled);

  const handleSave = () => {
    updateSignature(content, enabled);
    toast.success("Signature updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <PenLine className="mr-2 h-4 w-4" />
            Signature
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Email Signature
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable signature</Label>
              <p className="text-sm text-muted-foreground">
                Automatically append to all replies
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label>Signature content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Best regards,&#10;Your Name&#10;Your Title"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supports **bold** and basic Markdown formatting
            </p>
          </div>

          {/* Preview */}
          {content && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 rounded-lg border bg-muted/50 text-sm whitespace-pre-wrap">
                ---
                <br />
                {content.split("**").map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i}>{part}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Signature</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SignaturePreview({ signature }) {
  if (!signature?.enabled || !signature?.content) return null;

  return (
    <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <PenLine className="h-3 w-3" />
        <span className="text-xs">Your signature will be added</span>
      </div>
      <div className="p-2 rounded bg-muted/50 text-xs whitespace-pre-wrap opacity-60">
        ---
        <br />
        {signature.content.slice(0, 100)}
        {signature.content.length > 100 && "..."}
      </div>
    </div>
  );
}
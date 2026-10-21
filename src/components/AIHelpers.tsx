import { useState } from "react";
import { Check, Copy, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Could not copy. Please select and copy manually.");
        }
      }}
    >
      {done ? <Check /> : <Copy />} {done ? "Copied" : "Copy"}
    </Button>
  );
}

export function ErrorNote({ message }: { message: string }) {
  const setup = /not configured|LOVABLE_API_KEY|401/i.test(message);
  return (
    <div className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertCircle className="size-5 shrink-0 text-destructive" />
      <div>
        <p className="font-medium text-destructive">{message}</p>
        {setup && (
          <p className="mt-1 text-muted-foreground">
            Setup: this app uses Lovable AI. Open your Lovable project, make sure Lovable AI is enabled in the workspace
            settings, then try again. No fake responses are shown while AI is unavailable.
          </p>
        )}
      </div>
    </div>
  );
}

export function Thinking({ label = "Generating with AI…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-primary" /> {label}
    </div>
  );
}

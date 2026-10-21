import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SAVE_KEY, clearRecent } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AI Workplace Assistant" },
      { name: "description", content: "Manage local saving and privacy for your AI workplace assistant." },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Manage local saving and privacy settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [save, setSave] = useState(true);
  useEffect(() => setSave(localStorage.getItem(SAVE_KEY) !== "off"), []);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Control how your data is kept on this device." />
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-card">
          <div>
            <p className="font-medium">Save history on this device</p>
            <p className="text-sm text-muted-foreground">Keeps recent outputs and chat in your browser only.</p>
          </div>
          <Switch checked={save} onCheckedChange={(v) => { setSave(v); localStorage.setItem(SAVE_KEY, v ? "on" : "off"); }} />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-card">
          <div>
            <p className="font-medium">Clear saved data</p>
            <p className="text-sm text-muted-foreground">Removes recent outputs and chat history.</p>
          </div>
          <Button variant="outline" onClick={() => { clearRecent(); toast.success("Saved data cleared"); }}>Clear</Button>
        </div>
        <div className="rounded-2xl border bg-accent/50 p-5 text-sm">
          <p className="font-medium">Responsible AI use</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>AI can make mistakes — verify facts, dates and names before sending anything.</li>
            <li>Don't enter confidential, client, financial or personal information.</li>
            <li>You remain responsible for any content you use.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

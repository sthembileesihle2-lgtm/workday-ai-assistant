import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/AppShell";
import { CopyButton, ErrorNote, Thinking } from "@/components/AIHelpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAI } from "@/lib/ai.functions";
import { addRecent } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · AI Workplace Assistant" },
      { name: "description", content: "Generate personalised professional emails in formal, friendly or persuasive tones." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate personalised professional emails with AI." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const gen = useServerFn(generateAI);
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [recipient, setRecipient] = useState("");
  const [instr, setInstr] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!instr.trim()) return setError("Please describe what the email should say.");
    setLoading(true);
    setError("");
    try {
      const prompt = `Tone: ${tone}\nRecipient: ${recipient || "not specified"}\nInstructions: ${instr}`;
      const r = await gen({ data: { kind: "email", messages: [{ role: "user", content: prompt }] } });
      if (r.error) setError(r.error);
      else if (r.text) {
        setOut(r.text);
        addRecent({ type: "email", title: r.text.split("\n")[0].replace(/^Subject:\s*/i, "") || "Email", content: r.text });
      }
    } catch {
      setError("Network error — could not reach the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Smart Email Generator" subtitle="Describe your email and pick a tone. Edit the result freely." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
          <div>
            <Label className="mb-2 block">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", tone === t ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="rec" className="mb-2 block">Recipient (optional)</Label>
            <Input id="rec" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. My manager, Sarah" />
          </div>
          <div>
            <Label htmlFor="ins" className="mb-2 block">What should the email say?</Label>
            <Textarea id="ins" rows={7} value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="e.g. Request a 2-day extension on the Q3 report because of delayed data from finance." />
          </div>
          <Button onClick={run} disabled={loading} className="w-full rounded-xl">
            <Wand2 /> {loading ? "Generating…" : "Generate email"}
          </Button>
          {error && <ErrorNote message={error} />}
        </div>
        <div className="flex flex-col rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display font-semibold">Your email</p>
            <CopyButton text={out} />
          </div>
          {loading && <Thinking label="Writing your email…" />}
          <Textarea value={out} onChange={(e) => setOut(e.target.value)} placeholder="Your AI-generated email will appear here. You can edit it directly." className="mt-2 min-h-[320px] flex-1 resize-y" />
        </div>
      </div>
    </div>
  );
}

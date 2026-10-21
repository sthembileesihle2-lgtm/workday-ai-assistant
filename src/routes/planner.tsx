import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, CalendarCheck, Pencil, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/AppShell";
import { CopyButton, ErrorNote, Thinking } from "@/components/AIHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateAI } from "@/lib/ai.functions";
import { addRecent } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · AI Workplace Assistant" },
      { name: "description", content: "Turn tasks, deadlines and priorities into a daily or weekly schedule." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Generate practical daily or weekly schedules with AI." },
    ],
  }),
  component: Planner,
});

type Priority = "High" | "Medium" | "Low";
type Task = { id: number; name: string; deadline: string; priority: Priority };
const P: Priority[] = ["High", "Medium", "Low"];
const pClass: Record<Priority, string> = {
  High: "bg-primary text-primary-foreground",
  Medium: "bg-accent text-accent-foreground",
  Low: "bg-muted text-muted-foreground",
};

function Planner() {
  const gen = useServerFn(generateAI);
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, name: "", deadline: "", priority: "High" }]);
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upd = (id: number, p: Partial<Task>) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const move = (i: number, d: number) =>
    setTasks((t) => {
      const j = i + d;
      if (j < 0 || j >= t.length) return t;
      const c = [...t];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  async function run() {
    const valid = tasks.filter((t) => t.name.trim());
    if (!valid.length) return setError("Add at least one task.");
    setLoading(true);
    setError("");
    try {
      const list = valid.map((t, i) => `${i + 1}. ${t.name} — priority: ${t.priority}${t.deadline ? `, deadline: ${t.deadline}` : ""}`).join("\n");
      const prompt = `Create a ${period} schedule.\nToday: ${new Date().toDateString()}\nTasks (in my preferred order):\n${list}\nExtra context: ${notes || "none"}`;
      const r = await gen({ data: { kind: "planner", messages: [{ role: "user", content: prompt }] } });
      if (r.error) setError(r.error);
      else if (r.text) {
        setOut(r.text);
        setEdit(false);
        addRecent({ type: "planner", title: `${period === "daily" ? "Daily" : "Weekly"} plan · ${valid.length} tasks`, content: r.text });
      }
    } catch {
      setError("Network error — could not reach the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="AI Task Planner" subtitle="List your tasks, set priorities and let AI build a realistic plan." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
          <div className="inline-flex rounded-full border bg-muted p-1">
            {(["daily", "weekly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium capitalize transition", period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {p}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div key={t.id} className="space-y-2 rounded-xl border bg-background p-3">
                <div className="flex gap-2">
                  <Input value={t.name} onChange={(e) => upd(t.id, { name: e.target.value })} placeholder={`Task ${i + 1}`} />
                  <Button variant="ghost" size="icon" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setTasks((x) => x.filter((y) => y.id !== t.id))}><Trash2 /></Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input type="date" value={t.deadline} onChange={(e) => upd(t.id, { deadline: e.target.value })} className="w-auto" />
                  {P.map((p) => (
                    <button key={p} onClick={() => upd(t.id, { priority: p })} className={cn("rounded-full px-3 py-1 text-xs font-medium transition", t.priority === p ? pClass[p] : "border text-muted-foreground")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setTasks((t) => [...t, { id: Date.now(), name: "", deadline: "", priority: "Medium" }])}>
            <Plus /> Add task
          </Button>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Extra context (e.g. working hours 8–17, meeting at 10:00)" />
          <Button onClick={run} disabled={loading} className="w-full rounded-xl">
            <CalendarCheck /> {loading ? "Planning…" : "Generate schedule"}
          </Button>
          {error && <ErrorNote message={error} />}
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-display font-semibold">Your schedule</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!out} onClick={() => setEdit((e) => !e)}>{edit ? <Eye /> : <Pencil />}{edit ? "Preview" : "Edit"}</Button>
              <CopyButton text={out} />
            </div>
          </div>
          {loading && <Thinking label="Building your plan…" />}
          {!out && !loading && <p className="text-sm text-muted-foreground">Your AI-generated schedule will appear here.</p>}
          {out && (edit ? (
            <Textarea value={out} onChange={(e) => setOut(e.target.value)} className="min-h-[420px] font-mono text-sm" />
          ) : (
            <div className="prose-ai"><ReactMarkdown>{out}</ReactMarkdown></div>
          ))}
        </div>
      </div>
    </div>
  );
}

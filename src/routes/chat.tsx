import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Flower2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/AppShell";
import { CopyButton, ErrorNote, Thinking } from "@/components/AIHelpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAI } from "@/lib/ai.functions";
import { addRecent, canSave } from "@/lib/store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot · AI Workplace Assistant" },
      { name: "description", content: "Chat with an AI workplace assistant about productivity, communication and planning." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Your AI assistant for productivity and workplace problem-solving." },
    ],
  }),
  component: Chat,
});

type Msg = { role: "user" | "assistant"; content: string };
const SUGGEST = ["How do I prioritise when everything is urgent?", "Help me give constructive feedback to a colleague", "Tips for running a shorter, better meeting"];

function Chat() {
  const gen = useServerFn(generateAI);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setMsgs(JSON.parse(localStorage.getItem("awpa:chat") || "[]")); } catch {}
  }, []);
  useEffect(() => {
    if (canSave()) localStorage.setItem("awpa:chat", JSON.stringify(msgs));
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const r = await gen({ data: { kind: "chat", messages: next.slice(-30) } });
      if (r.error) setError(r.error);
      else if (r.text) {
        setMsgs([...next, { role: "assistant", content: r.text }]);
        addRecent({ type: "chat", title: t, content: r.text });
      }
    } catch {
      setError("Network error — could not reach the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[480px] flex-col">
      <div className="flex items-start justify-between">
        <PageHeader title="AI Chatbot" subtitle="Ask about productivity, communication, planning or workplace challenges." />
        {msgs.length > 0 && <Button variant="ghost" size="sm" onClick={() => setMsgs([])}><Trash2 /> Clear</Button>}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border bg-card p-4 shadow-card md:p-6">
        {msgs.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Flower2 /></div>
              <p className="font-display font-semibold">Hi, I'm Blossom — how can I help?</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGEST.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1.5 text-sm hover:border-primary/50">{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Flower2 className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="prose-ai text-sm"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                <div className="mt-2"><CopyButton text={m.content} /></div>
              </div>
            </div>
          ),
        )}
        {loading && <Thinking label="Blossom is thinking…" />}
        {error && <ErrorNote message={error} />}
        <div ref={end} />
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <Textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Type your question… (avoid confidential info)"
          className="min-h-12 resize-none rounded-xl bg-card"
        />
        <Button type="submit" size="icon" className="size-12 shrink-0 rounded-xl" disabled={loading || !input.trim()} aria-label="Send"><Send /></Button>
      </form>
    </div>
  );
}

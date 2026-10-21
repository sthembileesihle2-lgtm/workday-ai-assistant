import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, CalendarCheck, MessageCircle, ArrowRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { useRecent } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AI Workplace Productivity Assistant" },
      { name: "description", content: "Write emails, plan your week and get workplace advice with AI." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Write emails, plan your week and get workplace advice with AI." },
    ],
  }),
  component: Dashboard,
});

const ACTIONS = [
  { to: "/email", icon: Mail, title: "Write an email", desc: "Formal, friendly or persuasive drafts in seconds." },
  { to: "/planner", icon: CalendarCheck, title: "Plan my day", desc: "Turn tasks and deadlines into a realistic schedule." },
  { to: "/chat", icon: MessageCircle, title: "Ask the assistant", desc: "Get help with productivity and workplace problems." },
] as const;

const LABEL = { email: "Email", planner: "Plan", chat: "Chat" };

function Dashboard() {
  const recent = useRecent();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div>
      <div className="mb-8 rounded-3xl bg-gradient-hero p-6 shadow-soft md:p-10">
        <p className="text-sm font-medium text-primary" suppressHydrationWarning>{greet} 👋</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Welcome to your AI workspace</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">Draft emails, organise your schedule and solve workplace challenges — faster.</p>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Quick actions</h2>
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="group rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-accent text-primary">
              <a.icon className="size-5" />
            </div>
            <p className="font-display font-semibold">{a.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <PageHeader title="Recent outputs" subtitle="Your latest AI results, saved on this device." />
      {recent.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">Nothing yet — try a quick action above.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {recent.map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">{LABEL[r.type]}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Clock className="size-3" />{new Date(r.at).toLocaleString()}</span>
              </div>
              <p className="truncate font-medium">{r.title}</p>
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

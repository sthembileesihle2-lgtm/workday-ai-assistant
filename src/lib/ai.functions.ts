import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PROMPTS = {
  email:
    "You are an expert workplace communication writer. Write one complete, personalised, professional email based on the user's instructions and requested tone. Start with a line 'Subject: ...', then a blank line, then the email body with greeting and sign-off. Use placeholders like [Name] only where details are missing. Output only the email.",
  planner:
    "You are a practical productivity planner. From the user's tasks, deadlines, priorities and chosen period (daily or weekly), produce a realistic schedule in Markdown. Group by day (weekly) or by time block (daily), include times, mark priority (High/Medium/Low), add short breaks, and finish with 2-3 concise tips. Be specific to the tasks given.",
  chat:
    "You are Blossom, a friendly, expert workplace productivity assistant. Help with productivity, communication, planning, and workplace problem-solving. Give clear, actionable, concise answers using Markdown when helpful. Remind users not to share confidential information if they appear to.",
} as const;

const Input = z.object({
  kind: z.enum(["email", "planner", "chat"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) }))
    .min(1)
    .max(40),
});

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ text?: string; error?: string; status?: number }> => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { error: "AI is not configured: LOVABLE_API_KEY is missing.", status: 401 };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: PROMPTS[data.kind],
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      let msg = `AI request failed (${res.status}).`;
      try {
        const j = await res.json();
        msg = j?.error?.message || j?.message || msg;
      } catch {}
      if (res.status === 429) msg = "Too many requests right now. Please wait a moment and try again.";
      if (res.status === 402) msg = msg || "AI credits are exhausted. Please add credits to continue.";
      return { error: msg, status: res.status };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let err: string | undefined;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "error" || ev.type === "response.failed")
            err = ev.error?.message || ev.response?.error?.message || "The AI could not complete this request.";
        } catch {}
      }
    }
    if (!text.trim()) return { error: err || "The AI returned an empty response. Please rephrase and try again.", status: 500 };
    return { text: text.trim() };
  });

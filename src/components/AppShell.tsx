import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, CalendarCheck, MessageCircle, Settings, Flower2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export const NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Smart Email Generator", url: "/email", icon: Mail },
  { title: "AI Task Planner", url: "/planner", icon: CalendarCheck },
  { title: "AI Chatbot", url: "/chat", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Flower2 className="size-5" />
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="font-display text-sm font-bold">AI Workplace</p>
            <p className="text-xs text-muted-foreground">Productivity Assistant</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title} className="h-10 rounded-xl">
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur">
            <SidebarTrigger />
            <span className="font-display text-sm font-semibold text-muted-foreground">AI Workplace Productivity Assistant</span>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
          <footer className="mx-auto flex w-full max-w-6xl items-start gap-2 px-4 pb-6 text-xs text-muted-foreground md:px-8">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Responsible AI: AI-generated content can be inaccurate. Always review and verify outputs before use, and never
              enter confidential, personal, or sensitive workplace information.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Inbox, Calendar, CalendarDays, Filter, LogOut, Plus, Search, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/tasks";
import { isToday, parseISO } from "date-fns";

const items = [
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/today", label: "Today", icon: Calendar },
  { to: "/upcoming", label: "Upcoming", icon: CalendarDays },
  { to: "/filters", label: "Filters & Labels", icon: Filter },
] as const;

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const counts = {
    "/inbox": tasks.filter((t) => !t.completed).length,
    "/today": tasks.filter((t) => !t.completed && t.due_date && isToday(parseISO(t.due_date))).length,
    "/upcoming": tasks.filter((t) => !t.completed && t.due_date).length,
    "/filters": 0,
  } as Record<string, number>;

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <aside
      className={`bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col w-72 shrink-0 z-40
        fixed md:static inset-y-0 left-0 transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {user?.email?.[0].toUpperCase() ?? "T"}
          </div>
          <span className="font-semibold text-sm truncate max-w-[140px]">
            {user?.email?.split("@")[0]}
          </span>
        </div>
        <button onClick={onClose} className="md:hidden p-1.5 rounded hover:bg-sidebar-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-4 pb-2 space-y-1">
        <button
          onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("todoist:addtask")); }}
          className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-primary font-medium hover:bg-sidebar-accent transition"
        >
          <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Add task
        </button>
        <button
          onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("todoist:focussearch")); }}
          className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>

      <nav className="px-3 mt-2 space-y-0.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition
                ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/60"}`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {label}
              </span>
              {counts[to] > 0 && (
                <span className="text-xs text-muted-foreground">{counts[to]}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </aside>
  );
}

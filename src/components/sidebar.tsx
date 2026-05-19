import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Inbox, Calendar, CalendarDays, Filter, LogOut, Plus, Search, X, Hash, BarChart3, ChevronDown, ChevronRight, FolderPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/tasks";
import { createProject, deleteProject, fetchProjects } from "@/lib/projects";
import { isToday, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LABEL_COLORS } from "@/lib/labels";
import { toast } from "sonner";

const items = [
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/today", label: "Today", icon: Calendar },
  { to: "/upcoming", label: "Upcoming", icon: CalendarDays },
  { to: "/filters", label: "Filters & Labels", icon: Filter },
  { to: "/reporting", label: "Reporting", icon: BarChart3 },
] as const;

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("charcoal");

  const counts = {
    "/inbox": tasks.filter((t) => !t.completed && !t.project_id).length,
    "/today": tasks.filter((t) => !t.completed && t.due_date && isToday(parseISO(t.due_date))).length,
    "/upcoming": tasks.filter((t) => !t.completed && t.due_date).length,
  } as Record<string, number>;

  const projectCount = (id: string) =>
    tasks.filter((t) => t.project_id === id && !t.completed).length;

  const create = useMutation({
    mutationFn: () => createProject({ name: name.trim(), color }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project added");
      setAddOpen(false); setName(""); setColor("charcoal");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <>
      <aside
        className={`bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col w-72 shrink-0 z-40
          fixed md:static inset-y-0 left-0 transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-accent text-foreground flex items-center justify-center text-sm font-bold">
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

        <nav className="px-3 mt-2 space-y-0.5 overflow-auto">
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

          <div className="mt-6">
            <div className="group flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <button onClick={() => setProjectsOpen((o) => !o)} className="flex items-center gap-1 hover:text-foreground">
                {projectsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                My Projects
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-sidebar-accent"
                aria-label="add project"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {projectsOpen && (
              <div className="space-y-0.5 mt-1">
                {projects.length === 0 && (
                  <button onClick={() => setAddOpen(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-sidebar-accent/60">
                    <FolderPlus className="h-3.5 w-3.5" /> Add a project
                  </button>
                )}
                {projects.map((p) => {
                  const active = path === `/project/${p.id}`;
                  return (
                    <div key={p.id} className="group flex items-center">
                      <Link
                        to="/project/$projectId"
                        params={{ projectId: p.id }}
                        onClick={onClose}
                        className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition min-w-0
                          ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/60"}`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Hash className="h-4 w-4 shrink-0" style={{ color: LABEL_COLORS.find(c => c.value === p.color)?.hex }} />
                          <span className="truncate">{p.name} {p.emoji}</span>
                        </span>
                        {projectCount(p.id) > 0 && <span className="text-xs text-muted-foreground">{projectCount(p.id)}</span>}
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); if (confirm(`Delete project "${p.name}"?`)) del.mutate(p.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 mr-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-destructive transition"
                        aria-label="delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto p-3 border-t border-sidebar-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add project</DialogTitle></DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                {LABEL_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setAddOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/70">Cancel</button>
              <button type="submit" disabled={!name.trim() || create.isPending}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                Add
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

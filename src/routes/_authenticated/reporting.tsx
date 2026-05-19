import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/tasks";
import { fetchProjects } from "@/lib/projects";
import { BarChart3, CheckCircle2, Clock, Flag } from "lucide-react";
import { isToday, parseISO, isPast } from "date-fns";

export const Route = createFileRoute("/_authenticated/reporting")({
  component: ReportingPage,
});

function ReportingPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const today = tasks.filter((t) => !t.completed && t.due_date && isToday(parseISO(t.due_date))).length;
  const overdue = tasks.filter((t) => !t.completed && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))).length;

  const byPriority = [1, 2, 3, 4].map((p) => ({
    p,
    n: tasks.filter((t) => !t.completed && t.priority === p).length,
  }));

  const stats = [
    { label: "Completed", value: done, icon: CheckCircle2, color: "text-priority-4" },
    { label: "Due today", value: today, icon: Clock, color: "text-priority-2" },
    { label: "Overdue", value: overdue, icon: Flag, color: "text-priority-1" },
    { label: "All tasks", value: total, icon: BarChart3, color: "text-primary" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Reporting</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="border rounded-xl p-4 bg-card">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active by priority</h2>
          <div className="border rounded-xl divide-y bg-card">
            {byPriority.map(({ p, n }) => (
              <div key={p} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2"><Flag className={`h-4 w-4 text-priority-${p}`} /> Priority {p}</span>
                <span className="text-muted-foreground">{n}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects</h2>
          {projects.length === 0 ? (
            <div className="text-sm text-muted-foreground border rounded-xl p-6 text-center bg-card">No projects yet.</div>
          ) : (
            <div className="border rounded-xl divide-y bg-card">
              {projects.map((p) => {
                const open = tasks.filter((t) => t.project_id === p.id && !t.completed).length;
                const closed = tasks.filter((t) => t.project_id === p.id && t.completed).length;
                return (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span># {p.name}</span>
                    <span className="text-xs text-muted-foreground">{open} active · {closed} done</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

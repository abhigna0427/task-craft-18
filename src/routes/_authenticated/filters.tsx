import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/tasks";
import { Flag, Tag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/filters")({
  component: FiltersPage,
});

function FiltersPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const labels = Array.from(new Set(tasks.map((t) => t.label).filter(Boolean) as string[]));
  const counts = [1, 2, 3, 4].map((p) => ({ p, n: tasks.filter((t) => t.priority === p && !t.completed).length }));

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Filters & Labels</h1>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Priorities</h2>
          <div className="border rounded-xl divide-y bg-card">
            {counts.map(({ p, n }) => (
              <Link key={p} to="/inbox" className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition">
                <span className="flex items-center gap-2 text-sm">
                  <Flag className={`h-4 w-4 text-priority-${p}`} /> Priority {p}
                </span>
                <span className="text-xs text-muted-foreground">{n}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Labels</h2>
          {labels.length === 0 ? (
            <div className="text-sm text-muted-foreground border rounded-xl p-6 text-center bg-card">
              Your list of labels will show up here.
            </div>
          ) : (
            <div className="border rounded-xl divide-y bg-card">
              {labels.map((l) => (
                <div key={l} className="flex items-center gap-2 px-4 py-3 text-sm">
                  <Tag className="h-4 w-4 text-primary" /> @{l}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {tasks.filter((t) => t.label === l && !t.completed).length}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

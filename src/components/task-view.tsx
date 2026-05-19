import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Inbox as InboxIcon } from "lucide-react";
import { createTask, deleteTask, fetchTasks, updateTask, type Task } from "@/lib/tasks";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";
import { toast } from "sonner";

type Filter = "all" | "active" | "completed" | "p1" | "p2" | "p3" | "p4";

export function TaskView({
  title,
  emptyTitle,
  emptyDescription,
  filter,
  defaultView = "inbox",
  defaultDueDate,
  defaultProjectId,
  groupByDate = false,
  headerExtra,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  filter: (t: Task) => boolean;
  defaultView?: string;
  defaultDueDate?: string;
  defaultProjectId?: string | null;
  groupByDate?: boolean;
  headerExtra?: React.ReactNode;
}) {
  const qc = useQueryClient();
  const { data: all = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onAdd = () => setAdding(true);
    const onSearch = () => searchRef.current?.focus();
    window.addEventListener("todoist:addtask", onAdd);
    window.addEventListener("todoist:focussearch", onSearch);
    return () => {
      window.removeEventListener("todoist:addtask", onAdd);
      window.removeEventListener("todoist:focussearch", onSearch);
    };
  }, []);

  const tasks = useMemo(() => {
    let list = all.filter(filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
    }
    if (statusFilter === "active") list = list.filter((t) => !t.completed);
    else if (statusFilter === "completed") list = list.filter((t) => t.completed);
    else if (statusFilter.startsWith("p")) {
      const p = Number(statusFilter.slice(1));
      list = list.filter((t) => t.priority === p);
    }
    return list;
  }, [all, filter, search, statusFilter]);

  const create = useMutation({
    mutationFn: createTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task added"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) => updateTask(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task deleted"); },
  });

  const grouped = useMemo(() => {
    if (!groupByDate) return null;
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const k = t.due_date ?? "No date";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks, groupByDate]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          {headerExtra}
        </header>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchRef}
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Filter)}
            className="rounded-md border bg-card px-3 py-2 text-sm outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="p1">Priority 1</option>
            <option value="p2">Priority 2</option>
            <option value="p3">Priority 3</option>
            <option value="p4">Priority 4</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground py-10 text-center">Loading…</div>
        ) : tasks.length === 0 && !adding ? (
          <div className="text-center py-16">
            <div className="mx-auto h-14 w-14 rounded-full bg-accent flex items-center justify-center mb-4">
              <InboxIcon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{emptyTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{emptyDescription}</p>
            <button onClick={() => setAdding(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
              <Plus className="h-4 w-4" /> Add task
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {groupByDate ? (
              grouped!.map(([date, list]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-sm font-semibold border-b pb-2 mb-1">{date}</h3>
                  {list.map((t) => (
                    <TaskItem key={t.id} task={t}
                      onToggle={() => update.mutate({ id: t.id, patch: { completed: !t.completed } })}
                      onUpdate={async (patch) => { await update.mutateAsync({ id: t.id, patch }); }}
                      onDelete={() => del.mutate(t.id)}
                    />
                  ))}
                </div>
              ))
            ) : (
              tasks.map((t) => (
                <TaskItem key={t.id} task={t}
                  onToggle={() => update.mutate({ id: t.id, patch: { completed: !t.completed } })}
                  onUpdate={async (patch) => { await update.mutateAsync({ id: t.id, patch }); }}
                  onDelete={() => del.mutate(t.id)}
                />
              ))
            )}

            {!adding && (
              <button onClick={() => setAdding(true)}
                className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition group">
                <span className="h-5 w-5 rounded-full border border-dashed flex items-center justify-center group-hover:border-primary">
                  <Plus className="h-3 w-3" />
                </span>
                Add task
              </button>
            )}
          </div>
        )}

        {adding && (
          <div className="mt-4">
            <TaskForm
              defaultView={defaultView}
              defaultDueDate={defaultDueDate}
              onSubmit={async (t) => { await create.mutateAsync(t); setAdding(false); }}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { createTask, deleteTask, fetchTasks, updateTask, type Task } from "@/lib/tasks";
import { TaskItem } from "@/components/task-item";
import { TaskForm } from "@/components/task-form";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/upcoming")({
  component: UpcomingPage,
});

function UpcomingPage() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const [anchor, setAnchor] = useState(new Date());
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const dueTasks = useMemo(() => tasks.filter((t) => !!t.due_date), [tasks]);

  const tasksByDay = (d: Date) =>
    dueTasks.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), d));

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) => updateTask(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const del = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task deleted"); },
  });
  const create = useMutation({
    mutationFn: createTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Upcoming</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{format(weekStart, "MMM yyyy")}</span>
            <button onClick={() => setAnchor(addDays(anchor, -7))} className="p-1 rounded hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setAnchor(new Date())} className="px-2 py-1 rounded border hover:bg-muted text-xs">Today</button>
            <button onClick={() => setAnchor(addDays(anchor, 7))} className="p-1 rounded hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1 mb-6 border-b pb-3">
          {days.map((d) => {
            const isCurrentDay = isSameDay(d, today);
            const count = tasksByDay(d).filter((t) => !t.completed).length;
            return (
              <button key={d.toISOString()} onClick={() => setAnchor(d)}
                className={`text-center py-2 rounded-md transition ${isSameDay(d, anchor) ? "bg-accent" : "hover:bg-muted/50"}`}>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{format(d, "EEE")}</div>
                <div className={`mt-1 text-sm font-semibold inline-flex items-center justify-center h-6 min-w-6 px-1 rounded ${isCurrentDay ? "bg-primary text-primary-foreground" : ""}`}>
                  {format(d, "d")}
                </div>
                {count > 0 && <div className="mt-0.5 h-1 w-1 mx-auto rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {days.map((d) => {
            const list = tasksByDay(d);
            return (
              <DaySection key={d.toISOString()} day={d}
                tasks={list}
                onCreate={(payload) => create.mutateAsync(payload)}
                onToggle={(t) => update.mutate({ id: t.id, patch: { completed: !t.completed } })}
                onUpdate={async (t, patch) => { await update.mutateAsync({ id: t.id, patch }); }}
                onDelete={(t) => del.mutate(t.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DaySection({
  day, tasks, onCreate, onToggle, onUpdate, onDelete,
}: {
  day: Date;
  tasks: Task[];
  onCreate: (payload: Parameters<typeof createTask>[0]) => Promise<unknown>;
  onToggle: (t: Task) => void;
  onUpdate: (t: Task, patch: Partial<Task>) => Promise<void>;
  onDelete: (t: Task) => void;
}) {
  const [adding, setAdding] = useState(false);
  const iso = format(day, "yyyy-MM-dd");
  const isToday = isSameDay(day, new Date());
  const label = `${format(day, "d MMM")} · ${isToday ? "Today · " : ""}${format(day, "EEEE")}`;

  return (
    <section>
      <h3 className="text-sm font-semibold border-b pb-2 mb-2">{label}</h3>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t}
          onToggle={() => onToggle(t)}
          onUpdate={(patch) => onUpdate(t, patch)}
          onDelete={() => onDelete(t)}
        />
      ))}
      {adding ? (
        <div className="mt-2">
          <TaskForm
            defaultView="upcoming"
            defaultDueDate={iso}
            onSubmit={async (payload) => { await onCreate(payload); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
          <Plus className="h-4 w-4" /> Add task
        </button>
      )}
    </section>
  );
}

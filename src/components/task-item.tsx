import { useState } from "react";
import { Pencil, Trash2, Calendar, Flag } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { TaskForm } from "./task-form";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

const priorityRing: Record<number, string> = {
  1: "border-priority-1 text-priority-1",
  2: "border-priority-2 text-priority-2",
  3: "border-priority-3 text-priority-3",
  4: "border-priority-4 text-priority-4",
};

function formatDate(d: string) {
  const date = parseISO(d);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "d MMM");
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onUpdate: (patch: Partial<Task>) => Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <TaskForm
        initial={task}
        onSubmit={async (patch) => { await onUpdate(patch); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="group flex items-start gap-3 py-3 border-b last:border-b-0 hover:bg-muted/40 px-1 -mx-1 rounded transition">
      <button
        onClick={onToggle}
        aria-label="toggle"
        className={`mt-0.5 h-5 w-5 rounded-full border-2 ${priorityRing[task.priority]} flex items-center justify-center shrink-0 transition hover:bg-muted`}
      >
        {task.completed && <span className="h-2 w-2 rounded-full bg-current" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] ${task.completed ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          {task.due_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(task.due_date)}
            </span>
          )}
          {task.priority < 4 && (
            <span className={`inline-flex items-center gap-1 ${priorityRing[task.priority].split(" ")[1]}`}>
              <Flag className="h-3 w-3" /> P{task.priority}
            </span>
          )}
          {task.label && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground/70">
              @{task.label}
            </span>
          )}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-muted" aria-label="edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-muted text-destructive" aria-label="delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

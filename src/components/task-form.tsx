import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flag, Calendar as CalIcon, Tag, X, Inbox, Hash, ChevronDown } from "lucide-react";
import type { NewTask, Task } from "@/lib/tasks";
import { fetchProjects } from "@/lib/projects";
import { LABEL_COLORS } from "@/lib/labels";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const priorities = [
  { value: 1, color: "text-priority-1", label: "Priority 1" },
  { value: 2, color: "text-priority-2", label: "Priority 2" },
  { value: 3, color: "text-priority-3", label: "Priority 3" },
  { value: 4, color: "text-priority-4", label: "Priority 4" },
] as const;

export function TaskForm({
  initial,
  defaultView = "inbox",
  defaultDueDate,
  defaultProjectId,
  onSubmit,
  onCancel,
}: {
  initial?: Task;
  defaultView?: string;
  defaultDueDate?: string | null;
  defaultProjectId?: string | null;
  onSubmit: (t: NewTask) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<number>(initial?.priority ?? 4);
  const [dueDate, setDueDate] = useState<string>(initial?.due_date ?? defaultDueDate ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [projectId, setProjectId] = useState<string | null>(initial?.project_id ?? defaultProjectId ?? null);
  const [busy, setBusy] = useState(false);
  const [projOpen, setProjOpen] = useState(false);

  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const selectedProject = projects.find((p) => p.id === projectId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await onSubmit({
      title: title.trim(),
      description,
      priority,
      due_date: dueDate || null,
      label,
      project_id: projectId,
      view: initial?.view ?? defaultView,
      completed: initial?.completed ?? false,
    });
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="border rounded-xl p-3 bg-card shadow-sm animate-in fade-in slide-in-from-top-1">
      <input
        autoFocus
        placeholder="Task name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-1 py-1 text-[15px] font-medium outline-none bg-transparent placeholder:text-muted-foreground"
      />
      <input
        placeholder="Description"
        value={description ?? ""}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-1 py-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
      />
      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
        <label className="flex items-center gap-1.5 border rounded-md px-2 py-1 cursor-pointer hover:bg-muted">
          <CalIcon className="h-3.5 w-3.5" />
          <input type="date" value={dueDate ?? ""} onChange={(e) => setDueDate(e.target.value)}
            className="outline-none bg-transparent text-xs" />
        </label>
        <div className="flex items-center gap-1 border rounded-md px-2 py-1">
          <Flag className={`h-3.5 w-3.5 ${priorities.find(p=>p.value===priority)?.color}`} />
          <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}
            className="outline-none bg-transparent text-xs">
            {priorities.map((p) => <option key={p.value} value={p.value}>P{p.value}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1.5 border rounded-md px-2 py-1">
          <Tag className="h-3.5 w-3.5" />
          <input placeholder="label" value={label ?? ""} onChange={(e) => setLabel(e.target.value)}
            className="outline-none bg-transparent text-xs w-20" />
        </label>
      </div>
      <div className="flex justify-between items-center gap-2 mt-3 border-t pt-3">
        <Popover open={projOpen} onOpenChange={setProjOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md border hover:bg-muted">
              {selectedProject ? (
                <>
                  <Hash className="h-3.5 w-3.5" style={{ color: LABEL_COLORS.find(c => c.value === selectedProject.color)?.hex }} />
                  {selectedProject.name}
                </>
              ) : (
                <><Inbox className="h-3.5 w-3.5" /> Inbox</>
              )}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-1" align="start">
            <button type="button" onClick={() => { setProjectId(null); setProjOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted">
              <Inbox className="h-4 w-4" /> Inbox
            </button>
            {projects.length > 0 && <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">My Projects</div>}
            {projects.map((p) => (
              <button key={p.id} type="button" onClick={() => { setProjectId(p.id); setProjOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted">
                <Hash className="h-4 w-4" style={{ color: LABEL_COLORS.find(c => c.value === p.color)?.hex }} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-sm bg-muted hover:bg-muted/70 inline-flex items-center gap-1">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <button type="submit" disabled={!title.trim() || busy}
            className="px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {initial ? "Save" : "Add task"}
          </button>
        </div>
      </div>
    </form>
  );
}

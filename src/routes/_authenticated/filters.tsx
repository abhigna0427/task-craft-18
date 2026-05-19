import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Filter as FilterIcon, Tag } from "lucide-react";
import { fetchFilters, createFilter, deleteFilter } from "@/lib/filters";
import { fetchLabels, createLabel, deleteLabel, LABEL_COLORS } from "@/lib/labels";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/filters")({
  component: FiltersPage,
});

function FiltersPage() {
  const qc = useQueryClient();
  const { data: filters = [] } = useQuery({ queryKey: ["filters"], queryFn: fetchFilters });
  const { data: labels = [] } = useQuery({ queryKey: ["labels"], queryFn: fetchLabels });

  const [filterOpen, setFilterOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);

  const [fName, setFName] = useState("");
  const [fQuery, setFQuery] = useState("");
  const [fColor, setFColor] = useState("charcoal");

  const [lName, setLName] = useState("");
  const [lColor, setLColor] = useState("charcoal");

  const createF = useMutation({
    mutationFn: () => createFilter({ name: fName.trim(), query: fQuery.trim(), color: fColor }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["filters"] }); toast.success("Filter added"); setFilterOpen(false); setFName(""); setFQuery(""); setFColor("charcoal"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delF = useMutation({ mutationFn: deleteFilter, onSuccess: () => qc.invalidateQueries({ queryKey: ["filters"] }) });

  const createL = useMutation({
    mutationFn: () => createLabel({ name: lName.trim(), color: lColor }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["labels"] }); toast.success("Label added"); setLabelOpen(false); setLName(""); setLColor("charcoal"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delL = useMutation({ mutationFn: deleteLabel, onSuccess: () => qc.invalidateQueries({ queryKey: ["labels"] }) });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Filters &amp; Labels</h1>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider">My Filters</h2>
            <button onClick={() => setFilterOpen(true)} className="p-1.5 rounded hover:bg-muted" aria-label="add filter">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {filters.length === 0 ? (
            <div className="text-sm text-muted-foreground border rounded-xl p-6 text-center bg-card">
              No filters yet. Tip: try queries like <code>p1</code>, <code>today</code>, <code>overdue</code>, <code>@work</code>.
            </div>
          ) : (
            <div className="border rounded-xl divide-y bg-card">
              {filters.map((f) => (
                <div key={f.id} className="group flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition">
                  <Link to="/filter/$filterId" params={{ filterId: f.id }} className="flex items-center gap-2 text-sm flex-1">
                    <FilterIcon className="h-4 w-4" style={{ color: LABEL_COLORS.find(c => c.value === f.color)?.hex }} />
                    <span>{f.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{f.query}</span>
                  </Link>
                  <button onClick={() => delF.mutate(f.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Labels</h2>
            <button onClick={() => setLabelOpen(true)} className="p-1.5 rounded hover:bg-muted" aria-label="add label">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {labels.length === 0 ? (
            <div className="text-sm text-muted-foreground border rounded-xl p-6 text-center bg-card">
              Your list of labels will show up here.
            </div>
          ) : (
            <div className="border rounded-xl divide-y bg-card">
              {labels.map((l) => (
                <div key={l.id} className="group flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition">
                  <span className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4" style={{ color: LABEL_COLORS.find(c => c.value === l.color)?.hex }} />
                    @{l.name}
                  </span>
                  <button onClick={() => delL.mutate(l.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add filter</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (fName.trim()) createF.mutate(); }} className="space-y-4">
            <Field label="Name"><input autoFocus value={fName} onChange={(e) => setFName(e.target.value)} maxLength={60}
              className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring/30" /></Field>
            <Field label="Color">
              <select value={fColor} onChange={(e) => setFColor(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                {LABEL_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Query" hint="e.g. p1, today, overdue, @work">
              <input value={fQuery} onChange={(e) => setFQuery(e.target.value)} maxLength={1024}
                className="w-full px-3 py-2 border rounded-md text-sm font-mono outline-none focus:ring-2 focus:ring-ring/30" />
            </Field>
            <DialogFooter>
              <button type="button" onClick={() => setFilterOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/70">Cancel</button>
              <button type="submit" disabled={!fName.trim() || createF.isPending}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Add</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={labelOpen} onOpenChange={setLabelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add label</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (lName.trim()) createL.mutate(); }} className="space-y-4">
            <Field label="Name"><input autoFocus value={lName} onChange={(e) => setLName(e.target.value)} maxLength={60}
              className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-ring/30" /></Field>
            <Field label="Color">
              <select value={lColor} onChange={(e) => setLColor(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                {LABEL_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <DialogFooter>
              <button type="button" onClick={() => setLabelOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/70">Cancel</button>
              <button type="submit" disabled={!lName.trim() || createL.isPending}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Add</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

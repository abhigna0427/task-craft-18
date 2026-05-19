import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TaskView } from "@/components/task-view";
import { fetchFilters, evaluateFilter } from "@/lib/filters";
import { fetchTasks } from "@/lib/tasks";

export const Route = createFileRoute("/_authenticated/filter/$filterId")({
  component: FilterPage,
  notFoundComponent: () => <div className="p-8 text-muted-foreground">Filter not found.</div>,
});

function FilterPage() {
  const { filterId } = Route.useParams();
  const { data: filters = [], isLoading } = useQuery({ queryKey: ["filters"], queryFn: fetchFilters });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const f = filters.find((x) => x.id === filterId);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!f) throw notFound();

  const matching = new Set(evaluateFilter(f.query, tasks).map((t) => t.id));

  return (
    <TaskView
      title={f.name}
      emptyTitle="Nothing matches yet"
      emptyDescription={`This filter uses the query: "${f.query}".`}
      filter={(t) => matching.has(t.id)}
      defaultView="filter"
    />
  );
}

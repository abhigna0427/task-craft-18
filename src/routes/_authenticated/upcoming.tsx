import { createFileRoute } from "@tanstack/react-router";
import { TaskView } from "@/components/task-view";

export const Route = createFileRoute("/_authenticated/upcoming")({
  component: () => (
    <TaskView
      title="Upcoming"
      emptyTitle="Plan ahead with confidence"
      emptyDescription="Tasks with a due date appear here, grouped by day."
      filter={(t) => !!t.due_date}
      defaultView="upcoming"
      groupByDate
    />
  ),
});

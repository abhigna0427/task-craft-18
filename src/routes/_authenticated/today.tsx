import { createFileRoute } from "@tanstack/react-router";
import { TaskView } from "@/components/task-view";
import { isToday, parseISO } from "date-fns";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/today")({
  component: () => (
    <TaskView
      title={`Today · ${format(new Date(), "EEE d MMM")}`}
      emptyTitle="What do you need to get done today?"
      emptyDescription="By default, tasks added here will be due today."
      filter={(t) => !!t.due_date && isToday(parseISO(t.due_date))}
      defaultView="today"
      defaultDueDate={new Date().toISOString().slice(0, 10)}
    />
  ),
});

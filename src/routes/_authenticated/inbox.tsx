import { createFileRoute } from "@tanstack/react-router";
import { TaskView } from "@/components/task-view";

export const Route = createFileRoute("/_authenticated/inbox")({
  component: () => (
    <TaskView
      title="Inbox"
      emptyTitle="Capture now, plan later"
      emptyDescription="Inbox is your go-to spot for quick task entry. Clear your mind now, organize when you're ready."
      filter={(t) => !t.project_id}
      defaultView="inbox"
    />
  ),
});

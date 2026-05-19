import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TaskView } from "@/components/task-view";
import { fetchProjects } from "@/lib/projects";
import { Hash } from "lucide-react";
import { LABEL_COLORS } from "@/lib/labels";

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  component: ProjectPage,
  notFoundComponent: () => <div className="p-8 text-muted-foreground">Project not found.</div>,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { data: projects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const project = projects.find((p) => p.id === projectId);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!project) throw notFound();

  const color = LABEL_COLORS.find((c) => c.value === project.color)?.hex ?? "#808080";

  return (
    <TaskView
      title={`${project.name} ${project.emoji ?? ""}`.trim()}
      emptyTitle="Start small, finish big"
      emptyDescription="Add a first task to get this project moving."
      filter={(t) => t.project_id === projectId}
      defaultView="project"
      defaultProjectId={projectId}
      headerExtra={<Hash className="h-5 w-5" style={{ color }} />}
    />
  );
}

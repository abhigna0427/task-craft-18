
-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'charcoal',
  emoji text DEFAULT '',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects select" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own projects insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own projects update" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own projects delete" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- filters
CREATE TABLE public.filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  query text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'charcoal',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own filters select" ON public.filters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own filters insert" ON public.filters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own filters update" ON public.filters FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own filters delete" ON public.filters FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER filters_updated_at BEFORE UPDATE ON public.filters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- labels
CREATE TABLE public.labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'charcoal',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own labels select" ON public.labels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own labels insert" ON public.labels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own labels update" ON public.labels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own labels delete" ON public.labels FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER labels_updated_at BEFORE UPDATE ON public.labels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- tasks.project_id
ALTER TABLE public.tasks ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
CREATE INDEX tasks_project_id_idx ON public.tasks(project_id);

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, type AuthState } from "@/lib/auth";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go home</Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Todoist — Organize your tasks" },
      { name: "description", content: "A clean Todoist clone for tasks, priorities, and due dates." },
      { property: "og:title", content: "Todoist — Organize your tasks" },
      { name: "twitter:title", content: "Todoist — Organize your tasks" },
      { property: "og:description", content: "A clean Todoist clone for tasks, priorities, and due dates." },
      { name: "twitter:description", content: "A clean Todoist clone for tasks, priorities, and due dates." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52c20718-9cfe-4468-b11b-73d961deb48f/id-preview-e2399804--c89f0359-a766-46db-8284-c788e5e7fbbb.lovable.app-1779184709734.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52c20718-9cfe-4468-b11b-73d961deb48f/id-preview-e2399804--c89f0359-a766-46db-8284-c788e5e7fbbb.lovable.app-1779184709734.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [auth, setAuth] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuth({ user: session?.user ?? null, loading: false });
      queryClient.invalidateQueries();
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({ user: session?.user ?? null, loading: false });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <Outlet />
        <Toaster position="bottom-right" />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

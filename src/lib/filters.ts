import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import type { Task } from "./tasks";
import { isToday, isPast, parseISO } from "date-fns";

export type Filter = Tables<"filters">;
export type NewFilter = Omit<TablesInsert<"filters">, "user_id">;

export async function fetchFilters(): Promise<Filter[]> {
  const { data, error } = await supabase.from("filters").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createFilter(input: NewFilter) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("filters").insert({ ...input, user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFilter(id: string) {
  const { error } = await supabase.from("filters").delete().eq("id", id);
  if (error) throw error;
}

// Tiny filter query interpreter.
// Supports tokens separated by `&` / `and` / space:
//   p1..p4   -> priority N
//   @label   -> label match
//   today    -> due today
//   overdue  -> due before today and not done
//   no date  -> no due date
//   <other>  -> substring of title/description
export function evaluateFilter(query: string, tasks: Task[]): Task[] {
  const tokens = query.toLowerCase().split(/\s*(?:&|,|and)\s*|\s+/).filter(Boolean);
  if (tokens.length === 0) return tasks;
  return tasks.filter((t) =>
    tokens.every((tok) => {
      if (/^p[1-4]$/.test(tok)) return t.priority === Number(tok[1]);
      if (tok.startsWith("@")) return (t.label ?? "").toLowerCase() === tok.slice(1);
      if (tok === "today") return !!t.due_date && isToday(parseISO(t.due_date));
      if (tok === "overdue") return !!t.due_date && !t.completed && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date));
      if (tok === "no" || tok === "date") return true; // handled by "no date" pair below
      if (tok === "nodate") return !t.due_date;
      return (
        t.title.toLowerCase().includes(tok) ||
        (t.description ?? "").toLowerCase().includes(tok) ||
        (t.label ?? "").toLowerCase().includes(tok)
      );
    }),
  );
}

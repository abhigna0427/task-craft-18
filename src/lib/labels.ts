import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Label = Tables<"labels">;
export type NewLabel = Omit<TablesInsert<"labels">, "user_id">;

export async function fetchLabels(): Promise<Label[]> {
  const { data, error } = await supabase.from("labels").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createLabel(input: NewLabel) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("labels").insert({ ...input, user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLabel(id: string) {
  const { error } = await supabase.from("labels").delete().eq("id", id);
  if (error) throw error;
}

export const LABEL_COLORS: { value: string; label: string; hex: string }[] = [
  { value: "charcoal", label: "Charcoal", hex: "#808080" },
  { value: "red", label: "Red", hex: "#dc4c3e" },
  { value: "orange", label: "Orange", hex: "#ff9a14" },
  { value: "yellow", label: "Yellow", hex: "#f3c218" },
  { value: "olive", label: "Olive", hex: "#7ecc49" },
  { value: "green", label: "Green", hex: "#299438" },
  { value: "teal", label: "Teal", hex: "#6accbc" },
  { value: "blue", label: "Blue", hex: "#158fad" },
  { value: "purple", label: "Purple", hex: "#884dff" },
  { value: "magenta", label: "Magenta", hex: "#eb96eb" },
];

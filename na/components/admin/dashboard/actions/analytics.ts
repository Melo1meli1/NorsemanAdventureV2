"use server";

import { createClient } from "@/lib/supabase/supabase-server";

export async function getHomepageVisitsThisMonth() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count, error } = await supabase
    .from("homepage_visits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    console.error("Error fetching homepage visits:", error);
    return { success: false, count: 0 };
  }

  return { success: true, count: count ?? 0 };
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { getTours } from "./actions/tours";
import { DashboardShell } from "./DashboardShell";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const result = await getTours();
  const tours = result?.success && result.data ? result.data : [];

  return <DashboardShell tours={tours} />;
}

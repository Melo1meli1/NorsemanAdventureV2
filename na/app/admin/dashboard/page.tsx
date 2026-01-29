import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { DashboardShell } from "./DashboardShell";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <DashboardShell />;
}

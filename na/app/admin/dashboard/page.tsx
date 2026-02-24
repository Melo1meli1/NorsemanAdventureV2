import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { getTours } from "./actions/tours";
import { getNews } from "./actions/news";
import { DashboardShell } from "./DashboardShell";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const [toursResult, newsResult] = await Promise.all([getTours(), getNews()]);
  const tours =
    toursResult?.success && toursResult.data ? toursResult.data : [];
  const news = newsResult?.success && newsResult.data ? newsResult.data : [];

  return <DashboardShell tours={tours} news={news} />;
}

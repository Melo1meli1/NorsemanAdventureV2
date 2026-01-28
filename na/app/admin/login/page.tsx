import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}

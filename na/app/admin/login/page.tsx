import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm.tsx";

export default async function AdminLoginPage() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}

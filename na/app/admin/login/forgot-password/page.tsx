import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { AdminForgotPasswordForm } from "@/app/admin/login/forgot-password/AdminForgotPasswordForm";

export default async function AdminForgotPasswordPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return <AdminForgotPasswordForm />;
}

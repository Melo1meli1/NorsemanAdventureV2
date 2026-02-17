import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { AdminResetPasswordForm } from "@/app/admin/login/reset-password/AdminResetPasswordForm";

export default async function AdminResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminResetPasswordForm />;
}

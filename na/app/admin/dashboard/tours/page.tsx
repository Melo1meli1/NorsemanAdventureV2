import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { getTours } from "../actions/tours";
import { TourListView } from "../TourListView";

export default async function AdminTurerPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const result = await getTours();
  const tours = result?.success && result.data ? result.data : [];

  return (
    <main className="bg-page-background flex min-h-screen text-neutral-50">
      <section className="flex flex-1 flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
          <TourListView tours={tours} />
        </div>
      </section>
    </main>
  );
}

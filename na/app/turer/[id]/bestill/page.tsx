import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { BookingStepNavigator } from "@/components/tours/BookingStepNavigator";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TourBookPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !tour) notFound();

  return (
    <main className="bg-background min-h-screen">
      <div className="flex flex-col items-center pt-16 sm:pt-16">
        <BookingStepNavigator
          tourId={id}
          progressBarClassName="w-full max-w-md"
        />
      </div>
    </main>
  );
}

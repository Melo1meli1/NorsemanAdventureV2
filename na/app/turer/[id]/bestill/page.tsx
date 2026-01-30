import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { BookingStepNavigator } from "@/components/tours/BookingStepNavigator";
import { OrderSummary } from "@/components/tours/OrderSummary";

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
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-16 sm:px-6">
        <BookingStepNavigator
          tourId={id}
          progressBarClassName="w-full max-w-md"
          aside={
            <OrderSummary
              items={[
                {
                  title: tour.title,
                  price: tour.price,
                  quantity: 1,
                },
              ]}
            />
          }
        />
      </div>
    </main>
  );
}

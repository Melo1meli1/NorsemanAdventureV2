import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { BookingStepNavigator } from "@/components/tours/BookingStepNavigator";
import { getTourImageUrl } from "@/lib/tourUtils";

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

  const initialCartItems = [
    {
      tourId: tour.id,
      title: tour.title,
      price: tour.price,
      quantity: 1,
      imageUrl: getTourImageUrl(tour),
    },
  ];

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-28">
        <BookingStepNavigator
          tourId={id}
          initialCartItems={initialCartItems}
          maxAvailableSeats={tour.seats_available}
          progressBarClassName="w-full max-w-md"
        />
      </div>
    </main>
  );
}

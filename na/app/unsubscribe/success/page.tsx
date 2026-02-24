import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function UnsubscribeSuccessPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Avmeldt!</CardTitle>
          <CardDescription>
            Du er nå meldt av nyhetsbrevet fra Norseman Adventures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">
              Vi beklager å se deg dra. Du vil ikke lenger motta nyhetsbrev fra
              oss.
            </p>
            <p className="text-muted-foreground text-sm">
              Hvis du ombestemmer deg, kan du alltid melde deg på igjen via
              footer på nettsiden.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <button className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring h-10 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                Gå til forsiden
              </button>
            </Link>
            <Link href="/public/tours" className="w-full">
              <button className="border-input bg-background hover:bg-accent hover:text-accent-foreground ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                Se våre turer
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { unsubscribeFromNewsletter } from "@/app/actions/subscribers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Meld av nyhetsbrev</CardTitle>
          <CardDescription>
            Skriv inn e-postadressen din for å melde deg av Norseman Adventures
            nyhetsbrev
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams?.error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {searchParams.error}
            </div>
          )}
          <form action={unsubscribeFromNewsletter} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                E-postadresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="din@epost.no"
                required
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button type="submit" className="w-full">
              Meld av
            </Button>
          </form>

          <div className="text-muted-foreground text-center text-sm">
            <p>
              Endret mening?{" "}
              <Link
                href="/"
                className="hover:text-primary underline underline-offset-4"
              >
                Gå til forsiden
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

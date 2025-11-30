import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-destructive" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">500 error</p>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">
            Our servers encountered an unexpected issue. Please try again in a few moments or contact support if the problem persists.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild className="rounded-full">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/account/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

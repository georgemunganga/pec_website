import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="bg-muted/30 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border/40 shadow-sm">
      <Skeleton className="h-5 w-10" />
      <Skeleton className="h-8 w-20 mt-3" />
      <Skeleton className="h-4 w-24 mt-2" />
    </div>
  );
}

export function OrdersListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`order-skeleton-${index}`}
          className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40"
        >
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/6" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

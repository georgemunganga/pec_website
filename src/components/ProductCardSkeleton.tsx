import { Skeleton } from './ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="group">
      {/* Card Container */}
      <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-sm mb-4">
        {/* Product Image Area */}
        <div className="relative aspect-square overflow-hidden bg-secondary/20">
          {/* Action Icons Placeholder */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Skeleton className="w-11 h-11 rounded-full" />
            <Skeleton className="w-11 h-11 rounded-full" />
            <Skeleton className="w-11 h-11 rounded-full" />
          </div>

          {/* Image Skeleton */}
          <Skeleton className="w-full h-full" />

          {/* Bottom Buttons Placeholder */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
            <Skeleton className="flex-1 h-12 rounded-full" />
            <Skeleton className="w-24 h-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Product Info Below Card */}
      <div className="px-2 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

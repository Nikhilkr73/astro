import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

export function HomeSkeletonLoader() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-32 mb-2 bg-muted" />
            <Skeleton className="h-4 w-48 bg-muted" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl bg-primary/20" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Category Tabs Skeleton */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-xl bg-muted flex-shrink-0" />
          ))}
        </div>

        {/* Astrologer Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-20 h-20 rounded-2xl bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16 bg-muted" />
                      <Skeleton className="h-4 w-20 bg-muted" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Skeleton className="h-9 flex-1 rounded-xl bg-primary/20" />
                      <Skeleton className="h-9 flex-1 rounded-xl bg-muted" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

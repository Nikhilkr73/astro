import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

export function ChatHistorySkeletonLoader() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <Skeleton className="h-6 w-32 mb-2 bg-muted" />
        <Skeleton className="h-4 w-48 bg-muted" />
      </div>

      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 bg-muted" />
                    <Skeleton className="h-3 w-16 bg-muted" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-12 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-full bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

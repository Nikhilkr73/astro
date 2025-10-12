import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

export function ProfileSkeletonLoader() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <Skeleton className="h-6 w-24 bg-muted" />
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full mx-auto bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 mx-auto bg-muted" />
            <Skeleton className="h-4 w-48 mx-auto bg-muted" />
          </div>
        </div>

        {/* Personal Info Card Skeleton */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-40 bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-10 w-full rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Skeleton */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-32 bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <Skeleton className="h-4 w-32 bg-muted" />
                  <Skeleton className="h-6 w-12 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout Button Skeleton */}
        <Skeleton className="h-12 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}

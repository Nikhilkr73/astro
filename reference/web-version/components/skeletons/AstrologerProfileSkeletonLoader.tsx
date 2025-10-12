import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export function AstrologerProfileSkeletonLoader({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-10 w-10 p-0 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1>Astrologer Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Profile Header Skeleton */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <Skeleton className="w-20 h-20 rounded-2xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 bg-muted" />
                  <Skeleton className="h-4 w-24 bg-muted" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-5 w-12 mx-auto mb-1 bg-muted" />
                  <Skeleton className="h-3 w-16 mx-auto bg-muted" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <Skeleton className="h-12 flex-1 rounded-xl bg-primary/20" />
              <Skeleton className="h-12 flex-1 rounded-xl bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* About Skeleton */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-20 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
          </CardContent>
        </Card>

        {/* Skills Skeleton */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-24 mb-3 bg-muted" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-xl bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Skeleton */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-32 mb-4 bg-muted" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-full bg-muted mb-2" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

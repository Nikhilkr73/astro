import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export function WalletSkeletonLoader({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-10 w-10 p-0 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1>Wallet</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Balance Card Skeleton */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-primary px-6 py-8">
            <Skeleton className="h-4 w-32 mb-3 bg-white/30" />
            <Skeleton className="h-10 w-40 bg-white/40" />
          </div>
        </Card>

        {/* Recharge Options Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-muted" />
            ))}
          </div>
        </div>

        {/* Continue Button Skeleton */}
        <Skeleton className="h-14 w-full rounded-xl bg-primary/20" />

        {/* Transaction History Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-48 bg-muted" />
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-3 w-32 bg-muted" />
                  </div>
                  <Skeleton className="h-5 w-16 bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

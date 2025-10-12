import { useState, useEffect } from "react";
import { Wallet, History, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingButton } from "./LoadingButton";
import { WalletSkeletonLoader } from "./skeletons/WalletSkeletonLoader";

interface WalletScreenProps {
  onNavigate: (screen: string) => void;
}

interface RechargeOption {
  amount: number;
  bonus: number;
  bonusPercent: number;
  popular: boolean;
}

const rechargeAmounts: RechargeOption[] = [
  { amount: 50, bonus: 0, bonusPercent: 0, popular: false },
  { amount: 100, bonus: 10, bonusPercent: 10, popular: false },
  { amount: 200, bonus: 25, bonusPercent: 12.5, popular: true },
  { amount: 500, bonus: 75, bonusPercent: 15, popular: false },
  { amount: 1000, bonus: 200, bonusPercent: 20, popular: false }
];

const currentBalance = 156.75;

export function WalletScreen({ onNavigate }: WalletScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<RechargeOption | null>(null);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (selectedAmount) {
      setIsProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        // Simulate random transaction result (33% each for success, fail, pending)
        const random = Math.random();
        setIsProcessing(false);
        if (random < 0.4) {
          onNavigate("transaction-success");
        } else if (random < 0.7) {
          onNavigate("transaction-failed");
        } else {
          onNavigate("transaction-pending");
        }
      }, 2000);
    }
  };

  if (isLoading) {
    return <WalletSkeletonLoader onBack={() => onNavigate("home")} />;
  }

  return (
    <>
      <div className={`min-h-screen bg-background ${selectedAmount ? 'pb-44' : 'pb-24'}`}>
        {/* Header */}
        <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate("home")} 
            className="h-10 w-10 p-0 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium">My Wallet</h1>
        </div>

      <div className="px-4 py-6 space-y-5">
        {/* Wallet Balance Card - Orange Box */}
        <Card className="border-0 bg-gradient-to-br from-primary via-primary to-primary/80 text-white rounded-2xl shadow-lg shadow-primary/20">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Available Balance</p>
                  <div className="text-3xl">₹{currentBalance.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => onNavigate("wallet-history")}
                className="bg-white/20 text-white hover:bg-white/30 rounded-xl h-12 active:scale-95 transition-transform border border-white/30 flex-1"
              >
                <History className="w-5 h-5 mr-2" />
                History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recharge Amounts */}
        <div>
          <h3 className="font-medium mb-4">Add Money to Wallet</h3>
          <div className="grid grid-cols-2 gap-3">
            {rechargeAmounts.map((option) => (
              <Card 
                key={option.amount}
                className={`border-2 cursor-pointer transition-all active:scale-95 ${
                  selectedAmount?.amount === option.amount
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : option.popular 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-border/50 hover:border-primary/50'
                } rounded-2xl relative overflow-hidden`}
                onClick={() => setSelectedAmount(option)}
              >
                <CardContent className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                  {option.bonusPercent > 0 && (
                    <Badge className="mb-2 bg-green-600 text-white text-xs mx-auto border-0">
                      {option.bonusPercent}% Extra
                    </Badge>
                  )}
                  {option.popular && (
                    <Badge className="mb-2 bg-primary text-white text-xs mx-auto border-0">
                      Most Popular
                    </Badge>
                  )}
                  <div className="text-2xl mb-1">₹{option.amount}</div>
                  {option.bonus > 0 && (
                    <div className="text-green-600 text-sm">
                      +₹{option.bonus} Bonus
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Get: ₹{option.amount + option.bonus}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="bg-accent/50 rounded-2xl p-4">
          <h4 className="font-medium mb-2 text-primary">Safe & Secure</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ 100% secure payment gateway</li>
            <li>✓ Instant wallet credit</li>
            <li>✓ Balance never expires</li>
            <li>✓ Multiple payment options</li>
          </ul>
        </div>
      </div>

        {/* Fixed Bottom Continue Button */}
        {selectedAmount && (
          <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-border p-4 shadow-lg z-20">
            <div className="max-w-md mx-auto">
              <Button 
                onClick={handleContinue}
                disabled={isProcessing}
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 transition-transform text-lg"
              >
                Continue (₹{selectedAmount.amount})
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                You'll get ₹{selectedAmount.amount + selectedAmount.bonus} in your wallet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Processing Overlay - Minimalist Circle UI */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          {/* Animated Circle Loader */}
          <div className="relative mb-8">
            {/* Outer rotating ring */}
            <div className="w-32 h-32 rounded-full border-4 border-gray-200 relative">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            </div>
            
            {/* Inner static circle with amount */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl text-primary">₹{selectedAmount?.amount}</div>
              </div>
            </div>
          </div>

          {/* Minimal Text */}
          <p className="text-muted-foreground text-sm">Processing payment...</p>
        </div>
      )}
    </>
  );
}

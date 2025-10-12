import { Wallet, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface SessionPausedBarProps {
  onRecharge: () => void;
  sessionTime: string;
}

export function SessionPausedBar({ onRecharge, sessionTime }: SessionPausedBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary/95 to-primary border-t-2 border-primary-foreground/20 shadow-lg z-50">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-primary-foreground font-medium text-sm">Session Paused</span>
              <span className="text-primary-foreground/70 text-xs">• {sessionTime}</span>
            </div>
            <p className="text-primary-foreground/80 text-xs">
              Your wallet is empty. Recharge to continue chatting.
            </p>
          </div>
          
          <Button
            onClick={onRecharge}
            size="sm"
            className="flex-shrink-0 h-9 px-4 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 active:scale-95 transition-transform shadow-md"
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5" />
            Recharge
          </Button>
        </div>
      </div>
    </div>
  );
}

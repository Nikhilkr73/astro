import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface NoInternetOverlayProps {
  isVisible: boolean;
  onRetry?: () => void;
}

export function NoInternetOverlay({ isVisible, onRetry }: NoInternetOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Blur Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Toast Notification at Top */}
      <div className="relative z-10 px-4 pt-6 pb-4 animate-in slide-in-from-top duration-300">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-2 border-red-500/20 overflow-hidden">
          {/* Red accent bar */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>
          
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-600" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-red-600 mb-1">No Internet Connection</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please check your internet connection and try again.
                </p>
                
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    className="h-10 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 transition-transform"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading dots animation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
        </div>
        <span className="text-sm text-muted-foreground ml-2">Waiting for connection...</span>
      </div>
    </div>
  );
}

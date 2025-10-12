import { Sparkles } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-background flex flex-col items-center justify-center px-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-semibold text-secondary">Kundli</h1>
      </div>
      
      <p className="text-xl text-muted-foreground text-center mb-16 max-w-xs">
        Your Stars. Your Guidance.
      </p>
      
      <div className="flex space-x-3">
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100" />
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200" />
      </div>
    </div>
  );
}
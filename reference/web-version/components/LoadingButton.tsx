import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LoadingButton({ 
  isLoading, 
  loadingText, 
  children, 
  disabled,
  className,
  variant,
  size,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={disabled || isLoading}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          {loadingText || children}
          <span className="flex gap-0.5 ml-1">
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

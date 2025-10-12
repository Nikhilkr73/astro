import { Check, X, Clock } from "lucide-react";
import { Button } from "./ui/button";

interface TransactionStatusProps {
  status: 'success' | 'failed' | 'pending';
  onNavigate: (screen: string) => void;
}

export function TransactionStatus({ status, onNavigate }: TransactionStatusProps) {
  const statusConfig = {
    success: {
      icon: Check,
      circleColor: 'bg-green-500',
      iconColor: 'text-white',
      title: 'Payment Successful',
      amount: '₹500',
      buttonText: 'Continue',
      buttonAction: () => onNavigate('wallet')
    },
    failed: {
      icon: X,
      circleColor: 'bg-red-500',
      iconColor: 'text-white',
      title: 'Payment Failed',
      amount: '₹500',
      buttonText: 'Try Again',
      buttonAction: () => onNavigate('wallet')
    },
    pending: {
      icon: Clock,
      circleColor: 'bg-yellow-500',
      iconColor: 'text-white',
      title: 'Payment Pending',
      amount: '₹500',
      buttonText: 'Go to Home',
      buttonAction: () => onNavigate('home')
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Large Circle with Icon */}
      <div className="mb-8">
        <div className={`w-32 h-32 ${config.circleColor} rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500`}>
          <IconComponent className={`w-16 h-16 ${config.iconColor} stroke-[3]`} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl mb-2 animate-in fade-in duration-500 delay-100">{config.title}</h2>

      {/* Amount */}
      <p className="text-4xl text-primary mb-12 animate-in fade-in duration-500 delay-200">{config.amount}</p>

      {/* Action Button */}
      <Button 
        onClick={config.buttonAction}
        className={`w-full max-w-xs h-12 rounded-xl active:scale-95 transition-transform animate-in fade-in duration-500 delay-300 ${
          status === 'failed' 
            ? 'bg-red-500 hover:bg-red-600' 
            : status === 'pending'
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {config.buttonText}
      </Button>

      {/* Secondary action - simple text button */}
      {status !== 'pending' && (
        <button 
          onClick={() => onNavigate('home')}
          className="mt-4 text-muted-foreground text-sm hover:text-foreground transition-colors animate-in fade-in duration-500 delay-400"
        >
          Go to Home
        </button>
      )}
    </div>
  );
}

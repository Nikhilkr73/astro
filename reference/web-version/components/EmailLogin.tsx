import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { LoadingButton } from "./LoadingButton";
import { Input } from "./ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface EmailLoginProps {
  onLogin: () => void;
  onSkip?: () => void;
  onNavigate?: (screen: string) => void;
}

export function EmailLogin({ onLogin, onSkip, onNavigate }: EmailLoginProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleMobileSubmit = () => {
    if (mobile && mobile.length === 10) {
      setIsSendingOtp(true);
      // Simulate OTP sending delay
      setTimeout(() => {
        setIsSendingOtp(false);
        setStep('otp');
        setResendTimer(30); // Start 30 second timer
      }, 1500);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      setIsVerifying(true);
      // Simulate OTP verification delay
      setTimeout(() => {
        // Check if OTP is wrong (111111 is test wrong OTP)
        if (otp === '111111') {
          setIsVerifying(false);
          setOtpError('Invalid OTP. Please try again.');
          setOtp(''); // Clear OTP input
        } else {
          setOtpError('');
          onLogin();
        }
      }, 1500);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setResendTimer(30); // Restart timer
      setOtp(''); // Clear current OTP
      setOtpError(''); // Clear any errors
      // Here you would normally trigger the actual OTP resend
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) {
      setOtpError(''); // Clear error when user starts typing again
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-8">
      {step === 'mobile' ? (
        <>
          {/* Logo & Branding - Horizontal */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl mb-0">Kundli</h1>
              <p className="text-sm text-muted-foreground">Connect with expert astrologers</p>
            </div>
          </div>

          {/* Mobile Number Input */}
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Enter mobile number
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 h-14 flex items-center px-4 border-r border-border">
                  <span className="text-foreground">+91</span>
                </div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile number"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="h-14 pl-16 rounded-xl border-2 border-border/50 focus:border-primary bg-white"
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <LoadingButton 
              onClick={handleMobileSubmit}
              isLoading={isSendingOtp}
              loadingText="Sending OTP"
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all"
              disabled={mobile.length !== 10}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </LoadingButton>

            <p className="text-xs text-center text-muted-foreground px-4">
              By continuing, you agree to our{" "}
              <button
                onClick={() => onNavigate && onNavigate('terms')}
                className="text-xs text-primary hover:underline"
              >
                Terms of Service
              </button>
              {" "}and{" "}
              <button
                onClick={() => onNavigate && onNavigate('privacy')}
                className="text-xs text-primary hover:underline"
              >
                Privacy Policy
              </button>
            </p>

            {/* Skip Button for Testing */}
            {onSkip && (
              <div className="mt-8 text-center">
                <button
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
                >
                  Skip (Testing Mode)
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => {
              setStep('mobile');
              setOtp('');
            }}
            className="flex items-center gap-2 text-muted-foreground mb-6 -ml-2 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* OTP Verification */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Verify OTP</h2>
              <p className="text-muted-foreground">
                Enter the 6-digit code sent to
              </p>
              <p className="text-foreground">+91 {mobile}</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-center py-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot 
                        index={0} 
                        className={`w-12 h-14 rounded-xl border-2 ${otpError ? 'border-red-500' : 'border-border/50'} data-[active=true]:border-primary`} 
                      />
                      <InputOTPSlot 
                        index={1} 
                        className={`w-12 h-14 rounded-xl border-2 ${otpError ? 'border-red-500' : 'border-border/50'} data-[active=true]:border-primary`} 
                      />
                      <InputOTPSlot 
                        index={2} 
                        className={`w-12 h-14 rounded-xl border-2 ${otpError ? 'border-red-500' : 'border-border/50'} data-[active=true]:border-primary`} 
                      />
                      <InputOTPSlot 
                        index={3} 
                        className={`w-12 h-14 rounded-xl border-2 ${otpError ? 'border-red-500' : 'border-border/50'} data-[active=true]:border-primary`} 
                      />
                      <InputOTPSlot 
                        index={4} 
                        className={`w-12 h-14 rounded-xl border-2 ${otpError ? 'border-red-500' : 'border-border/50'} data-[active=true]:border-primary`} 
                      />
                      <InputOTPSlot 
                        index={5} 
                        className={`w-12 h-14 rounded-xl border-2 ${otpError ? 'border-red-500' : 'border-border/50'} data-[active=true]:border-primary`} 
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                {/* Error Message */}
                {otpError && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{otpError}</span>
                  </div>
                )}
              </div>

              <LoadingButton 
                onClick={handleOtpSubmit}
                isLoading={isVerifying}
                loadingText="Verifying OTP"
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all"
                disabled={otp.length !== 6}
              >
                Verify & Continue
              </LoadingButton>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive code?{' '}
                  <button 
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`${
                      resendTimer > 0 
                        ? 'text-muted-foreground cursor-not-allowed' 
                        : 'text-primary active:scale-95 transition-transform'
                    } inline-block`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
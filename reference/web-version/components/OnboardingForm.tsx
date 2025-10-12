import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingFormProps {
  onComplete: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi'
];

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [birthDate, setBirthDate] = useState(1);
  const [birthMonth, setBirthMonth] = useState(0); // January
  const [birthYear, setBirthYear] = useState(2000);
  const [knowsTime, setKnowsTime] = useState<boolean | null>(null);
  const [birthHour, setBirthHour] = useState(12);
  const [birthMinute, setBirthMinute] = useState(0);
  const [birthPeriod, setBirthPeriod] = useState<'AM' | 'PM'>('PM');
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [birthPlace, setBirthPlace] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  // Debounced display values
  const [displayDate, setDisplayDate] = useState('');
  const [displayTime, setDisplayTime] = useState('');

  const totalSteps = 6;

  // Debounce date display
  useEffect(() => {
    const timer = setTimeout(() => {
      const formattedDate = `${birthDate} ${MONTHS[birthMonth]} ${birthYear}`;
      setDisplayDate(formattedDate);
    }, 400);

    return () => clearTimeout(timer);
  }, [birthDate, birthMonth, birthYear]);

  // Debounce time display
  useEffect(() => {
    const timer = setTimeout(() => {
      const formattedTime = `${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')} ${birthPeriod}`;
      setDisplayTime(formattedTime);
    }, 400);

    return () => clearTimeout(timer);
  }, [birthHour, birthMinute, birthPeriod]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    // Validate name: only letters and spaces, minimum 3 characters
    if (value.length === 0) {
      setNameError('');
    } else if (value.length < 3) {
      setNameError('Name must be at least 3 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      setNameError('Wrong name');
    } else {
      setNameError('');
    }
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
      case 2:
        return true; // Date is always valid
      case 3:
        if (knowsTime === null) return false;
        if (knowsTime === false) return true;
        return true; // Time is always valid if they know it
      case 4:
        return gender !== null;
      case 5:
        return birthPlace.trim().length > 0;
      case 6:
        return selectedLanguages.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Show completion screen
        setShowCompletion(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background px-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-3xl">Profile Completed!</h1>
          <p className="text-muted-foreground px-8">
            Great! Your profile is all set. You can now connect with expert astrologers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <Button
            onClick={handleComplete}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Get Started
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-muted-foreground active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
          )}
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl mb-2">What's your name?</h2>
              <p className="text-muted-foreground">
                We'll use this to personalize your experience
              </p>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Enter your full name"
                value={name}
                onChange={handleNameChange}
                className="h-14 rounded-xl border-2 border-border/50 focus:border-primary bg-white"
                autoFocus
              />
              {nameError && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{nameError}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl mb-2">When were you born?</h2>
              <p className="text-muted-foreground">
                Your date of birth for accurate kundli
              </p>
            </div>

            <DatePicker
              date={birthDate}
              month={birthMonth}
              year={birthYear}
              onDateChange={setBirthDate}
              onMonthChange={setBirthMonth}
              onYearChange={setBirthYear}
            />

            {/* Display selected date after 1 second */}
            {displayDate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4 px-6 bg-primary/5 rounded-xl border-2 border-primary/20"
              >
                <p className="text-sm text-muted-foreground mb-1">Selected Date</p>
                <p className="text-lg text-foreground">{displayDate}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl mb-2">Do you remember your time of birth?</h2>
              <p className="text-muted-foreground">
                Time of birth is important for accurate predictions
              </p>
            </div>

            {knowsTime === null ? (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setKnowsTime(true)}
                  variant="outline"
                  className="h-24 rounded-xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
                >
                  Yes, I know
                </Button>
                <Button
                  onClick={() => setKnowsTime(false)}
                  variant="outline"
                  className="h-24 rounded-xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
                >
                  No, I don't
                </Button>
              </div>
            ) : knowsTime ? (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">Select your time of birth</p>
                </div>
                <TimePicker
                  hour={birthHour}
                  minute={birthMinute}
                  period={birthPeriod}
                  onHourChange={setBirthHour}
                  onMinuteChange={setBirthMinute}
                  onPeriodChange={setBirthPeriod}
                />
                
                {/* Display selected time after 1 second */}
                {displayTime && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4 px-6 bg-primary/5 rounded-xl border-2 border-primary/20"
                  >
                    <p className="text-sm text-muted-foreground mb-1">Selected Time</p>
                    <p className="text-lg text-foreground">{displayTime}</p>
                  </motion.div>
                )}
                
                <button
                  onClick={() => setKnowsTime(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                >
                  I don't remember
                </button>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-xl p-6 text-center">
                <p className="text-muted-foreground">
                  That's okay! We'll proceed without the time of birth.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl mb-2">What's your gender?</h2>
              <p className="text-muted-foreground">
                This helps us provide personalized astrological insights
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGender('Male')}
                className={`h-32 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-3 ${
                  gender === 'Male'
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border/50 hover:border-primary/50 bg-white'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  gender === 'Male' ? 'bg-primary/10' : 'bg-accent'
                }`}>
                  <span className="text-3xl">👨</span>
                </div>
                <span className={`transition-colors ${
                  gender === 'Male' ? 'text-primary' : 'text-foreground'
                }`}>Male</span>
              </button>
              
              <button
                onClick={() => setGender('Female')}
                className={`h-32 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-3 ${
                  gender === 'Female'
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border/50 hover:border-primary/50 bg-white'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  gender === 'Female' ? 'bg-primary/10' : 'bg-accent'
                }`}>
                  <span className="text-3xl">👩</span>
                </div>
                <span className={`transition-colors ${
                  gender === 'Female' ? 'text-primary' : 'text-foreground'
                }`}>Female</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl mb-2">Where were you born?</h2>
              <p className="text-muted-foreground">
                Your birth place helps us calculate planetary positions
              </p>
            </div>

            <Input
              placeholder="City, State, Country"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="h-14 rounded-xl border-2 border-border/50 focus:border-primary bg-white"
              autoFocus
            />
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl mb-2">Preferred Languages</h2>
              <p className="text-muted-foreground">
                Select languages you're comfortable with
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageToggle(language)}
                  className={`h-14 rounded-xl border-2 transition-all active:scale-95 text-center ${
                    selectedLanguages.includes(language)
                      ? 'border-primary bg-primary text-white'
                      : 'border-border/50 hover:border-primary/50 bg-white'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>

            {selectedLanguages.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps ? 'Complete Profile' : 'Continue'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Date Picker Component
function DatePicker({ 
  date, 
  month, 
  year, 
  onDateChange, 
  onMonthChange, 
  onYearChange 
}: {
  date: number;
  month: number;
  year: number;
  onDateChange: (date: number) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}) {
  const dateRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);

  const scrollToValue = (ref: HTMLDivElement | null, index: number) => {
    if (ref) {
      const itemHeight = 48;
      ref.scrollTop = index * itemHeight;
    }
  };

  useEffect(() => {
    scrollToValue(dateRef.current, date - 1);
    scrollToValue(monthRef.current, month);
    scrollToValue(yearRef.current, years.indexOf(year));
  }, []);

  return (
    <div className="flex gap-2 justify-center">
      {/* Date Scroller */}
      <div className="flex-1 max-w-[100px]">
        <div className="text-center text-sm text-muted-foreground mb-2">Date</div>
        <div className="relative h-[192px] overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-background via-white to-background shadow-sm">
          {/* Gradient fade overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          
          {/* Selected item highlight */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-accent/40 border-y border-accent-foreground/10 pointer-events-none z-10 rounded-lg" />
          
          <div
            ref={dateRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const index = Math.round(scrollTop / 48);
              if (dates[index]) {
                onDateChange(dates[index]);
              }
            }}
          >
            <div className="h-[72px]" />
            {dates.map((d) => (
              <div
                key={d}
                className="h-12 flex items-center justify-center snap-center cursor-pointer hover:text-primary transition-all duration-200 opacity-40 hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:text-primary"
                onClick={() => {
                  onDateChange(d);
                  scrollToValue(dateRef.current, d - 1);
                }}
                data-selected={d === date}
              >
                {d}
              </div>
            ))}
            <div className="h-[72px]" />
          </div>
        </div>
      </div>

      {/* Month Scroller */}
      <div className="flex-1 max-w-[140px]">
        <div className="text-center text-sm text-muted-foreground mb-2">Month</div>
        <div className="relative h-[192px] overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-background via-white to-background shadow-sm">
          {/* Gradient fade overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          
          {/* Selected item highlight */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-accent/40 border-y border-accent-foreground/10 pointer-events-none z-10 rounded-lg" />
          
          <div
            ref={monthRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const index = Math.round(scrollTop / 48);
              if (MONTHS[index]) {
                onMonthChange(index);
              }
            }}
          >
            <div className="h-[72px]" />
            {MONTHS.map((m, idx) => (
              <div
                key={m}
                className="h-12 flex items-center justify-center snap-center cursor-pointer hover:text-primary transition-all duration-200 text-sm opacity-40 hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:text-primary"
                onClick={() => {
                  onMonthChange(idx);
                  scrollToValue(monthRef.current, idx);
                }}
                data-selected={idx === month}
              >
                {m.slice(0, 3)}
              </div>
            ))}
            <div className="h-[72px]" />
          </div>
        </div>
      </div>

      {/* Year Scroller */}
      <div className="flex-1 max-w-[100px]">
        <div className="text-center text-sm text-muted-foreground mb-2">Year</div>
        <div className="relative h-[192px] overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-background via-white to-background shadow-sm">
          {/* Gradient fade overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          
          {/* Selected item highlight */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-accent/40 border-y border-accent-foreground/10 pointer-events-none z-10 rounded-lg" />
          
          <div
            ref={yearRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const index = Math.round(scrollTop / 48);
              if (years[index]) {
                onYearChange(years[index]);
              }
            }}
          >
            <div className="h-[72px]" />
            {years.map((y) => (
              <div
                key={y}
                className="h-12 flex items-center justify-center snap-center cursor-pointer hover:text-primary transition-all duration-200 opacity-40 hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:text-primary"
                onClick={() => {
                  onYearChange(y);
                  scrollToValue(yearRef.current, years.indexOf(y));
                }}
                data-selected={y === year}
              >
                {y}
              </div>
            ))}
            <div className="h-[72px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Time Picker Component
function TimePicker({
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange
}: {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onPeriodChange: (period: 'AM' | 'PM') => void;
}) {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const scrollToValue = (ref: HTMLDivElement | null, index: number) => {
    if (ref) {
      const itemHeight = 48;
      ref.scrollTop = index * itemHeight;
    }
  };

  useEffect(() => {
    scrollToValue(hourRef.current, hour - 1);
    scrollToValue(minuteRef.current, minute);
  }, []);

  return (
    <div className="flex gap-3 justify-center items-start">
      {/* Hour Scroller */}
      <div className="flex-1 max-w-[100px]">
        <div className="text-center text-sm text-muted-foreground mb-2">Hour</div>
        <div className="relative h-[192px] overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-background via-white to-background shadow-sm">
          {/* Gradient fade overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          
          {/* Selected item highlight */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-accent/40 border-y border-accent-foreground/10 pointer-events-none z-10 rounded-lg" />
          
          <div
            ref={hourRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const index = Math.round(scrollTop / 48);
              if (hours[index]) {
                onHourChange(hours[index]);
              }
            }}
          >
            <div className="h-[72px]" />
            {hours.map((h) => (
              <div
                key={h}
                className="h-12 flex items-center justify-center snap-center cursor-pointer hover:text-primary transition-all duration-200 opacity-40 hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:text-primary"
                onClick={() => {
                  onHourChange(h);
                  scrollToValue(hourRef.current, h - 1);
                }}
                data-selected={h === hour}
              >
                {h.toString().padStart(2, '0')}
              </div>
            ))}
            <div className="h-[72px]" />
          </div>
        </div>
      </div>

      {/* Minute Scroller */}
      <div className="flex-1 max-w-[100px]">
        <div className="text-center text-sm text-muted-foreground mb-2">Minute</div>
        <div className="relative h-[192px] overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-background via-white to-background shadow-sm">
          {/* Gradient fade overlays */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          
          {/* Selected item highlight */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-accent/40 border-y border-accent-foreground/10 pointer-events-none z-10 rounded-lg" />
          
          <div
            ref={minuteRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              const index = Math.round(scrollTop / 48);
              if (minutes[index] !== undefined) {
                onMinuteChange(minutes[index]);
              }
            }}
          >
            <div className="h-[72px]" />
            {minutes.map((m) => (
              <div
                key={m}
                className="h-12 flex items-center justify-center snap-center cursor-pointer hover:text-primary transition-all duration-200 opacity-40 hover:opacity-100 data-[selected=true]:opacity-100 data-[selected=true]:text-primary"
                onClick={() => {
                  onMinuteChange(m);
                  scrollToValue(minuteRef.current, m);
                }}
                data-selected={m === minute}
              >
                {m.toString().padStart(2, '0')}
              </div>
            ))}
            <div className="h-[72px]" />
          </div>
        </div>
      </div>

      {/* AM/PM Buttons - On the right */}
      <div className="flex flex-col gap-3 justify-center" style={{ paddingTop: '28px' }}>
        <button
          onClick={() => onPeriodChange('AM')}
          className={`w-16 h-16 rounded-2xl border transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm ${
            period === 'AM'
              ? 'border-primary/30 bg-primary text-white'
              : 'border-border/30 hover:border-primary/50 bg-white hover:bg-accent/20'
          }`}
        >
          AM
        </button>
        <button
          onClick={() => onPeriodChange('PM')}
          className={`w-16 h-16 rounded-2xl border transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm ${
            period === 'PM'
              ? 'border-primary/30 bg-primary text-white'
              : 'border-border/30 hover:border-primary/50 bg-white hover:bg-accent/20'
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
}

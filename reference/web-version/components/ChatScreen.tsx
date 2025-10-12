import { useState, useEffect, useRef } from "react";
import { ArrowLeft, PhoneOff, Send, Clock, Star, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SessionPausedBar } from "./SessionPausedBar";
import { ChatBackground } from "./ChatBackground";

interface ChatScreenProps {
  astrologer: any;
  onBack: () => void;
  onEndSession: (duration: string) => void;
  onMinimize?: (duration: string) => void;
  onRecharge?: () => void;
  initialBalance?: number;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "astrologer";
  timestamp: string;
}

const messageSuggestions = [
  "What does my birth chart say?",
  "Tell me about my career",
  "When will I get married?",
  "Any health concerns?"
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Namaste! I'm here to help you with your queries. How can I assist you today?",
    sender: "astrologer",
    timestamp: "10:30 AM"
  }
];

export function ChatScreen({ astrologer, onBack, onEndSession, onMinimize, onRecharge, initialBalance = 500 }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(initialBalance);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // ============================================
  // TESTING MODE CONFIGURATION
  // ============================================
  // TEST_MODE = true: Deduct ₹8 every 30 seconds (quick testing)
  // TEST_MODE = false: Deduct ₹8 every 60 seconds (production)
  // 
  // FOR TESTING ZERO BALANCE SESSION PAUSE:
  // Current initialBalance in App.tsx: 8
  // Deductions: 8 → 0 (after 30 seconds)
  // Session Paused Bar appears immediately at 0 with recharge button!
  // Change back to 500 or higher for normal testing
  // ============================================
  const TEST_MODE = true;
  const BALANCE_DEDUCTION_INTERVAL = TEST_MODE ? 30 : 60; // seconds
  const CHAT_RATE_PER_MINUTE = 8;

  // Safety check for astrologer
  if (!astrologer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Session timer and balance deduction
  useEffect(() => {
    if (!sessionEnded) {
      const timer = setInterval(() => {
        setSessionTime((prev) => prev + 1);
        
        // Deduct balance at configured interval (30s for testing, 60s for production)
        if (sessionTime > 0 && sessionTime % BALANCE_DEDUCTION_INTERVAL === 0) {
          setWalletBalance((prevBalance) => {
            const newBalance = Math.max(0, prevBalance - CHAT_RATE_PER_MINUTE);
            
            // Pause session if balance hits zero
            if (newBalance === 0) {
              setIsSessionPaused(true);
            }
            
            return newBalance;
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionEnded, sessionTime]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText || sessionEnded || isSessionPaused) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simulate astrologer response
    setTimeout(() => {
      const responses = [
        "I understand your concern. Let me analyze your birth chart for this.",
        "Based on your planetary positions, I can provide insights on this matter.",
        "That's an interesting question. The stars indicate...",
        "I see. Let me guide you with the astrological perspective."
      ];
      
      const astrologerMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "astrologer",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, astrologerMessage]);
    }, 1500);
  };

  const handleEndSession = () => {
    setShowEndDialog(false);
    setSessionEnded(true);
    onEndSession(formatTime(sessionTime));
  };

  const handleRecharge = () => {
    if (onRecharge) {
      onRecharge();
    }
  };

  const handleMinimize = () => {
    if (onMinimize && !sessionEnded) {
      onMinimize(formatTime(sessionTime));
    }
    onBack();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMinimize}
            className="h-10 w-10 p-0 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <ImageWithFallback 
                src={astrologer?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                alt={astrologer?.name || "Astrologer"}
                className="w-full h-full object-cover"
              />
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm truncate">{astrologer?.name || "Astrologer"}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="tabular-nums w-11">{formatTime(sessionTime)}</span>
                <span className="mx-1 flex-shrink-0">•</span>
                <Wallet className={`w-3 h-3 flex-shrink-0 ${walletBalance === 0 ? "text-primary" : ""}`} />
                <span className={`tabular-nums ${walletBalance === 0 ? "text-primary font-medium animate-pulse" : ""}`}>
                  ₹{walletBalance}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowEndDialog(true)}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-9 px-4 active:scale-95 transition-transform"
          disabled={sessionEnded}
        >
          <PhoneOff className="w-4 h-4 mr-1" />
          End
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative">
        {/* Subtle background pattern */}
        <ChatBackground />
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} relative z-10`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-white shadow-sm rounded-bl-sm"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className={`text-xs mt-1 block ${
                message.sender === "user" ? "text-white/70" : "text-muted-foreground"
              }`}>
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Session Paused - Zero Balance */}
      {isSessionPaused && !sessionEnded && (
        <SessionPausedBar 
          onRecharge={handleRecharge}
          sessionTime={formatTime(sessionTime)}
        />
      )}

      {/* Message Suggestions */}
      {!sessionEnded && !isSessionPaused && messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-border bg-white">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {messageSuggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer whitespace-nowrap px-3 py-2 h-auto border-primary/30 text-primary hover:bg-primary/10 active:scale-95 transition-transform"
                onClick={() => handleSendMessage(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      {!sessionEnded && (
        <div className={`bg-white px-4 py-3 border-t border-border ${isSessionPaused ? 'pb-24' : ''}`}>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isSessionPaused ? "Recharge to continue..." : "Type your message..."}
              className={`flex-1 h-12 rounded-xl border-2 ${isSessionPaused ? 'bg-muted cursor-not-allowed border-border/50' : 'bg-accent border-accent-foreground/20 focus:border-accent-foreground/40 text-foreground placeholder:text-muted-foreground'}`}
              disabled={isSessionPaused}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSessionPaused}
              className="h-12 w-12 p-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* End Session Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="max-w-[90%] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>End Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this chat session? The session duration is {formatTime(sessionTime)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEndSession}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 m-0"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

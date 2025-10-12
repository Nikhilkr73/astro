import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { EmailLogin } from "./components/EmailLogin";
import { OnboardingForm } from "./components/OnboardingForm";
import { Home } from "./components/Home";
import { AstrologerProfile } from "./components/AstrologerProfile";
import { ChatHistoryTab } from "./components/ChatHistoryTab";
import { ChatScreen } from "./components/ChatScreen";
import { WalletScreen } from "./components/WalletScreen";
import { WalletHistory } from "./components/WalletHistory";
import { TransactionStatus } from "./components/TransactionStatus";
import { ProfileScreen } from "./components/ProfileScreen";
import { RatingPopup } from "./components/RatingPopup";
import { BottomNavigation } from "./components/BottomNavigation";
import { ActiveChatBar } from "./components/ActiveChatBar";
import { NoInternetOverlay } from "./components/NoInternetOverlay";
import { WebViewScreen } from "./components/WebViewScreen";
import { toast, Toaster } from "sonner@2.0.3";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] =
    useState(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [sessionDuration, setSessionDuration] =
    useState("0:00");
  const [activeChatSession, setActiveChatSession] = useState<{
    astrologer: any;
    duration: string;
  } | null>(null);
  const [showNoInternet, setShowNoInternet] = useState(false);

  // Auto-navigate from splash screen after 3 seconds
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    if (!isOnboarded) {
      setCurrentScreen("onboarding");
    } else {
      setCurrentScreen("home");
    }
  };

  const handleSkipLogin = () => {
    // For testing purposes, skip login and onboarding
    setIsLoggedIn(true);
    setIsOnboarded(true);
    setCurrentScreen("home");
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setCurrentScreen("home");
  };

  const handleAstrologerClick = (astrologer: any) => {
    setSelectedAstrologer(astrologer);
    setCurrentScreen("astrologer-profile");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleStartSession = (type: "chat" | "call") => {
    if (type === "chat") {
      setCurrentScreen("chat-session");
    } else {
      // For call, simulate session ending after 5 seconds for demo
      setTimeout(() => {
        setShowRatingPopup(true);
      }, 5000);
    }
  };

  const handleEndChatSession = (duration: string) => {
    setSessionDuration(duration);
    setActiveChatSession(null); // Clear active session
    setShowRatingPopup(true);
  };

  const handleMinimizeChat = (duration: string) => {
    // Save the active chat session
    setActiveChatSession({
      astrologer: selectedAstrologer,
      duration: duration,
    });
  };

  const handleResumeChat = () => {
    setCurrentScreen("chat-session");
  };

  const handleEndActiveChat = () => {
    if (activeChatSession) {
      setSessionDuration(activeChatSession.duration);
      setActiveChatSession(null);
      setShowRatingPopup(true);
    }
  };

  const handleChatClick = (astrologer: any) => {
    setSelectedAstrologer(astrologer);
    setCurrentScreen("chat-session");
  };

  const handleRatingSubmit = (
    rating: number,
    feedback: string,
  ) => {
    console.log("Rating submitted:", { rating, feedback });
    setShowRatingPopup(false);
    // After rating from chat, go back to chat screen
    if (currentScreen === "chat-session") {
      // Stay on chat screen (user can continue chatting)
    } else {
      setCurrentScreen("home");
    }
  };

  const handleToggleNoInternet = () => {
    setShowNoInternet(!showNoInternet);
  };

  const handleRetryConnection = () => {
    // Simulate retry attempt
    console.log("Retrying connection...");
    // In real app, this would check network status
    setTimeout(() => {
      setShowNoInternet(false);
    }, 1000);
  };

  const showBottomNav =
    isLoggedIn &&
    isOnboarded &&
    ![
      "splash",
      "login",
      "onboarding",
      "astrologer-profile",
      "wallet-history",
      "transaction-success",
      "transaction-failed",
      "transaction-pending",
      "chat-session",
    ].includes(currentScreen);

  const showActiveChatBar =
    activeChatSession && currentScreen !== "chat-session";

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen />;
      case "login":
        return (
          <EmailLogin
            onLogin={handleLogin}
            onSkip={handleSkipLogin}
            onNavigate={handleNavigate}
          />
        );
      case "terms":
        return (
          <WebViewScreen
            type="terms"
            onBack={() => setCurrentScreen("login")}
          />
        );
      case "privacy":
        return (
          <WebViewScreen
            type="privacy"
            onBack={() => setCurrentScreen("login")}
          />
        );
      case "onboarding":
        return (
          <OnboardingForm
            onComplete={handleOnboardingComplete}
          />
        );
      case "home":
        return (
          <Home
            onAstrologerClick={handleAstrologerClick}
            onNavigate={handleNavigate}
            onToggleNoInternet={handleToggleNoInternet}
          />
        );
      case "astrologer-profile":
        return (
          <AstrologerProfile
            astrologer={selectedAstrologer}
            onBack={() => setCurrentScreen("home")}
            onStartSession={handleStartSession}
          />
        );
      case "wallet":
        return <WalletScreen onNavigate={handleNavigate} />;
      case "wallet-history":
        return <WalletHistory onNavigate={handleNavigate} />;
      case "transaction-success":
        return (
          <TransactionStatus
            status="success"
            onNavigate={handleNavigate}
          />
        );
      case "transaction-failed":
        return (
          <TransactionStatus
            status="failed"
            onNavigate={handleNavigate}
          />
        );
      case "transaction-pending":
        return (
          <TransactionStatus
            status="pending"
            onNavigate={handleNavigate}
          />
        );
      case "profile":
        return <ProfileScreen onNavigate={handleNavigate} />;
      case "chat":
        return <ChatHistoryTab onChatClick={handleChatClick} />;
      case "chat-session":
        return (
          <ChatScreen
            astrologer={selectedAstrologer}
            onBack={() => setCurrentScreen("chat")}
            onEndSession={handleEndChatSession}
            onMinimize={handleMinimizeChat}
            onRecharge={() => setCurrentScreen("wallet")}
            initialBalance={8}
          />
        );
      default:
        return (
          <Home
            onAstrologerClick={handleAstrologerClick}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen bg-background overflow-hidden">
      <div
        className={
          showBottomNav
            ? showActiveChatBar
              ? "pb-40"
              : "pb-20"
            : showActiveChatBar
              ? "pb-24"
              : ""
        }
      >
        {renderScreen()}
      </div>

      {showActiveChatBar && (
        <ActiveChatBar
          astrologer={activeChatSession!.astrologer}
          sessionTime={activeChatSession!.duration}
          onResumeChat={handleResumeChat}
          onEndChat={handleEndActiveChat}
        />
      )}

      {showBottomNav && (
        <BottomNavigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      )}

      {showRatingPopup && selectedAstrologer && (
        <RatingPopup
          isOpen={showRatingPopup}
          onClose={() => setShowRatingPopup(false)}
          astrologer={selectedAstrologer}
          sessionType={
            currentScreen === "chat-session" ? "chat" : "call"
          }
          sessionDuration={sessionDuration || "12 min"}
          onSubmitRating={handleRatingSubmit}
        />
      )}

      <Toaster position="top-center" />

      <NoInternetOverlay
        isVisible={showNoInternet}
        onRetry={handleRetryConnection}
      />
    </div>
  );
}
import { MessageSquare, X, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
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
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ActiveChatBarProps {
  astrologer: any;
  sessionTime: string;
  onResumeChat: () => void;
  onEndChat: () => void;
}

export function ActiveChatBar({ astrologer, sessionTime, onResumeChat, onEndChat }: ActiveChatBarProps) {
  const [showEndDialog, setShowEndDialog] = useState(false);

  const handleEndClick = () => {
    setShowEndDialog(true);
  };

  const handleConfirmEnd = () => {
    setShowEndDialog(false);
    onEndChat();
  };

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 z-40 bg-white border-t-2 border-primary shadow-lg overflow-hidden">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Astrologer Info */}
            <div 
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer active:opacity-70 transition-opacity"
              onClick={onResumeChat}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11 border-2 border-primary shadow-md">
                  <ImageWithFallback 
                    src={astrologer?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                    alt={astrologer?.name || "Astrologer"}
                    className="w-full h-full object-cover"
                  />
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium truncate">Chat with {astrologer?.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="tabular-nums">{sessionTime}</span>
                  <span className="mx-0.5">•</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={onResumeChat}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-3 text-sm active:scale-95 transition-transform"
              >
                Resume
              </Button>
              <Button
                onClick={handleEndClick}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 hover:text-red-600 active:scale-95 transition-transform flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* End Chat Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="max-w-[90%] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>End Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your active chat with {astrologer?.name}? The session duration is {sessionTime}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmEnd}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 m-0"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

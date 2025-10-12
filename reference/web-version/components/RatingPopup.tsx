import { useState } from "react";
import { Star, X, MessageCircle, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  astrologer: {
    name: string;
    image: string;
  };
  sessionType: "chat" | "call";
  sessionDuration: string;
  onSubmitRating: (rating: number, feedback: string) => void;
}

export function RatingPopup({ 
  isOpen, 
  onClose, 
  astrologer, 
  sessionType, 
  sessionDuration,
  onSubmitRating 
}: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmitRating(rating, feedback);
      onClose();
      // Reset form
      setRating(0);
      setFeedback("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92%] max-w-md mx-auto rounded-2xl border-0 shadow-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl mb-4">Rate Your Experience</DialogTitle>
          <DialogDescription className="sr-only">
            Rate your experience with the astrologer and provide feedback
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Astrologer Info */}
          <div className="text-center">
            <ImageWithFallback
              src={astrologer?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
              alt={astrologer?.name || "Astrologer"}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
            <h3 className="font-medium mb-1">{astrologer?.name || "Astrologer"}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {sessionType === "chat" ? (
                <MessageCircle className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              <span>{sessionType === "chat" ? "Chat" : "Voice Call"} • {sessionDuration}</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">How was your experience?</p>
            <div className="flex justify-center gap-3 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 transform active:scale-110 p-1"
                >
                  <Star
                    className={`w-9 h-9 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {rating === 0 && "Tap to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Share your feedback (Optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="min-h-[80px] rounded-xl border-0 bg-input-background resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {feedback.length}/200
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
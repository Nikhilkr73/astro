import { useState, useEffect } from "react";
import { MessageCircle, Clock, Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChatHistorySkeletonLoader } from "./skeletons/ChatHistorySkeletonLoader";

interface ChatHistoryTabProps {
  onChatClick: (astrologer: any) => void;
}

interface ChatHistory {
  id: string;
  astrologer: {
    name: string;
    image: string;
    category: string;
    rating: number;
  };
  lastMessage: string;
  timestamp: string;
  duration: string;
  unread?: boolean;
}

const chatHistory: ChatHistory[] = [
  {
    id: "1",
    astrologer: {
      name: "Pandit Rajesh Kumar",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      category: "Vedic Astrology",
      rating: 4.8
    },
    lastMessage: "Thank you for the consultation. Your guidance was very helpful!",
    timestamp: "2 hours ago",
    duration: "25 min",
    unread: false
  },
  {
    id: "2",
    astrologer: {
      name: "Dr. Priya Sharma",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      category: "Love & Relationships",
      rating: 4.9
    },
    lastMessage: "I'll send you the detailed report shortly.",
    timestamp: "Yesterday",
    duration: "18 min",
    unread: true
  },
  {
    id: "3",
    astrologer: {
      name: "Acharya Vivek Singh",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      category: "Career & Business",
      rating: 4.7
    },
    lastMessage: "The planetary positions suggest a favorable time ahead.",
    timestamp: "3 days ago",
    duration: "32 min",
    unread: false
  }
];

export function ChatHistoryTab({ onChatClick }: ChatHistoryTabProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ChatHistorySkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl">Chat History</h1>
        <p className="text-sm text-muted-foreground">Your previous consultations</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg text-muted-foreground mb-2">No Chat History</h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation with an astrologer
            </p>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <Card 
              key={chat.id}
              className="border-0 shadow-sm rounded-2xl cursor-pointer active:scale-98 transition-transform"
              onClick={() => onChatClick({ ...chat.astrologer, isOnline: true })}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                      <ImageWithFallback 
                        src={chat.astrologer.image} 
                        alt={chat.astrologer.name}
                        className="w-full h-full object-cover"
                      />
                    </Avatar>
                    {chat.unread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">1</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm truncate">{chat.astrologer.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-accent text-accent-foreground border-0">
                            {chat.astrologer.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{chat.astrologer.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.timestamp}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{chat.duration}</span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-sm ${chat.unread ? 'text-foreground' : 'text-muted-foreground'} line-clamp-2 mt-2`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

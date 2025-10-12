import { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageCircle, Phone, Award, Clock, Languages, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AstrologerProfileSkeletonLoader } from "./skeletons/AstrologerProfileSkeletonLoader";

interface AstrologerProfileProps {
  astrologer: any;
  onBack: () => void;
  onStartSession: (type: "chat" | "call") => void;
}

export function AstrologerProfile({ astrologer, onBack, onStartSession }: AstrologerProfileProps) {
  const [isLoading, setIsLoading] = useState(true);
  const skills = ["Love & Relationships", "Career Guidance", "Health Issues", "Finance", "Marriage", "Business"];
  const reviews = [
    { name: "Ravi Kumar", rating: 5, comment: "Very accurate predictions. Highly recommended!", date: "2 days ago" },
    { name: "Priya Singh", rating: 5, comment: "Helped me a lot with career guidance. Thank you!", date: "1 week ago" },
    { name: "Amit Sharma", rating: 4, comment: "Good consultation. Will consult again.", date: "2 weeks ago" }
  ];

  // Simulate data fetching
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [astrologer]);

  if (!astrologer || isLoading) {
    return <AstrologerProfileSkeletonLoader onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-10 w-10 p-0 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-medium">Astrologer Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Profile Header */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1733255024979-8620deee5245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGFzdHJvbG9nZXJ8ZW58MXx8fHwxNzU5ODY0NjQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={astrologer?.name || "Astrologer"}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                {astrologer?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">{astrologer?.name || "Pandit Rajesh Kumar"}</h2>
                <p className="text-muted-foreground mb-2">{astrologer?.category || "Vedic Astrology"}</p>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{astrologer?.rating || "4.8"}</span>
                    <span className="text-sm text-muted-foreground">({astrologer?.reviews || "1250"} reviews)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {astrologer?.experience || "15+ years"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Response in 2 min
                  </Badge>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Languages</span>
              </div>
              <div className="flex gap-2">
                {(astrologer?.languages || ["Hindi", "English"]).map((lang: string) => (
                  <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => onStartSession("chat")}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl active:scale-95 transition-transform"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Chat - ₹8/min</span>
              </Button>
              <Button 
                onClick={() => onStartSession("call")}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-primary text-primary hover:bg-accent active:scale-95 transition-transform"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">Call - ₹12/min</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <h3 className="font-medium mb-4">Specializations</h3>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="justify-center py-2.5 rounded-lg text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-medium mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I am a renowned Vedic astrologer with over 15 years of experience in providing accurate 
              predictions and guidance. I specialize in love relationships, career guidance, and health 
              predictions. My consultations are based on ancient Vedic principles combined with modern insights.
            </p>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.name}</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
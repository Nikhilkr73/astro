import { useState, useEffect } from "react";
import { MessageCircle, Phone, Star, Heart, Users, Briefcase, Sparkles, Plus, Wallet, BookOpen, Home as HomeIcon, Eye, Hand, GraduationCap, TrendingUp, HeartHandshake, Activity, IndianRupee, Scale, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HomeSkeletonLoader } from "./skeletons/HomeSkeletonLoader";

interface HomeProps {
  onAstrologerClick: (astrologer: any) => void;
  onNavigate?: (screen: string) => void;
  onToggleNoInternet?: () => void;
}

// All astrologers data categorized
const allAstrologersData = [
  // Vedic Astrology
  {
    id: 1,
    name: "Pandit Rajesh Kumar",
    category: "Vedic Astrology",
    rating: 4.8,
    reviews: 1250,
    experience: "15+ years",
    languages: ["Hindi", "English"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1662302392561-b1deecd3579d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBhc3Ryb2xvZ2VyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5OTM1OTgxfDA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 5,
    name: "Acharya Vinod Sharma",
    category: "Vedic Astrology",
    rating: 4.9,
    reviews: 2300,
    experience: "22+ years",
    languages: ["Hindi", "Sanskrit", "English"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1606028058142-b8440bd39503?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjB0cmFkaXRpb25hbCUyMHByaWVzdHxlbnwxfHx8fDE3NTk5MzU5ODJ8MA&ixlib=rb-4.1.0&q=80&w=400"
  },
  // Numerology
  {
    id: 2,
    name: "Dr. Priya Sharma",
    category: "Numerology",
    rating: 4.9,
    reviews: 890,
    experience: "12+ years",
    languages: ["Hindi", "English", "Bengali"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1731056995482-6def83b56fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNwaXJpdHVhbCUyMGFkdmlzb3J8ZW58MXx8fHwxNzU5OTM1OTgwfDA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 6,
    name: "Kavita Malhotra",
    category: "Numerology",
    rating: 4.7,
    reviews: 650,
    experience: "10+ years",
    languages: ["Hindi", "English", "Punjabi"],
    isOnline: false,
    image: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc1OTg5NTk3MHww&ixlib=rb-4.1.0&q=80&w=400"
  },
  // Palmistry
  {
    id: 3,
    name: "Guru Vikash Joshi",
    category: "Palmistry",
    rating: 4.7,
    reviews: 2100,
    experience: "20+ years",
    languages: ["Hindi", "Marathi"],
    isOnline: false,
    image: "https://images.unsplash.com/photo-1595243463493-55235da19aec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBndXJ1JTIwc3Bpcml0dWFsJTIwdGVhY2hlcnxlbnwxfHx8fDE3NTk5MzU5ODF8MA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 7,
    name: "Swami Anand Kumar",
    category: "Palmistry",
    rating: 4.6,
    reviews: 1420,
    experience: "18+ years",
    languages: ["Hindi", "English"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1662302392561-b1deecd3579d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBhc3Ryb2xvZ2VyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5OTM1OTgxfDA&ixlib=rb-4.1.0&q=80&w=400"
  },
  // Tarot Reading
  {
    id: 4,
    name: "Acharya Meera Devi",
    category: "Tarot Reading",
    rating: 4.8,
    reviews: 756,
    experience: "8+ years",
    languages: ["Hindi", "English", "Tamil"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1580605587359-bca3e3683db1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBlbGRlcmx5JTIwd29tYW4lMjBzYWdlfGVufDF8fHx8MTc1OTkzNTk4MXww&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 8,
    name: "Nisha Kapoor",
    category: "Tarot Reading",
    rating: 4.8,
    reviews: 980,
    experience: "9+ years",
    languages: ["Hindi", "English", "Gujarati"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1731056995482-6def83b56fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNwaXJpdHVhbCUyMGFkdmlzb3J8ZW58MXx8fHwxNzU5OTM1OTgwfDA&ixlib=rb-4.1.0&q=80&w=400"
  },
  // Vastu
  {
    id: 9,
    name: "Pt. Ramesh Chaturvedi",
    category: "Vastu",
    rating: 4.7,
    reviews: 1150,
    experience: "16+ years",
    languages: ["Hindi", "English"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1606028058142-b8440bd39503?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjB0cmFkaXRpb25hbCUyMHByaWVzdHxlbnwxfHx8fDE3NTk5MzU5ODJ8MA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 10,
    name: "Sunita Desai",
    category: "Vastu",
    rating: 4.6,
    reviews: 540,
    experience: "11+ years",
    languages: ["Hindi", "Marathi", "English"],
    isOnline: false,
    image: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc1OTg5NTk3MHww&ixlib=rb-4.1.0&q=80&w=400"
  },
  // Face Reading
  {
    id: 11,
    name: "Guruji Harish Patel",
    category: "Face Reading",
    rating: 4.5,
    reviews: 420,
    experience: "13+ years",
    languages: ["Hindi", "Gujarati"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1595243463493-55235da19aec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBndXJ1JTIwc3Bpcml0dWFsJTIwdGVhY2hlcnxlbnwxfHx8fDE3NTk5MzU5ODF8MA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 12,
    name: "Lalita Krishnan",
    category: "Face Reading",
    rating: 4.7,
    reviews: 680,
    experience: "14+ years",
    languages: ["Hindi", "Tamil", "English"],
    isOnline: true,
    image: "https://images.unsplash.com/photo-1580605587359-bca3e3683db1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBlbGRlcmx5JTIwd29tYW4lMjBzYWdlfGVufDF8fHx8MTc1OTkzNTk4MXww&ixlib=rb-4.1.0&q=80&w=400"
  }
];

const categories = [
  { name: "All", icon: Sparkles },
  { name: "Love", icon: Heart },
  { name: "Education", icon: GraduationCap },
  { name: "Career", icon: Briefcase },
  { name: "Marriage", icon: HeartHandshake },
  { name: "Health", icon: Activity },
  { name: "Wealth", icon: IndianRupee },
  { name: "Legal", icon: Scale },
  { name: "Finance", icon: DollarSign },
];

export function Home({ onAstrologerClick, onNavigate, onToggleNoInternet }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filter astrologers based on selected category
  const filteredAstrologers = selectedCategory === "All" 
    ? allAstrologersData 
    : allAstrologersData.filter(astrologer => astrologer.category === selectedCategory);

  if (isLoading) {
    return <HomeSkeletonLoader />;
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <div className="bg-gradient-to-b from-white to-background flex-shrink-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-4">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg">Kundli</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Test No Internet Button */}
            {onToggleNoInternet && (
              <button
                onClick={onToggleNoInternet}
                className="w-8 h-8 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center active:scale-95 transition-transform"
                title="Test No Internet"
              >
                <span className="text-xs">📡</span>
              </button>
            )}
            
            {/* Wallet Button */}
            <button 
              onClick={() => onNavigate?.('wallet')}
              className="flex items-center gap-2 px-4 h-10 bg-primary/10 rounded-full border-2 border-primary/20 active:scale-95 transition-transform"
            >
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-primary">₹500</span>
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Offer Banner */}
        <div className="px-4 pb-4">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-foreground text-sm mb-1">🎉 Special Offer!</p>
              <p className="text-muted-foreground text-xs">Get 50% OFF on your first consultation</p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 rounded-xl h-9 px-4"
            >
              Claim Now
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border active:scale-95 transition-all whitespace-nowrap ${
                    isSelected 
                      ? 'border-primary bg-primary text-white shadow-md' 
                      : 'bg-white border-border/50 hover:border-primary/30'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable Astrologer List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredAstrologers.map((astrologer) => (
          <Card 
            key={astrologer.id} 
            className="border-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
          >
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/10 shadow-sm">
                    <ImageWithFallback
                      src={astrologer.image}
                      alt={astrologer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online Status */}
                  {astrologer.isOnline && (
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full shadow-md">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Online
                    </div>
                  )}
                  {!astrologer.isOnline && (
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-gray-400 text-white text-[10px] px-2 py-1 rounded-full shadow-md">
                      Offline
                    </div>
                  )}
                </div>
                
                {/* Info Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Name & Category */}
                  <div>
                    <h3 className="truncate text-foreground mb-1">{astrologer.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs px-2 py-0">
                        {astrologer.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{astrologer.rating}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {astrologer.reviews} reviews
                    </span>
                  </div>
                  
                  {/* Experience & Languages */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {astrologer.experience}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="truncate">{astrologer.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 mx-4" />

              {/* Action Buttons */}
              <div className="flex gap-2 p-3">
                <Button 
                  size="sm" 
                  className="h-10 px-4 bg-primary text-white hover:bg-primary/90 rounded-xl active:scale-[0.98] transition-all flex-1 shadow-sm"
                  onClick={() => onAstrologerClick(astrologer)}
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Chat • ₹8/min
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-10 px-4 rounded-xl border-border/50 text-muted-foreground hover:bg-accent active:scale-[0.98] transition-all flex-1 relative"
                  disabled
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  Call • ₹12/min
                  <Badge className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white text-[9px] px-1.5 py-0.5 border-0 shadow-sm">
                    Soon
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

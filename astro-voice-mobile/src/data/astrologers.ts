/**
 * Astrologers Data
 * 
 * Sample astrologer data for the app.
 */

export interface Astrologer {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  experience: string;
  languages: string[];
  isOnline: boolean;
  image: string;
  specialties?: string[];
  chatRate: number;
  callRate: number;
}

export const astrologersData: Astrologer[] = [
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
    image: "https://images.unsplash.com/photo-1662302392561-b1deecd3579d?w=400",
    specialties: ["Career", "Marriage", "Love"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1606028058142-b8440bd39503?w=400",
    specialties: ["Health", "Finance", "Education"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1731056995482-6def83b56fbf?w=400",
    specialties: ["Love", "Career", "Wealth"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=400",
    specialties: ["Marriage", "Education"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1595243463493-55235da19aec?w=400",
    specialties: ["Legal", "Finance", "Career"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1662302392561-b1deecd3579d?w=400",
    specialties: ["Health", "Wealth", "Love"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1580605587359-bca3e3683db1?w=400",
    specialties: ["Love", "Career", "Marriage"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1731056995482-6def83b56fbf?w=400",
    specialties: ["Wealth", "Education", "Health"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1606028058142-b8440bd39503?w=400",
    specialties: ["Career", "Finance", "Legal"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=400",
    specialties: ["Marriage", "Love", "Health"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1595243463493-55235da19aec?w=400",
    specialties: ["Education", "Career", "Wealth"],
    chatRate: 8,
    callRate: 12,
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
    image: "https://images.unsplash.com/photo-1580605587359-bca3e3683db1?w=400",
    specialties: ["Love", "Marriage", "Finance"],
    chatRate: 8,
    callRate: 12,
  },
];

export const categories = [
  { name: "All", icon: "star" },
  { name: "Love", icon: "heart" },
  { name: "Education", icon: "book" },
  { name: "Career", icon: "briefcase" },
  { name: "Marriage", icon: "users" },
  { name: "Health", icon: "activity" },
  { name: "Wealth", icon: "dollar-sign" },
  { name: "Legal", icon: "book-open" },
  { name: "Finance", icon: "trending-up" },
];

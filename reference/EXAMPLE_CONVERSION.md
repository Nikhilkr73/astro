# Example Conversion: Web → React Native

This document shows a side-by-side comparison of converting a component from web to React Native.

---

## Example: Converting a Simple Astrologer Card

### Web Version (Downloaded)

```tsx
// Web version using Tailwind CSS and shadcn/ui
import { Star, MessageCircle, Phone, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

interface AstrologerCardProps {
  astrologer: {
    id: number;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    experience: string;
    languages: string[];
    isOnline: boolean;
    image: string;
  };
  onChatClick: () => void;
}

export function AstrologerCard({ astrologer, onChatClick }: AstrologerCardProps) {
  return (
    <Card className="border-0 rounded-2xl overflow-hidden shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/10">
              <img 
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
          </div>
          
          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-foreground mb-1">{astrologer.name}</h3>
            <Badge className="bg-primary/10 text-primary border-0 text-xs px-2 py-0 mb-2">
              {astrologer.category}
            </Badge>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm">{astrologer.rating}</span>
              </div>
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
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-3 border-t border-border/50">
          <Button 
            onClick={onChatClick}
            className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl h-10"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Chat • ₹8/min
          </Button>
          <Button 
            variant="outline"
            disabled
            className="flex-1 rounded-xl h-10"
          >
            <Phone className="w-4 h-4 mr-1.5" />
            Call • ₹12/min
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### React Native Version (Converted)

```tsx
// React Native version using StyleSheet
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface AstrologerCardProps {
  astrologer: {
    id: number;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    experience: string;
    languages: string[];
    isOnline: boolean;
    image: string;
  };
  onChatClick: () => void;
}

export function AstrologerCard({ astrologer, onChatClick }: AstrologerCardProps) {
  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.content}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: astrologer.image }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          {/* Online Status */}
          {astrologer.isOnline ? (
            <View style={[styles.statusBadge, styles.onlineBadge]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.offlineBadge]}>
              <Text style={styles.statusText}>Offline</Text>
            </View>
          )}
        </View>
        
        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {astrologer.name}
          </Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{astrologer.category}</Text>
          </View>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color="#EAB308" solid />
              <Text style={styles.ratingText}>{astrologer.rating}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.reviewText}>
              {astrologer.reviews} reviews
            </Text>
          </View>
          
          {/* Experience & Languages */}
          <View style={styles.detailsRow}>
            <View style={styles.experienceRow}>
              <Icon name="briefcase" size={12} color={colors.mutedForeground} />
              <Text style={styles.detailText}>{astrologer.experience}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, shadows.sm]}
          onPress={onChatClick}
          activeOpacity={0.8}
        >
          <Icon name="message-circle" size={16} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Chat • ₹8/min</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          disabled
          activeOpacity={0.8}
        >
          <Icon name="phone" size={16} color={colors.mutedForeground} />
          <Text style={styles.secondaryButtonText}>Call • ₹12/min</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Soon</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.base,
  },
  
  // Image Styles
  imageContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  imageWrapper: {
    width: 96,
    height: 96,
    borderRadius: borderRadius['2xl'],
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.1)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Status Badge
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineBadge: {
    backgroundColor: colors.online,
  },
  offlineBadge: {
    backgroundColor: colors.offline,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  
  // Info Styles
  infoContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  
  // Rating Styles
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
    fontFamily: typography.fontFamily.regular,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  reviewText: {
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
  },
  
  // Details Styles
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: spacing.base,
  },
  
  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: borderRadius.xl,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  secondaryButtonText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  soonBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  soonText: {
    color: colors.warningForeground,
    fontSize: 9,
    fontFamily: typography.fontFamily.medium,
  },
});
```

---

## Key Differences Explained

### 1. HTML → React Native Components
```tsx
// Web
<div className="...">
<span className="...">
<img src="..." />
<button onClick="...">

// React Native
<View style={...}>
<Text style={...}>
<Image source={{ uri: ... }} />
<TouchableOpacity onPress={...}>
```

### 2. Styling Approach
```tsx
// Web: Inline Tailwind classes
className="flex gap-4 p-4"

// React Native: StyleSheet
style={styles.content}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
});
```

### 3. Icons
```tsx
// Web: lucide-react
import { Star, MessageCircle } from "lucide-react";
<Star className="w-4 h-4" />

// React Native: react-native-vector-icons
import Icon from 'react-native-vector-icons/Feather';
<Icon name="star" size={16} color="#EAB308" />
```

### 4. Buttons
```tsx
// Web: Button component with onClick
<Button onClick={handleClick} className="...">
  Click me
</Button>

// React Native: TouchableOpacity with onPress
<TouchableOpacity onPress={handleClick} style={styles.button}>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>
```

### 5. Images
```tsx
// Web: img tag with src
<img src={url} alt="..." className="..." />

// React Native: Image component with source
<Image 
  source={{ uri: url }} 
  style={styles.image}
  resizeMode="cover"
/>
```

---

## Benefits of This Approach

1. **Type Safety:** Full TypeScript support
2. **Performance:** Native performance vs web view
3. **Design Tokens:** Centralized styling with `designTokens.ts`
4. **Reusability:** Components can be reused across screens
5. **Maintainability:** Clear separation of styles
6. **Native Feel:** Uses platform-specific components

---

## Next Steps

1. Create base UI components library
2. Convert screen by screen following this pattern
3. Test on both iOS and Android
4. Integrate with backend services
5. Polish animations and transitions



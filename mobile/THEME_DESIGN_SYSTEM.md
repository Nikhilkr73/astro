# 🎨 AstroVoice Orange-Gold Design System

## Overview

This document defines the complete design system for AstroVoice, a premium astrology consultation app. The theme is inspired by warm, spiritual aesthetics found in apps like Astrotalk and Guruji, creating a modern yet mystical user experience.

## 🎨 Color Palette

### Primary Colors
```css
Primary Orange:     #F7931E
Primary Light:      #FFB347  
Primary Dark:       #E8851A
```

### Background Colors
```css
Main Background:    #FFF8F0  (soft cream)
Card Background:    #FFFFFF  (pure white)
Secondary BG:       #F9FAFB  (light gray)
```

### Text Colors
```css
Primary Text:       #2E2E2E  (dark gray)
Secondary Text:     #6B7280  (medium gray)
Tertiary Text:      #9CA3AF  (light gray)
Light Text:         #D1D5DB  (very light gray)
```

### Accent Colors
```css
Gold Highlight:     #FFD580
Light Gold:         #FFE4B5
Border Gold:        #FFE4B5
```

### Status Colors
```css
Success:            #10B981  (green)
Error:              #EF4444  (red)
Warning:            #F59E0B  (amber)
Info:               #3B82F6  (blue)
Online:             #10B981  (green)
Offline:            #6B7280  (gray)
```

### Gradients
```css
Primary Gradient:   #F7931E → #FFB347
Vertical Gradient:  #F7931E → #FFB347 (top to bottom)
```

## 📝 Typography

### Font Family: Poppins
```css
Regular:    Poppins_400Regular
Medium:     Poppins_500Medium (used for headings and emphasis)
SemiBold:   Poppins_500Medium (mapped to medium for lighter feel)
Bold:       Poppins_500Medium (mapped to medium for lighter feel)
```

### Font Sizes
```css
xs:     12px   (small labels, captions)
sm:     14px   (body text, descriptions)
base:   16px   (primary text, buttons)
lg:     18px   (subheadings)
xl:     20px   (headings)
2xl:    24px   (large headings)
3xl:    28px   (hero text)
4xl:    32px   (app titles)
5xl:    36px   (display text)
```

### Line Heights
```css
Tight:     1.2  (headings, titles)
Normal:    1.4  (body text)
Relaxed:   1.6  (long form content)
```

## 📏 Spacing Scale

```css
xs:     4px    (micro spacing)
sm:     8px    (small spacing)
md:     12px   (medium spacing)
lg:     16px   (large spacing)
xl:     20px   (extra large)
2xl:    24px   (section spacing)
3xl:    32px   (page margins)
4xl:    40px   (large margins)
5xl:    48px   (hero spacing)
```

## 🔲 Border Radius

```css
sm:     8px    (small elements)
md:     12px   (buttons, inputs)
lg:     16px   (cards, containers)
xl:     20px   (large cards)
2xl:    24px   (hero elements)
full:   9999px (circular elements)
```

## 🎯 Icon System

### Icon Library: MaterialCommunityIcons
- **Size**: 24-28px for most icons
- **Style**: Outlined icons preferred
- **Color**: Inherit from parent text color

### Navigation Icons
```css
Home:     home-outline
Chat:     chat-outline  
Wallet:   wallet-outline
Profile:  account-circle-outline
```

### Action Icons
```css
Send:     send
Call:     phone
Chat:     message-text
Star:     star-outline
Time:     clock-outline
Location: map-marker
```

## 🌟 Shadows & Elevation

### Shadow Colors
```css
Light Shadow:    #000000 (opacity: 0.1-0.15)
Orange Shadow:   #F7931E (opacity: 0.25-0.3)
```

### Shadow Levels
```css
Small:    0px 1px 2px  (subtle elevation)
Medium:   0px 2px 4px  (card elevation)
Large:    0px 4px 8px  (modal elevation)
Orange:   0px 2px 4px  (branded elements)
```

## 🎭 Component Styles

### Buttons

#### Primary Button
```css
Background:    #F7931E
Text:          #FFFFFF
Border Radius: 12px
Padding:       16px vertical, 16px horizontal
Shadow:        Orange shadow
Font:          Poppins Medium 16px
```

#### Secondary Button
```css
Background:    Transparent
Border:        2px solid #F7931E
Text:          #F7931E
Border Radius: 12px
Padding:       16px vertical, 16px horizontal
Font:          Poppins Medium 16px
```

#### Gradient Button
```css
Background:    Linear gradient (#F7931E → #FFB347)
Text:          #FFFFFF
Border Radius: 12px
Padding:       16px vertical, 16px horizontal
Shadow:        Orange shadow
Font:          Poppins Medium 16px
```

### Cards
```css
Background:    #FFFFFF
Border Radius: 16px
Padding:       16px
Shadow:        Medium shadow
Border:        1px solid #FFE4B5 (optional)
```

### Input Fields
```css
Background:    #FFFFFF
Border:        2px solid #FFE4B5
Border Radius: 12px
Padding:       16px
Font:          Poppins Regular 16px
Focus Border:  #F7931E
```

### Navigation
```css
Background:    #FFFFFF
Border Top:    1px solid #FFE4B5
Height:        80px
Active Color:  #F7931E
Inactive:      #9CA3AF
Font:          Poppins Medium 12px
```

## 🎨 Screen-Specific Guidelines

### Home Screen
- **Header**: Orange logo with white sparkle icon
- **Wallet Button**: Light gold background with orange text
- **Offer Banner**: Light gold background with orange accents
- **Category Buttons**: Orange when selected, white when inactive
- **Action Buttons**: Gradient chat button, outlined call button
- **Cards**: White background with medium shadow

### Wallet Screen
- **Balance Card**: Orange gradient background
- **Recharge Buttons**: Gold borders, white background
- **Transaction Items**: Light gray backgrounds with orange accents
- **Stats**: Orange icons with dark text

### Profile Screen
- **Avatar**: Orange gradient background
- **Menu Items**: White background with light gold borders
- **Stats**: Orange dividers
- **Logout Button**: Light red background

### Chat Screens
- **User Messages**: Orange background, white text
- **Astrologer Messages**: Light cream background, dark text
- **Send Button**: Orange gradient
- **Input Field**: Gold borders
- **Unread Indicators**: Orange dots

### Onboarding Screens
- **Progress Bar**: Orange fill
- **Form Inputs**: Gold borders, orange focus
- **Continue Button**: Orange gradient
- **Completion Screen**: Green success with orange accent

## 🎯 Design Principles

### 1. Warm & Spiritual
- Use warm orange-gold tones throughout
- Avoid harsh contrasts or deep blacks
- Prefer soft, rounded edges over sharp corners

### 2. Minimal & Clean
- Generous white space
- Clear hierarchy with typography
- Subtle shadows for depth

### 3. Consistent Interactions
- 0.8 opacity on all touchable elements
- Smooth transitions and animations
- Clear visual feedback

### 4. Premium Feel
- High-quality gradients
- Refined typography
- Thoughtful spacing

## 📱 Platform Considerations

### iOS
- Use system fonts as fallback
- Respect safe areas
- Follow iOS design guidelines for spacing

### Android
- Use Material Design principles
- Ensure proper elevation
- Test on various screen sizes

### Web
- Ensure gradients work across browsers
- Test font loading
- Optimize for touch and mouse interactions

## 🔧 Implementation Notes

### Theme File Structure
```typescript
// mobile/src/constants/theme.ts
export const colors = { ... }
export const typography = { ... }
export const spacing = { ... }
export const borderRadius = { ... }
export const shadows = { ... }
export const gradients = { ... }
```

### Usage Examples
```typescript
// Import theme
import { colors, typography, spacing } from '../constants/theme';

// Use in styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.orange,
  },
  text: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
});
```

## 🎨 Brand Guidelines

### Logo Usage
- Always use orange (#F7931E) background
- White sparkle icon (✨)
- Minimum size: 40px
- Always include proper spacing

### App Name
- Font: Poppins Bold
- Color: Dark gray (#2E2E2E) on light backgrounds
- Color: White on orange backgrounds
- Size: 24px-32px depending on context

### Taglines
- Font: Poppins Regular
- Color: Secondary gray (#6B7280)
- Size: 14px-16px
- Keep concise and spiritual

## 📊 Accessibility

### Color Contrast
- Ensure 4.5:1 ratio for normal text
- Ensure 3:1 ratio for large text
- Test with color blindness simulators

### Typography
- Minimum 14px for body text
- Use sufficient line height (1.4+)
- Avoid pure black text

### Touch Targets
- Minimum 44px touch target size
- Adequate spacing between interactive elements
- Clear visual feedback

## 🔄 Future Considerations

### Dark Mode
```css
Background:    #1E1E1E
Text:          #FFF3E0
Accent:        Same orange-gold gradient
Cards:         #2A2A2A
```

### Seasonal Themes
- Consider subtle variations for festivals
- Maintain core orange-gold identity
- Add seasonal accent colors sparingly

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained by**: AstroVoice Design Team

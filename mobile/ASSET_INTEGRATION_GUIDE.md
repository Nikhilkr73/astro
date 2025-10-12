# 🖼️ Asset Integration Guide

Once you have generated and saved your images, follow these steps to integrate them into the app.

---

## 📂 Step 1: Save Images to Folders

Make sure your generated images are saved in the correct locations:

```
assets/
├── icons/
│   ├── icon_all.png
│   ├── icon_love.png
│   ├── icon_marriage.png
│   └── icon_career.png
├── avatars/
│   ├── avatar_tina.png
│   ├── avatar_mohit.png
│   ├── avatar_priyanka.png
│   └── avatar_harsh.png
└── logo/
    └── kundli_logo.png
```

---

## 🔧 Step 2: Update Astrologer Data

### File: `src/data/astrologers.ts`

Replace the empty `avatar: ''` with the actual image paths:

```typescript
export const astrologersData: Astrologer[] = [
  {
    id: 'tina_kulkarni_vedic_marriage',
    name: 'Tina Kulkarni',
    // ... other fields ...
    avatar: require('../../assets/avatars/avatar_tina.png'),  // ← Add this
  },
  {
    id: 'mohit_vedic_marriage',
    name: 'Mohit',
    // ... other fields ...
    avatar: require('../../assets/avatars/avatar_mohit.png'),  // ← Add this
  },
  {
    id: 'priyanka_vedic_love',
    name: 'Priyanka',
    // ... other fields ...
    avatar: require('../../assets/avatars/avatar_priyanka.png'),  // ← Add this
  },
  {
    id: 'harsh_dubey_vedic_love',
    name: 'Harsh Dubey',
    // ... other fields ...
    avatar: require('../../assets/avatars/avatar_harsh.png'),  // ← Add this
  },
];
```

---

## 🎨 Step 3: Update Category Icons

### File: `src/screens/AstrologerSelectionScreen.tsx`

Replace the emoji icons with actual images.

**Find this code (around line 25):**
```typescript
const CATEGORY_TABS = [
  { id: 'All', label: 'All', icon: '⭐', color: Colors.categoryAll },
  { id: 'Love', label: 'Love', icon: '💕', color: Colors.categoryLove },
  { id: 'Marriage', label: 'Marriage', icon: '💍', color: Colors.categoryMarriage },
  { id: 'Career', label: 'Career', icon: '💼', color: Colors.categoryCareer },
];
```

**Replace with:**
```typescript
const CATEGORY_TABS = [
  { 
    id: 'All', 
    label: 'All', 
    icon: require('../../assets/icons/icon_all.png'),
    color: Colors.categoryAll 
  },
  { 
    id: 'Love', 
    label: 'Love', 
    icon: require('../../assets/icons/icon_love.png'),
    color: Colors.categoryLove 
  },
  { 
    id: 'Marriage', 
    label: 'Marriage', 
    icon: require('../../assets/icons/icon_marriage.png'),
    color: Colors.categoryMarriage 
  },
  { 
    id: 'Career', 
    label: 'Career', 
    icon: require('../../assets/icons/icon_career.png'),
    color: Colors.categoryCareer 
  },
];
```

**Then update the rendering (around line 90):**

Find:
```typescript
<Text style={styles.categoryIcon}>{category.icon}</Text>
```

Replace with:
```typescript
<Image 
  source={category.icon} 
  style={styles.categoryIconImage}
  resizeMode="contain"
/>
```

**Add this style (in styles at bottom):**
```typescript
categoryIconImage: {
  width: 36,
  height: 36,
},
```

---

## 🏷️ Step 4: Update Kundli Logo

### File: `src/screens/AstrologerSelectionScreen.tsx`

**Find this code (around line 70):**
```typescript
<View style={styles.kundliLogo}>
  <View style={styles.kundliDiamond}>
    <View style={styles.kundliCenter} />
  </View>
</View>
```

**Replace with:**
```typescript
<Image
  source={require('../../assets/logo/kundli_logo.png')}
  style={styles.kundliLogoImage}
  resizeMode="contain"
/>
```

**Update the style (replace kundliLogo styles):**
```typescript
kundliLogoImage: {
  width: 40,
  height: 40,
},
```

**Remove these unused styles:**
```typescript
// Delete these:
kundliLogo: { ... }
kundliDiamond: { ... }
kundliCenter: { ... }
```

---

## 🎭 Step 5: Update Astrologer Card Images

### File: `src/components/AstrologerCard.tsx`

The code already checks for `astrologer.avatar` and displays it if present!

**Current code (around line 54):**
```typescript
{astrologer.avatar ? (
  <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
) : (
  <View style={...}>...</View>
)}
```

**Change to:**
```typescript
{astrologer.avatar ? (
  <Image source={astrologer.avatar} style={styles.imageBackground} />
) : (
  <LinearGradient...>...</LinearGradient>
)}
```

**Update the image container (around line 45):**

Find:
```typescript
<View style={styles.imageContainer}>
  <LinearGradient
    colors={getPlaceholderGradient(astrologer.gender)}
    style={styles.imagePlaceholder}
  >
    {/* content */}
  </LinearGradient>
</View>
```

Replace with:
```typescript
<View style={styles.imageContainer}>
  {astrologer.avatar ? (
    <ImageBackground
      source={astrologer.avatar}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      {/* Keep the overlay and content */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageOverlay}
      />
      {/* Rest of content (language badge, name, etc.) */}
    </ImageBackground>
  ) : (
    <LinearGradient
      colors={getPlaceholderGradient(astrologer.gender)}
      style={styles.imagePlaceholder}
    >
      {/* Keep existing placeholder content */}
    </LinearGradient>
  )}
</View>
```

**Add import at top:**
```typescript
import { ImageBackground } from 'react-native';
```

**Add this style:**
```typescript
imageBackground: {
  width: '100%',
  height: '100%',
  justifyContent: 'space-between',
},
```

---

## ✅ Step 6: Test the App

```bash
cd astro-voice-mobile
npm start
```

Then scan the QR code with Expo Go on your phone.

**You should see:**
- ✅ Kundli logo in header
- ✅ Beautiful category icons (not emoji)
- ✅ Real astrologer photos on cards

---

## 🔄 Alternative: Using URIs (if using URLs)

If your images are hosted online instead of local files:

```typescript
// For avatars
avatar: 'https://your-cdn.com/avatars/tina.png'

// In component
<Image source={{ uri: astrologer.avatar }} style={...} />

// For category icons
icon: 'https://your-cdn.com/icons/love.png'
```

---

## 🐛 Troubleshooting

### Images not showing?

1. **Check file paths** - Make sure files are in correct folders
2. **Restart Metro bundler** - Stop app and run `npm start` again
3. **Clear cache**: `npm start -- --reset-cache`
4. **Check file extensions** - Use `.png` not `.PNG`

### Images too large?

Optimize images before using:
```bash
# Install ImageOptim or use online tools
# Target sizes:
# - Icons: < 50KB each
# - Avatars: < 200KB each
# - Logo: < 100KB
```

### TypeScript errors?

Update the type in `src/types/index.ts`:
```typescript
avatar: string | number;  // Allow both URI and require()
```

---

## 📝 Quick Checklist

After adding images:

- [ ] All 4 avatar images saved in `assets/avatars/`
- [ ] All 4 category icons saved in `assets/icons/`
- [ ] Kundli logo saved in `assets/logo/`
- [ ] Updated `astrologers.ts` with avatar paths
- [ ] Updated `AstrologerSelectionScreen.tsx` for icons & logo
- [ ] Updated `AstrologerCard.tsx` for avatar display
- [ ] Tested app on device
- [ ] Images display correctly
- [ ] No console errors

---

## 🎨 Image Optimization Tips

### Before Adding to App:

1. **Compress images** (use TinyPNG or ImageOptim)
2. **Use correct format**:
   - PNG for icons and logo (transparency)
   - JPEG for photos (smaller file size)
3. **Optimize dimensions**:
   - Don't use 4000x4000 when 800x800 works
   - Mobile doesn't need huge images

### Recommended Tools:

- **TinyPNG** - https://tinypng.com/
- **Squoosh** - https://squoosh.app/
- **ImageOptim** - https://imageoptim.com/

---

## 🚀 Ready to Go!

Once you've followed all these steps, your app will have beautiful, professional images instead of placeholders!

Need help? Check the error console or ask for assistance with specific issues.

---

**Last Updated:** October 4, 2025


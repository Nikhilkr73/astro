# Android Logcat Filters

## Quick Filter for Our App

### **Option 1: Simple Filter**
```
package:com.astrovoice.kundli
```

This shows only logs from our app.

### **Option 2: Multiple Tags**
```
ChatSessionScreen|PersistentChatBar|ChatSessionContext|apiService
```

Shows logs from these specific components.

### **Option 3: Combine Package + Log Level**
```
package:com.astrovoice.kundli level:DEBUG
```

Shows debug logs from our app only.

### **Option 4: Exclude System Logs**
```
package:com.astrovoice.kundli -tag:system -tag:ActivityManager
```

Shows only our app logs, excluding system messages.

---

## Comprehensive Filter for Development

### **Recommended Filter**
```
package:com.astrovoice.kundli tag:ReactNativeJS
```

This shows:
- ✅ Our app package
- ✅ JavaScript console logs (console.log, console.error, etc.)

---

## Advanced Filters

### **1. Our App + React Native**
```
^((ChatSessionScreen|PersistentChatBar|ChatSessionContext|apiService).*)|(ReactNativeJS.*)|(Metro.*)
```

Shows logs from specific components + React Native + Metro bundler.

### **2. Our App + Errors Only**
```
package:com.astrovoice.kundli level:ERROR
```

Shows only errors from our app.

### **3. Specific Component**
```
tag:ChatSessionScreen
```

Shows only logs from ChatSessionScreen component.

---

## Common Filters

### **All App Logs**
```
package:com.astrovoice.kundli
```

### **App + Metro Bundler**
```
package:com.astrovoice.kundli tag:Metro
```

### **Errors and Warnings Only**
```
package:com.astrovoice.kundli level:ERROR,level:WARN
```

### **Custom Tag (if you add tags)**
```
tag:astrovoice
```

---

## How to Apply in Android Studio

1. Open **Logcat** tab (bottom of Android Studio)
2. In the filter box (top of Logcat), type the filter
3. Press **Enter**

**Example:**
```
package:com.astrovoice.kundli
```

---

## How to Apply via Command Line

```bash
adb logcat -s ReactNativeJS:* ChatSessionScreen:* PersistentChatBar:* ChatSessionContext:* apiService:*
```

---

## Useful Commands

### **Clear Logcat**
```bash
adb logcat -c
```

### **Save Logs to File**
```bash
adb logcat -s ReactNativeJS:* > logs.txt
```

### **Filter and Save**
```bash
adb logcat -s ReactNativeJS:* package:com.astrovoice.kundli > app_logs.txt
```

---

## What to Look For

Based on the fixes we implemented, look for these log messages:

### **Back Button / Pause**
```
🔙 beforeRemove triggered
🔙 conversationId: ...
🔙 Attempting to pause session...
✅ Session paused on navigation
⚠️ Temporary unified conversation - showing persistent bar directly
```

### **Scroll**
```
📏 ScrollView layout: {width: 414, height: 700, ...}
📐 Content size: 380 6318
```

### **Timer**
```
💰 Unified History - Wallet: ₹...
⏰ Starting timer...
⚠️ Warning: Only 1 minute remaining!
```

### **End Session**
```
⚠️ Skipping API call for temporary unified conversation
✅ Temporary session ended (no API call)
```

### **Unified History**
```
📜 Loading unified chat history
✅ Unified history loaded: 54 messages
```

---

## Troubleshooting

### **No Logs Showing**
1. Make sure app is running on emulator
2. Check emulator is selected in device dropdown
3. Clear Logcat: `adb logcat -c`

### **Too Many Logs**
Add level filter:
```
package:com.astrovoice.kundli level:ERROR,level:WARN
```

### **Want More Detail**
```
package:com.astrovoice.kundli level:DEBUG,level:INFO
```

---

## Recommended Setup

**For Testing:**
```
package:com.astrovoice.kundli tag:ReactNativeJS level:DEBUG
```

This shows:
- ✅ All our app logs
- ✅ JavaScript console output
- ✅ Debug level details
- ❌ No system spam

---

## Quick Copy-Paste

```bash
# Start logcat with our filter
adb logcat -s ReactNativeJS:* | grep -E "(ChatSessionScreen|PersistentChatBar|ChatSessionContext|apiService|💰|🔙|⏰|📏)"
```

This will show:
- Our JavaScript logs
- Only lines containing our component names or emoji markers
- Continuous output


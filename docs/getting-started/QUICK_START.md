# 🚀 Quick Start - AstroVoice

**Last Updated:** October 11, 2025 ✨ **NEW STRUCTURE**

## ⚡ Start in 30 Seconds

### 1. Start Backend (Terminal 1)

**Option A: New Method (Recommended)** 🆕
```bash
lsof -ti:8000 | xargs kill -9
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate  # Activate virtual environment
./start_backend.sh
```

**Option B: Python Module** 🆕
```bash
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate  # Activate virtual environment
python3 -m backend.main
```

**Option C: Old Method (Still Works)**
```bash
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate  # Activate virtual environment
python3 main_openai_realtime.py
```

✅ Wait for: Server starting messages and `Uvicorn running on http://0.0.0.0:8000`

### 2. Start Mobile App (Terminal 2)
```bash
lsof -ti:8081 | xargs kill -9
cd /Users/nikhil/workplace/voice_v1/mobile
npm start
```
✅ Wait for: QR code to appear

### 3. Test on Phone or Android Studio

**Option A: Expo Go (Quick)**
1. Open **Expo Go** app on your phone
2. **Scan QR code** from terminal
3. Tap **Voice Chat** → Select astrologer
4. **Press & hold mic** → Speak → Release
5. See response: **"नमस्ते! मैं आपकी बात सुन रहा हूं..."**

**Option B: Android Studio Emulator (Full Testing)**

### Step-by-Step Android Studio Testing

**1. Start Backend Server:**
```bash
# Kill any existing backend
lsof -ti:8000 | xargs kill -9

# Start backend
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate
python3 main_openai_realtime.py > backend.log 2>&1 &

# Verify backend is running
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"astro-voice-api","version":"1.0.0"}
```

**2. Start Metro Bundler:**
```bash
# Kill any existing Metro
lsof -ti:8081 | xargs kill -9

# Start Metro
cd /Users/nikhil/workplace/voice_v1/mobile
npm start
# Wait for QR code to appear
# Keep this terminal open!
```

**3. Start Android Emulator:**
- Open **Android Studio**
- Go to **Tools** → **Device Manager**
- Click **▶️ Play button** next to your virtual device
- Wait for emulator to boot (shows Android home screen)

**4. Build and Run App:**
```bash
# In a NEW terminal window
cd /Users/nikhil/workplace/voice_v1
./run-android.sh
```
   - First build takes 3-5 minutes
   - App will install and launch automatically

**5. Test Features on Emulator:**
- ✅ Navigate to Home → Select astrologer
- ✅ Scroll chat history
- ✅ Send messages  
- ✅ Press back button → PersistentChatBar appears
- ✅ Click Resume → Chat reopens
- ✅ Click End → Session ends without errors

**6. View Logs in Android Studio:**
- Open Android Studio Logcat tab
- Filter by: `package:com.astrovoice.kundli`
- Or use filter: `ReactNativeJS:*`
- This shows all app logs with emojis (💰🔙⏰)

---

## 🔄 Reload App After Code Changes

### **Backend Changes (Python Code)**
```bash
# Kill old backend
lsof -ti:8000 | xargs kill -9

# Restart with new code
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate
python3 main_openai_realtime.py > backend.log 2>&1 &
```

### **Mobile App Changes (React Native/TypeScript)**
- **Quick reload:** Press `r` in Metro bundler terminal
- **Full reload:** Press `shift + r` in Metro bundler terminal
- **Emulator:** Shake device (Ctrl+M) → "Reload"
- **Clear cache:** Press `shift + r` or restart Metro with `npm start -- --reset-cache`

### **Reload on Android Studio**
1. **In Metro terminal:** Press `r` (reload) or `shift+r` (full reload)
2. **In emulator:** Shake gesture (Ctrl+M → Reload)
3. **Or:** Run `./run-android.sh` again (full rebuild)

---

## 🛑 Stop Everything

```bash
# Stop backend server
lsof -ti:8000 | xargs kill -9

# Stop Metro bundler
lsof -ti:8081 | xargs kill -9

# Stop Android build process
killall -9 node

# Close Android emulator manually
# (Right-click emulator window → Quit)
```

**Or use one command to stop all:**
```bash
lsof -ti:8000,8081 | xargs kill -9 && killall -9 node
```

---

## 🧹 Clean & Build Commands

### **Clean Old Builds**
```bash
# Quick clean (recommended)
./clean.sh

# Or manual clean
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete
cd mobile && rm -rf node_modules && cd ..
cd mobile && npx expo r -c && cd ..
cd infrastructure && rm -rf cdk.out && cd ..
rm -f *.log backend.log server_output.log
rm -f tests/*_fixed.py tests/test_output.txt
```

### **Fresh Build Setup**
```bash
# Quick build (recommended)
./build.sh

# Or manual build
# 1. Clean everything
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete
cd mobile && rm -rf node_modules && cd ..
cd infrastructure && rm -rf cdk.out && cd ..

# 2. Install Python dependencies (in virtual environment)
source venv/bin/activate
pip install -r requirements.txt

# 3. Install mobile dependencies
cd mobile && npm install && cd ..

# 4. Install CDK dependencies
cd infrastructure && npm install && cd ..

# 5. Test the setup
python3 tests/unit/test_database_no_db.py
```

### **Production Build**
```bash
# Backend build (Python) - MUST use virtual environment
source venv/bin/activate
pip install -r requirements.txt
python3 -c "from backend.database.manager import db; print('✅ Backend ready')"

# Mobile build (Expo)
cd mobile
npm install
npx expo build:android  # For Android
npx expo build:ios      # For iOS
cd ..

# Infrastructure build (AWS CDK)
cd infrastructure
npm install
cdk synth
cd ..
```

---

## 📦 Git Commands

### **Commit & Push Changes**
```bash
# Add all changes
git add .

# Commit with message
git commit -m "feat: your feature description"

# Push to main branch
git push origin main

# Check status
git status
```

### **Pull Latest Changes**
```bash
# Pull latest from main
git pull origin main

# Check for updates
git fetch origin
git log --oneline -5
```

### **Branch Management**
```bash
# Create new branch
git checkout -b feature/your-feature-name

# Switch to main
git checkout main

# Merge branch
git checkout main
git merge feature/your-feature-name
git push origin main
```

---

## 🧪 Testing Commands

### **Run Tests**
```bash
# Run tests without database (always works)
python3 tests/unit/test_database_no_db.py

# Run all tests (requires psycopg2)
python3 tests/run_tests.py

# Run specific test types
python3 tests/run_tests.py unit
python3 tests/run_tests.py integration
python3 tests/run_tests.py api
```

### **Install Test Dependencies**
```bash
# Activate virtual environment first
source venv/bin/activate

# Install psycopg2 for database tests
pip install psycopg2-binary==2.9.10

# Verify installation
python3 -c "import psycopg2; print('✅ psycopg2 ready')"
```

---

## 🚨 Troubleshooting

### **psycopg2 Error: "psycopg2 not available - database features disabled"**
```bash
# Problem: Backend server not running in virtual environment
# Solution: Always activate virtual environment before starting server

# Kill existing server
lsof -ti:8000 | xargs kill -9

# Start server with virtual environment
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate
python3 -m backend.main
```

### **User Registration Fails**
```bash
# Check if psycopg2 is available
source venv/bin/activate
python3 -c "import psycopg2; print('✅ psycopg2 ready')"

# If not available, install it
pip install psycopg2-binary==2.9.10

# Restart server
lsof -ti:8000 | xargs kill -9
source venv/bin/activate
python3 -m backend.main
```

### **Server Won't Start**
```bash
# Check if port is in use
lsof -ti:8000

# Kill process if needed
lsof -ti:8000 | xargs kill -9

# Check virtual environment
source venv/bin/activate
python3 --version
```

### **Android Build Issues**
```bash
# If Gradle errors occur (especially "Unresolved reference: serviceOf"):
# Clear Gradle cache and rebuild

cd /Users/nikhil/workplace/voice_v1/mobile/android
rm -rf .gradle ~/.gradle/caches

# Verify Android SDK is set
cat android/local.properties
# Should show: sdk.dir=/Users/nikhil/Library/Android/sdk

# Rebuild
cd /Users/nikhil/workplace/voice_v1
./run-android.sh
```

### **Android Emulator Not Starting**
```bash
# Check if emulator is available
emulator -list-avds

# Start emulator manually
emulator -avd YourEmulatorName &

# Check running emulators
adb devices
```

### **View Logs While Testing**
```bash
# View only our app logs (recommended)
# In Android Studio Logcat, use filter:
package:com.astrovoice.kundli

# Or from command line:
adb logcat -s ReactNativeJS:* | grep -E "(ChatSessionScreen|PersistentChatBar|💰|🔙|⏰)"

# Clear logs
adb logcat -c
```

📖 **Full Logcat Guide:** [`docs/getting-started/ANDROID_LOGCAT_FILTERS.md`](ANDROID_LOGCAT_FILTERS.md)

---

## ✅ Quick Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"astro-voice-api","version":"1.0.0"}
```

---

## 🆕 What's New (October 2025)

### **New Startup Options**
- ✨ **`./start_backend.sh`** - Convenient startup script (auto-sets PYTHONPATH)
- ✨ **`python3 -m backend`** - Python module approach
- ✅ Old method still works: `python3 main_openai_realtime.py`

### **Improved Structure**
- 📦 Backend now in `backend/` directory (modular)
- 📱 Mobile app in `mobile/` (renamed)
- 📚 Docs organized in `docs/` by category
- 🧪 Tests in `tests/` directory
- 📊 Data files in `data/`

### **Key Benefits**
- ✅ Easier to navigate
- ✅ Professional structure
- ✅ Better organization
- ✅ 100% backward compatible
- ✅ All tests passing (17/17)

---

## 🎯 New Structure (October 2025) ✨

After refactoring, the project now has a professional structure:
- **`backend/`** - All Python backend code (new modular structure)
- **`mobile/`** - Mobile app (renamed from `astro-voice-mobile`)
- **`infrastructure/`** - AWS CDK (renamed from `astro-voice-aws-infra`)
- **`data/`** - Data files (astrologer personas, user data)
- **`scripts/`** - Utility scripts
- **`web/`** - Web interface
- **`docs/`** - Organized documentation
- **`tests/`** - Test suite

**See:** [`docs/MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md) for complete details

---

## 📱 Current Status

| Feature | Status |
|---------|--------|
| Backend Server | ✅ Working (New Structure) |
| Voice Recording | ✅ Working |
| Backend Connection | ✅ Working |
| Text Responses | ✅ Working |
| OpenAI Integration | ✅ Tested & Working |
| Astrologer Personas | ✅ 3 Personas Active |
| Audio Responses | 🏗️ Coming Soon |
| Backward Compatibility | ✅ 100% Compatible |

---

## 📱 Building APK/AAB for Physical Device & Emulator Testing

### ⚙️ Quick Setup: Switch Between Emulator and Physical Device

**For Emulator Testing:**
1. Edit `mobile/src/config/api.ts`:
   ```typescript
   const USE_PHYSICAL_DEVICE_IP = false; // Emulator mode
   ```
2. Run: `npx expo start` or `npx expo run:android`
3. Uses `10.0.2.2:8000` automatically (emulator special IP)

**For Physical Device (APK/AAB):**
1. Edit `mobile/src/config/api.ts`:
   ```typescript
   const USE_PHYSICAL_DEVICE_IP = true; // Physical device mode
   const MAC_IP_ADDRESS = '192.168.0.105'; // Your Mac's IP
   ```
2. Build APK: `cd mobile/android && ./gradlew assembleDebug`
3. Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`
4. Uses `192.168.0.105:8000` (your Mac's IP on same WiFi)

### 📚 Complete Build Guide

**See comprehensive guide:** [`BUILD_APK_AAB.md`](./BUILD_APK_AAB.md)

**Quick Commands:**
```bash
# Build debug APK (for testing)
cd mobile/android && ./gradlew assembleDebug

# Build release APK (optimized)
cd mobile/android && ./gradlew assembleRelease

# Build AAB (for Play Store)
cd mobile/android && ./gradlew bundleRelease

# Install APK
adb install -r app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "ReactNative"
```

**Important:** 
- ✅ Backend must be running: `python3 main_openai_realtime.py`
- ✅ Mac and device must be on same WiFi network
- ✅ Rebuild APK after changing `api.ts` configuration

**For production deployment:** Deploy backend to AWS/Heroku and update the API URL.

---

## 📚 More Documentation

- **Migration Guide:** [`docs/MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md)
- **Test Results:** [`TEST_RESULTS.md`](../../TEST_RESULTS.md)
- **Backend README:** [`backend/README.md`](../../backend/README.md)
- **Full Comparison:** [`docs/BEFORE_AFTER_COMPARISON.md`](../BEFORE_AFTER_COMPARISON.md)



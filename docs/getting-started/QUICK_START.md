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

## 📱 Building APK for Physical Device

### Step 1: Enable Developer Mode on Your Device

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (you'll see "You are now a developer!")
3. Go back to **Settings** → **Developer Options**
4. Enable:
   - ✅ **USB Debugging**
   - ✅ **Install via USB**

### Step 2: Connect Device via USB

```bash
# Verify device is connected
cd mobile
adb devices
# Should show: GY7PDEQWF6USXCW4    device
```

### Step 3: Start Metro Bundler & Forward Port

```bash
# Kill any existing Metro processes
lsof -ti:8081 | xargs kill -9

# Start Metro bundler
cd /Users/nikhil/workplace/voice_v1/mobile
npm start -- --reset-cache

# In a NEW terminal, forward port 8081 to your device
adb reverse tcp:8081 tcp:8081
# Should output: 8081
```

### Step 4: Build & Install on Device

**Option A: Via Android Studio (Easiest)**
1. Open **Android Studio**
2. Open `/Users/nikhil/workplace/voice_v1/mobile/android` folder
3. Select your device from dropdown (top toolbar)
4. Click **Play button (▶️)** or press `Cmd+R` (Mac) / `Ctrl+R` (Windows)
5. App will build and install automatically

**Option B: Via Command Line**
```bash
cd mobile/android
./gradlew installDebug

# App will install automatically
```

### Step 5: Fix "Could not connect to development server"

If you see a red error screen:

1. **Kill all Metro processes:**
```bash
lsof -ti:8081 | xargs kill -9
```

2. **Restart Metro with reset cache:**
```bash
cd mobile
npm start -- --reset-cache
```

3. **Forward port:**
```bash
adb reverse tcp:8081 tcp:8081
```

4. **On your device:** Tap **"RELOAD"** or shake device → Reload

### Step 6: View Logs

```bash
# Real-time filtered logs
adb logcat | grep "ReactNative"

# Or save errors to file
adb logcat -d *:E > device_errors.txt

# In Android Studio Logcat:
# Filter by: package:com.astrovoice.kundli
```

**Note:** ✅ If app runs on emulator, it WILL run on physical device too!

### Build Standalone APK (No Metro Required!)

For production distribution or testing without running Metro:

```bash
# Build standalone release APK
cd /Users/nikhil/workplace/voice_v1/mobile/android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease

# APK will be at:
# mobile/android/app/build/outputs/apk/release/app-release.apk
```

**Important:** The release APK bundles JavaScript into the APK, so you don't need Metro running!

**To install on your device:**
```bash
# Install release APK
adb install -r mobile/android/app/build/outputs/apk/release/app-release.apk

# Or transfer APK to device and install manually
```

**IMPORTANT:** For physical device testing:

1. **Find your Mac's IP address:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: inet 192.168.1.100
```

2. **Update the API config in the app (already done):**
Edit `mobile/src/config/api.ts` line 19 to your Mac's IP if it changes:
```typescript
android: 'http://192.168.0.105:8000', // Your Mac's IP
```

3. **Start the backend:**
```bash
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate
python3 main_openai_realtime.py > backend.log 2>&1 &
```

4. **Rebuild the app** after changing the config:
```bash
cd mobile/android
./gradlew installDebug
```

**For production deployment:** Deploy backend to AWS/Heroku and update the API URL.

---

## 📚 More Documentation

- **Migration Guide:** [`docs/MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md)
- **Test Results:** [`TEST_RESULTS.md`](../../TEST_RESULTS.md)
- **Backend README:** [`backend/README.md`](../../backend/README.md)
- **Full Comparison:** [`docs/BEFORE_AFTER_COMPARISON.md`](../BEFORE_AFTER_COMPARISON.md)



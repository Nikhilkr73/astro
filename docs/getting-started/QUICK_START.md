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

### 3. Test on Phone
1. Open **Expo Go** app
2. **Scan QR code** from terminal
3. Tap **Voice Chat** → Select astrologer
4. **Press & hold mic** → Speak → Release
5. See response: **"नमस्ते! मैं आपकी बात सुन रहा हूं..."**

---

## 🔄 Reload App
- **Shake phone** → "Reload"
- Or press `r` in terminal

---

## 🛑 Stop Everything
```bash
lsof -ti:8000 | xargs kill -9  # Stop backend
lsof -ti:8081 | xargs kill -9  # Stop Expo
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

# 2. Install Python dependencies
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
# Backend build (Python)
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
# Install psycopg2 for database tests
pip install psycopg2-binary==2.9.10

# Verify installation
python3 -c "import psycopg2; print('✅ psycopg2 ready')"
```

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

## 📚 More Documentation

- **Migration Guide:** [`docs/MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md)
- **Test Results:** [`TEST_RESULTS.md`](../../TEST_RESULTS.md)
- **Backend README:** [`backend/README.md`](../../backend/README.md)
- **Full Comparison:** [`docs/BEFORE_AFTER_COMPARISON.md`](../BEFORE_AFTER_COMPARISON.md)



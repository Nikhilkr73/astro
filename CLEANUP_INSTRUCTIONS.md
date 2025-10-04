# 🗑️ Workspace Cleanup Instructions

## What Will Be Cleaned

### ❌ Files to Archive (Not Delete)

**Old Backend Implementations** (13 files)
- `main.py` - Old Gemini server
- `main_simple.py` - Simple test server
- `astrology_main.py` - Old astrology server
- `astrology_handler.py` - Old handler
- `grok_conversation_handler.py` - Grok handler
- `grok_only_handler.py` - Grok only
- `gemini_astrology_handler.py` - Gemini handler
- `hybrid_conversation_handler.py` - Hybrid handler
- `conversation_handler.py` - Old conversation
- `simple_tts.py` - Simple TTS test
- `speech_to_text.py` - Old STT
- `voice_processor.py` - Old processor
- `user_profile.py` - Old profile manager

**Test Files** (~20 files)
- All `test_*.py` files
- All `test_*.html` files
- `debug_audio.html`
- `simple_audio_test.html`

**Test Audio** (~9 files)
- All `.wav` test files
- All `.mp3` test files

**Old Documentation** (~6 files)
- `AI_SETUP_GUIDE.md`
- `AWS_SETUP_GUIDE.md`
- `VOICE_AGENT_STATUS.md`
- `status_report.md`
- `view_logs.sh`
- `CLEANUP_ANALYSIS.md`

**Old Static Files** (~9 files)
- `static/index.html` (old)
- `static/script.js` (old)
- `static/style.css` (old)
- `static/voice_only_*` (old interface)
- `static/astrology_*` (old interface)

**Setup Scripts** (2 files)
- `quick_setup.py` (already run)
- `setup_full_ai.sh` (already run)

---

## ✅ Files That Will Stay

**Core Backend** (4 files)
- ✅ `main_openai_realtime.py`
- ✅ `openai_realtime_handler.py`
- ✅ `astrology_profile.py`
- ✅ `logger_utils.py`

**Data Tools** (3 files)
- ✅ `view_user_data.py`
- ✅ `dashboard.py`
- ✅ `export_user_data.py`

**Active Static** (2 files)
- ✅ `static/voice_realtime_index.html`
- ✅ `static/voice_realtime_script.js`

**Configuration** (5 files)
- ✅ `.env`
- ✅ `user_states.json`
- ✅ `requirements.txt`
- ✅ `package.json`
- ✅ `.gitignore`

**Current Documentation** (11+ files)
- ✅ `README.md`
- ✅ `PROJECT_SPEC.md`
- ✅ `QUICK_START.md`
- ✅ `SETUP_COMPLETE.md`
- ✅ `LOGGING_GUIDE.md`
- ✅ `DEPLOYMENT_SUMMARY.md`
- ✅ All user data tool docs
- ✅ And more...

**Directories** (3 important)
- ✅ `astro-voice-mobile/` - Mobile app
- ✅ `astro-voice-aws-infra/` - AWS infrastructure
- ✅ `astrology_data/` - User profiles

**Scripts** (2 files)
- ✅ `tail_logs.sh`
- ✅ `safe_cleanup.sh`

---

## 🚀 How to Run Cleanup

### Option 1: Automatic Safe Cleanup (Recommended)

```bash
# Run the cleanup script
./cleanup_workspace.sh
```

**What it does:**
1. ✅ Backs up important data (`user_states.json`, `.env`, etc.)
2. ✅ Creates dated archive directory
3. ✅ Moves old files to archive (doesn't delete)
4. ✅ Shows detailed summary
5. ✅ Creates cleanup report

**Safe because:**
- Nothing is deleted permanently
- All files are archived
- Can be restored easily
- Backups are created first

### Option 2: Review First, Then Run

```bash
# See what will be archived (dry run)
cat CLEANUP_INSTRUCTIONS.md

# Then run cleanup
./cleanup_workspace.sh
```

---

## 📊 Expected Results

### Before Cleanup
```
Total Files: ~150+
Old Code: 13 files
Test Files: 20+ files
Test Audio: 9 files
Old Docs: 6 files
Old Static: 9 files
```

### After Cleanup
```
Active Files: ~30 files
Archived: ~60 files
Space Saved: 2-3 MB
Organization: Much cleaner!
```

---

## 🔄 What Happens During Cleanup

### Step 1: Verification
- Checks if backend is running
- Verifies health endpoint

### Step 2: Backup
- Creates timestamped backup directory
- Backs up `user_states.json`
- Backs up `user_profiles.json`
- Backs up `.env`

### Step 3-9: Archiving
- Old implementations → `archive_*/old_code/`
- Test files → `archive_*/test_files/`
- Audio files → `archive_*/old_audio/`
- Old docs → `archive_*/old_docs/`
- Old static → `archive_*/old_static/`

### Step 10: Summary
- Shows what was archived
- Lists active files
- Provides next steps

### Step 11: Report
- Creates cleanup report file
- Includes restore instructions

---

## 🛡️ Safety Features

1. **Nothing Deleted** - All files moved to archive
2. **Backups Created** - Important data backed up
3. **Timestamped** - Archives dated for reference
4. **Easy Restore** - Simple restore commands
5. **Report Generated** - Full documentation of changes

---

## 📁 Archive Structure

After cleanup:
```
archive_20251004_HHMMSS/
├── old_code/           # Old backend implementations
├── test_files/         # All test scripts
├── old_audio/          # Test audio files
├── old_docs/           # Old documentation
└── old_static/         # Old web interface files

backups/cleanup_20251004_HHMMSS/
├── user_states.json
├── user_profiles.json
└── .env
```

---

## 🔄 How to Restore (If Needed)

### Restore Everything
```bash
cp -r archive_20251004_HHMMSS/* .
```

### Restore Specific File
```bash
cp archive_20251004_HHMMSS/old_code/main.py .
```

### Restore Category
```bash
cp archive_20251004_HHMMSS/test_files/* .
```

---

## 🗑️ Permanent Deletion (After Testing)

Once you've tested and everything works for a few days:

```bash
# Delete archive permanently
rm -rf archive_20251004_HHMMSS

# Delete old backups (keep latest)
ls -t backups/ | tail -n +2 | xargs -I {} rm -rf backups/{}
```

---

## ✅ After Cleanup Checklist

After running cleanup, verify:

- [ ] Backend starts: `python3 main_openai_realtime.py`
- [ ] Health check works: `curl http://localhost:8000/health`
- [ ] Mobile app connects
- [ ] Voice chat works
- [ ] User data tools work: `python3 view_user_data.py`
- [ ] Dashboard works: `python3 dashboard.py`

If all checks pass, workspace is clean and ready! 🎉

---

## 💡 Tips

1. **Keep Archive** - Don't delete archive immediately
2. **Test Thoroughly** - Test all features after cleanup
3. **Check Mobile** - Make sure mobile app still works
4. **Review Report** - Read the cleanup report
5. **Git Status** - Run `git status` to see changes

---

## 🎯 Summary

**What You Get:**
- ✅ Cleaner workspace (60 fewer files)
- ✅ Only active code visible
- ✅ Better organization
- ✅ Easier to navigate
- ✅ All old files safely archived
- ✅ Easy to restore if needed

**Time Required:** 2-3 minutes

**Risk Level:** Very Low (nothing deleted)

**Recommended:** Yes, for cleaner development

---

## 🚀 Ready to Clean?

```bash
cd /Users/nikhil/workplace/voice_v1
./cleanup_workspace.sh
```

The script will guide you through everything!

---

**Last Updated:** October 4, 2025  
**Status:** ✅ Ready to run  
**Safety:** High (archives, doesn't delete)


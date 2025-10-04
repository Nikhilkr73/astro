#!/bin/bash
# Safe Workspace Cleanup Script for AstroVoice
# This script archives old, deprecated, and test files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================================================="
echo "🗑️  AstroVoice Workspace Cleanup Tool"
echo "=========================================================================="
echo ""

# Function to print colored output
print_green() { echo -e "${GREEN}$1${NC}"; }
print_yellow() { echo -e "${YELLOW}$1${NC}"; }
print_red() { echo -e "${RED}$1${NC}"; }
print_blue() { echo -e "${BLUE}$1${NC}"; }

# Check if we're in the right directory
if [ ! -f "main_openai_realtime.py" ]; then
    print_red "❌ Error: Not in the correct directory. Please run from /Users/nikhil/workplace/voice_v1"
    exit 1
fi

print_green "✅ In correct directory: $(pwd)"
echo ""

# Step 1: Verify backend is working
print_blue "📋 Step 1: Verifying system is working..."
echo ""

if lsof -ti:8000 > /dev/null 2>&1; then
    print_green "✅ Backend server is running on port 8000"
    
    # Try health check
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_green "✅ Backend health check passed"
    else
        print_yellow "⚠️  Backend running but health check failed (might be okay)"
    fi
else
    print_yellow "⚠️  Backend not running (you can still proceed with cleanup)"
fi
echo ""

# Step 2: Backup important data
print_blue "📋 Step 2: Backing up important data..."
echo ""

BACKUP_DIR="backups/cleanup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup user data
if [ -f "user_states.json" ]; then
    cp user_states.json "$BACKUP_DIR/"
    print_green "✅ Backed up user_states.json"
fi

if [ -f "astrology_data/user_profiles.json" ]; then
    cp astrology_data/user_profiles.json "$BACKUP_DIR/"
    print_green "✅ Backed up user_profiles.json"
fi

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/"
    print_green "✅ Backed up .env"
fi

print_green "✅ Backups saved to: $BACKUP_DIR"
echo ""

# Step 3: Create archive directories
print_blue "📋 Step 3: Creating archive directories..."
echo ""

ARCHIVE_BASE="archive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_BASE"/{old_code,test_files,old_docs,old_static,old_audio}

print_green "✅ Created archive: $ARCHIVE_BASE"
echo ""

# Step 4: Archive old implementations
print_blue "📋 Step 4: Archiving old backend implementations..."
echo ""

OLD_IMPLEMENTATIONS=(
    "main.py"
    "main_simple.py"
    "astrology_main.py"
    "astrology_handler.py"
    "grok_conversation_handler.py"
    "grok_only_handler.py"
    "gemini_astrology_handler.py"
    "hybrid_conversation_handler.py"
    "conversation_handler.py"
    "simple_tts.py"
    "speech_to_text.py"
    "voice_processor.py"
    "user_profile.py"
)

count=0
for file in "${OLD_IMPLEMENTATIONS[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/old_code/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

print_green "✅ Archived $count old implementation files"
echo ""

# Step 5: Archive test files
print_blue "📋 Step 5: Archiving test files..."
echo ""

count=0
for file in test_*.py test_*.html; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/test_files/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

# Archive test HTML files
for file in debug_audio.html simple_audio_test.html; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/test_files/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

print_green "✅ Archived $count test files"
echo ""

# Step 6: Archive test audio files
print_blue "📋 Step 6: Archiving test audio files..."
echo ""

TEST_AUDIO=(
    "emoji_test_audio.wav"
    "improved_test_2.wav"
    "improved_test_3.wav"
    "simple_test_audio.wav"
    "test_audio.wav"
    "test_audio_output.mp3"
    "test_audio_output.wav"
    "test_hindi_tts.wav"
    "test_voice_response.wav"
)

count=0
for file in "${TEST_AUDIO[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/old_audio/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

print_green "✅ Archived $count audio test files"
echo ""

# Step 7: Archive old documentation
print_blue "📋 Step 7: Archiving old documentation..."
echo ""

OLD_DOCS=(
    "AI_SETUP_GUIDE.md"
    "AWS_SETUP_GUIDE.md"
    "VOICE_AGENT_STATUS.md"
    "status_report.md"
    "view_logs.sh"
    "CLEANUP_ANALYSIS.md"
)

count=0
for file in "${OLD_DOCS[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/old_docs/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

print_green "✅ Archived $count old documentation files"
echo ""

# Step 8: Archive old static files
print_blue "📋 Step 8: Archiving old static files..."
echo ""

OLD_STATIC=(
    "static/index.html"
    "static/script.js"
    "static/style.css"
)

count=0
for file in "${OLD_STATIC[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/old_static/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

# Archive old voice_only and astrology files in static
for file in static/voice_only_* static/astrology_*; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/old_static/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

print_green "✅ Archived $count old static files"
echo ""

# Step 9: Archive setup scripts
print_blue "📋 Step 9: Archiving one-time setup scripts..."
echo ""

SETUP_SCRIPTS=(
    "quick_setup.py"
    "setup_full_ai.sh"
)

count=0
for file in "${SETUP_SCRIPTS[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_BASE/old_code/"
        print_green "  ✓ Archived: $file"
        ((count++))
    fi
done

print_green "✅ Archived $count setup scripts"
echo ""

# Step 10: Summary
print_blue "=========================================================================="
print_blue "📊 CLEANUP SUMMARY"
print_blue "=========================================================================="
echo ""

print_green "✅ Backup created in: $BACKUP_DIR"
print_green "✅ Old files archived in: $ARCHIVE_BASE"
echo ""

# Count files in archive
total_archived=$(find "$ARCHIVE_BASE" -type f | wc -l | tr -d ' ')
archive_size=$(du -sh "$ARCHIVE_BASE" | cut -f1)

print_green "📦 Total files archived: $total_archived"
print_green "💾 Archive size: $archive_size"
echo ""

# Show what's still active
print_blue "📂 Active files remaining:"
echo ""
print_green "Core Backend:"
print_green "  • main_openai_realtime.py"
print_green "  • openai_realtime_handler.py"
print_green "  • astrology_profile.py"
print_green "  • logger_utils.py"
echo ""

print_green "Data Visibility Tools:"
print_green "  • view_user_data.py"
print_green "  • dashboard.py"
print_green "  • export_user_data.py"
echo ""

print_green "Mobile App:"
print_green "  • astro-voice-mobile/ (complete directory)"
echo ""

print_green "AWS Infrastructure:"
print_green "  • astro-voice-aws-infra/ (complete directory)"
echo ""

print_green "Static Interface:"
print_green "  • static/voice_realtime_index.html"
print_green "  • static/voice_realtime_script.js"
echo ""

# Step 11: Next steps
print_blue "=========================================================================="
print_blue "🎯 NEXT STEPS"
print_blue "=========================================================================="
echo ""

print_yellow "1. Test your application to make sure everything works"
print_yellow "2. Check backend: curl http://localhost:8000/health"
print_yellow "3. Test mobile app connection"
print_yellow "4. Review archive: ls -la $ARCHIVE_BASE"
echo ""

print_yellow "If everything works fine after a few days, you can delete the archive:"
print_yellow "  rm -rf $ARCHIVE_BASE"
echo ""

print_yellow "To restore archived files if needed:"
print_yellow "  cp -r $ARCHIVE_BASE/* ."
echo ""

print_green "✨ Cleanup complete! Your workspace is now much cleaner."
echo ""

# Create cleanup report
REPORT_FILE="cleanup_report_$(date +%Y%m%d_%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
AstroVoice Workspace Cleanup Report
Generated: $(date)
========================================

Backup Location: $BACKUP_DIR
Archive Location: $ARCHIVE_BASE
Total Files Archived: $total_archived
Archive Size: $archive_size

Files Backed Up:
- user_states.json
- user_profiles.json
- .env

Categories Archived:
- Old backend implementations
- Test files (Python and HTML)
- Test audio files
- Old documentation
- Old static files
- Setup scripts

Active Files Remaining:
- Core backend (4 files)
- Data visibility tools (3 files)
- Mobile app directory
- AWS infrastructure directory
- Active static files
- Current documentation

Next Steps:
1. Test application functionality
2. Verify mobile app works
3. Keep archive for a few days
4. Delete archive if everything works: rm -rf $ARCHIVE_BASE

To restore if needed:
cp -r $ARCHIVE_BASE/* .
EOF

print_green "📄 Cleanup report saved: $REPORT_FILE"
echo ""


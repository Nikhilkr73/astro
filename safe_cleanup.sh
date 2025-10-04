#!/bin/bash
# Safe cleanup - archives instead of deletes

echo "🗑️  Starting safe cleanup (archiving old files)..."

# Create archive directories
mkdir -p archive/old_code
mkdir -p archive/test_files  
mkdir -p archive/old_docs
mkdir -p archive/old_static

# Archive old implementations (not main_openai_realtime.py or openai_realtime_handler.py)
mv main.py archive/old_code/ 2>/dev/null
mv main_simple.py archive/old_code/ 2>/dev/null
mv astrology_main.py archive/old_code/ 2>/dev/null
mv astrology_handler.py archive/old_code/ 2>/dev/null
mv grok_*.py archive/old_code/ 2>/dev/null
mv gemini_*.py archive/old_code/ 2>/dev/null
mv hybrid_*.py archive/old_code/ 2>/dev/null
mv conversation_handler.py archive/old_code/ 2>/dev/null
mv simple_tts.py archive/old_code/ 2>/dev/null
mv speech_to_text.py archive/old_code/ 2>/dev/null
mv voice_processor.py archive/old_code/ 2>/dev/null
mv user_profile.py archive/old_code/ 2>/dev/null

# Archive test files
mv test_*.py archive/test_files/ 2>/dev/null
mv test_*.html archive/test_files/ 2>/dev/null
mv *.wav archive/test_files/ 2>/dev/null
mv *.mp3 archive/test_files/ 2>/dev/null
mv debug_audio.html archive/test_files/ 2>/dev/null
mv simple_audio_test.html archive/test_files/ 2>/dev/null

# Archive old docs
mv AI_SETUP_GUIDE.md archive/old_docs/ 2>/dev/null
mv AWS_SETUP_GUIDE.md archive/old_docs/ 2>/dev/null
mv VOICE_AGENT_STATUS.md archive/old_docs/ 2>/dev/null
mv status_report.md archive/old_docs/ 2>/dev/null
mv view_logs.sh archive/old_docs/ 2>/dev/null

# Archive old static files (keep voice_realtime_*)
mv static/index.html archive/old_static/ 2>/dev/null
mv static/script.js archive/old_static/ 2>/dev/null
mv static/style.css archive/old_static/ 2>/dev/null
mv static/voice_only_* archive/old_static/ 2>/dev/null
mv static/astrology_* archive/old_static/ 2>/dev/null
mv static/test_* archive/old_static/ 2>/dev/null

# Archive setup scripts
mv quick_setup.py archive/old_code/ 2>/dev/null
mv setup_full_ai.sh archive/old_code/ 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  - Archived old code to: archive/old_code/"
echo "  - Archived test files to: archive/test_files/"
echo "  - Archived old docs to: archive/old_docs/"
echo "  - Archived old static to: archive/old_static/"
echo ""
echo "🗂️  Archive can be deleted later if not needed:"
echo "  rm -rf archive/"

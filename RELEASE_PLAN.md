# Release Plan - AstroVoice Mobile App

**Last Updated:** November 1, 2025  
**Purpose:** Standardized process for releasing updates to Google Play Console

## Quick Checklist
2. ✅ **Verify database schema initialized** (see Database Initialization section)

Before each Play Store release:
1. ✅ Test locally in Android Studio (uses local backend automatically)
2. ✅ Test AWS endpoints: `./test_aws_api.sh`
3. ✅ Update version in `app.json` and `build.gradle`
4. ✅ Build AAB: `cd mobile/android && ./gradlew bundleRelease`
5. ✅ Upload to Play Console

See full plan in this file for details.

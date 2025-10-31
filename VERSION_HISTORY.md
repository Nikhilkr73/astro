# Version History

**Package:** `com.astrovoice.kundli`

## Published Versions

| Version Code | Version Name | Published Date | Notes |
|-------------|--------------|----------------|-------|
| 4 | 1.0.3 | 2025-11-01 | Initial Google Play Console release |

## Next Version

- **Next Version Code:** 5
- **Next Version Name:** 1.0.4 (or 1.1.0 for minor updates)

---

## Quick Update Script

```bash
# Update to next version
cd /Users/nikhil/workplace/voice_v1
VERSION_CODE=5
VERSION_NAME="1.0.4"

# Update app.json
sed -i '' "s/\"versionCode\": [0-9]*/\"versionCode\": $VERSION_CODE/" mobile/app.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION_NAME\"/" mobile/app.json

# Update build.gradle
sed -i '' "s/versionCode [0-9]*/versionCode $VERSION_CODE/" mobile/android/app/build.gradle
sed -i '' "s/versionName \"[^\"]*\"/versionName \"$VERSION_NAME\"/" mobile/android/app/build.gradle

echo "✅ Updated to version code $VERSION_CODE, version name $VERSION_NAME"
```

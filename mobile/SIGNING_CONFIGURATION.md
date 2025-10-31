# Android Signing Configuration Guide

**Last Updated:** November 2024  
**Purpose:** Configure Android app signing for Google Play Console upload

---

## Prerequisites

1. ✅ Keystore files in `credentials/` folder:
   - `new_keystore.jks` (signing keystore)
   - `upload_certificate.pem` (upload certificate from Google Play Console)

2. ✅ Keystore credentials:
   - **Alias:** `kundli`
   - **Password:** `kundli@123`

3. ✅ Native Android code generated (run `npx expo prebuild --platform android`)

---

## Step 1: Place Keystore Files

Ensure these files are in the `credentials/` folder at project root:

```bash
# Verify files exist
ls -la ../credentials/
# Should show:
# - new_keystore.jks
# - upload_certificate.pem
```

---

## Step 2: Configure Signing in build.gradle

After running `expo prebuild`, edit `android/app/build.gradle`:

### Add signingConfigs block inside `android { }`:

```gradle
android {
    // ... existing code ...

    signingConfigs {
        release {
            storeFile file("../../../credentials/new_keystore.jks")
            storePassword "kundli@123"
            keyAlias "kundli"
            keyPassword "kundli@123"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... other release config ...
        }
    }
}
```

**Note:** The path `../../../credentials/` goes from `android/app/build.gradle` up to project root where `credentials/` folder is located.

---

## Step 3: Alternative - Use Environment Variables (Recommended)

For better security, use environment variables instead of hardcoding passwords:

### 1. Create `android/keystore.properties` (git-ignored):

```properties
storeFile=../../../credentials/new_keystore.jks
storePassword=kundli@123
keyAlias=kundli
keyPassword=kundli@123
```

### 2. Update `android/app/build.gradle`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'] ?: "../../../credentials/new_keystore.jks")
            storePassword keystoreProperties['storePassword'] ?: "kundli@123"
            keyAlias keystoreProperties['keyAlias'] ?: "kundli"
            keyPassword keystoreProperties['keyPassword'] ?: "kundli@123"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

**Note:** Add `android/keystore.properties` to `.gitignore` if you create it.

---

## Step 4: Verify Signing Certificate

Before building, verify the keystore certificate matches the upload certificate:

```bash
# Extract certificate from keystore
keytool -export -alias kundli -keystore credentials/new_keystore.jks -file extracted_cert.pem

# Compare with upload certificate
diff extracted_cert.pem credentials/upload_certificate.pem

# If they match (or diff shows no differences), you're good to go!
```

---

## Step 5: Build Signed AAB

```bash
cd mobile/android
./gradlew bundleRelease
```

The signed AAB will be at:
```
mobile/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Step 6: Verify AAB Signature

Verify the AAB is signed correctly:

```bash
# Using bundletool (if installed)
bundletool validate --bundle=app/build/outputs/bundle/release/app-release.aab

# Or extract and verify certificate
bundletool extract-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output-dir=/tmp/extracted \
  --mode=universal

# Check signature
jarsigner -verify -verbose -certs app-release.aab
```

---

## Troubleshooting

### Error: "Keystore file not found"

- ✅ Verify `credentials/new_keystore.jks` exists
- ✅ Check the path in `build.gradle` is correct relative to `android/app/`
- ✅ Use absolute path if relative path doesn't work

### Error: "Wrong password"

- ✅ Verify keystore password is `kundli@123`
- ✅ Verify alias is `kundli`
- ✅ Try extracting certificate manually to test:
  ```bash
  keytool -list -v -keystore credentials/new_keystore.jks -alias kundli
  ```

### Error: "Signing certificate mismatch" in Play Console

- ⚠️ **CRITICAL:** This means the signing key doesn't match what Google Play expects
- ✅ Verify `upload_certificate.pem` matches keystore certificate
- ✅ If mismatch, you need to use the correct keystore file
- ⚠️ **Cannot fix after first upload** - must use correct key from the start

---

## Security Notes

- ✅ Never commit `keystore.properties` or keystore files to git
- ✅ Store keystore files securely (cannot be recovered if lost)
- ✅ Keep keystore password secure
- ✅ Use environment variables or `keystore.properties` (git-ignored) instead of hardcoding

---

## Quick Reference

```bash
# 1. Place keystore files
cp new_keystore.jks ../credentials/
cp upload_certificate.pem ../credentials/

# 2. Verify certificate matches
keytool -export -alias kundli -keystore ../credentials/new_keystore.jks -file /tmp/cert.pem
diff /tmp/cert.pem ../credentials/upload_certificate.pem

# 3. Configure signing in android/app/build.gradle (see above)

# 4. Build signed AAB
cd mobile/android
./gradlew bundleRelease

# 5. Verify AAB
bundletool validate --bundle=app/build/outputs/bundle/release/app-release.aab
```


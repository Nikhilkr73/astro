# Troubleshooting: "Could not connect to development server" on Physical Device

## Quick Fix

The device can't reach Metro bundler. Run these commands:

```bash
# 1. Forward port 8081 from device to your Mac
adb reverse tcp:8081 tcp:8081

# 2. Start Metro bundler (if not running)
cd /Users/nikhil/workplace/voice_v1/mobile
npm start -- --reset-cache

# 3. On your device, press "RELOAD (R, R)" or shake device → Reload
```

## Alternative: Use Your Mac's IP Address

If port forwarding doesn't work:

1. Find your Mac's IP address:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. In the app, open Dev Menu (shake device or press `adb shell input keyevent 82`)

3. Select "Settings" → "Debug server host & port for device"

4. Enter: `YOUR_MAC_IP:8081` (e.g., `192.168.1.10:8081`)

5. Reload the app

## Share Logs for Debugging

```bash
# Save all errors to a file
adb logcat -d *:E ReactNativeJS:* > device_errors.log

# Or stream filtered logs
adb logcat | grep "ReactNative"
```

## Common Issues

- **Metro not running**: Start with `npm start` in mobile folder
- **Wrong port**: Ensure port 8081 is forwarded correctly
- **Firewall**: Allow incoming connections on port 8081
- **App cache**: Try `npm start -- --reset-cache` and reload


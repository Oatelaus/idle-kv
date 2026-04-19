# Idle KV Auto Clicker (Android)

This repository now contains an Android app that repeatedly taps where you hold your finger.

## What it does

- Uses an Accessibility Service to dispatch rapid tap gestures.
- Runs a full-screen overlay service.
- While your finger is held down, it repeatedly taps at that exact screen position.

## Build locally

Requirements:

- JDK 17
- Android SDK (platform 34 + build tools)
- Gradle 8+

Build debug APK:

```bash
gradle assembleDebug
```

APK output path:

`app/build/outputs/apk/debug/app-debug.apk`

## Device setup

1. Install the debug APK.
2. Open the app.
3. Tap **Open Accessibility Settings** and enable **Idle KV Auto Clicker Service**.
4. Tap **Enable Overlay Permission** and allow display over other apps.
5. Tap **Start Auto Clicker Overlay**.
6. In any screen, hold your finger where you want fast repeated taps.
7. Return to app and tap **Stop Auto Clicker Overlay** to disable.

---
name: deploy
description: Use this skill when building this Expo app locally into Android APK files or iOS IPA files, including checking native toolchains, generating native projects with Expo prebuild, signing, and locating build artifacts. Prefer local Gradle and xcodebuild workflows; use EAS local only when explicitly requested or when project policy requires it.
---

# Deploy Skill

Build release artifacts from this Expo Router app using local native toolchains first.

## Principles

- Prefer local toolchains for local artifacts:
  - Android APK: `expo prebuild` then Gradle.
  - iOS IPA: `expo prebuild` then `xcodebuild archive` and `xcodebuild -exportArchive`.
- Use EAS local builds only when the user asks for EAS or when existing project config already depends on EAS.
- Do not commit generated `android/` or `ios/` directories unless the user explicitly wants native projects checked in.
- Expect `expo prebuild` to mutate native identity/config files such as `app.json` and package scripts. Report those changes before committing or cleaning up.
- Do not invent signing credentials. Ask for or inspect the existing keystore, provisioning profile, certificate, team ID, and export options.
- Run project quality checks before release builds unless the user asks for a fast diagnostic build.

## Preflight

Run these checks before building:

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
```

Inspect app identity:

```sh
cat app.json
```

For release builds, confirm these fields exist:

- `expo.android.package`
- `expo.ios.bundleIdentifier`
- `expo.version`
- platform build numbers when required by distribution

If `expo.android.package` is missing, set or confirm it before non-interactive Android builds. Expo may infer one during prebuild, but agents should report the inferred value.

## Android APK With Gradle

Check local tools:

```sh
node --version
npx expo --version
java --version
echo "$ANDROID_HOME"
```

Generate or refresh the native Android project:

```sh
npx expo prebuild --platform android
```

Build a debug APK for local installation:

```sh
cd android
./gradlew assembleDebug
```

Build a release APK:

```sh
cd android
./gradlew assembleRelease
```

Expected artifacts:

- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

If Gradle fails while downloading Maven artifacts with a read timeout, rerun the same Gradle command once. The retry often succeeds after earlier dependencies are cached.

Release signing normally requires Gradle signing config and keystore credentials. If signing is not configured, report that clearly and build debug APK or unsigned release artifacts only when appropriate.

## Android APK With EAS Local

Use this only when requested or already configured:

```sh
npx eas build --platform android --profile preview --local
```

For APK output, ensure the selected EAS profile uses:

```json
{
  "android": {
    "buildType": "apk"
  }
}
```

## iOS IPA With Xcodebuild

Requirements:

- macOS with Xcode installed.
- Apple signing certificate in Keychain.
- Provisioning profile installed locally.
- `expo.ios.bundleIdentifier` configured.
- An export options plist for the intended distribution method.

Check local tools:

```sh
xcodebuild -version
xcrun simctl list devices available
security find-identity -v -p codesigning
```

Generate or refresh the native iOS project:

```sh
npx expo prebuild --platform ios
```

Install CocoaPods dependencies if needed:

```sh
cd ios
pod install
```

Archive:

```sh
cd ios
xcodebuild archive \
  -workspace NewsTabs.xcworkspace \
  -scheme NewsTabs \
  -configuration Release \
  -archivePath build/NewsTabs.xcarchive \
  -destination "generic/platform=iOS"
```

Export IPA:

```sh
cd ios
xcodebuild -exportArchive \
  -archivePath build/NewsTabs.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```

Expected artifact:

- `ios/build/export/*.ipa`

Project, workspace, and scheme names may differ after prebuild. Inspect `ios/` and run this when unsure:

```sh
xcodebuild -list -workspace ios/*.xcworkspace
```

## iOS IPA With EAS Local

Use this only when requested or already configured:

```sh
npx eas build --platform ios --profile production --local
```

EAS local still requires Apple credentials and project identity. If credentials are missing, stop and explain exactly which signing item is missing.

## Reporting

When finished, report:

- Build path.
- Artifact path.
- Signing mode used.
- Any generated native directories.
- Checks that passed.
- Anything skipped and why.

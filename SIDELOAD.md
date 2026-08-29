# Sideloading Claude Code Mobile to iPhone via SideStore

This guide walks you through taking the Capacitor iOS project we just
built and sideloading it onto your iPhone with SideStore — **no Mac
required**. We build the `.ipa` on a free GitHub Actions macOS runner
and AirDrop / cloud-share the artifact to your iPhone.

---

## 1. Two paths

### Path A — Quick (no Mac, no Apple ID setup): build on GitHub Actions

1. Push this project to a GitHub repo (private is fine, free tier
   includes 2,000 macOS minutes/month)
2. Open **Actions → Build iOS .ipa → Run workflow**
3. When it completes, download the **ClaudeCode-unsigned** artifact
4. Sideload via **AltStore** (Windows desktop) or **SideStore** (iPhone)

### Path B — Full signing (still no Mac): GitHub Actions with Apple ID

Same as Path A but enable signing by:
1. Adding `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_APP_SPECIFIC_PASSWORD`
   as repo secrets
2. Flipping the `if: false` → `if: true` on the "Build signed .ipa"
   step

---

## 2. Path A — Quick walkthrough

### 2.1 Push to GitHub

```bash
cd a:/claude-code-mobile-ui
git init
git add .
git commit -m "Claude Code Mobile — iOS-ready"
git branch -M main
git remote add origin https://github.com/YOURNAME/claude-code-mobile.git
git push -u origin main
```

(You'll need a GitHub account. Private repos get 2,000 free
macOS-runner minutes per month, which is plenty for ~150 builds.)

### 2.2 Run the workflow

1. Open your repo on github.com
2. Click **Actions** → **Build iOS .ipa** in the left sidebar
3. Click **Run workflow** → **Run workflow**
4. Wait ~3-5 minutes for the build to complete

### 2.3 Download the artifact

1. Click the green checkmark → **ClaudeCode-unsigned** at the bottom
2. Download **ClaudeCode-unsigned.ipa** (an unsigned iOS app package
   ready for AltStore / SideStore to re-sign with your Apple ID)

---

## 3. Sideloading on Windows + iPhone

You have two tools for sideloading unsigned `.app` folders onto an
iPhone from Windows:

### Option 1: AltStore (Windows desktop app)

1. **Install AltServer** on your Windows laptop
   - Download from [altstore.io](https://altstore.io)
   - Run AltServer.exe, install the iTunes Apple Application
     Support driver if asked
2. **Install AltStore on your iPhone**:
   - Plug your iPhone into the Windows laptop via USB
   - In AltServer, click **Install AltStore** → your iPhone
   - Enter your Apple ID when prompted
3. **Sideload Claude Code**:
   - Open AltStore on your iPhone → **My Apps** → **+**
   - Browse to **ClaudeCode-unsigned.ipa** → tap to install
   - First-launch: Settings → General → VPN & Device Management →
     Trust your Apple ID

### Option 2: SideStore (iPhone-only, no laptop needed after install)

1. **Install SideStore** on your iPhone from [sidestore.io](https://sidestore.io)
   - This needs AltStore once for the initial install, or use the
     online installer at [sidestore.io/#getstarted](https://sidestore.io)
2. **Pair SideStore with your Apple ID** in the app
3. **Sideload Claude Code**:
   - **Easiest**: upload **ClaudeCode-unsigned.ipa** to iCloud Drive
     / Google Drive / Dropbox → open the file on your iPhone →
     choose "Open in SideStore"
   - SideStore re-signs with your Apple ID and installs the app

---

## 4. Bundle ID — make it yours

The default bundle ID is `com.anthropic.claudecode.mobile`. SideStore
and AltStore let you use any bundle ID; just rename the project
folder if you want to:

**Edit `capacitor.config.json`:**
```json
"appId": "com.YOURNAME.claudecode.mobile"
```

Then re-run the GitHub Actions workflow.

---

## 5. First-launch checklist

When you first open the app on your iPhone:

- The splash screen is `#141413` with a centered Claude mark
- The status bar is dark with a cream foreground
- The **Pair** tab shows three seed sessions:
  - `aurora-api` on `selene.local` (`Opus 4.5`) — connected
  - `ledger-web` on `selene.local` (`Sonnet 4.5`) — connected
  - `studio-app` on `workhorse.local` (`Opus 4.5`) — **Unavailable**
- Tap the pen icon next to any field to edit (name, host, or cwd)
- Tap a greyed card to reconnect — watch the toast show "Reconnecting…"
- All edits persist via Capacitor Preferences (NSUserDefaults on iOS)

---

## 6. Persisted data

Snapshots are stored via Capacitor Preferences, which maps to
**NSUserDefaults** under the hood. To wipe:

```bash
# On iPhone: Settings → General → iPhone Storage → Claude Code → Delete
# Then reinstall via SideStore
```

---

## 7. Where things live

| Path | Purpose |
|---|---|
| `dist/` | Vite web build (input to Capacitor) |
| `ios/App/App/public/` | The web assets bundled into the `.ipa` |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/` | Claude Code circular icon |
| `ios/App/App/Assets.xcassets/Splash.imageset/` | Splash screen PNGs |
| `capacitor.config.json` | Bundle ID, app name, webDir |
| `src/utils/storage.ts` | Snapshot persistence (Preferences / localStorage) |
| `src/utils/native.ts` | Native-platform detection |
| `src/utils/capacitor-init.ts` | StatusBar + SplashScreen setup |
| `.github/workflows/build-ios.yml` | GitHub Actions macOS build |

---

## 8. Quick rebuild loop

When iterating on the JS bundle:

```bash
git add . && git commit -m "Update"
git push
```

Then re-run the **Build iOS .ipa** workflow (or it auto-runs on push
to `main`) and download the new artifact.
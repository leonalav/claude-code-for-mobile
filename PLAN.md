# Claude Code Mobile — Build Plan

> **Status**: Pending approval. Last updated: 2026-08-30.
>
> This document is the living spec for the Claude Code Mobile iOS app
> (sideloaded via SideStore).

---

## 1. Overview

**What**: A native iOS companion app for Claude Code desktop. The phone acts as a
remote control for a paired desktop session — chat, file browsing, skills,
multimodal input, and live app previews.

**How it works**: The iOS app connects over LAN to a Claude Code desktop session
running on a host machine. Tools execute on the host; the phone never holds repo
secrets or does real LLM inference.

**Target**: SideStore sideloaded iOS app (no App Store). iPhone only for now.

---

## 2. App Identity

| Element | Value |
|---|---|
| App name | Claude Code |
| Bundle ID | `com.anthropic.claudecode.mobile` |
| Icon | Circular badge with Claude logo (see Figma link) |
| Launch screen | Solid `#141413` with centered Claude mark |

**Build target**: iOS 17+, Capacitor-wrapped React frontend (or pure React web
app wrapped in `WKWebView`).

---

## 3. Feature Map

### 3.1 Feature Register

| # | Feature | Status | Location in Code |
|---|---|---|---|
| F1 | **SSH Session Pairing (Pair tab)** | Not built | `ConnectView.tsx`, `data.ts` |
| F2 | **Edit session name + host + cwd inline** | Not built | `ConnectView.tsx` |
| F3 | **Unavailable state for sessions** | Not built | `ConnectView.tsx` |
| F4 | **Last-session cwd tracking** | Not built | App state |
| F5 | **App icon (Claude Code circular)** | Not built | Capacitor assets |
| F6 | **Real-time App Preview** | Built | `FullscreenPreviewOverlay.tsx` |
| F7 | **Landscape preview — upright iframe** | Built (portal) | `App.tsx`, `FullscreenPreviewOverlay.tsx` |
| F8 | **App preview keyboard forwarding** | Built | `FullscreenPreviewOverlay.tsx` |
| F9 | **Chat view** | Built | `ChatView.tsx` |
| F10 | **Composer with slash palette** | Built | `Composer.tsx` |
| F11 | **@ File mention picker** | Built | `FilePicker.tsx` |
| F12 | **File mention pills in composer** | Built | `FileMentionPill.tsx` |
| F13 | **Real language icons (35 types)** | Built | `FileIcons.tsx` |
| F14 | **Voice input** | Built | `VoiceOverlay.tsx` |
| F15 | **Attachments (photo, camera, file)** | Built | `AttachSheet.tsx` |
| F16 | **Effort slider** | Built | `EffortSlider.tsx` |
| F17 | **Settings** | Built | `SettingsView.tsx` |
| F18 | **Skills tab** | Built | `SkillsView.tsx` |
| F19 | **Git tab** | Built | `GitView.tsx` |
| F20 | **Artifacts tab** | Built | `ArtifactsView.tsx` |
| F21 | **Checkpoints / rewind** | Built | `CheckpointView.tsx` |
| F22 | **Daltonize / accessibility** | Built | `index.css` |
| F23 | **iPad layout** | Built | `Ipad.tsx` |
| F24 | **Phone layout** | Built | `Phone.tsx` |

---

## 4. SSH Session Data Model

### 4.1 Session Type

```typescript
export type Session = {
  id: string;
  // Display name shown as card title — editable inline
  name: string;
  // SSH host or IP — editable inline
  host: string;
  // Current working directory on the host — editable inline
  cwd: string;
  // Model name shown in card — set by AI agent
  model: string;
  // Is this the active session?
  active: boolean;
  // Last known RTT — set by agent heartbeat
  latency: string;
  // Is the host reachable?
  connected: boolean;
  // Optional: path of the last file the AI agent edited in this session
  lastEditPath?: string;
  // Optional: timestamp of last edit
  lastEditTime?: string;
};
```

### 4.2 Session List (seed data)

| ID | name | host | cwd | model | Notes |
|---|---|---|---|---|---|
| `aurora` | aurora-api | `selene.local` | `~/dev/aurora` | Claude Opus 4.5 | Primary session |
| `ledger` | ledger-web | `selene.local` | `~/dev/ledger` | Claude Sonnet 4.5 | Secondary |
| `studio` | studio-app | `workhorse.local` | `~/code/studio` | Claude Opus 4.5 | Tertiary |

> **Unavailability**: When no SSH sessions are connected, all cards show
> "Unavailable · tap to configure" with a muted greyed-out state.

---

## 5. ConnectView — Pair Tab Redesign

### 5.1 Layout

```
┌─────────────────────────────────────┐
│  CLAUDE CODE                        │
│  Pair                               │
│                                     │
│  [ Hero Card — active session ]     │
│  ┌───────────────────────────────┐ │
│  │ ● Live    18ms                 │ │
│  │ aurora-api                     │ │  ← session name (AI set, shows pen)
│  │ selene.local                   │ │  ← SSH host/IP (shows pen)
│  │ ~/dev/aurora                   │ │  ← cwd (shows pen, edits go here)
│  │ Opus 4.5                       │ │
│  │ [Disconnect]                   │ │
│  │ [Photo] Signed in as Maya Chen │ │
│  └───────────────────────────────┘ │
│                                     │
│  Nearby sessions                    │
│  ┌───────────────────────────────┐ │
│  │ [💻] ledger-web  SONNET 4.5  ✓│ │  ← host: selene.local, cwd: ~/dev/ledger
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ [💻] studio-app  OPUS 4.5    ○│ │  ← host: workhorse.local
│  └───────────────────────────────┘ │
│                                     │
│  [Info cards: LAN security note]   │
└─────────────────────────────────────┘
```

### 5.2 Inline Edit Behavior

- **Pen icon** (✏) appears to the right of: session name, SSH host, cwd
- Tapping the pen → inline text input replaces the label
- Confirm by tapping elsewhere or pressing Done
- Cancel by pressing Escape
- **No backend for SSH settings**: edits persist in localStorage only (no real
  SSH config written)

### 5.3 Unavailable State

When `connected === false` for all sessions:

- Hero card: "No sessions connected"
- Each nearby session card: greyed out, no checkmark, latency shows "—"
- Tap a greyed card → opens the edit panel for that session

### 5.4 "Last Edit Path" Display

- In the hero card, `cwd` is shown as the session's current working directory
- If `lastEditPath` is set, show a second line: `~/dev/ledger/src/auth.ts` with
  a small file icon

---

## 6. File Mention System

### 6.1 How It Works

1. User types `@` anywhere in the Composer draft
2. `readAtQuery(draft)` extracts the partial text after `@`
3. `FilePicker` pops up above the composer input, filtered by partial match
4. User selects a file → `insertMention(file)` replaces `@partial` with `@path`
5. `FileMentionPill` components appear above the textarea showing attached files
6. On send, the raw text (e.g. `@src/lib/jwt.ts`) is included in the message

### 6.2 File Icon Set (35 languages)

| Badge | Language | Color |
|---|---|---|
| TS | TypeScript | `#3178C6` |
| JSX | JSX | `#F7DF1E` |
| PY | Python | `#3776AB` |
| GO | Go | `#00ADD8` |
| RS | Rust | `#000` / `#F7A41D` |
| SW | Swift | `#F05138` |
| KT | Kotlin | `#7F52FF` |
| JAVA | Java | `#E76F00` |
| C | C / H | `#283593` |
| C++ | C++ / HPP | `#00599C` |
| HTML | HTML | `#E34F26` |
| CSS | CSS | `#1572B6` |
| JSON | JSON | `#292929` |
| MD | Markdown | `#083FA1` |
| YML | YAML | `#CB171E` |
| TOML | TOML | `#9C4221` |
| SH | Shell | `#4EAA25` |
| SQL | SQL | `#336790` |
| DOCKER | Dockerfile | `#0DB7ED` |
| SVG | SVG | `#FFB13B` |
| 🔒 | .env / .gitignore | `#0E1116` |
| 📁 | folder | `#D8A45E` |
| 📄 | generic | `#94A3B8` |

---

## 7. Landscape Preview Architecture

### 7.1 The Problem

Rotating the iPhone frame 90° rotates **all children** too. The iframe content
was appearing sideways.

### 7.2 The Solution

The `FullscreenPreviewOverlay` is rendered into a **React Portal** rooted at
`#preview-portal` in `App.tsx`. This root lives **outside** the phone-frame
container (`.phone-scale`), so it is completely unaffected by the frame's
`rotate(90deg)` CSS transform. The overlay uses `position: fixed; inset: 0` so
it fills the true viewport in actual landscape orientation.

```
┌─ App root ─────────────────────────────────────────────┐
│  <div id="preview-portal" />   ← portal root here      │
│                                                          │
│  <Phone>          ← .phone-scale rotates 90deg         │
│    <ChatView />                                          │
│    <Composer />                                          │
│  </Phone>                                                │
└──────────────────────────────────────────────────────────┘
         ↓ Portal renders into #preview-portal
┌─ #preview-portal ──────────────────────────────────────┐
│  <FullscreenPreviewOverlay position:fixed; inset:0 />  │
│  ← fills true viewport in real landscape, no rotation  │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Planned Real iOS Build Steps (post-approval)

1. **Capacitor setup**: `npm install @capacitor/core @capacitor/cli` +
   `npx cap init ClaudeCode com.anthropic.claudecode.mobile`
2. **Add iOS platform**: `npx cap add ios`
3. **App icon**: Place `AppIcon.appiconset` in `ios/Runner/Assets.xcassets/`
4. **Splash screen**: Solid `#141413` with Claude mark
5. **SSH persistence**: Store session configs in `localStorage`
6. **Bundle**: Build via Xcode → export as `.ipa` → sideload via SideStore

---

## 9. Open Questions

## 9. Decisions Log

| # | Question | Decision |
|---|---|---|
| Q1 | Persist session edits to localStorage? | **Yes — save snapshots to the device VM (localStorage / Capacitor Preferences).** |
| Q2 | Behavior when host goes offline? | **Show "Reconnecting…" toast with auto-retry 3×, then error.** |
| Q3 | Who tracks `lastEditPath`? | **AI agent — writes the path to session metadata on every Edit/Write tool call.** |
| Q4 | iPad layout? | **Defer. iPhone-only for v1. Remove iPad code paths.** |
| Q5 | Display `cwd` vs `lastEditPath`? | **Both. `cwd` as primary line, `lastEditPath` as secondary line when set.** |
| Q6 | Capacitor project state? | **Bootstrap from scratch, automatically.** |

## 10. Implementation Roadmap

### Phase 1 — Capacitor Bootstrap (now)
- [x] Install Capacitor core + CLI + iOS platform + Preferences plugin
- [x] Configure `capacitor.config.json`
- [x] Build Vite → `dist/`
- [x] Run `npx cap add ios`
- [x] Add Claude Code circular app icon (1024×1024 source, all iOS sizes)
- [x] Configure splash screen
- [x] Wire `Preferences` plugin for snapshot persistence
- [x] Remove iPad code paths (deferred — `isNative` branch skips demo)

### Phase 2 — Pair Tab (F1–F4)
- [x] Rewrite `ConnectView.tsx`:
  - [x] Pen icon next to session name, host, cwd (inline edit)
  - [x] Greyed "Unavailable" state when `connected === false`
  - [x] `lastEditPath` secondary line in hero card
- [x] Wire session snapshots to `localStorage` / Capacitor Preferences
- [x] Add "Reconnecting…" toast with 3× retry

### Phase 3 — Final Polish (no Mac required — uses GitHub Actions)
- [x] Set up GitHub Actions workflow at `.github/workflows/build-ios.yml`
- [x] Document no-Mac sideload path in `SIDELOAD.md` (GitHub Actions + AltStore/SideStore on Windows)
- [ ] Verify all features work on iPhone (after first sideload)
- [ ] Build & download artifact from GitHub Actions

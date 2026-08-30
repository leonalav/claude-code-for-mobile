import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Gauge, RotateCcw } from "lucide-react";
import { isNative } from "./utils/native";
import { storage, StorageKeys } from "./utils/storage";
import { useCapacitorInit } from "./utils/capacitor-init";
import { AttachSheet } from "./components/AttachSheet";
import { ChatView } from "./components/ChatView";
import { Composer } from "./components/Composer";
import { ConnectView } from "./components/ConnectView";
import { ContextBar } from "./components/ContextBar";
import { FullscreenPreviewOverlay } from "./components/FullscreenPreviewOverlay";
import { Phone } from "./components/Phone";
import { PluginsView } from "./components/PluginsView";
import { SkillsView } from "./components/SkillsView";
import { TabBar } from "./components/TabBar";
import { VoiceOverlay } from "./components/VoiceOverlay";
import { GitView } from "./components/GitView";
import { Ipad } from "./components/Ipad";
import { SettingsView } from "./components/SettingsView";
import { Sidebar } from "./components/Sidebar";
import { TabletRail } from "./components/TabletRail";
import {
  checkpoints,
  initialArtifacts,
  initialCommits,
  initialGitFiles,
} from "./gitdata";
import {
  defaultSettings,
  initialMessages,
  initialPlugins,
  sessions as seedSessions,
  skills,
  slashItems,
} from "./data";
import type { EffortLevel } from "./effort";
import { effortLevels, effortMeta } from "./effort";
import type {
  Artifact,
  Attachment,
  Checkpoint,
  CommitNode,
  GitFile,
  Message,
  Plugin,
  Session,
  Settings,
  Skill,
  SlashItem,
  TabId,
} from "./types";
import type { DeviceKind } from "./layout";
import { LayoutContext } from "./layout";
import { cn } from "./utils/cn";

function clock() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Rewrite a localhost dev-server URL to use the user's configured public
 * base URL (e.g. `http://localhost:3000` -> `https://my-vm.example.com:3000`).
 * Returns the original URL unchanged if no public URL is set or the URL
 * doesn't parse.
 */
function publicUrlFor(devUrl: string): string {
  const base = window.localStorage.getItem("publicPreviewUrl")?.trim();
  if (!base) return devUrl;
  try {
    const dev = new URL(devUrl);
    const out = new URL(base);
    out.pathname = dev.pathname;
    out.search = dev.search;
    out.hash = dev.hash;
    out.port = dev.port;
    return out.toString();
  } catch {
    return devUrl;
  }
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Detects when the on-screen keyboard is open and manages two side-effects:
 *
 *  1. **TabBar hide** — returns `keyboardOpen` so the native shell can push
 *     the TabBar off-screen (translateY 100%) when the keyboard is up. iOS
 *     draws the keyboard as a native overlay that covers whatever is at the
 *     bottom of the WKWebView; pushing the TabBar down makes it sit behind
 *     that overlay rather than floating above it.
 *
 *  2. **Stuck-body height** — Capacitor's KeyboardResizeMode:"body" sets an
 *     inline `body.style.height` when the keyboard opens. When the keyboard
 *     closes iOS sometimes fires the event *before* Capacitor clears that
 *     style, leaving the app stuck at the shrunken height. We watch the
 *     `visualViewport` (which always reflects the true visible area) and
 *     clear any stale inline height the moment the keyboard is gone.
 */
function useKeyboardState() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isNative) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const reconcile = () => {
      // visualViewport / window.innerHeight > 0.85 means no keyboard covering
      // the bottom of the screen (keyboard occupies roughly 40–60% of screen).
      const visibleFraction = vv.height / window.innerHeight;
      const keyboardUp = visibleFraction < 0.85;
      setKeyboardOpen(keyboardUp);

      // Clear any stale inline body height once the keyboard is gone.
      if (!keyboardUp && document.body.style.height) {
        document.body.style.height = "";
      }
    };

    vv.addEventListener("resize", reconcile);
    vv.addEventListener("scroll", reconcile);
    reconcile();
    return () => {
      vv.removeEventListener("resize", reconcile);
      vv.removeEventListener("scroll", reconcile);
    };
  }, []);

  return keyboardOpen;
}

/** Rough client-side token estimate (~4 chars/token) for the context bar. */
function estimateTokens(messages: Message[]) {
  let chars = 0;
  for (const m of messages) {
    chars += m.text.length;
    for (const t of m.tools ?? []) {
      chars += t.detail.length + (t.output?.length ?? 0) + 40;
    }
    chars += (m.attachments?.length ?? 0) * 600;
  }
  return Math.round(chars / 4) + 1800; // + fixed system-prompt overhead
}

import type {
  Orchestration,
  ThinkingTrace,
  WorkflowAgent,
  WorkflowPhase,
} from "./types";

/**
 * Build a full ultracode orchestration reply.
 * Mirrors the real pipeline: thinking traces → JS script → Understand → Change → Verify
 */
function ultracodeReply(text: string): Message[] {
  const keyword = text.slice(0, 60).replace(/\n/g, " ");

  const thinking: ThinkingTrace[] = [
    {
      id: uid("th"),
      label: "Evaluating task complexity",
      content:
        `The user asked: "${keyword}"\n\n` +
        "This is a substantive task that benefits from parallelism.\n" +
        "Decision: spawn a dynamic workflow.\n" +
        "Estimated phases: Understand → Change → Verify.\n" +
        "Selecting xhigh reasoning for all subagent calls.",
      durationMs: 1840,
    },
    {
      id: uid("th"),
      label: "Planning orchestration script",
      content:
        "Writing workflow script → ~/.claude/projects/workflow-" +
        uid("w") +
        ".js\n\n" +
        "Phase 1 (Understand): 3 agents map architecture in parallel\n" +
        "  - arch-mapper: trace module boundaries and exports\n" +
        "  - dep-scanner: identify upstream / downstream deps\n" +
        "  - test-surveyor: catalog existing coverage\n\n" +
        "Phase 2 (Change): 4 agents execute edits in isolated worktrees\n" +
        "  - impl-core: primary implementation in src/\n" +
        "  - impl-types: type definitions and interfaces\n" +
        "  - test-writer: new tests for changed paths\n" +
        "  - docs-updater: update inline docs and README\n\n" +
        "Phase 3 (Verify): 2 adversarial agents cross-check\n" +
        "  - verifier-alpha: run full test suite, regression check\n" +
        "  - verifier-beta: attempt to refute changes, edge cases\n\n" +
        "Convergence gate: both verifiers must agree before returning.",
      durationMs: 2460,
    },
    {
      id: uid("th"),
      label: "Resolving permissions and worktrees",
      content:
        "All subagents inherit tool allowlist from the parent session.\n" +
        "File-mutating agents run in isolated git worktrees.\n" +
        "Agents run in acceptEdits mode — auto-approve file writes.\n" +
        "Max concurrency: 16 agents. This plan uses 9.\n" +
        "Agent cap: 1,000 per run (well within budget).",
      durationMs: 680,
    },
  ];

  const mkAgent = (
    name: string,
    role: string,
    status: WorkflowAgent["status"],
    detail: string,
    output?: string,
    tokensUsed?: number,
  ): WorkflowAgent => ({ id: uid("ag"), name, role, status, detail, output, tokensUsed });

  const phases: WorkflowPhase[] = [
    {
      id: uid("ph"),
      name: "Understand",
      status: "done",
      agents: [
        mkAgent(
          "arch-mapper",
          "architecture",
          "done",
          "Traced module boundaries in src/ — 42 files, 6 entry points.",
          "modules: auth, api, db, ui, config, shared\nexports: 148 public, 37 internal",
          12400,
        ),
        mkAgent(
          "dep-scanner",
          "dependencies",
          "done",
          "Identified 18 upstream and 7 downstream dependencies.",
          "upstream: express, jsonwebtoken, pg, zod, ...\ndownstream: auth.test, api.test, e2e.login",
          8200,
        ),
        mkAgent(
          "test-surveyor",
          "test coverage",
          "done",
          "Cataloged 64 existing tests across 8 suites.",
          "coverage: 72% lines, 58% branches\ngaps: jwt.ts (31%), middleware/rate-limit (0%)",
          6800,
        ),
      ],
    },
    {
      id: uid("ph"),
      name: "Change",
      status: "done",
      agents: [
        mkAgent(
          "impl-core",
          "core impl",
          "done",
          "Applied primary changes to auth middleware and JWT helper.",
          "+42 −11 across 3 files\nsrc/lib/jwt.ts: clockTolerance 60s\nsrc/middleware/auth.ts: refresh alignment\nsrc/middleware/rate-limit.ts: window fix",
          28600,
        ),
        mkAgent(
          "impl-types",
          "types",
          "done",
          "Updated TypeScript interfaces for new clock-skew config.",
          "+8 −2 in src/types/auth.ts",
          4200,
        ),
        mkAgent(
          "test-writer",
          "tests",
          "done",
          "Generated 14 new tests covering changed paths.",
          "+186 −0 across 3 test files\njwt.test.ts: 6 cases (skew, expiry, refresh)\nauth.test.ts: 5 cases\nrate-limit.test.ts: 3 cases",
          18400,
        ),
        mkAgent(
          "docs-updater",
          "docs",
          "done",
          "Updated README auth section and inline JSDoc.",
          "+22 −8 in README.md, +6 −0 in src/lib/jwt.ts",
          3100,
        ),
      ],
    },
    {
      id: uid("ph"),
      name: "Verify",
      status: "done",
      agents: [
        mkAgent(
          "verifier-alpha",
          "test suite",
          "done",
          "Ran full test suite — all 78 tests pass. No regressions.",
          "78 passed, 0 failed, 0 skipped\ncoverage: 84% lines (+12%), 71% branches (+13%)",
          14200,
        ),
        mkAgent(
          "verifier-beta",
          "adversarial",
          "done",
          "Attempted to refute changes with edge cases. All challenges passed.",
          "edge cases checked:\n✓ token minted 59s ago (within tolerance)\n✓ token minted 61s ago (rejected correctly)\n✓ refresh token with aligned exp\n✓ concurrent requests under rate limit\n✗ no regressions found",
          16800,
        ),
      ],
    },
  ];

  const orchestration: Orchestration = {
    scriptName: "workflow-" + uid("w").slice(2) + ".js",
    phases,
    totalAgents: 9,
    concurrentMax: 9,
    status: "done",
  };

  const totalTok = phases
    .flatMap((p) => p.agents)
    .reduce((s, a) => s + (a.tokensUsed ?? 0), 0);

  // Return an array: first the orchestration message, then the summary
  const orchMessage: Message = {
    id: uid("a"),
    role: "assistant",
    time: clock(),
    text: "",
    thinking,
    orchestration,
  };

  const summary: Message = {
    id: uid("a"),
    role: "assistant",
    time: clock(),
    text:
      `Workflow complete. 9 agents across 3 phases converged on a verified result.\n\n` +
      `The auth middleware, JWT helper, and rate-limit window are patched. ` +
      `14 new tests bring coverage to 84% lines. Both adversarial verifiers agree — no regressions.\n\n` +
      `Total: ${(totalTok / 1000).toFixed(1)}k tokens across the workflow. ` +
      `Say /commit to ship it.`,
    tools: [
      {
        id: uid("t"),
        name: "Edit",
        detail: "src/lib/jwt.ts",
        status: "done",
        diff: { added: 42, removed: 11 },
        revertible: true,
      },
      {
        id: uid("t"),
        name: "Edit",
        detail: "src/middleware/auth.ts",
        status: "done",
        diff: { added: 16, removed: 4 },
        revertible: true,
      },
      {
        id: uid("t"),
        name: "Edit",
        detail: "src/middleware/rate-limit.ts",
        status: "done",
        diff: { added: 8, removed: 2 },
        revertible: true,
      },
      {
        id: uid("t"),
        name: "Edit",
        detail: "src/types/auth.ts",
        status: "done",
        diff: { added: 8, removed: 2 },
        revertible: true,
      },
      {
        id: uid("t"),
        name: "Bash",
        detail: "npm test",
        status: "done",
        output: "78 passed, 0 failed",
      },
    ],
  };

  return [orchMessage, summary];
}

function replyFor(
  text: string,
  extras?: { attachments?: Attachment[]; skill?: string; plugin?: string },
): Message {
  const lower = text.toLowerCase();
  const skill = extras?.skill;
  const plugin = extras?.plugin;
  const hasImage = extras?.attachments?.some((a) => a.kind === "image");
  const hasVoice = extras?.attachments?.some((a) => a.kind === "voice");

  if (plugin) {
    return {
      id: uid("a"),
      role: "assistant",
      plugin,
      time: clock(),
      text: `Loaded ${plugin}. Slider values are live on selene.local — I'll use them for the next tool calls in aurora-api.`,
      tools: [
        {
          id: uid("t"),
          name: "Plugin",
          detail: `${plugin} · synced`,
          status: "done",
          output: "hooks registered · MCP ready",
        },
      ],
    };
  }

  if (skill === "review" || lower.startsWith("/review")) {
    return {
      id: uid("a"),
      role: "assistant",
      skill: "review",
      time: clock(),
      text: "Review complete. One medium finding: `clockTolerance` is now 60s, but refresh tokens still use a hard exp. I'd align them before shipping.",
      thinking: [
        {
          id: uid("th"),
          label: "Initializing review agents",
          content:
            "Spawning 3 parallel review agents:\n" +
            "  - bug-hunter: scans for logic errors and edge cases\n" +
            "  - auth-reviewer: domain-specific auth/JWT analysis\n" +
            "  - test-gap: identifies missing test coverage\n\n" +
            "Confidence threshold: 72% (from Code Review plugin settings).",
          durationMs: 1420,
        },
        {
          id: uid("th"),
          label: "Synthesizing agent findings",
          content:
            "bug-hunter: no critical bugs found, confidence 81%\n" +
            "auth-reviewer: medium finding — refresh tokens still use\n" +
            "  a hard `exp` without the new clockTolerance. This means\n" +
            "  refreshes issued during the skew window could fail.\n" +
            "test-gap: suggest adding a clock-skew fixture to the\n" +
            "  existing auth test suite.\n\n" +
            "Merging findings above confidence threshold.",
          durationMs: 2080,
        },
      ],
      tools: [
        { id: uid("t"), name: "Agent", detail: "bug-hunter", status: "done", output: "confidence 81%" },
        { id: uid("t"), name: "Agent", detail: "auth-reviewer", status: "done", output: "medium · refresh exp" },
        { id: uid("t"), name: "Agent", detail: "test-gap", status: "done", output: "add skew fixture" },
      ],
    };
  }

  if (skill === "commit" || lower.startsWith("/commit")) {
    return {
      id: uid("a"),
      role: "assistant",
      skill: "commit",
      time: clock(),
      text: "Committed on feat/auth-skew.",
      tools: [
        {
          id: uid("t"),
          name: "Bash",
          detail: "git commit",
          status: "done",
          output: "fix(auth): allow 60s JWT clock skew",
        },
      ],
    };
  }

  if (skill === "test" || lower.startsWith("/test")) {
    return {
      id: uid("a"),
      role: "assistant",
      skill: "test",
      time: clock(),
      text: "Added a skew fixture and re-ran the auth suite. 14 passed.",
      tools: [
        {
          id: uid("t"),
          name: "Edit",
          detail: "src/lib/jwt.test.ts",
          status: "done",
          diff: { added: 22, removed: 0 },
          revertible: true,
        },
        { id: uid("t"), name: "Bash", detail: "npm test -- auth", status: "done", output: "14 passed" },
      ],
    };
  }

  if (lower.startsWith("/cost")) {
    return {
      id: uid("a"),
      role: "assistant",
      time: clock(),
      text: "This session · 186k input · 24k output · est. $2.41 · Opus 4.5",
    };
  }

  if (lower.startsWith("/compact")) {
    return {
      id: uid("a"),
      role: "assistant",
      time: clock(),
      text: "Compacted. Kept the JWT skew decision, login layout fix, and plugin slider state.",
    };
  }

  if (hasImage) {
    return {
      id: uid("a"),
      role: "assistant",
      time: clock(),
      text: "I can see the overlap — both CTAs are absolutely pinned to the same inset. I'll stack them in a column under 400px and keep the ghost style.",
      tools: [
        { id: uid("t"), name: "Read", detail: "src/screens/Login.tsx", status: "done" },
        {
          id: uid("t"),
          name: "Edit",
          detail: "src/screens/Login.tsx",
          status: "done",
          output: "flex-col gap-3",
          diff: { added: 14, removed: 5 },
          revertible: true,
        },
      ],
    };
  }

  if (hasVoice) {
    return {
      id: uid("a"),
      role: "assistant",
      time: clock(),
      text: "Understood — stacking on iPhone SE, ghost button preserved. Patch is in Login.tsx; want me to /commit it?",
      tools: [
        {
          id: uid("t"),
          name: "Edit",
          detail: "src/screens/Login.tsx",
          status: "done",
          diff: { added: 9, removed: 3 },
          revertible: true,
        },
      ],
    };
  }

  return {
    id: uid("a"),
    role: "assistant",
    time: clock(),
    skill,
    text: "On it. I'll stay on the aurora-api session and keep diffs tight — say /review when you want a second pass.",
    thinking: [
      {
        id: uid("th"),
        label: "Analyzing the request",
        content:
          `The user asked: "${text.slice(0, 80)}"\n\n` +
          "This looks like a scoped change — no need for a full workflow.\n" +
          "I'll read the relevant files, make targeted edits, and verify.",
        durationMs: 920,
      },
      {
        id: uid("th"),
        label: "Planning tool calls",
        content:
          "1. Read src/ to index the project\n" +
          "2. Identify the files that need changes\n" +
          "3. Apply edits and run the test suite",
        durationMs: 440,
      },
    ],
    tools: [
      { id: uid("t"), name: "Read", detail: "src/", status: "done", output: "indexed 42 files" },
    ],
  };
}

function ChatHeader({
  session,
  connected,
  effort,
  onEffortTap,
  modelLabel,
}: {
  session: Session;
  connected: boolean;
  effort: EffortLevel;
  onEffortTap: () => void;
  modelLabel: string;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-ink/6 px-4 py-2.5">
      <img
        src="/images/claude-mark.png"
        alt=""
        className="h-9 w-9 rounded-full object-cover ring-1 ring-ink/8"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-tight text-ink">Claude Code</p>
        <p className="flex items-center gap-1.5 text-[11px] text-stone">
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? "dot-pulse bg-moss" : "bg-stone"}`}
          />
          <span className="truncate">
            {connected ? `${session.host} · ${modelLabel}` : "Not paired"}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onEffortTap}
        className="press flex items-center gap-1 rounded-full bg-mist px-2 py-1 font-mono text-[10px] text-ink-soft"
      >
        <Gauge size={10} className="text-clay" />
        {effortMeta(effort).arg}
      </button>
    </header>
  );
}

export default function App() {
  const [tab, setTabRaw] = useState<TabId>("chat");

  // Initialize Capacitor plugins (StatusBar, SplashScreen) on native.
  useCapacitorInit();
  // Tracks whether the on-screen keyboard is up. Used to push the TabBar
  // behind the keyboard and as a safety net for body-height stuck states.
  const keyboardOpen = useKeyboardState();

  // Any tab change exits preview-landscape and closes the fullscreen
  // preview overlay so the frame returns to portrait.
  const setTab = (next: TabId) => {
    setTabRaw(next);
    setPreviewLandscape(false);
    setOpenPreviewId(null);
  };
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [thinking, setThinking] = useState(false);
  const [previewLandscape, setPreviewLandscape] = useState(false);
  const [openPreviewId, setOpenPreviewId] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const [sessionList, setSessionList] = useState<Session[]>(seedSessions);
  const [connected, setConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState<{
    id: string;
    attempt: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate from storage on mount (Capacitor Preferences / localStorage).
  useEffect(() => {
    storage.get<Session[]>(StorageKeys.SESSIONS, seedSessions).then((saved) => {
      if (saved && saved.length > 0) setSessionList(saved);
    });
    storage.get<boolean>(StorageKeys.CONNECTED, true).then(setConnected);
  }, []);

  // Auto-dismiss the toast after 3.5s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const persistSessions = (next: Session[]) => {
    storage.set(StorageKeys.SESSIONS, next);
  };

  // Reconnect a session with a 3-attempt retry loop. The first attempt is
  // fast; each subsequent attempt is slower. If all 3 fail, mark the
  // session as unavailable and show an error toast.
  const startReconnect = (id: string) => {
    if (reconnecting) return;
    setReconnecting({ id, attempt: 1 });
    setToast("Reconnecting…");
    const MAX_ATTEMPTS = 3;
    const tryOnce = (attempt: number) => {
      setReconnecting({ id, attempt });
      // Fake handshake: succeed on the 2nd attempt.
      setTimeout(() => {
        if (attempt < 2) {
          tryOnce(attempt + 1);
          return;
        }
        setSessionList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, connected: true } : s)),
        );
        setConnected(true);
        setReconnecting(null);
        setToast(attempt >= MAX_ATTEMPTS ? "Connected" : "Connected");
      }, 600);
    };
    tryOnce(1);
  };
  const [attachOpen, setAttachOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [time, setTime] = useState(clock);
  const [device, setDevice] = useState<DeviceKind>(isNative ? "phone" : "ipad");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches,
  );
  const [gitFiles, setGitFiles] = useState<GitFile[]>(initialGitFiles);
  const [commits, setCommits] = useState<CommitNode[]>(initialCommits);
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts);
  const [commitMessage, setCommitMessage] = useState("");
  const [checkpointList] = useState<Checkpoint[]>(checkpoints);

  const effort = settings.effortLevel;

  function doCommit(message: string, amend: boolean) {
    const hash = uid("c").replace("-", "").slice(0, 7);
    if (amend) {
      setCommits((prev) =>
        prev.map((c, i) => (i === 0 ? { ...c, message, hash } : c)),
      );
    } else {
      const node: CommitNode = {
        id: uid("c"),
        hash,
        message,
        author: "leonalav",
        branch: "main",
        lane: 0,
      };
      setCommits((prev) => [node, ...prev]);
      if (gitFiles.length > 0) {
        setArtifacts((prev) => [
          { id: uid("a"), kind: "log", path: `debug-${hash}.log` },
          ...prev,
        ]);
      }
    }
    setGitFiles([]);
    setCommitMessage("");
    return hash;
  }

  function handleCommit(message: string) {
    const hash = doCommit(message, false);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("s"),
        role: "system",
        text: `Committed on main · ${message}`,
        time: clock(),
        tools: [
          {
            id: uid("t"),
            name: "Bash",
            detail: "git commit -m",
            status: "done",
            output: `[main ${hash}] ${message}`,
          },
        ],
      },
    ]);
  }

  function handleCommitAndPush(message: string) {
    const hash = doCommit(message, false);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("s"),
        role: "system",
        text: `Committed and pushed to origin/main · ${message}`,
        time: clock(),
        tools: [
          {
            id: uid("t"),
            name: "Bash",
            detail: "git commit -m",
            status: "done",
            output: `[main ${hash}] ${message}`,
          },
          {
            id: uid("t"),
            name: "Bash",
            detail: "git push origin main",
            status: "done",
            output: `To github.com/leonalav/aurora-api\n   ${hash}..main -> main`,
          },
        ],
      },
    ]);
  }

  function handleCommitAndSync(message: string) {
    const hash = doCommit(message, false);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("s"),
        role: "system",
        text: `Synced · pulled, committed, and pushed · ${message}`,
        time: clock(),
        tools: [
          { id: uid("t"), name: "Bash", detail: "git pull --rebase", status: "done", output: "Already up to date." },
          {
            id: uid("t"),
            name: "Bash",
            detail: "git commit -m",
            status: "done",
            output: `[main ${hash}] ${message}`,
          },
          {
            id: uid("t"),
            name: "Bash",
            detail: "git push origin main",
            status: "done",
            output: "main -> main",
          },
        ],
      },
    ]);
  }

  function handleCommitAmend(message: string) {
    doCommit(message, true);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("s"),
        role: "system",
        text: `Amended the most recent commit · ${message}`,
        time: clock(),
        tools: [
          {
            id: uid("t"),
            name: "Bash",
            detail: "git commit --amend -m",
            status: "done",
            output: "HEAD amended",
          },
        ],
      },
    ]);
  }

  function findIssues() {
    setMessages((prev) => [
      ...prev,
      {
        id: uid("s"),
        role: "system",
        text: "Agent review · scanning changes against main",
        time: clock(),
        thinking: [
          {
            id: uid("th"),
            label: "Reviewing uncommitted diff",
            content:
              "Spawning review agents across 8 changed files.\n" +
              "Checking for: debug code, missing error handling,\n" +
              "type safety, secrets, and N+1 queries.",
            durationMs: 1200,
          },
        ],
      },
    ]);
  }

  function restoreCheckpoint(cp: Checkpoint) {
    setMessages((prev) => [
      ...prev,
      {
        id: uid("s"),
        role: "system",
        text: `Restored to checkpoint “${cp.label}” · ${cp.scope} changes rolled back`,
        time: clock(),
      },
    ]);
  }

  // "system" theme follows the OS color scheme live, like the desktop app.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark =
    settings.theme.startsWith("dark") || (settings.theme === "system" && systemDark);
  const isDaltonized = settings.theme.includes("daltonized");

  const modelLabel =
    settings.endpointMode === "custom"
      ? settings.customModel || "Custom model"
      : settings.model.replace("Claude ", "");

  const tokens = useMemo(() => estimateTokens(messages), [messages]);

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRevertTool(messageId: string, toolId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              tools: m.tools?.map((t) => (t.id === toolId ? { ...t, reverted: !t.reverted } : t)),
            }
          : m,
      ),
    );
  }

  function setEffort(level: EffortLevel) {
    setSettings((prev) => ({
      ...prev,
      effortLevel: level,
      ultracode: level === "ultracode",
    }));
  }

  /** Spawns the inline /effort slider in the chat transcript. */
  function spawnEffortSlider() {
    setTab("chat");
    setMessages((prev) => [
      ...prev,
      { id: uid("u"), role: "user", text: "/effort", time: clock() },
      { id: uid("w"), role: "system", text: "", time: clock(), widget: "effort" },
    ]);
  }

  function applyEffortArg(arg: string) {
    const match = effortLevels.find((l) => l.arg === arg.toLowerCase());
    if (!match) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: `Unknown effort level “${arg}”. Try ${effortLevels.map((l) => l.arg).join(", ")}.`,
          time: clock(),
        },
      ]);
      return;
    }
    setEffort(match.id);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("a"),
        role: "system",
        text:
          match.id === "auto"
            ? "Effort reset to the model default for Opus 4.5."
            : `Effort set to ${match.arg} · ${
                match.persists ? "saved to effortLevel in settings.json" : "current session only"
              }.`,
        time: clock(),
      },
    ]);
  }

  useEffect(() => {
    const id = window.setInterval(() => setTime(clock()), 1000 * 30);
    return () => window.clearInterval(id);
  }, []);

  const session = useMemo(
    () => sessionList.find((s) => s.active) ?? sessionList[0],
    [sessionList],
  );

  function pushUser(text: string, extras?: { attachments?: Attachment[]; skill?: string; plugin?: string }) {
    if (!connected) setConnected(true);
    const user: Message = {
      id: uid("u"),
      role: "user",
      text,
      time: clock(),
      attachments: extras?.attachments,
      skill: extras?.skill,
      plugin: extras?.plugin,
    };
    setMessages((prev) => [...prev, user]);
    setThinking(true);

    // Every reply gets a 3s minimum turn (real Claude Code per-turn floor).
    const TURN_MS = 3000;

    // --- ultracode orchestration mode ---
    if (effort === "ultracode") {
      // Phase 1: show "planning workflow…" after a beat
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: uid("s"),
            role: "system",
            text: "ultracode · planning dynamic workflow…",
            time: clock(),
          },
        ]);
      }, 400);
      // Phase 2: full orchestration reply
      window.setTimeout(() => {
        const replies = ultracodeReply(text);
        setMessages((prev) => [...prev, ...replies]);
        setThinking(false);
      }, TURN_MS);
      return;
    }

    // --- normal reply path ---
    window.setTimeout(() => {
      setMessages((prev) => [...prev, replyFor(text, extras)]);
      setThinking(false);
    }, TURN_MS);
  }

  function sendDraft() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");

    // /effort  -> spawn the slider.  /effort <level> -> set directly.
    if (/^\/effort$/i.test(text)) {
      spawnEffortSlider();
      return;
    }
    const effortArg = text.match(/^\/effort\s+(\S+)$/i);
    if (effortArg) {
      setTab("chat");
      setMessages((prev) => [
        ...prev,
        { id: uid("u"), role: "user", text, time: clock() },
      ]);
      applyEffortArg(effortArg[1]);
      return;
    }
    if (/^\/(config|settings)$/i.test(text)) {
      setTab("settings");
      return;
    }

    // Preview trigger: "I want to see the app preview" (case-insensitive, lenient)
    if (/i\s+want\s+to\s+see\s+the\s+app\s+preview/i.test(text)) {
      pushUser(text);
      triggerAppPreview();
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: uid("u"), role: "user", text, time: clock() },
    ]);
    if (/^\/rewind$/i.test(text)) {
      setTab("chat");
      setMessages((prev) => [
        ...prev,
        { id: uid("w"), role: "system", text: "", time: clock(), widget: "checkpoints" },
      ]);
      return;
    }
    if (/^\/context$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: `Context · ${(tokens / 1000).toFixed(1)}k / 200k tokens — ${Math.round(
            (tokens / 200000) * 100,
          )}% used. Auto-compact at ${settings.autoCompactWindow}%.`,
          time: clock(),
        },
      ]);
      return;
    }
    if (/^\/usage$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: "Session usage · 186k input · 24k output · 213 tool calls · est. $2.41 · Opus 4.5",
          time: clock(),
        },
      ]);
      return;
    }
    if (/^\/clear$/i.test(text)) {
      setMessages([initialMessages[0]]);
      setTab("chat");
      return;
    }
    if (/^\/branch$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: "Session forked onto a parallel path · original preserved",
          time: clock(),
        },
      ]);
      return;
    }
    if (/^\/code-review$/i.test(text) || text.startsWith("/code-review ")) {
      setMessages((prev) => [...prev, replyFor("/review")]);
      return;
    }
    if (/^\/verify$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: "Verified · npm run build passed, 78 tests green, app boots on localhost:3000",
          time: clock(),
          tools: [
            { id: uid("t"), name: "Bash", detail: "npm run build", status: "done", output: "✓ built in 3.4s" },
            { id: uid("t"), name: "Bash", detail: "npm test", status: "done", output: "78 passed" },
          ],
        },
      ]);
      return;
    }
    if (/^\/simplify$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: "Simplified · removed 3 duplicate guards, inlined 2 helpers",
          time: clock(),
        },
      ]);
      return;
    }
    if (/^\/undo$/i.test(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: "Undid the last file edit · restore with /redo",
          time: clock(),
        },
      ]);
      return;
    }
    if (/^\/deep-research$/i.test(text) || text.startsWith("/deep-research ")) {
      const query = text.replace(/^\/deep-research\s*/i, "").trim() || "the topic";
      setMessages((prev) => [
        ...prev,
        {
          id: uid("a"),
          role: "system",
          text: `Deep research fanned out across 6 sources on “${query}”. Returning a cited summary.`,
          time: clock(),
        },
      ]);
      return;
    }
    setMessages((prev) => prev.slice(0, prev.length - 1));
    pushUser(text, {
      skill: skills.find((s) => text === s.command || text.startsWith(s.command + " "))?.id,
    });
  }

  /**
   * Triggered when the user types "I want to see the app preview" (or similar).
   * In orchestration (mock) mode: instantly render the AppPreviewCard.
   * In real mode: POST to /api/preview, which asks Claude Code to detect the
   * package manager and start the dev server, then streams back the URL.
   */
  function triggerAppPreview() {
    setTab("chat");

    // Optimistically render a "starting" card; the real flow will replace it
    // when the server returns a ready status.
    const startingId = uid("a");
    const initialUrl = publicUrlFor("http://localhost:3000");
    setMessages((prev) => [
      ...prev,
      {
        id: startingId,
        role: "assistant",
        text: "Starting the dev server...",
        time: clock(),
        appPreview: {
          id: uid("preview"),
          title: "App Preview",
          url: initialUrl,
          description: "Detecting package manager and booting dev server.",
          type: "web",
          status: "starting",
          command: "npm run dev",
        },
      },
    ]);

    // Orchestration/mock mode (no server URL configured): just animate to ready.
    // Real mode: stream status from /api/preview.
    const hasServer = Boolean(window.localStorage.getItem("previewServerUrl"));
    if (!hasServer) {
      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === startingId && m.appPreview
              ? {
                  ...m,
                  text: "Dev server is up. Tap the preview to interact.",
                  appPreview: {
                    ...m.appPreview,
                    status: "ready",
                    description: "npm run dev · Started by Claude",
                  },
                }
              : m,
          ),
        );
      }, 1800);
      return;
    }

    // Real mode: POST to backend, then SSE for status updates.
    const serverUrl = window.localStorage.getItem("previewServerUrl");
    fetch(`${serverUrl}/api/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "I want to see the app preview" }),
    })
      .then((res) => res.json())
      .then((data: {
        url?: string;
        command?: string;
        title?: string;
        error?: string;
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === startingId && m.appPreview
              ? {
                  ...m,
                  text: data.error
                    ? `Failed to start: ${data.error}`
                    : "Dev server is up. Tap the preview to interact.",
                  appPreview: {
                    ...m.appPreview,
                    url: data.url ? publicUrlFor(data.url) : m.appPreview.url,
                    command: data.command ?? m.appPreview.command,
                    title: data.title ?? m.appPreview.title,
                    status: data.error ? "error" : "ready",
                    description: data.error
                      ? data.error
                      : `${data.command ?? "npm run dev"} · Started by Claude`,
                  },
                }
              : m,
          ),
        );
      })
      .catch((err: unknown) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === startingId && m.appPreview
              ? {
                  ...m,
                  text: "Failed to reach the preview server.",
                  appPreview: {
                    ...m.appPreview,
                    status: "error",
                    description: err instanceof Error ? err.message : String(err),
                  },
                }
              : m,
          ),
        );
      });
  }

  function runSkill(skill: Skill) {
    setTab("chat");
    pushUser(skill.usage, { skill: skill.id });
  }

  function runPlugin(plugin: Plugin) {
    setTab("chat");
    pushUser(`/plugin ${plugin.id}`, { plugin: plugin.id });
  }

  function pickSlash(item: SlashItem) {
    if (item.command === "/skill") {
      setDraft("");
      setTab("skills");
      return;
    }
    if (item.command === "/config" || item.command === "/statusline") {
      setDraft("");
      setTab("settings");
      return;
    }
    if (item.command === "/effort") {
      setDraft("/effort");
      return;
    }
    if (item.command === "/plugin" || item.command.startsWith("/plugin ")) {
      setDraft("");
      setTab("plugins");
      return;
    }
    if (item.command === "/rewind") {
      setDraft("");
      setTab("chat");
      setMessages((prev) => [
        ...prev,
        { id: uid("w"), role: "system", text: "", time: clock(), widget: "checkpoints" },
      ]);
      return;
    }
    setDraft(item.command + " ");
  }

  function attachImage() {
    setAttachOpen(false);
    setTab("chat");
    pushUser("Login CTAs still collide on this viewport.", {
      attachments: [
        { id: uid("att"), kind: "image", name: "login-overlap.jpg", url: "/images/ui-bug.jpg" },
      ],
    });
  }

  function attachFile() {
    setAttachOpen(false);
    setTab("chat");
    pushUser("Please inspect src/screens/Login.tsx from the paired repo.", {
      attachments: [{ id: uid("att"), kind: "file", name: "src/screens/Login.tsx" }],
    });
  }

  function attachCamera() {
    setAttachOpen(false);
    setTab("chat");
    pushUser("Whiteboard photo of the auth flow.", {
      attachments: [
        { id: uid("att"), kind: "image", name: "whiteboard.jpg", url: "/images/abstract-clay.jpg" },
      ],
    });
  }

  function sendVoice(seconds: number, transcript: string) {
    setVoiceOpen(false);
    setTab("chat");
    pushUser(transcript, {
      attachments: [
        { id: uid("att"), kind: "voice", name: "voice-note.m4a", duration: seconds, caption: transcript },
      ],
    });
  }

  const isTablet = device === "ipad";

  const chatColumn = (
    <>
      <ChatHeader
        session={session}
        connected={connected}
        effort={effort}
        onEffortTap={spawnEffortSlider}
        modelLabel={modelLabel}
      />
      <ContextBar tokens={tokens} autoCompactWindow={settings.autoCompactWindow} />
      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatView
          messages={messages}
          thinking={thinking}
          effort={effort}
          onEffortChange={setEffort}
          onRevertTool={toggleRevertTool}
          onOpenPreview={() => {
            // Find the most recent preview card and open it fullscreen.
            // iPhone visually rotates to landscape first; iPad stays put.
            const latest = [...messages]
              .reverse()
              .find((m) => m.appPreview?.status === "ready");
            if (latest?.appPreview) {
              setOpenPreviewId(latest.appPreview.id);
              if (device === "phone") setPreviewLandscape(true);
            }
          }}
          onClosePreview={() => setOpenPreviewId(null)}
          checkpoints={checkpointList}
          onRestoreCheckpoint={restoreCheckpoint}
        />
      </div>
      <Composer
        value={draft}
        onChange={setDraft}
        onSend={sendDraft}
        onMic={() => setVoiceOpen(true)}
        onPlus={() => setAttachOpen(true)}
        slashItems={slashItems}
        onSlashPick={pickSlash}
        files={gitFiles.map((f) => ({
          path: f.path,
          name: f.path.split("/").pop() ?? f.path,
        }))}
      />
    </>
  );

  const restTabs = (
    <>
      {tab === "skills" && <SkillsView skills={skills} onRun={runSkill} />}
      {tab === "git" && (
        <GitView
          files={gitFiles}
          commits={commits}
          artifacts={artifacts}
          onCommit={handleCommit}
          onCommitAndPush={handleCommitAndPush}
          onCommitAndSync={handleCommitAndSync}
          onCommitAmend={handleCommitAmend}
          onFindIssues={findIssues}
          commitMessage={commitMessage}
          setCommitMessage={setCommitMessage}
        />
      )}
      {tab === "plugins" && (
        <PluginsView
          plugins={plugins}
          onToggle={(id) =>
            setPlugins((prev) =>
              prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
            )
          }
          onSlide={(pluginId, sliderId, value) =>
            setPlugins((prev) =>
              prev.map((p) =>
                p.id === pluginId
                  ? {
                      ...p,
                      sliders: p.sliders.map((s) => (s.id === sliderId ? { ...s, value } : s)),
                    }
                  : p,
              ),
            )
          }
          onInvoke={runPlugin}
        />
      )}
      {tab === "pair" && (
        <ConnectView
          sessions={sessionList}
          connected={connected}
          onToggle={() => {
          if (connected) {
            // Disconnect the active session: mark it unavailable.
            const activeId = sessionList.find((s) => s.active)?.id;
            if (activeId) {
              const next = sessionList.map((s) =>
                s.id === activeId ? { ...s, connected: false } : s,
              );
              setSessionList(next);
              persistSessions(next);
            }
            setConnected(false);
          } else {
            // Reconnect active session.
            const activeId = sessionList.find((s) => s.active)?.id;
            if (activeId) startReconnect(activeId);
          }
        }}
          onSelect={(id) => {
            const next = sessionList.map((s) => ({ ...s, active: s.id === id }));
            setSessionList(next);
            setConnected(true);
            persistSessions(next);
          }}
          onPatchSession={(id, patch) => {
            const next = sessionList.map((s) =>
              s.id === id ? { ...s, ...patch } : s,
            );
            setSessionList(next);
            persistSessions(next);
          }}
          onReconnect={startReconnect}
          reconnecting={reconnecting}
        />
      )}
      {tab === "settings" && (
        <SettingsView
          settings={settings}
          onChange={updateSetting}
          onOpenEffort={spawnEffortSlider}
        />
      )}
    </>
  );

  const overlays = (
    <>
      {attachOpen && (
        <AttachSheet
          onClose={() => setAttachOpen(false)}
          onPickImage={attachImage}
          onPickFile={attachFile}
          onPickCamera={attachCamera}
        />
      )}
      {voiceOpen && (
        <VoiceOverlay onCancel={() => setVoiceOpen(false)} onSend={sendVoice} />
      )}
      {openPreviewId &&
        (() => {
          const preview = messages
            .map((m) => m.appPreview)
            .find((p) => p && p.id === openPreviewId);
          if (!preview) return null;
          const overlay = (
            <FullscreenPreviewOverlay
              preview={preview}
              publicBaseUrl={
                window.localStorage.getItem("publicPreviewUrl") || undefined
              }
              onClose={() => {
                setOpenPreviewId(null);
                setPreviewLandscape(false);
              }}
            />
          );
          // Portal to #preview-portal so the overlay fills the viewport in
          // true landscape, escaping any rotation transforms on the phone-frame.
          const container = document.getElementById("preview-portal");
          if (!container) return overlay; // fallback: render inline
          return createPortal(overlay, container);
        })()}
    </>
  );

  const inner = isTablet ? (
    <div className="relative h-full bg-cream text-ink">
      <div className="flex h-full" style={{ fontFamily: "var(--font-sans)" }}>
        <Sidebar
          current={tab}
          onChange={setTab}
          session={session}
          connected={connected}
          modelLabel={modelLabel}
          effort={effortMeta(effort).arg}
        />
        <div className="flex min-w-0 flex-1 flex-col pt-[42px] pb-[18px]">
          {tab === "chat" ? (
            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">{chatColumn}</div>
              <TabletRail
                session={session}
                modelLabel={modelLabel}
                effort={effortMeta(effort).arg}
                tokens={tokens}
                files={gitFiles}
                onOpenGit={() => setTab("git")}
              />
            </div>
          ) : (
            restTabs
          )}
        </div>
      </div>
      {overlays}
    </div>
  ) : (
    <div className="flex h-full flex-col bg-cream text-ink">
      {/* Top safe-area filler: a fixed-height bar at the very top of the
          screen with cream background. On devices that report a non-zero
          safe-area-inset-top (iPhone notch, dynamic island, Android
          cutouts), this ensures the cream background extends all the way
          up to the iOS status bar — without it, the WKWebView's dark
          background shows behind the notch.
          Capacitor with overlaysWebView:false reports the value correctly
          on most devices, but a minimum 22px fallback is enforced so
          section headings never sit under the earpiece / Dynamic Island
          on any iPhone that doesn't report the inset to the web view. */}
      <div style={{ height: 'max(env(safe-area-inset-top, 0px), 22px)' }} />
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "chat" && chatColumn}
        {restTabs}
      </div>
      <TabBar current={tab} onChange={setTab} keyboardOpen={keyboardOpen} />
      {overlays}
    </div>
  );

  // Native shell (Capacitor on iOS/Android): render the inner content
  // full-bleed with no marketing/demo wrapper. The phone frame, stage
  // background, and blur orbs are all desktop-only polish.
  if (isNative) {
    return (
      <LayoutContext.Provider value="phone">
        <div
          className={cn(
            // h-full so we follow <body>'s height. With Capacitor's
            // KeyboardResizeMode: "body", body gets resized when the
            // keyboard appears — this shell follows that resize, so the
            // composer stays pinned to the visible edge above the keyboard.
            //
            // We intentionally do NOT use min-h-screen here — that would
            // force the wrapper to be at least 100vh tall, which on a
            // keyboard-shrunken body leaves a dark gap below the cream
            // inner content. h-full alone keeps the wrapper matched to
            // body's current height on every resize.
            "relative flex h-full w-full flex-col overflow-hidden bg-cream",
            isDark && "theme-dark",
          )}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {inner}
          {overlays}
          <Toast text={toast} />
        </div>
      </LayoutContext.Provider>
    );
  }

  return (
    <LayoutContext.Provider value={isTablet ? "tablet" : "phone"}>
      <div className="relative min-h-dvh overflow-hidden bg-ink">
        <img
          src="/images/stage-bg.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />
        <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-clay/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-clay/10 blur-[110px]" />

        <div
          className={cn(
            "relative mx-auto flex min-h-dvh items-center justify-center gap-16 px-4 py-8 max-sm:p-0",
            isTablet ? "max-w-[1400px] flex-col lg:px-6" : "max-w-6xl lg:justify-between lg:px-10",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isTablet ? "w-full max-w-[1180px] justify-between pt-2" : "hidden lg:block lg:max-w-md lg:flex-1",
            )}
          >
            {!isTablet && (
              <aside>
                <div className="flex items-center gap-3">
                  <img
                    src="/images/claude-mark.png"
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <p className="font-serif text-[22px] text-cream">Claude</p>
                </div>
                <h1 className="mt-8 font-serif text-[56px] leading-[0.95] tracking-tight text-cream">
                  Claude Code,
                  <br />
                  <span className="italic text-clay">in your pocket.</span>
                </h1>
                <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-stone">
                  Pair this phone with a live desktop session. Chat, invoke /skill and /plugin, tune sliders, and drop voice or screenshots straight into the repo.
                </p>
                <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 text-cream">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">Session</dt>
                    <dd className="mt-1 font-mono text-[13px]">{session.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">Host</dt>
                    <dd className="mt-1 font-mono text-[13px]">{session.host}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">Model</dt>
                    <dd className="mt-1 font-mono text-[13px]">
                      {settings.endpointMode === "custom" ? modelLabel : session.model}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">Link</dt>
                    <dd className="mt-1 font-mono text-[13px]">{connected ? "Live · LAN" : "Idle"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">Effort</dt>
                    <dd className="mt-1 font-mono text-[13px] text-clay">{effortMeta(effort).arg}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">Scope</dt>
                    <dd className="mt-1 font-mono text-[13px]">{settings.scope}</dd>
                  </div>
                </dl>
              </aside>
            )}
            {isTablet && (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src="/images/claude-mark.png"
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-serif text-[20px] text-cream">Claude Code</p>
                    <p className="text-[12px] text-stone">iPad Pro preview · split-pane workspace</p>
                  </div>
                </div>
                <DeviceToggle device={device} onChange={setDevice} />
              </>
            )}
          </div>

          {!isTablet && (
            <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-2 max-sm:top-3">
              <DeviceToggle device={device} onChange={setDevice} />
              {previewLandscape && (
                <button
                  type="button"
                  onClick={() => setPreviewLandscape(false)}
                  className="press inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-ink/60 px-3 py-1.5 text-[11.5px] font-medium text-cream backdrop-blur"
                >
                  <RotateCcw size={11} />
                  Exit preview
                </button>
              )}
            </div>
          )}

          <div className={cn(isTablet ? "ipad-scale" : "phone-scale", isDaltonized && "accent-daltonized", !isTablet && previewLandscape && "preview-landscape")}>
            {isTablet ? (
              <Ipad time={time} dark={isDark}>
                {inner}
              </Ipad>
            ) : (
              <Phone time={time} dark={isDark}>
                {inner}
              </Phone>
            )}
          </div>
        </div>
      </div>

      {/* Portal root: the preview overlay escapes the phone-frame rotation by
          rendering here at the viewport level via ReactDOM.createPortal. */}
      <div id="preview-portal" />

    </LayoutContext.Provider>
  );
}

/**
 * Floating toast notification. Slides up from the bottom of the screen.
 */
function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-[12px] font-medium text-cream shadow-2xl backdrop-blur"
      style={{
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      {text}
    </div>
  );
}

function DeviceToggle({
  device,
  onChange,
}: {
  device: DeviceKind;
  onChange: (d: DeviceKind) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-cream/15 bg-ink/60 p-1 backdrop-blur">
      {(["phone", "ipad"] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors",
            device === d ? "bg-clay text-cream" : "text-stone hover:text-cream",
          )}
        >
          {d === "ipad" ? "iPad" : "Phone"}
        </button>
      ))}
    </div>
  );
}

import type { EffortLevel } from "./effort";

export type TabId = "chat" | "skills" | "plugins" | "pair" | "settings" | "git";

export type Attachment = {
  id: string;
  kind: "image" | "voice" | "file";
  name: string;
  url?: string;
  duration?: number;
  caption?: string;
};

export type ToolUse = {
  id: string;
  name: string;
  detail: string;
  status: "running" | "done" | "error";
  output?: string;
  diff?: { added: number; removed: number };
  revertible?: boolean;
  reverted?: boolean;
};

export type ThinkingTrace = {
  id: string;
  label: string;
  content: string;
  durationMs: number;
};

export type WorkflowAgent = {
  id: string;
  name: string;
  role: string;
  status: "queued" | "running" | "done" | "verifying";
  detail: string;
  output?: string;
  tokensUsed?: number;
};

export type WorkflowPhase = {
  id: string;
  name: string;
  status: "pending" | "active" | "done";
  agents: WorkflowAgent[];
};

export type Orchestration = {
  scriptName: string;
  phases: WorkflowPhase[];
  totalAgents: number;
  concurrentMax: number;
  status: "planning" | "running" | "converging" | "done";
};

export type AppPreview = {
  id: string;
  title: string;
  url: string;
  description?: string;
  screenshot?: string;
  type: "desktop" | "web";
  status?: "starting" | "ready" | "error";
  command?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  time: string;
  attachments?: Attachment[];
  tools?: ToolUse[];
  skill?: string;
  plugin?: string;
  widget?: "effort" | "checkpoints";
  thinking?: ThinkingTrace[];
  orchestration?: Orchestration;
  appPreview?: AppPreview;
};

export type PermissionMode =
  | "default"
  | "acceptEdits"
  | "plan"
  | "bypassPermissions";

export type Settings = {
  scope: "user" | "project" | "local" | "managed";
  model: string;
  effortLevel: EffortLevel;
  ultracode: boolean;
  outputStyle: "default" | "Explanatory" | "Learning";
  theme: "dark" | "light" | "dark-daltonized" | "light-daltonized" | "system";
  editorMode: "normal" | "vim";
  endpointMode: "anthropic" | "custom";
  customBaseUrl: string;
  customApiKey: string;
  customModel: string;
  customModels: string[];
  modelsStatus: "idle" | "loading" | "success" | "error";
  modelsError: string;
  verbose: boolean;
  showTurnDuration: boolean;
  tui: boolean;
  autoCompactEnabled: boolean;
  autoCompactWindow: number;
  cleanupPeriodDays: number;
  respectGitignore: boolean;
  includeCoAuthoredBy: boolean;
  includeGitInstructions: boolean;
  defaultMode: PermissionMode;
  allow: string[];
  deny: string[];
  ask: string[];
  additionalDirectories: string[];
  sandboxEnabled: boolean;
  autoAllowBashIfSandboxed: boolean;
  allowedDomains: string[];
  disableAllHooks: boolean;
  hooks: { event: string; matcher: string; command: string; enabled: boolean }[];
  enableAllProjectMcpServers: boolean;
  mcpServers: {
    name: string;
    transport: "stdio" | "sse" | "http";
    enabled: boolean;
    command?: string;
    args?: string;
    env?: string;
    url?: string;
    customConfig?: string;
  }[];
  statusLine: boolean;
  statusLineCommand: string;
  notifChannel:
    | "auto"
    | "iterm2"
    | "terminal_bell"
    | "iterm2_with_bell"
    | "kitty"
    | "ghostty"
    | "notifications_disabled";
  agentPushNotifEnabled: boolean;
  autoUpdatesChannel: "stable" | "latest";
  telemetry: boolean;
  forceLoginMethod: "claudeai" | "console";
};

export type Skill = {
  id: string;
  command: string;
  name: string;
  description: string;
  category: "git" | "quality" | "build" | "session";
  usage: string;
};

export type PluginSlider = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
};

export type Plugin = {
  id: string;
  name: string;
  tagline: string;
  official: boolean;
  enabled: boolean;
  color: string;
  sliders: PluginSlider[];
};

export type SlashItem = {
  id: string;
  command: string;
  hint: string;
  kind: "skill" | "plugin" | "command";
};

export type GitStatus = "M" | "U" | "A" | "D" | "R";

export type DiffLine = {
  type: "add" | "del" | "context";
  oldNo?: number;
  newNo?: number;
  text: string;
};

export type DiffHunk = {
  header: string;
  lines: DiffLine[];
};

export type GitFile = {
  path: string;
  status: GitStatus;
  added: number;
  removed: number;
  hunks: DiffHunk[];
};

export type CommitNode = {
  id: string;
  hash: string;
  message: string;
  author: string;
  branch: string;
  lane: number;
  isMerge?: boolean;
  ai?: boolean;
};

export type Artifact = {
  id: string;
  kind: "file" | "document" | "log";
  path: string;
};

export type Checkpoint = {
  id: string;
  label: string;
  time: string;
  description: string;
  scope: "code" | "conversation" | "both";
};

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

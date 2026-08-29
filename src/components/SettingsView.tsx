import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Bot,
  Braces,
  Check,
  ChevronDown,
  Cpu,
  Eye,
  EyeOff,
  Gauge,
  GitBranch,
  KeyRound,
  Layers,
  Link2,
  Loader2,
  Lock,
  Plug,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Trash2,
  Webhook,
} from "lucide-react";
import type { EffortLevel } from "../effort";
import { effortLevels, effortMeta } from "../effort";
import type { Settings } from "../types";
import { cn } from "../utils/cn";

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  icon: typeof Cpu;
  title: string;
  subtitle: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/6 bg-cream-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/6 text-ink-soft">
          <Icon size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium text-ink">{title}</span>
          <span className="block truncate text-[11.5px] text-stone">{subtitle}</span>
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="border-t border-ink/6 px-3.5 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-ink/5 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[10.5px] leading-snug text-stone">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        on ? "bg-clay" : "bg-mist",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow-sm transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-[10.5px] transition-colors",
            value === opt ? "bg-ink text-cream" : "bg-mist text-ink-soft",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Rules({ label, items, tone }: { label: string; items: string[]; tone: string }) {
  return (
    <div className="py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: tone }}>
        {label} · {items.length}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((rule) => (
          <span
            key={rule}
            className="rounded-md bg-ink/5 px-2 py-1 font-mono text-[10px] text-ink-soft"
          >
            {rule}
          </span>
        ))}
      </div>
    </div>
  );
}

function NumberSlider({
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="w-[132px]">
      <p className="mb-1 text-right font-mono text-[10.5px] text-ink">
        {value}
        {suffix}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-clay"
        style={{
          background: `linear-gradient(to right, #d97757 0%, #d97757 ${pct}%, #e8e6dc ${pct}%, #e8e6dc 100%)`,
        }}
      />
    </div>
  );
}

function CustomEndpointPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}) {
  const [showKey, setShowKey] = useState(false);

  /** Real network call: GETs {baseUrl}/v1/models and normalizes the response. */
  async function loadModels() {
    const base = settings.customBaseUrl.trim().replace(/\/+$/, "");
    if (!base) {
      onChange("modelsStatus", "error");
      onChange("modelsError", "Enter a base URL first.");
      return;
    }
    onChange("modelsStatus", "loading");
    onChange("modelsError", "");
    try {
      const url = /\/models(\?.*)?$/i.test(base) ? base : `${base}/v1/models`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${settings.customApiKey}`,
          "x-api-key": settings.customApiKey,
          "anthropic-version": "2023-06-01",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`);
      }
      const json = await res.json();
      const raw = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.models)
          ? json.models
          : Array.isArray(json)
            ? json
            : [];
      const ids = Array.from(
        new Set(
          raw
            .map((m: unknown) =>
              typeof m === "string"
                ? m
                : ((m as Record<string, unknown>)?.id ??
                  (m as Record<string, unknown>)?.name ??
                  (m as Record<string, unknown>)?.model),
            )
            .filter(Boolean),
        ),
      ) as string[];
      if (!ids.length) {
        throw new Error("Endpoint responded, but no models were found in the payload.");
      }
      onChange("customModels", ids);
      onChange("modelsStatus", "success");
      if (!settings.customModel) onChange("customModel", ids[0]);
    } catch (err) {
      onChange("modelsStatus", "error");
      onChange(
        "modelsError",
        err instanceof Error
          ? err.message
          : "Request failed. Check the URL and CORS policy.",
      );
    }
  }

  return (
    <div className="space-y-3 py-1.5">
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
          <Link2 size={11} /> Base URL
        </label>
        <input
          type="url"
          value={settings.customBaseUrl}
          onChange={(e) => onChange("customBaseUrl", e.target.value)}
          placeholder="https://api.your-proxy.com"
          className="w-full rounded-lg border border-ink/10 bg-cream px-2.5 py-2 font-mono text-[11.5px] text-ink outline-none focus:border-clay"
        />
      </div>

      <div>
        <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
          <KeyRound size={11} /> API key
        </label>
        <div className="flex items-center gap-1.5 rounded-lg border border-ink/10 bg-cream px-2.5 py-1.5">
          <input
            type={showKey ? "text" : "password"}
            value={settings.customApiKey}
            onChange={(e) => onChange("customApiKey", e.target.value)}
            placeholder="sk-..."
            className="min-w-0 flex-1 bg-transparent py-0.5 font-mono text-[11.5px] text-ink outline-none"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="shrink-0 text-stone"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={loadModels}
        disabled={settings.modelsStatus === "loading"}
        className="press flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-[12.5px] font-medium text-cream disabled:opacity-60"
      >
        {settings.modelsStatus === "loading" ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Contacting endpoint…
          </>
        ) : (
          <>
            <RefreshCw size={13} /> Load available models
          </>
        )}
      </button>

      {settings.modelsStatus === "error" && (
        <div className="flex items-start gap-2 rounded-xl bg-clay/10 p-2.5">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-clay-deep" />
          <p className="text-[11px] leading-relaxed text-ink-soft">{settings.modelsError}</p>
        </div>
      )}

      {settings.modelsStatus === "success" && settings.customModels.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-moss">
            <Check size={11} /> {settings.customModels.length} model
            {settings.customModels.length === 1 ? "" : "s"} found
          </p>
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-xl border border-ink/8 bg-cream p-1.5">
            {settings.customModels.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange("customModel", m)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left font-mono text-[11px] transition-colors",
                  settings.customModel === m ? "bg-clay/15 text-clay" : "text-ink-soft hover:bg-mist",
                )}
              >
                <span className="truncate">{m}</span>
                {settings.customModel === m && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink-soft">Active model name</label>
        <input
          type="text"
          value={settings.customModel}
          onChange={(e) => onChange("customModel", e.target.value)}
          placeholder="e.g. llama-3.1-70b-instruct"
          className="w-full rounded-lg border border-ink/10 bg-cream px-2.5 py-2 font-mono text-[11.5px] text-ink outline-none focus:border-clay"
        />
        <p className="mt-1 text-[10px] leading-relaxed text-stone">
          Pick a model above to fill this in, or type any custom model name your endpoint serves.
        </p>
      </div>

      <p className="text-[10px] leading-relaxed text-stone">
        Requests GET {"{baseUrl}"}/v1/models with your key sent as both Authorization: Bearer and
        x-api-key. Blocked by a CORS error? Route through a local proxy that adds the right headers.
      </p>
    </div>
  );
}

function McpServerCard({
  server,
  onChange,
  onRemove,
}: {
  server: Settings["mcpServers"][number];
  onChange: (patch: Partial<Settings["mcpServers"][number]>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-ink/8 bg-cream">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lagoon/15 text-lagoon">
            <Plug size={12} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium text-ink">
              {server.name}
            </span>
            <span className="block font-mono text-[9.5px] text-stone">
              {server.transport}
              {server.url ? ` · ${server.url}` : ""}
            </span>
          </span>
          <ChevronDown
            size={12}
            className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
          />
        </button>
        <Toggle on={server.enabled} onClick={() => onChange({ enabled: !server.enabled })} />
      </div>
      {open && (
        <div className="space-y-2 border-t border-ink/6 px-2.5 py-2.5">
          <Field
            label="Name"
            value={server.name}
            onChange={(v) => onChange({ name: v })}
          />
          <div className="flex items-center gap-1">
            {(["stdio", "sse", "http"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ transport: t })}
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px]",
                  server.transport === t ? "bg-ink text-cream" : "bg-mist text-ink-soft",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {server.transport === "stdio" ? (
            <>
              <Field
                label="Command"
                value={server.command ?? ""}
                onChange={(v) => onChange({ command: v })}
                placeholder="npx"
              />
              <Field
                label="Args"
                value={server.args ?? ""}
                onChange={(v) => onChange({ args: v })}
                placeholder="-y @org/server"
              />
              <Field
                label="Env (KEY=value per line)"
                value={server.env ?? ""}
                onChange={(v) => onChange({ env: v })}
                placeholder="GITHUB_TOKEN=…"
                rows={3}
              />
            </>
          ) : (
            <Field
              label="URL"
              value={server.url ?? ""}
              onChange={(v) => onChange({ url: v })}
              placeholder="http://localhost:8931/sse"
            />
          )}
          <div>
            <p className="mb-1 text-[10.5px] font-medium text-ink-soft">Custom config (JSON)</p>
            <textarea
              value={server.customConfig ?? ""}
              onChange={(e) => onChange({ customConfig: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-ink/10 bg-cream-2 px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-ink-soft outline-none focus:border-clay"
              placeholder='{\n  "tools": [...],\n  "timeout": 30000\n}'
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="press flex w-full items-center justify-center gap-1.5 rounded-lg border border-clay-deep/30 bg-clay/8 py-1.5 text-[10.5px] font-medium text-clay-deep"
          >
            <Trash2 size={11} /> Remove server
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  rows = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <p className="mb-1 text-[10.5px] font-medium text-ink-soft">{label}</p>
      {rows > 1 ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-ink/10 bg-cream-2 px-2.5 py-1.5 font-mono text-[10.5px] leading-relaxed text-ink outline-none focus:border-clay"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-ink/10 bg-cream-2 px-2.5 py-1.5 font-mono text-[10.5px] text-ink outline-none focus:border-clay"
        />
      )}
    </div>
  );
}

export function SettingsView({
  settings,
  onChange,
  onOpenEffort,
}: {
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onOpenEffort: () => void;
}) {
  const [publicPreviewUrl, setPublicPreviewUrl] = useState<string>(
    () => window.localStorage.getItem("publicPreviewUrl") ?? "",
  );
  const meta = effortMeta(settings.effortLevel);
  const json = JSON.stringify(
    {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      model:
        settings.endpointMode === "custom"
          ? settings.customModel || undefined
          : settings.model.toLowerCase().replace(/\s+/g, "-"),
      env:
        settings.endpointMode === "custom"
          ? {
              ANTHROPIC_BASE_URL: settings.customBaseUrl || undefined,
              ANTHROPIC_API_KEY: settings.customApiKey ? "•".repeat(8) : undefined,
            }
          : undefined,
      effortLevel: meta.persists && settings.effortLevel !== "auto" ? settings.effortLevel : undefined,
      ultracode: settings.effortLevel === "ultracode" || undefined,
      outputStyle: settings.outputStyle,
      theme: settings.theme,
      autoCompactEnabled: settings.autoCompactEnabled,
      cleanupPeriodDays: settings.cleanupPeriodDays,
      includeCoAuthoredBy: settings.includeCoAuthoredBy,
      permissions: {
        defaultMode: settings.defaultMode,
        allow: settings.allow,
        ask: settings.ask,
        deny: settings.deny,
        additionalDirectories: settings.additionalDirectories,
      },
      sandbox: {
        enabled: settings.sandboxEnabled,
        autoAllowBashIfSandboxed: settings.autoAllowBashIfSandboxed,
        network: { allowedDomains: settings.allowedDomains },
      },
      statusLine: settings.statusLine
        ? { type: "command", command: settings.statusLineCommand }
        : undefined,
      autoUpdatesChannel: settings.autoUpdatesChannel,
    },
    null,
    2,
  );

  return (
    <div className="phone-scroll h-full px-4 pb-6 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
        /config · /settings
      </p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight text-ink">Settings</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-stone">
        Mirrors the paired session's settings.json and the /config panel.
      </p>

      <div className="mt-4 flex gap-1.5 overflow-x-auto">
        {(["user", "project", "local", "managed"] as const).map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => onChange("scope", scope)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[12px]",
              settings.scope === scope ? "bg-ink text-cream" : "bg-mist text-ink-soft",
            )}
          >
            {scope}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-stone">
        {settings.scope === "user" && "~/.claude/settings.json"}
        {settings.scope === "project" && ".claude/settings.json"}
        {settings.scope === "local" && ".claude/settings.local.json"}
        {settings.scope === "managed" && "/Library/Application Support/ClaudeCode/managed-settings.json"}
      </p>

      <button
        type="button"
        onClick={onOpenEffort}
        className="press mt-4 flex w-full items-center gap-3 rounded-2xl border border-clay/30 bg-blush p-3.5 text-left"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay/15 text-clay">
          <Gauge size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium text-ink">Effort level</span>
          <span className="block truncate text-[11.5px] text-stone">{meta.blurb}</span>
        </span>
        <span className="shrink-0 rounded-full bg-ink px-2 py-1 font-mono text-[10px] text-cream">
          {meta.arg}
        </span>
      </button>
      <div className="mt-2 flex gap-1">
        {effortLevels.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange("effortLevel", l.id as EffortLevel)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-[9px] font-medium transition-colors",
              settings.effortLevel === l.id ? "bg-clay text-cream" : "bg-mist text-stone",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        <Section
          icon={Cpu}
          title="Model & reasoning"
          subtitle="model · effortLevel · outputStyle"
          defaultOpen
        >
          <div className="border-b border-ink/5 pb-3 pt-1">
            <p className="mb-1.5 text-[13px] text-ink">Endpoint</p>
            <div className="flex overflow-hidden rounded-full border border-ink/10 bg-mist p-0.5">
              {(["anthropic", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange("endpointMode", mode)}
                  className={cn(
                    "flex-1 rounded-full px-2 py-1.5 text-[11px] font-medium transition-colors",
                    settings.endpointMode === mode ? "bg-ink text-cream" : "text-ink-soft",
                  )}
                >
                  {mode === "anthropic" ? "Anthropic default" : "Custom endpoint"}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[10.5px] leading-snug text-stone">
              {settings.endpointMode === "anthropic"
                ? "Requests go straight to api.anthropic.com."
                : "Requests use your base URL, key, and model below."}
            </p>
          </div>

          {settings.endpointMode === "anthropic" ? (
            <Row label="Model" hint="Default for interactive sessions">
              <Segmented
                options={["Opus 4.5", "Sonnet 4.5", "Haiku 4.5"] as const}
                value={settings.model.replace("Claude ", "") as "Opus 4.5"}
                onChange={(v) => onChange("model", `Claude ${v}`)}
              />
            </Row>
          ) : (
            <CustomEndpointPanel settings={settings} onChange={onChange} />
          )}

          <Row label="Output style" hint="Adjusts the system prompt">
            <Segmented
              options={["default", "Explanatory", "Learning"] as const}
              value={settings.outputStyle}
              onChange={(v) => onChange("outputStyle", v)}
            />
          </Row>
          <Row label="Ultracode workflows" hint="xhigh + dynamic multi-agent orchestration">
            <Toggle on={settings.ultracode} onClick={() => onChange("ultracode", !settings.ultracode)} />
          </Row>
          <Row label="Auto-updates channel" hint="autoUpdatesChannel">
            <Segmented
              options={["stable", "latest"] as const}
              value={settings.autoUpdatesChannel}
              onChange={(v) => onChange("autoUpdatesChannel", v)}
            />
          </Row>
        </Section>

        <Section
          icon={Server}
          title="App preview · VM"
          subtitle="Public URL for the iframe"
        >
          <Row label="VM public URL" hint="Used to swap localhost:{port} for a reachable address">
            <input
              type="url"
              value={publicPreviewUrl}
              onChange={(e) => {
                setPublicPreviewUrl(e.target.value);
                window.localStorage.setItem("publicPreviewUrl", e.target.value);
              }}
              placeholder="https://my-vm.example.com"
              className="w-full rounded-lg border border-ink/10 bg-mist px-2.5 py-1.5 font-mono text-[11px] text-ink placeholder:text-stone/50 focus:border-lagoon/40 focus:outline-none"
            />
          </Row>
          <p className="-mt-2 px-1 text-[10.5px] leading-snug text-stone">
            Set this to your VM's public hostname (with TLS via Caddy or Cloudflare Tunnel).
            The iframe in the fullscreen preview will load from this URL instead of localhost,
            so the live dev server is reachable from your phone.
          </p>
        </Section>

        <Section icon={Layers} title="Memory & context" subtitle="autoCompact · cleanupPeriodDays">
          <Row label="Auto-compact" hint="Compact automatically near the context limit">
            <Toggle
              on={settings.autoCompactEnabled}
              onClick={() => onChange("autoCompactEnabled", !settings.autoCompactEnabled)}
            />
          </Row>
          <Row label="Compact window" hint="Context fill % before compaction">
            <NumberSlider
              value={settings.autoCompactWindow}
              min={40}
              max={95}
              suffix="%"
              onChange={(v) => onChange("autoCompactWindow", v)}
            />
          </Row>
          <Row label="Transcript retention" hint="cleanupPeriodDays">
            <NumberSlider
              value={settings.cleanupPeriodDays}
              min={1}
              max={90}
              suffix="d"
              onChange={(v) => onChange("cleanupPeriodDays", v)}
            />
          </Row>
          <Row label="Respect .gitignore" hint="Skip ignored files when searching">
            <Toggle
              on={settings.respectGitignore}
              onClick={() => onChange("respectGitignore", !settings.respectGitignore)}
            />
          </Row>
        </Section>

        <Section icon={Terminal} title="Interface & terminal" subtitle="theme · editor mode · verbose">
          <Row label="Theme" hint={settings.theme === "system" ? "Following the OS color scheme" : undefined}>
            <Segmented
              options={["dark", "light", "system"] as const}
              value={settings.theme.replace("-daltonized", "") as "dark"}
              onChange={(v) =>
                onChange(
                  "theme",
                  (settings.theme.includes("daltonized") && v !== "system"
                    ? `${v}-daltonized`
                    : v) as Settings["theme"],
                )
              }
            />
          </Row>
          <Row label="Daltonized variant" hint="Color-blind friendly accent palette">
            <Toggle
              on={settings.theme.includes("daltonized")}
              onClick={() =>
                onChange(
                  "theme",
                  settings.theme.includes("daltonized")
                    ? (settings.theme.replace("-daltonized", "") as Settings["theme"])
                    : ((settings.theme === "system" ? "dark" : settings.theme) +
                        "-daltonized") as Settings["theme"],
                )
              }
            />
          </Row>
          <Row label="Editor mode" hint="Same as /vim">
            <Segmented
              options={["normal", "vim"] as const}
              value={settings.editorMode}
              onChange={(v) => onChange("editorMode", v)}
            />
          </Row>
          <Row label="Verbose output" hint="Show full tool input and output">
            <Toggle on={settings.verbose} onClick={() => onChange("verbose", !settings.verbose)} />
          </Row>
          <Row label="Show turn duration" hint="showTurnDuration">
            <Toggle
              on={settings.showTurnDuration}
              onClick={() => onChange("showTurnDuration", !settings.showTurnDuration)}
            />
          </Row>
          <Row label="Flicker-free renderer" hint="/tui · lower memory, mouse support">
            <Toggle on={settings.tui} onClick={() => onChange("tui", !settings.tui)} />
          </Row>
          <Row label="Status line" hint={settings.statusLineCommand}>
            <Toggle
              on={settings.statusLine}
              onClick={() => onChange("statusLine", !settings.statusLine)}
            />
          </Row>
        </Section>

        <Section icon={Lock} title="Permissions" subtitle="defaultMode · allow · ask · deny">
          <Row label="Default mode" hint="permissions.defaultMode">
            <Segmented
              options={["default", "acceptEdits", "plan", "bypassPermissions"] as const}
              value={settings.defaultMode}
              onChange={(v) => onChange("defaultMode", v)}
            />
          </Row>
          <Rules label="Allow" items={settings.allow} tone="#788c5d" />
          <Rules label="Ask" items={settings.ask} tone="#6a9bcc" />
          <Rules label="Deny" items={settings.deny} tone="#c2613f" />
          <Rules label="Additional directories" items={settings.additionalDirectories} tone="#b0aea5" />
        </Section>

        <Section icon={ShieldCheck} title="Sandbox" subtitle="filesystem and network isolation">
          <Row label="Sandbox enabled" hint="Run bash in an isolated sandbox">
            <Toggle
              on={settings.sandboxEnabled}
              onClick={() => onChange("sandboxEnabled", !settings.sandboxEnabled)}
            />
          </Row>
          <Row label="Auto-allow bash if sandboxed" hint="autoAllowBashIfSandboxed">
            <Toggle
              on={settings.autoAllowBashIfSandboxed}
              onClick={() =>
                onChange("autoAllowBashIfSandboxed", !settings.autoAllowBashIfSandboxed)
              }
            />
          </Row>
          <Rules label="Allowed domains" items={settings.allowedDomains} tone="#788c5d" />
        </Section>

        <Section icon={Webhook} title="Hooks" subtitle="lifecycle commands around tool use">
          <Row label="Disable all hooks" hint="disableAllHooks">
            <Toggle
              on={settings.disableAllHooks}
              onClick={() => onChange("disableAllHooks", !settings.disableAllHooks)}
            />
          </Row>
          {settings.hooks.map((hook, i) => (
            <div key={hook.event + hook.matcher} className="border-b border-ink/5 py-2.5 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-ink/6 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-soft">
                  {hook.event}
                </span>
                <span className="font-mono text-[10px] text-stone">{hook.matcher}</span>
                <div className="ml-auto">
                  <Toggle
                    on={hook.enabled && !settings.disableAllHooks}
                    onClick={() =>
                      onChange(
                        "hooks",
                        settings.hooks.map((h, j) =>
                          j === i ? { ...h, enabled: !h.enabled } : h,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              <p className="mt-1.5 truncate rounded-md bg-ink/4 px-2 py-1 font-mono text-[9.5px] text-ink-soft">
                {hook.command}
              </p>
            </div>
          ))}
        </Section>

        <Section icon={Plug} title="MCP servers" subtitle="external tools over MCP">
          <Row label="Auto-approve project servers" hint="enableAllProjectMcpServers">
            <Toggle
              on={settings.enableAllProjectMcpServers}
              onClick={() =>
                onChange("enableAllProjectMcpServers", !settings.enableAllProjectMcpServers)
              }
            />
          </Row>
          {settings.mcpServers.map((server, i) => (
            <McpServerCard
              key={server.name}
              server={server}
              onChange={(patch) =>
                onChange(
                  "mcpServers",
                  settings.mcpServers.map((s, j) => (j === i ? { ...s, ...patch } : s)),
                )
              }
              onRemove={() =>
                onChange(
                  "mcpServers",
                  settings.mcpServers.filter((_, j) => j !== i),
                )
              }
            />
          ))}
          <button
            type="button"
            onClick={() =>
              onChange("mcpServers", [
                ...settings.mcpServers,
                {
                  name: `server-${settings.mcpServers.length + 1}`,
                  transport: "stdio",
                  enabled: false,
                  customConfig: "{\n  \n}",
                },
              ])
            }
            className="press mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/15 py-2.5 text-[12px] font-medium text-ink-soft"
          >
            <Plus size={13} /> Add custom config
          </button>
        </Section>

        <Section icon={GitBranch} title="Git & attribution" subtitle="includeCoAuthoredBy">
          <Row label="Co-authored-by byline" hint="Adds Claude to commits and PRs">
            <Toggle
              on={settings.includeCoAuthoredBy}
              onClick={() => onChange("includeCoAuthoredBy", !settings.includeCoAuthoredBy)}
            />
          </Row>
          <Row label="Git instructions" hint="includeGitInstructions">
            <Toggle
              on={settings.includeGitInstructions}
              onClick={() => onChange("includeGitInstructions", !settings.includeGitInstructions)}
            />
          </Row>
        </Section>

        <Section icon={Bell} title="Notifications" subtitle="preferredNotifChannel · push">
          <Row label="Channel">
            <Segmented
              options={["auto", "terminal_bell", "iterm2", "kitty", "ghostty"] as const}
              value={settings.notifChannel as "auto"}
              onChange={(v) => onChange("notifChannel", v)}
            />
          </Row>
          <Row label="Agent push notifications" hint="Alerts on this phone when a turn ends">
            <Toggle
              on={settings.agentPushNotifEnabled}
              onClick={() => onChange("agentPushNotifEnabled", !settings.agentPushNotifEnabled)}
            />
          </Row>
        </Section>

        <Section icon={Bot} title="Account & privacy" subtitle="login method · telemetry">
          <Row label="Login method" hint="forceLoginMethod">
            <Segmented
              options={["claudeai", "console"] as const}
              value={settings.forceLoginMethod}
              onChange={(v) => onChange("forceLoginMethod", v)}
            />
          </Row>
          <Row label="Telemetry" hint="CLAUDE_CODE_ENABLE_TELEMETRY">
            <Toggle on={settings.telemetry} onClick={() => onChange("telemetry", !settings.telemetry)} />
          </Row>
        </Section>

        <Section icon={Braces} title="settings.json" subtitle="Live preview of this scope">
          <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-ink p-3 font-mono text-[9.5px] leading-relaxed text-cream/85">
            {json}
          </pre>
        </Section>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-ink/6 bg-cream-2 p-3">
        <RefreshCw size={14} className="text-clay" />
        <p className="text-[11.5px] leading-relaxed text-ink-soft">
          Changes write to {settings.scope} scope and sync to the paired session immediately.
        </p>
      </div>
    </div>
  );
}

import { Check, Laptop, Pencil, Radio, RefreshCw, Shield, WifiOff } from "lucide-react";
import type { Session } from "../types";
import { EditableField } from "./EditableField";
import { cn } from "../utils/cn";

/**
 * Pair view — list of SSH sessions for the Claude Code desktop host.
 *
 * The hero card shows the active session. Each row in the list of
 * nearby sessions is tap-to-activate. The session name, host, and cwd
 * are inline-editable via a pen icon.
 *
 * When no sessions are connected, every card shows a greyed-out
 * "Unavailable" state. The reconnect button kicks off a 3-attempt
 * retry loop with a transient "Reconnecting…" indicator.
 */

type ReconnectingState = { id: string; attempt: number } | null;

export function ConnectView({
  sessions,
  connected,
  onToggle,
  onSelect,
  onPatchSession,
  onReconnect,
  reconnecting,
}: {
  sessions: Session[];
  connected: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onPatchSession: (id: string, patch: Partial<Session>) => void;
  onReconnect: (id: string) => void;
  reconnecting: ReconnectingState;
}) {
  const active = sessions.find((s) => s.active) ?? sessions[0];
  const anyConnected = sessions.some((s) => s.connected);
  const status = !anyConnected
    ? "idle"
    : connected
      ? "live"
      : "reconnecting";

  return (
    <div className="phone-scroll h-full px-4 pb-3 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
        Claude Code
      </p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight text-ink">Pair</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-stone">
        This phone is a remote for your desktop session — chat, skills, plugins, and multimodal input.
      </p>

      {/* Hero card */}
      <div
        className={cn(
          "relative mt-5 overflow-hidden rounded-3xl p-4",
          active?.connected ? "bg-ink text-cream" : "bg-cream-2 text-ink",
        )}
      >
        {!active?.connected && (
          <img
            src="/images/desk-session.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
        )}
        {active?.connected && (
          <>
            <img
              src="/images/desk-session.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
          </>
        )}
        <div className="relative">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]",
                active?.connected ? "bg-cream/10 text-cream" : "bg-ink/5 text-stone",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  !active?.connected
                    ? "bg-stone"
                    : status === "reconnecting"
                      ? "bg-clay dot-pulse"
                      : "bg-moss dot-pulse",
                )}
              />
              {!active?.connected
                ? "Unavailable"
                : status === "reconnecting"
                  ? "Reconnecting…"
                  : "Live"}
            </span>
            <span
              className={cn(
                "font-mono text-[10px]",
                active?.connected ? "text-stone" : "text-stone/70",
              )}
            >
              {active?.connected ? active.latency : "—"}
            </span>
          </div>

          {active ? (
            <>
              <div className="mt-8 flex items-center gap-2">
                <h3
                  className={cn(
                    "font-serif text-[26px] leading-tight",
                    active.connected ? "text-cream" : "text-ink",
                  )}
                >
                  <EditableField
                    value={active.name}
                    onChange={(name) => onPatchSession(active.id, { name })}
                    placeholder="session-name"
                    showPen={active.connected}
                    className={cn(active.connected ? "text-cream" : "text-ink")}
                  />
                </h3>
              </div>

              <p
                className={cn(
                  "mt-1 font-mono text-[12px]",
                  active.connected ? "text-stone" : "text-stone",
                )}
              >
                <EditableField
                  value={active.host}
                  onChange={(host) => onPatchSession(active.id, { host })}
                  placeholder="host.local"
                  showPen={active.connected}
                  monospace
                  className={active.connected ? "text-stone" : "text-stone"}
                />
              </p>

              <p
                className={cn(
                  "mt-3 font-mono text-[11px]",
                  active.connected ? "text-cream/70" : "text-stone/70",
                )}
              >
                <EditableField
                  value={active.cwd}
                  onChange={(cwd) => onPatchSession(active.id, { cwd })}
                  placeholder="~/path"
                  showPen={active.connected}
                  monospace
                  className={active.connected ? "text-cream/70" : "text-stone/70"}
                />
              </p>

              {/* Last edit */}
              {active.connected && active.lastEditPath && (
                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10.5px] text-cream/50">
                  <Pencil size={9} className="text-clay" />
                  <span className="truncate">{active.lastEditPath}</span>
                  {active.lastEditTime && (
                    <span className="ml-auto text-cream/40">{active.lastEditTime}</span>
                  )}
                </div>
              )}

              <p
                className={cn(
                  "mt-3 text-[12px]",
                  active.connected ? "text-cream/80" : "text-stone",
                )}
              >
                {active.model}
              </p>

              <button
                type="button"
                onClick={active.connected ? onToggle : () => onReconnect(active.id)}
                className={cn(
                  "press mt-5 w-full rounded-xl py-2.5 text-[13px] font-medium",
                  active.connected
                    ? "bg-clay text-cream"
                    : "border border-clay/30 bg-cream text-clay",
                )}
              >
                {active.connected ? (
                  "Disconnect"
                ) : reconnecting?.id === active.id ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw size={13} className="animate-spin" />
                    Reconnecting · {reconnecting.attempt}/3
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <WifiOff size={13} />
                    Reconnect
                  </span>
                )}
              </button>
            </>
          ) : (
            <p className="mt-8 text-[13px] text-stone">No sessions configured.</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <img
              src="/images/user-avatar.jpg"
              alt=""
              className="h-7 w-7 rounded-full object-cover ring-1 ring-white/20"
            />
            <p
              className={cn(
                "text-[12px]",
                active?.connected ? "text-cream/80" : "text-stone",
              )}
            >
              Signed in as Maya Chen
            </p>
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-[13px] font-medium text-ink">Nearby sessions</h3>
      <div className="mt-2 space-y-2">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            onSelect={() => onSelect(session.id)}
            onPatch={(patch) => onPatchSession(session.id, patch)}
            onReconnect={() => onReconnect(session.id)}
            reconnecting={reconnecting?.id === session.id ? reconnecting.attempt : null}
          />
        ))}
      </div>

      <div className="mt-5 space-y-2.5 rounded-2xl border border-ink/6 bg-cream-2 p-3.5">
        <div className="flex gap-3">
          <Radio size={16} className="mt-0.5 text-clay" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            Pairing uses your local network. The phone never holds repo secrets — tools run on the host.
          </p>
        </div>
        <div className="flex gap-3">
          <Shield size={16} className="mt-0.5 text-moss" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            Voice, photos, and files are attached to the live session the same way as desktop drops.
          </p>
        </div>
      </div>
    </div>
  );
}

function SessionRow({
  session,
  onSelect,
  onPatch,
  onReconnect,
  reconnecting,
}: {
  session: Session;
  onSelect: () => void;
  onPatch: (patch: Partial<Session>) => void;
  onReconnect: () => void;
  reconnecting: number | null;
}) {
  const online = session.connected;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
        online ? "border-ink/6 bg-cream-2" : "border-ink/4 bg-cream-2/60",
      )}
    >
      <button
        type="button"
        onClick={online ? onSelect : onReconnect}
        aria-label={online ? `Activate ${session.name}` : `Reconnect to ${session.name}`}
        className={cn(
          "press flex h-9 w-9 items-center justify-center rounded-xl",
          online ? "bg-ink text-cream" : "bg-stone/30 text-stone",
        )}
      >
        {online ? (
          <Laptop size={16} />
        ) : reconnecting !== null ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <WifiOff size={14} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "block text-[14px] font-medium",
              online ? "text-ink" : "text-stone",
            )}
          >
            <EditableField
              value={session.name}
              onChange={(name) => onPatch({ name })}
              placeholder="session-name"
              showPen={online}
            />
          </span>
          {!online && (
            <span className="rounded-full bg-stone/15 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-stone">
              Off
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10.5px] text-stone">
          <EditableField
            value={session.host}
            onChange={(host) => onPatch({ host })}
            placeholder="host.local"
            showPen={online}
            monospace
            className="text-stone"
          />
          <span>·</span>
          <span>{session.model.replace("Claude ", "")}</span>
        </div>

        <div className="mt-0.5 font-mono text-[10.5px] text-stone/70">
          <EditableField
            value={session.cwd}
            onChange={(cwd) => onPatch({ cwd })}
            placeholder="~/path"
            showPen={online}
            monospace
            className="text-stone/70"
          />
        </div>

        {online && session.lastEditPath && (
          <div className="mt-1 flex items-center gap-1 font-mono text-[9.5px] text-stone/60">
            <Pencil size={8} className="text-clay" />
            <span className="truncate">{session.lastEditPath}</span>
          </div>
        )}
      </div>

      {online && session.active && <Check size={16} className="text-clay" />}
    </div>
  );
}
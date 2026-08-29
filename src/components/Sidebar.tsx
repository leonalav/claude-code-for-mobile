import { Cable, GitBranch, MessageSquare, Puzzle, Settings2, Sparkles } from "lucide-react";
import type { Session, TabId } from "../types";
import { cn } from "../utils/cn";

const nav: { id: TabId; label: string; hint: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", hint: "Session transcript", icon: MessageSquare },
  { id: "skills", label: "Skills", hint: "/skill extensions", icon: Sparkles },
  { id: "git", label: "Source Control", hint: "Diffs · commit · graph", icon: GitBranch },
  { id: "plugins", label: "Plugins", hint: "Sliders and toggles", icon: Puzzle },
  { id: "pair", label: "Pair", hint: "Desktop sessions", icon: Cable },
  { id: "settings", label: "Settings", hint: "/config", icon: Settings2 },
];

export function Sidebar({
  current,
  onChange,
  session,
  connected,
  modelLabel,
  effort,
}: {
  current: TabId;
  onChange: (id: TabId) => void;
  session: Session;
  connected: boolean;
  modelLabel: string;
  effort: string;
}) {
  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-ink/8 bg-cream-2">
      <div className="px-4 pb-3 pt-[48px]">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/claude-mark.png"
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-1 ring-ink/8"
          />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium leading-tight text-ink">Claude Code</p>
            <p className="flex items-center gap-1.5 text-[11px] text-stone">
              <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "dot-pulse bg-moss" : "bg-stone")} />
              {connected ? "Paired" : "Idle"}
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-ink/[0.04] px-2.5 py-2">
          <p className="truncate font-mono text-[11px] text-ink">{session.name}</p>
          <p className="truncate font-mono text-[10px] text-stone">{session.host}</p>
          <p className="mt-1 flex items-center justify-between font-mono text-[10px] text-stone">
            <span className="truncate">{modelLabel}</span>
            <span className="text-clay">{effort}</span>
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5">
        {nav.map((item) => {
          const active = current === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                active ? "bg-clay/12" : "hover:bg-mist",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  active ? "bg-clay/15 text-clay" : "bg-mist text-ink-soft",
                )}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[13px] font-medium", active ? "text-ink" : "text-ink-soft")}>
                  {item.label}
                </span>
                <span className="block truncate text-[10.5px] text-stone">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-ink/6 px-4 py-3">
        <div className="flex items-center gap-2">
          <img
            src="/images/user-avatar.jpg"
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-1 ring-ink/10"
          />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-ink">Maya Chen</p>
            <p className="truncate font-mono text-[10px] text-stone">{session.cwd}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

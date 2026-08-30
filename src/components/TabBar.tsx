import { Cable, GitBranch, MessageSquare, Puzzle, Settings2, Sparkles } from "lucide-react";
import type { TabId } from "../types";
import { cn } from "../utils/cn";

const tabs: { id: TabId; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "git", label: "Git", icon: GitBranch },
  { id: "plugins", label: "Plugins", icon: Puzzle },
  { id: "pair", label: "Pair", icon: Cable },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export function TabBar({
  current,
  onChange,
}: {
  current: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <nav
      className="relative shrink-0 border-t border-ink/6 bg-cream/92 px-1 pt-1.5 backdrop-blur-xl"
      style={{
        // On iPhones with a home indicator (X, XS, 11, 12, 13, 14, 15 Pro
        // etc.) we need at least 34px of bottom padding so the tab labels
        // don't sit underneath the indicator. Older devices without one
        // report 0 here, falling back to a comfortable 18px gutter.
        paddingBottom: "max(18px, calc(env(safe-area-inset-bottom, 0px) + 6px))",
      }}
    >
      <div className="grid grid-cols-6">
        {tabs.map((tab) => {
          const active = current === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="press flex flex-col items-center gap-0.5 py-1"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  active && "bg-clay/12",
                )}
              >
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.7}
                className={active ? "text-clay" : "text-stone"}
              />
            </span>
            <span
              className={cn(
                "text-[8.5px] font-medium tracking-wide",
                active ? "text-ink" : "text-stone",
              )}
            >
              {tab.label}
            </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

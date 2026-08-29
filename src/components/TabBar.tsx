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
    <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-ink/6 bg-cream/92 px-1 pb-[18px] pt-1.5 backdrop-blur-xl">
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

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
  keyboardOpen = false,
}: {
  current: TabId;
  onChange: (id: TabId) => void;
  /** When true the TabBar slides down so the iOS keyboard (drawn as a
   *  native overlay) covers the space where it would otherwise sit. */
  keyboardOpen?: boolean;
}) {
  return (
    <nav
      className={cn(
        "relative shrink-0 border-t border-ink/6 bg-cream backdrop-blur-xl transition-transform duration-200",
        // Slide the TabBar downward off-screen when the keyboard is up so
        // the iOS keyboard (drawn as a native overlay) covers the space
        // where it would otherwise sit floating above the keyboard.
        // `pointer-events-none` while hidden prevents it from catching
        // stray taps during the keyboard's slide-in/out animation, and
        // `opacity-0` keeps the border-t from peeking out at the top of
        // the keyboard during the transition.
        keyboardOpen && "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="grid grid-cols-6 px-1 pt-0.5 pb-1.5">
        {tabs.map((tab) => {
          const active = current === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="press flex flex-col items-center gap-0.5 py-0.5"
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
      {/* Safe-area filler: without this, the WKWebView background (#141413
          in light mode, near-black in dark mode) is visible below the
          TabBar under the home indicator. This sibling shares the same
          --color-cream so the TabBar visually fills all the way to the
          bottom of the screen on every iPhone that has a home indicator.
          On devices without one it falls back to 0px and disappears. */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}

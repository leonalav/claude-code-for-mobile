import { Puzzle, Sparkles, Terminal } from "lucide-react";
import type { SlashItem } from "../types";
import { cn } from "../utils/cn";

const kindIcon = {
  skill: Sparkles,
  plugin: Puzzle,
  command: Terminal,
};

export function SlashPalette({
  items,
  query,
  onPick,
}: {
  items: SlashItem[];
  query: string;
  onPick: (item: SlashItem) => void;
}) {
  const q = query.replace(/^\//, "").toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.command.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q),
  );

  const groups: { key: SlashItem["kind"]; label: string }[] = [
    { key: "command", label: "Extensions" },
    { key: "skill", label: "Skills" },
    { key: "plugin", label: "Plugins" },
  ];

  if (!filtered.length) {
    return (
      <div className="anim-sheet absolute inset-x-3 bottom-full z-20 mb-2 overflow-hidden rounded-2xl border border-ink/8 bg-cream shadow-[0_18px_40px_-24px_rgba(20,20,19,0.45)]">
        <p className="px-4 py-3 text-[13px] text-stone">No matching /skill or /plugin</p>
      </div>
    );
  }

  return (
    <div className="anim-sheet absolute inset-x-3 bottom-full z-20 mb-2 max-h-[280px] overflow-y-auto rounded-2xl border border-ink/8 bg-cream shadow-[0_18px_40px_-24px_rgba(20,20,19,0.45)]">
      <div className="sticky top-0 flex items-center justify-between border-b border-ink/6 bg-cream px-3.5 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">
          Slash extensions
        </p>
        <p className="font-mono text-[10px] text-clay">{query || "/"}</p>
      </div>
      {groups.map((group) => {
        const rows = filtered.filter((item) => item.kind === group.key);
        if (!rows.length) return null;
        return (
          <div key={group.key} className="px-1.5 py-1.5">
            <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
              {group.label}
            </p>
            {rows.map((item) => {
              const Icon = kindIcon[item.kind];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onPick(item)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-blush"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      item.kind === "skill" && "bg-clay/12 text-clay",
                      item.kind === "plugin" && "bg-lagoon/15 text-lagoon",
                      item.kind === "command" && "bg-ink/6 text-ink-soft",
                    )}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[13px] font-medium text-ink">
                      {item.command}
                    </span>
                    <span className="block truncate text-[11px] text-stone">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

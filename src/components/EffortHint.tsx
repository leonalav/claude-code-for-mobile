import { CornerDownLeft, Gauge } from "lucide-react";
import { effortLevels, effortSyntax } from "../effort";
import { cn } from "../utils/cn";

/**
 * Shown while the user has typed `/effort` but has NOT pressed Enter.
 * Mirrors the CLI's argument hinting.
 */
export function EffortHint({
  draft,
  onPick,
}: {
  draft: string;
  onPick: (arg: string) => void;
}) {
  const typedArg = draft.replace(/^\/effort\s*/i, "").toLowerCase();
  const matches = effortLevels.filter((l) => l.arg.startsWith(typedArg));
  const exact = effortLevels.find((l) => l.arg === typedArg);

  return (
    <div className="anim-sheet absolute inset-x-3 bottom-full z-20 mb-2 max-h-[330px] overflow-y-auto rounded-2xl border border-ink/8 bg-cream shadow-[0_18px_40px_-24px_rgba(20,20,19,0.45)]">
      <div className="sticky top-0 border-b border-ink/6 bg-cream px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-clay" />
          <p className="font-mono text-[12px] font-medium text-ink">{effortSyntax.usage}</p>
        </div>
        <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-stone">
          {effortSyntax.args.join(" │ ")}
        </p>
      </div>

      <div className="px-1.5 py-1.5">
        <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
          {typedArg ? "Matching levels" : "Levels"}
        </p>
        {matches.length === 0 && (
          <p className="px-2.5 py-2 text-[12px] text-stone">
            Unknown level “{typedArg}”. Try {effortSyntax.args.slice(0, 4).join(", ")}…
          </p>
        )}
        {matches.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => onPick(level.arg)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-blush",
              exact?.id === level.id && "bg-blush",
            )}
          >
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: level.tone }}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[12.5px] font-medium text-ink">{level.arg}</span>
                <span className="text-[10px] text-stone">{level.label}</span>
                {!level.persists && (
                  <span className="rounded-full bg-clay/12 px-1.5 py-px text-[9px] font-medium text-clay">
                    session
                  </span>
                )}
              </span>
              <span className="block truncate text-[11px] text-stone">{level.blurb}</span>
            </span>
            <span className="shrink-0 font-mono text-[10px] text-stone">{level.cost}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-ink/6 px-3.5 py-2">
        <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone">
          Syntax
        </p>
        {effortSyntax.examples.map((ex) => (
          <div key={ex.cmd} className="flex items-baseline gap-2 py-[3px]">
            <code className="font-mono text-[11px] text-clay">{ex.cmd}</code>
            <span className="truncate text-[10.5px] text-stone">{ex.hint}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/6 bg-cream-2 px-3.5 py-2">
        {effortSyntax.notes.map((note) => (
          <p key={note} className="py-[2px] text-[10.5px] leading-relaxed text-ink-soft">
            · {note}
          </p>
        ))}
        <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-stone">
          <CornerDownLeft size={11} />
          Press Enter with no argument to open the slider
        </p>
      </div>
    </div>
  );
}

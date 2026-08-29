import { Coins, FileCode2, Gauge } from "lucide-react";
import type { GitFile, Session } from "../types";
import { cn } from "../utils/cn";

export function TabletRail({
  session,
  modelLabel,
  effort,
  tokens,
  files,
  onOpenGit,
}: {
  session: Session;
  modelLabel: string;
  effort: string;
  tokens: number;
  files: GitFile[];
  onOpenGit: () => void;
}) {
  const pct = Math.min(100, (tokens / 200_000) * 100);
  const dirty = files.slice(0, 6);

  return (
    <aside className="phone-scroll flex h-full w-[280px] shrink-0 flex-col border-l border-ink/8 bg-cream-2">
      <div className="px-4 pb-3 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">Inspector</p>
        <h3 className="mt-1 font-serif text-[22px] leading-tight text-ink">Session</h3>
        <dl className="mt-3 space-y-2 text-[12px]">
          <div className="flex justify-between gap-2">
            <dt className="text-stone">Repo</dt>
            <dd className="truncate font-mono text-ink">{session.name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-stone">Model</dt>
            <dd className="truncate font-mono text-ink">{modelLabel}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-stone">Effort</dt>
            <dd className="flex items-center gap-1 font-mono text-clay">
              <Gauge size={11} />
              {effort}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-ink/6 px-4 py-3">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
          <Coins size={11} className="text-clay" /> Context
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-mist">
          <div className="h-full rounded-full bg-clay" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 font-mono text-[10.5px] text-stone">
          {tokens.toLocaleString()} / 200k · {pct.toFixed(1)}%
        </p>
      </div>

      <div className="flex-1 border-t border-ink/6 px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">Working tree</p>
          <button type="button" onClick={onOpenGit} className="text-[10.5px] font-medium text-clay">
            Open Git
          </button>
        </div>
        {dirty.length === 0 ? (
          <p className="px-1 text-[12px] text-stone">Working tree clean.</p>
        ) : (
          <div className="space-y-0.5">
            {dirty.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={onOpenGit}
                className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left hover:bg-mist"
              >
                <FileCode2 size={12} className="shrink-0 text-stone" />
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-soft">
                  {file.path.split("/").pop()}
                </span>
                <span
                  className={cn(
                    "font-mono text-[9px]",
                    file.status === "A" || file.status === "U" ? "text-moss" : "text-lagoon",
                  )}
                >
                  {file.status}
                </span>
                <span className="font-mono text-[9px]" style={{ color: "var(--add)" }}>
                  +{file.added}
                </span>
                <span className="font-mono text-[9px]" style={{ color: "var(--del)" }}>
                  −{file.removed}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

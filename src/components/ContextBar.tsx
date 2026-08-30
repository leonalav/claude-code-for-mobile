import { Coins } from "lucide-react";
import { cn } from "../utils/cn";

const CONTEXT_WINDOW = 200_000;

export function ContextBar({
  tokens,
  autoCompactWindow,
}: {
  tokens: number;
  autoCompactWindow: number;
}) {
  const pct = Math.min(100, (tokens / CONTEXT_WINDOW) * 100);
  const nearCompact = pct >= autoCompactWindow;

  return (
    <div className="flex items-center gap-2 border-b border-ink/6 bg-cream-2/60 px-4 py-1">
      <Coins size={11} className="shrink-0 text-clay" />
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-mist">
        <div
          className={cn("h-full rounded-full transition-all duration-500", nearCompact ? "bg-clay-deep" : "bg-clay")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="shrink-0 font-mono text-[9.5px] text-stone">
        {tokens.toLocaleString()} / {(CONTEXT_WINDOW / 1000).toFixed(0)}k tok
      </p>
    </div>
  );
}

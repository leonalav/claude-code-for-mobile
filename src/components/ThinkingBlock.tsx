import { useState } from "react";
import { Brain, ChevronDown } from "lucide-react";
import type { ThinkingTrace } from "../types";
import { cn } from "../utils/cn";

export function ThinkingBlock({ traces }: { traces: ThinkingTrace[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const totalMs = traces.reduce((s, t) => s + t.durationMs, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-ink/8 bg-cream-2">
      <div className="flex items-center gap-2 border-b border-ink/6 px-3 py-2">
        <Brain size={13} className="text-lagoon" />
        <span className="text-[11px] font-medium text-ink">Extended thinking</span>
        <span className="ml-auto font-mono text-[10px] text-stone">
          {(totalMs / 1000).toFixed(1)}s
        </span>
      </div>
      {traces.map((trace) => {
        const open = openId === trace.id;
        return (
          <div key={trace.id} className="border-b border-ink/5 last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : trace.id)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
            >
              <span className="h-1 w-1 rounded-full bg-lagoon/70" />
              <span className="min-w-0 flex-1 truncate text-[11px] text-ink-soft">
                {trace.label}
              </span>
              <span className="shrink-0 font-mono text-[9px] text-stone">
                {(trace.durationMs / 1000).toFixed(1)}s
              </span>
              <ChevronDown
                size={11}
                className={cn(
                  "shrink-0 text-stone transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
            {open && (
              <div className="border-t border-ink/5 bg-ink/[0.03] px-3 py-2">
                <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-ink-soft">
                  {trace.content}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

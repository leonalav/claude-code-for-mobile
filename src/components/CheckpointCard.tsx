import { useState } from "react";
import { Check, CornerDownLeft, RotateCcw, Type } from "lucide-react";
import type { Checkpoint } from "../types";
import { cn } from "../utils/cn";

export function CheckpointCard({
  checkpoints,
  onRestore,
}: {
  checkpoints: Checkpoint[];
  onRestore: (cp: Checkpoint) => void;
}) {
  const restoringId = useState<string | null>(null)[0];
  const [doneId, setDoneId] = useState<string | null>(null);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-ink/8 bg-cream-2">
      <div className="flex items-center gap-2 border-b border-ink/6 bg-gradient-to-r from-clay/10 to-cream-2 px-3 py-2.5">
        <RotateCcw size={13} className="text-clay" />
        <span className="text-[12.5px] font-medium text-ink">Rewind checkpoints</span>
        <span className="ml-auto rounded-full bg-mist px-2 py-0.5 font-mono text-[9px] text-stone">
          {checkpoints.length}
        </span>
      </div>
      {checkpoints.map((cp) => {
        const done = doneId === cp.id;
        return (
          <div key={cp.id} className="flex items-center gap-2 border-b border-ink/5 px-3 py-2 last:border-b-0">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                done ? "bg-moss/15 text-moss" : "bg-clay/12 text-clay",
              )}
            >
              {done ? <Check size={12} /> : <RotateCcw size={11} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-[12px] font-medium text-ink">{cp.label}</span>
                <span className="shrink-0 font-mono text-[9px] text-stone">{cp.time}</span>
              </div>
              <p className="truncate text-[10px] text-stone">{cp.description}</p>
            </div>
            <span className="shrink-0">
              {cp.scope === "both" ? (
                <Type size={11} className="text-stone" />
              ) : cp.scope === "code" ? (
                <RotateCcw size={11} className="text-stone" />
              ) : (
                <CornerDownLeft size={11} className="text-stone" />
              )}
            </span>
            <button
              type="button"
              disabled={done || restoringId === cp.id}
              onClick={() => {
                onRestore(cp);
                setDoneId(cp.id);
              }}
              className={cn(
                "press shrink-0 rounded-lg px-2.5 py-1 text-[10.5px] font-medium",
                done ? "bg-moss/15 text-moss" : "bg-ink text-cream",
              )}
            >
              {done ? "Restored" : "Restore"}
            </button>
          </div>
        );
      })}
      <p className="px-3 py-1.5 text-[9.5px] text-stone">
        Checkpoints are auto-saved per turn. They restore code, conversation, or both without touching git.
      </p>
    </div>
  );
}

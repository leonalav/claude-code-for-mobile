import { Gauge, Zap } from "lucide-react";
import type { EffortLevel } from "../effort";
import { effortIndex, effortLevels } from "../effort";
import { cn } from "../utils/cn";

/**
 * The small interactive slider spawned in-chat by entering `/effort`.
 * Stops: low · medium · high · xhigh · max · auto · ultracode
 */
export function EffortSlider({
  value,
  onChange,
}: {
  value: EffortLevel;
  onChange: (level: EffortLevel) => void;
}) {
  const idx = effortIndex(value);
  const meta = effortLevels[idx];
  const last = effortLevels.length - 1;
  const pct = (idx / last) * 100;

  return (
    <div className="w-full rounded-2xl border border-ink/8 bg-cream-2 p-3.5">
      <div className="flex items-center gap-2">
        <Gauge size={14} className="text-clay" />
        <p className="font-mono text-[12px] font-medium text-ink">/effort</p>
        <span className="ml-auto rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-cream">
          {meta.arg}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-stone">
        <span className="flex items-center gap-1">
          <Zap size={9} /> Faster
        </span>
        <span>Smarter</span>
      </div>

      <div className="relative mt-1.5">
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={idx}
          onChange={(e) => onChange(effortLevels[Number(e.target.value)].id)}
          className="slider-clay relative z-10"
          style={{
            background: `linear-gradient(to right, ${meta.tone} 0%, ${meta.tone} ${pct}%, #e8e6dc ${pct}%, #e8e6dc 100%)`,
          }}
          aria-label="Effort level"
        />
        <div className="pointer-events-none absolute inset-x-[10px] top-[1px] flex justify-between">
          {effortLevels.map((l, i) => (
            <span
              key={l.id}
              className={cn(
                "h-[2px] w-[2px] rounded-full",
                i <= idx ? "bg-cream/70" : "bg-stone/70",
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-between gap-0.5">
        {effortLevels.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            className={cn(
              "flex-1 rounded-md py-1 text-[8.5px] font-medium leading-tight transition-colors",
              i === idx ? "bg-ink text-cream" : "text-stone hover:bg-mist",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-cream p-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12.5px] font-medium text-ink">
            {meta.label}
            <span className="ml-1.5 font-mono text-[10px] text-stone">{meta.arg}</span>
          </p>
          <p className="font-mono text-[10px] text-stone">{meta.cost}</p>
        </div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{meta.blurb}</p>
        <p className="mt-1.5 text-[10px] text-stone">
          {meta.persists
            ? "Persists · writes effortLevel to settings.json"
            : "Current session only · not saved to settings.json"}
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, Puzzle } from "lucide-react";
import type { Plugin } from "../types";
import { cn } from "../utils/cn";

function SliderRow({
  label,
  value,
  min,
  max,
  suffix,
  color,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  color: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="pt-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[12px] text-ink-soft">{label}</span>
        <span className="font-mono text-[11px] text-ink">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-clay"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e8e6dc ${pct}%, #e8e6dc 100%)`,
        }}
      />
    </div>
  );
}

export function PluginsView({
  plugins,
  onToggle,
  onSlide,
  onInvoke,
}: {
  plugins: Plugin[];
  onToggle: (id: string) => void;
  onSlide: (pluginId: string, sliderId: string, value: number) => void;
  onInvoke: (plugin: Plugin) => void;
}) {
  const [openId, setOpenId] = useState<string>("code-review");

  return (
    <div className="phone-scroll h-full px-4 pb-3 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
        /plugin extensions
      </p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight text-ink">Plugins</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-stone">
        Tune behavior with sliders. Changes sync to the desktop Claude Code session.
      </p>

      <div className="mt-4 space-y-2.5">
        {plugins.map((plugin, i) => {
          const open = openId === plugin.id;
          return (
            <div
              key={plugin.id}
              className="anim-rise overflow-hidden rounded-2xl border border-ink/6 bg-cream-2"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3 p-3.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setOpenId(open ? "" : plugin.id)}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${plugin.color}22`, color: plugin.color }}
                  >
                    <Puzzle size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-ink">{plugin.name}</span>
                      {plugin.official && (
                        <span className="rounded-full bg-ink/6 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-ink-soft">
                          Official
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-stone">{plugin.tagline}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
                  />
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={plugin.enabled}
                  onClick={() => onToggle(plugin.id)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    plugin.enabled ? "bg-clay" : "bg-mist",
                  )}
                >
                  <span
                    className={cn(
                      // The thumb is a small circle that sits on top of the
                      // track. In dark mode bg-cream flips to a dark color
                      // so the thumb remains visible against the lighter
                      // track.
                      "absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow-sm transition-transform",
                      plugin.enabled ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>

              {open && (
                <div className="border-t border-ink/6 px-3.5 pb-4 pt-1">
                  {plugin.sliders.map((slider) => (
                    <SliderRow
                      key={slider.id}
                      label={slider.label}
                      value={slider.value}
                      min={slider.min}
                      max={slider.max}
                      suffix={slider.suffix}
                      color={plugin.color}
                      onChange={(v) => onSlide(plugin.id, slider.id, v)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => onInvoke(plugin)}
                    className="press mt-4 w-full rounded-xl bg-ink py-2.5 text-[13px] font-medium text-cream"
                  >
                    Run /plugin {plugin.id}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

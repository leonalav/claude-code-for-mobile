import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";

export function VoiceOverlay({
  onCancel,
  onSend,
}: {
  onCancel: () => void;
  onSend: (seconds: number, transcript: string) => void;
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-ink/50">
      <div className="anim-sheet rounded-t-[28px] bg-ink px-5 pb-10 pt-5 text-cream">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/15" />
        <p className="text-center font-serif text-[22px] italic text-cream">Listening</p>
        <p className="mt-1 text-center font-mono text-[12px] text-stone">
          Transcribing for Claude Code
        </p>
        <div className="relative mx-auto mt-6 flex h-28 w-28 items-center justify-center">
          <span className="ring-pulse absolute inset-0 rounded-full border border-clay/70" />
          <span
            className="ring-pulse absolute inset-0 rounded-full border border-clay/40"
            style={{ animationDelay: "0.5s" }}
          />
          <div className="flex h-20 w-20 items-end justify-center gap-1 rounded-full bg-clay/20 pb-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="wave-bar w-[3px] rounded-full bg-clay"
                style={{
                  height: `${10 + (i % 4) * 8}px`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[20px] tracking-[0.18em] text-cream">
          {mm}:{ss}
        </p>
        <p
          className="mx-auto mt-3 max-w-[240px] text-center text-[13px] leading-relaxed text-stone"
          style={{ fontFamily: "var(--font-body)" }}
        >
          “The login buttons still overlap on SE. Stack them and keep the ghost style.”
        </p>
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={onCancel}
            className="press flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
            aria-label="Discard"
          >
            <Trash2 size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                Math.max(seconds, 4),
                "The login buttons still overlap on SE. Stack them and keep the ghost style.",
              )
            }
            className="press flex h-14 w-14 items-center justify-center rounded-full bg-clay text-cream"
            aria-label="Send voice"
          >
            <Check size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

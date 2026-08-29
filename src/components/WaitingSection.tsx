import { useEffect, useState } from "react";
import { SPINNER_GLYPHS, SPINNER_TIPS, SPINNER_VERBS, pickRandom } from "../spinner";

/**
 * Animated spinner matching the Claude Code CLI:
 *   · Choreographing... (2s)
 *   ⌐ Tip: Use /statusline to set up a custom status line…
 */
export function WaitingSection({
  totalMs,
  label,
}: {
  totalMs: number;
  label?: string;
}) {
  const [verb] = useState(() => label ?? pickRandom(SPINNER_VERBS));
  const [tip] = useState(() => pickRandom(SPINNER_TIPS));
  const [glyphIdx, setGlyphIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const glyphId = window.setInterval(
      () => setGlyphIdx((g) => (g + 1) % SPINNER_GLYPHS.length),
      120,
    );
    const tick = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      window.clearInterval(glyphId);
      window.clearInterval(tick);
    };
  }, []);

  return (
    <div className="anim-rise space-y-1.5">
      <p
        className="font-mono text-[12.5px]"
        style={{ color: "var(--color-clay)" }}
      >
        <span className="mr-1.5 inline-block w-3 text-center">{SPINNER_GLYPHS[glyphIdx]}</span>
        {verb}… ({elapsed}s)
      </p>
      <p
        className="font-mono text-[11.5px] leading-relaxed pl-5"
        style={{ color: "var(--color-stone)" }}
      >
        ⌐ Tip: {tip}
      </p>
      <div className="pl-5">
        <p
          className="font-mono text-[9.5px]"
          style={{ color: "var(--color-stone)" }}
        >
          {Math.round((elapsed * 1000) / totalMs)}% of typical turn
        </p>
      </div>
    </div>
  );
}

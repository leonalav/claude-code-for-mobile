import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { DiffLine, GitFile } from "../types";

function Line({ line }: { line: DiffLine }) {
  return (
    <div
      className="flex min-h-[16px] leading-[1.35]"
      style={
        line.type === "add"
          ? { background: "var(--add-bg)" }
          : line.type === "del"
            ? { background: "var(--del-bg)" }
            : undefined
      }
    >
      <span
        className="w-[15px] shrink-0 select-none text-right font-mono text-[9px]"
        style={{
          color:
            line.type === "add"
              ? "var(--add-gutter)"
              : line.type === "del"
                ? "var(--del-gutter)"
                : "var(--color-stone)",
        }}
      >
        {line.type === "add" ? "+" : line.type === "del" ? "−" : " "}
      </span>
      <span
        className="w-[24px] shrink-0 select-none overflow-hidden whitespace-nowrap text-right font-mono text-[9px]"
        style={{ color: "var(--color-stone)", opacity: 0.75 }}
      >
        {line.oldNo ?? ""}
      </span>
      <span
        className="w-[24px] shrink-0 select-none overflow-hidden whitespace-nowrap text-right font-mono text-[9px]"
        style={{ color: "var(--color-stone)", opacity: 0.75 }}
      >
        {line.newNo ?? ""}
      </span>
      <span
        className="min-w-0 flex-1 whitespace-pre-wrap break-all px-1.5 font-mono text-[10.5px]"
        style={{
          color:
            line.type === "add"
              ? "var(--add)"
              : line.type === "del"
                ? "var(--del)"
                : "var(--color-ink-soft)",
        }}
      >
        {line.text}
      </span>
    </div>
  );
}

export function DiffView({
  file,
  defaultOpen = false,
}: {
  file: GitFile;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const fileBg =
    file.status === "A"
      ? "var(--add-gutter)"
      : file.status === "U"
        ? "var(--color-stone)"
        : file.status === "D"
          ? "var(--del-gutter)"
          : "var(--blame-h)";

  return (
    <div className="overflow-hidden rounded-lg border border-ink/8">
      {/* File header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 bg-cream px-2.5 py-2 text-left"
      >
        <span
          className="w-4 text-center font-mono text-[10px] font-semibold"
          style={{ color: file.status === "U" ? "var(--color-stone)" : fileBg }}
        >
          {file.status}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-soft">
          {file.path}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[9.5px]">
          <span style={{ color: "var(--add)" }}>+{file.added}</span>
          <span style={{ color: "var(--del)" }}>−{file.removed}</span>
        </span>
        {open ? (
          <ChevronUp size={12} className="shrink-0 text-stone" />
        ) : (
          <ChevronDown size={12} className="shrink-0 text-stone" />
        )}
      </button>

      {open && (
        <div className="border-t border-ink/6 bg-cream-2">
          {file.hunks.map((hunk, i) => (
            <div key={i}>
              <div
                className="flex items-center gap-2 border-y border-ink/5 px-2.5 py-1 font-mono text-[9px]"
                style={{
                  background: "color-mix(in srgb, var(--blame-h) 12%, transparent)",
                  color: "var(--color-stone)",
                }}
              >
                <span className="truncate font-medium">{hunk.header}</span>
              </div>
              <div className="py-1">
                {hunk.lines.map((line, j) => (
                  <Line key={j} line={line} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

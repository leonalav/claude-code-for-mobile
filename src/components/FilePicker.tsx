import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { iconComponentForFile } from "./FileIcons";
import { cn } from "../utils/cn";

export type FileEntry = { path: string; name: string; kind?: string };

/**
 * Vertical popover that lists files for @-mentioning. Triggered by typing
 * "@" anywhere in the composer draft. Up/down arrows navigate, Enter
 * selects, Esc dismisses.
 */
export function FilePicker({
  files,
  onPick,
  onClose,
  anchor,
}: {
  files: FileEntry[];
  onPick: (file: FileEntry) => void;
  onClose: () => void;
  /** Optional cursor-coordinates inside the composer (px) to anchor near. */
  anchor?: { x: number; y: number };
}) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the search box so the user can immediately narrow results.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return files;
    const q = query.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q),
    );
  }, [files, query]);

  // Keep highlight within bounds when filtering.
  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered, highlight]);

  // Scroll highlighted item into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-index="${highlight}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const f = filtered[highlight];
      if (f) onPick(f);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="anim-rise absolute left-3 right-3 bottom-[64px] z-40 max-h-[260px] overflow-hidden rounded-2xl border border-ink/15 bg-cream/95 shadow-2xl backdrop-blur"
      style={anchor ? { left: anchor.x, top: anchor.y } : undefined}
      onKeyDown={onKey}
    >
      <div className="flex items-center gap-2 border-b border-ink/10 px-3 py-2">
        <Search size={13} className="text-stone" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files…"
          className="flex-1 bg-transparent text-[12.5px] text-ink placeholder:text-stone/60 focus:outline-none"
        />
        <span className="text-[10px] text-stone">{filtered.length} files</span>
      </div>
      <div ref={listRef} className="max-h-[210px] overflow-y-auto py-1">
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-[11.5px] text-stone">
            No matches.
          </div>
        )}
        {filtered.map((f, i) => {
          const Icon = iconComponentForFile(f.name);
          return (
            <button
              key={f.path}
              type="button"
              data-index={i}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => onPick(f)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors",
                i === highlight ? "bg-clay/12" : "hover:bg-blush",
              )}
            >
              <Icon size={16} className="text-stone" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">
                {f.name}
              </span>
              <span className="ml-2 truncate font-mono text-[10.5px] text-stone">
                {f.path}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Read the current draft and return the partial file-name query the user
 * is typing after the most recent "@" symbol. Returns null if no @ is
 * active. Used to drive the FilePicker open/close + initial query.
 */
export function readAtQuery(draft: string): string | null {
  // Find the rightmost "@" that is at start of string or preceded by whitespace.
  let i = draft.length - 1;
  while (i >= 0) {
    const ch = draft[i];
    if (ch === "@") {
      // Check the previous char: if it's a letter or digit, treat this @
      // as part of an email or already-selected token and skip.
      const prev = i > 0 ? draft[i - 1] : " ";
      if (/[A-Za-z0-9_]/.test(prev)) {
        i--;
        continue;
      }
      return draft.slice(i + 1);
    }
    if (/\s/.test(ch ?? "")) {
      // Hit whitespace without finding @ → no active mention.
      return null;
    }
    i--;
  }
  return null;
}
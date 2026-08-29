import { ArrowUp, Mic, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SlashItem } from "../types";
import { EffortHint } from "./EffortHint";
import { FilePicker, readAtQuery, type FileEntry } from "./FilePicker";
import { FileMentionPill } from "./FileMentionPill";
import { SlashPalette } from "./SlashPalette";
import { cn } from "../utils/cn";

export type Mention = { id: string; name: string; path: string };

/**
 * Composer text-area + slash palette + @ file mention picker.
 *
 * Mentions are stored as plain-text tokens of the form `@<path>` so they
 * round-trip cleanly into the message body, while the textarea shows a
 * compact `@filename` rendering. Selecting a file from the picker
 * inserts the token at the active cursor position.
 */
export function Composer({
  value,
  onChange,
  onSend,
  onMic,
  onPlus,
  slashItems,
  onSlashPick,
  files,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onMic: () => void;
  onPlus: () => void;
  slashItems: SlashItem[];
  onSlashPick: (item: SlashItem) => void;
  files: FileEntry[];
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [atIndex, setAtIndex] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  // `/effort` typed but not submitted -> show syntax hints instead of the palette.
  const showEffortHint = /^\/effort(\s.*)?$/i.test(value);
  const showSlash = value.startsWith("/") && !showEffortHint;

  // Open/close the @ picker based on whether the user is currently typing
  // an active mention query.
  useEffect(() => {
    const q = readAtQuery(value);
    if (q === null) {
      setPickerOpen(false);
      return;
    }
    // Find the @ position that readAtQuery corresponds to.
    const idx = value.lastIndexOf("@");
    setAtIndex(idx);
    setPickerQuery(q);
    setPickerOpen(true);
  }, [value]);

  const insertMention = (file: FileEntry) => {
    if (atIndex === null) return;
    const before = value.slice(0, atIndex);
    const after = value.slice(atIndex + 1 + pickerQuery.length);
    const token = `@${file.path}`;
    const next = before + token + " " + after;
    onChange(next);
    setPickerOpen(false);
    setAtIndex(null);
    setPickerQuery("");
    // Re-focus the textarea so the user keeps typing.
    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      const pos = (before + token + " ").length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const onSendWrapped = () => {
    setPickerOpen(false);
    onSend();
  };

  const canSend = value.trim().length > 0;

  return (
    <div className="relative px-3 pb-1 pt-2">
      {showEffortHint && (
        <EffortHint draft={value} onPick={(arg) => onChange(`/effort ${arg}`)} />
      )}
      {showSlash && (
        <SlashPalette items={slashItems} query={value} onPick={onSlashPick} />
      )}
      {pickerOpen && (
        <FilePicker
          files={files}
          onPick={insertMention}
          onClose={() => {
            setPickerOpen(false);
            setAtIndex(null);
            setPickerQuery("");
          }}
          anchor={{ x: 12, y: -270 }}
        />
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={onPlus}
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-ink"
          aria-label="Add attachment"
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>
        <div className="flex min-h-10 flex-1 flex-wrap items-end gap-1.5 rounded-[22px] bg-mist px-3.5 py-2">
          {/* Inline pill row — rendered above the textarea while focused
              so the user can see which files they've attached. */}
          {focused && <PillRow value={value} />}
          <textarea
            ref={taRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 100)}
            onKeyDown={(e) => {
              if (pickerOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape")) {
                // Let the picker own these keys.
                return;
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSendWrapped();
              }
            }}
            placeholder="Message Claude Code — type @ to mention a file"
            className="max-h-24 min-w-[120px] flex-1 resize-none bg-transparent text-[14.5px] leading-5 text-ink outline-none placeholder:text-stone"
          />
        </div>
        <button
          type="button"
          onClick={canSend ? onSendWrapped : onMic}
          className={cn(
            "press flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            canSend ? "bg-clay text-cream" : "bg-ink text-cream",
          )}
          aria-label={canSend ? "Send" : "Voice message"}
        >
          {canSend ? <ArrowUp size={18} strokeWidth={2.4} /> : <Mic size={16} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Inline pill row that appears above the textarea while focused.
 * Each pill corresponds to one `@<path>` token currently in the draft.
 */
function PillRow({ value }: { value: string }) {
  const matches = Array.from(value.matchAll(/@[^\s]+/g));
  if (matches.length === 0) return null;
  return (
    <div className="flex w-full flex-wrap items-center gap-1.5 pb-1">
      {matches.map((m, i) => {
        const token = m[0];
        // token starts with "@"; strip it to get the path.
        const path = token.slice(1);
        return <FileMentionPill key={`${token}-${i}`} path={path} dense />;
      })}
    </div>
  );
}

import { Pencil, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

/**
 * Inline-editable text field with a pen icon on hover. Tapping the
 * pen converts the label into a text input; tapping ✓ or pressing Enter
 * commits; tapping ✗ or pressing Esc cancels.
 *
 * Used in ConnectView to let users edit session name, host, and cwd.
 */
export function EditableField({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  showPen = true,
  monospace = false,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showPen?: boolean;
  monospace?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== value) onChange(next);
    else setDraft(value);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          onBlur={commit}
          className={cn(
            "min-w-0 flex-1 bg-cream/10 px-1.5 py-0.5 text-[12px] text-cream outline-none ring-1 ring-cream/30 focus:ring-cream/60",
            monospace && "font-mono",
            inputClassName,
          )}
        />
        <button
          type="button"
          onClick={commit}
          aria-label="Confirm"
          className="press flex h-4 w-4 items-center justify-center rounded-full bg-moss/30 text-moss"
        >
          <Check size={9} strokeWidth={3} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault() /* don't blur */}
          onClick={cancel}
          aria-label="Cancel"
          className="press flex h-4 w-4 items-center justify-center rounded-full bg-cream/10 text-stone"
        >
          <X size={9} strokeWidth={3} />
        </button>
      </span>
    );
  }

  return (
    <span className={cn("group inline-flex items-center gap-1.5", className)}>
      <span className={cn(monospace && "font-mono")}>{value || placeholder}</span>
      {showPen && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${value}`}
          className="press flex h-3.5 w-3.5 items-center justify-center rounded-full text-cream/40 opacity-0 transition-opacity hover:bg-cream/10 hover:text-cream group-hover:opacity-100"
        >
          <Pencil size={9} strokeWidth={2.4} />
        </button>
      )}
    </span>
  );
}
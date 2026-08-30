import { FileText } from "lucide-react";
import { FileIcons, iconComponentForFile } from "./FileIcons";
import { cn } from "../utils/cn";

/**
 * Inline chip representing a single @-file mention inside the composer
 * draft. Shown as a navy pill with the language icon and the truncated
 * filename.
 */
export function FileMentionPill({
  path,
  className,
  onRemove,
  dense = false,
}: {
  path: string;
  className?: string;
  onRemove?: () => void;
  dense?: boolean;
}) {
  const name = path.split("/").pop() ?? path;
  const Icon = iconComponentForFile(name);
  const Folder = FileIcons.folder;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 align-middle",
        dense ? "h-[18px] rounded-md px-1.5 text-[10.5px]" : "h-[22px] rounded-md px-1.5 text-[12px]",
        // Theme-aware: ink-soft is dark in light mode, light in dark mode.
        "bg-ink-soft/12 text-ink border border-ink/15",
        className,
      )}
    >
      <span className="flex h-[14px] w-[14px] items-center justify-center text-clay">
        <Folder size={12} />
      </span>
      <Icon size={12} />
      <span className="max-w-[120px] truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove file mention"
          className="press -mr-0.5 ml-0.5 flex h-3 w-3 items-center justify-center rounded-full text-stone hover:bg-ink/10 hover:text-ink"
        >
          ×
        </button>
      )}
    </span>
  );
}

/**
 * Plain-text fallback chip when only a string label is available
 * (e.g. when reading a draft from props without a resolved path).
 */
export function FileMentionPillPlain({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <FileText size={12} className="text-stone" />
      <span className="font-medium text-ink-soft">@{label}</span>
    </span>
  );
}
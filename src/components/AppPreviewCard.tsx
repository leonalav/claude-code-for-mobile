import { useState } from "react";
import {
  ExternalLink,
  Loader2,
  MonitorSmartphone,
  PlayCircle,
  X,
} from "lucide-react";
import type { AppPreview } from "../types";
import { cn } from "../utils/cn";

const statusTone: Record<NonNullable<AppPreview["status"]>, string> = {
  starting: "bg-clay/12 text-clay",
  ready: "bg-moss/15 text-moss",
  error: "bg-clay-deep/15 text-clay-deep",
};

const statusLabel: Record<NonNullable<AppPreview["status"]>, string> = {
  starting: "Starting",
  ready: "Ready",
  error: "Error",
};

export function AppPreviewCard({
  preview,
  onClose,
  onOpenPreview,
}: {
  preview: AppPreview;
  onClose?: () => void;
  onOpenPreview?: () => void;
}) {
  const [isLandscape, setIsLandscape] = useState(true);
  const status = preview.status ?? "ready";

  const handleOpen = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onOpenPreview) {
      e.preventDefault();
      onOpenPreview();
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/8 bg-cream-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/6 px-3 py-2">
        <div className="flex items-center gap-2">
          <MonitorSmartphone size={13} className="text-lagoon" />
          <span className="text-[11px] font-medium text-ink">App Preview</span>
          <span className="rounded-full bg-lagoon/12 px-1.5 py-px text-[9px] font-semibold uppercase text-lagoon">
            {preview.type}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-px text-[9px] font-semibold uppercase",
              statusTone[status],
            )}
          >
            {statusLabel[status]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsLandscape((v) => !v)}
            className="press rounded-md bg-mist px-2 py-1 text-[10px] font-medium text-ink-soft"
          >
            {isLandscape ? "Portrait" : "Landscape"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="press flex h-6 w-6 items-center justify-center rounded-md bg-mist text-stone"
              aria-label="Close preview"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Preview frame */}
      <div className="bg-ink/[0.04] p-3">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-ink/10 bg-cream shadow-[0_2px_12px_-4px_rgba(20,20,19,0.15)]",
            isLandscape ? "aspect-video" : "aspect-[9/16]",
          )}
        >
          {preview.screenshot ? (
            <img
              src={preview.screenshot}
              alt={preview.title}
              className="h-full w-full object-cover"
            />
          ) : status === "starting" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-stone">
              <Loader2 size={20} className="animate-spin text-clay" />
              <p className="text-[11px]">Starting dev server...</p>
              {preview.command && (
                <p className="font-mono text-[9.5px] text-stone/70">
                  {preview.command}
                </p>
              )}
            </div>
          ) : status === "error" ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-stone">
              <X size={20} className="text-clay-deep" />
              <p className="text-[11px]">Failed to start</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-stone">
              <PlayCircle size={20} className="text-clay" />
              <p className="text-[11px]">Tap to open</p>
              <p className="font-mono text-[9.5px] text-stone/70">{preview.url}</p>
            </div>
          )}

          {/* Tap = Click indicator overlay */}
          {status === "ready" && (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-2">
              <div className="rounded-full bg-ink/70 px-2.5 py-1 backdrop-blur-sm">
                <p className="text-[9px] font-medium text-cream">
                  Tap = Click
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info & actions */}
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-ink">
              {preview.title}
            </p>
            {preview.description && (
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-stone">
                {preview.description}
              </p>
            )}
            <p className="mt-1 truncate font-mono text-[9.5px] text-stone">
              {preview.url}
            </p>
          </div>
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpen}
            className="press flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[10.5px] font-medium text-cream"
          >
            Open
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

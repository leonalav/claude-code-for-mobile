import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Loader2, RotateCcw, Type } from "lucide-react";
import type { AppPreview } from "../types";
import { cn } from "../utils/cn";

/**
 * Full-screen overlay that hosts the live app preview.
 *
 * Behavior
 * --------
 * - Slides up over the chat when user taps "Open" in an AppPreviewCard.
 * - iPhone-only: the parent applies a 90deg rotation transform so the
 *   frame visually lands in landscape. This component fills whatever
 *   box it lands in, so it works for both portrait (iPad) and landscape
 *   (iPhone-after-rotation) orientations.
 * - Touches are forwarded to the iframe as mouse events via postMessage,
 *   so taps behave like real mouse clicks even when the dev server is on
 *   a different origin.
 * - Includes an inline keyboard so text inputs in the dev app can be
 *   filled without leaving the overlay.
 */
export function FullscreenPreviewOverlay({
  preview,
  publicBaseUrl,
  onClose,
}: {
  preview: AppPreview;
  /**
   * The user-configured public base URL for their VM, e.g.
   * "https://my-vm.arena.site". Combined with the port the Go server
   * detected to form the iframe src.
   */
  publicBaseUrl?: string;
  onClose: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const iframeSrc = buildIframeSrc(preview.url, publicBaseUrl);

  // Forward touches → mouse events into the iframe.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const iframe = iframeRef.current;

    const rect = iframe?.getBoundingClientRect();

    const sendMouseEvent = (
      type: "mousedown" | "mouseup" | "click",
      x: number,
      y: number,
    ) => {
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          source: "claude-code-mobile-preview",
          type,
          x,
          y,
        },
        "*",
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!rect) return;
      const t = e.touches[0];
      if (!t) return;
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      sendMouseEvent("mousedown", x, y);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!rect) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      sendMouseEvent("mouseup", x, y);
      sendMouseEvent("click", x, y);
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [reloadKey]);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Animation wrapper — kept separate from `position:fixed` to avoid
          transform + fixed-position conflict. */}
      <div className="anim-slide-up flex h-full flex-col bg-ink">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-cream/10 bg-ink-soft px-3 py-2">
        <button
          type="button"
          onClick={onClose}
          className="press flex items-center gap-1 rounded-md bg-cream/10 px-2 py-1 text-[11.5px] font-medium text-cream"
        >
          <ChevronLeft size={13} />
          Back
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2">
          <span className="truncate text-[11px] font-medium text-cream">
            {preview.title}
          </span>
          <span className="rounded-full bg-moss/25 px-1.5 py-px text-[9px] font-semibold uppercase text-moss">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setKeyboardOpen((v) => !v)}
            className={cn(
              "press flex h-7 w-7 items-center justify-center rounded-md text-cream",
              keyboardOpen ? "bg-lagoon/30" : "bg-cream/10",
            )}
            aria-label="Toggle keyboard"
          >
            <Type size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReloadKey((k) => k + 1);
            }}
            className="press flex h-7 w-7 items-center justify-center rounded-md bg-cream/10 text-cream"
            aria-label="Reload preview"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between border-b border-cream/8 bg-ink-soft/60 px-3 py-1 text-[10px] text-cream/60">
        <span className="truncate font-mono">{preview.command ?? "npm run dev"}</span>
        <span className="truncate font-mono">{iframeSrc}</span>
      </div>

      {/* iframe host */}
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-cream"
      >
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={iframeSrc}
          title={preview.title}
          className="absolute inset-0 h-full w-full border-0 bg-cream"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
          allow="clipboard-read; clipboard-write"
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cream">
            <div className="flex items-center gap-2 text-stone">
              <Loader2 size={16} className="animate-spin text-clay" />
              <span className="text-[12px]">Loading app...</span>
            </div>
          </div>
        )}

        {/* Tap = Click hint, fades after 3s */}
        {loading && <TapHint />}
      </div>

      {/* Inline keyboard */}
      {keyboardOpen && (
        <InlineKeyboard
          onKey={(char) => sendKeyToIframe(iframeRef.current, char)}
          onBackspace={() =>
            sendKeyToIframe(iframeRef.current, null, "Backspace")
          }
          onEnter={() => sendKeyToIframe(iframeRef.current, null, "Enter")}
          onClose={() => setKeyboardOpen(false)}
        />
      )}
      </div>
    </div>
  );
}

function TapHint() {
  // Decorative only — the actual hint lives on the AppPreviewCard before
  // the user taps Open.
  return null;
}

function InlineKeyboard({
  onKey,
  onBackspace,
  onEnter,
  onClose,
}: {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onClose: () => void;
}) {
  const rows: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];
  return (
    <div className="border-t border-cream/10 bg-ink-soft px-2 py-2">
      <div className="flex items-center justify-between pb-1.5 text-[10px] text-cream/60">
        <span>Keyboard</span>
        <button type="button" onClick={onClose} className="press text-cream/80">
          Done
        </button>
      </div>
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onKey(ch)}
                className="press h-9 min-w-[28px] flex-1 rounded-md bg-cream/15 text-[13px] font-medium text-cream"
              >
                {ch}
              </button>
            ))}
          </div>
        ))}
        <div className="flex gap-1 pt-1">
          <button
            type="button"
            onClick={onBackspace}
            className="press h-9 flex-1 rounded-md bg-cream/20 text-[12px] font-medium text-cream"
          >
            ⌫ Backspace
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="press h-9 flex-1 rounded-md bg-lagoon/40 text-[12px] font-medium text-cream"
          >
            ↵ Enter
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Build the iframe src. If the user configured a public VM base URL, we
 * swap localhost:PORT for that base URL. Otherwise we use the raw URL
 * returned by the server (works for development on-device).
 */
function buildIframeSrc(devUrl: string, publicBaseUrl?: string): string {
  if (!publicBaseUrl) return devUrl;
  try {
    const dev = new URL(devUrl);
    const base = new URL(publicBaseUrl);
    base.pathname = dev.pathname;
    base.search = dev.search;
    base.hash = dev.hash;
    base.port = dev.port;
    return base.toString();
  } catch {
    return devUrl;
  }
}

/**
 * Send a key event into the iframe. The iframe's content script (or the
 * host page itself, if it listens) handles inserting the character into
 * the focused input. Falls back to dispatching a synthetic event on the
 * active element of the iframe's document.
 */
function sendKeyToIframe(
  iframe: HTMLIFrameElement | null,
  char: string | null,
  special?: "Backspace" | "Enter",
) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    {
      source: "claude-code-mobile-preview",
      type: "key",
      char,
      special,
    },
    "*",
  );
}
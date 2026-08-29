import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ImageIcon,
  Mic,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useLayout } from "../layout";
import type { EffortLevel } from "../effort";
import type { Checkpoint, Message, ToolUse } from "../types";
import { CheckpointCard } from "./CheckpointCard";
import { EffortSlider } from "./EffortSlider";
import { OrchestrationCard } from "./OrchestrationCard";
import { ThinkingBlock } from "./ThinkingBlock";
import { WaitingSection } from "./WaitingSection";
import { AppPreviewCard } from "./AppPreviewCard";
import { cn } from "../utils/cn";

function ToolCard({
  tool,
  onRevert,
}: {
  tool: ToolUse;
  onRevert?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const showDiff = !!tool.diff;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-cream-2 transition-colors",
        tool.reverted ? "border-clay-deep/30 bg-clay/5" : "border-ink/8",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            tool.status === "running" && "dot-pulse bg-clay",
            tool.status === "done" && "bg-moss",
            tool.status === "error" && "bg-clay-deep",
          )}
        />
        <span className="shrink-0 font-mono text-[11px] font-medium text-ink">{tool.name}</span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-mono text-[11px] text-stone",
            tool.reverted && "line-through opacity-60",
          )}
        >
          {tool.detail}
        </span>
        {showDiff && (
          <span className={cn("flex shrink-0 items-center gap-1.5 font-mono text-[10px]", tool.reverted && "opacity-50")}>
            <span className="flex items-center gap-0.5 text-moss">
              <Plus size={9} />
              {tool.diff!.added}
            </span>
            <span className="flex items-center gap-0.5 text-clay-deep">
              <Minus size={9} />
              {tool.diff!.removed}
            </span>
          </span>
        )}
        {tool.status === "done" && !tool.reverted && <Check size={12} className="shrink-0 text-moss" />}
        <ChevronDown
          size={12}
          className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-ink/6">
          {tool.output && (
            <pre className="bg-ink px-3 py-2 font-mono text-[10px] leading-relaxed text-cream/85">
              {tool.output}
            </pre>
          )}
          {tool.revertible && onRevert && (
            <button
              type="button"
              onClick={onRevert}
              className={cn(
                "press flex w-full items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10.5px] font-medium transition-colors",
                tool.reverted ? "bg-clay/15 text-clay-deep" : "bg-cream text-ink-soft hover:bg-mist",
              )}
            >
              <RotateCcw size={11} className={tool.reverted ? "rotate-180" : undefined} />
              {tool.reverted ? "Restore change" : "Revert change"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Bubble({
  message,
  delay,
  effort,
  onEffortChange,
  onRevertTool,
  onOpenPreview,
  onClosePreview,
  checkpoints,
  onRestoreCheckpoint,
}: {
  message: Message;
  delay: number;
  effort: EffortLevel;
  onEffortChange: (level: EffortLevel) => void;
  onRevertTool: (messageId: string, toolId: string) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  checkpoints: Checkpoint[];
  onRestoreCheckpoint: (cp: Checkpoint) => void;
}) {
  if (message.widget === "checkpoints") {
    return (
      <div className="anim-rise px-1" style={{ animationDelay: `${delay}ms` }}>
        <CheckpointCard checkpoints={checkpoints} onRestore={onRestoreCheckpoint} />
        <p className="mt-1 px-1 text-[10px] text-stone">{message.time}</p>
      </div>
    );
  }

  if (message.widget === "effort") {
    return (
      <div className="anim-rise px-1" style={{ animationDelay: `${delay}ms` }}>
        <EffortSlider value={effort} onChange={onEffortChange} />
        <p className="mt-1 px-1 text-[10px] text-stone">{message.time}</p>
      </div>
    );
  }

  if (message.role === "system") {
    return (
      <div className="anim-rise flex justify-center" style={{ animationDelay: `${delay}ms` }}>
        <div className="rounded-full bg-mist px-3 py-1 text-[11px] text-ink-soft">
          {message.text}
        </div>
      </div>
    );
  }

  const mine = message.role === "user";
  const layout = useLayout();
  const wide = layout === "tablet";

  return (
    <div
      className={cn("anim-rise flex items-end gap-2", mine ? "justify-end" : "justify-start")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("space-y-1.5", wide ? "max-w-[72%]" : "max-w-[78%]", mine ? "items-end" : "items-start")}>
        {message.skill && (
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-clay/12 px-2 py-0.5 text-[10px] font-medium text-clay">
            <Sparkles size={10} />
            /skill {message.skill}
          </div>
        )}
        {message.plugin && (
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-lagoon/15 px-2 py-0.5 text-[10px] font-medium text-lagoon">
            /plugin {message.plugin}
          </div>
        )}
        {message.attachments?.map((file) => (
          <div key={file.id} className={cn("overflow-hidden rounded-2xl", mine && "ml-auto")}>
            {file.kind === "image" && file.url && (
              <img
                src={file.url}
                alt={file.name}
                className="max-h-44 w-full object-cover"
              />
            )}
            {file.kind === "voice" && (
              <div className="flex items-center gap-2 bg-ink px-3 py-2.5 text-cream">
                <Mic size={14} className="text-clay" />
                <div className="flex h-5 items-end gap-[3px]">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-[2px] rounded-full bg-clay"
                      style={{ height: `${6 + ((i * 17) % 14)}px`, opacity: 0.55 + (i % 5) * 0.08 }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-stone">{file.duration}s</span>
              </div>
            )}
            {file.kind === "file" && (
              <div className="flex items-center gap-2 bg-mist px-3 py-2 text-[12px] text-ink">
                <ImageIcon size={14} />
                {file.name}
              </div>
            )}
          </div>
        ))}
        {message.thinking && message.thinking.length > 0 && (
          <ThinkingBlock traces={message.thinking} />
        )}
        {message.orchestration && (
          <OrchestrationCard orch={message.orchestration} />
        )}
        {message.appPreview && (
          <AppPreviewCard
            preview={message.appPreview}
            onOpenPreview={onOpenPreview}
            onClose={onClosePreview}
          />
        )}
        {message.text && (
          <div
            className={cn(
              "px-3.5 py-2.5 text-[14.5px] leading-relaxed",
              mine
                ? "rounded-2xl rounded-br-md bg-ink text-cream"
                : "rounded-2xl rounded-bl-md bg-transparent px-1 text-ink-soft",
            )}
            style={mine ? undefined : { fontFamily: "var(--font-body)" }}
          >
            {message.text}
          </div>
        )}
        {message.tools && (
          <div className="space-y-1.5 pt-0.5">
            {message.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onRevert={
                  tool.revertible ? () => onRevertTool(message.id, tool.id) : undefined
                }
              />
            ))}
          </div>
        )}
        <p className={cn("px-1 text-[10px] text-stone", mine && "text-right")}>{message.time}</p>
      </div>
      {mine && (
        <img
          src="/images/user-avatar.jpg"
          alt=""
          className="mb-5 h-6 w-6 rounded-full object-cover ring-1 ring-ink/10"
        />
      )}
    </div>
  );
}

export function ChatView({
  messages,
  thinking,
  effort,
  onEffortChange,
  onRevertTool,
  onOpenPreview,
  onClosePreview,
  checkpoints,
  onRestoreCheckpoint,
}: {
  messages: Message[];
  thinking: boolean;
  effort: EffortLevel;
  onEffortChange: (level: EffortLevel) => void;
  onRevertTool: (messageId: string, toolId: string) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  checkpoints: Checkpoint[];
  onRestoreCheckpoint: (cp: Checkpoint) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div className="phone-scroll h-full space-y-4 px-4 pb-4 pt-2">
      {messages.map((message, i) => (
        <Bubble
          key={message.id}
          message={message}
          delay={Math.min(i * 40, 240)}
          effort={effort}
          onEffortChange={onEffortChange}
          onRevertTool={onRevertTool}
          onOpenPreview={onOpenPreview}
          onClosePreview={onClosePreview}
          checkpoints={checkpoints}
          onRestoreCheckpoint={onRestoreCheckpoint}
        />
      ))}
      {thinking && <WaitingSection totalMs={3000} />}
      <div ref={endRef} />
    </div>
  );
}

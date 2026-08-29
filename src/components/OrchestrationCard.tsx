import { useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Cog,
  GitFork,
  Loader2,
  Search,
  Shield,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import type { Orchestration, WorkflowAgent, WorkflowPhase } from "../types";
import { cn } from "../utils/cn";

const phaseIcon: Record<string, typeof Search> = {
  Understand: Search,
  Change: Wrench,
  Verify: Shield,
};

const statusColors: Record<WorkflowAgent["status"], string> = {
  queued: "bg-stone/60",
  running: "dot-pulse bg-clay",
  done: "bg-moss",
  verifying: "dot-pulse bg-lagoon",
};

function AgentRow({ agent }: { agent: WorkflowAgent }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-ink/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
      >
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusColors[agent.status])} />
        <Bot size={11} className="shrink-0 text-ink-soft" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10.5px] font-medium text-ink">{agent.name}</span>
        </span>
        <span className="shrink-0 font-mono text-[9px] text-stone">{agent.role}</span>
        {agent.tokensUsed != null && (
          <span className="shrink-0 font-mono text-[8.5px] text-stone">
            {(agent.tokensUsed / 1000).toFixed(1)}k
          </span>
        )}
        <ChevronDown
          size={10}
          className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-ink/5 bg-ink/[0.03] px-3 py-2">
          <p className="text-[10px] leading-relaxed text-ink-soft">{agent.detail}</p>
          {agent.output && (
            <pre className="mt-1.5 whitespace-pre-wrap rounded-md bg-ink px-2 py-1.5 font-mono text-[9px] leading-relaxed text-cream/85">
              {agent.output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseBlock({ phase }: { phase: WorkflowPhase }) {
  const [open, setOpen] = useState(phase.status !== "pending");
  const Icon = phaseIcon[phase.name] ?? Cog;
  const doneCount = phase.agents.filter((a) => a.status === "done").length;
  const total = phase.agents.length;

  return (
    <div className="overflow-hidden rounded-lg border border-ink/8 bg-cream">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md",
            phase.status === "done"
              ? "bg-moss/15 text-moss"
              : phase.status === "active"
                ? "bg-clay/12 text-clay"
                : "bg-mist text-stone",
          )}
        >
          {phase.status === "done" ? <Check size={12} /> : <Icon size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-medium text-ink">{phase.name}</span>
          <span className="block text-[9.5px] text-stone">
            {doneCount}/{total} agents ·{" "}
            {phase.status === "pending"
              ? "queued"
              : phase.status === "active"
                ? "running"
                : "complete"}
          </span>
        </span>
        <ChevronDown
          size={12}
          className={cn("shrink-0 text-stone transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-ink/6">
          {phase.agents.map((agent) => (
            <AgentRow key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrchestrationCard({ orch }: { orch: Orchestration }) {
  const [expanded, setExpanded] = useState(true);
  const donePhases = orch.phases.filter((p) => p.status === "done").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-lagoon/25 bg-cream-2">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 bg-gradient-to-r from-lagoon/10 to-cream-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lagoon/15 text-lagoon">
          {orch.status === "done" ? (
            <Check size={15} />
          ) : orch.status === "converging" ? (
            <GitFork size={15} />
          ) : orch.status === "running" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Workflow size={15} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="text-[13px] font-medium text-ink">Dynamic Workflow</span>
            {orch.status !== "done" && (
              <span className="rounded-full bg-clay/12 px-1.5 py-px text-[8.5px] font-semibold uppercase text-clay">
                {orch.status}
              </span>
            )}
          </span>
          <span className="block font-mono text-[10px] text-stone">
            {orch.scriptName} · {donePhases}/{orch.phases.length} phases ·{" "}
            {orch.totalAgents} agents (max {orch.concurrentMax} concurrent)
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 text-stone transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="space-y-1.5 px-3 pb-3 pt-1.5">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-mist">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  orch.status === "done" ? "bg-moss" : "bg-lagoon",
                )}
                style={{
                  width: `${(donePhases / orch.phases.length) * 100}%`,
                }}
              />
            </div>
            <Zap size={10} className="text-clay" />
            <span className="font-mono text-[9px] text-stone">xhigh</span>
          </div>

          {/* Phase cards */}
          {orch.phases.map((phase) => (
            <PhaseBlock key={phase.id} phase={phase} />
          ))}

          {/* Footer */}
          <div className="flex items-center justify-between rounded-lg bg-ink/[0.03] px-2.5 py-1.5">
            <span className="text-[9.5px] text-stone">
              Orchestration runs outside the context window
            </span>
            <span className="font-mono text-[9px] text-stone">
              ~/.claude/projects/workflow.js
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

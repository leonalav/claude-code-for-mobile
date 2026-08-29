import { useEffect, useRef, useState } from "react";
import { useLayout } from "../layout";
import {
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  GitCommit,
  GitCompare,
  History,
  Loader2,
  MessageSquare,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import type { Artifact, CommitNode, GitFile } from "../types";
import { cn } from "../utils/cn";
import { DiffView } from "./DiffView";

const laneColors = [
  "var(--color-clay)",
  "var(--color-lagoon)",
  "var(--color-moss)",
  "var(--color-clay-deep)",
];

function GraphDot({ isMerge, hex }: { isMerge?: boolean; hex: string }) {
  if (isMerge) {
    return (
      <span className="relative flex h-3 w-3 items-center justify-center">
        <span className="absolute h-3 w-3 rounded-full opacity-45" style={{ background: "var(--color-clay)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: hex }} />
      </span>
    );
  }
  return <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: hex }} />;
}

function CommitRow({ commit }: { commit: CommitNode }) {
  const [open, setOpen] = useState(false);
  const hex = laneColors[commit.lane % laneColors.length];
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-2 text-left"
      >
        <span className="flex w-6 shrink-0 items-center justify-center">
          <span
            className="h-3 w-[2px] rounded-full"
            style={{ background: hex, opacity: 0.45 }}
          />
        </span>
        <span className="w-5 shrink-0">
          <GraphDot isMerge={commit.isMerge} hex={hex} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            {commit.isMerge && <GitCommit size={11} className="shrink-0 text-stone" />}
            <span className={cn("truncate text-[12.5px]", commit.isMerge ? "font-medium text-ink-soft" : "text-ink")}>
              {commit.message}
            </span>
            {commit.ai && (
              <span className="shrink-0 rounded-full bg-clay/12 px-1.5 py-px text-[8px] font-semibold uppercase text-clay">
                AI
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-stone">
            <span className="font-mono text-[9.5px]">{commit.hash.slice(0, 7)}</span>
            <span>· {commit.author}</span>
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-px font-mono text-[8.5px]",
            commit.branch === "main" ? "bg-clay/12 text-clay" : "bg-lagoon/15 text-lagoon",
          )}
        >
          {commit.branch}
        </span>
      </button>
      {open && (
        <div className="mx-6 mb-1 rounded-lg bg-ink/[0.04] px-2.5 py-1.5">
          <p className="font-mono text-[9.5px] text-stone">
            {commit.hash} · {commit.author} · reviewed by Claude
          </p>
          <p className="text-[10.5px] leading-relaxed text-ink-soft">
            Click hashes to cherry-pick. This commit touches the auth skew change.
          </p>
        </div>
      )}
    </div>
  );
}

function ArtifactRow({ artifact }: { artifact: Artifact }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 py-1.5 text-left"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-ink/6 text-stone">
        {artifact.kind === "log" ? (
          <MessageSquare size={11} />
        ) : artifact.kind === "document" ? (
          <GitCommit size={11} />
        ) : (
          <GitBranch size={11} />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-soft">
        {artifact.path}
      </span>
      {artifact.kind !== "log" && (
        <span className="shrink-0 rounded-full bg-ink/6 px-1.5 py-px font-mono text-[8.5px] text-stone">
          {artifact.kind}
        </span>
      )}
    </button>
  );
}

type CommitMode = "commit" | "amend" | "push" | "sync";

const MODES: { id: CommitMode; label: string; hint: string; icon: typeof Check }[] = [
  { id: "commit", label: "Commit", hint: "Just create the commit", icon: Check },
  {
    id: "amend",
    label: "Commit (Amend)",
    hint: "Edit the most recent commit",
    icon: History as unknown as typeof Check,
  },
  { id: "push", label: "Commit & Push", hint: "Push the new commit to origin", icon: Upload as unknown as typeof Check },
  {
    id: "sync",
    label: "Commit & Sync",
    hint: "Pull, then commit, then push",
    icon: GitCompare as unknown as typeof Check,
  },
];

export function GitView({
  files,
  commits,
  artifacts,
  onCommit,
  onCommitAndPush,
  onCommitAndSync,
  onCommitAmend,
  onFindIssues,
  commitMessage,
  setCommitMessage,
}: {
  files: GitFile[];
  commits: CommitNode[];
  artifacts: Artifact[];
  onCommit: (message: string) => void;
  onCommitAndPush: (message: string) => void;
  onCommitAndSync: (message: string) => void;
  onCommitAmend: (message: string) => void;
  onFindIssues: () => void;
  commitMessage: string;
  setCommitMessage: (v: string) => void;
}) {
  const layout = useLayout();
  const isTablet = layout === "tablet";
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionLabel, setActionLabel] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(files[0]?.path ?? null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const filtered = files.filter(
    (f) => f.path.toLowerCase().includes(search.toLowerCase()) || f.status.toLowerCase() === search.toLowerCase(),
  );
  const totalAdded = files.reduce((s, f) => s + f.added, 0);
  const totalRemoved = files.reduce((s, f) => s + f.removed, 0);

  function findIssues() {
    setReviewing(true);
    onFindIssues();
    window.setTimeout(() => setReviewing(false), 1700);
  }

  const selected = files.find((f) => f.path === selectedPath) ?? files[0];

  if (isTablet) {
    return (
      <div className="flex h-full min-h-0">
        <div className="phone-scroll w-[340px] shrink-0 border-r border-ink/8 px-4 pb-6 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
            Source control · git
          </p>
          <h2 className="mt-1 font-serif text-[28px] leading-tight text-ink">Changes</h2>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/12 px-2.5 py-1 text-[11px] font-medium text-clay">
              <GitBranch size={11} /> main
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-mist px-2.5 py-1">
              <Search size={12} className="text-stone" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-[11.5px] text-ink outline-none placeholder:text-stone"
              />
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-ink/8 bg-cream-2 p-2">
            <input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && commitMessage.trim()) onCommit(commitMessage.trim());
              }}
              placeholder="Commit message"
              className="w-full bg-transparent px-1 py-1.5 text-[13px] text-ink outline-none placeholder:text-stone"
            />
            <div className="mt-1 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCommitMessage(generateMessage(files))}
                className="press flex items-center gap-1 rounded-lg bg-mist px-2 py-1.5 text-[11px] font-medium text-ink-soft"
              >
                <Sparkles size={11} className="text-clay" /> AI
              </button>
              <button
                type="button"
                disabled={!commitMessage.trim() || files.length === 0}
                onClick={() => commitMessage.trim() && onCommit(commitMessage.trim())}
                className="press ml-auto rounded-lg bg-ink px-3 py-1.5 text-[11.5px] font-medium text-cream disabled:opacity-40"
              >
                Commit
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="press rounded-lg bg-ink px-2 py-1.5 text-cream"
                aria-label="More commit options"
              >
                <ChevronDown size={12} />
              </button>
            </div>
            {menuOpen && (
              <div className="mt-1 overflow-hidden rounded-xl border border-ink/10 bg-cream">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        const msg = commitMessage.trim() || generateMessage(files);
                        if (mode.id === "commit") onCommit(msg);
                        if (mode.id === "amend") onCommitAmend(msg);
                        if (mode.id === "push") onCommitAndPush(msg);
                        if (mode.id === "sync") onCommitAndSync(msg);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-blush"
                    >
                      <Icon size={13} className="text-clay" />
                      <span className="text-[12px] text-ink">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {files.length > 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-ink/[0.04] px-2.5 py-1.5">
              <span style={{ color: "var(--add)" }} className="font-mono text-[10px]">
                +{totalAdded}
              </span>
              <span style={{ color: "var(--del)" }} className="font-mono text-[10px]">
                −{totalRemoved}
              </span>
              <span className="ml-auto font-mono text-[10px] text-stone">{files.length} files</span>
            </div>
          )}
          <div className="mt-3 space-y-1">
            {filtered.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedPath(file.path)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left",
                  selected?.path === file.path ? "bg-blush" : "hover:bg-mist",
                )}
              >
                <span className="w-4 font-mono text-[10px] font-semibold text-lagoon">{file.status}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink">{file.path}</span>
                <span className="font-mono text-[9.5px]" style={{ color: "var(--add)" }}>
                  +{file.added}
                </span>
                <span className="font-mono text-[9.5px]" style={{ color: "var(--del)" }}>
                  −{file.removed}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={findIssues}
            className="press mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-[12.5px] font-medium text-cream"
          >
            {reviewing ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Reviewing…
              </>
            ) : (
              <>
                <Search size={13} /> Find Issues
              </>
            )}
          </button>
        </div>
        <div className="phone-scroll min-w-0 flex-1 px-5 pb-8 pt-3">
          {selected ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">Diff</p>
              <h3 className="mt-1 font-mono text-[15px] text-ink">{selected.path}</h3>
              <div className="mt-3">
                <DiffView file={selected} defaultOpen />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-stone">
              Working tree clean.
            </div>
          )}
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">Graph</p>
            <div className="mt-2 rounded-2xl border border-ink/8 bg-cream-2 p-2.5">
              {commits.map((commit) => (
                <CommitRow key={commit.id} commit={commit} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-scroll h-full px-4 pb-6 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
        Source control · git
      </p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight text-ink">Changes</h2>

      {/* Branch + search */}
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/12 px-2.5 py-1 text-[11px] font-medium text-clay">
          <GitBranch size={11} /> main
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-mist px-2.5 py-1">
          <Search size={12} className="text-stone" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search changes"
            className="min-w-0 flex-1 bg-transparent text-[11.5px] text-ink outline-none placeholder:text-stone"
          />
        </div>
      </div>

      {/* Commit box */}
      <div className="mt-3 rounded-2xl border border-ink/8 bg-cream-2 p-2">
        <input
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && commitMessage.trim()) onCommit(commitMessage.trim());
          }}
          placeholder="Message (Cmd+Enter to commit on “main”)"
          className="w-full bg-transparent px-1 py-1.5 text-[13px] text-ink outline-none placeholder:text-stone"
        />
        <div className="mt-1 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCommitMessage(generateMessage(files))}
            className="press flex items-center gap-1 rounded-lg bg-mist px-2.5 py-1.5 text-[11px] font-medium text-ink-soft"
          >
            <Sparkles size={11} className="text-clay" /> AI message
          </button>
          <div ref={menuRef} className="relative ml-auto flex items-stretch">
            <button
              type="button"
              disabled={!commitMessage.trim() || files.length === 0}
              onClick={() => {
                const msg = commitMessage.trim();
                if (!msg) return;
                setActionLabel("Committing…");
                onCommit(msg);
                setMenuOpen(false);
                window.setTimeout(() => setActionLabel(null), 1500);
              }}
              className="press flex items-center gap-1.5 rounded-l-lg bg-ink px-3 py-1.5 text-[11.5px] font-medium text-cream disabled:opacity-40"
            >
              {actionLabel ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {actionLabel ?? "Commit"}
              <span className="rounded-full bg-cream/15 px-1.5 font-mono text-[9px]">
                {files.length}
              </span>
            </button>
            <button
              type="button"
              disabled={files.length === 0}
              onClick={() => setMenuOpen((v) => !v)}
              className="press flex items-center rounded-r-lg border-l border-cream/15 bg-ink px-1.5 text-cream disabled:opacity-40"
              aria-label="More commit options"
            >
              <ChevronDown size={12} />
            </button>
            {menuOpen && (
              <div className="anim-rise absolute right-0 top-full z-20 mt-1 w-[220px] overflow-hidden rounded-xl border border-ink/10 bg-cream shadow-[0_18px_40px_-24px_rgba(20,20,19,0.45)]">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const disabled = files.length === 0;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        const msg = commitMessage.trim() || generateMessage(files);
                        if (mode.id !== "commit") setCommitMessage(msg);
                        if (mode.id === "commit") onCommit(msg);
                        if (mode.id === "amend") onCommitAmend(msg);
                        if (mode.id === "push") onCommitAndPush(msg);
                        if (mode.id === "sync") onCommitAndSync(msg);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-blush disabled:opacity-40",
                      )}
                    >
                      <Icon size={13} className="mt-0.5 shrink-0 text-clay" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-medium text-ink">{mode.label}</span>
                        <span className="block text-[10.5px] text-stone">{mode.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      {files.length > 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-ink/[0.04] px-2.5 py-1.5">
          <span style={{ color: "var(--add)" }} className="font-mono text-[10px]">
            +{totalAdded}
          </span>
          <span style={{ color: "var(--del)" }} className="font-mono text-[10px]">
            −{totalRemoved}
          </span>
          <span className="ml-auto font-mono text-[10px] text-stone">
            {files.length} file{files.length === 1 ? "" : "s"} changed
          </span>
        </div>
      )}

      {files.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-ink/8 bg-cream-2 p-6 text-center">
          <Check size={18} className="mx-auto text-moss" />
          <p className="mt-2 text-[13px] font-medium text-ink">Working tree clean</p>
          <p className="mt-0.5 text-[11.5px] text-stone">All changes have been committed.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
            Changes · {files.length}
          </p>
          {filtered.map((file, i) => (
            <DiffView
              key={file.path}
              file={file}
              defaultOpen={i === 0}
            />
          ))}
          {filtered.length === 0 && (
            <p className="py-3 text-center text-[12px] text-stone">No changes match “{search}”.</p>
          )}
        </div>
      )}

      {/* Generated artifacts */}
      <div className="mt-5 rounded-2xl border border-ink/8 bg-cream-2 p-2.5">
        <div className="flex items-center gap-1.5 px-1">
          <FileText size={12} className="text-stone" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
            Artifacts · {artifacts.length}
          </p>
        </div>
        <div className="mt-1 px-1">
          {artifacts.map((artifact) => (
            <ArtifactRow key={artifact.id} artifact={artifact} />
          ))}
        </div>
      </div>

      {/* Agent review */}
      <div className="mt-5 rounded-2xl border border-ink/8 bg-cream-2 p-2.5">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
          Agent review
        </p>
        <button
          type="button"
          onClick={findIssues}
          className="press mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-[12.5px] font-medium text-cream"
        >
          {reviewing ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Reviewing changes…
            </>
          ) : (
            <>
              <Search size={13} /> Find Issues
            </>
          )}
        </button>
        {reviewing && (
          <div className="mt-2 space-y-1.5">
            <ReviewFinding severity="medium" text="Refresh tokens still use a hard exp without clockTolerance." />
            <ReviewFinding severity="low" text="rate-limit message could leak environment details." />
            <div className="flex items-center gap-1.5 px-1 text-[10px] text-stone">
              <ShieldAlert size={10} className="text-clay" /> Reviewing changes against main.
            </div>
          </div>
        )}
        <p className="mt-2 px-1 text-[10px] text-stone">Review changes against main.</p>
      </div>

      {/* Graph */}
      <div className="mt-5 rounded-2xl border border-ink/8 bg-cream-2 p-2.5">
        <div className="flex items-center gap-1.5 px-1">
          <GitCompare size={12} className="text-stone" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
            Graph · main
          </p>
        </div>
        <div className="mt-1.5 px-1">
          {commits.map((commit) => (
            <CommitRow key={commit.id} commit={commit} />
          ))}
        </div>
      </div>
    </div>
  );
}

function generateMessage(files: GitFile[]) {
  const scopes = [...new Set(files.map((f) => f.path.split("/")[1]))];
  const type = files.some((f) => f.path.includes("test")) ? "test" : "fix";
  const scope = scopes[0] ?? "app";
  return `${type}(${scope}): ${files.length} file${files.length === 1 ? "" : "s"} changed`;
}

function ReviewFinding({ severity, text }: { severity: "medium" | "low"; text: string }) {
  const dot =
    severity === "medium" ? "var(--color-clay-deep)" : "var(--color-lagoon)";
  return (
    <div className="flex items-start gap-2 rounded-lg bg-ink/[0.04] px-2 py-1.5">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
      <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-ink-soft">{text}</p>
      <span className="shrink-0 font-mono text-[8.5px] uppercase text-stone">{severity}</span>
    </div>
  );
}

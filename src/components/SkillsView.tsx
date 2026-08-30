import { useState } from "react";
import { GitCommit, Search, Sparkles, Terminal, TestTubes, WandSparkles } from "lucide-react";
import type { Skill } from "../types";
import { cn } from "../utils/cn";

const icons: Record<string, typeof Sparkles> = {
  commit: GitCommit,
  review: Search,
  test: TestTubes,
  fix: WandSparkles,
  explain: Sparkles,
  pr: GitCommit,
  compact: Terminal,
  cost: Terminal,
};

const categories = [
  { id: "all", label: "All" },
  { id: "git", label: "Git" },
  { id: "quality", label: "Quality" },
  { id: "build", label: "Build" },
  { id: "session", label: "Session" },
] as const;

export function SkillsView({
  skills,
  onRun,
}: {
  skills: Skill[];
  onRun: (skill: Skill) => void;
}) {
  const [filter, setFilter] = useState<(typeof categories)[number]["id"]>("all");
  const visible = skills.filter((s) => filter === "all" || s.category === filter);

  return (
    <div className="phone-scroll h-full px-4 pb-3 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
        /skill extensions
      </p>
      <h2 className="mt-1 font-serif text-[30px] leading-tight text-ink">Skills</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-stone">
        Invoke with a slash, or tap to run on the paired Claude Code session.
      </p>

      <div className="mt-4 flex gap-1.5 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={cn(
              "rounded-full px-3 py-1 text-[12px]",
              filter === cat.id ? "bg-ink text-cream" : "bg-mist text-ink-soft",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {visible.map((skill, i) => {
          const Icon = icons[skill.id] ?? Sparkles;
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onRun(skill)}
              className="anim-rise w-full rounded-2xl border border-ink/6 bg-cream-2 p-3.5 text-left"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clay/12 text-clay">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[15px] font-medium text-ink">{skill.name}</span>
                    <span className="font-mono text-[11px] text-clay">{skill.command}</span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-stone">
                    {skill.description}
                  </span>
                  <span className="mt-2 block rounded-lg bg-ink/4 px-2 py-1 font-mono text-[10px] text-ink-soft">
                    {skill.usage}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

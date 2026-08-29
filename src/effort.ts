export type EffortLevel =
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max"
  | "auto"
  | "ultracode";

export type EffortMeta = {
  id: EffortLevel;
  label: string;
  arg: string;
  blurb: string;
  cost: string;
  persists: boolean;
  tone: string;
};

/**
 * Order mirrors the /effort slider: faster -> smarter, with auto (model default)
 * and ultracode (xhigh + dynamic workflows) as the trailing special stops.
 */
export const effortLevels: EffortMeta[] = [
  {
    id: "low",
    label: "Low",
    arg: "low",
    blurb: "Short, scoped, latency-sensitive tasks that aren't intelligence-sensitive.",
    cost: "~0.3× tokens",
    persists: true,
    tone: "#788c5d",
  },
  {
    id: "medium",
    label: "Medium",
    arg: "medium",
    blurb: "Cost-sensitive everyday work that can trade off some intelligence.",
    cost: "1× baseline",
    persists: true,
    tone: "#788c5d",
  },
  {
    id: "high",
    label: "High",
    arg: "high",
    blurb: "Balances tokens and intelligence. The default on every model except Opus 4.7.",
    cost: "2–3× tokens",
    persists: true,
    tone: "#6a9bcc",
  },
  {
    id: "xhigh",
    label: "Extra",
    arg: "xhigh",
    blurb: "Deeper reasoning for long agentic runs with repeated tool calls.",
    cost: "5–10× tokens",
    persists: true,
    tone: "#6a9bcc",
  },
  {
    id: "max",
    label: "Max",
    arg: "max",
    blurb: "Hardest problems only. Diminishing returns and prone to overthinking.",
    cost: "8×+ tokens",
    persists: false,
    tone: "#d97757",
  },
  {
    id: "auto",
    label: "Auto",
    arg: "auto",
    blurb: "Reset to the model default for the selected model.",
    cost: "model default",
    persists: true,
    tone: "#b0aea5",
  },
  {
    id: "ultracode",
    label: "Ultracode",
    arg: "ultracode",
    blurb: "xhigh reasoning plus dynamic multi-agent workflows for substantive tasks.",
    cost: "10–50× tokens",
    persists: false,
    tone: "#d97757",
  },
];

export const effortIndex = (level: EffortLevel) =>
  Math.max(0, effortLevels.findIndex((l) => l.id === level));

export const effortMeta = (level: EffortLevel) =>
  effortLevels.find((l) => l.id === level) ?? effortLevels[2];

export const effortSyntax = {
  usage: "/effort [level]",
  args: effortLevels.map((l) => l.arg),
  examples: [
    { cmd: "/effort", hint: "Open the interactive slider" },
    { cmd: "/effort xhigh", hint: "Set the level directly" },
    { cmd: "/effort auto", hint: "Reset to the model default" },
    { cmd: "/effort ultracode", hint: "xhigh + dynamic workflows (session only)" },
  ],
  notes: [
    "low · medium · high · xhigh persist to effortLevel in settings.json",
    "max and ultracode apply to the current session only",
    "CLAUDE_CODE_EFFORT_LEVEL overrides every other method",
  ],
};

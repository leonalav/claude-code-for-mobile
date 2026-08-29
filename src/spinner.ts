/**
 * Real spinner verbs + tips extracted from the Claude Code CLI binary.
 * Source: github.com/shanraisshan/claude-code-best-practice
 *          (claude-spinner-verbs-and-tips.md, v2.1.121)
 */
export const SPINNER_VERBS = [
  "Accomplishing", "Actioning", "Actualizing", "Architecting", "Baking", "Beaming",
  "Beboppin'", "Befuddling", "Billowing", "Blanching", "Bloviating", "Boogieing",
  "Boondoggling", "Booping", "Bootstrapping", "Brewing", "Bunning", "Burrowing",
  "Calculating", "Canoodling", "Caramelizing", "Cascading", "Catapulting",
  "Cerebrating", "Channeling", "Channelling", "Choreographing", "Churning",
  "Clauding", "Coalescing", "Cogitating", "Combobulating", "Composing", "Computing",
  "Concocting", "Considering", "Contemplating", "Cooking", "Crafting", "Creating",
  "Crunching", "Crystallizing", "Cultivating", "Deciphering", "Deliberating",
  "Determining", "Dilly-dallying", "Discombobulating", "Doing", "Doodling",
  "Drizzling", "Ebbing", "Effecting", "Elucidating", "Embellishing", "Enchanting",
  "Envisioning", "Evaporating", "Fermenting", "Fiddle-faddling", "Finagling",
  "Flambéing", "Flibbertigibbeting", "Flowing", "Flummoxing", "Fluttering",
  "Forging", "Forming", "Frolicking", "Frosting", "Gallivanting", "Galloping",
  "Garnishing", "Generating", "Gesticulating", "Germinating", "Gitifying",
  "Grooving", "Gusting", "Harmonizing", "Hashing", "Hatching", "Herding",
  "Honking", "Hullaballooing", "Hyperspacing", "Ideating", "Imagining",
  "Improvising", "Incubating", "Inferring", "Infusing", "Ionizing", "Jitterbugging",
  "Julienning", "Kneading", "Leavening", "Levitating", "Lollygagging",
  "Manifesting", "Marinating", "Meandering", "Metamorphosing", "Misting",
  "Moonwalking", "Moseying", "Mulling", "Mustering", "Musing", "Nebulizing",
  "Nesting", "Newspapering", "Noodling", "Nucleating", "Orbiting", "Orchestrating",
  "Osmosing", "Perambulating", "Percolating", "Perusing", "Philosophising",
  "Photosynthesizing", "Pollinating", "Pondering", "Pontificating", "Pouncing",
  "Precipitating", "Prestidigitating", "Processing", "Proofing", "Propagating",
  "Puttering", "Puzzling", "Quantumizing", "Razzle-dazzling", "Razzmatazzing",
  "Recombobulating", "Reticulating", "Roosting", "Ruminating", "Sautéing",
  "Scampering", "Schlepping", "Scurrying", "Seasoning", "Shenaniganing",
  "Shimmying", "Simmering", "Skedaddling", "Sketching", "Slithering", "Smooshing",
  "Sock-hopping", "Spelunking", "Spinning", "Sprouting", "Stewing", "Sublimating",
  "Swirling", "Swooping", "Symbioting", "Synthesizing", "Tempering", "Thinking",
  "Thundering", "Tinkering", "Tomfoolering", "Topsy-turvying", "Transfiguring",
  "Transmuting", "Twisting", "Undulating", "Unfurling", "Unravelling", "Vibing",
  "Waddling", "Wandering", "Warping", "Whatchamacalliting", "Whirlpooling",
  "Whirring", "Whisking", "Wibbling", "Working", "Wrangling", "Zesting", "Zigzagging",
];

export const SPINNER_TIPS = [
  "Start with small features or bug fixes, tell Claude to propose a plan, and verify its suggested edits.",
  "Use /config to change your default permission mode (including Plan Mode).",
  "Use git worktrees to run multiple Claude sessions in parallel.",
  "Running multiple Claude sessions? Use /color and /rename to tell them apart at a glance.",
  "Use /memory to view and manage Claude memory.",
  "Use /theme to change the color theme.",
  "Try setting environment variable COLORTERM=truecolor for richer colors.",
  "Set CLAUDE_CODE_USE_POWERSHELL_TOOL=1 to enable the PowerShell tool (preview).",
  "Use /statusline to set up a custom status line that will display beneath the input box.",
  "Hit Enter to queue up additional messages while Claude is working.",
  "Send messages to Claude while it works to steer Claude in real-time.",
  "Ask Claude to create a todo list when working on complex tasks to track progress and remain on track.",
  "Connect Claude to your IDE · /ide.",
  "Run /install-github-app to tag @claude right from your GitHub issues and PRs.",
  "Run /install-slack-app to use Claude in Slack.",
  "Use /permissions to pre-approve and pre-deny bash, edit, and MCP tools.",
  "Did you know you can drag and drop image files into your terminal?",
  "Paste images into Claude Code using control+v (not cmd+v!).",
  "Double-tap esc to rewind the conversation to a previous point in time.",
  "Double-tap esc to rewind the code and/or conversation to a previous point in time.",
  "Run claude --continue or claude --resume to resume a conversation.",
  "Name your conversations with /rename to find them easily in /resume later.",
  "Create skills by adding .md files to .claude/skills/ in your project or ~/.claude/skills/ for skills that work in any project.",
  "Use /agents to optimize specific tasks. Eg. Software Architect, Code Writer, Code Reviewer.",
  "Use --agent <agent_name> to directly start a conversation with a subagent.",
  "Run Claude Code locally or remotely using the Claude desktop app.",
  "Run tasks in the cloud while you keep coding locally · clau.de/web.",
  "Use /voice to enable push-to-talk dictation.",
  "Try flicker-free rendering, now with mouse support · /tui fullscreen.",
  "Use Plan Mode to prepare for a complex request before making changes.",
  "Run /terminal-setup to enable convenient terminal integration like Option+Enter for new line and more.",
  "Press Option+Enter (Apple Terminal) or Shift+Enter to send a multi-line message.",
  "Run /terminal-setup to enable Option+Enter (Apple Terminal) or Shift+Enter for new lines.",
  "Open the Command Palette (Cmd+Shift+P) and run 'Shell Command: Install <editor> command in PATH' to enable IDE integration.",
  "Hit <cycle-mode key> to switch chat modes.",
  "Pair this session to your phone via remote control.",
  "Get pinged on your phone when long tasks finish — enable push notifications in settings.",
  "Working with HTML/CSS? Install the frontend-design plugin.",
];

/** Claude Code rotates through spinner glyphs: · ✢ * ✶ ✻ ✽ */
export const SPINNER_GLYPHS = ["·", "✢", "*", "✶", "✻", "✽"];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

---
name: preview
description: Start the project's dev server and return its localhost URL so the user can tap the preview card from the mobile app.
---

# Preview

When the user says **"I want to see the app preview"** (or a close paraphrase), start the dev server and return the URL the app is listening on.

## Steps

1. **Detect the package manager.** Read `package.json` and inspect, in order:
   - The `packageManager` field (e.g., `"pnpm@9.0.0"`) — use the prefix before `@`.
   - If absent, look for lockfiles: `pnpm-lock.yaml` → `pnpm`, `yarn.lock` → `yarn`, `bun.lockb` → `bun`, otherwise `npm`.
2. **Pick the script.** Use `dev` from `scripts`. If absent, fall back to `start`.
3. **Start the dev server in the background.** The Go server already calls `Bash` with this command, but if you are answering directly, run the command with `run_in_background: true`:
   ```bash
   {pm} run dev
   ```
4. **Wait for the port.** Poll common dev ports (`3000`, `5173`, `8080`, `4200`, `8000`, `4173`) until one accepts a TCP connection. Stop polling as soon as one responds.
5. **Return a structured result.** Print exactly one JSON line on its own (no prose around it) so the Go bridge can parse it:
   ```json
   {"type":"preview","url":"http://localhost:3000","command":"npm run dev","title":"<project name>"}
   ```
   If the server fails to come up, return `{"type":"preview","error":"<reason>"}` instead.

## Constraints

- Do **not** start the dev server in the foreground. It must be backgrounded so the agent loop can return.
- Do **not** modify any source files. This command is read-only with respect to the project.
- If `package.json` is missing or has no `dev`/`start` script, return an error JSON — do not invent a command.

## Notes for the Go bridge

The mobile app POSTs `{ "prompt": "I want to see the app preview" }` to `/api/preview`. The bridge handles package-manager detection and port polling on the server side, so this skill is mostly used when the agent is invoked directly (e.g., from the CLI with `claude -p "I want to see the app preview"`).

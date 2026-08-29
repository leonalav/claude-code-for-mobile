# Claude Code Mobile UI

A mobile interface for Claude Code that lets you work with your codebase from your phone.

<div align="center">
  <img src="public/images/claude-mark.png" alt="Claude Code Mobile" width="120" />
  <p><em>Claude Code, in your pocket.</em></p>
</div>

## Features

- 📱 **iPhone & iPad layouts** - Optimized for both form factors
- 🎯 **Effort control** - Tune Claude's reasoning depth with a slider (xlow → ultracode)
- 🔧 **/skill & /plugin support** - Full slash command palette
- 🎤 **Voice & image attachments** - Drop screenshots or voice notes into the chat
- 🌳 **Git integration** - View diffs, commit, push from mobile
- 🔄 **Multi-agent orchestration** - Watch parallel agent workflows unfold
- 🎨 **Thinking traces** - See Claude's extended reasoning process
- 🌙 **Dark mode & daltonized themes** - Accessibility-first design

## Architecture

```
┌─────────────────┐
│  Mobile App     │  React + TypeScript UI
│  (SideStore)    │  
└────────┬────────┘
         │ HTTPS + WebSocket
┌────────▼────────┐
│  Go Server      │  Lightweight bridge (~10MB binary)
│  (VPS)          │  
└────────┬────────┘
         │ CLI
┌────────▼────────┐
│  Claude Code    │  Headless mode
│  + Git Repo     │
└─────────────────┘
```

## Quick Start

### 1. Frontend (React app)

```bash
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### 2. Backend (Go server)

See [`server/README.md`](server/README.md) for full setup instructions.

```bash
cd server
go mod download
go build -o claude-server main.go

export AUTH_TOKEN="your-secret-token"
export REPO_PATH="/path/to/your/repo"
./claude-server
```

### 3. Deploy to VPS

One-line install on Ubuntu/Debian VPS:

```bash
curl -o install.sh https://raw.githubusercontent.com/your-repo/server/install.sh
chmod +x install.sh
sudo ./install.sh
```

This sets up:
- Go server with systemd service
- Caddy reverse proxy with auto-HTTPS
- Firewall configuration

See [`server/VPS-GUIDE.md`](server/VPS-GUIDE.md) for provider recommendations.

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- Vite 7
- Lucide React icons

**Backend:**
- Go 1.22 (Chi router, Gorilla WebSocket)
- Claude Code CLI (headless mode)
- Git CLI
- Caddy for HTTPS

**Deployment:**
- SideStore (iOS sideloading)
- VPS (Hetzner/Vultr/DigitalOcean)
- Docker (optional)

## API Client

Use the TypeScript client to connect your app to the server:

```typescript
import { ClaudeCodeClient } from './api';

const client = new ClaudeCodeClient({
  baseUrl: 'https://your-vps.com',
  apiKey: 'your-secret-token',
  onConnectionChange: (connected) => console.log('Connected:', connected),
});

// Send a message
const response = await client.sendMessage('Fix the auth bug', 'high');

// Stream with thinking traces
await client.sendMessageStream({
  text: 'Refactor the API',
  effortLevel: 'ultracode',
  onThinking: (trace) => console.log('Thinking:', trace.label),
  onToolUse: (tool) => console.log('Tool:', tool.name),
});

// Git operations
const files = await client.getGitStatus();
await client.gitCommit('fix: resolve JWT clock skew');
```

See [`src/api/example.tsx`](src/api/example.tsx) for a complete example.

## Configuration

The app supports custom API endpoints. In Settings:

- **Endpoint Mode**: `anthropic` or `custom`
- **Custom Base URL**: Your VPS URL (e.g., `https://claude.example.com`)
- **API Key**: Bearer token for authentication
- **Model**: Claude Opus 4.5, Sonnet 3.7, or custom model

All settings are stored in localStorage and synced with the server.

## Resource Usage

Tested on Hetzner CX11 (1 vCPU, 2GB RAM, €4.15/month):

- **Go server**: ~25MB RAM idle
- **Claude Code session**: ~150MB RAM active
- **Total**: ~200MB RAM, <5% CPU idle

One VPS can comfortably handle 2-3 concurrent users.

## Security

- ✅ Bearer token authentication
- ✅ HTTPS via Let's Encrypt (auto-renewed)
- ✅ Firewall configured (ports 80, 443 only)
- ✅ Git operations sandboxed to repo directory
- ✅ No secrets stored on mobile device

## Roadmap

- [ ] Push notifications for long-running tasks
- [ ] Offline message queue
- [ ] Multi-session support
- [ ] Conflict resolution UI
- [ ] Desktop pairing (LAN discovery)
- [ ] TestFlight build
- [ ] React Native port (Android support)

## License

MIT

## Contributing

PRs welcome! This is an experimental project for making Claude Code accessible on mobile.

---

<p align="center">
  <em>Built for developers who need to ship code from anywhere.</em>
</p>

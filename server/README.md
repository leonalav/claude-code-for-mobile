# Claude Code Mobile Server

Lightweight Go server that bridges your React mobile UI to Claude Code CLI.

## Features

- 🚀 Single binary deployment (~10MB)
- 🔒 Bearer token authentication
- 📡 WebSocket streaming for thinking traces
- 🔧 Git operations proxy
- 📦 Serves React build as static files
- 💾 Minimal memory footprint (~20-50MB idle)

## Quick Start

### 1. Build the server

```bash
cd server
go mod download
go build -ldflags="-s -w" -o claude-server main.go
```

### 2. Build the React UI

```bash
npm run build
# This creates ./dist with your React app
```

### 3. Run on VPS

```bash
export AUTH_TOKEN="your-secret-token-here"
export REPO_PATH="/home/user/your-repo"
export CLAUDE_CODE_BIN="/usr/local/bin/claude-code"
export STATIC_DIR="./dist"
export PORT="3456"

./claude-server
```

### 4. Connect from your phone

In the app settings, set:
- **Base URL**: `https://your-vps.com:3456`
- **API Key**: `your-secret-token-here`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3456` | Server port |
| `AUTH_TOKEN` | _none_ | Bearer token for API auth (optional but recommended) |
| `CLAUDE_CODE_BIN` | `claude-code` | Path to Claude Code CLI |
| `REPO_PATH` | `/workspace` | Path to your git repository |
| `STATIC_DIR` | `./dist` | Path to React build output |

## API Endpoints

### Chat

```bash
# Send a message
curl -X POST https://your-vps.com:3456/api/chat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Fix the auth bug",
    "effortLevel": "high",
    "attachments": []
  }'

# Stream response (WebSocket)
wscat -c wss://your-vps.com:3456/api/chat/stream \
  -H "Authorization: Bearer your-token"
```

### Git Operations

```bash
# Get git status
curl https://your-vps.com:3456/api/git/status \
  -H "Authorization: Bearer your-token"

# Commit changes
curl -X POST https://your-vps.com:3456/api/git/commit \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "fix: resolve JWT clock skew"}'
```

### Sessions

```bash
# List active sessions
curl https://your-vps.com:3456/api/sessions \
  -H "Authorization: Bearer your-token"
```

## VPS Deployment (systemd)

Create `/etc/systemd/system/claude-server.service`:

```ini
[Unit]
Description=Claude Code Mobile Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/claude-code-mobile
Environment="AUTH_TOKEN=your-secret-token"
Environment="REPO_PATH=/home/your-user/your-repo"
Environment="CLAUDE_CODE_BIN=/usr/local/bin/claude-code"
Environment="STATIC_DIR=/home/your-user/claude-code-mobile/dist"
Environment="PORT=3456"
ExecStart=/home/your-user/claude-code-mobile/server/claude-server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable claude-server
sudo systemctl start claude-server
sudo systemctl status claude-server
```

## HTTPS with Caddy (Recommended)

Install Caddy and create `/etc/caddy/Caddyfile`:

```
claude.yourdomain.com {
    reverse_proxy localhost:3456
    tls your-email@example.com
}
```

Caddy automatically handles Let's Encrypt certificates.

```bash
sudo systemctl restart caddy
```

## Resource Usage

Tested on Hetzner CX11 (1 vCPU, 2GB RAM):

- **Idle**: ~25MB RAM
- **Active chat**: ~150MB RAM (includes Claude Code subprocess)
- **CPU**: <5% during thinking, spikes to ~40% during code generation

## Security Notes

1. **Always set AUTH_TOKEN** in production
2. **Use HTTPS** (via Caddy/nginx reverse proxy)
3. **Firewall**: Only expose port 443, keep 3456 internal
4. **Git credentials**: Use SSH keys, not HTTPS passwords
5. **Rate limiting**: Add if exposing publicly

## Development

```bash
# Run in dev mode (auto-reload with air)
go install github.com/cosmtrek/air@latest
cd server
air

# In another terminal, run React dev server
npm run dev
```

The React app will proxy API requests to `localhost:3456` via Vite config.

## Troubleshooting

**"claude-code: command not found"**
- Set `CLAUDE_CODE_BIN` to the full path: `/usr/local/bin/claude-code`

**"Unauthorized" errors**
- Check that your phone app sends `Authorization: Bearer <token>` header
- Verify `AUTH_TOKEN` matches on server and client

**WebSocket connection fails**
- Ensure your reverse proxy (Caddy/nginx) supports WebSocket upgrades
- Check firewall rules

**High memory usage**
- Claude Code subprocesses use ~100-200MB each
- Kill stale sessions: `pkill -f claude-code`

## License

MIT

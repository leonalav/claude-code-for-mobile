#!/bin/bash
set -e

echo "🚀 Claude Code Mobile - VPS Setup Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root (use sudo)"
   exit 1
fi

# Prompt for configuration
read -p "Enter your domain (e.g., claude.example.com): " DOMAIN
read -p "Enter your email for Let's Encrypt: " EMAIL
read -s -p "Enter a secure auth token: " AUTH_TOKEN
echo ""
read -p "Enter the path to your git repository: " REPO_PATH

USERNAME="${SUDO_USER:-$USER}"
INSTALL_DIR="/home/$USERNAME/claude-code-mobile"

echo ""
echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Repo: $REPO_PATH"
echo "  User: $USERNAME"
echo ""
read -p "Proceed with installation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."

# Install Go
if ! command -v go &> /dev/null; then
    echo "Installing Go 1.22..."
    wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
    rm go1.22.0.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /home/$USERNAME/.profile
    export PATH=$PATH:/usr/local/go/bin
fi

# Install Node.js (for building React app)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install Caddy
if ! command -v caddy &> /dev/null; then
    echo "Installing Caddy..."
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install -y caddy
fi

# Install Claude Code (placeholder - adjust based on actual installation method)
if ! command -v claude-code &> /dev/null; then
    echo "⚠️  Claude Code not found. Please install it manually:"
    echo "    Visit: https://docs.anthropic.com/claude-code/installation"
    echo ""
    read -p "Press Enter after installing Claude Code..."
fi

echo ""
echo "🔨 Building server..."

# Clone/copy project
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Build Go server
cd server
go mod download
go build -ldflags="-s -w" -o claude-server main.go
chmod +x claude-server

# Build React app
cd ..
npm install
npm run build

# Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/claude-server.service <<EOF
[Unit]
Description=Claude Code Mobile Server
After=network.target

[Service]
Type=simple
User=$USERNAME
WorkingDirectory=$INSTALL_DIR
Environment="AUTH_TOKEN=$AUTH_TOKEN"
Environment="REPO_PATH=$REPO_PATH"
Environment="CLAUDE_CODE_BIN=$(which claude-code)"
Environment="STATIC_DIR=$INSTALL_DIR/dist"
Environment="PORT=3456"
ExecStart=$INSTALL_DIR/server/claude-server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable claude-server
systemctl start claude-server

# Configure Caddy
echo "🔒 Configuring HTTPS..."
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    reverse_proxy localhost:3456
    tls $EMAIL
}
EOF

systemctl restart caddy

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ Installation complete!"
echo ""
echo "Your server is running at: https://$DOMAIN"
echo ""
echo "Next steps:"
echo "  1. Point your domain's DNS A record to this server's IP"
echo "  2. Wait a few minutes for Let's Encrypt to issue certificate"
echo "  3. In your phone app, set:"
echo "     - Base URL: https://$DOMAIN"
echo "     - API Key: $AUTH_TOKEN"
echo ""
echo "Useful commands:"
echo "  systemctl status claude-server  # Check server status"
echo "  journalctl -u claude-server -f  # View logs"
echo "  systemctl restart claude-server # Restart server"
echo ""

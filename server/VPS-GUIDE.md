## VPS Provider Comparison for Claude Code Mobile

Based on **1 vCPU, 2GB RAM** requirement:

### Best Value

**🥇 Hetzner Cloud (CX11)**
- **Price**: €4.15/month (~$4.50)
- **Specs**: 1 vCPU, 2GB RAM, 20GB SSD, 20TB traffic
- **Location**: Germany, Finland, USA
- **Network**: Excellent (1 Gbit/s)
- **Why**: Best price/performance ratio in Europe

### Alternatives

**Contabo VPS S**
- **Price**: €5.00/month
- **Specs**: 4 vCPU, 8GB RAM, 100GB SSD
- **Why**: Massive overkill for the price, but great if you'll run multiple services

**DigitalOcean Basic Droplet**
- **Price**: $6/month
- **Specs**: 1 vCPU, 1GB RAM, 25GB SSD
- **Why**: Good US presence, great docs, but only 1GB RAM (tight)

**Linode Nanode 1GB**
- **Price**: $5/month
- **Specs**: 1 vCPU, 1GB RAM, 25GB SSD
- **Why**: Same as DO, Akamai-backed, solid network

**Vultr Regular Cloud**
- **Price**: $6/month
- **Specs**: 1 vCPU, 2GB RAM, 55GB SSD
- **Why**: More locations than Hetzner, slightly pricier

**Oracle Cloud (Free Tier!)**
- **Price**: FREE forever
- **Specs**: 1/8 OCPU, 1GB RAM (or 4 ARM cores, 24GB if you get lucky)
- **Why**: Free, but ARM might have compatibility issues with Claude Code

### Recommendation for Your Use Case

**Hetzner CX11** for Europe/US East, or **Vultr** if you need Asian locations.

Both give you 2GB RAM which is comfortable for:
- Go server (~20MB)
- Claude Code session (~150MB)
- Git repo
- OS overhead (~300MB)
- Headroom for spikes

### Setup Cost Estimate

| Item | Cost |
|------|------|
| VPS (Hetzner CX11) | $4.50/month |
| Domain (Namecheap) | $10/year (~$0.83/month) |
| **Total** | **~$5.33/month** |

Let's Encrypt SSL is **free**, Caddy is **free**, so no hidden costs.

### Quick Deploy Commands

Once you have a VPS:

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Copy and run the install script
curl -o install.sh https://raw.githubusercontent.com/your-repo/server/install.sh
chmod +x install.sh
sudo ./install.sh

# 4. Done! Server running at https://your-domain.com
```

The install script handles:
- Installing Go, Node, Caddy, Claude Code
- Building the server binary
- Creating systemd service
- Configuring HTTPS with Let's Encrypt
- Setting up firewall

Total setup time: **~10 minutes** (mostly waiting for packages to install).

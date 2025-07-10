# HA-Fusion Installation and Deployment Guide

## Overview

This comprehensive guide covers all installation methods, deployment options, and production configurations for HA-Fusion. Whether you're setting up a development environment or deploying to production, this guide provides detailed instructions for every scenario.

## Table of Contents

1. [Installation Methods](#installation-methods)
2. [Docker Deployment](#docker-deployment)
3. [Home Assistant Add-on](#home-assistant-add-on)
4. [Development Setup](#development-setup)
5. [Production Deployment](#production-deployment)
6. [Containerization](#containerization)
7. [Orchestration](#orchestration)
8. [Network Configuration](#network-configuration)
9. [Security Configuration](#security-configuration)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Backup and Recovery](#backup-and-recovery)

## Installation Methods

HA-Fusion supports multiple installation methods depending on your Home Assistant setup and requirements:

### Supported Installation Methods

| Method | Home Assistant Type | Complexity | Recommended For |
|--------|-------------------|------------|-----------------|
| [Add-on](#home-assistant-add-on) | OS, Supervised | Low | Most users |
| [Docker](#docker-deployment) | Container, Core | Medium | Advanced users |
| [Development](#development-setup) | Any | High | Developers |
| [Manual Build](#manual-build) | Any | High | Custom deployments |

### Prerequisites

#### System Requirements

**Minimum Requirements:**
- RAM: 512MB available
- CPU: 1 core
- Storage: 1GB free space
- Network: Home Assistant access

**Recommended Requirements:**
- RAM: 1GB available
- CPU: 2 cores
- Storage: 2GB free space
- Network: Gigabit connection

#### Software Requirements

- Home Assistant (any installation method)
- Docker (for container deployments)
- Node.js 18+ (for development)
- Git (for development)

## Docker Deployment

### Quick Start

#### Basic Docker Run

```bash
docker run -d \
  --name ha-fusion \
  --network bridge \
  -p 5050:5050 \
  -v /path/to/ha-fusion:/app/data \
  -e TZ=Europe/Stockholm \
  -e HASS_URL=http://192.168.1.241:8123 \
  --restart always \
  ghcr.io/matt8707/ha-fusion
```

#### Docker Compose (Recommended)

Create [`docker-compose.yml`](docker-compose.yml):

```yaml
services:
  ha-fusion:
    container_name: ha-fusion
    image: ghcr.io/matt8707/ha-fusion
    volumes:
      - /path/to/ha-fusion:/app/data
    network_mode: bridge
    ports:
      - 5050:5050
    environment:
      TZ: Europe/Stockholm
      HASS_URL: http://192.168.1.241:8123
    restart: always
```

Deploy with Docker Compose:

```bash
# Start the service
docker-compose up -d ha-fusion

# View logs
docker-compose logs -f ha-fusion

# Stop the service
docker-compose down
```

### Docker Configuration

#### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HASS_URL` | Yes | - | Home Assistant URL |
| `TZ` | No | `UTC` | Container timezone |
| `NODE_ENV` | No | `production` | Node.js environment |
| `PORT` | No | `5050` | Internal port |

#### Volume Mounts

| Host Path | Container Path | Purpose |
|-----------|----------------|---------|
| `/path/to/data` | `/app/data` | Configuration storage |
| `/path/to/themes` | `/app/build/client/themes` | Custom themes (optional) |
| `/path/to/translations` | `/app/build/client/translations` | Custom translations (optional) |

### Docker Updates

#### Manual Update

```bash
# Stop container
docker stop ha-fusion

# Remove container
docker rm ha-fusion

# Pull latest image
docker pull ghcr.io/matt8707/ha-fusion:latest

# Start new container with same configuration
docker run -d \
  --name ha-fusion \
  -p 5050:5050 \
  -v /path/to/ha-fusion:/app/data \
  -e TZ=Europe/Stockholm \
  -e HASS_URL=http://192.168.1.241:8123 \
  --restart always \
  ghcr.io/matt8707/ha-fusion
```

#### Docker Compose Update

```bash
# Pull latest image
docker-compose pull ha-fusion

# Recreate container
docker-compose up -d ha-fusion
```

## Home Assistant Add-on

### Installation

#### Add Repository

1. **Automatic Method:**
   [![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fmatt8707%2Faddon-ha-fusion)

2. **Manual Method:**
   - Go to Supervisor → Add-on Store
   - Click menu (⋮) → Repositories
   - Add: `https://github.com/matt8707/addon-ha-fusion`

#### Install Add-on

1. Refresh Add-on Store
2. Find "HA-Fusion" in the list
3. Click "Install"
4. Wait for installation to complete

### Add-on Configuration

#### Basic Configuration

```yaml
# Add-on configuration
log_level: info
ssl: false
certfile: fullchain.pem
keyfile: privkey.pem
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `log_level` | `string` | `info` | Logging level |
| `ssl` | `boolean` | `false` | Enable SSL |
| `certfile` | `string` | `fullchain.pem` | SSL certificate file |
| `keyfile` | `string` | `privkey.pem` | SSL private key file |

### Add-on Management

#### Starting the Add-on

1. Go to Supervisor → HA-Fusion
2. Click "Start"
3. Enable "Start on boot" (recommended)
4. Enable "Watchdog" (recommended)

#### Accessing Logs

1. Go to Supervisor → HA-Fusion
2. Click "Log" tab
3. View real-time logs

## Development Setup

### Prerequisites

#### Required Software

```bash
# macOS (using Homebrew)
brew install node pnpm git

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm git
sudo npm install -g pnpm

# Windows (using Chocolatey)
choco install nodejs git
npm install -g pnpm
```

### Installation

#### Clone Repository

```bash
# Clone the repository
git clone https://github.com/matt8707/ha-fusion.git
cd ha-fusion

# Install dependencies
pnpm install
```

#### Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
code .env  # or your preferred editor
```

Environment file (`.env`):
```bash
# Home Assistant URL
HASS_URL=http://192.168.1.241:8123
```

### Development Commands

#### Available Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm check` | Type checking |
| `pnpm check:watch` | Watch mode type checking |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code |

#### Development Server

```bash
# Start development server
pnpm dev

# Start with specific port
pnpm dev --port 3000

# Start with host binding
pnpm dev --host 0.0.0.0

# Open browser automatically
pnpm dev --open
```

## Production Deployment

### Environment-Specific Configuration

#### Production Environment Variables

```bash
# Production .env
NODE_ENV=production
HASS_URL=https://your-ha-instance.com
TZ=UTC
LOG_LEVEL=warn
```

### Reverse Proxy Configuration

#### Nginx Configuration

```nginx
# nginx.conf
upstream ha-fusion {
    server localhost:5050;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/fullchain.pem;
    ssl_certificate_key /etc/ssl/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    location / {
        proxy_pass http://ha-fusion;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### SSL/TLS Configuration

#### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Network Configuration

### Port Configuration

#### Default Ports

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| HA-Fusion | 5050 | HTTP | Web interface |
| Home Assistant | 8123 | HTTP/HTTPS | API communication |

#### Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 5050/tcp comment "HA-Fusion"
sudo ufw allow from 192.168.1.0/24 to any port 5050

# iptables
sudo iptables -A INPUT -p tcp --dport 5050 -j ACCEPT
sudo iptables -A INPUT -s 192.168.1.0/24 -p tcp --dport 5050 -j ACCEPT
```

## Security Configuration

### Authentication Security

#### Token Management

```bash
# Generate secure token storage
mkdir -p /secure/ha-fusion
chmod 700 /secure/ha-fusion

# Store token securely
echo "your-long-lived-token" > /secure/ha-fusion/token
chmod 600 /secure/ha-fusion/token
```

#### Docker Secrets

```yaml
# docker-compose with secrets
services:
  ha-fusion:
    image: ghcr.io/matt8707/ha-fusion:latest
    secrets:
      - ha_token
    environment:
      - HASS_TOKEN_FILE=/run/secrets/ha_token

secrets:
  ha_token:
    file: ./secrets/ha_token.txt
```

### Network Security

#### Security Best Practices

1. **Use HTTPS in production**
2. **Configure proper firewall rules**
3. **Use strong SSL/TLS configuration**
4. **Implement proper authentication**
5. **Regular security updates**

## Performance Optimization

### Container Optimization

#### Resource Limits

```yaml
services:
  ha-fusion:
    image: ghcr.io/matt8707/ha-fusion:latest
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

#### Performance Tuning

```yaml
# Optimized configuration
environment:
  - NODE_ENV=production
  - NODE_OPTIONS=--max-old-space-size=256
```

### Application Performance

#### Configuration Optimization

```yaml
# configuration.yaml - Performance settings
locale: en
motion: false  # Disable animations for better performance
```

#### Dashboard Optimization

```yaml
# dashboard.yaml - Optimized layout
hide_sidebar: false
sidebarWidth: 300  # Smaller sidebar
views:
  - name: Home
    sections:
      - name: Essential
        items:
          # Limit to essential items only
```

## Monitoring and Logging

### Container Monitoring

#### Health Checks

```yaml
services:
  ha-fusion:
    image: ghcr.io/matt8707/ha-fusion:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5050"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Log Management

```yaml
services:
  ha-fusion:
    image: ghcr.io/matt8707/ha-fusion:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Application Monitoring

#### Log Levels

```bash
# Environment variable for log level
LOG_LEVEL=info  # debug, info, warn, error
```

#### Monitoring Commands

```bash
# View logs
docker logs ha-fusion --tail 100 -f

# Monitor resource usage
docker stats ha-fusion

# Check health status
docker inspect ha-fusion | grep Health -A 10
```

## Backup and Recovery

### Configuration Backup

#### Essential Files to Backup

- `data/configuration.yaml`
- `data/dashboard.yaml`
- `data/custom_javascript.js` (if used)
- Custom theme files
- SSL certificates

#### Automated Backup Script

```bash
#!/bin/bash
# backup-ha-fusion.sh

BACKUP_DIR="/backup/ha-fusion/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copy configuration files
cp -r data/ "$BACKUP_DIR/"

# Copy custom themes (if any)
cp -r static/themes/ "$BACKUP_DIR/themes/" 2>/dev/null || true

echo "Backup completed: $BACKUP_DIR"
```

### Disaster Recovery

#### Recovery Process

1. **Stop HA-Fusion**
   ```bash
   docker stop ha-fusion
   ```

2. **Restore Configuration**
   ```bash
   # Restore from backup
   cp -r /backup/ha-fusion/latest/data/* ./data/
   ```

3. **Start HA-Fusion**
   ```bash
   docker start ha-fusion
   ```

4. **Verify Operation**
   ```bash
   # Check logs
   docker logs ha-fusion --tail 50
   
   # Test web interface
   curl -f http://localhost:5050
   ```

#### Backup Verification

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_DIR="$1"

# Check required files
if [[ -f "$BACKUP_DIR/data/configuration.yaml" && -f "$BACKUP_DIR/data/dashboard.yaml" ]]; then
    echo "✓ Backup verification passed"
    
    # Validate YAML syntax
    python3 -c "import yaml; yaml.safe_load(open('$BACKUP_DIR/data/configuration.yaml'))" && \
    python3 -c "import yaml; yaml.safe_load(open('$BACKUP_DIR/data/dashboard.yaml'))" && \
    echo "✓ YAML syntax validation passed"
else
    echo "✗ Backup verification failed"
    exit 1
fi
```

## Troubleshooting

### Common Issues

#### Connection Issues

```bash
# Check Home Assistant connectivity
curl -f $HASS_URL/api/

# Check HA-Fusion logs
docker logs ha-fusion --tail 100

# Verify network connectivity
docker exec ha-fusion ping homeassistant
```

#### Configuration Issues

```bash
# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('data/configuration.yaml'))"
python3 -c "import yaml; yaml.safe_load(open('data/dashboard.yaml'))"

# Check file permissions
ls -la data/
```

#### Performance Issues

```bash
# Monitor resource usage
docker stats ha-fusion

# Check system resources
free -h
df -h
```

### Debug Mode

#### Enable Debug Logging

```yaml
# docker-compose.yml
services:
  ha-fusion:
    environment:
      - LOG_LEVEL=debug
```

#### Debug Commands

```bash
# Detailed container inspection
docker inspect ha-fusion

# Process monitoring
docker exec ha-fusion ps aux

# Network debugging
docker exec ha-fusion netstat -tlnp
```

## Migration and Updates

### Version Compatibility

#### Check Current Version

```bash
# Check installed version
curl http://localhost:5050/_api/version

# Compare with latest release
curl -s https://api.github.com/repos/matt8707/ha-fusion/releases/latest | grep tag_name
```

### Migration Checklist

#### Pre-migration

1. **Backup Configuration**
   ```bash
   ./backup-ha-fusion.sh
   ```

2. **Document Current Setup**
   ```bash
   docker inspect ha-fusion > pre-migration-config.json
   ```

3. **Test Backup Restore**
   ```bash
   ./verify-backup.sh /backup/ha-fusion/latest
   ```

#### Migration Process

1. **Stop Current Instance**
   ```bash
   docker-compose down
   ```

2. **Update Image**
   ```bash
   docker-compose pull
   ```

3. **Start New Instance**
   ```bash
   docker-compose up -d
   ```

4. **Verify Operation**
   ```bash
   docker-compose logs -f ha-fusion
   ```

#### Post-migration

1. **Verify All Components Work**
2. **Check for Deprecated Features**
3. **Update Documentation**
4. **Clean Up Old Images**
   ```bash
   docker image prune
   ```

## Best Practices

### Deployment Best Practices

1. **Use Docker Compose for consistency**
2. **Implement proper backup strategy**
3. **Monitor resource usage**
4. **Keep configurations in version control**
5. **Use environment-specific configurations**
6. **Implement health checks**
7. **Use proper logging configuration**
8. **Regular security updates**

### Security Best Practices

1. **Use HTTPS in production**
2. **Implement proper authentication**
3. **Regular token rotation**
4. **Network segmentation**
5. **Regular security audits**
6. **Principle of least privilege**
7. **Secure backup storage**
8. **Monitor access logs**

### Performance Best Practices

1. **Optimize resource allocation**
2. **Use appropriate hardware**
3. **Monitor performance metrics**
4. **Optimize configuration**
5. **Regular maintenance**
6. **Capacity planning**
7. **Load testing**
8. **Performance monitoring**

## Conclusion

This installation and deployment guide provides comprehensive coverage of all deployment scenarios for HA-Fusion. Choose the method that best fits your environment and requirements. For additional support:

- Check the [GitHub repository](https://github.com/matt8707/ha-fusion)
- Review troubleshooting guides
- Join community discussions
- Report issues or request features

Remember to always backup your configuration before making changes and test thoroughly in a development environment when possible.
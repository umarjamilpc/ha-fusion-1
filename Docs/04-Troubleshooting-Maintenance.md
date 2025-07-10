# HA-Fusion Troubleshooting and Maintenance Guide

## Overview

This comprehensive guide covers common issues, troubleshooting procedures, maintenance tasks, and operational best practices for HA-Fusion deployments. Whether you're dealing with connection problems, performance issues, or planning routine maintenance, this guide provides systematic approaches to resolve issues and maintain optimal performance.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Connection Problems](#connection-problems)
3. [Configuration Issues](#configuration-issues)
4. [Performance Problems](#performance-problems)
5. [Authentication Issues](#authentication-issues)
6. [Theme and UI Problems](#theme-and-ui-problems)
7. [API and Integration Issues](#api-and-integration-issues)
8. [Container and Deployment Issues](#container-and-deployment-issues)
9. [Maintenance Procedures](#maintenance-procedures)
10. [Monitoring and Alerting](#monitoring-and-alerting)
11. [Backup and Recovery](#backup-and-recovery)
12. [Performance Optimization](#performance-optimization)
13. [Security Maintenance](#security-maintenance)
14. [Diagnostic Tools](#diagnostic-tools)
15. [Support and Community](#support-and-community)

## Common Issues

### Quick Diagnosis Checklist

Before diving into specific troubleshooting, run through this quick checklist:

```bash
# 1. Check if HA-Fusion is running
curl -f http://localhost:5050 || echo "HA-Fusion not responding"

# 2. Check Home Assistant connectivity
curl -f $HASS_URL/api/ || echo "Home Assistant not accessible"

# 3. Check container status (if using Docker)
docker ps | grep ha-fusion

# 4. Check logs for errors
docker logs ha-fusion --tail 50 | grep -i error

# 5. Check configuration syntax
python3 -c "import yaml; yaml.safe_load(open('data/configuration.yaml'))"
python3 -c "import yaml; yaml.safe_load(open('data/dashboard.yaml'))"
```

### Most Common Issues

| Issue | Frequency | Typical Cause | Quick Fix |
|-------|-----------|---------------|-----------|
| Blank/White Screen | Very High | Authentication failure | Check HASS_URL and token |
| Connection Lost | High | Network/HA restart | Wait for reconnection |
| Configuration Not Saving | Medium | File permissions | Check data directory permissions |
| Theme Not Loading | Medium | Invalid theme file | Validate theme YAML syntax |
| Slow Performance | Medium | Resource constraints | Check system resources |

## Connection Problems

### Home Assistant Connection Issues

#### Symptoms
- Blank white screen
- "Connecting..." message persists
- Authentication errors in logs
- Entities not updating

#### Diagnostic Steps

```bash
# 1. Verify Home Assistant URL
echo "Testing connection to: $HASS_URL"
curl -v "$HASS_URL/api/" 2>&1 | head -20

# 2. Check network connectivity
ping -c 4 $(echo $HASS_URL | sed 's|http[s]*://||' | cut -d: -f1)

# 3. Test API endpoint
curl -H "Authorization: Bearer $HASS_TOKEN" "$HASS_URL/api/states" | head -100

# 4. Check WebSocket connectivity
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: $(openssl rand -base64 16)" \
     "$HASS_URL/api/websocket"
```

#### Common Solutions

##### 1. Incorrect HASS_URL

```bash
# Check current configuration
grep -i hass_url data/configuration.yaml

# Update HASS_URL
export HASS_URL="http://your-correct-ha-url:8123"

# For Docker
docker run -e HASS_URL="http://192.168.1.100:8123" ...
```

##### 2. Network Connectivity Issues

```bash
# Check if Home Assistant is accessible
telnet homeassistant-ip 8123

# Check DNS resolution
nslookup your-ha-domain.com

# Check firewall rules
sudo ufw status | grep 8123
```

##### 3. SSL/TLS Certificate Issues

```bash
# Test SSL connection
openssl s_client -connect your-ha-domain.com:443 -servername your-ha-domain.com

# Check certificate validity
curl -vI https://your-ha-domain.com 2>&1 | grep -E "(certificate|SSL)"
```

#### Advanced Connection Troubleshooting

##### WebSocket Connection Debugging

```javascript
// Browser console debugging
const ws = new WebSocket('ws://your-ha-url:8123/api/websocket');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
ws.onmessage = (event) => console.log('Message:', event.data);
```

##### Proxy Configuration Issues

```nginx
# Nginx proxy configuration for WebSocket
location / {
    proxy_pass http://ha-fusion:5050;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Network Timeout Issues

#### Symptoms
- Intermittent connection drops
- Slow loading times
- Timeout errors in logs

#### Solutions

```yaml
# docker-compose.yml - Increase timeouts
services:
  ha-fusion:
    environment:
      - TIMEOUT=60000  # 60 seconds
      - KEEPALIVE_TIMEOUT=65000
```

```nginx
# Nginx timeout configuration
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
proxy_buffering off;
```

## Configuration Issues

### YAML Syntax Errors

#### Symptoms
- Configuration not loading
- Error messages about YAML parsing
- Default configuration being used

#### Diagnostic Commands

```bash
# Validate YAML syntax
python3 -c "import yaml; print('Valid YAML')" -c "yaml.safe_load(open('data/configuration.yaml'))" 2>/dev/null || echo "Invalid configuration.yaml"

python3 -c "import yaml; print('Valid YAML')" -c "yaml.safe_load(open('data/dashboard.yaml'))" 2>/dev/null || echo "Invalid dashboard.yaml"

# Check for common YAML issues
grep -n "	" data/*.yaml && echo "Found tabs (use spaces instead)"
grep -n "^[[:space:]]*-[[:space:]]*$" data/*.yaml && echo "Found empty list items"
```

#### Common YAML Mistakes

##### 1. Indentation Issues

```yaml
# ❌ Incorrect (mixed tabs and spaces)
views:
	- name: Home
  	  sections: []

# ✅ Correct (consistent spaces)
views:
  - name: Home
    sections: []
```

##### 2. Missing Quotes

```yaml
# ❌ Incorrect (special characters without quotes)
name: Living Room: Main Light

# ✅ Correct (quoted strings with special characters)
name: "Living Room: Main Light"
```

##### 3. Invalid List Structure

```yaml
# ❌ Incorrect (missing dash)
views:
  name: Home
  sections: []

# ✅ Correct (proper list item)
views:
  - name: Home
    sections: []
```

### Configuration Validation Script

```bash
#!/bin/bash
# validate-config.sh - Comprehensive configuration validation

echo "Validating HA-Fusion configuration..."

# Check file existence
for file in "data/configuration.yaml" "data/dashboard.yaml"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Missing file: $file"
        exit 1
    fi
done

# Validate YAML syntax
for file in data/*.yaml; do
    if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
        echo "✅ Valid YAML: $file"
    else
        echo "❌ Invalid YAML: $file"
        python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>&1
        exit 1
    fi
done

# Check required fields
if ! grep -q "locale:" data/configuration.yaml; then
    echo "⚠️  Warning: No locale specified in configuration.yaml"
fi

if ! grep -q "views:" data/dashboard.yaml; then
    echo "❌ Error: No views defined in dashboard.yaml"
    exit 1
fi

# Check entity ID format
if grep -E "entity_id: [^a-z]" data/dashboard.yaml; then
    echo "⚠️  Warning: Entity IDs should start with lowercase letter"
fi

echo "✅ Configuration validation completed"
```

### File Permission Issues

#### Symptoms
- Cannot save configuration
- "Permission denied" errors
- Configuration changes not persisting

#### Solutions

```bash
# Check current permissions
ls -la data/

# Fix permissions
sudo chown -R $(whoami):$(whoami) data/
chmod -R 644 data/*.yaml
chmod 755 data/

# For Docker deployments
sudo chown -R 1000:1000 data/  # Adjust UID/GID as needed
```

## Performance Problems

### Slow Loading Times

#### Symptoms
- Dashboard takes long to load
- Slow response to user interactions
- High CPU/memory usage

#### Diagnostic Steps

```bash
# 1. Check system resources
htop
free -h
df -h

# 2. Monitor container resources (Docker)
docker stats ha-fusion

# 3. Check network latency
ping -c 10 $(echo $HASS_URL | sed 's|http[s]*://||' | cut -d: -f1)

# 4. Profile application performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5050
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

#### Performance Optimization

##### 1. Disable Animations

```yaml
# configuration.yaml
motion: false  # Disable animations for better performance
```

##### 2. Optimize Dashboard Layout

```yaml
# dashboard.yaml - Reduce complexity
views:
  - name: Essential
    sections:
      - name: Critical Controls
        items:
          # Limit to 10-15 essential items
```

##### 3. Container Resource Limits

```yaml
# docker-compose.yml
services:
  ha-fusion:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
```

##### 4. Browser Performance

```javascript
// Disable browser features that may impact performance
// Add to custom JavaScript
if (window.performance && window.performance.mark) {
  window.performance.mark('ha-fusion-start');
}

// Disable service worker if causing issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
```

### Memory Leaks

#### Symptoms
- Gradually increasing memory usage
- Browser becomes unresponsive over time
- Need to refresh page frequently

#### Diagnostic Tools

```bash
# Monitor memory usage over time
while true; do
  echo "$(date): $(docker stats ha-fusion --no-stream --format 'table {{.MemUsage}}')"
  sleep 60
done

# Browser memory profiling
# Open Chrome DevTools → Memory tab → Take heap snapshots
```

#### Solutions

```javascript
// Add to custom JavaScript for memory leak prevention
// Cleanup event listeners
window.addEventListener('beforeunload', function() {
  // Cleanup code here
  if (window.haFusionCleanup) {
    window.haFusionCleanup();
  }
});

// Periodic garbage collection hint
setInterval(() => {
  if (window.gc) {
    window.gc();
  }
}, 300000); // Every 5 minutes
```

## Authentication Issues

### Token Authentication Problems

#### Symptoms
- "Invalid authentication" errors
- Repeated login prompts
- API calls returning 401/403 errors

#### Diagnostic Steps

```bash
# 1. Check token validity
curl -H "Authorization: Bearer $HASS_TOKEN" "$HASS_URL/api/" | jq .

# 2. Verify token in configuration
grep -A5 -B5 "token:" data/configuration.yaml

# 3. Check token format
echo $HASS_TOKEN | wc -c  # Should be > 100 characters
```

#### Solutions

##### 1. Generate New Long-lived Access Token

1. Open Home Assistant
2. Go to Profile → Security
3. Create Long-lived Access Token
4. Update configuration:

```yaml
# configuration.yaml
token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

##### 2. Clear Stored Authentication

```bash
# Clear browser storage
# In browser console:
localStorage.clear();
sessionStorage.clear();

# Clear Docker container data
docker exec ha-fusion rm -f /app/data/.auth_cache
```

##### 3. OAuth Flow Issues

```bash
# Check OAuth redirect URL
echo "Current URL: $(curl -s http://localhost:5050 | grep -o 'auth_callback=1')"

# Clear OAuth state
# In browser: Clear cookies for the domain
```

### Companion App Authentication

#### Symptoms
- Token modal not appearing
- Authentication fails in companion app
- Redirect loops

#### Solutions

```javascript
// Force token modal in companion app
if (navigator.userAgent.includes('Home Assistant')) {
  // Clear any existing auth
  localStorage.removeItem('hassTokens');
  
  // Force token input
  window.location.reload();
}
```

## Theme and UI Problems

### Theme Not Loading

#### Symptoms
- Default theme being used instead of selected theme
- CSS styles not applying
- Theme switching not working

#### Diagnostic Steps

```bash
# 1. Check theme file exists
ls -la static/themes/your-theme.yaml

# 2. Validate theme YAML
python3 -c "import yaml; yaml.safe_load(open('static/themes/your-theme.yaml'))"

# 3. Check theme API
curl -X POST http://localhost:5050/_api/load_theme \
  -H "Content-Type: application/json" \
  -d '{"theme": "your-theme"}'

# 4. Verify theme in dashboard config
grep "theme:" data/dashboard.yaml
```

#### Common Theme Issues

##### 1. Theme File Structure

```yaml
# ❌ Incorrect structure
title: my-theme
colors:
  text: "#ffffff"

# ✅ Correct structure
title: my-theme
author: Your Name
attribution: ""
theme:
  colors-text: "#ffffff"
  colors-icon: "#cccccc"
```

##### 2. CSS Property Names

```yaml
# ❌ Incorrect (CSS property names)
theme:
  color: "#ffffff"
  background-color: "#000000"

# ✅ Correct (HA-Fusion custom properties)
theme:
  colors-text: "#ffffff"
  colors-sidebar-background: "#000000"
```

##### 3. File Naming

```bash
# Theme file name must match title
# File: static/themes/my-custom-theme.yaml
# YAML: title: my-custom-theme
```

### UI Layout Issues

#### Symptoms
- Components overlapping
- Responsive layout broken
- Sidebar not displaying correctly

#### Solutions

##### 1. Clear Browser Cache

```bash
# Hard refresh in browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (macOS)
```

##### 2. Check Viewport Settings

```html
<!-- Ensure proper viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

##### 3. CSS Debugging

```javascript
// Browser console debugging
// Check computed styles
const element = document.querySelector('#layout');
console.log(getComputedStyle(element));

// Check for CSS conflicts
document.querySelectorAll('*').forEach(el => {
  const styles = getComputedStyle(el);
  if (styles.position === 'fixed' && styles.zIndex > 1000) {
    console.log('High z-index element:', el);
  }
});
```

## API and Integration Issues

### API Endpoints Not Responding

#### Symptoms
- 404 errors on API calls
- Timeouts on API requests
- Malformed responses

#### Diagnostic Steps

```bash
# 1. Test basic API connectivity
curl -v http://localhost:5050/_api/version

# 2. Check all API endpoints
for endpoint in version get_all_themes list_languages; do
  echo "Testing /_api/$endpoint"
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5050/_api/$endpoint
  echo
done

# 3. Test POST endpoints
curl -X POST http://localhost:5050/_api/load_theme \
  -H "Content-Type: application/json" \
  -d '{"theme": "godis"}' \
  -w "%{http_code}\n"
```

#### Solutions

##### 1. Check Server Status

```bash
# Verify server is running
netstat -tlnp | grep :5050

# Check process status
ps aux | grep node
```

##### 2. Restart Application

```bash
# Docker restart
docker restart ha-fusion

# Development restart
pkill -f "vite dev"
pnpm dev
```

### Home Assistant Integration Issues

#### Symptoms
- Entities not updating
- Service calls failing
- State changes not reflected

#### Diagnostic Steps

```bash
# 1. Test Home Assistant API directly
curl -H "Authorization: Bearer $HASS_TOKEN" \
  "$HASS_URL/api/states" | jq '.[] | select(.entity_id == "light.living_room")'

# 2. Check WebSocket connection
# Browser console:
# Look for WebSocket connection in Network tab

# 3. Verify entity IDs
curl -H "Authorization: Bearer $HASS_TOKEN" \
  "$HASS_URL/api/states" | jq -r '.[].entity_id' | grep light
```

#### Solutions

##### 1. Refresh Entity Registry

```bash
# Restart Home Assistant to refresh entity registry
# Or use Home Assistant Developer Tools → Services
# Call: homeassistant.reload_config_entry
```

##### 2. Check Entity Availability

```yaml
# In dashboard.yaml, add availability checks
- type: button
  entity_id: light.living_room
  visibility:
    conditions:
      - condition: state
        entity: light.living_room
        state_not: "unavailable"
```

## Container and Deployment Issues

### Docker Container Problems

#### Container Won't Start

```bash
# Check container logs
docker logs ha-fusion

# Check container configuration
docker inspect ha-fusion | jq '.Config'

# Verify image integrity
docker pull ghcr.io/matt8707/ha-fusion:latest
```

#### Volume Mount Issues

```bash
# Check volume permissions
ls -la /path/to/ha-fusion/data/

# Fix permissions
sudo chown -R 1000:1000 /path/to/ha-fusion/data/

# Verify mount points
docker inspect ha-fusion | jq '.Mounts'
```

#### Network Connectivity

```bash
# Test container network
docker exec ha-fusion ping -c 3 8.8.8.8

# Check port binding
docker port ha-fusion

# Test internal connectivity
docker exec ha-fusion curl -f http://localhost:5050
```

### Docker Compose Issues

#### Service Dependencies

```yaml
# Ensure proper service dependencies
services:
  ha-fusion:
    depends_on:
      - homeassistant
    restart: unless-stopped
```

#### Environment Variable Issues

```bash
# Check environment variables
docker exec ha-fusion env | grep HASS

# Debug environment loading
docker exec ha-fusion node -e "console.log(process.env.HASS_URL)"
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Tasks

```bash
#!/bin/bash
# daily-maintenance.sh

# Check service health
curl -f http://localhost:5050/_api/version || echo "Service unhealthy"

# Check disk space
df -h | awk '$5 > 80 {print "Warning: " $0}'

# Check memory usage
free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'

# Rotate logs if needed
docker logs ha-fusion --tail 1000 > /var/log/ha-fusion-$(date +%Y%m%d).log
```

#### Weekly Tasks

```bash
#!/bin/bash
# weekly-maintenance.sh

# Update container image
docker pull ghcr.io/matt8707/ha-fusion:latest

# Backup configuration
./backup-config.sh

# Clean up old logs
find /var/log -name "ha-fusion-*.log" -mtime +7 -delete

# Check for updates
curl -s https://api.github.com/repos/matt8707/ha-fusion/releases/latest | \
  jq -r '.tag_name' > /tmp/latest-version

if [ -f /tmp/current-version ]; then
  if ! diff -q /tmp/current-version /tmp/latest-version > /dev/null; then
    echo "Update available: $(cat /tmp/latest-version)"
  fi
fi
```

#### Monthly Tasks

```bash
#!/bin/bash
# monthly-maintenance.sh

# Full system backup
tar -czf /backup/ha-fusion-full-$(date +%Y%m%d).tar.gz \
  data/ static/themes/ docker-compose.yml

# Security audit
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ghcr.io/matt8707/ha-fusion:latest

# Performance review
docker stats ha-fusion --no-stream > /tmp/performance-$(date +%Y%m%d).txt

# Configuration cleanup
# Remove unused themes, old backups, etc.
```

### Update Procedures

#### Minor Updates

```bash
#!/bin/bash
# minor-update.sh

echo "Starting minor update..."

# Backup current configuration
./backup-config.sh

# Pull latest image
docker pull ghcr.io/matt8707/ha-fusion:latest

# Restart with new image
docker-compose up -d ha-fusion

# Verify update
sleep 10
curl -f http://localhost:5050/_api/version || {
  echo "Update failed, rolling back..."
  docker-compose down
  docker run --name ha-fusion-rollback \
    -v $(pwd)/data:/app/data \
    -p 5050:5050 \
    ghcr.io/matt8707/ha-fusion:previous-tag
  exit 1
}

echo "Update completed successfully"
```

#### Major Updates

```bash
#!/bin/bash
# major-update.sh

echo "Starting major update..."

# Full backup
tar -czf /backup/pre-update-$(date +%Y%m%d).tar.gz .

# Read release notes
curl -s https://api.github.com/repos/matt8707/ha-fusion/releases/latest | \
  jq -r '.body' > /tmp/release-notes.txt

echo "Release notes:"
cat /tmp/release-notes.txt

read -p "Continue with update? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# Stop current instance
docker-compose down

# Update configuration if needed
# (Check release notes for breaking changes)

# Start with new version
docker-compose up -d

# Verify functionality
sleep 30
./health-check.sh || {
  echo "Health check failed, manual intervention required"
  exit 1
}

echo "Major update completed"
```

### Configuration Management

#### Version Control Integration

```bash
#!/bin/bash
# config-version-control.sh

# Initialize git repository for configuration
cd data/
git init
git add *.yaml
git commit -m "Initial configuration"

# Create update script
cat > ../update-config.sh << 'EOF'
#!/bin/bash
cd data/
git add -A
git commit -m "Configuration update: $(date)"
git tag "config-$(date +%Y%m%d-%H%M%S)"
EOF

chmod +x ../update-config.sh
```

#### Configuration Validation Pipeline

```bash
#!/bin/bash
# validate-and-deploy.sh

# Validate configuration
./validate-config.sh || {
  echo "Configuration validation failed"
  exit 1
}

# Test in staging environment
docker run --rm \
  -v $(pwd)/data:/app/data \
  -e HASS_URL="$STAGING_HASS_URL" \
  -p 5051:5050 \
  ghcr.io/matt8707/ha-fusion:latest &

STAGING_PID=$!
sleep 10

# Test staging deployment
if curl -f http://localhost:5051/_api/version; then
  echo "Staging test passed"
  kill $STAGING_PID
  
  # Deploy to production
  docker-compose up -d ha-fusion
else
  echo "Staging test failed"
  kill $STAGING_PID
  exit 1
fi
```

## Monitoring and Alerting

### Health Monitoring

#### Comprehensive Health Check

```bash
#!/bin/bash
# comprehensive-health-check.sh

HEALTH_STATUS=0

# Check service availability
if ! curl -f -s http://localhost:5050/_api/version > /dev/null; then
  echo "❌ Service unavailable"
  HEALTH_STATUS=1
else
  echo "✅ Service available"
fi

# Check Home Assistant connectivity
if ! curl -f -s "$HASS_URL/api/" > /dev/null; then
  echo "❌ Home Assistant unreachable"
  HEALTH_STATUS=1
else
  echo "✅ Home Assistant reachable"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
  echo "❌ Disk usage critical: ${DISK_USAGE}%"
  HEALTH_STATUS=1
else
  echo "✅ Disk usage normal: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
  echo "❌ Memory usage critical: ${MEMORY_USAGE}%"
  HEALTH_STATUS=1
else
  echo "✅ Memory usage normal: ${MEMORY_USAGE}%"
fi

# Check container status (if using Docker)
if command -v docker > /dev/null; then
  if ! docker ps | grep -q ha-fusion; then
    echo "❌ Container not running"
    HEALTH_STATUS=1
  else
    echo "✅ Container running"
  fi
fi

exit $HEALTH_STATUS
```

#### Automated Alerting

```bash
#!/bin/bash
# alert-system.sh

# Configuration
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
EMAIL="admin@yourdomain.com"

send_alert() {
  local message="$1"
  local severity="$2"
  
  # Slack notification
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 HA-Fusion Alert [$severity]: $message\"}" \
    "$WEBHOOK_URL"
  
  # Email notification
  echo "$message" | mail -s "HA-Fusion Alert [$severity]" "$EMAIL"
  
  # Log alert
  echo "$(date): [$severity] $message" >> /var/log/ha-fusion-alerts.log
}

# Run health check and alert on failures
if ! ./comprehensive-health-check.sh; then
  send_alert "Health check failed" "CRITICAL"
fi

# Check for specific issues
if ! curl -f -s http://localhost:5050/_api/version > /dev/null; then
  send_alert "HA-Fusion service is down" "CRITICAL"
fi

# Monitor resource usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -gt 85 ]; then
  send_alert "High memory usage: ${MEMORY_USAGE}%" "WARNING"
fi
```

### Performance Monitoring

#### Resource Usage Tracking

```bash
#!/bin/bash
# performance-monitor.sh

LOG_FILE="/var/log/ha-fusion-performance.log"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  # System metrics
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
  MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
  DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
  
  # Container metrics (if using Docker)
  if command -v docker > /dev/null && docker ps | grep -q ha-fusion; then
    CONTAINER_STATS=$(docker stats ha-fusion --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}")
    CONTAINER_CPU=$(echo "$CONTAINER_STATS" | tail -n1 | awk '{print $1}')
    CONTAINER_MEM=$(echo "$CONTAINER_STATS" | tail -n1 | awk '{print $2}')
  else
    CONTAINER_CPU="N/A"
    CONTAINER_MEM="N/A"
  fi
  
  # Application metrics
  RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:5050/_api/version)
  
  # Log metrics
  echo "$TIMESTAMP,CPU:$CPU_USAGE,MEM:$MEMORY_USAGE%,DISK:$DISK_USAGE%,CONTAINER_CPU:$CONTAINER_CPU,CONTAINER_MEM:$CONTAINER_MEM,RESPONSE:${RESPONSE_TIME}s" >> "$LOG_FILE"
  
  sleep 60
done
```

#### Performance Analysis

```bash
#!/bin/bash
# analyze-performance.sh

LOG_FILE="/var/log/ha-fusion-performance.log"

echo "Performance Analysis Report"
echo "=========================="
echo

# Average response time
echo "Average Response Time (last 24h):"
tail -n 1440 "$LOG_FILE" | awk -F'RESPONSE:' '{print $2}' | awk -F's' '{sum+=$1; count++} END {printf "%.3f seconds\n", sum/count}'

# Peak memory usage
echo "Peak Memory Usage (last 24h):"
tail -n 1440 "$LOG_FILE" | awk -F'MEM:' '{print $2}' | awk -F
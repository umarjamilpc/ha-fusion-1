# HA-Fusion API Reference

## Overview

HA-Fusion provides a comprehensive REST API for configuration management, theme handling, and integration with external services. This reference documents all available endpoints, request/response formats, and integration patterns.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication](#authentication)
3. [Configuration API](#configuration-api)
4. [Dashboard API](#dashboard-api)
5. [Theme API](#theme-api)
6. [Translation API](#translation-api)
7. [Custom JavaScript API](#custom-javascript-api)
8. [Version API](#version-api)
9. [Calendar API](#calendar-api)
10. [YouTube API](#youtube-api)
11. [Logging API](#logging-api)
12. [WebSocket Integration](#websocket-integration)
13. [Error Handling](#error-handling)
14. [Rate Limiting](#rate-limiting)
15. [Integration Examples](#integration-examples)

## API Architecture

### Base URL Structure

```
http://localhost:5050/_api/
```

### API Versioning

HA-Fusion uses URL-based API versioning:

```
/_api/v1/endpoint  # Future versioning
/_api/endpoint     # Current unversioned API
```

### Request/Response Format

#### Content Types

| Content-Type | Usage |
|--------------|-------|
| `application/json` | JSON data exchange |
| `application/x-yaml` | YAML configuration |
| `text/javascript` | Custom JavaScript |
| `text/plain` | Plain text responses |

#### Standard Response Format

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Authentication

### Authentication Methods

HA-Fusion API endpoints are protected by the same authentication mechanism as the main application:

1. **Session-based Authentication** (Web UI)
2. **Long-lived Access Token** (API access)
3. **OAuth Flow** (Default web authentication)

### API Access

#### Using Long-lived Access Token

```bash
# Set token in configuration
curl -X POST http://localhost:5050/_api/save_config \
  -H "Content-Type: application/json" \
  -d '{"token": "your-long-lived-token"}'
```

#### Session Authentication

```bash
# Authenticate via web interface first
# Then use session cookies for API calls
curl -X GET http://localhost:5050/_api/version \
  -H "Cookie: session=your-session-cookie"
```

## Configuration API

### Save Configuration

Saves the main application configuration to [`data/configuration.yaml`](../data/configuration.yaml).

#### Endpoint

```
POST /_api/save_config
```

#### Request Body

```json
{
  "locale": "en",
  "token": "optional-long-lived-token",
  "motion": true,
  "custom_js": false,
  "addons": {
    "youtube": false,
    "maptiler": {
      "apikey": "your-api-key"
    }
  }
}
```

#### Response

```json
{
  "action": "saved"
}
```

#### Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Invalid JSON | Request body is not valid JSON |
| 400 | YAML Conversion Error | Cannot convert JSON to YAML |
| 500 | File Write Error | Cannot write to configuration file |

#### Example Usage

```bash
# Save basic configuration
curl -X POST http://localhost:5050/_api/save_config \
  -H "Content-Type: application/json" \
  -d '{
    "locale": "sv",
    "motion": true,
    "custom_js": true
  }'

# Save configuration with add-ons
curl -X POST http://localhost:5050/_api/save_config \
  -H "Content-Type: application/json" \
  -d '{
    "locale": "en",
    "addons": {
      "youtube": true,
      "maptiler": {
        "apikey": "pk.your-maptiler-key"
      }
    }
  }'
```

#### Configuration Schema Validation

The API validates configuration against the following schema:

```typescript
interface Configuration {
  locale?: string;           // Language code
  token?: string;           // Long-lived access token
  motion?: boolean;         // Enable animations
  custom_js?: boolean;      // Enable custom JavaScript
  addons?: {
    youtube?: boolean;      // YouTube integration
    maptiler?: {
      apikey: string;       // MapTiler API key
    };
  };
}
```

## Dashboard API

### Save Dashboard

Saves dashboard configuration including views, sidebar, and layout settings.

#### Endpoint

```
POST /_api/save_dashboard
```

#### Request Body

```json
{
  "theme": "godis",
  "hide_views": false,
  "hide_sidebar": false,
  "sidebarWidth": 350,
  "views": [
    {
      "id": 1234567890,
      "name": "Home",
      "icon": "material-symbols:home",
      "sections": [
        {
          "id": 9876543210,
          "name": "Living Room",
          "items": [
            {
              "type": "button",
              "id": 5555555555,
              "entity_id": "light.living_room",
              "name": "Living Room Light",
              "icon": "mdi:lightbulb",
              "color": "#ffeb3b"
            }
          ]
        }
      ]
    }
  ],
  "sidebar": [
    {
      "type": "time",
      "id": 1111111111,
      "hour12": false,
      "seconds": false
    },
    {
      "type": "weather",
      "id": 2222222222,
      "entity_id": "weather.home",
      "icon_pack": "meteocons"
    }
  ]
}
```

#### Response

```json
{
  "message": "saved"
}
```

#### Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 500 | YAML Conversion Error | Cannot convert JSON to YAML |
| 500 | File Write Error | Cannot write to dashboard file |

#### Dashboard Schema

```typescript
interface Dashboard {
  theme?: string;
  hide_views?: boolean;
  hide_sidebar?: boolean;
  sidebarWidth?: number;
  views: View[];
  sidebar: SidebarItem[];
}

interface View {
  id: number;
  name: string;
  icon?: string;
  sections: Section[];
}

interface Section {
  id: number;
  name?: string;
  type?: string;
  items?: Item[];
  sections?: Section[];  // For horizontal-stack
  visibility?: {
    conditions: Condition[];
  };
}
```

#### Example Usage

```bash
# Save minimal dashboard
curl -X POST http://localhost:5050/_api/save_dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "muted",
    "views": [{
      "id": 1,
      "name": "Home",
      "sections": [{
        "id": 2,
        "name": "Lights",
        "items": [{
          "type": "button",
          "id": 3,
          "entity_id": "light.living_room"
        }]
      }]
    }],
    "sidebar": [{
      "type": "time",
      "id": 4
    }]
  }'
```

## Theme API

### Get All Themes

Retrieves all available themes from the themes directory.

#### Endpoint

```
GET /_api/get_all_themes
```

#### Response

```json
[
  {
    "file": "godis.yaml",
    "title": "godis",
    "author": "matt8707",
    "attribution": "",
    "theme": {
      "colors-text": "rgba(255, 255, 255, 0.8)",
      "colors-icon": "rgb(253 244 232)",
      "background-image": "url('/themes/godis_background.webp')",
      "font-family": "'Inter Variable', system-ui"
    }
  },
  {
    "file": "muted.yaml",
    "title": "muted",
    "author": "matt8707",
    "attribution": "",
    "theme": {
      "colors-text": "rgba(255, 255, 255, 0.8)",
      "colors-icon": "rgb(253 244 232)",
      "background-image": "url('/themes/muted_background.webp')"
    }
  }
]
```

#### Cache Headers

```
Cache-Control: max-age=0
```

#### Example Usage

```bash
# Get all available themes
curl -X GET http://localhost:5050/_api/get_all_themes

# Parse theme names
curl -X GET http://localhost:5050/_api/get_all_themes | \
  jq -r '.[].title'
```

### Load Theme

Loads a specific theme configuration.

#### Endpoint

```
POST /_api/load_theme
```

#### Request Body

```json
{
  "theme": "muted"
}
```

#### Response

```json
{
  "title": "muted",
  "author": "matt8707",
  "attribution": "",
  "theme": {
    "colors-text": "rgba(255, 255, 255, 0.8)",
    "colors-icon": "rgb(253 244 232)",
    "colors-title": "rgba(255, 255, 255, 0.8)",
    "colors-sidebar-border": "1px solid rgba(115, 115, 115, 0.25)",
    "colors-sidebar-background": "rgba(0, 0, 0, 0.06)",
    "background-image": "url('/themes/muted_background.webp')",
    "font-family": "'Inter Variable', system-ui",
    "button-background-color-on": "rgba(255, 255, 255, 0.85)",
    "button-background-color-off": "rgba(115, 115, 115, 0.25)"
  }
}
```

#### Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 500 | File Not Found | Theme file does not exist |
| 500 | YAML Parse Error | Invalid YAML in theme file |

#### Example Usage

```bash
# Load specific theme
curl -X POST http://localhost:5050/_api/load_theme \
  -H "Content-Type: application/json" \
  -d '{"theme": "muted"}'

# Load theme and extract CSS properties
curl -X POST http://localhost:5050/_api/load_theme \
  -H "Content-Type: application/json" \
  -d '{"theme": "godis"}' | \
  jq -r '.theme | to_entries[] | "--\(.key): \(.value);"'
```

## Translation API

### Get Translation

Retrieves translation data for a specific language.

#### Endpoint

```
POST /_api/get_translation
```

#### Request Body

```json
{
  "language": "sv"
}
```

#### Response

```json
{
  "add": "Lägg till",
  "add_card": "Lägg till kort",
  "add_section": "Lägg till sektion",
  "add_view": "Lägg till vy",
  "alignment": "Justering",
  "all": "Alla",
  "appearance": "Utseende",
  "auto": "Auto",
  "background": "Bakgrund",
  "cancel": "Avbryt",
  "cards": "Kort",
  "center": "Centrum",
  "clear": "Rensa",
  "close": "Stäng",
  "configuration": "Konfiguration"
}
```

#### Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 500 | File Not Found | Translation file does not exist |
| 500 | JSON Parse Error | Invalid JSON in translation file |

#### Example Usage

```bash
# Get Swedish translations
curl -X POST http://localhost:5050/_api/get_translation \
  -H "Content-Type: application/json" \
  -d '{"language": "sv"}'

# Get specific translation key
curl -X POST http://localhost:5050/_api/get_translation \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}' | \
  jq -r '.add_card'
```

### List Languages

Retrieves all available language codes.

#### Endpoint

```
GET /_api/list_languages
```

#### Response

```json
[
  "af", "ar", "bg", "bn", "bs", "ca", "cs", "cy", "da", "de",
  "el", "en", "en-GB", "eo", "es", "es-419", "et", "eu", "fa",
  "fi", "fr", "fy", "ga", "gl", "gsw", "he", "hi", "hr", "hu",
  "hy", "id", "is", "it", "ja", "ka", "ko", "lb", "lt", "lv",
  "mk", "ml", "nb", "nl", "nn", "no", "pl", "pt", "pt-BR",
  "ro", "ru", "sk", "sl", "sr", "sr-Latn", "sv", "ta", "te",
  "th", "tr", "uk", "ur", "vi", "zh-Hans", "zh-Hant"
]
```

#### Example Usage

```bash
# Get all available languages
curl -X GET http://localhost:5050/_api/list_languages

# Check if language is supported
curl -X GET http://localhost:5050/_api/list_languages | \
  jq -r '.[] | select(. == "sv")'
```

## Custom JavaScript API

### Get Custom JavaScript

Retrieves the custom JavaScript file content.

#### Endpoint

```
GET /_api/custom_js
```

#### Response

```javascript
console.debug('🎉 Custom JavaScript file loaded!');

// Custom functionality
window.haFusionCustom = {
  // Your custom functions here
};
```

#### Cache Headers

```
Cache-Control: max-age=0
```

#### Auto-creation

If the custom JavaScript file doesn't exist, it will be automatically created with default content:

```javascript
console.debug('🎉 Custom JavaScript file loaded!');
```

#### Example Usage

```bash
# Get custom JavaScript content
curl -X GET http://localhost:5050/_api/custom_js

# Save to file
curl -X GET http://localhost:5050/_api/custom_js > custom.js
```

### Update Custom JavaScript

To update custom JavaScript, modify the file directly:

```bash
# Edit the custom JavaScript file
echo "console.log('Custom HA-Fusion script loaded');" > data/custom_javascript.js
```

The changes will be automatically loaded on the next page refresh when `custom_js: true` is set in configuration.

## Version API

### Get Version Information

Retrieves current and latest version information.

#### Endpoint

```
GET /_api/version
```

#### Response

```json
{
  "installed": "2024.10.0",
  "latest": "2024.10.1",
  "last_updated": "2024-01-01T12:00:00Z"
}
```

#### Version Sources

- **installed**: From [`package.json`](../package.json)
- **latest**: From [`data/version.json`](../data/version.json) (if available)
- **last_updated**: Timestamp of last version check

#### Example Usage

```bash
# Get version information
curl -X GET http://localhost:5050/_api/version

# Check if update is available
curl -X GET http://localhost:5050/_api/version | \
  jq -r 'if .installed != .latest then "Update available: \(.latest)" else "Up to date" end'
```

## Calendar API

### Get Calendar Events

Retrieves calendar events from Home Assistant.

#### Endpoint

```
POST /_api/get_calendar
```

#### Request Body

```json
{
  "entity_id": "calendar.personal",
  "start": "2024-01-01T00:00:00Z",
  "end": "2024-01-31T23:59:59Z"
}
```

#### Response

```json
[
  {
    "start": {
      "dateTime": "2024-01-15T10:00:00Z"
    },
    "end": {
      "dateTime": "2024-01-15T11:00:00Z"
    },
    "summary": "Team Meeting",
    "description": "Weekly team sync",
    "location": "Conference Room A"
  },
  {
    "start": {
      "date": "2024-01-20"
    },
    "end": {
      "date": "2024-01-21"
    },
    "summary": "Holiday",
    "description": "Public holiday"
  }
]
```

#### Example Usage

```bash
# Get calendar events for current month
curl -X POST http://localhost:5050/_api/get_calendar \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "calendar.personal",
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }'
```

## YouTube API

### YouTube Integration

Handles YouTube authentication and API interactions when the YouTube add-on is enabled.

#### Endpoint

```
POST /_api/youtube
```

#### Request Body

```json
{
  "action": "authenticate"
}
```

#### Response

```json
{
  "message": "auth-pending",
  "verification_url": "https://www.google.com/device",
  "user_code": "ABCD-EFGH",
  "timestamp": 1704067200000
}
```

#### YouTube Events

The YouTube API emits various events:

| Event | Description |
|-------|-------------|
| `auth-pending` | Authentication is pending user action |
| `auth` | Authentication successful |
| `update-credentials` | Credentials need to be updated |
| `auth-error` | Authentication failed |
| `error` | General error occurred |

#### Example Usage

```bash
# Initiate YouTube authentication
curl -X POST http://localhost:5050/_api/youtube \
  -H "Content-Type: application/json" \
  -d '{"action": "authenticate"}'
```

## Logging API

### Backend Logging

Sends log messages to the backend for centralized logging.

#### Endpoint

```
POST /_api/log_backend
```

#### Request Body

```json
{
  "level": "info",
  "message": "User action performed",
  "context": {
    "user": "admin",
    "action": "dashboard_save",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### Log Levels

| Level | Description |
|-------|-------------|
| `debug` | Detailed debugging information |
| `info` | General information |
| `warn` | Warning messages |
| `error` | Error messages |
| `fatal` | Fatal error messages |

#### Response

```json
{
  "status": "logged"
}
```

#### Example Usage

```bash
# Send info log
curl -X POST http://localhost:5050/_api/log_backend \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "Dashboard configuration updated",
    "context": {
      "component": "dashboard",
      "action": "save"
    }
  }'

# Send error log
curl -X POST http://localhost:5050/_api/log_backend \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Failed to connect to Home Assistant",
    "context": {
      "error": "Connection timeout",
      "url": "http://homeassistant:8123"
    }
  }'
```

## Documentation API

### Get Documentation

Retrieves processed documentation files.

#### Endpoint

```
GET /_api/get_docs
```

#### Response

```json
{
  "installation": "<h1>Installation Guide</h1><p>...</p>",
  "configuration": "<h1>Configuration</h1><p>...</p>",
  "troubleshooting": "<h1>Troubleshooting</h1><p>...</p>"
}
```

#### Processing

- Markdown files are converted to HTML using the `marked` library
- Files are read from [`static/documentation/`](../static/documentation/) directory
- Only `.md` files are processed
- File names (without extension) become object keys

#### Cache Headers

```
Cache-Control: max-age=0
```

#### Example Usage

```bash
# Get all documentation
curl -X GET http://localhost:5050/_api/get_docs

# Get specific documentation section
curl -X GET http://localhost:5050/_api/get_docs | \
  jq -r '.installation'
```

## WebSocket Integration

### Home Assistant WebSocket

HA-Fusion integrates with Home Assistant via WebSocket for real-time updates.

#### Connection Flow

1. **Authentication** via [`src/lib/Socket.ts`](../src/lib/Socket.ts)
2. **Entity Subscription** for state updates
3. **Config Subscription** for Home Assistant configuration
4. **Event Handling** for custom events

#### WebSocket Events

##### Connection Events

```javascript
// Connection established
conn.addEventListener('ready', () => {
  console.debug('connected.');
  connected.set(true);
});

// Connection lost
conn.addEventListener('disconnected', () => {
  console.debug('connecting...');
  connected.set(false);
});

// Reconnection error
conn.addEventListener('reconnect-error', () => {
  console.error('ERR_INVALID_AUTH.');
  connected.set(false);
});
```

##### Custom Events

```javascript
// Subscribe to HA_FUSION events
conn?.subscribeMessage(
  (message) => {
    const trigger = message?.variables?.trigger?.event?.data?.event;
    
    // Handle close_popup event
    if (trigger === 'close_popup') {
      event.set('close_popup');
      closeModal();
    }
    
    // Handle refresh event
    else if (trigger === 'refresh') {
      sessionStorage.setItem('event', 'refresh');
      location.reload();
    }
  },
  {
    type: 'subscribe_trigger',
    trigger: {
      platform: 'event',
      event_type: 'HA_FUSION'
    }
  }
);
```

##### Notification Events

```javascript
// Subscribe to persistent notifications
conn?.subscribeMessage(
  (data) => {
    if (data?.type === 'current') {
      persistentNotifications.set(data?.notifications);
    } else if (data?.type === 'added' || data?.type === 'updated') {
      persistentNotifications.update((notifications) => ({
        ...notifications,
        ...data?.notifications
      }));
    } else if (data?.type === 'removed') {
      persistentNotifications.update((notifications) => {
        Object.keys(data?.notifications).forEach((notificationId) => {
          delete notifications[notificationId];
        });
        return { ...notifications };
      });
    }
  },
  {
    type: 'persistent_notification/subscribe'
  }
);
```

#### Authentication Methods

##### Long-lived Access Token

```javascript
if (configuration?.token) {
  auth = createLongLivedTokenAuth(configuration?.hassUrl, configuration?.token);
}
```

##### OAuth Flow

```javascript
auth = await getAuth({ ...options, hassUrl: configuration?.hassUrl });
if (auth.expired) auth.refreshAccessToken();
```

##### Companion App

```javascript
if (navigator.userAgent.includes('Home Assistant')) {
  openModal(() => import('$lib/Components/TokenModal.svelte'));
  return;
}
```

## Error Handling

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_JSON` | 400 | Request body is not valid JSON |
| `YAML_CONVERSION_ERROR` | 400 | Cannot convert JSON to YAML |
| `FILE_NOT_FOUND` | 404 | Requested file does not exist |
| `FILE_WRITE_ERROR` | 500 | Cannot write to file |
| `YAML_PARSE_ERROR` | 500 | Invalid YAML syntax |
| `JSON_PARSE_ERROR` | 500 | Invalid JSON syntax |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The requested theme file does not exist",
    "details": {
      "file": "nonexistent-theme.yaml",
      "path": "/app/static/themes/"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Handling Examples

```bash
# Handle API errors in bash
response=$(curl -s -w "%{http_code}" -X POST http://localhost:5050/_api/save_config \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}')

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" -ne 200 ]; then
  echo "Error: HTTP $http_code"
  echo "$body" | jq -r '.error.message'
fi
```

```javascript
// Handle API errors in JavaScript
try {
  const response = await fetch('/_api/save_config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.error.message}`);
  }
  
  const result = await response.json();
  console.log('Configuration saved:', result);
} catch (error) {
  console.error('Failed to save configuration:', error.message);
}
```

## Rate Limiting

### Current Implementation

HA-Fusion does not currently implement rate limiting, but it's recommended to implement client-side throttling for frequent API calls.

### Recommended Client-side Throttling

```javascript
// Throttle function for API calls
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Throttled save function
const throttledSave = throttle(async (config) => {
  await fetch('/_api/save_config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
}, 1000); // Limit to once per second
```

### Future Rate Limiting

Future versions may implement server-side rate limiting:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 100,
      "window": "1h",
      "retry_after": 3600
    }
  }
}
```

## Integration Examples

### Configuration Management

#### Automated Configuration Updates

```bash
#!/bin/bash
# update-config.sh - Automated configuration management

CONFIG_FILE="config.json"
API_URL="http://localhost:5050/_api/save_config"

# Read configuration from file
config=$(cat "$CONFIG_FILE")

# Validate JSON
if ! echo "$config" | jq empty; then
  echo "Error: Invalid JSON in $CONFIG_FILE"
  exit 1
fi

# Update configuration
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$config")

# Check response
if echo "$response" | jq -e '.action == "saved"' > /dev/null; then
  echo "Configuration updated successfully"
else
  echo "Error updating configuration:"
  echo "$response" | jq -r '.error.message // "Unknown error"'
  exit 1
fi
```

#### Configuration Backup

```bash
#!/bin/bash
# backup-config.sh - Backup current configuration

BACKUP_DIR="/backup/ha-fusion/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup configuration files
cp data/configuration.yaml "$BACKUP_DIR/"
cp data/dashboard.yaml "$BACKUP_DIR/"

# Get current theme list
curl -s -X GET http://localhost:5050/_api/get_all_themes > "$BACKUP_DIR/themes.json"

# Get version information
curl -s -X GET http://localhost:5050/_api/version > "$BACKUP_DIR/version.json"

echo "Backup completed: $BACKUP_DIR"
```

### Theme Management

#### Theme Switcher Script

```python
#!/usr/bin/env python3
# theme-switcher.py - Automated theme switching

import requests
import json
import sys
from datetime import datetime

API_BASE = "http://localhost:5050/_api"

def get_available_themes():
    """Get list of available themes"""
    response = requests.get(f"{API_BASE}/get_all_themes")
    response.raise_for_status()
    return response.json()

def load_theme(theme_name):
    """Load specific theme"""
    response = requests.post(f"{API_BASE}/load_theme", 
                           json={"theme": theme_name})
    response.raise_for_status()
    return response.json()

def update_dashboard_theme(theme_name):
    """Update dashboard with new theme"""
    # This would require reading current dashboard config
    # and updating only the theme field
    pass

def main():
    if len(sys.argv) != 2:
        print("Usage: theme-switcher.py <theme_name>")
        sys.exit(1)
    
    theme_name = sys.argv[1]
    
    try:
        # Get available themes
        themes = get_available_themes()
        theme_names = [t['title'] for t in themes]
        
        if theme_name not in theme_names:
            print(f"Theme '{theme_name}' not found.")
            print(f"Available themes: {', '.join(theme_names)}")
            sys.exit(1)
        
        # Load theme
        theme_data = load_theme(theme_name)
        print(f"Successfully loaded theme: {theme_name}")
        
        # Update dashboard (implementation needed)
        # update_dashboard_theme(theme_name)
        
    except requests.RequestException as e:
        print(f"API Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### Monitoring Integration

#### Health Check Script

```bash
#!/bin/bash
# health-check.sh - Monitor HA-Fusion health

API_URL="http://localhost:5050/_api/version"
LOG_FILE="/var/log/ha-fusion-health.log"

# Function to log with timestamp
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check API availability
if response=$(curl -s -f "$API_URL" 2>/dev/null); then
  version
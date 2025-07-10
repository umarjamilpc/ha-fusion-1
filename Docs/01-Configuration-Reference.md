# HA-Fusion Configuration Reference

## Overview

HA-Fusion is a modern, performant custom Home Assistant dashboard built with SvelteKit. This comprehensive reference covers all configuration options, parameters, and settings available for personal instances.

## Table of Contents

1. [Configuration Files](#configuration-files)
2. [Environment Variables](#environment-variables)
3. [Configuration Schema](#configuration-schema)
4. [Dashboard Configuration](#dashboard-configuration)
5. [Theme Configuration](#theme-configuration)
6. [Authentication Configuration](#authentication-configuration)
7. [Add-on Configuration](#add-on-configuration)
8. [Advanced Configuration](#advanced-configuration)

## Configuration Files

HA-Fusion uses YAML configuration files stored in the `data/` directory:

### Primary Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| [`data/configuration.yaml`](data/configuration.yaml) | Main application configuration | Yes |
| [`data/dashboard.yaml`](data/dashboard.yaml) | Dashboard layout and components | Yes |
| [`data/custom_javascript.js`](data/custom_javascript.js) | Custom JavaScript extensions | No |

### Configuration File Structure

```
data/
├── configuration.yaml    # Main configuration
├── dashboard.yaml        # Dashboard layout
└── custom_javascript.js  # Custom JS (optional)
```

## Environment Variables

### Docker Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `HASS_URL` | `string` | Required | Home Assistant instance URL |
| `TZ` | `string` | `UTC` | Timezone for the container |

### Development Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `HASS_URL` | `string` | Required | Home Assistant URL for development |

### Environment Configuration Examples

#### Docker Compose
```yaml
environment:
  TZ: Europe/Stockholm
  HASS_URL: http://192.168.1.241:8123
```

#### Development (.env)
```bash
HASS_URL=http://192.168.1.241:8123
```

## Configuration Schema

### configuration.yaml Schema

```yaml
# Locale and Internationalization
locale: string                    # Language code (default: "en")

# Authentication
token: string                     # Long-lived access token (optional)

# UI Behavior
motion: boolean                   # Enable/disable animations (default: true)
custom_js: boolean               # Enable custom JavaScript (default: false)

# Add-ons Configuration
addons:
  youtube: boolean               # Enable YouTube integration
  maptiler:
    apikey: string              # MapTiler API key for maps
```

#### Configuration Parameters

##### `locale`
- **Type**: `string`
- **Default**: `"en"`
- **Description**: Sets the interface language
- **Valid Values**: Any supported language code from [`static/translations/`](static/translations/)
- **Example**: `"sv"`, `"de"`, `"fr"`, `"es"`

##### `token`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Long-lived access token for Home Assistant authentication
- **Security**: Store securely, never commit to version control
- **Usage**: Required for headless deployments or when OAuth flow is not available

##### `motion`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Controls UI animations and transitions
- **Performance**: Set to `false` on low-performance devices

##### `custom_js`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enables loading of custom JavaScript from `data/custom_javascript.js`
- **Security**: Only enable if you trust the custom JavaScript code

##### `addons`
- **Type**: `object`
- **Description**: Configuration for optional add-on features

###### `addons.youtube`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enables YouTube integration features
- **Requirements**: Requires additional setup for YouTube API

###### `addons.maptiler`
- **Type**: `object`
- **Description**: MapTiler integration for map components

###### `addons.maptiler.apikey`
- **Type**: `string`
- **Required**: Yes (if using MapTiler)
- **Description**: API key for MapTiler services
- **Obtain**: Register at [MapTiler](https://www.maptiler.com/)

### Configuration Examples

#### Minimal Configuration
```yaml
locale: en
```

#### Full Configuration
```yaml
locale: sv
token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
motion: true
custom_js: true
addons:
  youtube: true
  maptiler:
    apikey: "your-maptiler-api-key"
```

#### Production Configuration
```yaml
locale: en
motion: false  # Better performance
custom_js: false  # Security
addons:
  maptiler:
    apikey: "production-api-key"
```

## Dashboard Configuration

### dashboard.yaml Schema

```yaml
# Theme Configuration
theme: string                     # Theme name (default: "godis")

# Layout Configuration
hide_views: boolean              # Hide view navigation (default: false)
hide_sidebar: boolean            # Hide sidebar completely (default: false)
sidebarWidth: number            # Sidebar width in pixels (default: 350)

# Views Configuration
views: View[]                   # Array of dashboard views

# Sidebar Configuration
sidebar: SidebarItem[]          # Array of sidebar components
```

#### Dashboard Parameters

##### `theme`
- **Type**: `string`
- **Default**: `"godis"`
- **Description**: Active theme name
- **Valid Values**: Any theme file name from [`static/themes/`](static/themes/) without `.yaml` extension
- **Examples**: `"muted"`, `"godis"`, custom theme names

##### `hide_views`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Hides the view navigation tabs
- **Use Case**: Single-view dashboards, kiosk mode

##### `hide_sidebar`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Completely hides the sidebar
- **Use Case**: Maximizing main content area

##### `sidebarWidth`
- **Type**: `number`
- **Default**: `350`
- **Unit**: Pixels
- **Range**: `200-800` (recommended)
- **Description**: Width of the sidebar in pixels

### View Configuration

#### View Schema
```yaml
views:
  - id: number                  # Unique identifier
    name: string               # Display name
    icon: string              # Icon identifier (optional)
    sections: Section[]       # Array of sections
```

#### View Parameters

##### `id`
- **Type**: `number`
- **Required**: Yes
- **Description**: Unique identifier for the view
- **Generation**: Auto-generated by UI, manual assignment possible

##### `name`
- **Type**: `string`
- **Required**: Yes
- **Description**: Display name shown in navigation
- **Localization**: Not automatically localized

##### `icon`
- **Type**: `string`
- **Default**: Default icon
- **Description**: Icon identifier from Iconify
- **Format**: `"icon-set:icon-name"`
- **Examples**: `"material-symbols:home"`, `"mdi:lightbulb"`

### Section Configuration

#### Section Schema
```yaml
sections:
  - id: number                 # Unique identifier
    name: string              # Section title (optional)
    type: string             # Section type (optional)
    items: Item[]            # Array of items
    sections: Section[]      # Nested sections (for horizontal-stack)
    visibility:              # Visibility conditions (optional)
      conditions: Condition[]
```

#### Section Types

##### Standard Section
```yaml
- id: 1234567890
  name: "Living Room"
  items:
    - type: button
      entity_id: light.living_room
```

##### Horizontal Stack
```yaml
- type: horizontal-stack
  id: 1234567890
  sections:
    - name: "Left Column"
      items: [...]
    - name: "Right Column"
      items: [...]
```

### Item Configuration

#### Button Item
```yaml
- type: button
  id: number                   # Unique identifier
  entity_id: string           # Home Assistant entity ID
  name: string                # Custom name (optional)
  icon: string                # Custom icon (optional)
  color: string               # Custom color (optional)
  marquee: boolean            # Enable text scrolling (optional)
  more_info: boolean          # Show more info dialog (optional)
  service: string             # Custom service call (optional)
  template: object            # Template configuration (optional)
```

#### Media Item
```yaml
- type: media
  id: number                  # Unique identifier
  conditional: ConditionalMedia[]  # Conditional media sources
```

#### Conditional Media Configuration
```yaml
conditional:
  - entity_id: string         # Entity to monitor
    name: string             # Display name (optional)
    icon: string             # Display icon (optional)
    color: string            # Display color (optional)
```

### Sidebar Configuration

#### Sidebar Item Types

##### Time Component
```yaml
- type: time
  id: number                  # Unique identifier
  hour12: boolean            # 12-hour format (default: false)
  seconds: boolean           # Show seconds (default: false)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Date Component
```yaml
- type: date
  id: number                 # Unique identifier
  format: string             # Date format (optional)
  hide: string               # Hide elements (optional)
  shortday: boolean          # Short day names (optional)
  shortmonth: boolean        # Short month names (optional)
  layout: string             # Layout style (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Weather Component
```yaml
- type: weather
  id: number                 # Unique identifier
  entity_id: string          # Weather entity
  weather_sensor: string     # Weather sensor entity (optional)
  extra_sensor: string       # Additional sensor (optional)
  extra_sensor_icon: string  # Icon for extra sensor (optional)
  icon_pack: string          # Icon pack to use (optional)
  show_apparent: boolean     # Show apparent temperature (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Sensor Component
```yaml
- type: sensor
  id: number                 # Unique identifier
  entity_id: string          # Sensor entity
  name: string               # Custom name (optional)
  prefix: string             # Value prefix (optional)
  suffix: string             # Value suffix (optional)
  date: boolean              # Format as date (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Template Component
```yaml
- type: template
  id: number                 # Unique identifier
  template: string           # Jinja2 template
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Graph Component
```yaml
- type: graph
  id: number                 # Unique identifier
  entity_id: string          # Entity to graph
  name: string               # Custom name (optional)
  period: string             # Time period (hour/day/week/month)
  stroke: number             # Line thickness (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Bar Component
```yaml
- type: bar
  id: number                 # Unique identifier
  entity_id: string          # Entity for bar chart
  name: string               # Custom name (optional)
  math: string               # Mathematical expression (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Radial Component
```yaml
- type: radial
  id: number                 # Unique identifier
  entity_id: string          # Entity for radial chart
  name: string               # Custom name (optional)
  stroke: number             # Stroke width (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Divider Component
```yaml
- type: divider
  id: number                 # Unique identifier
  mode: string               # Divider style (optional)
  size: number               # Divider size (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Navigate Component
```yaml
- type: navigate
  id: number                 # Unique identifier
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Timer Component
```yaml
- type: timer
  id: number                 # Unique identifier
  entity_id: string          # Timer entity
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Camera Component
```yaml
- type: camera
  id: number                 # Unique identifier
  entity_id: string          # Camera entity
  stream: boolean            # Enable streaming (optional)
  size: string               # Display size (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Image Component
```yaml
- type: image
  id: number                 # Unique identifier
  entity_id: string          # Image entity (optional)
  url: string                # Direct image URL (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### Iframe Component
```yaml
- type: iframe
  id: number                 # Unique identifier
  url: string                # Iframe URL
  size: string               # Display size (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

##### History Component
```yaml
- type: history
  id: number                 # Unique identifier
  entity_id: string          # Entity for history
  period: string             # Time period (optional)
  hide_mobile: boolean       # Hide on mobile (optional)
```

### Visibility Conditions

#### Condition Schema
```yaml
visibility:
  conditions:
    - condition: string       # Condition type
      entity: string         # Entity to check (optional)
      state: string          # Required state (optional)
      state_not: string      # Excluded state (optional)
      above: number          # Numeric threshold (optional)
      below: number          # Numeric threshold (optional)
      media_query: string    # CSS media query (optional)
      conditions: Condition[] # Nested conditions (optional)
```

#### Condition Types

##### State Condition
```yaml
- condition: state
  entity: light.living_room
  state: "on"
```

##### Numeric State Condition
```yaml
- condition: numeric_state
  entity: sensor.temperature
  above: 20
  below: 30
```

##### Screen Condition
```yaml
- condition: screen
  media_query: "(max-width: 768px)"
```

##### Logical Conditions
```yaml
- condition: and
  conditions:
    - condition: state
      entity: light.living_room
      state: "on"
    - condition: numeric_state
      entity: sensor.temperature
      above: 20

- condition: or
  conditions:
    - condition: state
      entity: person.user1
      state: "home"
    - condition: state
      entity: person.user2
      state: "home"
```

## Theme Configuration

### Theme File Structure

Themes are stored in [`static/themes/`](static/themes/) as YAML files:

```yaml
title: string                # Theme name
author: string              # Theme author
attribution: string         # Attribution text (optional)
theme:                      # CSS custom properties
  property-name: value
```

### Theme Properties

#### Color Properties
```yaml
theme:
  # Text Colors
  colors-text: "rgba(255, 255, 255, 0.8)"
  colors-icon: "rgb(253 244 232)"
  colors-title: "rgba(255, 255, 255, 0.8)"
  
  # Background Colors
  colors-sidebar-background: "rgba(0, 0, 0, 0.06)"
  modal-background-color: "rgba(0,0,0,0.3)"
  modal-background-color-modal: "rgb(31, 29, 26, 0.7)"
  app-color: "#171c1f"
  
  # Button Colors
  button-background-color-on: "rgba(255, 255, 255, 0.85)"
  button-background-color-off: "rgba(115, 115, 115, 0.25)"
  button-name-color-on: "rgb(48 51 52)"
  button-name-color-off: "rgb(151, 152, 156)"
  button-state-color-on: "rgb(88 90 90)"
  button-state-color-off: "rgb(151, 152, 156)"
  
  # Border Colors
  colors-sidebar-border: "1px solid rgba(115, 115, 115, 0.25)"
  sidebar-divider: "1px solid rgba(58, 69, 73, 0.4)"
```

#### Typography Properties
```yaml
theme:
  font-family: "'Inter Variable', system-ui"
  sidebar-font-size: "1rem"
  drawer-font-size: "0.925rem"
  sizes-sidebar-time: "3.4rem"
```

#### Layout Properties
```yaml
theme:
  border-radius: "0.4rem"
  sidebar-item-padding: "0.6rem 0.6rem"
  sidebar-padding: "0 1.4rem"
```

#### Background Properties
```yaml
theme:
  background-image: "url('/themes/muted_background.webp')"
```

### Creating Custom Themes

1. Create a new YAML file in [`static/themes/`](static/themes/)
2. Use the theme schema above
3. Ensure `title` matches the filename (without `.yaml`)
4. Test thoroughly across different screen sizes
5. Consider accessibility (contrast ratios, etc.)

#### Custom Theme Example
```yaml
title: my-custom-theme
author: Your Name
attribution: Based on Material Design
theme:
  colors-text: "#333333"
  colors-icon: "#666666"
  background-image: "url('/themes/my-background.jpg')"
  button-background-color-on: "#2196F3"
  button-background-color-off: "#E0E0E0"
  font-family: "Roboto, sans-serif"
  border-radius: "8px"
```

## Authentication Configuration

### Authentication Methods

HA-Fusion supports multiple authentication methods:

1. **OAuth Flow** (Default)
2. **Long-lived Access Token**
3. **Companion App Integration**

### OAuth Flow (Default)

Automatic authentication flow for standard web browsers:

```yaml
# No configuration required
# Automatically redirects to Home Assistant for authentication
```

### Long-lived Access Token

For headless deployments or when OAuth is not available:

```yaml
token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Generating Long-lived Access Tokens

1. Open Home Assistant
2. Go to Profile → Security
3. Create Long-lived Access Token
4. Copy token to configuration
5. **Never commit tokens to version control**

### Companion App Integration

Special handling for Home Assistant Companion App:

- Automatically detects companion app environment
- Opens token input modal
- Bypasses OAuth redirect issues

### Authentication Security

#### Best Practices

1. **Token Storage**
   - Store tokens securely
   - Use environment variables in production
   - Never commit to version control
   - Rotate tokens regularly

2. **Network Security**
   - Use HTTPS in production
   - Configure proper firewall rules
   - Consider VPN for remote access

3. **Access Control**
   - Use Home Assistant user permissions
   - Create dedicated dashboard users
   - Limit token scope when possible

#### Token Management

```bash
# Environment variable approach
export HASS_TOKEN="your-long-lived-token"

# Docker secrets approach
docker secret create hass_token token.txt
```

## Add-on Configuration

### YouTube Integration

Enable YouTube features for media components:

```yaml
addons:
  youtube: true
```

#### YouTube Setup Requirements

1. Enable YouTube add-on in configuration
2. Configure YouTube API credentials (if required)
3. Restart HA-Fusion
4. YouTube features become available in media components

### MapTiler Integration

Enable map components with MapTiler:

```yaml
addons:
  maptiler:
    apikey: "your-api-key-here"
```

#### MapTiler Setup

1. Register at [MapTiler](https://www.maptiler.com/)
2. Obtain API key
3. Add to configuration
4. Map components become available

#### MapTiler Usage Limits

- Free tier: 100,000 map loads/month
- Monitor usage in MapTiler dashboard
- Consider paid plans for high-traffic deployments

## Advanced Configuration

### Custom JavaScript

Enable custom JavaScript functionality:

```yaml
custom_js: true
```

#### Custom JavaScript File

Create [`data/custom_javascript.js`](data/custom_javascript.js):

```javascript
console.debug('🎉 Custom JavaScript file loaded!');

// Custom functionality
window.haFusionCustom = {
  // Your custom functions here
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Custom initialization
});
```

#### Security Considerations

- Only enable if you trust the JavaScript code
- Validate all custom scripts
- Consider Content Security Policy implications
- Test thoroughly before production deployment

### Performance Optimization

#### Motion Settings
```yaml
motion: false  # Disable animations for better performance
```

#### Sidebar Optimization
```yaml
hide_sidebar: true     # Hide sidebar completely
sidebarWidth: 250     # Reduce sidebar width
```

#### Component Optimization
```yaml
# Use hide_mobile to reduce mobile rendering
sidebar:
  - type: graph
    entity_id: sensor.cpu
    hide_mobile: true  # Skip on mobile devices
```

### Query String Parameters

Control behavior via URL parameters:

#### Menu Parameter
```
?menu=false
```
- Hides menu button
- Disables drawer
- Useful for kiosk mode

#### View Parameter
```
?view=Bedroom
```
- Sets initial view
- Must match view name exactly
- Case-sensitive

#### Combined Parameters
```
https://your-ha-fusion.com/?view=Kitchen&menu=false
```

### Responsive Design Configuration

#### Mobile-specific Settings

Many components support `hide_mobile` parameter:

```yaml
sidebar:
  - type: graph
    entity_id: sensor.detailed_stats
    hide_mobile: true  # Hide on mobile devices
    
  - type: camera
    entity_id: camera.security
    hide_mobile: false  # Show on all devices
```

#### Screen-based Visibility

Use screen conditions for responsive behavior:

```yaml
sections:
  - name: "Desktop Only"
    visibility:
      conditions:
        - condition: screen
          media_query: "(min-width: 768px)"
    items:
      - type: button
        entity_id: light.detailed_control
```

### Backup and Restore

#### Configuration Backup

Essential files to backup:
- `data/configuration.yaml`
- `data/dashboard.yaml`
- `data/custom_javascript.js` (if used)
- Custom theme files in `static/themes/`

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

#### Restore Process

1. Stop HA-Fusion
2. Replace configuration files
3. Restart HA-Fusion
4. Verify configuration

### Migration and Updates

#### Version Compatibility

Check version compatibility before updates:

```bash
# Check current version
curl http://localhost:5050/_api/version

# Compare with latest release
curl -s https://api.github.com/repos/matt8707/ha-fusion/releases/latest
```

#### Migration Checklist

1. **Pre-migration**
   - Backup all configuration files
   - Document current setup
   - Test backup restore process

2. **Migration**
   - Update container/installation
   - Check configuration compatibility
   - Update themes if needed

3. **Post-migration**
   - Verify all components work
   - Check for deprecated features
   - Update documentation

### Troubleshooting Configuration

#### Common Configuration Issues

1. **YAML Syntax Errors**
   ```bash
   # Validate YAML syntax
   python -c "import yaml; yaml.safe_load(open('data/configuration.yaml'))"
   ```

2. **Missing Entity IDs**
   - Verify entities exist in Home Assistant
   - Check entity ID spelling
   - Ensure entities are available

3. **Theme Loading Issues**
   - Verify theme file exists
   - Check theme name matches filename
   - Validate theme YAML syntax

4. **Authentication Problems**
   - Verify Home Assistant URL
   - Check token validity
   - Confirm network connectivity

#### Configuration Validation

```bash
# Basic configuration check
docker exec ha-fusion npm run check

# Detailed validation
docker logs ha-fusion | grep -i error
```

#### Debug Mode

Enable debug logging:

```bash
# Docker environment
docker run -e DEBUG=true ha-fusion

# Check logs
docker logs ha-fusion --tail 100
```

## Configuration Best Practices

### Organization

1. **Logical Grouping**
   - Group related items in sections
   - Use descriptive names
   - Maintain consistent naming conventions

2. **View Structure**
   - Limit items per section (5-10 recommended)
   - Use horizontal stacks for layout control
   - Consider mobile layout implications

3. **Sidebar Optimization**
   - Place most important items first
   - Use dividers for visual separation
   - Consider information hierarchy

### Performance

1. **Component Selection**
   - Use appropriate component types
   - Avoid excessive graph components
   - Consider update frequency

2. **Entity Management**
   - Reference only necessary entities
   - Use template sensors for complex logic
   - Minimize database queries

3. **Resource Usage**
   - Optimize images and backgrounds
   - Use appropriate theme complexity
   - Monitor memory usage

### Maintenance

1. **Regular Reviews**
   - Remove unused components
   - Update entity references
   - Validate configuration syntax

2. **Documentation**
   - Document custom configurations
   - Maintain change logs
   - Share configurations with team

3. **Testing**
   - Test on multiple devices
   - Verify responsive behavior
   - Validate all functionality

## Configuration Examples

### Minimal Setup
```yaml
# configuration.yaml
locale: en

# dashboard.yaml
theme: godis
views:
  - name: Home
    id: 1
    sections:
      - name: Lights
        id: 2
        items:
          - type: button
            id: 3
            entity_id: light.living_room
sidebar:
  - type: time
    id: 4
  - type: weather
    id: 5
    entity_id: weather.home
```

### Advanced Setup
```yaml
# configuration.yaml
locale: en
motion: true
custom_js: true
addons:
  youtube: true
  maptiler:
    apikey: "your-api-key"

# dashboard.yaml
theme: custom-theme
hide_views: false
hide_sidebar: false
sidebarWidth: 400
views:
  - name: Main
    icon: "material-symbols:home"
    id: 1
    sections:
      - type: horizontal-stack
        id: 2
        sections:
          - name: Living Room
            id: 3
            items:
              - type: button
                id: 4
                entity_id: light.living_room
                color: "#ff6b6b"
                marquee: true
          - name: Kitchen
            id: 5
            items:
              - type: button
                id: 6
                entity_id: light.kitchen
                template:
                  "on":
                    color: "#4ecdc4"
                    name: "Kitchen Bright"
                  "off":
                    color: "#95a5a6"
                    name: "Kitchen Off"
      - name: Media
        id: 7
        visibility:
          conditions:
            - condition: state
              entity: media_player.living_room
              state_not: "off"
        items:
          - type: media
            id: 8
            conditional:
              - entity_id: media_player.spotify
                icon: "mdi:spotify"
                color: "#1db954"
              - entity_id: media_player.tv
                icon: "mdi:television"
sidebar:
  - type: time
    id: 9
    hour12: false
    seconds: true
  - type: date
    id: 10
    shortday: true
    shortmonth: true
  - type: weather
    id: 11
    entity_id: weather.openweathermap
    icon_pack: meteocons
    show_apparent: true
  - type: divider
    id: 12
  - type: sensor
    id: 13
    entity_id: sensor.cpu_temperature
    name: "CPU Temp"
    suffix: "°C"
  - type: graph
    id: 14
    entity_id: sensor.memory_usage
    period: day
    stroke: 2
    hide_mobile: true
```

### Kiosk Mode Setup
```yaml
# configuration.yaml
locale: en
motion: false  # Better performance

# dashboard.yaml
theme: minimal-theme
hide_views: true    # Single view
hide_sidebar: false
sidebarWidth: 300
views:
  - name: Kiosk
    id: 1
    sections:
      - name: Status
        id: 2
        items:
          - type: button
            id: 3
            entity_id: alarm_control_panel.home
          - type: button
            id: 4
            entity_id: climate.main
sidebar:
  - type: time
    id: 5
    hour12: true
  - type: weather
    id: 6
    entity_id: weather.local
  - type: camera
    id: 7
    entity_id: camera.front_door
    size: large
```

## Conclusion

This configuration reference provides comprehensive coverage of all HA-Fusion configuration options. For additional help:

- Check the [GitHub repository](https://github.com/matt8707/ha-fusion)
- Review example configurations
- Join the community discussions
- Report issues or request features

Remember to backup your configuration before making changes and test thoroughly in a development environment when possible.
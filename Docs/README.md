# HA-Fusion Documentation

## Overview

This comprehensive documentation suite provides complete coverage of HA-Fusion, a modern, performant custom Home Assistant dashboard. The documentation is organized into focused guides covering every aspect from basic configuration to advanced development.

## Documentation Structure

### 📋 [01 - Configuration Reference](01-Configuration-Reference.md)
**Complete configuration guide covering all YAML options and parameters**

- Configuration file structure and schemas
- Environment variables and deployment settings
- Dashboard layout and component configuration
- Theme system and customization options
- Authentication and security settings
- Add-on configuration and integration
- Advanced configuration patterns
- Validation and troubleshooting

**Key Topics:**
- `configuration.yaml` and `dashboard.yaml` schemas
- Component types and properties
- Visibility conditions and templating
- Theme development and CSS properties
- Performance optimization settings

### 🚀 [02 - Installation & Deployment](02-Installation-Deployment.md)
**Comprehensive deployment guide for all environments**

- Installation methods (Add-on, Docker, Development)
- Production deployment strategies
- Container orchestration (Docker Swarm, Kubernetes)
- Reverse proxy configuration (Nginx, Apache, Traefik)
- SSL/TLS setup and security hardening
- Network configuration and firewall rules
- Performance optimization and resource management
- Backup and disaster recovery procedures

**Key Topics:**
- Docker and Docker Compose configurations
- Home Assistant Add-on installation
- Development environment setup
- Production security best practices
- Monitoring and health checks

### 🔌 [03 - API Reference](03-API-Reference.md)
**Complete API documentation and integration guide**

- REST API endpoints and usage
- WebSocket integration patterns
- Authentication mechanisms
- Configuration and dashboard APIs
- Theme and translation management
- Custom JavaScript integration
- Error handling and debugging
- Rate limiting and best practices

**Key Topics:**
- API endpoint specifications
- Request/response formats
- Integration examples and scripts
- WebSocket event handling
- Home Assistant API integration

### 🔧 [04 - Troubleshooting & Maintenance](04-Troubleshooting-Maintenance.md)
**Systematic troubleshooting and operational procedures**

- Common issues and quick fixes
- Connection and authentication problems
- Performance optimization and debugging
- Configuration validation and repair
- Maintenance schedules and procedures
- Monitoring and alerting setup
- Backup and recovery strategies
- Update and migration procedures

**Key Topics:**
- Diagnostic tools and commands
- Log analysis and debugging
- Performance monitoring scripts
- Automated maintenance procedures
- Health check implementations

### 🏗️ [05 - Component Architecture](05-Component-Architecture.md)
**Deep dive into component system and development**

- Application architecture and design patterns
- Component hierarchy and relationships
- State management with Svelte stores
- Custom component development
- Plugin architecture and extensibility
- Integration patterns and best practices
- Performance considerations
- Testing strategies and examples

**Key Topics:**
- Svelte/SvelteKit architecture
- Component development guidelines
- Plugin system and custom components
- State management patterns
- Performance optimization techniques

## Quick Start Guide

### For End Users

1. **Installation**: Start with [Installation & Deployment](02-Installation-Deployment.md)
2. **Configuration**: Follow [Configuration Reference](01-Configuration-Reference.md)
3. **Troubleshooting**: Use [Troubleshooting Guide](04-Troubleshooting-Maintenance.md) for issues

### For Developers

1. **Architecture**: Understand [Component Architecture](05-Component-Architecture.md)
2. **API Integration**: Reference [API Documentation](03-API-Reference.md)
3. **Development Setup**: Follow development section in [Installation Guide](02-Installation-Deployment.md)

### For System Administrators

1. **Deployment**: Use [Installation & Deployment](02-Installation-Deployment.md)
2. **Monitoring**: Implement procedures from [Troubleshooting & Maintenance](04-Troubleshooting-Maintenance.md)
3. **Security**: Follow security guidelines across all documentation

## Common Use Cases

### Basic Home Dashboard

```yaml
# Minimal configuration for home dashboard
# configuration.yaml
locale: en

# dashboard.yaml
theme: godis
views:
  - name: Home
    sections:
      - name: Lights
        items:
          - type: button
            entity_id: light.living_room
          - type: button
            entity_id: light.kitchen
sidebar:
  - type: time
  - type: weather
    entity_id: weather.home
```

**Documentation**: [Configuration Reference → Basic Setup](01-Configuration-Reference.md#configuration-examples)

### Production Deployment

```yaml
# docker-compose.yml for production
services:
  ha-fusion:
    image: ghcr.io/matt8707/ha-fusion:latest
    environment:
      - HASS_URL=https://your-ha-instance.com
      - TZ=UTC
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5050"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Documentation**: [Installation & Deployment → Production](02-Installation-Deployment.md#production-deployment)

### Custom Component Development

```svelte
<!-- CustomWidget.svelte -->
<script lang="ts">
  export let item: CustomWidgetItem;
  export let entity: HassEntity;
  
  $: displayValue = processEntityState(entity);
</script>

<div class="custom-widget">
  <h3>{item.title}</h3>
  <span class="value">{displayValue}</span>
</div>
```

**Documentation**: [Component Architecture → Custom Development](05-Component-Architecture.md#custom-component-development)

### API Integration

```bash
# Save configuration via API
curl -X POST http://localhost:5050/_api/save_config \
  -H "Content-Type: application/json" \
  -d '{"locale": "en", "motion": true}'

# Get all themes
curl -X GET http://localhost:5050/_api/get_all_themes
```

**Documentation**: [API Reference → Configuration API](03-API-Reference.md#configuration-api)

## Configuration Examples

### Kiosk Mode Setup

```yaml
# Optimized for wall-mounted tablets
# configuration.yaml
locale: en
motion: false  # Better performance

# dashboard.yaml
theme: minimal-theme
hide_views: true
hide_sidebar: false
sidebarWidth: 300
```

**URL**: `http://your-ha-fusion.com/?menu=false`

### Multi-User Dashboard

```yaml
# dashboard.yaml with role-based sections
views:
  - name: Admin
    sections:
      - name: System Controls
        visibility:
          conditions:
            - condition: state
              entity: input_boolean.admin_mode
              state: "on"
        items:
          - type: button
            entity_id: switch.main_power
```

### Performance Optimized

```yaml
# configuration.yaml
motion: false
custom_js: false

# dashboard.yaml
hide_sidebar: false
sidebarWidth: 250
views:
  - name: Essential
    sections:
      - name: Critical
        items:
          # Limit to 10-15 essential items
```

## Troubleshooting Quick Reference

### Common Issues

| Issue | Quick Fix | Documentation |
|-------|-----------|---------------|
| Blank screen | Check HASS_URL and authentication | [Troubleshooting → Connection](04-Troubleshooting-Maintenance.md#connection-problems) |
| Config not saving | Check file permissions | [Troubleshooting → Configuration](04-Troubleshooting-Maintenance.md#configuration-issues) |
| Slow performance | Disable animations, reduce components | [Troubleshooting → Performance](04-Troubleshooting-Maintenance.md#performance-problems) |
| Theme not loading | Validate YAML syntax | [Troubleshooting → Theme Issues](04-Troubleshooting-Maintenance.md#theme-and-ui-problems) |

### Diagnostic Commands

```bash
# Health check
curl -f http://localhost:5050/_api/version

# Validate configuration
python3 -c "import yaml; yaml.safe_load(open('data/configuration.yaml'))"

# Check logs
docker logs ha-fusion --tail 50

# Test Home Assistant connection
curl -f $HASS_URL/api/
```

## Best Practices

### Configuration Management

1. **Version Control**: Keep configurations in git
2. **Validation**: Always validate YAML before deployment
3. **Backup**: Regular automated backups
4. **Testing**: Test changes in staging environment
5. **Documentation**: Document custom configurations

### Performance Optimization

1. **Resource Limits**: Set appropriate container limits
2. **Component Count**: Limit items per section (5-10)
3. **Animations**: Disable on low-power devices
4. **Caching**: Use appropriate cache headers
5. **Monitoring**: Regular performance monitoring

### Security Hardening

1. **HTTPS**: Always use HTTPS in production
2. **Authentication**: Use strong authentication methods
3. **Network**: Proper firewall configuration
4. **Updates**: Regular security updates
5. **Monitoring**: Security event monitoring

## Contributing to Documentation

### Documentation Standards

- **Clarity**: Write for your target audience
- **Completeness**: Cover all aspects thoroughly
- **Examples**: Provide practical examples
- **Structure**: Use consistent organization
- **Maintenance**: Keep documentation current

### Updating Documentation

1. **Identify Changes**: Note what has changed
2. **Update Relevant Sections**: Modify affected documentation
3. **Add Examples**: Include practical examples
4. **Test Instructions**: Verify all procedures work
5. **Review**: Have others review changes

### Documentation Structure

```
Docs/
├── README.md                           # This file - main index
├── 01-Configuration-Reference.md       # Complete config guide
├── 02-Installation-Deployment.md       # Deployment guide
├── 03-API-Reference.md                 # API documentation
├── 04-Troubleshooting-Maintenance.md   # Operations guide
└── 05-Component-Architecture.md        # Development guide
```

## Support and Community

### Getting Help

1. **Documentation**: Search this documentation first
2. **GitHub Issues**: Check existing issues and discussions
3. **Community**: Join community discussions
4. **Logs**: Always include relevant logs when reporting issues

### Reporting Issues

When reporting issues, include:

- HA-Fusion version (`curl http://localhost:5050/_api/version`)
- Home Assistant version
- Installation method (Docker, Add-on, etc.)
- Configuration files (sanitized)
- Error logs
- Steps to reproduce

### Contributing

1. **Issues**: Report bugs and request features
2. **Documentation**: Improve and expand documentation
3. **Code**: Contribute code improvements
4. **Testing**: Help test new features
5. **Community**: Help other users

## Version Information

This documentation covers HA-Fusion version 2024.10.0 and later. For older versions, refer to the appropriate release documentation.

### Documentation Versioning

- **Major Updates**: New documentation versions for breaking changes
- **Minor Updates**: In-place updates for feature additions
- **Patches**: Corrections and clarifications

### Changelog

- **2024.10.0**: Initial comprehensive documentation suite
- **Future**: Documentation will be updated with each release

## License and Attribution

This documentation is part of the HA-Fusion project. Please refer to the main project repository for license information and attribution requirements.

---

**Last Updated**: January 2024  
**Documentation Version**: 1.0.0  
**Covers HA-Fusion**: 2024.10.0+
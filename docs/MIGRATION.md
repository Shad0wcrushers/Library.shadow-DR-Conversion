# Migration Guide

This guide helps you migrate between major versions of chat-platform-bridge.

## Table of Contents

- [From 0.x to 1.0](#from-0x-to-10)
- [Future Migrations](#future-migrations)

## From 0.x to 1.0

This is the initial stable release, so there are no migrations yet. This section will be populated when version 2.0 is released.

## Future Migrations

### Upcoming in v2.0 (Planned)

Potential breaking changes being considered:

1. **Unified Event System**
   - Current: Different event names per platform
   - Planned: Fully normalized event names

2. **Enhanced Type Safety**
   - Current: Some `any` types in converters
   - Planned: Full type safety with strict generics

3. **Plugin System**
   - Current: Direct provider registration
   - Planned: Plugin-based architecture

## Migration Best Practices

### Before Upgrading

1. **Read the CHANGELOG**: Review breaking changes
2. **Check deprecation warnings**: Fix deprecated code
3. **Run tests**: Ensure current version works
4. **Update dependencies**: Keep peer dependencies current

### During Upgrade

1. **Update package**:
   ```bash
   npm install chat-platform-bridge@latest
   ```

2. **Fix TypeScript errors**: Address type conflicts

3. **Update imports**: If import paths changed

4. **Test thoroughly**: Run full test suite

### After Upgrade

1. **Monitor for issues**: Watch for runtime errors
2. **Update documentation**: Note version in your docs
3. **Remove deprecated code**: Clean up old patterns
4. **Performance check**: Verify no regressions

## Need Help?

- Check [GitHub Issues](https://github.com/Shadowcrushers/chat-platform-bridge/issues)
- Join [GitHub Discussions](https://github.com/Shadowcrushers/chat-platform-bridge/discussions)
- Review [API Documentation](../API.md)

## Deprecation Timeline

When we deprecate features:

1. **Announcement**: Mentioned in CHANGELOG and documentation
2. **Warning Period**: At least one major version
3. **Removal**: In next major version

Example:
- Deprecated in v1.5.0
- Warnings in v1.5.0 - v1.x.x
- Removed in v2.0.0

---

**Note**: This is a living document. It will be updated with each major release.

Last Updated: v1.0.0 (February 15, 2026)

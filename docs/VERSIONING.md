# Versioning Guide

This document explains the versioning strategy for Library@DR-Conversion.

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version (X.0.0): Breaking changes
- **MINOR** version (0.X.0): New features (backward compatible)
- **PATCH** version (0.0.X): Bug fixes (backward compatible)

## Version Numbering

Given a version number MAJOR.MINOR.PATCH, increment the:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

## Release Process

### 1. Determine Version

Based on changes since last release:

- Breaking changes? → Major version
- New features? → Minor version
- Bug fixes only? → Patch version

### 2. Update Files

```bash
# Update package.json version
npm version [major|minor|patch]

# Or manually specify version
npm version 1.2.3
```

### 3. Update CHANGELOG.md

Add entry for the new version with:
- Release date
- List of changes (Added, Changed, Deprecated, Removed, Fixed, Security)

### 4. Commit and Tag

```bash
git add .
git commit -m "chore: release v1.2.3"
git tag v1.2.3
git push && git push --tags
```

### 5. Publish

```bash
# Dry run first
npm publish --dry-run

# Publish to npm
npm publish

# For pre-releases
npm publish --tag beta
```

## Pre-release Versions

For alpha, beta, or rc releases:

```bash
# Create pre-release version
npm version 1.2.0-beta.1

# Publish with tag
npm publish --tag beta
```

Users can install with:
```bash
npm install Library@DR-Conversion@beta
```

## Version Tags

- `latest`: Stable release (default)
- `next`: Next major version preview
- `beta`: Beta testing
- `alpha`: Early alpha testing

## Breaking Changes

When introducing breaking changes:

1. **Document** what breaks and why
2. **Provide migration guide** in CHANGELOG
3. **Bump major version**
4. **Consider deprecation** period first

Example breaking changes:
- Removing public APIs
- Changing function signatures
- Changing behavior of existing features
- Updating minimum Node.js version
- Updating peer dependencies (major versions)

## Backward Compatibility

Maintain backward compatibility for:
- Public APIs
- Event names and signatures
- Configuration options
- Type definitions

## Deprecation Policy

Before removing features:

1. **Mark as deprecated** in documentation
2. **Add deprecation warning** in code
3. **Keep for at least one major version**
4. **Provide alternative** in warning

```typescript
/**
 * @deprecated Use newMethod() instead. Will be removed in v2.0.0
 */
export function oldMethod() {
  console.warn('oldMethod is deprecated, use newMethod instead');
  return newMethod();
}
```

## Version Support

- **Current major version**: Full support
- **Previous major version**: Security fixes only (6 months)
- **Older versions**: No support

## Changelog Format

```markdown
## [1.2.3] - 2026-02-15

### Added
- New feature X
- Support for Y

### Changed
- Improved performance of Z

### Deprecated
- Feature A will be removed in v2.0.0

### Removed
- Unused feature B

### Fixed
- Bug #123
- Issue with C

### Security
- Fixed vulnerability in D
```

## Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Published to npm
- [ ] GitHub release created
- [ ] Discord/community announced

## Emergency Releases

For critical security fixes:

1. Create patch immediately
2. Test thoroughly
3. Release as soon as possible
4. Notify users through all channels
5. Consider backporting to older versions

## Questions?

Contact maintainers or open an issue on GitHub.

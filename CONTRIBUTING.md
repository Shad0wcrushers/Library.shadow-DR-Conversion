# Contributing to Chat Platform Bridge

Thank you for your interest in contributing to Library.DR-Conversion! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🌐 Add support for new platforms
- ✅ Write tests

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- TypeScript knowledge
- Git

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/Shadowcrushers/chat-platform-bridge.git
   cd Library.shadow-DR-Conversion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📝 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add JSDoc comments to public APIs
- Update types as needed

### 3. Test Your Changes

```bash
# Build the project
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Test with an example bot
DISCORD_TOKEN=your-token ts-node examples/simple-bot.ts
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add support for message reactions"
git commit -m "fix: resolve memory leak in event listeners"
git commit -m "docs: update README with new examples"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## 🏗️ Adding a New Platform Provider

### Step 1: Create Provider Directory

```
src/providers/yourplatform/
├── provider.ts       # Main provider implementation
├── converters.ts     # Type converters
└── types.ts          # Platform-specific types
```

### Step 2: Implement Types

```typescript
// types.ts
import { PlatformCapabilities } from '../../types/platform';

export interface YourPlatformConfig {
  token: string;
  // Add other config options
}

export const YOURPLATFORM_CAPABILITIES: PlatformCapabilities = {
  embeds: true,
  buttons: true,
  // ... define capabilities
};
```

### Step 3: Create Converters

```typescript
// converters.ts
import { Message, User } from '../../types/common';

export function toGenericMessage(platformMsg: any): Message {
  return {
    id: platformMsg.id,
    content: platformMsg.content,
    author: toGenericUser(platformMsg.author),
    // ... map all required fields
  };
}

export function toGenericUser(platformUser: any): User {
  return {
    id: platformUser.id,
    username: platformUser.username,
    // ... map all required fields
  };
}

// Add converters for Channel, Guild, Embed, etc.
```

### Step 4: Implement Provider

```typescript
// provider.ts
import { BaseProvider } from '../base';
import { Message, User, Channel, Guild } from '../../types/common';

export class YourPlatformProvider extends BaseProvider {
  readonly platformName = 'yourplatform';
  readonly platformVersion = '1.0.0';
  
  async connect(): Promise<void> {
    // Implementation
  }
  
  async disconnect(): Promise<void> {
    // Implementation
  }
  
  async sendMessage(channelId: string, options: any): Promise<Message> {
    // Implementation
  }
  
  // ... implement all required methods
}
```

### Step 5: Register Provider

Update `src/client.ts`:

```typescript
import { YourPlatformProvider } from './providers/yourplatform/provider';

// In createProvider method:
case 'yourplatform':
  return new YourPlatformProvider(config);
```

Update `src/types/platform.ts`:

```typescript
export type PlatformType = 'discord' | 'root' | 'yourplatform';
```

### Step 6: Add Tests

Create `tests/providers/yourplatform.test.ts`:

```typescript
import { YourPlatformProvider } from '../../src/providers/yourplatform/provider';

describe('YourPlatformProvider', () => {
  it('should connect successfully', async () => {
    // Test implementation
  });
  
  // Add more tests
});
```

### Step 7: Add Examples

Create `examples/yourplatform-bot.ts` demonstrating your platform's usage.

### Step 8: Update Documentation

- Update README.md with platform support status
- Add platform-specific documentation
- Include setup instructions

## 📋 Code Style Guidelines

### TypeScript

- Use strict TypeScript mode
- Always define types explicitly for public APIs
- Use interfaces for objects that can be extended
- Use type aliases for unions and simple types
- Prefer `async/await` over promises

### Naming Conventions

- Classes: `PascalCase` (e.g., `UnifiedClient`)
- Interfaces: `PascalCase` (e.g., `MessageOptions`)
- Functions: `camelCase` (e.g., `sendMessage`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_INTENTS`)
- Private members: prefix with `_` (e.g., `_isConnected`)

### Documentation

- Add JSDoc comments to all public methods and classes
- Include `@param` and `@returns` tags
- Provide usage examples in JSDoc
- Keep comments up to date with code changes

Example:

```typescript
/**
 * Send a message to a channel
 * 
 * @param channelId The channel ID to send to
 * @param options Message content or options
 * @returns The sent message
 * 
 * @example
 * ```typescript
 * await client.sendMessage('123456', 'Hello!');
 * ```
 */
async sendMessage(channelId: string, options: string | MessageOptions): Promise<Message> {
  // Implementation
}
```

### Error Handling

- Use custom error classes from `utils/errors.ts`
- Always include context in error messages
- Log errors before emitting them
- Validate input parameters

```typescript
if (!channelId) {
  throw new MessageError('Channel ID is required');
}

try {
  // Operation
} catch (error) {
  this.handleError(error, 'sendMessage');
  throw new MessageError(`Failed to send message: ${error.message}`);
}
```

## 🧪 Testing Guidelines

- Write unit tests for all converters
- Write integration tests for providers
- Mock external dependencies
- Aim for >80% code coverage
- Test error cases

Example test:

```typescript
describe('Discord Converters', () => {
  it('should convert Discord message to generic message', () => {
    const discordMsg = createMockDiscordMessage();
    const genericMsg = toGenericMessage(discordMsg, mockProvider);
    
    expect(genericMsg.id).toBe(discordMsg.id);
    expect(genericMsg.content).toBe(discordMsg.content);
    expect(genericMsg.platform).toBe('discord');
  });
});
```

## 📦 Publishing (Maintainers Only)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Commit changes: `git commit -m "chore: bump version to x.y.z"`
4. Create tag: `git tag vx.y.z`
5. Push: `git push && git push --tags`
6. Build: `npm run build`
7. Publish: `npm publish`

## 🐛 Reporting Bugs

When reporting bugs, please include:

- Library version
- Platform (Discord, Root, etc.)
- Node.js version
- Minimal reproduction code
- Expected behavior
- Actual behavior
- Error messages and stack traces

## 💡 Suggesting Features

When suggesting features:

- Check if it already exists
- Explain the use case
- Describe the proposed API
- Consider platform compatibility
- Provide examples of usage

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thank you for contributing to Library.DR-Conversion! Your efforts help make multi-platform bot development easier for everyone.

## Questions?

- 📫 Open an issue
- 💬 Start a discussion
- 📧 Email the maintainers

---

Happy coding! 🚀

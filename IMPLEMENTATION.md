# Implementation Guide

This document provides a comprehensive overview of the chat-platform-bridge implementation and how to use, extend, and maintain it.

## 🎯 Overview

chat-platform-bridge is a TypeScript library that provides a unified interface for building chat bots across multiple platforms. The architecture is designed around three core concepts:

1. **Generic Types**: Platform-agnostic interfaces (Message, User, Channel, etc.)
2. **Platform Providers**: Platform-specific implementations that adhere to a common interface
3. **Unified Client**: Single entry point that delegates to the appropriate provider

## 📁 Project Structure

```
chat-platform-bridge/
├── src/
│   ├── client.ts                    # UnifiedClient - main entry point
│   ├── index.ts                     # Public API exports
│   ├── types/
│   │   ├── common.ts                # Generic types (Message, User, Channel, Guild, etc.)
│   │   ├── platform.ts              # PlatformProvider interface
│   │   ├── events.ts                # Event type definitions
│   │   └── embeds.ts                # Rich content types (Embed, MessageOptions, etc.)
│   ├── providers/
│   │   ├── base.ts                  # BaseProvider abstract class
│   │   ├── discord/
│   │   │   ├── provider.ts          # Discord implementation
│   │   │   ├── converters.ts        # Discord <-> Generic converters
│   │   │   └── types.ts             # Discord-specific types
│   │   └── root/
│   │       ├── provider.ts          # Root stub implementation
│   │       ├── converters.ts        # Root <-> Generic converters
│   │       └── types.ts             # Root-specific types
│   └── utils/
│       ├── errors.ts                # Custom error classes
│       └── logger.ts                # Logging utility
├── examples/
│   ├── simple-bot.ts                # Basic cross-platform bot
│   ├── discord-bot.ts               # Discord-specific features
│   ├── root-bot.ts                  # Root platform example
│   └── advanced-bot.ts              # Advanced features demo
├── tests/
│   ├── client.test.ts               # UnifiedClient tests
│   ├── utils/
│   │   └── errors.test.ts           # Error class tests
│   └── providers/
│       └── discord/
│           └── converters.test.ts   # Converter tests
├── package.json                     # Package configuration
├── tsconfig.json                    # TypeScript configuration
├── jest.config.js                   # Jest test configuration
├── .eslintrc.json                   # ESLint configuration
├── README.md                        # Main documentation
├── CONTRIBUTING.md                  # Contribution guidelines
├── CHANGELOG.md                     # Version history
└── LICENSE                          # MIT License
```

## 🏗️ Architecture

### Layer 1: Generic Types (`src/types/`)

These types represent the lowest common denominator across all platforms:

- **Message**: Represents a chat message with content, author, channel, etc.
- **User**: Represents a user with ID, username, display name, avatar
- **Channel**: Represents a communication channel
- **Guild**: Represents a server/community
- **Embed**: Rich message content with title, description, fields, etc.

**Key Decision**: These types include methods (like `message.reply()`) that delegate back to the provider, making the API intuitive and object-oriented.

### Layer 2: BaseProvider (`src/providers/base.ts`)

Abstract class that:
- Extends EventEmitter for event handling
- Defines abstract methods that all providers must implement
- Provides helper methods (error handling, validation, logging)
- Enforces consistent behavior across platforms

**Abstract Methods**:
- `connect()` / `disconnect()` - Platform connection lifecycle
- `sendMessage()` / `editMessage()` / `deleteMessage()` - Message operations
- `getUser()` / `getChannel()` / `getGuild()` - Resource fetching
- `convertMessage()` / `convertUser()` / etc. - Type conversion

### Layer 3: Platform Providers

#### Discord Provider (`src/providers/discord/`)

**Fully implemented** using discord.js v14:

- **provider.ts**: Main implementation
  - Creates Discord.js Client with configurable intents
  - Sets up event listeners for all Discord events
  - Implements all abstract methods from BaseProvider
  - Handles errors and reconnection

- **converters.ts**: Bidirectional converters
  - `toGenericMessage()` - Convert discord.js Message to generic Message
  - `toGenericUser()` - Convert discord.js User to generic User
  - `toDiscordEmbed()` - Convert generic Embed to discord.js EmbedBuilder
  - Handles all Discord-specific nuances (discriminators, guild features, etc.)

- **types.ts**: Discord-specific types and constants
  - DiscordConfig interface
  - Platform capabilities definition
  - Default intents

#### Root Provider (`src/providers/root/`)

**Stub implementation** ready for completion:

- Follows same structure as Discord provider
- Type definitions for Root entities (placeholder)
- Converter functions with TODOs marking where real logic goes
- Comments explaining what needs to be implemented

**To complete**: 
1. Install or create Root SDK
2. Replace placeholder types with real Root API responses
3. Implement actual API calls in provider.ts
4. Update converters with real mapping logic
5. Test with real Root bot

### Layer 4: UnifiedClient (`src/client.ts`)

The main entry point that:
1. Creates the appropriate provider based on platform configuration
2. Forwards all events from provider to itself
3. Proxies all methods to the underlying provider
4. Provides a consistent API regardless of platform

**Usage**:
```typescript
const client = new UnifiedClient({
  platform: 'discord', // or 'root'
  config: { token: 'your-token' }
});

client.on('message', async (message) => {
  // message is always a generic Message type
  await message.reply('Hello!');
});

await client.connect();
```

## 🔄 Data Flow

### Incoming Events (Platform → Generic)

```
Discord API
    ↓
discord.js Library
    ↓
DiscordProvider.setupEventListeners()
    ↓
Converters.toGenericMessage()
    ↓
provider.emit('message', genericMessage)
    ↓
UnifiedClient event forwarding
    ↓
User's event handler
```

### Outgoing Operations (Generic → Platform)

```
User calls: client.sendMessage(channelId, options)
    ↓
UnifiedClient.sendMessage()
    ↓
provider.sendMessage()
    ↓
Converters.toDiscordMessageOptions()
    ↓
discord.js channel.send()
    ↓
Discord API
    ↓
Returns: Discord Message
    ↓
Converters.toGenericMessage()
    ↓
Returns: Generic Message
```

## 🎨 Design Patterns Used

### 1. Strategy Pattern
- UnifiedClient delegates to different providers
- Allows switching platforms without changing client code

### 2. Adapter Pattern
- Converters adapt platform-specific types to generic types
- Bidirectional conversion for seamless integration

### 3. Template Method Pattern
- BaseProvider defines the skeleton
- Concrete providers implement specific steps

### 4. Factory Pattern
- UnifiedClient creates appropriate provider based on config
- Centralizes provider instantiation logic

## 🔧 Key Implementation Details

### Event Forwarding

Events flow from platform SDK → Provider → UnifiedClient:

```typescript
// In DiscordProvider
this.client.on(Events.MessageCreate, (discordMsg) => {
  const message = this.convertMessage(discordMsg);
  this.emitGenericEvent('message', message);
});

// In UnifiedClient
events.forEach(event => {
  this.provider.on(event, (...args) => {
    this.emit(event, ...args);
  });
});
```

### Message Methods

Generic Message objects have methods that delegate back to the provider:

```typescript
// In converters.ts
const message: Message = {
  id: discordMsg.id,
  content: discordMsg.content,
  // ...
  
  async reply(content) {
    const reply = await discordMsg.reply(
      typeof content === 'string' ? content : toDiscordMessageOptions(content)
    );
    return toGenericMessage(reply, provider);
  }
};
```

This creates an intuitive API: `message.reply()` instead of `client.replyToMessage(message.id, ...)`

### Error Handling

Three layers of error handling:

1. **Platform SDK errors**: Caught and wrapped in custom error classes
2. **Provider errors**: Logged and emitted as 'error' events
3. **Client errors**: Propagated to user code

```typescript
try {
  await operation();
} catch (error) {
  this.handleError(error, 'operationName');
  throw new MessageError(`Failed: ${error.message}`);
}
```

## 🧩 Extending the Library

### Adding a New Platform

See CONTRIBUTING.md for detailed steps. Summary:

1. Create `src/providers/yourplatform/` directory
2. Implement provider extending BaseProvider
3. Create converters for all types
4. Define platform-specific types and capabilities
5. Register in UnifiedClient
6. Add tests and examples
7. Update documentation

### Adding New Features

To add a feature that works across platforms:

1. **Add to generic types** (`src/types/common.ts`)
   ```typescript
   interface Message {
     // ... existing properties
     pin(): Promise<void>; // New feature
   }
   ```

2. **Update BaseProvider** (`src/providers/base.ts`)
   ```typescript
   abstract pinMessage(messageId: string, channelId: string): Promise<void>;
   ```

3. **Implement in each provider**
   ```typescript
   // In DiscordProvider
   async pinMessage(messageId: string, channelId: string): Promise<void> {
     const channel = await this.client.channels.fetch(channelId);
     const message = await channel.messages.fetch(messageId);
     await message.pin();
   }
   ```

4. **Update converters**
   ```typescript
   // Add pin method to converted message
   async pin() {
     await provider.pinMessage(discordMsg.id, discordMsg.channel.id);
   }
   ```

## 🧪 Testing Strategy

### Unit Tests
- Test converters with mock data
- Test error classes
- Test utility functions

### Integration Tests
- Test provider implementations with mocked SDK
- Test UnifiedClient with mocked providers

### End-to-End Tests (Not included, recommended)
- Test with real bot tokens in CI/CD
- Use separate test accounts/servers
- Verify cross-platform consistency

## 📦 Publishing Workflow

1. **Prepare release**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

2. **Update version**
   - Update `package.json` version
   - Update `CHANGELOG.md`
   - Update version in code if needed

3. **Commit and tag**
   ```bash
   git commit -m "chore: release v1.0.0"
   git tag v1.0.0
   git push && git push --tags
   ```

4. **Publish to npm**
   ```bash
   npm publish
   ```

## 🐛 Common Issues and Solutions

### Issue: "Module not found" errors

**Solution**: Ensure TypeScript compilation succeeded:
```bash
npm run build
```

### Issue: Discord bot doesn't respond

**Solution**: Check intents. MessageContent intent is required:
```typescript
intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent // Required!
]
```

### Issue: Type errors with platform-specific code

**Solution**: Use type assertions when accessing provider:
```typescript
const provider = client.getProvider() as DiscordProvider;
```

## 🎓 Best Practices

### For Library Users

1. **Handle errors**: Always have error event listener
2. **Use TypeScript**: Take advantage of type safety
3. **Environment variables**: Store tokens securely
4. **Graceful shutdown**: Clean up on exit
5. **Logging**: Use appropriate log levels

### For Contributors

1. **Follow conventions**: Use existing code style
2. **Document changes**: Update JSDoc and README
3. **Add tests**: Cover new features with tests
4. **Type everything**: No implicit any
5. **Consider platforms**: Think cross-platform from the start

## 📚 Additional Resources

- **Discord.js Documentation**: https://discord.js.org/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Jest Documentation**: https://jestjs.io/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

## 🚀 Future Improvements

- [ ] Implement message caching to reduce API calls
- [ ] Add rate limiting utilities
- [ ] Create interactive CLI for bot scaffolding
- [ ] Add webhook support
- [ ] Implement connection pooling for multiple bots
- [ ] Add metrics and monitoring utilities
- [ ] Create plugin system for community extensions
- [ ] Add support for more platforms (Slack, Telegram, etc.)

---

This implementation provides a solid foundation for multi-platform bot development. The modular architecture makes it easy to extend and maintain while providing a great developer experience.

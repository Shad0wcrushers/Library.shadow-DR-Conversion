# Chat Platform Bridge

> Unified interface for building multi-platform chat bots

[![npm version](https://badge.fury.io/js/Library@DR-Conversion-v0.1.0.svg)](https://www.npmjs.com/package/Library@DR-Conversion-v0.1.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Library@DR-Conversion-v0.1.0** is a TypeScript library that provides a unified, platform-agnostic interface for building chat bots that work across multiple platforms like Discord, Root, and potentially others. Write your bot logic once, and deploy it anywhere!

## ✨ Features

- 🌉 **Unified Interface**: Single API that works across all supported platforms
- 🔒 **Type-Safe**: Full TypeScript support with strict typing
- 🎯 **Platform-Agnostic**: Write platform-independent bot code
- 🔌 **Extensible**: Easy to add new platform providers
- 🎨 **Rich Content**: Support for embeds, buttons, reactions, and more
- ⚡ **Modern**: Built with async/await and ES2020+
- 📦 **Zero Config**: Works out of the box with sensible defaults

## 📋 Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| Discord | ✅ Fully Supported | Messages, Embeds, Reactions, Buttons, Slash Commands |
| Root | 🚧 Stub Implementation | Ready for implementation with Root API |
| Others | 📝 Planned | Open to community contributions |

## 🚀 Quick Start

### Installation

```bash
npm install Library@DR-Conversion-v0.1.0 discord.js
```

### Basic Usage

```typescript
import { UnifiedClient } from 'Library@DR-Conversion-v0.1.0';

// Create a client (works with any platform!)
const client = new UnifiedClient({
  platform: 'discord', // or 'root'
  config: {
    token: 'your-bot-token'
  }
});

// Listen for messages
client.on('message', async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

// Connect
await client.connect();
```

### Switching Platforms

The beauty of Library@DR-Conversion-v0.1.0 is that switching platforms is as simple as changing one line:

```typescript
// Discord bot
const client = new UnifiedClient({
  platform: 'discord',
  config: { token: process.env.DISCORD_TOKEN }
});

// Root bot (same code!)
const client = new UnifiedClient({
  platform: 'root',
  config: { token: process.env.ROOT_TOKEN }
});
```

## 📖 Documentation

### Creating Rich Messages

```typescript
// Send a message with embeds
await client.sendMessage(channelId, {
  content: 'Check this out!',
  embeds: [{
    title: 'Hello World',
    description: 'This works on all platforms!',
    color: '#00ff00',
    fields: [
      { name: 'Field 1', value: 'Value 1', inline: true },
      { name: 'Field 2', value: 'Value 2', inline: true }
    ],
    footer: {
      text: 'Powered by Library@DR-Conversion-v0.1.0'
    },
    timestamp: new Date()
  }]
});
```

### Handling Events

```typescript
client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('message', async (message) => {
  console.log(`${message.author.username}: ${message.content}`);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  console.log('Message edited');
});

client.on('messageDelete', (message) => {
  console.log('Message deleted');
});

client.on('error', (error) => {
  console.error('Error:', error);
});
```

### Working with Users and Channels

```typescript
// Get user information
const user = await client.getUser(userId);
console.log(`Username: ${user.username}`);
console.log(`Avatar: ${user.avatarUrl}`);

// Get channel information
const channel = await client.getChannel(channelId);
console.log(`Channel: ${channel.name} (${channel.type})`);

// Get guild/server information
const guild = await client.getGuild(guildId);
console.log(`Guild: ${guild.name} with ${guild.memberCount} members`);
```

### Message Operations

```typescript
// Reply to a message
await message.reply('This is a reply');

// Edit a message
const sent = await message.reply('Original');
await sent.edit('Edited!');

// Delete a message
await message.delete();

// React to a message
await message.react('👍');
await message.react('❤️');
```

## 🎯 Examples

The `examples/` directory contains several sample bots:

- **simple-bot.ts**: Basic bot with common commands
- **discord-bot.ts**: Discord-specific features and optimizations
- **root-bot.ts**: Root platform example (stub)
- **advanced-bot.ts**: Advanced features including error handling, stats tracking, and rich embeds

Run an example:

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run simple bot
PLATFORM=discord BOT_TOKEN=your-token ts-node examples/simple-bot.ts

# Run Discord-specific bot
DISCORD_TOKEN=your-token ts-node examples/discord-bot.ts
```

## 🏗️ Architecture

### Project Structure

```
Library@DR-Conversion-v0.1.0/
├── src/
│   ├── client.ts                    # UnifiedClient (main entry point)
│   ├── types/
│   │   ├── common.ts                # Generic types (Message, User, etc.)
│   │   ├── platform.ts              # Platform interface
│   │   ├── events.ts                # Event types
│   │   └── embeds.ts                # Rich content types
│   ├── providers/
│   │   ├── base.ts                  # BaseProvider abstract class
│   │   ├── discord/
│   │   │   ├── provider.ts          # Discord implementation
│   │   │   ├── converters.ts        # Type converters
│   │   │   └── types.ts             # Discord-specific types
│   │   └── root/
│   │       ├── provider.ts          # Root implementation (stub)
│   │       ├── converters.ts        # Type converters
│   │       └── types.ts             # Root-specific types
│   ├── utils/
│   │   ├── logger.ts                # Logging utility
│   │   └── errors.ts                # Custom error classes
│   └── index.ts                     # Main exports
├── examples/                        # Example bots
├── tests/                           # Test suite (coming soon)
└── dist/                            # Compiled output
```

### How It Works

1. **UnifiedClient**: Main class that users interact with
2. **Platform Providers**: Implement platform-specific logic (Discord, Root, etc.)
3. **Converters**: Translate between platform-specific and generic types
4. **Generic Types**: Platform-agnostic interfaces that represent common entities

```
┌─────────────────┐
│  Your Bot Code  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ UnifiedClient   │  ◄─── You interact with this
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ BaseProvider    │  ◄─── Abstract class
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Discord │ │   Root   │  ◄─── Platform-specific implementations
└─────────┘ └──────────┘
```

## 🔧 Advanced Usage

### Custom Logging

```typescript
import { UnifiedClient, LogLevel } from 'Library@DR-Conversion-v0.1.0';

const client = new UnifiedClient({
  platform: 'discord',
  config: { token: 'your-token' },
  logLevel: LogLevel.DEBUG // DEBUG, INFO, WARN, ERROR, NONE
});

// Change log level at runtime
client.setLogLevel(LogLevel.INFO);
```

### Accessing Platform-Specific Features

While the goal is platform-agnostic code, sometimes you need platform-specific features:

```typescript
import { DiscordProvider } from 'Library@DR-Conversion-v0.1.0';

const client = new UnifiedClient({
  platform: 'discord',
  config: { token: 'your-token' }
});

// Get the underlying Discord.js client
const provider = client.getProvider() as DiscordProvider;
const discordClient = provider.getClient();

// Now use Discord.js specific features
discordClient.on('voiceStateUpdate', (oldState, newState) => {
  // Handle voice state changes
});
```

### Error Handling

```typescript
import { 
  UnifiedClient, 
  BridgeError,
  UnsupportedPlatformError,
  AuthenticationError,
  ResourceNotFoundError 
} from 'Library@DR-Conversion-v0.1.0';

client.on('message', async (message) => {
  try {
    const user = await client.getUser('invalid-id');
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      await message.reply('User not found!');
    } else if (error instanceof BridgeError) {
      await message.reply('Something went wrong!');
    }
  }
});
```

## 🤝 Contributing

### Adding a New Platform Provider

Want to add support for a new platform? Here's how:

1. **Create provider directory**:
   ```
   src/providers/yourplatform/
   ├── provider.ts
   ├── converters.ts
   └── types.ts
   ```

2. **Extend BaseProvider**:
   ```typescript
   import { BaseProvider } from '../base';
   
   export class YourPlatformProvider extends BaseProvider {
     readonly platformName = 'yourplatform';
     readonly platformVersion = '1.0.0';
     
     async connect() { /* implement */ }
     async disconnect() { /* implement */ }
     // ... implement all required methods
   }
   ```

3. **Create converters**:
   ```typescript
   export function toGenericMessage(platformMsg: any): Message {
     return {
       id: platformMsg.id,
       content: platformMsg.text,
       // ... map all fields
     };
   }
   ```

4. **Register in UnifiedClient**:
   ```typescript
   // In src/client.ts
   case 'yourplatform':
     return new YourPlatformProvider(config);
   ```

5. **Add tests and examples**

See the Discord implementation for a complete example!

## 📝 API Reference

### UnifiedClient

#### Constructor
```typescript
new UnifiedClient(options: UnifiedClientConfig)
```

#### Methods
- `connect(): Promise<void>` - Connect to the platform
- `disconnect(): Promise<void>` - Disconnect from the platform
- `sendMessage(channelId, options): Promise<Message>` - Send a message
- `editMessage(messageId, channelId, content): Promise<Message>` - Edit a message
- `deleteMessage(messageId, channelId): Promise<void>` - Delete a message
- `getUser(userId): Promise<User>` - Get user information
- `getChannel(channelId): Promise<Channel>` - Get channel information
- `getGuild(guildId): Promise<Guild>` - Get guild information

#### Properties
- `platformName: string` - Current platform name
- `platformVersion: string` - Provider version
- `isConnected: boolean` - Connection status

#### Events
- `ready` - Emitted when connected
- `message` - Emitted on new message
- `messageUpdate` - Emitted on message edit
- `messageDelete` - Emitted on message delete
- `error` - Emitted on error

### Types

See [src/types/](src/types/) for complete type definitions.

## 🧪 Testing

```bash
npm test
```

## 🔨 Building

```bash
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [discord.js](https://discord.js.org/)
- Inspired by the need for platform-agnostic bot development
- Thanks to all contributors!

## 📞 Support

- 📫 Issues: [GitHub Issues](https://github.com/Shadowcrushers/chat-platform-bridge/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Shadowcrushers/chat-platform-bridge/discussions)
- 📖 Documentation: [Full Docs](https://github.com/Shadowcrushers/chat-platform-bridge/wiki)

## 🗺️ Roadmap

- [ ] Complete Root platform implementation
- [ ] Support for slash commands across platforms
- [ ] Button and select menu components
- [ ] File upload support
- [ ] Voice channel support
- [ ] Comprehensive test suite
- [ ] Interactive documentation
- [ ] CLI tool for scaffolding new bots

## ⚠️ Current Limitations

- Root provider is a stub implementation - complete it based on Root's API
- Some Discord-specific features may not be available on other platforms
- Voice channels are Discord-specific currently
- Slash commands need platform-specific registration

---

Made with ❤️ by [Shadowcrushers](https://github.com/Shadowcrushers)

**Star ⭐ this repo if you find it useful!**

# Library@DR-Conversion

> Unified interface for building multi-platform chat bots

[![npm version](https://badge.fury.io/js/library.dr-conversion.svg)](https://www.npmjs.com/package/library.dr-conversion)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Library.DR-Conversion** (v0.2.4) is a TypeScript library that provides a unified, platform-agnostic interface for building chat bots that work across multiple platforms like Discord, Root, and potentially others. Write your bot logic once, and deploy it anywhere!

## ✨ Features

- 🌉 **Unified Interface**: Single API that works across all supported platforms
- 🔒 **Type-Safe**: Full TypeScript support with strict typing
- 🎯 **Platform-Agnostic**: Write platform-independent bot code
- 🔄 **Bidirectional Conversion**: Convert bots between platforms (Discord ↔ Root) with the same codebase
- 🛡️ **Production-Ready**: Auto-detects production environments and adjusts logging for security
- 🔌 **Extensible**: Easy to add new platform providers
- 🎨 **Rich Content**: Support for embeds, buttons, reactions, and more
- ⚡ **Modern**: Built with async/await and ES2020+
- 📦 **Zero Config**: Works out of the box with sensible defaults

## 📋 Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| Discord | ✅ Fully Supported | Messages, Embeds, Reactions, Buttons, Slash Commands |
| Root | ✅ Fully Supported | Messages, Reactions, Pins, Typing Indicators, File Attachments (via `@rootsdk/server-bot` v0.17.0+) |
| Others | 📝 Planned | Open to community contributions |

## 🚀 Quick Start

### Installation

```bash
npm install library.dr-conversion
```

### Basic Usage

```typescript
import { UnifiedClient } from 'library.dr-conversion';

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

### Switching Platforms (Bidirectional Conversion)

The beauty of Library.DR-Conversion is that you can convert your bot between platforms **in both directions** - just change one line! Your bot logic remains the same whether you're moving from Discord to Root, Root to Discord, or to any other supported platform.

```typescript
// Discord bot
const client = new UnifiedClient({
  platform: 'discord',
  config: { token: process.env.DISCORD_TOKEN }
});

// Same bot on Root - just change the platform!
const client = new UnifiedClient({
  platform: 'root',
  config: { token: process.env.ROOT_TOKEN }
});
```

**No code rewriting needed!** All your message handlers, commands, and bot logic work on both platforms:

```typescript
// This code works on Discord, Root, or any supported platform
client.on('message', async (message) => {
  if (message.content === '!hello') {
    await message.reply('Hello from any platform!');
  }
  
  if (message.content === '!info') {
    await client.sendMessage(message.channel.id, {
      embeds: [{
        title: 'Bot Info',
        description: `Running on ${client.platformName}`,
        color: '#00ff00'
      }]
    });
  }
});
```

### 🔄 Multi-Instance Usage (Root Communities)

**Important for Root developers:** Root's architecture spins up separate server-side instances for each community. The library mirrors this design - each `UnifiedClient` connects to **one Root community**.

To manage multiple Root communities, create multiple client instances:

```typescript
// Bot connected to multiple Root communities
const community1Bot = new UnifiedClient({
  platform: 'root',
  config: { 
    token: process.env.ROOT_TOKEN,
    communityId: 'community-1-id'
  }
});

const community2Bot = new UnifiedClient({
  platform: 'root',
  config: { 
    token: process.env.ROOT_TOKEN,
    communityId: 'community-2-id'
  }
});

// Each instance operates independently
community1Bot.on('message', (msg) => {
  console.log('Message from Community 1');
});

community2Bot.on('message', (msg) => {
  console.log('Message from Community 2');
});

await community1Bot.connect();
await community2Bot.connect();
```

This pattern also works for running the same bot across **different platforms simultaneously**:

```typescript
const discordBot = new UnifiedClient({ platform: 'discord', config: { token: DISCORD_TOKEN } });
const rootBot = new UnifiedClient({ platform: 'root', config: { token: ROOT_TOKEN } });

// Same message handler shared across both platforms
const handleMessage = async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
};

discordBot.on('message', handleMessage);
rootBot.on('message', handleMessage);

await discordBot.connect();
await rootBot.connect();
```

### ⚠️ Deployment Considerations for Root Apps

**Important:** When deploying an app to Root's infrastructure, Root clones your server-side code and runs one instance per community. Be mindful of which platforms your code connects to:

```typescript
// ❌ DON'T: This would start BOTH Root and Discord bots when installed to Root
const rootBot = new UnifiedClient({ platform: 'root', config: { token: ROOT_TOKEN } });
const discordBot = new UnifiedClient({ platform: 'discord', config: { token: DISCORD_TOKEN } });
await rootBot.connect();
await discordBot.connect(); // Discord bot spins up for every Root community!
```

#### Built-in Safety: Environment Variable Control 🛡️

**Two ways to control bot startup:**

**1. Explicit Disable** (works always, no config needed):
```bash
ALLOW_DISCORD_BOT=false  # Blocks Discord bot startup
ALLOW_ROOT_BOT=false     # Blocks Root bot startup
```

**2. Require Explicit Enable** with `preventAutoStart: true`:

```typescript
// Requires explicit permission to start
const discordBot = new UnifiedClient({ 
  platform: 'discord', 
  config: { 
    token: DISCORD_TOKEN,
    preventAutoStart: true  // Requires ALLOW_DISCORD_BOT=true
  }
});

const rootBot = new UnifiedClient({ 
  platform: 'root', 
  config: { 
    token: ROOT_TOKEN,
    preventAutoStart: true  // Requires ALLOW_ROOT_BOT=true
  }
});

// Only bots with their ALLOW_{PLATFORM}_BOT=true will start
await discordBot.connect(); // Blocked unless ALLOW_DISCORD_BOT=true
await rootBot.connect();    // Blocked unless ALLOW_ROOT_BOT=true
```

**How it works:**
- `ALLOW_*_BOT=false` → ❌ **Always blocks** (even without `preventAutoStart`)
- `ALLOW_*_BOT=true` → ✅ **Always allows**
- `preventAutoStart: true` + env var not set → ❌ **Blocked** (requires explicit `=true`)
- `preventAutoStart: false` (or not set) + env var not set → ✅ **Allowed** (default behavior)

**Use case examples:**

**Scenario 1 (Simple):** Deploy to **Root**, disable Discord bot with env var only:

```typescript
// bot.ts - No preventAutoStart needed!
const discordBot = new UnifiedClient({ 
  platform: 'discord', 
  config: { token: process.env.DISCORD_TOKEN }
});

const rootBot = new UnifiedClient({ 
  platform: 'root', 
  config: { token: process.env.ROOT_TOKEN }
});

await discordBot.connect(); // Checks ALLOW_DISCORD_BOT
await rootBot.connect();    // Checks ALLOW_ROOT_BOT
```

```bash
# .env file for Root deployment
ALLOW_DISCORD_BOT=false        # ❌ Discord bot blocked
ROOT_TOKEN=your-root-token
DISCORD_TOKEN=your-discord-token
```

**Scenario 2 (Secure):** Use `preventAutoStart` to require explicit opt-in:

```typescript
// Requires explicit permission
const discordBot = new UnifiedClient({ 
  platform: 'discord', 
  config: { 
    token: process.env.DISCORD_TOKEN,
    preventAutoStart: true  // Requires ALLOW_DISCORD_BOT=true
  }
});

const rootBot = new UnifiedClient({ 
  platform: 'root', 
  config: { 
    token: process.env.ROOT_TOKEN,
    preventAutoStart: true  // Requires ALLOW_ROOT_BOT=true
  }
});

await discordBot.connect();
await rootBot.connect();
```

```bash
# Root deployment - must explicitly enable
ALLOW_ROOT_BOT=true            # ✅ Root bot will start
# ALLOW_DISCORD_BOT not set    # ❌ Discord bot blocked (preventAutoStart requires =true)
ROOT_TOKEN=your-root-token
DISCORD_TOKEN=your-discord-token
```

**Scenario 3:** Standalone Discord bot server:

```bash
# Option A: Explicit disable
ALLOW_DISCORD_BOT=true         # ✅ Discord bot will start
ALLOW_ROOT_BOT=false           # ❌ Root bot explicitly blocked
DISCORD_TOKEN=your-discord-token
ROOT_TOKEN=your-root-token

# Option B: Just don't set it (if using preventAutoStart)
ALLOW_DISCORD_BOT=true         # ✅ Discord bot will start
# ALLOW_ROOT_BOT not set        # ❌ Root bot blocked (if preventAutoStart=true)
DISCORD_TOKEN=your-discord-token
```

**Result:** Control bot startup purely via environment variables - no code changes needed!

#### Alternative: Environment Variable Control

**Best practice:** Use environment variables to conditionally activate platforms:

```typescript
// ✅ Control which platforms to activate
if (process.env.PLATFORM === 'root') {
  const bot = new UnifiedClient({ platform: 'root', config: { token: process.env.ROOT_TOKEN } });
  await bot.connect();
} else if (process.env.PLATFORM === 'discord') {
  const bot = new UnifiedClient({ platform: 'discord', config: { token: process.env.DISCORD_TOKEN } });
  await bot.connect();
}
```

Or use a hybrid approach for **intentional** cross-platform bots:

```typescript
// ✅ Explicitly bridge Root and Discord with safety guards
const platforms = process.env.PLATFORMS?.split(',') || ['root'];

for (const platform of platforms) {
  const bot = new UnifiedClient({
    platform,
    config: { 
      token: process.env[`${platform.toUpperCase()}_TOKEN`],
      preventAutoStart: true  // Requires ALLOW_{PLATFORM}_BOT=true
    }
  });
  await bot.connect();
}
// Set PLATFORMS='root' and ALLOW_ROOT_BOT=true for Root-only
// Set PLATFORMS='root,discord', ALLOW_ROOT_BOT=true, ALLOW_DISCORD_BOT=true for cross-platform
```

**Rule of thumb:** Use `preventAutoStart: true` to prevent accidental multi-platform startup when deploying to Root.

### 🔇 Production Logging

**Automatic:** The library detects production environments and automatically reduces logging verbosity to `WARN` level (only warnings and errors).

Production is detected when `NODE_ENV` is set to `production` or `prod`:

```bash
# Production deployment - automatic WARN level logging
NODE_ENV=production
ALLOW_ROOT_BOT=true
ROOT_TOKEN=your-token
```

**Manual control:** Override the automatic detection by setting `logLevel` explicitly:

```typescript
import { UnifiedClient, LogLevel } from 'library.dr-conversion';

// Force specific log level regardless of environment
const client = new UnifiedClient({
  platform: 'discord',
  config: { token: process.env.DISCORD_TOKEN },
  logLevel: LogLevel.ERROR  // Only log errors
});
```

**Available log levels:**
- `LogLevel.DEBUG` - All messages (verbose)
- `LogLevel.INFO` - Info, warnings, and errors (default in development)
- `LogLevel.WARN` - Warnings and errors only (default in production)
- `LogLevel.ERROR` - Errors only
- `LogLevel.NONE` - No logging

**Security note:** Debug and Info logs may contain sensitive information (tokens, user IDs, message content). Production mode automatically prevents this by limiting logs to warnings and errors. This is especially important for Discord bots to comply with Discord's data privacy guidelines.

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
      text: 'Powered by Library.DR-Conversion v0.1.4'
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
- **root-bot.ts**: Root platform example with full @rootsdk/server-bot integration
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
Library.DR-Conversion/
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
│   │       ├── provider.ts          # Root implementation (fully integrated with @rootsdk/server-bot)
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
import { UnifiedClient, LogLevel } from 'library.dr-conversion';

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
import { DiscordProvider } from 'library.dr-conversion';

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
} from 'library.dr-conversion';

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

- **Discord.js** - Built with [discord.js](https://discord.js.org/) for exceptional Discord API support
- **Root Platform** - For building an innovative chat platform and providing valuable architectural feedback
- **Skep** - For important discussions on multi-instance architecture and production deployment considerations
- **TypeScript Community** - For creating an amazing type-safe development experience
- **Open Source Community** - Inspired by the need for platform-agnostic bot development and unified APIs

Special thanks to everyone who provided feedback, testing, and suggestions during development!

## 📞 Support

### Getting Help

- 📦 **NPM Package**: [library.dr-conversion](https://www.npmjs.com/package/library.dr-conversion)
- 📖 **API Documentation**: See [API.md](API.md) for detailed API reference
- 📝 **Examples**: Check the [examples/](examples/) directory for sample bots
- 🐛 **Bug Reports**: Open an issue on GitHub with reproduction steps
- 💡 **Feature Requests**: Share your ideas and use cases
- 💬 **Questions**: Start a discussion or reach out to the community

### Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas where we'd love help:
- Root platform advanced features (thread/reply support with parentMessageIds)
- Additional platform providers (Telegram, Slack, Matrix)
- Documentation improvements and examples
- Test coverage expansion
- Bug fixes and performance optimizations
- Unified slash commands abstraction
- Interactive components (buttons, select menus)
- Unified file upload API abstraction

### Community Guidelines

- Be respectful and constructive
- Follow platform-specific terms of service (Discord, Root, etc.)
- Share knowledge and help other developers
- Report security vulnerabilities responsibly (see [SECURITY.md](SECURITY.md))

## 🗺️ Roadmap

### ✅ Completed in v0.1.x
- [x] Full Discord platform implementation via discord.js
- [x] Type-safe unified API across platforms
- [x] CLI tool for scaffolding new bot projects
- [x] Deployment safety controls (`preventAutoStart`, env var blocking)
- [x] Production environment auto-detection for logging
- [x] Bidirectional platform conversion support
- [x] Multi-instance architecture support
- [x] Rich embeds and message formatting
- [x] Event forwarding system
- [x] **Root platform implementation** - Fully integrated with `@rootsdk/server-bot`
  - ✅ Core messaging (send, edit, delete)
  - ✅ Message events (created, edited, deleted)
  - ✅ Channel events (created, edited, deleted)
  - ✅ Community member events (join, leave)
  - ✅ Community update events
  - ✅ Message reactions (add, remove, events)
  - ✅ Message pins (pin, unpin, events)
  - ✅ Typing indicators (send, events)
  - ✅ User, channel, and guild data fetching
  - ✅ Message methods (reply, delete, edit, react)
  - ✅ File attachments (sendMessageWithAttachments for pre-uploaded files)

### 🚧 In Progress
- [ ] Root advanced features
  - ⏳ Thread/reply support (parentMessageIds - SDK ready, not integrated)
  - ⏳ Additional community events (role changes, bans)
  - ⏳ Unified file upload API (abstract platform differences)

### 📋 Planned Features
- [ ] Slash commands abstraction across platforms
- [ ] Interactive components (buttons, select menus) - unified API
- [ ] Unified file upload abstraction (handle Discord direct + Root token-based)
- [ ] Voice channel support (Discord-specific initially)
- [ ] Webhook support
- [ ] Rate limiting and queue management
- [ ] Additional platforms (Telegram, Slack, Matrix)
- [ ] Comprehensive testing suite (currently 48/52 tests passing)

### 🔧 Developer Experience
- [ ] Interactive documentation site
- [ ] More example bots (slash commands, buttons, etc.)
- [ ] Migration guides from platform-specific libraries
- [ ] VS Code extension for bot development
- [ ] Debug tools and logging dashboard

## ⚠️ Current Limitations

### Platform Support
- **Discord**: ✅ Fully implemented and tested with `discord.js`
- **Root**: ✅ Fully implemented with `@rootsdk/server-bot` v0.17.0+
  - ✅ Core messaging (send, edit, delete, reply)
  - ✅ Message events (created, edited, deleted)
  - ✅ Channel events (created, edited, deleted)
  - ✅ Community events (member join/leave, community updates)
  - ✅ Reactions (add, remove, events)
  - ✅ Message pins (pin, unpin, events)
  - ✅ Typing indicators (send, receive events)
  - ✅ File attachments (server can send with pre-uploaded token URIs)
  - ⏳ Thread/reply support (SDK supports parentMessageIds - not yet implemented)
  - 📦 Install: `npm install @rootsdk/server-bot @rootsdk/dev-tools`
  - 📚 See [Root File Upload Architecture](#root-file-upload-architecture) for attachment details

### Feature Parity
- **Core Messaging**: ✅ Full parity (Discord & Root)
- **Reactions**: ✅ Full parity (Discord & Root)
- **Pins**: ✅ Full parity (Discord & Root)
- **Typing Indicators**: ✅ Full parity (Discord & Root)
- **File Uploads**: 
  - Discord: ✅ Direct upload via unified API
  - Root: ✅ Server-side sending with pre-uploaded tokens (see below)
- **Embeds**: Discord rich embeds supported, Root does not support Discord-style embeds
- **Slash Commands**: Platform-specific registration required (no unified abstraction yet)
- **Voice Channels**: Discord-only (Root uses WebRTC, different architecture)
- **Interactive Components**: Buttons and select menus not yet abstracted
- **Webhooks**: Not yet supported on either platform

### Root File Upload Architecture

Root uses a **client-server split architecture** for file uploads:

**Client-Side (Upload):**
1. Client requests upload token from Root API (via `@rootsdk/client-app`)
2. Client uploads file directly to Root's storage using the token
3. Client receives a token URI after successful upload

**Server-Side (Messaging):**
```typescript
// Server bot uses pre-uploaded token URIs to attach files to messages
const message = await rootClient.sendMessageWithAttachments(
  channelId,
  'Check out these files!',
  ['token://file-uri-1', 'token://file-uri-2']  // From client upload
);
```

**Why This Architecture?**
- Security: Clients upload directly to storage (no server bottleneck)
- Scalability: Distributed upload load across clients
- Bandwidth: Server doesn't proxy large files
- The `@rootsdk/server-bot` package intentionally does not expose upload token generation

**Implementation Options:**
1. **Hybrid Bot**: Use `@rootsdk/client-app` alongside server-bot for full file support
2. **Pure Server Bot**: Accept pre-uploaded token URIs from your application's client
3. **Custom Integration**: Integrate with Root's upload API directly

For most use cases, accepting token URIs from clients is the recommended approach.

### Known Issues
- Some test files have module resolution issues (3/52 test suites)
- TypeScript strict mode requires careful handling of environment variables
- Root file uploads require client-side token generation (architectural design, not a limitation)
- Root does not support Discord-style rich embeds (platform design difference)

### Deployment Notes
- Set `NODE_ENV=production` for automatic production logging
- Use `ALLOW_{PLATFORM}_BOT=false` to disable unwanted bots
- Root's multi-instance architecture requires one client per community
- Discord bots should comply with Discord's rate limits and data privacy guidelines

---

Made with ❤️ by [Shadowcrushers](https://github.com/Shadowcrushers)

**Star ⭐ this repo if you find it useful!**

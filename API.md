# API Quick Reference

Quick reference guide for the Library.DR-Conversion API.

## 🚀 Installation

```bash
npm install Library.DR-Conversion
```

## 📝 Basic Setup

```typescript
import { UnifiedClient, LogLevel } from 'Library.DR-Conversion';

const client = new UnifiedClient({
  platform: 'discord', // or 'root'
  config: {
    token: 'YOUR_BOT_TOKEN'
  },
  logLevel: LogLevel.INFO // optional
});

await client.connect();
```

## 📡 Events

### Core Events

```typescript
// Bot is ready
client.on('ready', () => {
  console.log('Bot is ready!');
});

// New message received
client.on('message', (message: Message) => {
  // Handle message
});

// Message edited
client.on('messageUpdate', (oldMessage: Message | null, newMessage: Message) => {
  // Handle edit
});

// Message deleted
client.on('messageDelete', (message: Message) => {
  // Handle deletion
});

// Error occurred
client.on('error', (error: Error) => {
  console.error('Error:', error);
});
```

### Guild Events

```typescript
// Bot joined a server
client.on('guildCreate', (guild: Guild) => {});

// Server updated
client.on('guildUpdate', (oldGuild: Guild | null, newGuild: Guild) => {});

// Bot left a server
client.on('guildDelete', (guild: Guild) => {});
```

### Member Events

```typescript
// Member joined
client.on('guildMemberAdd', (member: GuildMember) => {});

// Member left
client.on('guildMemberRemove', (member: GuildMember) => {});

// Member updated
client.on('guildMemberUpdate', (oldMember: GuildMember | null, newMember: GuildMember) => {});
```

### Channel Events

```typescript
// Channel created
client.on('channelCreate', (channel: Channel) => {});

// Channel updated
client.on('channelUpdate', (oldChannel: Channel | null, newChannel: Channel) => {});

// Channel deleted
client.on('channelDelete', (channel: Channel) => {});
```

## 💬 Sending Messages

### Simple Text Message

```typescript
await client.sendMessage(channelId, 'Hello, world!');
```

### Rich Message with Embed

```typescript
await client.sendMessage(channelId, {
  content: 'Optional text content',
  embeds: [{
    title: 'Embed Title',
    description: 'Embed description',
    color: '#00ff00', // or 0x00ff00
    fields: [
      { name: 'Field 1', value: 'Value 1', inline: true },
      { name: 'Field 2', value: 'Value 2', inline: true }
    ],
    footer: {
      text: 'Footer text',
      iconUrl: 'https://example.com/icon.png'
    },
    thumbnail: {
      url: 'https://example.com/thumb.png'
    },
    image: {
      url: 'https://example.com/image.png'
    },
    author: {
      name: 'Author Name',
      iconUrl: 'https://example.com/avatar.png',
      url: 'https://example.com'
    },
    timestamp: new Date()
  }]
});
```

## ✏️ Message Operations

### Reply to a Message

```typescript
client.on('message', async (message) => {
  // Simple reply
  await message.reply('This is a reply');
  
  // Reply with embed
  await message.reply({
    embeds: [{
      title: 'Reply',
      description: 'This is a rich reply'
    }]
  });
});
```

### Edit a Message

```typescript
const sentMessage = await client.sendMessage(channelId, 'Original');
await sentMessage.edit('Edited content');
```

### Delete a Message

```typescript
await message.delete();
```

### React to a Message

```typescript
await message.react('👍');
await message.react('❤️');
await message.react('🎉');
```

## 👤 User Operations

### Get User Information

```typescript
const user = await client.getUser(userId);

console.log(user.id);          // string
console.log(user.username);    // string
console.log(user.displayName); // string
console.log(user.avatarUrl);   // string | undefined
console.log(user.bot);         // boolean
console.log(user.platform);    // string
```

### Access Message Author

```typescript
client.on('message', (message) => {
  const author = message.author;
  console.log(`Message from ${author.username}`);
  
  if (author.bot) {
    return; // Ignore bot messages
  }
});
```

## 📺 Channel Operations

### Get Channel Information

```typescript
const channel = await client.getChannel(channelId);

console.log(channel.id);       // string
console.log(channel.name);     // string
console.log(channel.type);     // 'text' | 'voice' | 'dm' | 'group' | etc.
console.log(channel.topic);    // string | undefined
console.log(channel.platform); // string
```

### Access Message Channel

```typescript
client.on('message', (message) => {
  console.log(`Message in ${message.channel.name}`);
});
```

## 🏰 Guild Operations

### Get Guild Information

```typescript
const guild = await client.getGuild(guildId);

console.log(guild.id);          // string
console.log(guild.name);        // string
console.log(guild.iconUrl);     // string | undefined
console.log(guild.memberCount); // number | undefined
console.log(guild.description); // string | undefined
console.log(guild.ownerId);     // string | undefined
```

### Access Message Guild

```typescript
client.on('message', async (message) => {
  if (message.guild) {
    const guild = await client.getGuild(message.guild.id);
    console.log(`Message in ${guild.name}`);
  }
});
```

## 🎨 Embed Builder Pattern

```typescript
const embed: Embed = {
  title: 'Title',
  description: 'Description',
  url: 'https://example.com',
  color: '#5865F2', // Discord blurple
  
  fields: [
    { 
      name: 'Field Name', 
      value: 'Field Value', 
      inline: true 
    }
  ],
  
  footer: {
    text: 'Footer text',
    iconUrl: 'https://example.com/footer.png'
  },
  
  thumbnail: {
    url: 'https://example.com/thumb.png'
  },
  
  image: {
    url: 'https://example.com/image.png'
  },
  
  author: {
    name: 'Author Name',
    iconUrl: 'https://example.com/avatar.png',
    url: 'https://example.com'
  },
  
  timestamp: new Date()
};

await client.sendMessage(channelId, { embeds: [embed] });
```

## 🔧 Client Configuration

### Discord-Specific Configuration

```typescript
import { GatewayIntentBits } from 'discord.js';

const client = new UnifiedClient({
  platform: 'discord',
  config: {
    token: 'YOUR_TOKEN',
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  }
});
```

### Root-Specific Configuration

```typescript
const client = new UnifiedClient({
  platform: 'root',
  config: {
    token: 'YOUR_TOKEN',
    appId: 'YOUR_APP_ID' // if required
  }
});
```

## 🎯 Client Properties

```typescript
client.platformName     // 'discord' | 'root'
client.platformVersion  // string
client.isConnected      // boolean
```

## 🎭 Client Methods

```typescript
// Connection
await client.connect()
await client.disconnect()

// Messaging
await client.sendMessage(channelId, content)
await client.editMessage(messageId, channelId, newContent)
await client.deleteMessage(messageId, channelId)

// Resources
await client.getUser(userId)
await client.getChannel(channelId)
await client.getGuild(guildId)

// Utility
client.setLogLevel(LogLevel.DEBUG)
const provider = client.getProvider()
```

## ⚠️ Error Handling

### Using Try-Catch

```typescript
try {
  await client.sendMessage(channelId, 'Hello!');
} catch (error) {
  if (error instanceof MessageError) {
    console.error('Failed to send message');
  } else if (error instanceof ChannelError) {
    console.error('Invalid channel');
  }
}
```

### Error Event Listener

```typescript
client.on('error', (error: Error) => {
  console.error('Error:', error.message);
  
  if (error instanceof BridgeError) {
    // Handle bridge-specific errors
  }
});
```

### Available Error Classes

```typescript
import {
  BridgeError,
  UnsupportedPlatformError,
  UnsupportedFeatureError,
  AuthenticationError,
  ResourceNotFoundError,
  ChannelError,
  MessageError,
  PermissionError,
  RateLimitError,
  ConnectionError,
  ConfigurationError
} from 'Library@DR-Conversion';
```

## 🪵 Logging

### Setting Log Level

```typescript
import { LogLevel } from 'Library.DR-Conversion';

// In constructor
const client = new UnifiedClient({
  platform: 'discord',
  config: { token: 'TOKEN' },
  logLevel: LogLevel.DEBUG
});

// At runtime
client.setLogLevel(LogLevel.INFO);
```

### Log Levels

- `LogLevel.NONE` - No logging
- `LogLevel.ERROR` - Only errors
- `LogLevel.WARN` - Warnings and errors
- `LogLevel.INFO` - General information (default)
- `LogLevel.DEBUG` - Detailed debug information

## 🎪 Advanced Usage

### Accessing Platform-Specific Client

```typescript
import { DiscordProvider } from 'Library.DR-Conversion';

const provider = client.getProvider() as DiscordProvider;
const discordClient = provider.getClient();

// Now use discord.js specific features
discordClient.on('voiceStateUpdate', (oldState, newState) => {
  // Discord-specific event
});
```

### Environment-Based Platform Selection

```typescript
const client = new UnifiedClient({
  platform: process.env.PLATFORM as 'discord' | 'root',
  config: {
    token: process.env.BOT_TOKEN!
  }
});
```

## 🔍 Type Definitions

### Message

```typescript
interface Message {
  id: string;
  content: string;
  author: User;
  channel: Channel;
  timestamp: Date;
  platform: string;
  guild?: Guild;
  embeds?: Embed[];
  attachments?: Attachment[];
  mentionsEveryone?: boolean;
  mentions?: User[];
  
  reply(content: string | MessageOptions): Promise<Message>;
  delete(): Promise<void>;
  edit(content: string): Promise<Message>;
  react(emoji: string): Promise<void>;
}
```

### User

```typescript
interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bot: boolean;
  platform: string;
  discriminator?: string;
  isCurrentUser?: boolean;
}
```

### Channel

```typescript
interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  platform: string;
  topic?: string;
  nsfw?: boolean;
  parentId?: string;
}

type ChannelType = 'text' | 'voice' | 'dm' | 'group' | 'category' | 'announcement' | 'thread';
```

### Guild

```typescript
interface Guild {
  id: string;
  name: string;
  iconUrl?: string;
  memberCount?: number;
  platform: string;
  description?: string;
  ownerId?: string;
  features?: string[];
}
```

## 📋 Common Patterns

### Command Handler

```typescript
const PREFIX = '!';

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  
  switch (command) {
    case 'ping':
      await message.reply('Pong!');
      break;
    
    case 'help':
      await message.reply({
        embeds: [{
          title: 'Help',
          description: 'Available commands...'
        }]
      });
      break;
  }
});
```

### Graceful Shutdown

```typescript
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await client.disconnect();
  process.exit(0);
});
```

### Rate Limiting

```typescript
const cooldowns = new Map();

client.on('message', async (message) => {
  const userId = message.author.id;
  
  if (cooldowns.has(userId)) {
    await message.reply('Please wait before using this command again');
    return;
  }
  
  cooldowns.set(userId, Date.now());
  setTimeout(() => cooldowns.delete(userId), 5000);
  
  // Handle command
});
```

---

For more detailed documentation, see [README.md](README.md) and [IMPLEMENTATION.md](IMPLEMENTATION.md).

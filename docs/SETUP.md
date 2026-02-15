# Setup Guide

This guide explains how to use the Library.DR-Conversion setup wizard and CLI tools to install only the dependencies you need.

## 🎯 Interactive Setup Wizard

The easiest way to get started is using the interactive setup wizard:

```bash
npx library.dr-conversion setup
```

### What the wizard does:

1. **Presents platform options:**
   - Discord Bot (discord.js)
   - Root Bot - Server-side (@rootsdk/server-bot)
   - Root App - Client-side GUI (@rootsdk/client-app)
   - Multiple Platforms (choose which ones you need)

2. **Installs only what you selected:**
   - No unnecessary dependencies
   - Keeps your project lean
   - Faster installation and updates

3. **Provides next steps:**
   - Shows where to get bot tokens
   - Environment variable setup
   - Links to documentation

## 📦 Manual Installation

If you prefer manual installation:

```bash
# Install the core library (required)
npm install library.dr-conversion

# Then install ONLY the platform(s) you need:

# For Discord bots
npm install discord.js

# For Root Bots (server-side)
npm install @rootsdk/server-bot

# For Root Apps (client-side)
npm install @rootsdk/client-app
```

## 🚀 Project Initialization

Create a complete, ready-to-code project:

```bash
# Discord bot
npx library.dr-conversion init -p discord -n my-discord-bot

# Root bot (server-side)
npx library.dr-conversion init -p root -n my-root-bot

# Root app (client-side)
npx library.dr-conversion init -p root-app -n my-root-app
```

### What gets created:

```
my-bot/
├── src/
│   └── index.ts          # Your bot code with examples
├── package.json          # With correct dependencies
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variable template
├── .gitignore           # Git ignore file
└── README.md            # Project documentation
```

### After initialization:

```bash
cd my-bot
npm install
cp .env.example .env
# Edit .env with your bot token
npm run dev
```

## 🔑 Getting Bot Tokens

### Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Click "Reset Token" to get your bot token
5. Copy it to your `.env` file: `DISCORD_TOKEN=your_token_here`

### Root Bot Token

1. Configure your bot in the Root platform
2. Get your bot token from Root
3. Set environment variable: `ROOT_TOKEN=your_token_here`

### Root App

Root Apps run in the Root client browser and use the client's authentication:
- No token needed
- Authentication handled automatically by Root client

## 🎨 Platform-Specific Features

### Discord Bot

```typescript
import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'discord',
  config: {
    token: process.env.DISCORD_TOKEN!
  }
});

// Discord-specific: Get the underlying discord.js client
const discordClient = client.getProvider().getClient();
```

### Root Bot (Server-side)

```typescript
import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'root',
  config: {
    token: process.env.ROOT_TOKEN!
  }
});

client.on('ready', (data) => {
  console.log('Connected to community:', data.communityId);
});

// Root-specific: Send message with attachments
await client.sendMessage(channelId, {
  content: 'Check out this file!',
  files: [{ 
    data: buffer, 
    name: 'file.txt' 
  }]
});
```

### Root App (Client-side)

```typescript
import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'root-app',
  config: {
    // No token needed - uses Root client authentication
  }
});

// Root App runs in browser - can use client-side features
// Access to Root UI components, theme detection, etc.
```

## 🔄 Switching Platforms

One of the key benefits of Library.DR-Conversion is the ability to switch platforms with minimal code changes:

```typescript
// Environment-based platform selection
const platform = process.env.BOT_PLATFORM || 'discord';

const config = {
  discord: { token: process.env.DISCORD_TOKEN },
  root: { token: process.env.ROOT_TOKEN },
  'root-app': {} // No token needed
};

const client = new UnifiedClient({
  platform: platform,
  config: config[platform]
});

// Same bot logic works on all platforms!
client.on('message', async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

await client.connect();
```

## 🛠️ CLI Commands Reference

### setup
Interactive wizard for dependency installation
```bash
npx library.dr-conversion setup
```

### init
Create a new bot project
```bash
npx library.dr-conversion init -p <platform> -n <name>
```
- `-p, --platform`: Platform type (discord, root, root-app)
- `-n, --name`: Project name

### validate
Validate your bot configuration
```bash
npx library.dr-conversion validate
```

## 💡 Tips

1. **Start with the wizard**: Use `npx library.dr-conversion setup` for the easiest onboarding
2. **Only install what you need**: Don't install discord.js if you're only building for Root
3. **Use the init command**: Gets you a working project structure immediately
4. **Check examples**: The examples/ folder has working code for each platform
5. **Read the API docs**: API.md has detailed documentation for all features

## 🐛 Troubleshooting

### "Cannot find module 'discord.js'"
You need to install Discord.js: `npm install discord.js`

### "Cannot find module '@rootsdk/server-bot'"
You need to install Root SDK: `npm install @rootsdk/server-bot`

### "Discord provider requires Node.js environment"
You're trying to use Discord/Root Bot provider in a browser. Use `platform: 'root-app'` for browser environments.

### "Missing required config key: token"
Make sure your `.env` file is set up with the correct token for your platform.

## 📚 Next Steps

- Read [API.md](../API.md) for full API documentation
- Check [examples/](../examples/) for working code samples
- See [MIGRATION.md](MIGRATION.md) for upgrading from older versions
- Visit the [GitHub repository](https://github.com/Shad0wcrushers/Library.shadow-DR-Conversion) for updates

## 🤝 Contributing

Have ideas for improving the setup experience? [Open an issue](https://github.com/Shad0wcrushers/Library.shadow-DR-Conversion/issues) or submit a pull request!

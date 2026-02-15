/**
 * Root-Specific Bot Example
 * 
 * This example demonstrates using the UnifiedClient for the Root platform.
 * Note: Root provider is currently a stub. Complete the implementation
 * in src/providers/root/ for this example to work.
 * 
 * Usage:
 *   ROOT_TOKEN=your-token npm start
 */

import { UnifiedClient, Message, LogLevel } from '../src';

const token = process.env.ROOT_TOKEN;

if (!token) {
  console.error('Error: ROOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create Root client
const client = new UnifiedClient({
  platform: 'root',
  config: {
    token,
    // Add other Root-specific config here
  },
  logLevel: LogLevel.DEBUG
});

// Ready event
client.on('ready', () => {
  console.log(`✅ Root bot is ready!`);
  console.log(`Platform: ${client.platformName} v${client.platformVersion}`);
});

// Message handler
client.on('message', async (message: Message) => {
  if (message.author.bot) return;
  
  console.log(`[${message.channel.name}] ${message.author.username}: ${message.content}`);
  
  // Echo command
  if (message.content.startsWith('!echo ')) {
    const text = message.content.slice(6);
    await message.reply(text);
  }
  
  // Status command
  if (message.content === '!status') {
    await message.reply({
      embeds: [{
        title: '🤖 Bot Status',
        description: 'Bot is running on Root platform',
        color: '#ff6b6b',
        fields: [
          { name: 'Platform', value: 'Root', inline: true },
          { name: 'Uptime', value: `${Math.floor(process.uptime())}s`, inline: true }
        ],
        timestamp: new Date()
      }]
    });
  }
  
  // Channel info
  if (message.content === '!channelinfo') {
    try {
      const channel = await client.getChannel(message.channel.id);
      await message.reply(
        `**Channel Information**\n` +
        `Name: ${channel.name}\n` +
        `ID: ${channel.id}\n` +
        `Type: ${channel.type}`
      );
    } catch (error) {
      await message.reply('Failed to fetch channel information.');
    }
  }
});

// Error handling
client.on('error', (error: Error) => {
  console.error('❌ Error:', error.message);
  console.error('Note: Root provider is a stub implementation.');
  console.error('Complete the implementation in src/providers/root/ for full functionality.');
});

// Connect
console.log('⚠️  Warning: Root provider is a stub implementation.');
console.log('Complete src/providers/root/provider.ts for this to work with a real Root bot.');

client.connect().catch((error) => {
  console.error('❌ Failed to connect:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await client.disconnect();
  process.exit(0);
});

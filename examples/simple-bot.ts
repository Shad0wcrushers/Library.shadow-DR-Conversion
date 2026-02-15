/**
 * Simple Bot Example
 * 
 * This example demonstrates a basic bot that works across platforms
 * by switching the platform and token via environment variables.
 * 
 * Usage:
 *   PLATFORM=discord BOT_TOKEN=your-discord-token npm start
 *   PLATFORM=root BOT_TOKEN=your-root-token npm start
 */

import { UnifiedClient, Message, LogLevel } from '../src';

// Get platform and token from environment
const platform = (process.env.PLATFORM || 'discord') as 'discord' | 'root';
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('Error: BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create unified client
const client = new UnifiedClient({
  platform,
  config: {
    token
  },
  logLevel: LogLevel.INFO
});

// Ready event
client.on('ready', () => {
  console.log(`✅ Bot is ready on ${platform}!`);
});

// Message event
client.on('message', async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  console.log(`📩 ${message.author.username}: ${message.content}`);
  
  // Ping command
  if (message.content === '!ping') {
    await message.reply('🏓 Pong!');
  }
  
  // Info command
  if (message.content === '!info') {
    await message.reply(`Platform: ${message.platform}\nChannel: ${message.channel.name}`);
  }
  
  // Embed command
  if (message.content === '!embed') {
    await client.sendMessage(message.channel.id, {
      embeds: [{
        title: '🌉 Multi-Platform Bot',
        description: 'This message works on both Discord and Root!',
        color: '#00ff00',
        fields: [
          { name: 'Platform', value: message.platform, inline: true },
          { name: 'Author', value: message.author.username, inline: true }
        ],
        footer: {
          text: 'Powered by Library.DR-Conversion v0.1.0'
        },
        timestamp: new Date()
      }]
    });
  }
  
  // Help command
  if (message.content === '!help') {
    await message.reply(
      '**Available Commands:**\n' +
      '`!ping` - Test bot responsiveness\n' +
      '`!info` - Show platform information\n' +
      '`!embed` - Send a rich embed\n' +
      '`!help` - Show this help message'
    );
  }
});

// Error handling
client.on('error', (error: Error) => {
  console.error('❌ Error:', error.message);
});

// Connect to the platform
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

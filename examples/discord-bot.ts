/**
 * Discord-Specific Bot Example
 * 
 * This example demonstrates using the UnifiedClient specifically for Discord,
 * with Discord-specific features and optimizations.
 * 
 * Usage:
 *   DISCORD_TOKEN=your-token npm start
 */

import { UnifiedClient, Message, LogLevel } from '../src';
import { GatewayIntentBits } from 'discord.js';

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Error: DISCORD_TOKEN environment variable is required');
  process.exit(1);
}

// Create Discord client with specific intents
const client = new UnifiedClient({
  platform: 'discord',
  config: {
    token,
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  },
  logLevel: LogLevel.INFO
});

// Ready event with Discord-specific info
client.on('ready', () => {
  console.log(`✅ Discord bot is ready!`);
  console.log(`Platform: ${client.platformName} v${client.platformVersion}`);
});

// Message handler
client.on('message', async (message: Message) => {
  if (message.author.bot) return;
  
  // Server info command
  if (message.content === '!serverinfo' && message.guild) {
    try {
      const guild = await client.getGuild(message.guild.id);
      
      await client.sendMessage(message.channel.id, {
        embeds: [{
          title: `📊 ${guild.name} Server Info`,
          color: '#5865F2',
          fields: [
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Members', value: guild.memberCount?.toString() || 'Unknown', inline: true },
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true }
          ],
          thumbnail: guild.iconUrl ? { url: guild.iconUrl } : undefined,
          footer: { text: 'Discord Server Information' },
          timestamp: new Date()
        }]
      });
    } catch (error) {
      await message.reply('Failed to fetch server information.');
    }
  }
  
  // User info command
  if (message.content.startsWith('!userinfo')) {
    const userId = message.mentions?.[0]?.id || message.author.id;
    
    try {
      const user = await client.getUser(userId);
      
      await client.sendMessage(message.channel.id, {
        embeds: [{
          title: `👤 ${user.displayName}`,
          color: '#00ff00',
          thumbnail: user.avatarUrl ? { url: user.avatarUrl } : undefined,
          fields: [
            { name: 'Username', value: user.username, inline: true },
            { name: 'ID', value: user.id, inline: true },
            { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true }
          ]
        }]
      });
    } catch (error) {
      await message.reply('Failed to fetch user information.');
    }
  }
  
  // React command
  if (message.content === '!react') {
    await message.react('👍');
    await message.react('❤️');
    await message.react('🎉');
  }
  
  // Edit command
  if (message.content === '!edit') {
    const reply = await message.reply('Original message...');
    setTimeout(async () => {
      await reply.edit('Message edited! ✨');
    }, 2000);
  }
});

// Guild events
client.on('guildCreate', (guild) => {
  console.log(`➕ Joined new server: ${guild.name} (${guild.id})`);
});

client.on('guildDelete', (guild) => {
  console.log(`➖ Left server: ${guild.name} (${guild.id})`);
});

// Member events
client.on('guildMemberAdd', (member) => {
  console.log(`👋 New member: ${member.user.username}`);
});

// Error handling
client.on('error', (error: Error) => {
  console.error('❌ Error:', error);
});

// Connect
client.connect().catch((error) => {
  console.error('❌ Failed to connect:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await client.disconnect();
  process.exit(0);
});

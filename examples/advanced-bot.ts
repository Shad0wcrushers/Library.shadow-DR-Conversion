/**
 * Advanced Bot Example
 * 
 * This example demonstrates advanced features of the Library@DR-Conversion-v0.1.0:
 * - Custom error handling
 * - Multiple event listeners
 * - Rich embeds with all features
 * - Message editing and deletion
 * - Platform-specific logic
 */

import { UnifiedClient, Message, LogLevel, User, BridgeError } from '../src';

const platform = (process.env.PLATFORM || 'discord') as 'discord' | 'root';
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('Error: BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Command prefix
const PREFIX = '!';

// Store for tracking message statistics
const stats = {
  messagesReceived: 0,
  commandsExecuted: 0,
  startTime: Date.now()
};

// Create client
const client = new UnifiedClient({
  platform,
  config: { token },
  logLevel: LogLevel.DEBUG
});

// Ready event
client.on('ready', () => {
  console.log(`✅ Bot connected to ${platform}`);
  console.log(`📊 Monitoring messages...`);
});

// Message handler with command parsing
client.on('message', async (message: Message) => {
  // Ignore bots
  if (message.author.bot) return;
  
  stats.messagesReceived++;
  
  // Check if message is a command
  if (!message.content.startsWith(PREFIX)) return;
  
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  
  if (!command) return;
  
  stats.commandsExecuted++;
  
  try {
    await handleCommand(command, args, message);
  } catch (error) {
    console.error(`Error handling command ${command}:`, error);
    await message.reply(`❌ An error occurred: ${(error as Error).message}`);
  }
});

// Command handler
async function handleCommand(command: string, args: string[], message: Message): Promise<void> {
  switch (command) {
    case 'ping':
      await handlePing(message);
      break;
    
    case 'stats':
      await handleStats(message);
      break;
    
    case 'richcard':
      await handleRichCard(message);
      break;
    
    case 'quote':
      await handleQuote(args, message);
      break;
    
    case 'countdown':
      await handleCountdown(message);
      break;
    
    case 'about':
      await handleAbout(message);
      break;
    
    case 'help':
      await handleHelp(message);
      break;
    
    default:
      await message.reply(`Unknown command: ${command}. Try \`${PREFIX}help\``);
  }
}

// Ping command
async function handlePing(message: Message): Promise<void> {
  const start = Date.now();
  const reply = await message.reply('🏓 Pinging...');
  const latency = Date.now() - start;
  
  await reply.edit(`🏓 Pong! Latency: ${latency}ms`);
}

// Stats command
async function handleStats(message: Message): Promise<void> {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  await client.sendMessage(message.channel.id, {
    embeds: [{
      title: '📊 Bot Statistics',
      color: '#3498db',
      fields: [
        { name: 'Platform', value: client.platformName, inline: true },
        { name: 'Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: 'Messages Received', value: stats.messagesReceived.toString(), inline: true },
        { name: 'Commands Executed', value: stats.commandsExecuted.toString(), inline: true }
      ],
      timestamp: new Date()
    }]
  });
}

// Rich card command
async function handleRichCard(message: Message): Promise<void> {
  await client.sendMessage(message.channel.id, {
    embeds: [{
      title: '🎨 Rich Embed Example',
      description: 'This is a comprehensive example of all embed features!',
      url: 'https://github.com',
      color: '#9b59b6',
      author: {
        name: message.author.displayName,
        iconUrl: message.author.avatarUrl
      },
      fields: [
        { name: '📝 Inline Field 1', value: 'This is inline', inline: true },
        { name: '📝 Inline Field 2', value: 'Also inline', inline: true },
        { name: '📝 Inline Field 3', value: 'Still inline', inline: true },
        { name: '📄 Full Width Field', value: 'This field takes the full width' }
      ],
      thumbnail: {
        url: 'https://via.placeholder.com/150'
      },
      image: {
        url: 'https://via.placeholder.com/800x200'
      },
      footer: {
        text: `Requested by ${message.author.username}`,
        iconUrl: message.author.avatarUrl
      },
      timestamp: new Date()
    }]
  });
}

// Quote command
async function handleQuote(args: string[], message: Message): Promise<void> {
  const text = args.join(' ');
  
  if (!text) {
    await message.reply('❌ Please provide text to quote. Usage: `!quote <text>`');
    return;
  }
  
  await client.sendMessage(message.channel.id, {
    embeds: [{
      description: `> ${text}`,
      color: '#95a5a6',
      author: {
        name: message.author.displayName,
        iconUrl: message.author.avatarUrl
      },
      footer: {
        text: 'Quote'
      }
    }]
  });
}

// Countdown command
async function handleCountdown(message: Message): Promise<void> {
  const reply = await message.reply('⏰ Countdown: 5');
  
  for (let i = 4; i >= 1; i--) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await reply.edit(`⏰ Countdown: ${i}`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  await reply.edit('🎉 Time\'s up!');
}

// About command
async function handleAbout(message: Message): Promise<void> {
  await client.sendMessage(message.channel.id, {
    embeds: [{
      title: '🌉 Chat Platform Bridge',
      description: 'A unified interface for building multi-platform chat bots',
      color: '#2ecc71',
      fields: [
        { name: 'Current Platform', value: client.platformName, inline: true },
        { name: 'Version', value: client.platformVersion, inline: true },
        { name: 'Features', value: '✅ Cross-platform\n✅ Type-safe\n✅ Extensible' }
      ],
      footer: {
        text: 'github.com/Shadowcrushers/Library@DR-Conversion-v0.1.0'
      }
    }]
  });
}

// Help command
async function handleHelp(message: Message): Promise<void> {
  await client.sendMessage(message.channel.id, {
    embeds: [{
      title: '📚 Bot Commands',
      description: `All commands start with \`${PREFIX}\``,
      color: '#e74c3c',
      fields: [
        { name: `${PREFIX}ping`, value: 'Test bot latency' },
        { name: `${PREFIX}stats`, value: 'Show bot statistics' },
        { name: `${PREFIX}richcard`, value: 'Display a rich embed example' },
        { name: `${PREFIX}quote <text>`, value: 'Quote a message' },
        { name: `${PREFIX}countdown`, value: 'Start a countdown' },
        { name: `${PREFIX}about`, value: 'About this bot' },
        { name: `${PREFIX}help`, value: 'Show this help message' }
      ]
    }]
  });
}

// Additional event listeners
client.on('messageUpdate', (oldMessage, newMessage) => {
  if (newMessage.author.bot) return;
  console.log(`✏️  Message edited: ${oldMessage?.content || '[Old]'} → ${newMessage.content}`);
});

client.on('messageDelete', (message) => {
  if (message.author.bot) return;
  console.log(`🗑️  Message deleted: ${message.content}`);
});

client.on('error', (error: Error) => {
  console.error('❌ Error:', error);
  
  if (error instanceof BridgeError) {
    console.error('This is a bridge-specific error');
  }
});

// Connect
client.connect().catch((error) => {
  console.error('❌ Failed to connect:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  console.log(`📊 Final stats: ${stats.messagesReceived} messages, ${stats.commandsExecuted} commands`);
  await client.disconnect();
  process.exit(0);
});

#!/usr/bin/env node
/**
 * Interactive setup wizard for Library.DR-Conversion
 * Helps users install only the dependencies they need for their target platform
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const PLATFORMS = {
  '1': {
    name: 'Discord Bot',
    package: 'discord.js',
    platform: 'discord',
    description: 'Build a Discord bot using discord.js'
  },
  '2': {
    name: 'Root Bot (Server-side)',
    package: '@rootsdk/server-bot',
    platform: 'root',
    description: 'Build a Root bot that runs on servers'
  },
  '3': {
    name: 'Root App (Client-side)',
    package: '@rootsdk/client-app',
    platform: 'root-app',
    description: 'Build a Root app with GUI in the Root client'
  },
  '4': {
    name: 'Multiple Platforms',
    package: 'all',
    platform: 'multi',
    description: 'Install dependencies for multiple platforms'
  }
};

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Library.DR-Conversion Setup Wizard                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('This wizard will help you install only the dependencies');
  console.log('you need for your target platform(s).\n');
  
  // Show platform options
  console.log('Choose your target platform:\n');
  Object.entries(PLATFORMS).forEach(([key, info]) => {
    console.log(`  ${key}. ${info.name}`);
    console.log(`     ${info.description}\n`);
  });
  
  const choice = await question('Enter your choice (1-4): ');
  
  if (!PLATFORMS[choice]) {
    console.log('\n❌ Invalid choice. Exiting.');
    rl.close();
    return;
  }
  
  const selected = PLATFORMS[choice];
  console.log(`\n✓ Selected: ${selected.name}\n`);
  
  // Determine packages to install
  let packagesToInstall = [];
  
  if (selected.package === 'all') {
    console.log('Select which platforms to install (comma-separated):');
    console.log('  1. Discord (discord.js)');
    console.log('  2. Root Bot (@rootsdk/server-bot)');
    console.log('  3. Root App (@rootsdk/client-app)\n');
    
    const multiChoice = await question('Enter choices (e.g., 1,2): ');
    const choices = multiChoice.split(',').map(c => c.trim());
    
    if (choices.includes('1')) packagesToInstall.push('discord.js');
    if (choices.includes('2')) packagesToInstall.push('@rootsdk/server-bot');
    if (choices.includes('3')) packagesToInstall.push('@rootsdk/client-app');
  } else {
    packagesToInstall = [selected.package];
  }
  
  if (packagesToInstall.length === 0) {
    console.log('\n❌ No packages selected. Exiting.');
    rl.close();
    return;
  }
  
  // Confirm installation
  console.log('\nThe following packages will be installed:');
  packagesToInstall.forEach(pkg => console.log(`  - ${pkg}`));
  console.log('');
  
  const confirm = await question('Proceed with installation? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('\n❌ Installation cancelled.');
    rl.close();
    return;
  }
  
  // Install packages
  console.log('\n📦 Installing packages...\n');
  
  try {
    const installCmd = `npm install ${packagesToInstall.join(' ')}`;
    console.log(`Running: ${installCmd}\n`);
    execSync(installCmd, { stdio: 'inherit' });
    
    console.log('\n✅ Packages installed successfully!\n');
  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    rl.close();
    return;
  }
  
  // Offer to create example file
  const createExample = await question('Would you like to create an example bot file? (y/n): ');
  
  if (createExample.toLowerCase() === 'y' || createExample.toLowerCase() === 'yes') {
    const filename = await question('Enter filename (e.g., bot.js): ');
    const filepath = path.join(process.cwd(), filename || 'bot.js');
    
    const exampleCode = generateExampleCode(selected.platform, packagesToInstall);
    
    try {
      fs.writeFileSync(filepath, exampleCode);
      console.log(`\n✅ Created example file: ${filename || 'bot.js'}\n`);
    } catch (error) {
      console.error(`\n❌ Failed to create example file: ${error.message}\n`);
    }
  }
  
  // Show next steps
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Setup Complete!                                      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('Next steps:\n');
  console.log('  1. Set up your bot token in environment variables or config');
  console.log('  2. Review the documentation: https://github.com/yourusername/library.dr-conversion');
  console.log('  3. Start building your bot!\n');
  
  if (packagesToInstall.includes('discord.js')) {
    console.log('Discord Bot Setup:');
    console.log('  - Get your bot token from: https://discord.com/developers/applications');
    console.log('  - Set environment variable: DISCORD_TOKEN=your_token_here\n');
  }
  
  if (packagesToInstall.includes('@rootsdk/server-bot')) {
    console.log('Root Bot Setup:');
    console.log('  - Configure your Root bot in the Root platform');
    console.log('  - Set environment variable: ROOT_TOKEN=your_token_here\n');
  }
  
  if (packagesToInstall.includes('@rootsdk/client-app')) {
    console.log('Root App Setup:');
    console.log('  - Root Apps run in the Root client (browser environment)');
    console.log('  - No token needed - uses Root client authentication\n');
  }
  
  rl.close();
}

function generateExampleCode(platform, packages) {
  const imports = [];
  
  if (platform === 'discord' || packages.includes('discord.js')) {
    return `const { UnifiedClient } = require('library.dr-conversion');

// Discord Bot Example
const client = new UnifiedClient({
  platform: 'discord',
  config: {
    token: process.env.DISCORD_TOKEN || 'your-bot-token-here'
  }
});

client.on('ready', () => {
  console.log('Discord bot is ready!');
});

client.on('message', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Respond to !ping command
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
  
  // Respond to !hello command
  if (message.content === '!hello') {
    await message.reply(\`Hello, \${message.author.username}!\`);
  }
});

// Connect to Discord
client.connect().catch(console.error);
`;
  }
  
  if (platform === 'root' || packages.includes('@rootsdk/server-bot')) {
    return `const { UnifiedClient } = require('library.dr-conversion');

// Root Bot Example
const client = new UnifiedClient({
  platform: 'root',
  config: {
    token: process.env.ROOT_TOKEN || 'your-bot-token-here'
  }
});

client.on('ready', (data) => {
  console.log('Root bot is ready!');
  console.log('Connected to community:', data.communityId);
});

client.on('message', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Respond to !ping command
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
  
  // Respond to !hello command
  if (message.content === '!hello') {
    await message.reply(\`Hello, \${message.author.username}!\`);
  }
});

// Connect to Root
client.connect().catch(console.error);
`;
  }
  
  if (platform === 'root-app' || packages.includes('@rootsdk/client-app')) {
    return `const { UnifiedClient } = require('library.dr-conversion');

// Root App Example (runs in Root client browser)
const client = new UnifiedClient({
  platform: 'root-app',
  config: {
    // Root Apps use the Root client's authentication
    // No token needed
  }
});

client.on('ready', () => {
  console.log('Root app is ready!');
});

client.on('message', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Respond to !ping command
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
  
  // Add your app logic here
  // Root Apps can use GUI components and client-side features
});

// Connect to Root (browser environment)
client.connect().catch(console.error);
`;
  }
  
  return `const { UnifiedClient } = require('library.dr-conversion');

// Multi-platform Bot Example
const platform = process.env.BOT_PLATFORM || 'discord'; // or 'root' or 'root-app'

const config = {
  discord: {
    token: process.env.DISCORD_TOKEN
  },
  root: {
    token: process.env.ROOT_TOKEN
  },
  'root-app': {
    // No token needed for Root Apps
  }
};

const client = new UnifiedClient({
  platform: platform,
  config: config[platform]
});

client.on('ready', () => {
  console.log(\`Bot is ready on \${platform}!\`);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.connect().catch(console.error);
`;
}

// Run the setup wizard
main().catch(console.error);

#!/usr/bin/env node

/**
 * CLI tool for Library.DR-Conversion
 * Provides utilities for bot development
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

program
  .name('library.dr-conversion')
  .description('CLI tools for Library.DR-Conversion v0.2.8')
  .version('0.2.8');

program
  .command('init')
  .description('Initialize a new bot project')
  .option('-p, --platform <type>', 'Platform (discord, root, root-app)', 'discord')
  .option('-n, --name <name>', 'Project name', 'my-bot')
  .action((options) => {
    console.log(`🚀 Initializing ${options.name} for ${options.platform}...`);
    
    const projectDir = path.join(process.cwd(), options.name);
    
    if (fs.existsSync(projectDir)) {
      console.error(`❌ Directory ${options.name} already exists`);
      process.exit(1);
    }
    
    fs.mkdirSync(projectDir, { recursive: true });
    
    // Create package.json
    const packageJson = {
      name: options.name,
      version: '1.0.0',
      description: `A ${options.platform} bot`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'ts-node src/index.ts',
      },
      dependencies: {
        'library.dr-conversion': '^0.2.8',
      },
      devDependencies: {
        typescript: '^5.3.0',
        'ts-node': '^10.9.0',
        '@types/node': '^20.0.0',
      },
    };
    
    if (options.platform === 'discord') {
      packageJson.dependencies['discord.js'] = '^14.14.1';
    } else if (options.platform === 'root') {
      packageJson.dependencies['@rootsdk/server-bot'] = '^0.17.0';
    } else if (options.platform === 'root-app') {
      packageJson.dependencies['@rootsdk/client-app'] = '^0.17.0';
    }
    
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    };
    
    fs.writeFileSync(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
    
    // Create .env.example
    let envExample = '';
    if (options.platform === 'discord') {
      envExample = 'DISCORD_TOKEN=your-bot-token-here\n';
    } else if (options.platform === 'root') {
      envExample = 'ROOT_TOKEN=your-bot-token-here\n';
    } else if (options.platform === 'root-app') {
      envExample = '# Root Apps use Root client authentication - no token needed\n';
    }
    
    fs.writeFileSync(path.join(projectDir, '.env.example'), envExample);
    
    // Create .gitignore
    const gitignore = `node_modules/
dist/
.env
*.log
`;
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
    
    // Create src directory
    fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
    
    // Create main bot file based on platform
    let botCode = '';
    
    if (options.platform === 'discord') {
      botCode = `import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'discord',
  config: {
    token: process.env.DISCORD_TOKEN!
  }
});

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.connect();
`;
    } else if (options.platform === 'root') {
      botCode = `import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'root',
  config: {
    token: process.env.ROOT_TOKEN!
  }
});

client.on('ready', (data) => {
  console.log('Bot is ready!');
  console.log('Connected to community:', data.communityId);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.connect();
`;
    } else if (options.platform === 'root-app') {
      botCode = `import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'root-app',
  config: {
    // Root Apps use Root client authentication
  }
});

client.on('ready', () => {
  console.log('Root App is ready!');
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong from Root App!');
  }
  
  // Add your app logic here
  // Root Apps can use GUI components and client-side features
});

client.connect();
`;
    }
    
    fs.writeFileSync(path.join(projectDir, 'src', 'index.ts'), botCode);
    
    console.log(`✅ Created ${options.name}`);
    console.log(`\n📝 Next steps:`);
    console.log(`  cd ${options.name}`);
    console.log(`  npm install`);
    console.log(`  cp .env.example .env`);
    console.log(`  # Edit .env with your bot token`);
    console.log(`  npm run dev`);
  });

program
  .command('validate')
  .description('Validate bot configuration')
  .action(() => {
    console.log('🔍 Validating configuration...');
    
    if (!fs.existsSync('package.json')) {
      console.error('❌ package.json not found');
      process.exit(1);
    }
    
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!pkg.dependencies || !pkg.dependencies['library.dr-conversion']) {
      console.error('❌ library.dr-conversion not found in dependencies');
      process.exit(1);
    }
    
    if (!fs.existsSync('.env') && !process.env.BOT_TOKEN) {
      console.warn('⚠️  No .env file or BOT_TOKEN environment variable found');
    }
    
    console.log('✅ Configuration is valid');
  });

program
  .command('setup')
  .description('Interactive setup wizard to install only the dependencies you need')
  .action(async () => {
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
      execSync(installCmd, { stdio: 'inherit', cwd: process.cwd() });
      
      console.log('\n✅ Packages installed successfully!\n');
    } catch (error) {
      console.error('\n❌ Installation failed:', error.message);
      rl.close();
      return;
    }
    
    // Show next steps
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Setup Complete!                                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('Next steps:\n');
    
    if (packagesToInstall.includes('discord.js')) {
      console.log('Discord Bot Setup:');
      console.log('  - Get your bot token from: https://discord.com/developers/applications');
      console.log('  - Set environment variable: DISCORD_TOKEN=your_token_here');
      console.log('  - Use: npx library.dr-conversion init -p discord -n my-discord-bot\n');
    }
    
    if (packagesToInstall.includes('@rootsdk/server-bot')) {
      console.log('Root Bot Setup:');
      console.log('  - Configure your Root bot in the Root platform');
      console.log('  - Set environment variable: ROOT_TOKEN=your_token_here');
      console.log('  - Use: npx library.dr-conversion init -p root -n my-root-bot\n');
    }
    
    if (packagesToInstall.includes('@rootsdk/client-app')) {
      console.log('Root App Setup:');
      console.log('  - Root Apps run in the Root client (browser environment)');
      console.log('  - No token needed - uses Root client authentication');
      console.log('  - Use: npx library.dr-conversion init -p root-app -n my-root-app\n');
    }
    
    console.log('Documentation: https://github.com/Shad0wcrushers/Library.shadow-DR-Conversion\n');
    
    rl.close();
  });

program.parse();

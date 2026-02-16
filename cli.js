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
const crypto = require('crypto');

// Generate a UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// Detect platform from package.json dependencies
function detectPlatform() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return null;
    }
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    };
    
    // Check for Root platforms
    if (allDeps['@rootsdk/server-bot']) {
      return 'root';
    }
    if (allDeps['@rootsdk/client-app']) {
      return 'root-app';
    }
    if (allDeps['discord.js']) {
      return 'discord';
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Validate a root manifest object against minimal Root requirements
function validateManifestObject(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') {
    errors.push('Manifest must be a JSON object');
    return { valid: false, errors };
  }

  if (!manifest.id || typeof manifest.id !== 'string') {
    errors.push('Missing or invalid "id" (string)');
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push('Missing or invalid "version" (string)');
  }

  if (!manifest.package || typeof manifest.package !== 'object') {
    errors.push('Missing "package" object');
  } else {
    if (manifest.package.server) {
      const server = manifest.package.server;
      if (!server.launch || typeof server.launch !== 'string') {
        errors.push('package.server.launch is required and must be a string');
      }
      if (!Array.isArray(server.deploy) || server.deploy.length === 0) {
        errors.push('package.server.deploy must be a non-empty array');
      }
      if (!Array.isArray(server.node_modules) || server.node_modules.length === 0) {
        errors.push('package.server.node_modules must be a non-empty array');
      }
    }

    if (manifest.package.client) {
      const client = manifest.package.client;
      // accept either entry or deploy
      if (!client.entry && (!Array.isArray(client.deploy) || client.deploy.length === 0)) {
        errors.push('package.client.entry or package.client.deploy is required');
      }
      if (client.assets && !Array.isArray(client.assets)) {
        errors.push('package.client.assets must be an array if provided');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

program
  .name('library.dr-conversion')
  .description('CLI tools for Library.DR-Conversion v0.2.9')
  .version('0.2.9');

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
    
    // Create root-manifest.json for Root Bots
    if (options.platform === 'root') {
      const manifest = {
        id: generateUUID(),
        version: '1.0.0',
        package: {
          server: {
            launch: 'dist/index.js',
            deploy: ['dist'],
            node_modules: ['node_modules']
          }
        },
        settings: {
          groups: []
        },
        permissions: {
          community: {},
          channel: {
            CreateMessage: true,
            ReadMessage: true
          }
        }
      };
      
      fs.writeFileSync(
        path.join(projectDir, 'root-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      // Create README explaining manifest
      const manifestReadme = `# Root Bot Manifest

Your bot's root-manifest.json defines how it integrates with Root.

## Important:
- The 'id' field is unique to your bot - don't change it after publishing
- Update 'version' following semantic versioning when you make changes
- Add permissions your bot needs to 'permissions.community' or 'permissions.channel'
- See docs/ROOT_BOT_MANIFEST.md for full documentation

## Publishing:
\`\`\`bash
npm run build
npx @rootsdk/cli publish
\`\`\`
`;
      fs.writeFileSync(path.join(projectDir, 'MANIFEST.md'), manifestReadme);
    }
    
    // Create root-app-manifest.json for Root Apps (client-side)
    if (options.platform === 'root-app') {
      const appManifest = {
        id: generateUUID(),
        version: '1.0.0',
        name: options.name,
        description: `${options.name} - Root App`,
        author: '',
        homepage: '',
        package: {
          client: {
            entry: 'dist/index.html',
            assets: ['dist'],
            node_modules: ['node_modules']
          }
        },
        settings: {
          ui: []
        },
        permissions: {
          channel: {
            CreateMessage: true,
            ReadMessage: true
          }
        }
      };

      fs.writeFileSync(
        path.join(projectDir, 'root-manifest.json'),
        JSON.stringify(appManifest, null, 2)
      );

      const appManifestReadme = `# Root App Manifest

This project includes a generated root-manifest.json to help document your app.

This manifest follows the Root App manifest overview and provides the basic fields used by the Root platform:
- 'id': Unique UUID for the app
- 'version': Semver version
- 'package.client.entry': The client entry HTML for the app
- 'package.client.assets': Client assets to include in the upload
- 'permissions': Channel-level permissions used by the app

Notes:
- Update 'version' following semantic versioning when you make changes.
- Review permissions and remove any that aren't needed.
- Configure UI settings in the 'settings.ui' array (see Root docs for details):
  https://docs.rootapp.com/docs/app-docs/configure/manifest-overview/

Deployment:
Build your app and follow the Root platform instructions to upload or register it.
`;

      fs.writeFileSync(path.join(projectDir, 'MANIFEST.md'), appManifestReadme);
    }
    
    console.log(`✅ Created ${options.name}`);
    console.log(`\n📝 Next steps:`);
    console.log(`  cd ${options.name}`);
    console.log(`  npm install`);
    
    if (options.platform === 'root') {
      console.log(`  cp .env.example .env`);
      console.log(`  # Edit .env with your bot token`);
      console.log(`  # Edit root-manifest.json - change the 'id' to a unique value`);
      console.log(`  # See MANIFEST.md for manifest documentation`);
    } else if (options.platform === 'discord') {
      console.log(`  cp .env.example .env`);
      console.log(`  # Edit .env with your bot token`);
    } else if (options.platform === 'root-app') {
      console.log(`  # Root Apps run in the Root client - no token needed`);
      console.log(`  # Configure your app in the Root platform`);
    }
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
  .command('validate-manifest')
  .description('Validate root-manifest.json in the current folder')
  .option('-f, --file <path>', 'Manifest file path', 'root-manifest.json')
  .action((options) => {
    const file = options.file || 'root-manifest.json';
    if (!fs.existsSync(file)) {
      console.error(`❌ Manifest not found: ${file}`);
      process.exit(1);
    }

    let raw;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch (err) {
      console.error('❌ Failed to read manifest:', err.message);
      process.exit(1);
    }

    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch (err) {
      console.error('❌ Manifest is not valid JSON:', err.message);
      process.exit(1);
    }

    const result = validateManifestObject(manifest);
    if (!result.valid) {
      console.error('❌ Manifest validation failed:');
      for (const e of result.errors) console.error(' -', e);
      process.exit(1);
    }

    console.log('✅ Manifest is valid');
  });

program
  .command('generate-manifest')
  .description('Generate a manifest file for Root Bots or Root Apps (auto-detects platform)')
  .option('-i, --interactive', 'Interactive mode with prompts')
  .option('-p, --platform <type>', 'Platform type (root, root-app) - auto-detected if not specified')
  .action(async (options) => {
    // Auto-detect platform if not specified
    const platform = options.platform || detectPlatform();
    
    if (!platform || (platform !== 'root' && platform !== 'root-app')) {
      console.error('❌ Could not detect Root platform.');
      console.error('   Make sure you have @rootsdk/server-bot or @rootsdk/client-app installed,');
      console.error('   or specify the platform: --platform root or --platform root-app');
      process.exit(1);
    }
    
    const isRootBot = platform === 'root';
    const manifestFile = 'root-manifest.json';
    
    console.log(`\n🔍 Detected platform: ${isRootBot ? 'Root Bot (server-side)' : 'Root App (client-side)'}`);
    
    // Check if manifest already exists
    if (fs.existsSync(manifestFile)) {
      console.log(`⚠️  ${manifestFile} already exists in this directory.`);
      if (!options.interactive) {
        console.log('Use --interactive to configure a new one anyway.');
        return;
      }
    }
    
    let manifest;
    
    if (isRootBot) {
      // Root Bot manifest (server-side)
      manifest = {
        id: generateUUID(),
        version: '1.0.0',
        package: {
          server: {
            launch: 'dist/index.js',
            deploy: ['dist'],
            node_modules: ['node_modules']
          }
        },
        settings: {
          groups: []
        },
        permissions: {
          community: {},
          channel: {}
        }
      };
    } else {
      // Root App manifest (client-side)
      manifest = {
        id: generateUUID(),
        version: '1.0.0',
        name: '',
        description: '',
        author: '',
        homepage: '',
        package: {
          client: {
            entry: 'dist/index.html',
            assets: ['dist'],
            node_modules: ['node_modules']
          }
        },
        settings: {
          ui: []
        },
        permissions: {
          channel: {}
        }
      };
    }
    
    if (options.interactive) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      function question(prompt) {
        return new Promise((resolve) => {
          rl.question(prompt, resolve);
        });
      }
      
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log(`║   Root ${isRootBot ? 'Bot' : 'App'} Manifest Generator${' '.repeat(isRootBot ? 25 : 24)}║`);
      console.log('╚════════════════════════════════════════════════════════╝\n');
      
      // Version
      const version = await question('Version (default: 1.0.0): ');
      if (version.trim()) manifest.version = version.trim();
      
      if (isRootBot) {
        // Root Bot specific fields
        // Launch file
        const launch = await question('Launch file (default: dist/index.js): ');
        if (launch.trim()) manifest.package.server.launch = launch.trim();
        
        // Permissions
        console.log('\n📋 Bot Permissions:\n');
        console.log('Community permissions:');
      } else {
        // Root App specific fields
        const name = await question('App name: ');
        if (name.trim()) manifest.name = name.trim();
        
        const description = await question('App description: ');
        if (description.trim()) manifest.description = description.trim();
        
        const author = await question('Author: ');
        if (author.trim()) manifest.author = author.trim();
        
        const homepage = await question('Homepage URL (optional): ');
        if (homepage.trim()) manifest.homepage = homepage.trim();
        
        console.log('\n📋 App Permissions:\n');
        console.log('Channel permissions (Root Apps run in browser):');
      }
      
      if (isRootBot) {
        // Community permissions only for Root Bots
        console.log('Community permissions:');
      const manageRoles = await question('  Need to manage roles? (y/n): ');
      if (manageRoles.toLowerCase() === 'y') {
        manifest.permissions.community.ManageRoles = true;
      }
      
      const manageCommunity = await question('  Need to manage community settings? (y/n): ');
      if (manageCommunity.toLowerCase() === 'y') {
        manifest.permissions.community.ManageCommunity = true;
      }
      
      const manageChannels = await question('  Need to manage channels? (y/n): ');
      if (manageChannels.toLowerCase() === 'y') {
        manifest.permissions.community.ManageChannels = true;
      }
      
        console.log('\nChannel permissions:');
      }
      
      // Channel permissions (both Root Bot and Root App)
      const createMsg = await question('  Need to send messages? (y/n): ');
      if (createMsg.toLowerCase() === 'y') {
        manifest.permissions.channel.CreateMessage = true;
      }
      
      const readMsg = await question('  Need to read messages? (y/n): ');
      if (readMsg.toLowerCase() === 'y') {
        manifest.permissions.channel.ReadMessage = true;
      }
      
      const deleteMsg = await question('  Need to delete messages? (y/n): ');
      if (deleteMsg.toLowerCase() === 'y') {
        manifest.permissions.channel.DeleteMessage = true;
      }
      
      const managePins = await question('  Need to manage pins? (y/n): ');
      if (managePins.toLowerCase() === 'y') {
        manifest.permissions.channel.ManagePins = true;
      }
      
      rl.close();
    }
    
    // Write manifest file
    fs.writeFileSync(
      manifestFile,
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`\n✅ Generated ${manifestFile} successfully!\n`);
    console.log('📋 Manifest Details:');
    console.log(`   Platform: ${isRootBot ? 'Root Bot (server-side)' : 'Root App (client-side)'}`);
    console.log(`   ID: ${manifest.id}`);
    console.log(`   Version: ${manifest.version}`);
    if (isRootBot) {
      console.log(`   Launch: ${manifest.package.server.launch}`);
    } else {
      console.log(`   Name: ${manifest.name || '(not set)'}`);
    }
    console.log('');
    console.log('⚠️  Important:');
    console.log('   - The ID is unique to your ' + (isRootBot ? 'bot' : 'app') + ' - never change it after publishing');
    console.log('   - Update version when you make changes (follow semver)');
    if (isRootBot) {
      console.log('   - See docs/ROOT_APP_MANIFEST.md for full documentation');
    }
    console.log('');
    console.log('📝 Next steps:');
    console.log(`   1. Review and customize ${manifestFile}`);
    if (isRootBot) {
      console.log('   2. Build your bot: npm run build');
      console.log('   3. Publish: npx @rootsdk/cli publish');
    } else {
      console.log('   2. Build your app: npm run build');
      console.log('   3. Deploy through Root platform interface');
    }
    console.log('');
  });

program
  .command('publish')
  .description('Validate and publish the current root-manifest.json using @rootsdk/cli')
  .option('-f, --file <path>', 'Manifest file to publish', 'root-manifest.json')
  .option('--no-validate', 'Skip manifest validation step')
  .action((options) => {
    const file = options.file || 'root-manifest.json';
    if (!fs.existsSync(file)) {
      console.error(`❌ Manifest not found: ${file}`);
      process.exit(1);
    }

    if (options.validate !== false) {
      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (err) {
        console.error('❌ Failed to parse manifest:', err.message);
        process.exit(1);
      }

      const result = validateManifestObject(manifest);
      if (!result.valid) {
        console.error('❌ Manifest validation failed:');
        for (const e of result.errors) console.error(' -', e);
        process.exit(1);
      }
      console.log('✅ Manifest validation passed');
    }

    try {
      console.log('🔁 Running publish via @rootsdk/cli...');
      execSync('npx @rootsdk/cli publish', { stdio: 'inherit' });
    } catch (err) {
      console.error('❌ Publish failed:', err.message);
      process.exit(1);
    }
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

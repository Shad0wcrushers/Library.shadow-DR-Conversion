#!/usr/bin/env node
/**
 * CLI tool for Library.DR-Conversion (TypeScript source in src/)
 * Converted from cli.ts at project root to src/ for compilation.
 */

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as readline from 'readline';
import * as crypto from 'crypto';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/ban-ts-comment, no-inner-declarations */

// Generate a UUID v4
function generateUUID(): string {
  // crypto.randomUUID is available in Node >= 14.17
  return crypto.randomUUID();
}

// Detect platform from package.json dependencies
function detectPlatform(): string | null {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return null;
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
      ...(pkg.peerDependencies || {})
    } as Record<string, any>;

    if (allDeps['@rootsdk/server-bot']) return 'root';
    if (allDeps['@rootsdk/client-app']) return 'root-app';
    if (allDeps['discord.js']) return 'discord';
    return null;
  } catch (error) {
    return null;
  }
}

// Validate a root manifest object against minimal Root requirements
function validateManifestObject(manifest: any) {
  const errors: string[] = [];
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
  .description('CLI tools for Library.DR-Conversion')
  .version('0.3.1');

program
  .command('init')
  .description('Initialize a new bot project')
  .option('-p, --platform <type>', 'Platform (discord, root, root-app)', 'discord')
  .option('-n, --name <name>', 'Project name', 'my-bot')
  .action((options: any) => {
    console.log(`🚀 Initializing ${options.name} for ${options.platform}...`);

    const projectDir = path.join(process.cwd(), options.name);

    if (fs.existsSync(projectDir)) {
      console.error(`❌ Directory ${options.name} already exists`);
      process.exit(1);
    }

    fs.mkdirSync(projectDir, { recursive: true });

    const packageJson: any = {
      name: options.name,
      version: '1.0.0',
      description: `A ${options.platform} bot`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'ts-node src/index.ts'
      },
      dependencies: {
        'library.dr-conversion': '^0.3.1'
      },
      devDependencies: {
        typescript: '^5.3.0',
        'ts-node': '^10.9.0',
        '@types/node': '^20.0.0'
      }
    };

    if (options.platform === 'discord') {
      packageJson.dependencies['discord.js'] = '^14.14.1';
    } else if (options.platform === 'root') {
      packageJson.dependencies['@rootsdk/server-bot'] = '^0.17.0';
    } else if (options.platform === 'root-app') {
      packageJson.dependencies['@rootsdk/client-app'] = '^0.17.0';
    }

    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      }
    };

    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

    let envExample = '';
    if (options.platform === 'discord') {
      envExample = 'DISCORD_TOKEN=your-bot-token-here\n';
    } else if (options.platform === 'root') {
      envExample = 'ROOT_TOKEN=your-bot-token-here\n';
    } else if (options.platform === 'root-app') {
      envExample = '# Root Apps use Root client authentication - no token needed\n';
    }

    fs.writeFileSync(path.join(projectDir, '.env.example'), envExample);

    const gitignore = `node_modules/\ndist/\n.env\n*.log\n`;
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);

    fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

    let botCode = '';

    if (options.platform === 'discord') {
      botCode = `import { UnifiedClient } from 'library.dr-conversion';\n\nconst client = new UnifiedClient({\n  platform: 'discord',\n  config: {\n    token: process.env.DISCORD_TOKEN!\n  }\n});\n\nclient.on('ready', () => {\n  console.log('Bot is ready!');\n});\n\nclient.on('message', async (message) => {\n  if (message.author.bot) return;\n  \n  if (message.content === '!ping') {\n    await message.reply('Pong!');\n  }\n});\n\nclient.connect();\n`;
    } else if (options.platform === 'root') {
      botCode = `import { UnifiedClient } from 'library.dr-conversion';\n\nconst client = new UnifiedClient({\n  platform: 'root',\n  config: {\n    token: process.env.ROOT_TOKEN!\n  }\n});\n\nclient.on('ready', (data) => {\n  console.log('Bot is ready!');\n  console.log('Connected to community:', data.communityId);\n});\n\nclient.on('message', async (message) => {\n  if (message.author.bot) return;\n  \n  if (message.content === '!ping') {\n    await message.reply('Pong!');\n  }\n});\n\nclient.connect();\n`;
    } else if (options.platform === 'root-app') {
      botCode = `import { UnifiedClient } from 'library.dr-conversion';\n\nconst client = new UnifiedClient({\n  platform: 'root-app',\n  config: {\n    // Root Apps use Root client authentication\n  }\n});\n\nclient.on('ready', () => {\n  console.log('Root App is ready!');\n});\n\nclient.on('message', async (message) => {\n  if (message.author.bot) return;\n  \n  if (message.content === '!ping') {\n    await message.reply('Pong from Root App!');\n  }\n});\n\nclient.connect();\n`;
    }

    fs.writeFileSync(path.join(projectDir, 'src', 'index.ts'), botCode);

    if (options.platform === 'root') {
      const manifest = {
        id: generateUUID(),
        version: '1.0.0',
        package: {
          server: { launch: 'dist/index.js', deploy: ['dist'], node_modules: ['node_modules'] }
        },
        settings: { groups: [] },
        permissions: { community: {}, channel: { CreateMessage: true, ReadMessage: true } }
      } as any;

      fs.writeFileSync(path.join(projectDir, 'root-manifest.json'), JSON.stringify(manifest, null, 2));

      const manifestReadme = `# Root Bot Manifest\n\nYour bot's root-manifest.json defines how it integrates with Root.\n`;
      fs.writeFileSync(path.join(projectDir, 'MANIFEST.md'), manifestReadme);
    }

    if (options.platform === 'root-app') {
      const appManifest = {
        id: generateUUID(),
        version: '1.0.0',
        name: options.name,
        description: `${options.name} - Root App`,
        author: '',
        homepage: '',
        package: { client: { entry: 'dist/index.html', assets: ['dist'], node_modules: ['node_modules'] } },
        settings: { ui: [] },
        permissions: { channel: { CreateMessage: true, ReadMessage: true } }
      } as any;

      fs.writeFileSync(path.join(projectDir, 'root-manifest.json'), JSON.stringify(appManifest, null, 2));

      const appManifestReadme = `# Root App Manifest\n\nThis project includes a generated root-manifest.json to help document your app.\n`;
      fs.writeFileSync(path.join(projectDir, 'MANIFEST.md'), appManifestReadme);
    }

    console.log(`✅ Created ${options.name}`);
    console.log(`\n📝 Next steps:`);
    console.log(`  cd ${options.name}`);
    console.log(`  npm install`);
    if (options.platform === 'root') {
      console.log(`  cp .env.example .env`);
      console.log(`  # Edit .env with your bot token`);
      console.log(`  # Edit root-manifest.json to review settings`);
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

    if (!fs.existsSync('.env') && !process.env['BOT_TOKEN']) {
      console.warn('⚠️  No .env file or BOT_TOKEN environment variable found');
    }

    console.log('✅ Configuration is valid');
  });

program
  .command('validate-manifest')
  .description('Validate root-manifest.json in the current folder')
  .option('-f, --file <path>', 'Manifest file path', 'root-manifest.json')
  .action((options: any) => {
    const file = options.file || 'root-manifest.json';
    if (!fs.existsSync(file)) {
      console.error(`❌ Manifest not found: ${file}`);
      process.exit(1);
    }

    let raw: string;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch (err: any) {
      console.error('❌ Failed to read manifest:', err.message);
      process.exit(1);
    }

    let manifest: any;
    try {
      manifest = JSON.parse(raw);
    } catch (err: any) {
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
  .action(async (options: any) => {
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

    if (fs.existsSync(manifestFile)) {
      console.log(`⚠️  ${manifestFile} already exists — it will be overwritten.`);
      if (options.interactive) {
        console.log('Interactive mode will update fields and overwrite the manifest.');
      }
    }

    let manifest: any;
    if (isRootBot) {
      manifest = {
        id: generateUUID(),
        version: '1.0.0',
        package: { server: { launch: 'dist/index.js', deploy: ['dist'], node_modules: ['node_modules'] } },
        settings: { groups: [] },
        permissions: { community: {}, channel: {} }
      };
    } else {
      manifest = {
        id: generateUUID(),
        version: '1.0.0',
        package: { client: { entry: 'dist/index.html', assets: ['dist'], node_modules: ['node_modules'] } },
        name: '',
        description: '',
        author: '',
        homepage: '',
        settings: { ui: [] },
        permissions: { channel: {} }
      };
    }

    if (options.interactive) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const question = (prompt: string) => new Promise<string>((resolve) => { rl.question(prompt, resolve); });

      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log(`║   Root ${isRootBot ? 'Bot' : 'App'} Manifest Generator${' '.repeat(isRootBot ? 25 : 24)}║`);
      console.log('╚════════════════════════════════════════════════════════╝\n');

      const version = await question('Version (default: 1.0.0): ');
      if (version.trim()) manifest.version = version.trim();

      if (isRootBot) {
        const launch = await question('Launch file (default: dist/index.js): ');
        if (launch.trim()) manifest.package.server.launch = launch.trim();
        console.log('\n📋 Bot Permissions:\n');
        console.log('Community permissions:');
      } else {
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
        console.log('Community permissions:');
        const manageRoles = await question('  Need to manage roles? (y/n): ');
        if (manageRoles.toLowerCase() === 'y') manifest.permissions.community.ManageRoles = true;
        const manageCommunity = await question('  Need to manage community settings? (y/n): ');
        if (manageCommunity.toLowerCase() === 'y') manifest.permissions.community.ManageCommunity = true;
        const manageChannels = await question('  Need to manage channels? (y/n): ');
        if (manageChannels.toLowerCase() === 'y') manifest.permissions.community.ManageChannels = true;
        console.log('\nChannel permissions:');
      }

      const createMsg = await question('  Need to send messages? (y/n): ');
      if (createMsg.toLowerCase() === 'y') manifest.permissions.channel.CreateMessage = true;
      const readMsg = await question('  Need to read messages? (y/n): ');
      if (readMsg.toLowerCase() === 'y') manifest.permissions.channel.ReadMessage = true;
      const deleteMsg = await question('  Need to delete messages? (y/n): ');
      if (deleteMsg.toLowerCase() === 'y') manifest.permissions.channel.DeleteMessage = true;
      const managePins = await question('  Need to manage pins? (y/n): ');
      if (managePins.toLowerCase() === 'y') manifest.permissions.channel.ManagePins = true;

      rl.close();
    }

    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    const validation = validateManifestObject(manifest);
    if (!validation.valid) {
      console.error('\n❌ Generated manifest failed validation:');
      for (const e of validation.errors) console.error(' -', e);
      process.exit(1);
    }

    console.log(`\n✅ Generated and validated ${manifestFile} successfully!\n`);

    console.log('📋 Manifest Details:');
    console.log(`   Platform: ${isRootBot ? 'Root Bot (server-side)' : 'Root App (client-side)'}`);
    console.log(`   ID: ${manifest.id}`);
    console.log(`   Version: ${manifest.version}`);
    if (isRootBot) console.log(`   Launch: ${manifest.package.server.launch}`);
    else console.log(`   Name: ${manifest.name || '(not set)'}`);

    console.log('⚠️  Important:');
    console.log('   - The ID is unique to your ' + (isRootBot ? 'bot' : 'app') + ' - never change it after publishing');
    console.log('   - Update version when you make changes (follow semver)');

    console.log('📝 Next steps:');
    console.log(`   1. Review and customize ${manifestFile}`);
    if (isRootBot) {
      console.log('   2. Build your bot: npm run build');
      console.log('   3. Publish: npx @rootsdk/cli publish');
    } else {
      console.log('   2. Build your app: npm run build');
      console.log('   3. Deploy through Root platform interface');
    }
  });

program
  .command('publish')
  .description('Validate and publish the current root-manifest.json using @rootsdk/cli')
  .option('-f, --file <path>', 'Manifest file to publish', 'root-manifest.json')
  .option('--no-validate', 'Skip manifest validation step')
  .action((options: any) => {
    const file = options.file || 'root-manifest.json';
    if (!fs.existsSync(file)) {
      console.error(`❌ Manifest not found: ${file}`);
      process.exit(1);
    }

    if (options.validate !== false) {
      let manifest: any;
      try { manifest = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (err: any) {
        console.error('❌ Failed to parse manifest:', err.message); process.exit(1);
      }
      const result = validateManifestObject(manifest);
      if (!result.valid) { console.error('❌ Manifest validation failed:'); for (const e of result.errors) console.error(' -', e); process.exit(1); }
      console.log('✅ Manifest validation passed');
    }

    try {
      console.log('🔁 Running publish via @rootsdk/cli...');
      execSync('npx @rootsdk/cli publish', { stdio: 'inherit' });
    } catch (err: any) {
      console.error('❌ Publish failed:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

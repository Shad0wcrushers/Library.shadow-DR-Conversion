#!/usr/bin/env node

/**
 * CLI tool for Library@DR-Conversion
 * Provides utilities for bot development
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

program
  .name('Library@DR-Conversion')
  .description('CLI tools for Library@DR-Conversion v0.1.0')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new bot project')
  .option('-p, --platform <type>', 'Platform (discord, root)', 'discord')
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
        'Library@DR-Conversion': '^0.1.0',
      },
      devDependencies: {
        typescript: '^5.3.0',
        'ts-node': '^10.9.0',
        '@types/node': '^20.0.0',
      },
    };
    
    if (options.platform === 'discord') {
      packageJson.dependencies['discord.js'] = '^14.14.1';
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
    const envExample = options.platform === 'discord'
      ? 'DISCORD_TOKEN=your-bot-token-here\n'
      : 'ROOT_TOKEN=your-bot-token-here\n';
    
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
    
    // Create main bot file
    const botCode = options.platform === 'discord'
      ? `import { UnifiedClient } from 'Library@DR-Conversion';

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
`
      : `import { UnifiedClient } from 'Library@DR-Conversion';

const client = new UnifiedClient({
  platform: 'root',
  config: {
    token: process.env.ROOT_TOKEN!
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
    
    if (!pkg.dependencies || !pkg.dependencies['Library@DR-Conversion']) {
      console.error('❌ Library@DR-Conversion not found in dependencies');
      process.exit(1);
    }
    
    if (!fs.existsSync('.env') && !process.env.BOT_TOKEN) {
      console.warn('⚠️  No .env file or BOT_TOKEN environment variable found');
    }
    
    console.log('✅ Configuration is valid');
  });

program.parse();

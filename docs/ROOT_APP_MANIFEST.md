# Root Bot Manifest Guide

Root Bots require a `root-manifest.json` file to define how your bot integrates with the Root platform. This guide explains how to create and configure your Root Bot manifest based on the official Root platform documentation.

## 📋 What is a Root Bot Manifest?

The `root-manifest.json` file defines:
- **Identity and version**: A unique ID and semantic version for tracking and updates
- **How to run your code**: Where compiled code lives and how to launch the server
- **Community settings**: Settings that admins can configure through Root's UI
- **Required permissions**: The access your bot needs to function correctly

## 📍 File Name and Location

Your manifest **must** be named `root-manifest.json` and placed directly in your project folder:

```
📁 my-root-bot/
├── root-manifest.json    ← Required, must be this exact name
├── package.json
├── src/
└── dist/
```

## 🏗️ Basic Manifest Structure

```json
{
  "id": "your-unique-bot-id-here",
  "version": "1.0.0",
  "package": {
    "server": {
      "launch": "dist/main.js",
      "deploy": ["dist"],
      "node_modules": ["node_modules"]
    }
  },
  "settings": {
    "groups": []
  },
  "permissions": {
    "community": {},
    "channel": {}
  }
}
```

## 📝 Manifest Fields Reference

### Required Fields

#### `id` (string)
A unique identifier for your bot. This is used by Root to track your bot across versions.

```json
"id": "xxxxxxxxxxxxxxxxxxxxxx"
```

**Important**: Once published, this ID cannot be changed. Generate a unique ID (you can use a UUID).

#### `version` (string)
Semantic version number following [semver](https://semver.org/) (e.g., "1.0.0", "1.2.3", "2.0.0").

```json
"version": "1.0.0"
```

Root uses this to:
- Track updates
- Manage deployments
- Show version history to community admins

#### `package` (object)
Defines how Root should package and run your bot.

```json
"package": {
  "server": {
    "launch": "dist/main.js",
    "deploy": ["dist"],
    "node_modules": ["node_modules"]
  }
}
```

**`package.server` fields:**
- **`launch`** (string, required): Entry point file that Root will execute to start your bot (e.g., `"dist/main.js"` or `"dist/index.js"`)
- **`deploy`** (array, required): Folders/files to include in the deployment bundle (typically `["dist"]`)
- **`node_modules`** (array, required): Node modules folders to include (typically `["node_modules"]`)

### Optional Fields

#### `settings` (object)
Community-configurable settings that admins can modify through Root's auto-generated UI.

```json
"settings": {
  "groups": [
    {
      "key": "messaging",
      "title": "Participation",
      "items": [
        {
          "key": "numberOfMessages",
          "title": "Number of messages",
          "description": "Number of messages new members must post to earn a role.",
          "required": true,
          "confirmation": "Save",
          "number": {
            "minValue": 1,
            "maxValue": 100,
            "step": 1,
            "defaultValue": 10
          }
        }
      ]
    },
    {
      "key": "roles",
      "title": "Role",
      "items": [
        {
          "key": "assignedRole",
          "title": "Role",
          "description": "Select the role that will be assigned to members.",
          "required": true,
          "confirmation": "Save",
          "role": {
            "multiSelect": false
          }
        }
      ]
    }
  ]
}
```

**Settings structure:**
- **`groups`**: Array of setting groups
  - **`key`**: Unique identifier for the group
  - **`title`**: Display title
  - **`items`**: Array of setting items
    - **`key`**: Unique identifier for the setting
    - **`title`**: Display title
    - **`description`**: Help text
    - **`required`**: Whether the setting must be configured
    - **`confirmation`**: Button text
    - **Type-specific config**: `number`, `role`, `text`, etc.

**Setting types:**
- **`number`**: Numeric input with min/max/step/default
- **`role`**: Role picker with multiSelect option
- **`text`**: Text input
- **`boolean`**: Checkbox/toggle
- **`select`**: Dropdown menu

#### `permissions` (object)
Defines what permissions your bot needs to function.

```json
"permissions": {
  "community": {
    "ManageRoles": true
  },
  "channel": {
    "CreateMessage": true,
    "ReadMessage": true,
    "DeleteMessage": false
  }
}
```

**Community permissions:**
- `ManageRoles`: Create, edit, delete roles
- `ManageCommunity`: Modify community settings
- `ManageMembers`: Kick, ban, or modify members
- `ManageChannels`: Create, edit, delete channels

**Channel permissions:**
- `CreateMessage`: Send messages to channels
- `ReadMessage`: Read messages from channels
- `DeleteMessage`: Delete messages in channels
- `EditMessage`: Edit messages in channels
- `ManagePins`: Pin/unpin messages
- `AddReaction`: Add reactions to messages
- `RemoveReaction`: Remove reactions from messages

## 🎯 Complete Example

Here's a complete `root-manifest.json` for a welcome bot that assigns roles based on participation:

```json
{
  "id": "abc123def456ghi789jkl012",
  "version": "1.2.0",
  "package": {
    "server": {
      "launch": "dist/index.js",
      "deploy": ["dist"],
      "node_modules": ["node_modules"]
    }
  },
  "settings": {
    "groups": [
      {
        "key": "welcome",
        "title": "Welcome Messages",
        "items": [
          {
            "key": "welcomeMessage",
            "title": "Welcome Message",
            "description": "Message to send when a new member joins.",
            "required": true,
            "confirmation": "Save",
            "text": {
              "defaultValue": "Welcome to our community!",
              "multiline": true
            }
          },
          {
            "key": "enableWelcome",
            "title": "Enable Welcome Messages",
            "description": "Send welcome messages to new members.",
            "required": false,
            "confirmation": "Save",
            "boolean": {
              "defaultValue": true
            }
          }
        ]
      },
      {
        "key": "participation",
        "title": "Participation Tracking",
        "items": [
          {
            "key": "messageCount",
            "title": "Message Threshold",
            "description": "Number of messages required to earn the active role.",
            "required": true,
            "confirmation": "Save",
            "number": {
              "minValue": 1,
              "maxValue": 100,
              "step": 1,
              "defaultValue": 10
            }
          },
          {
            "key": "activeRole",
            "title": "Active Member Role",
            "description": "Role assigned to members who reach the message threshold.",
            "required": true,
            "confirmation": "Save",
            "role": {
              "multiSelect": false
            }
          }
        ]
      }
    ]
  },
  "permissions": {
    "community": {
      "ManageRoles": true
    },
    "channel": {
      "CreateMessage": true,
      "ReadMessage": true
    }
  }
}
```

## 🚀 Project Structure

Recommended file structure for a Root Bot:

```
my-root-bot/
├── root-manifest.json    # Bot manifest (required)
├── package.json          # NPM package file
├── tsconfig.json         # TypeScript config
├── src/
│   └── index.ts         # Main bot logic
├── dist/                # Build output
│   └── index.js        # Compiled JavaScript (referenced in manifest)
└── node_modules/        # Dependencies (referenced in manifest)
```

## 🔧 Using with Library.DR-Conversion

When building a Root Bot with this library:

1. **Create your root-manifest.json** in project root
2. **Set up your main entry point:**

```typescript
// src/index.ts
import { UnifiedClient } from 'library.dr-conversion';

const client = new UnifiedClient({
  platform: 'root',
  config: {
    token: process.env.ROOT_TOKEN
  }
});

client.on('ready', (data) => {
  console.log('Root Bot is ready!');
  console.log('Connected to community:', data.communityId);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

await client.connect();
```

3. **Build your bot:**
```bash
npm run build
```

4. **Your dist/ folder should match manifest.json:**
- `package.server.launch` should point to your main file (e.g., `"dist/index.js"`)
- `package.server.deploy` should include your dist folder (`["dist"]`)
- `package.server.node_modules` should include dependencies (`["node_modules"]`)

5. **Publish using Root SDK CLI:**
```bash
npx @rootsdk/cli publish
```

## 📖 How Root Uses Your Manifest

### During Publishing
- Validates manifest structure
- Checks version number (must be higher than previous version)
- Prepares bundle based on `package.server.deploy` paths
- Includes dependencies from `package.server.node_modules`

### During Installation
- Shows permissions to community admins
- Displays settings UI generated from `settings.groups`
- Asks for admin consent before installing

### At Runtime
- Launches your bot using `package.server.launch`
- Enforces permission checks on Root API calls
- Makes settings available to your bot code (via Root SDK)
- Gates access based on declared permissions

## ✅ Validation

Before publishing your Root Bot:

1. ✅ Verify `root-manifest.json` exists in project root
2. ✅ Ensure `id` is unique and won't change
3. ✅ Check `version` follows semver (increment from previous version)
4. ✅ Verify `package.server.launch` points to correct entry file
5. ✅ Ensure all files in `package.server.deploy` exist after build
6. ✅ Check `node_modules` paths are correct
7. ✅ Validate JSON syntax: `npx jsonlint root-manifest.json`
8. ✅ Test settings work correctly in Root's UI
9. ✅ Verify permissions match what your bot actually uses
10. ✅ Build and test bot locally before publishing

## 🐛 Common Issues

### "Manifest not found"
- Ensure file is named exactly `root-manifest.json` (case-sensitive)
- File must be in project root, not in subdirectory
- Check Root SDK CLI is running from project root

### "Invalid launch path"
- Verify `package.server.launch` file exists after `npm run build`
- Path should be relative to project root (e.g., `"dist/index.js"`)
- Check TypeScript compiled successfully

### "Permission denied at runtime"
- Add required permission to `permissions.community` or `permissions.channel`
- Permissions must be granted during install
- Reinstall bot if you added new permissions after initial install

### "Settings not appearing"
- Check `settings.groups` structure matches schema
- Ensure all `key` values are unique
- Verify `required` fields are properly set

### "Version conflict"
- New version must be higher than currently published version
- Follow semantic versioning (major.minor.patch)
- Can't republish same version number

### "Deploy path not found"
- Ensure all paths in `package.server.deploy` exist
- Run `npm run build` before publishing
- Check paths are relative to project root

## 🔄 Updating Your Manifest

When updating your Root Bot:

1. **Increment `version`** following [semver](https://semver.org/):
   - **Patch** (1.0.0 → 1.0.1): Bug fixes, minor changes
   - **Minor** (1.0.0 → 1.1.0): New features, backward compatible
   - **Major** (1.0.0 → 2.0.0): Breaking changes

2. **If adding new permissions**:
   - Add to `permissions.community` or `permissions.channel`
   - Community admins will need to approve new permissions
   - Test thoroughly with new permissions

3. **If changing settings**:
   - Add new settings to appropriate `settings.groups`
   - Existing communities keep old settings values
   - Provide sensible defaults for new settings

4. **Update and republish**:
   ```bash
   npm run build
   npx @rootsdk/cli publish
   ```

## ⚠️ Important Notes

### About Root Apps vs Root Bots

- **This guide is for Root Bots (server-side)** which require `root-manifest.json`
- **Root Apps (client-side GUI apps)** have different requirements
- If you're building a client-side Root App, configuration may differ
- See Root's official documentation for Root App-specific setup

### Manifest ID

Your `id` field is critical:
- ✅ Generate once and never change
- ✅ Use a unique identifier (UUID recommended)
- ❌ Don't reuse IDs from other bots
- ❌ Don't change ID after publishing (Root won't recognize updates)

### File Paths

All paths in the manifest are relative to project root:
```json
"package": {
  "server": {
    "launch": "dist/index.js",     // ✅ Relative to root
    "deploy": ["dist"],            // ✅ Relative to root
    "node_modules": ["node_modules"] // ✅ Relative to root
  }
}
```

## 📚 Further Reading

- **[Root Manifest Overview](https://docs.rootapp.com/docs/bot-docs/configure/manifest-overview/)** - Official Root documentation
- **[Library.DR-Conversion API](../API.md)** - Full library API reference
- **[Root Bot Example](../examples/root-bot.ts)** - Working Root Bot code
- **[Setup Guide](SETUP.md)** - Getting started with Library.DR-Conversion

## 🤝 Need Help?

- [Open an issue](https://github.com/Shad0wcrushers/Library.shadow-DR-Conversion/issues)
- Check existing examples in `examples/` folder
- Read the official [Root documentation](https://docs.rootapp.com/)
- Join the Root Developer community

/**
 * Discord-specific type helpers and configuration
 */

import { GatewayIntentBits, ClientOptions } from 'discord.js';
import { PlatformCapabilities } from '../../types/platform';

/**
 * Configuration options for Discord provider
 */
export interface DiscordConfig {
  /** Discord bot token */
  token: string;
  
  /** Gateway intents to request */
  intents?: GatewayIntentBits[];
  
  /** Additional discord.js client options */
  clientOptions?: Partial<ClientOptions>;
  
  /** Index signature for platform config compatibility */
  [key: string]: unknown;
}

/**
 * Discord platform capabilities
 */
export const DISCORD_CAPABILITIES: PlatformCapabilities = {
  embeds: true,
  buttons: true,
  selectMenus: true,
  reactions: true,
  attachments: true,
  threads: true,
  voice: true,
  slashCommands: true,
  maxMessageLength: 2000,
  maxEmbedsPerMessage: 10,
  maxFieldsPerEmbed: 25
};

/**
 * Default Discord intents for a typical bot
 */
export const DEFAULT_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.DirectMessages
];

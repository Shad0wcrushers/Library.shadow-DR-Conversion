/**
 * Unified client for multi-platform chat bot development
 * Main entry point for the Library.DR-Conversion library
 */

import { EventEmitter } from 'events';
import {
  PlatformProvider,
  PlatformType,
  Message,
  User,
  Channel,
  Guild,
  MessageOptions
} from './types';
import { DiscordProvider } from './providers/discord/provider';
import { DiscordConfig } from './providers/discord/types';
import { RootProvider } from './providers/root/provider';
import { RootAppProvider } from './providers/root/app-provider';
import { RootConfig, RootAppConfig } from './providers/root/types';
import { UnsupportedPlatformError } from './utils/errors';
import { Logger, getLogger, LogLevel } from './utils/logger';

/**
 * Configuration for creating a UnifiedClient
 */
export interface UnifiedClientConfig {
  /** The platform to connect to */
  platform: PlatformType;
  
  /** Platform-specific configuration */
  config: DiscordConfig | RootConfig | RootAppConfig;
  
  /** Optional logging level */
  logLevel?: LogLevel;
}

/**
 * Unified client that provides a consistent interface across multiple chat platforms
 * 
 * @example
 * ```typescript
 * const client = new UnifiedClient({
 *   platform: 'discord',
 *   config: {
 *     token: 'your-bot-token'
 *   }
 * });
 * 
 * client.on('message', (message) => {
 *   if (message.content === '!ping') {
 *     message.reply('Pong!');
 *   }
 * });
 * 
 * await client.connect();
 * ```
 */
export class UnifiedClient extends EventEmitter {
  private provider: PlatformProvider;
  private logger: Logger;
  private platform: PlatformType;
  private config: DiscordConfig | RootConfig | RootAppConfig;
  
  constructor(options: UnifiedClientConfig) {
    super();
    this.platform = options.platform;
    this.config = options.config;
    
    // Setup logging
    this.logger = getLogger();
    if (options.logLevel !== undefined) {
      this.logger.setLevel(options.logLevel);
    }
    
    // Create the appropriate provider based on platform
    this.provider = this.createProvider(options.platform, options.config);
    
    // Forward all events from provider to UnifiedClient
    this.setupEventForwarding();
    
    this.logger.info(`UnifiedClient initialized for platform: ${options.platform}`);
  }
  
  /**
   * Create a provider instance based on the platform type
   */
  private createProvider(platform: PlatformType, config: DiscordConfig | RootConfig | RootAppConfig): PlatformProvider {
    switch (platform.toLowerCase()) {
      case 'discord':
        return new DiscordProvider(config as DiscordConfig);
      
      case 'root':
        return new RootProvider(config as RootConfig);
      
      case 'root-app':
        return new RootAppProvider(config as RootAppConfig);
      
      default:
        throw new UnsupportedPlatformError(platform);
    }
  }
  
  /**
   * Forward all events from the provider to the UnifiedClient
   */
  private setupEventForwarding(): void {
    const events = [
      'ready',
      'message',
      'messageUpdate',
      'messageDelete',
      'typingStart',
      'userUpdate',
      'channelCreate',
      'channelUpdate',
      'channelDelete',
      'guildCreate',
      'guildUpdate',
      'guildDelete',
      'guildMemberAdd',
      'guildMemberRemove',
      'guildMemberUpdate',
      'error',
      'debug'
    ];
    
    events.forEach(event => {
      this.provider.on(event, (...args: unknown[]) => {
        this.emit(event, ...args);
      });
    });
  }
  
  // ==================== Connection Methods ====================
  
  /**
   * Connect to the platform
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<void> {
    // Check if auto-start is prevented
    this.checkStartupPermission();
    
    this.logger.info('Connecting to platform...');
    await this.provider.connect();
  }
  
  /**
   * Disconnect from the platform
   * @returns Promise that resolves when disconnected
   */
  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from platform...');
    await this.provider.disconnect();
  }
  
  /**
   * Check if startup is allowed based on preventAutoStart config and environment variables
   * @throws Error if startup is blocked
   */
  private checkStartupPermission(): void {
    const platformUpper = this.platform.toUpperCase();
    const envVar = `ALLOW_${platformUpper}_BOT`;
    const envValue = process.env[envVar];
    const isExplicitlyDisabled = envValue === 'false';
    const isExplicitlyEnabled = envValue === 'true';
    
    // Check for explicit disable via env var (works without preventAutoStart)
    if (isExplicitlyDisabled) {
      const errorMsg = `${this.platform} bot startup blocked by ${envVar}=false`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Check preventAutoStart config requirement
    const preventAutoStart = this.config.preventAutoStart;
    if (preventAutoStart === true) {
      if (!isExplicitlyEnabled) {
        const errorMsg = `${this.platform} bot startup blocked. Set ${envVar}=true to allow startup, or remove preventAutoStart config.`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      this.logger.info(`${this.platform} bot startup permitted via ${envVar}`);
    }
  }
  
  /**
   * Check if the client is currently connected
   */
  get isConnected(): boolean {
    return this.provider.isConnected;
  }
  
  // ==================== Messaging Methods ====================
  
  /**
   * Send a message to a channel
   * @param channelId The channel ID to send to
   * @param options Message content (string) or rich message options
   * @returns The sent message
   * 
   * @example
   * ```typescript
   * // Simple message
   * await client.sendMessage(channelId, 'Hello, world!');
   * 
   * // Rich message with embed
   * await client.sendMessage(channelId, {
   *   content: 'Check this out!',
   *   embeds: [{
   *     title: 'Embed Title',
   *     description: 'Embed description',
   *     color: '#00ff00'
   *   }]
   * });
   * ```
   */
  async sendMessage(channelId: string, options: string | MessageOptions): Promise<Message> {
    return this.provider.sendMessage(channelId, options);
  }
  
  /**
   * Edit an existing message
   * @param messageId The message ID to edit
   * @param channelId The channel ID where the message is
   * @param content New message content
   * @returns The edited message
   */
  async editMessage(messageId: string, channelId: string, content: string): Promise<Message> {
    return this.provider.editMessage(messageId, channelId, content);
  }
  
  /**
   * Delete a message
   * @param messageId The message ID to delete
   * @param channelId The channel ID where the message is
   */
  async deleteMessage(messageId: string, channelId: string): Promise<void> {
    return this.provider.deleteMessage(messageId, channelId);
  }
  
  // ==================== Resource Fetching Methods ====================
  
  /**
   * Get a user by ID
   * @param userId The user ID
   * @returns The user object
   */
  async getUser(userId: string): Promise<User> {
    return this.provider.getUser(userId);
  }
  
  /**
   * Get a channel by ID
   * @param channelId The channel ID
   * @returns The channel object
   */
  async getChannel(channelId: string): Promise<Channel> {
    return this.provider.getChannel(channelId);
  }
  
  /**
   * Get a guild/server by ID
   * @param guildId The guild ID
   * @returns The guild object
   */
  async getGuild(guildId: string): Promise<Guild> {
    return this.provider.getGuild(guildId);
  }
  
  // ==================== Utility Methods ====================
  
  /**
   * Get the platform name
   */
  get platformName(): string {
    return this.provider.platformName;
  }
  
  /**
   * Get the platform version
   */
  get platformVersion(): string {
    return this.provider.platformVersion;
  }
  
  /**
   * Get the underlying provider (for advanced usage)
   * Use this if you need platform-specific functionality
   */
  getProvider(): PlatformProvider {
    return this.provider;
  }
  
  /**
   * Set the logging level
   * @param level The log level to set
   */
  setLogLevel(level: LogLevel): void {
    this.logger.setLevel(level);
  }
}

/**
 * Base abstract class for all platform providers
 * Provides common functionality and enforces implementation of required methods
 */

import { EventEmitter } from 'events';
import { PlatformProvider, Message, User, Channel, Guild, MessageOptions, PlatformConfig } from '../types';
import { Logger, getLogger } from '../utils/logger';

/**
 * Abstract base class that all platform providers must extend
 */
export abstract class BaseProvider extends EventEmitter implements PlatformProvider {
  protected config: PlatformConfig;
  protected logger!: Logger;
  protected _isConnected: boolean = false;
  
  constructor(config: PlatformConfig) {
    super();
    this.config = config;
    // Logger will be initialized after subclass constructor completes
  }
  
  /**
   * Initialize logger - should be called by subclass after construction
   */
  protected initLogger(): void {
    if (!this.logger) {
      this.logger = getLogger().child(`[${this.platformName}]`);
    }
  }
  
  /**
   * Check if the provider is currently connected
   */
  get isConnected(): boolean {
    return this._isConnected;
  }
  
  // ==================== Abstract Methods ====================
  // These MUST be implemented by each platform provider
  
  /**
   * Get logger instance, initializing if needed
   */
  protected getLoggerInstance(): Logger {
    if (!this.logger) {
      this.logger = getLogger().child(`[${this.platformName}]`);
    }
    return this.logger;
  }

  /**
   * Connect to the platform
   * Must set this._isConnected = true on success
   */
  abstract connect(): Promise<void>;
  
  /**
   * Disconnect from the platform
   * Must set this._isConnected = false on disconnect
   */
  abstract disconnect(): Promise<void>;
  
  /**
   * Send a message to a channel
   */
  abstract sendMessage(channelId: string, options: string | MessageOptions): Promise<Message>;
  
  /**
   * Edit an existing message
   */
  abstract editMessage(messageId: string, channelId: string, content: string): Promise<Message>;
  
  /**
   * Delete a message
   */
  abstract deleteMessage(messageId: string, channelId: string): Promise<void>;
  
  /**
   * Get a user by ID
   */
  abstract getUser(userId: string): Promise<User>;
  
  /**
   * Get a channel by ID
   */
  abstract getChannel(channelId: string): Promise<Channel>;
  
  /**
   * Get a guild by ID
   */
  abstract getGuild(guildId: string): Promise<Guild>;
  
  /**
   * Convert platform-specific message to generic format
   */
  abstract convertMessage(platformMessage: unknown): Message;
  
  /**
   * Convert platform-specific user to generic format
   */
  abstract convertUser(platformUser: unknown): User;
  
  /**
   * Convert platform-specific channel to generic format
   */
  abstract convertChannel(platformChannel: unknown): Channel;
  
  /**
   * Convert platform-specific guild to generic format
   */
  abstract convertGuild(platformGuild: unknown): Guild;
  
  /**
   * Platform name identifier
   */
  abstract readonly platformName: string;
  
  /**
   * Provider version
   */
  abstract readonly platformVersion: string;
  
  // ==================== Helper Methods ====================
  // Available to all providers for common functionality
  
  /**
   * Emit a generic event with logging
   * @param event Event name
   * @param args Event arguments
   */
  protected emitGenericEvent(event: string, ...args: unknown[]): void {
    this.logger.debug(`Emitting event: ${event}`);
    this.emit(event, ...args);
  }
  
  /**
   * Validate that the provider is connected
   * @throws Error if not connected
   */
  protected ensureConnected(): void {
    if (!this._isConnected) {
      throw new Error(`${this.platformName} provider is not connected. Call connect() first.`);
    }
  }
  
  /**
   * Validate that a required config property exists
   * @param key Config key to validate
   * @throws Error if the key doesn't exist
   */
  protected validateConfig(key: string): void {
    if (!(key in this.config) || this.config[key] === undefined || this.config[key] === null) {
      throw new Error(`Missing required config property: ${key}`);
    }
  }
  
  /**
   * Safely handle errors and emit error events
   * @param error The error that occurred
   * @param context Context about where the error occurred
   */
  protected handleError(error: Error, context?: string): void {
    const message = context ? `${context}: ${error.message}` : error.message;
    this.logger.error(message, error);
    this.emit('error', error);
  }
  
  /**
   * Normalize a color value to a number
   * @param color Color as hex string or number
   * @returns Color as number
   */
  protected normalizeColor(color: string | number | undefined): number | undefined {
    if (color === undefined) return undefined;
    
    if (typeof color === 'string') {
      // Remove # if present
      const hex = color.replace('#', '');
      return parseInt(hex, 16);
    }
    
    return color;
  }
  
  /**
   * Normalize a color value to a hex string
   * @param color Color as hex string or number
   * @returns Color as hex string
   */
  protected normalizeColorToHex(color: string | number | undefined): string | undefined {
    if (color === undefined) return undefined;
    
    if (typeof color === 'number') {
      return `#${color.toString(16).padStart(6, '0')}`;
    }
    
    // Ensure it starts with #
    return color.startsWith('#') ? color : `#${color}`;
  }
}

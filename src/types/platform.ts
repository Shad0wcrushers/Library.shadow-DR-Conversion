/**
 * Platform provider interface and related types
 */

import { EventEmitter } from 'events';
import { Message, User, Channel, Guild } from './common';
import { MessageOptions } from './embeds';

/**
 * Interface that all platform providers must implement
 */
export interface PlatformProvider extends EventEmitter {
  /**
   * Connect to the platform
   */
  connect(): Promise<void>;
  
  /**
   * Disconnect from the platform
   */
  disconnect(): Promise<void>;
  
  /**
   * Send a message to a channel
   * @param channelId The channel ID to send to
   * @param options Message content or options
   * @returns The sent message
   */
  sendMessage(channelId: string, options: string | MessageOptions): Promise<Message>;
  
  /**
   * Edit a message
   * @param messageId The message ID to edit
   * @param channelId The channel ID where the message is
   * @param content New content
   * @returns The edited message
   */
  editMessage(messageId: string, channelId: string, content: string): Promise<Message>;
  
  /**
   * Delete a message
   * @param messageId The message ID to delete
   * @param channelId The channel ID where the message is
   */
  deleteMessage(messageId: string, channelId: string): Promise<void>;
  
  /**
   * Get a user by ID
   * @param userId The user ID
   * @returns The user object
   */
  getUser(userId: string): Promise<User>;
  
  /**
   * Get a channel by ID
   * @param channelId The channel ID
   * @returns The channel object
   */
  getChannel(channelId: string): Promise<Channel>;
  
  /**
   * Get a guild by ID
   * @param guildId The guild ID
   * @returns The guild object
   */
  getGuild(guildId: string): Promise<Guild>;
  
  /**
   * Convert a platform-specific message to generic format
   * @param platformMessage Platform-specific message object
   * @returns Generic message object
   */
  convertMessage(platformMessage: unknown): Message;
  
  /**
   * Convert a platform-specific user to generic format
   * @param platformUser Platform-specific user object
   * @returns Generic user object
   */
  convertUser(platformUser: unknown): User;
  
  /**
   * Convert a platform-specific channel to generic format
   * @param platformChannel Platform-specific channel object
   * @returns Generic channel object
   */
  convertChannel(platformChannel: unknown): Channel;
  
  /**
   * Convert a platform-specific guild to generic format
   * @param platformGuild Platform-specific guild object
   * @returns Generic guild object
   */
  convertGuild(platformGuild: unknown): Guild;
  
  /**
   * Name of the platform (e.g., 'discord', 'root')
   */
  readonly platformName: string;
  
  /**
   * Version of the provider implementation
   */
  readonly platformVersion: string;
  
  /**
   * Whether the provider is currently connected
   */
  readonly isConnected: boolean;
}

/**
 * Configuration for creating a platform provider
 */
export interface PlatformConfig {
  /** Authentication token */
  token: string;
  
  /** Additional platform-specific options */
  [key: string]: unknown;
}

/**
 * Platform type identifiers
 */
export type PlatformType = 'discord' | 'root';

/**
 * Platform capabilities - used to document what features each platform supports
 */
export interface PlatformCapabilities {
  /** Whether the platform supports rich embeds */
  embeds: boolean;
  
  /** Whether the platform supports message buttons */
  buttons: boolean;
  
  /** Whether the platform supports select menus */
  selectMenus: boolean;
  
  /** Whether the platform supports message reactions */
  reactions: boolean;
  
  /** Whether the platform supports file attachments */
  attachments: boolean;
  
  /** Whether the platform supports message threads */
  threads: boolean;
  
  /** Whether the platform supports voice channels */
  voice: boolean;
  
  /** Whether the platform supports slash commands */
  slashCommands: boolean;
  
  /** Maximum message length */
  maxMessageLength: number;
  
  /** Maximum number of embeds per message */
  maxEmbedsPerMessage: number;
  
  /** Maximum number of fields per embed */
  maxFieldsPerEmbed: number;
}

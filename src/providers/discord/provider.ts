/**
 * Discord platform provider implementation
 */

// Dynamic imports for optional discord.js dependency
type DiscordModule = typeof import('discord.js');
let discordModule: DiscordModule | null = null;

function requireDiscordJS(): DiscordModule {
  if (!discordModule) {
    // Check if we're in a Node.js environment
    if (typeof require === 'undefined') {
      throw new Error(
        'Discord provider requires Node.js environment. ' +
        'For browser-based Root Apps, use platform: "root-app" instead.'
      );
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      discordModule = require('discord.js') as DiscordModule;
    } catch (error) {
      throw new Error(
        'Discord provider requires discord.js to be installed.\n' +
        'Install it with: npm install discord.js\n' +
        'Or if you\'re building for Root platform only, use platform: "root" or "root-app" instead.'
      );
    }
  }
  return discordModule;
}

import type { Client, Message as DiscordMessage } from 'discord.js';
import { BaseProvider } from '../base';
import { Message, User, Channel, Guild } from '../../types/common';
import { MessageOptions } from '../../types/embeds';
import * as Converters from './converters';
import { DiscordConfig, DEFAULT_INTENTS } from './types';
import { ChannelError, MessageError, ResourceNotFoundError, AuthenticationError } from '../../utils/errors';

/**
 * Provider for Discord platform using discord.js
 */
export class DiscordProvider extends BaseProvider {
  private client: Client;
  readonly platformName = 'discord';
  readonly platformVersion = '1.0.0';
  
  constructor(config: DiscordConfig) {
    super(config);
    this.initLogger();
    
    // Validate required config
    this.validateConfig('token');
    
    // Lazy-load discord.js and create Discord client
    const { Client: DiscordClient } = requireDiscordJS();
    const intents = config.intents || DEFAULT_INTENTS;
    this.client = new DiscordClient({
      intents,
      ...config.clientOptions
    }) as Client;
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  /**
   * Setup Discord event listeners and forward to generic events
   */
  private setupEventListeners(): void {
    const { Events } = requireDiscordJS();
    
    // Ready event
    this.client.on(Events.ClientReady, () => {
      this._isConnected = true;
      this.logger.info(`Connected as ${this.client.user?.tag || 'Unknown'}`);
      this.emitGenericEvent('ready');
    });
    
    // Message events
    this.client.on(Events.MessageCreate, (discordMsg: DiscordMessage) => {
      try {
        const message = this.convertMessage(discordMsg);
        this.emitGenericEvent('message', message);
      } catch (error) {
        this.handleError(error as Error, 'MessageCreate event');
      }
    });
    
    this.client.on(Events.MessageUpdate, (oldMsg, newMsg) => {
      try {
        if (newMsg.partial) return;
        const oldMessage = oldMsg.partial ? null : this.convertMessage(oldMsg as DiscordMessage);
        const newMessage = this.convertMessage(newMsg as DiscordMessage);
        this.emitGenericEvent('messageUpdate', oldMessage, newMessage);
      } catch (error) {
        this.handleError(error as Error, 'MessageUpdate event');
      }
    });
    
    this.client.on(Events.MessageDelete, (discordMsg) => {
      try {
        if (discordMsg.partial) return;
        const message = this.convertMessage(discordMsg as DiscordMessage);
        this.emitGenericEvent('messageDelete', message);
      } catch (error) {
        this.handleError(error as Error, 'MessageDelete event');
      }
    });
    
    // Channel events
    this.client.on(Events.ChannelCreate, (channel) => {
      try {
        const genericChannel = this.convertChannel(channel);
        this.emitGenericEvent('channelCreate', genericChannel);
      } catch (error) {
        this.handleError(error as Error, 'ChannelCreate event');
      }
    });
    
    this.client.on(Events.ChannelUpdate, (oldChannel, newChannel) => {
      try {
        const oldGeneric = oldChannel.partial ? null : this.convertChannel(oldChannel);
        const newGeneric = this.convertChannel(newChannel);
        this.emitGenericEvent('channelUpdate', oldGeneric, newGeneric);
      } catch (error) {
        this.handleError(error as Error, 'ChannelUpdate event');
      }
    });
    
    this.client.on(Events.ChannelDelete, (channel) => {
      try {
        const genericChannel = this.convertChannel(channel);
        this.emitGenericEvent('channelDelete', genericChannel);
      } catch (error) {
        this.handleError(error as Error, 'ChannelDelete event');
      }
    });
    
    // Guild events
    this.client.on(Events.GuildCreate, (guild) => {
      try {
        const genericGuild = this.convertGuild(guild);
        this.emitGenericEvent('guildCreate', genericGuild);
      } catch (error) {
        this.handleError(error as Error, 'GuildCreate event');
      }
    });
    
    this.client.on(Events.GuildUpdate, (oldGuild, newGuild) => {
      try {
        const oldGeneric = this.convertGuild(oldGuild);
        const newGeneric = this.convertGuild(newGuild);
        this.emitGenericEvent('guildUpdate', oldGeneric, newGeneric);
      } catch (error) {
        this.handleError(error as Error, 'GuildUpdate event');
      }
    });
    
    this.client.on(Events.GuildDelete, (guild) => {
      try {
        const genericGuild = this.convertGuild(guild);
        this.emitGenericEvent('guildDelete', genericGuild);
      } catch (error) {
        this.handleError(error as Error, 'GuildDelete event');
      }
    });
    
     // Guild member events
    this.client.on(Events.GuildMemberAdd, (member) => {
      try {
        if (member.partial) return; // Skip partial members
        const genericMember = Converters.toGenericGuildMember(member);
        this.emitGenericEvent('guildMemberAdd', genericMember);
      } catch (error) {
        this.handleError(error as Error, 'GuildMemberAdd event');
      }
    });
    
    this.client.on(Events.GuildMemberRemove, (member) => {
      try {
        if (member.partial) return; // Skip partial members
        const genericMember = Converters.toGenericGuildMember(member);
        this.emitGenericEvent('guildMemberRemove', genericMember);
      } catch (error) {
        this.handleError(error as Error, 'GuildMemberRemove event');
      }
    });
    
    this.client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
      try {
        if (oldMember.partial || newMember.partial) return; // Skip partial members
        const oldGeneric = Converters.toGenericGuildMember(oldMember);
        const newGeneric = Converters.toGenericGuildMember(newMember);
        this.emitGenericEvent('guildMemberUpdate', oldGeneric, newGeneric);
      } catch (error) {
        this.handleError(error as Error, 'GuildMemberUpdate event');
      }
    });
    
    // User events
    this.client.on(Events.UserUpdate, (oldUser, newUser) => {
      try {
        const oldGeneric = this.convertUser(oldUser);
        const newGeneric = this.convertUser(newUser);
        this.emitGenericEvent('userUpdate', oldGeneric, newGeneric);
      } catch (error) {
        this.handleError(error as Error, 'UserUpdate event');
      }
    });
    
    // Typing event
    this.client.on(Events.TypingStart, (typing) => {
      try {
        const channel = this.convertChannel(typing.channel);
        const user = this.convertUser(typing.user);
        this.emitGenericEvent('typingStart', channel, user);
      } catch (error) {
        this.handleError(error as Error, 'TypingStart event');
      }
    });
    
    // Error handling
    this.client.on(Events.Error, (error) => {
      this.handleError(error, 'Discord client error');
    });
    
    // Debug (optional)
    this.client.on(Events.Debug, (info) => {
      this.logger.debug(info);
      this.emitGenericEvent('debug', info);
    });
  }
  
  /**
   * Connect to Discord
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Connecting to Discord...');
      await this.client.login(this.config.token);
    } catch (error) {
      this._isConnected = false;
      throw new AuthenticationError('discord', (error as Error).message);
    }
  }
  
  /**
   * Disconnect from Discord
   */
  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from Discord...');
    await Promise.resolve(this.client.destroy());
    this._isConnected = false;
  }
  
  /**
   * Send a message to a channel
   */
  async sendMessage(channelId: string, options: string | MessageOptions): Promise<Message> {
    this.ensureConnected();
    
    try {
      const channel = await this.client.channels.fetch(channelId);
      
      if (!channel || !channel.isTextBased()) {
        throw new ChannelError('Channel is not text-based or does not exist');
      }
      
      // Type guard to ensure channel has send method
      if (!('send' in channel)) {
        throw new ChannelError('Channel does not support sending messages');
      }
      
      let discordMessage: DiscordMessage;
      if (typeof options === 'string') {
        discordMessage = await channel.send(options);
      } else {
        const discordOptions = Converters.toDiscordMessageOptions(options);
        discordMessage = await channel.send(discordOptions);
      }
      
      return this.convertMessage(discordMessage);
    } catch (error) {
      if (error instanceof ChannelError) throw error;
      throw new MessageError(`Failed to send message: ${(error as Error).message}`);
    }
  }
  
  /**
   * Edit a message
   */
  async editMessage(messageId: string, channelId: string, content: string): Promise<Message> {
    this.ensureConnected();
    
    try {
      const channel = await this.client.channels.fetch(channelId);
      
      if (!channel || !channel.isTextBased()) {
        throw new ChannelError('Channel is not text-based or does not exist');
      }
      
      const message = await channel.messages.fetch(messageId);
      const edited = await message.edit(content);
      
      return this.convertMessage(edited);
    } catch (error) {
      if (error instanceof ChannelError) throw error;
      throw new MessageError(`Failed to edit message: ${(error as Error).message}`);
    }
  }
  
  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, channelId: string): Promise<void> {
    this.ensureConnected();
    
    try {
      const channel = await this.client.channels.fetch(channelId);
      
      if (!channel || !channel.isTextBased()) {
        throw new ChannelError('Channel is not text-based or does not exist');
      }
      
      const message = await channel.messages.fetch(messageId);
      await message.delete();
    } catch (error) {
      if (error instanceof ChannelError) throw error;
      throw new MessageError(`Failed to delete message: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<User> {
    this.ensureConnected();
    
    try {
      const discordUser = await this.client.users.fetch(userId);
      return this.convertUser(discordUser);
    } catch (error) {
      throw new ResourceNotFoundError('User', userId);
    }
  }
  
  /**
   * Get a channel by ID
   */
  async getChannel(channelId: string): Promise<Channel> {
    this.ensureConnected();
    
    try {
      const discordChannel = await this.client.channels.fetch(channelId);
      if (!discordChannel) {
        throw new ResourceNotFoundError('Channel', channelId);
      }
      return this.convertChannel(discordChannel);
    } catch (error) {
      throw new ResourceNotFoundError('Channel', channelId);
    }
  }
  
  /**
   * Get a guild by ID
   */
  async getGuild(guildId: string): Promise<Guild> {
    this.ensureConnected();
    
    try {
      const discordGuild = await this.client.guilds.fetch(guildId);
      return this.convertGuild(discordGuild);
    } catch (error) {
      throw new ResourceNotFoundError('Guild', guildId);
    }
  }
  
  /**
   * Convert Discord message to generic format
   */
  convertMessage(discordMsg: DiscordMessage): Message {
    return Converters.toGenericMessage(discordMsg, this);
  }
  
  /**
   * Convert Discord user to generic format
   */
  convertUser(discordUser: unknown): User {
    return Converters.toGenericUser(discordUser as import('discord.js').User);
  }
  
  /**
   * Convert Discord channel to generic format
   */
  convertChannel(discordChannel: unknown): Channel {
    return Converters.toGenericChannel(discordChannel as import('discord.js').Channel);
  }
  
  /**
   * Convert Discord guild to generic format
   */
  convertGuild(discordGuild: unknown): Guild {
    return Converters.toGenericGuild(discordGuild as import('discord.js').Guild);
  }
  
  /**
   * Get the underlying Discord.js client (for advanced usage)
   */
  getClient(): Client {
    return this.client;
  }
}

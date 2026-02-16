/**
 * Root platform provider implementation
 * Using @rootsdk/server-bot v0.17.0+
 */

// Dynamic imports for optional @rootsdk/server-bot dependency
type RootServerModule = typeof import('@rootsdk/server-bot');
let rootServerModule: RootServerModule | null = null;

function requireRootServerBot(): RootServerModule {
  if (!rootServerModule) {
    // Check if we're in a Node.js environment
    if (typeof require === 'undefined') {
      throw new Error(
        'Root Bot provider requires Node.js environment. ' +
        'For browser-based Root Apps, use platform: "root-app" instead.'
      );
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      rootServerModule = require('@rootsdk/server-bot') as RootServerModule;
    } catch (error) {
      throw new Error(
        'Root Bot provider requires @rootsdk/server-bot to be installed.\n' +
        'Install it with: npm install @rootsdk/server-bot\n' +
        'Or if you\'re building a Root App (client-side), use platform: "root-app" instead.'
      );
    }
  }
  return rootServerModule;
}

import type { 
  ChannelMessageCreatedEvent, 
  ChannelMessageEditedEvent, 
  ChannelMessageDeletedEvent,
  ChannelMessageReactionCreatedEvent,
  ChannelMessageReactionDeletedEvent,
  ChannelMessagePinCreatedEvent,
  ChannelMessagePinDeletedEvent,
  ChannelMessageSetTypingIndicatorEvent,
  ChannelCreatedEvent,
  ChannelEditedEvent,
  ChannelDeletedEvent,
  CommunityMemberAttachEvent,
  CommunityMemberDetachEvent,
  CommunityEditedEvent,
  ChannelMessage,
  CommunityMember,
  Channel as RootChannel,
  Community,
  ChannelGuid,
  MessageGuid,
  UserGuid,
  RootServer,
  RootBotStartState
} from '@rootsdk/server-bot';
import { BaseProvider } from '../base';
import { Message, User, Channel, Guild } from '../../types/common';
import { MessageOptions } from '../../types/embeds';
import * as Converters from './converters';
import { RootConfig, DEFAULT_ROOT_CONFIG } from './types';
import {
  AuthenticationError
} from '../../utils/errors';

/**
 * Provider for Root platform
 */
export class RootProvider extends BaseProvider {
  private client: RootServer;
  private connectedCommunityId?: string;
  readonly platformName = 'root';
  readonly platformVersion = '1.0.0';
  
  constructor(config: RootConfig) {
    super(config);
    this.initLogger();
    
    // Validate required config
    this.validateConfig('token');
    
    // Lazy-load @rootsdk/server-bot and use the Root server singleton
    const { rootServer } = requireRootServerBot();
    this.client = rootServer;
    
    this.logger.info('Root provider initialized with @rootsdk/server-bot');
    this.logger.info('Note: Root SDK connects to one community per process. Root infrastructure handles multi-instance automatically.');
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  /**
   * Get the currently connected community ID
   */
  getCommunityId(): string | undefined {
    return this.connectedCommunityId;
  }
  
  /**
   * Setup Root event listeners
   */
  private setupEventListeners(): void {
    // Get event enums from the lazy-loaded module
    const {
      ChannelMessageEvent,
      ChannelEvent,
      CommunityMemberEvent,
      CommunityEvent
    } = requireRootServerBot();
    
    // Message created event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessageCreated,
      (event: ChannelMessageCreatedEvent) => {
        try {
          const message = Converters.convertMessageToGeneric(event as ChannelMessage, this);
          this.emitGenericEvent('message', message);
        } catch (error) {
          this.handleError(error as Error, 'Message created event');
        }
      }
    );
    
    // Message edited event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessageEdited,
      (event: ChannelMessageEditedEvent) => {
        try {
          const message = Converters.convertMessageToGeneric(event as ChannelMessage, this);
          this.emitGenericEvent('messageUpdate', message, message); // Old message not provided by Root
        } catch (error) {
          this.handleError(error as Error, 'Message edited event');
        }
      }
    );
    
    // Message deleted event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessageDeleted,
      (event: ChannelMessageDeletedEvent) => {
        try {
          this.emitGenericEvent('messageDelete', { id: event.id });
        } catch (error) {
          this.handleError(error as Error, 'Message deleted event');
        }
      }
    );
    
    // Reaction created event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessageReactionCreated,
      (event: ChannelMessageReactionCreatedEvent) => {
        try {
          this.logger.debug(`Reaction added: ${event.shortcode} on message ${event.messageId}`);
        } catch (error) {
          this.handleError(error as Error, 'Reaction created event');
        }
      }
    );
    
    // Reaction deleted event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessageReactionDeleted,
      (event: ChannelMessageReactionDeletedEvent) => {
        try {
          this.logger.debug(`Reaction removed: ${event.shortcode} from message ${event.messageId}`);
        } catch (error) {
          this.handleError(error as Error, 'Reaction deleted event');
        }
      }
    );
    
    // Message pinned event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessagePinCreated,
      (event: ChannelMessagePinCreatedEvent) => {
        try {
          this.logger.debug(`Message pinned: ${event.messageId} in channel ${event.channelId}`);
        } catch (error) {
          this.handleError(error as Error, 'Message pin created event');
        }
      }
    );
    
    // Message unpinned event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessagePinDeleted,
      (event: ChannelMessagePinDeletedEvent) => {
        try {
          this.logger.debug(`Message unpinned: ${event.messageId} from channel ${event.channelId}`);
        } catch (error) {
          this.handleError(error as Error, 'Message pin deleted event');
        }
      }
    );
    
    // Typing indicator event
    this.client.community.channelMessages.on(
      ChannelMessageEvent.ChannelMessageSetTypingIndicator,
      (event: ChannelMessageSetTypingIndicatorEvent) => {
        try {
          const channel = {
            id: String(event.channelId),
            name: 'Channel',
            type: 'text' as const,
            platform: 'root' as const
          };
          const user = {
            id: String(event.userId),
            username: 'User',
            displayName: 'User',
            bot: false,
            platform: 'root' as const
          };
          this.emitGenericEvent('typingStart', channel, user);
        } catch (error) {
          this.handleError(error as Error, 'Typing indicator event');
        }
      }
    );
    
    // Channel created event
    this.client.community.channels.on(
      ChannelEvent.ChannelCreated,
      (event: ChannelCreatedEvent) => {
        this.handleChannelCreated(event).catch((error) => {
          this.handleError(error as Error, 'Channel created event');
        });
      }
    );
    
    // Channel edited event
    this.client.community.channels.on(
      ChannelEvent.ChannelEdited,
      (event: ChannelEditedEvent) => {
        this.handleChannelEdited(event).catch((error) => {
          this.handleError(error as Error, 'Channel edited event');
        });
      }
    );
    
    // Channel deleted event
    this.client.community.channels.on(
      ChannelEvent.ChannelDeleted,
      (event: ChannelDeletedEvent) => {
        try {
          // Create minimal channel object for delete event
          const genericChannel = {
            id: String(event.id),
            name: 'Deleted Channel',
            type: 'text' as const,
            platform: 'root' as const
          };
          this.emitGenericEvent('channelDelete', genericChannel);
        } catch (error) {
          this.handleError(error as Error, 'Channel deleted event');
        }
      }
    );
    
    // Community member joined event
    this.client.community.communityMembers.on(
      CommunityMemberEvent.CommunityMemberAttach,
      (event: CommunityMemberAttachEvent) => {
        this.handleMemberJoined(event).catch((error) => {
          this.handleError(error as Error, 'Member attach event');
        });
      }
    );
    
    // Community member left event
    this.client.community.communityMembers.on(
      CommunityMemberEvent.CommunityMemberDetach,
      (event: CommunityMemberDetachEvent) => {
        try {
          // Create minimal member object for leave event
          const genericMember = {
            user: {
              id: String(event.userId),
              username: 'User',
              displayName: 'User',
              bot: false,
              platform: 'root' as const
            },
            platform: 'root' as const
          };
          this.emitGenericEvent('guildMemberRemove', genericMember);
        } catch (error) {
          this.handleError(error as Error, 'Member detach event');
        }
      }
    );
    
    // Community edited event
    this.client.community.communities.on(
      CommunityEvent.CommunityEdited,
      (_event: CommunityEditedEvent) => {
        this.handleCommunityEdited().catch((error) => {
          this.handleError(error as Error, 'Community edited event');
        });
      }
    );
    
    this.logger.info('Root event listeners configured');
  }
  
  /**
   * Handle channel created event
   */
  private async handleChannelCreated(event: ChannelCreatedEvent): Promise<void> {
    const channel = await this.client.community.channels.get({ id: event.id });
    const genericChannel = Converters.convertChannelToGeneric(channel);
    this.emitGenericEvent('channelCreate', genericChannel);
  }
  
  /**
   * Handle channel edited event
   */
  private async handleChannelEdited(event: ChannelEditedEvent): Promise<void> {
    const channel = await this.client.community.channels.get({ id: event.id });
    const genericChannel = Converters.convertChannelToGeneric(channel);
    this.emitGenericEvent('channelUpdate', genericChannel, genericChannel);
  }
  
  /**
   * Handle member joined event
   */
  private async handleMemberJoined(event: CommunityMemberAttachEvent): Promise<void> {
    const member = await this.client.community.communityMembers.get({ userId: event.userId });
    const community = await this.client.community.communities.get();
    const genericMember = {
      user: Converters.convertUserToGeneric(member),
      guild: Converters.convertGuildToGeneric(community),
      platform: 'root' as const
    };
    this.emitGenericEvent('guildMemberAdd', genericMember);
  }
  
  /**
   * Handle community edited event
   */
  private async handleCommunityEdited(): Promise<void> {
    const community = await this.client.community.communities.get();
    const genericGuild = Converters.convertGuildToGeneric(community);
    this.emitGenericEvent('guildUpdate', genericGuild, genericGuild);
  }
  
  /**
   * Connect to Root
   * Automatically detects the community this instance is connected to
   */
  async connect(): Promise<void> {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // Narrow config to RootConfig to avoid unsafe-any linting
    const cfg = (this.config as RootConfig) || ({} as RootConfig);
    const maxAttempts = (cfg.maxReconnectAttempts ?? DEFAULT_ROOT_CONFIG.maxReconnectAttempts ?? 5);
    const reconnectDelay = (cfg.reconnectDelay ?? DEFAULT_ROOT_CONFIG.reconnectDelay ?? 5000);
    const connectTimeout = (cfg.connectTimeout ?? DEFAULT_ROOT_CONFIG.connectTimeout ?? 30000);

    this.logger.info('Connecting to Root...');

    // Best-effort: apply token to the SDK if it exposes an API for it.
    const token = cfg.token || process.env['ROOT_TOKEN'];
    if (token) {
      try {
        type TokenSetter = {
          setToken?: (t: string) => void;
          auth?: { setToken?: (t: string) => void };
          config?: { token?: string };
        };

        const sdkLike = this.client as unknown as TokenSetter;
        if (typeof sdkLike.setToken === 'function') {
          sdkLike.setToken(token);
          this.logger.debug('Applied token to Root SDK via setToken()');
        } else if (sdkLike.auth && typeof sdkLike.auth.setToken === 'function') {
          sdkLike.auth.setToken(token);
          this.logger.debug('Applied token to Root SDK via auth.setToken()');
        } else if (sdkLike.config && typeof sdkLike.config === 'object') {
          sdkLike.config.token = token;
          this.logger.debug('Applied token to Root SDK via client.config.token');
        } else {
          process.env['ROOT_TOKEN'] = token;
          this.logger.debug('Set process.env.ROOT_TOKEN as fallback for Root SDK');
        }
      } catch (err) {
        this.logger.debug('Could not programmatically set token on Root SDK', err as Error);
      }
    } else {
      this.logger.warn('No token found in config or environment for Root provider');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.info(`Root connect attempt ${attempt}/${maxAttempts} (timeout ${connectTimeout}ms)`);

        // race lifecycle.start against a timeout
        await Promise.race<void>([
          this.client.lifecycle.start((startState: RootBotStartState) => {
            this.connectedCommunityId = String(startState.communityId);
            this.logger.info(`Connected to Root community: ${this.connectedCommunityId}`);
            if (startState.communityRoles) this.logger.debug(`Community has ${startState.communityRoles.size} roles`);
            if (startState.communityMembers) this.logger.debug(`Community has ${startState.communityMembers.size} members`);
            return Promise.resolve();
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('connect timeout')), connectTimeout))
        ]);

        this._isConnected = true;
        this.emitGenericEvent('ready', { communityId: this.connectedCommunityId });
        this.logger.info('Connected to Root successfully');
        lastError = null;
        break;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Root connect attempt ${attempt} failed: ${(err as Error).message}`);
        if (attempt < maxAttempts) {
          this.logger.info(`Retrying in ${reconnectDelay}ms...`);
          await sleep(reconnectDelay);
        }
      }
    }

    if (!this._isConnected) {
      const orig = lastError ? (lastError.message || String(lastError)) : 'unknown error';
      const hint = `Failed to connect after ${maxAttempts} attempts: ${orig}.\n` +
        `Hints: ensure your token is correct and provided in the provider config or environment (ROOT_TOKEN), ` +
        `verify network connectivity to Root services, and ensure @rootsdk/server-bot is installed and up-to-date.`;
      this.logger.error(hint);
      throw new AuthenticationError('root', hint);
    }
  }
  
  /**
   * Disconnect from Root
   */
  async disconnect(): Promise<void> {
    this.logger.info('Disconnecting from Root...');
    
    await this.client.lifecycle.stop();
    
    this._isConnected = false;
    this.logger.info('Disconnected from Root');
  }
  
  /**
   * Send a message to a channel
   * 
   * NOTE: Root SDK message creation supports:
   * - content: Text content
   * - attachmentTokenUris: File attachments (requires client-side pre-upload)
   * - parentMessageIds: Thread/reply support (not yet implemented)
   * 
   * For file attachments, use sendMessageWithAttachments() with pre-uploaded token URIs
   */
  async sendMessage(channelId: string, options: string | MessageOptions): Promise<Message> {
    this.ensureConnected();
    
    // Convert string to MessageOptions
    const messageOptions: MessageOptions = typeof options === 'string' 
      ? { content: options } 
      : options;
    
    // Convert to Root format (will throw if unsupported features are used)
    const rootOptions = Converters.toRootMessageOptions(messageOptions);
    
    if (!rootOptions.content) {
      throw new Error('Message content is required');
    }
    
    try {
      const rootMessage = await this.client.community.channelMessages.create({
        channelId: channelId as unknown as ChannelGuid,
        ...rootOptions
      });
      
      return Converters.convertMessageToGeneric(rootMessage, this);
    } catch (error) {
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }
  
  /**
   * Send a message with pre-uploaded file attachments
   * 
   * NOTE: File uploads in Root are client-side operations. To use this method:
   * 1. Use @rootsdk/client-app to request upload tokens
   * 2. Upload files to Root storage using those tokens
   * 3. Pass the resulting token URIs to this method
   * 
   * The @rootsdk/server-bot package does not expose upload token generation APIs.
   * 
   * @param channelId - Channel ID to send message to
   * @param content - Message text content
   * @param attachmentTokenUris - Array of pre-uploaded file token URIs
   * @returns Promise<Message> - The created message
   * 
   * @example
   * ```typescript
   * // After uploading files client-side and getting token URIs:
   * const message = await provider.sendMessageWithAttachments(
   *   channelId,
   *   'Check out these files!',
   *   ['token://uploaded-file-1', 'token://uploaded-file-2']
   * );
   * ```
   */
  async sendMessageWithAttachments(
    channelId: string, 
    content: string, 
    attachmentTokenUris: string[]
  ): Promise<Message> {
    this.ensureConnected();
    
    if (!content && attachmentTokenUris.length === 0) {
      throw new Error('Message must have content or attachments');
    }
    
    try {
      const rootMessage = await this.client.community.channelMessages.create({
        channelId: channelId as unknown as ChannelGuid,
        content,
        attachmentTokenUris
      });
      
      return Converters.convertMessageToGeneric(rootMessage, this);
    } catch (error) {
      throw new Error(`Failed to send message with attachments: ${(error as Error).message}`);
    }
  }
  
  /**
   * Edit a message
   */
  async editMessage(messageId: string, channelId: string, content: string): Promise<Message> {
    this.ensureConnected();
    const editedMsg = await this.client.community.channelMessages.edit({
      channelId: channelId as unknown as ChannelGuid,
      id: messageId as unknown as MessageGuid,
      content
    });
    return Converters.convertMessageToGeneric(editedMsg, this);
  }
  
  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, channelId: string): Promise<void> {
    this.ensureConnected();
    await this.client.community.channelMessages.delete({
      channelId: channelId as unknown as ChannelGuid,
      id: messageId as unknown as MessageGuid
    });
  }
  
  /**
   * Add a reaction to a message
   */
  async reactToMessage(messageId: string, channelId: string, emoji: string): Promise<void> {
    this.ensureConnected();
    await this.client.community.channelMessages.reactionCreate({
      channelId: channelId as unknown as ChannelGuid,
      messageId: messageId as unknown as MessageGuid,
      shortcode: emoji
    });
  }
  
  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, channelId: string, emoji: string): Promise<void> {
    this.ensureConnected();
    await this.client.community.channelMessages.reactionDelete({
      channelId: channelId as unknown as ChannelGuid,
      messageId: messageId as unknown as MessageGuid,
      shortcode: emoji
    });
  }
  
  /**
   * Pin a message in a channel
   */
  async pinMessage(messageId: string, channelId: string): Promise<void> {
    this.ensureConnected();
    await this.client.community.channelMessages.pinCreate({
      channelId: channelId as unknown as ChannelGuid,
      messageId: messageId as unknown as MessageGuid
    });
  }
  
  /**
   * Unpin a message from a channel
   */
  async unpinMessage(messageId: string, channelId: string): Promise<void> {
    this.ensureConnected();
    await this.client.community.channelMessages.pinDelete({
      channelId: channelId as unknown as ChannelGuid,
      messageId: messageId as unknown as MessageGuid
    });
  }
  
  /**
   * Send typing indicator to a channel
   */
  async sendTyping(channelId: string, isTyping: boolean = true): Promise<void> {
    this.ensureConnected();
    await this.client.community.channelMessages.setTypingIndicator({
      channelId: channelId as unknown as ChannelGuid,
      isTyping
    });
  }
  
  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<User> {
    this.ensureConnected();
    const member = await this.client.community.communityMembers.get({
      userId: userId as unknown as UserGuid
    });
    return Converters.convertUserToGeneric(member);
  }
  
  /**
   * Get a channel by ID
   */
  async getChannel(channelId: string): Promise<Channel> {
    this.ensureConnected();
    const channel = await this.client.community.channels.get({
      id: channelId as unknown as ChannelGuid
    });
    return Converters.convertChannelToGeneric(channel);
  }
  
  /**
   * Get a guild by ID
   */
  async getGuild(_guildId: string): Promise<Guild> {
    this.ensureConnected();
    // Root SDK communities.get() doesn't take an ID parameter
    // It returns the current community the bot is connected to
    const community = await this.client.community.communities.get();
    return Converters.convertGuildToGeneric(community);
  }
  
  /**
   * Convert Root message to generic format
   */
  convertMessage(rootMsg: ChannelMessage): Message {
    return Converters.convertMessageToGeneric(rootMsg, this);
  }
  
  /**
   * Convert Root user to generic format
   */
  convertUser(rootUser: CommunityMember): User {
    return Converters.convertUserToGeneric(rootUser);
  }
  
  /**
   * Convert Root channel to generic format
   */
  convertChannel(rootChannel: RootChannel): Channel {
    return Converters.convertChannelToGeneric(rootChannel);
  }
  
  /**
   * Convert Root guild to generic format
   */
  convertGuild(rootCommunity: Community): Guild {
    return Converters.convertGuildToGeneric(rootCommunity);
  }
  
  /**
   * Get the underlying Root client (for advanced usage)
   */
  getClient(): RootServer {
    return this.client;
  }
}

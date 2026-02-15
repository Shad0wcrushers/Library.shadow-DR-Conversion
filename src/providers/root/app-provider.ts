/**
 * Root App (Client-Side) Provider Implementation
 * Using @rootsdk/client-app v0.17.0+
 * 
 * This provider is for building Root Apps - client-side GUI applications
 * that run inside Root communities on user devices.
 * 
 * For server-side bots, use RootProvider (src/providers/root/provider.ts)
 * 
 * Features:
 * - File uploads from user devices
 * - User profile access and search
 * - Theme detection and updates
 * - Asset URL conversion
 * - Download management
 * - App lifecycle control
 * 
 * Note: Root Apps run in browsers, so we use static imports (not dynamic require)
 */

import { rootClient } from '@rootsdk/client-app';
import type { RootClient } from '@rootsdk/client-app';
import { BaseProvider } from '../base';
import { Message, User, Channel, Guild } from '../../types/common';
import { MessageOptions } from '../../types/embeds';
import { PlatformConfig } from '../../types/platform';
import { RootAppConfig } from './types';
import { AuthenticationError } from '../../utils/errors';

/**
 * Provider for Root App (client-side) platform
 */
export class RootAppProvider extends BaseProvider {
  private client: RootClient;
  readonly platformName = 'root-app';
  readonly platformVersion = '1.0.0';
  private currentUserId?: string;
  private themeChangeCallback?: (theme: 'light' | 'dark') => void;
  
  constructor(config: RootAppConfig) {
    // Root Apps don't need tokens, so provide empty string if not specified
    const configWithToken = { ...config, token: config.token || '' };
    super(configWithToken as PlatformConfig);
    this.initLogger();
    
    // Use the Root client singleton (static import for browser compatibility)
    this.client = rootClient;
    
    this.logger.info('Root App provider initialized with @rootsdk/client-app');
    this.logger.info('Note: This is for client-side Root Apps. For server-side bots, use platform: "root"');
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  /**
   * Get the current user ID (the user running this app instance)
   */
  getCurrentUserId(): string | undefined {
    return this.currentUserId;
  }
  
  /**
   * Setup Root App event listeners
   */
  private setupEventListeners(): void {
    // Listen for theme updates
    this.client.theme.on('theme.update', (theme) => {
      this.logger.debug(`Theme updated: ${theme}`);
      
      // Call user-provided callback if set
      if (this.themeChangeCallback) {
        this.themeChangeCallback(theme);
      }
      
      // Emit generic event
      this.emitGenericEvent('themeChange', { theme });
    });
    
    // Note: Root client-app doesn't expose user profile update events directly
    // through the users API. Events come through the bridge interface.
    
    this.logger.info('Root App event listeners configured');
  }
  
  /**
   * Register a callback for theme changes
   * @param callback Function called when theme changes
   */
  onThemeChange(callback: (theme: 'light' | 'dark') => void): void {
    this.themeChangeCallback = callback;
  }
  
  /**
   * Connect to Root App environment
   * For client apps, this initializes the app context
   */
  connect(): Promise<void> {
    try {
      this.logger.info('Initializing Root App...');
      
      // Get current user ID
      try {
        this.currentUserId = this.client.users.getCurrentUserId() as unknown as string;
        this.logger.info(`Root App initialized for user: ${this.currentUserId}`);
      } catch (error) {
        this.logger.warn('Could not get current user ID:', error);
      }
      
      this._isConnected = true;
      this.emitGenericEvent('ready', { userId: this.currentUserId });
      
      this.logger.info('Root App ready');
      return Promise.resolve();
    } catch (error) {
      this._isConnected = false;
      throw new AuthenticationError('root-app', (error as Error).message);
    }
  }
  
  /**
   * Disconnect from Root App
   */
  disconnect(): Promise<void> {
    this.logger.info('Disconnecting Root App...');
    this._isConnected = false;
    this.logger.info('Root App disconnected');
    return Promise.resolve();
  }
  
  /**
   * Upload files and get token URIs
   * This is a client-side capability that Root Bots don't have!
   * 
   * @param fileType Type of file upload ('all', 'text', 'imageAll', 'pdf')
   * @returns Array of token URIs for the uploaded files
   * 
   * Note: You must handle file selection in your UI code using browser APIs,
   * then pass the selected files to this method.
   */
  async uploadFiles(fileType: 'all' | 'text' | 'imageAll' | 'pdf' = 'all'): Promise<string[]> {
    this.logger.info('Requesting file upload via Root App...');
    
    const response = await this.client.assets.fileUpload({
      fileType
    });
    
    this.logger.info(`File(s) uploaded, received ${response.tokens.length} token(s)`);
    return response.tokens;
  }
  
  /**
   * Get user profile information
   */
  async getUser(userId: string): Promise<User> {
    this.logger.debug(`Fetching user profile: ${userId}`);
    
    const profile = await this.client.users.getUserProfile(userId);
    
    return {
      id: profile.id,
      username: profile.nickname || profile.id,
      displayName: profile.nickname,
      avatarUrl: profile.profilePictureUri 
        ? this.client.assets.toImageUrl(profile.profilePictureUri, 'medium')
        : undefined,
      bot: false,
      platform: 'root-app'
    };
  }
  
  /**
   * Get multiple user profiles at once
   * @param userIds Array of user IDs to fetch
   * @returns Array of user profiles
   */
  async getUsers(userIds: string[]): Promise<User[]> {
    this.logger.debug(`Fetching ${userIds.length} user profiles`);
    
    const profiles = await this.client.users.getUserProfiles(userIds);
    
    return profiles.map(profile => ({
      id: profile.id,
      username: profile.nickname || profile.id,
      displayName: profile.nickname,
      avatarUrl: profile.profilePictureUri
        ? this.client.assets.toImageUrl(profile.profilePictureUri, 'medium')
        : undefined,
      bot: false,
      platform: 'root-app'
    }));
  }
  
  /**
   * Show a user's profile in Root's UI
   * Opens the user profile modal/page
   * @param userId User ID to show
   */
  showUserProfile(userId: string): void {
    this.logger.debug(`Opening user profile: ${userId}`);
    this.client.users.showUserProfile(userId);
  }
  
  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return this.client.theme.getTheme();
  }
  
  /**
   * Convert asset URI to URL
   */
  assetToUrl(uri: string | null | undefined): string {
    return this.client.assets.toUrl(uri);
  }
  
  /**
   * Convert image URI to URL with resolution
   */
  imageToUrl(uri: string | null | undefined, resolution: 'original' | 'large' | 'medium' | 'small' = 'medium'): string {
    return this.client.assets.toImageUrl(uri, resolution);
  }
  
  /**
   * Get preview URL for an upload token (before file is fully uploaded)
   * @param token Upload token from file upload process
   * @returns Preview image URL or undefined
   */
  getUploadPreview(token: string): string | undefined {
    return this.client.assets.toUploadImagePreview(token);
  }
  
  /**
   * Restart the app (navigate to different relative URL)
   */
  restart(relativeUrl?: string): void {
    this.logger.info(`Restarting app${relativeUrl ? ` at ${relativeUrl}` : ''}...`);
    this.client.lifecycle.restart(relativeUrl);
  }
  
  // These methods are not applicable for client-side apps
  // They would typically be handled by server-side bots or Root's built-in messaging
  
  sendMessage(_channelId: string, _options: string | MessageOptions): Promise<Message> {
    throw new Error('sendMessage is not supported in Root Apps. Use Root Bot (platform: "root") for messaging.');
  }
  
  editMessage(_messageId: string, _channelId: string, _content: string): Promise<Message> {
    throw new Error('editMessage is not supported in Root Apps. Use Root Bot (platform: "root") for messaging.');
  }
  
  deleteMessage(_messageId: string, _channelId: string): Promise<void> {
    throw new Error('deleteMessage is not supported in Root Apps. Use Root Bot (platform: "root") for messaging.');
  }
  
  getChannel(_channelId: string): Promise<Channel> {
    throw new Error('getChannel is not supported in Root Apps. Use Root Bot (platform: "root") for channel operations.');
  }
  
  getGuild(_guildId: string): Promise<Guild> {
    throw new Error('getGuild is not supported in Root Apps. Use Root Bot (platform: "root") for community operations.');
  }
  
  reactToMessage(_messageId: string, _channelId: string, _emoji: string): Promise<void> {
    throw new Error('reactToMessage is not supported in Root Apps. Use Root Bot (platform: "root") for reactions.');
  }
  
  removeReaction(_messageId: string, _channelId: string, _emoji: string): Promise<void> {
    throw new Error('removeReaction is not supported in Root Apps. Use Root Bot (platform: "root") for reactions.');
  }
  
  pinMessage(_messageId: string, _channelId: string): Promise<void> {
    throw new Error('pinMessage is not supported in Root Apps. Use Root Bot (platform: "root") for message pinning.');
  }
  
  unpinMessage(_messageId: string, _channelId: string): Promise<void> {
    throw new Error('unpinMessage is not supported in Root Apps. Use Root Bot (platform: "root") for message pinning.');
  }
  
  sendTyping(_channelId: string): Promise<void> {
    throw new Error('sendTyping is not supported in Root Apps. Use Root Bot (platform: "root") for typing indicators.');
  }
  
  // Conversion methods required by BaseProvider
  convertMessage(_platformMessage: unknown): Message {
    throw new Error('convertMessage is not applicable for Root Apps.');
  }
  
  convertUser(_platformUser: unknown): User {
    throw new Error('convertUser is not applicable for Root Apps.');
  }
  
  convertChannel(_platformChannel: unknown): Channel {
    throw new Error('convertChannel is not applicable for Root Apps.');
  }
  
  convertGuild(_platformGuild: unknown): Guild {
    throw new Error('convertGuild is not applicable for Root Apps.');
  }
}

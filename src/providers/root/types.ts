/**
 * Root platform type definitions
 * Based on Root Bot API (https://docs.rootapp.com/docs/bot-docs/bot-home/)
 * 
 * Note: Root Bot SDK is available via @rootsdk/server-bot package (v0.17.0+).
 * Update these types based on the actual @rootsdk/server-bot exports and documentation.
 * 
 * Other Root SDK packages:
 * - @rootsdk/client-app - For client-side apps
 * - @rootsdk/server-app - For server-side apps
 * - @rootsdk/dev-tools - Development tools
 */

import { PlatformConfig, PlatformCapabilities } from '../../types/platform';

/**
 * Root-specific configuration
 */
export interface RootConfig extends PlatformConfig {
  /** Root bot token from developer portal */
  token: string;
  
  /** Root API base URL (default: https://api.rootapp.com/v1) */
  apiUrl?: string;
  
  /** WebSocket URL for real-time events (default: wss://gateway.rootapp.com) */
  wsUrl?: string;
  
  /** Community ID to connect to */
  communityId?: string;
  
  /** Auto-reconnect on connection loss */
  autoReconnect?: boolean;
  
  /** Reconnect delay in milliseconds */
  reconnectDelay?: number;
  
  /** Maximum reconnect attempts */
  maxReconnectAttempts?: number;
  
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Root message type (platform-specific)
 */
export interface RootMessage {
  id: string;
  content: string;
  author: RootUser;
  channelId: string;
  communityId: string;
  timestamp: string;
  edited?: boolean;
  editedTimestamp?: string;
  mentions?: string[];
  mentionRoles?: string[];
  attachments?: RootAttachment[];
  embeds?: RootEmbed[];
  reactions?: RootReaction[];
  replyTo?: string;
  threadId?: string;
  type?: 'text' | 'system' | 'bot' | 'announcement';
}

/**
 * Root user structure
 */
export interface RootUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bot?: boolean;
  status?: 'online' | 'away' | 'busy' | 'offline';
  statusText?: string;
  badges?: string[];
  createdAt ?: string;
}

/**
 * Root channel structure
 */
export interface RootChannel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement' | 'thread';
  topic?: string;
  communityId: string;
  parentId?: string;
  position?: number;
  nsfw?: boolean;
  rateLimit?: number;
}

/**
 * Root community (guild/server) structure
 */
export interface RootCommunity {
  id: string;
  name: string;
  iconUrl?: string;
  bannerUrl?: string;
  description?: string;
  ownerId: string;
  memberCount?: number;
  features?: string[];
  createdAt?: string;
}

/**
 * Root member structure
 */
export interface RootMember {
  userId: string;
  communityId: string;
  nickname?: string;
  roles: string[];
  joinedAt: string;
  permissions?: string[];
}

/**
 * Root role structure
 */
export interface RootRole {
  id: string;
  name: string;
  color: string;
  hoist: boolean;
  position: number;
  permissions: string;
  mentionable: boolean;
  managed?: boolean;
}

/**
 * Root attachment structure
 */
export interface RootAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  contentType?: string;
  width?: number;
  height?: number;
}

/**
 * Root embed structure
 */
export interface RootEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  author?: {
    name: string;
    url?: string;
    iconUrl?: string;
  };
  footer?: {
    text: string;
    iconUrl?: string;
  };
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
  };
  timestamp?: string;
}

/**
 * Root reaction structure
 */
export interface RootReaction {
  emoji: string;
  count: number;
  me: boolean;
}

/**
 * Root WebSocket event types
 */
export enum RootEventType {
  READY = 'READY',
  RECONNECT = 'RECONNECT',
  ERROR = 'ERROR',
  MESSAGE_CREATE = 'MESSAGE_CREATE',
  MESSAGE_UPDATE = 'MESSAGE_UPDATE',
  MESSAGE_DELETE = 'MESSAGE_DELETE',
  CHANNEL_CREATE = 'CHANNEL_CREATE',
  CHANNEL_UPDATE = 'CHANNEL_UPDATE',
  CHANNEL_DELETE = 'CHANNEL_DELETE',
  MEMBER_JOIN = 'MEMBER_JOIN',
  MEMBER_LEAVE = 'MEMBER_LEAVE',
  MEMBER_UPDATE = 'MEMBER_UPDATE',
  USER_UPDATE = 'USER_UPDATE',
  PRESENCE_UPDATE = 'PRESENCE_UPDATE',
  REACTION_ADD = 'REACTION_ADD',
  REACTION_REMOVE = 'REACTION_REMOVE',
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',
  COMMUNITY_UPDATE = 'COMMUNITY_UPDATE',
}

/**
 * Root WebSocket payload
 */
export interface RootWSPayload {
  op: number;
  t?: RootEventType;
  d?: unknown;
  s?: number;
}

/**
 * Root API endpoints
 */
export const ROOT_API_ENDPOINTS = {
  sendMessage: (channelId: string) => `/channels/${channelId}/messages`,
  getMessage: (channelId: string, messageId: string) => `/channels/${channelId}/messages/${messageId}`,
  editMessage: (channelId: string, messageId: string) => `/channels/${channelId}/messages/${messageId}`,
  deleteMessage: (channelId: string, messageId: string) => `/channels/${channelId}/messages/${messageId}`,
  getMessages: (channelId: string) => `/channels/${channelId}/messages`,
  getChannel: (channelId: string) => `/channels/${channelId}`,
  getUser: (userId: string) => `/users/${userId}`,
  getCurrentUser: () => `/users/@me`,
  getCommunity: (communityId: string) => `/communities/${communityId}`,
  getCommunityMembers: (communityId: string) => `/communities/${communityId}/members`,
  getMember: (communityId: string, userId: string) => `/communities/${communityId}/members/${userId}`,
  addReaction: (channelId: string, messageId: string, emoji: string) => 
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
  removeReaction: (channelId: string, messageId: string, emoji: string) => 
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
};

/**
 * Root platform capabilities
 */
export const ROOT_CAPABILITIES: PlatformCapabilities = {
  embeds: true,
  buttons: true,
  selectMenus: true,
  reactions: true,
  attachments: true,
  threads: true,
  voice: true,
  slashCommands: true,
  maxMessageLength: 4000,
  maxEmbedsPerMessage: 10,
  maxFieldsPerEmbed: 25,
};

/**
 * Default Root configuration
 */
export const DEFAULT_ROOT_CONFIG: Partial<RootConfig> = {
  apiUrl: 'https://api.rootapp.com/v1',
  wsUrl: 'wss://gateway.rootapp.com',
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 5,
  debug: false,
}

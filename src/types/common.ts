/**
 * Common types that represent platform-agnostic entities
 * These types provide a unified interface across all supported chat platforms
 */

import { Embed, MessageOptions } from './embeds';

/**
 * Represents a chat message across all platforms
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  
  /** Text content of the message */
  content: string;
  
  /** The user who sent the message */
  author: User;
  
  /** The channel where the message was sent */
  channel: Channel;
  
  /** When the message was created */
  timestamp: Date;
  
  /** Platform identifier (e.g., 'discord', 'root') */
  platform: string;
  
  /** Reference to the guild/server (if not a DM) */
  guild?: Guild;
  
  /** Array of embeds attached to the message */
  embeds?: Embed[];
  
  /** Array of attachments (images, files, etc.) */
  attachments?: Attachment[];
  
  /** Whether this message mentions everyone */
  mentionsEveryone?: boolean;
  
  /** Array of mentioned users */
  mentions?: User[];
  
  /**
   * Reply to this message
   * @param content String content or rich message options
   * @returns The sent reply message
   */
  reply(content: string | MessageOptions): Promise<Message>;
  
  /**
   * Delete this message
   */
  delete(): Promise<void>;
  
  /**
   * Edit this message
   * @param content New message content
   * @returns The edited message
   */
  edit(content: string): Promise<Message>;
  
  /**
   * Add a reaction to this message
   * @param emoji Emoji to react with (unicode or custom emoji identifier)
   */
  react(emoji: string): Promise<void>;
}

/**
 * Represents a user across all platforms
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  
  /** Username (e.g., 'john_doe') */
  username: string;
  
  /** Display name (e.g., 'John Doe') */
  displayName: string;
  
  /** URL to user's avatar image */
  avatarUrl?: string;
  
  /** Whether this user is a bot */
  bot: boolean;
  
  /** Platform identifier */
  platform: string;
  
  /** Discriminator (e.g., '1234' for Discord) */
  discriminator?: string;
  
  /** Whether this is the current bot user */
  isCurrentUser?: boolean;
}

/**
 * Represents a channel across all platforms
 */
export interface Channel {
  /** Unique identifier for the channel */
  id: string;
  
  /** Channel name */
  name: string;
  
  /** Type of channel */
  type: ChannelType;
  
  /** Platform identifier */
  platform: string;
  
  /** Channel topic/description */
  topic?: string;
  
  /** Whether this channel is NSFW */
  nsfw?: boolean;
  
  /** Parent category ID (if applicable) */
  parentId?: string;
}

/**
 * Channel type enumeration
 */
export type ChannelType = 'text' | 'voice' | 'dm' | 'group' | 'category' | 'announcement' | 'thread';

/**
 * Represents a guild/server across all platforms
 */
export interface Guild {
  /** Unique identifier for the guild */
  id: string;
  
  /** Guild name */
  name: string;
  
  /** URL to guild icon */
  iconUrl?: string;
  
  /** Number of members in the guild */
  memberCount?: number;
  
  /** Platform identifier */
  platform: string;
  
  /** Guild description */
  description?: string;
  
  /** ID of the guild owner */
  ownerId?: string;
  
  /** Array of guild features */
  features?: string[];
}

/**
 * Represents a file attachment
 */
export interface Attachment {
  /** Unique identifier for the attachment */
  id: string;
  
  /** Original filename */
  filename: string;
  
  /** File size in bytes */
  size: number;
  
  /** Direct URL to the file */
  url: string;
  
  /** Proxy URL (if available) */
  proxyUrl?: string;
  
  /** MIME type */
  contentType?: string;
  
  /** Width (for images) */
  width?: number;
  
  /** Height (for images) */
  height?: number;
}

/**
 * Represents a guild member (user + guild-specific data)
 */
export interface GuildMember {
  /** The user object */
  user: User;
  
  /** Nickname in this guild */
  nickname?: string;
  
  /** Array of role IDs */
  roles: string[];
  
  /** When the user joined the guild */
  joinedAt: Date;
  
  /** Whether the member is deafened */
  deaf?: boolean;
  
  /** Whether the member is muted */
  mute?: boolean;
}

/**
 * Represents a role in a guild
 */
export interface Role {
  /** Unique identifier for the role */
  id: string;
  
  /** Role name */
  name: string;
  
  /** Role color (hex string) */
  color: string;
  
  /** Whether this role is hoisted (displayed separately) */
  hoisted: boolean;
  
  /** Position in the role hierarchy */
  position: number;
  
  /** Permissions bitfield */
  permissions: string;
  
  /** Whether this role is managed by an integration */
  managed: boolean;
  
  /** Whether this role is mentionable */
  mentionable: boolean;
}

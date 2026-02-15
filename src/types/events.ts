/**
 * Event types emitted by the unified client
 */

import { Message, User, Channel, Guild, GuildMember } from './common';

/**
 * Event names that can be emitted
 */
export type EventName =
  | 'ready'
  | 'message'
  | 'messageUpdate'
  | 'messageDelete'
  | 'typingStart'
  | 'userUpdate'
  | 'channelCreate'
  | 'channelUpdate'
  | 'channelDelete'
  | 'guildCreate'
  | 'guildUpdate'
  | 'guildDelete'
  | 'guildMemberAdd'
  | 'guildMemberRemove'
  | 'guildMemberUpdate'
  | 'error'
  | 'debug';

/**
 * Mapping of event names to their handler signatures
 */
export interface EventHandlers {
  /**
   * Emitted when the client is ready and connected
   */
  ready: () => void;
  
  /**
   * Emitted when a message is created
   */
  message: (message: Message) => void;
  
  /**
   * Emitted when a message is updated/edited
   */
  messageUpdate: (oldMessage: Message | null, newMessage: Message) => void;
  
  /**
   * Emitted when a message is deleted
   */
  messageDelete: (message: Message) => void;
  
  /**
   * Emitted when a user starts typing
   */
  typingStart: (channel: Channel, user: User) => void;
  
  /**
   * Emitted when a user's information is updated
   */
  userUpdate: (oldUser: User | null, newUser: User) => void;
  
  /**
   * Emitted when a channel is created
   */
  channelCreate: (channel: Channel) => void;
  
  /**
   * Emitted when a channel is updated
   */
  channelUpdate: (oldChannel: Channel | null, newChannel: Channel) => void;
  
  /**
   * Emitted when a channel is deleted
   */
  channelDelete: (channel: Channel) => void;
  
  /**
   * Emitted when the bot joins a guild
   */
  guildCreate: (guild: Guild) => void;
  
  /**
   * Emitted when a guild is updated
   */
  guildUpdate: (oldGuild: Guild | null, newGuild: Guild) => void;
  
  /**
   * Emitted when the bot leaves a guild
   */
  guildDelete: (guild: Guild) => void;
  
  /**
   * Emitted when a user joins a guild
   */
  guildMemberAdd: (member: GuildMember) => void;
  
  /**
   * Emitted when a user leaves a guild
   */
  guildMemberRemove: (member: GuildMember) => void;
  
  /**
   * Emitted when a guild member is updated
   */
  guildMemberUpdate: (oldMember: GuildMember | null, newMember: GuildMember) => void;
  
  /**
   * Emitted when an error occurs
   */
  error: (error: Error) => void;
  
  /**
   * Emitted for debug information
   */
  debug: (info: string) => void;
}

/**
 * Type-safe event emitter interface
 */
export interface TypedEventEmitter {
  on<K extends EventName>(event: K, listener: EventHandlers[K]): this;
  once<K extends EventName>(event: K, listener: EventHandlers[K]): this;
  off<K extends EventName>(event: K, listener: EventHandlers[K]): this;
  emit<K extends EventName>(event: K, ...args: Parameters<EventHandlers[K]>): boolean;
}

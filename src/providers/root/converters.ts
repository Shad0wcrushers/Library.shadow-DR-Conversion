/**
 * Converters for translating between Root API objects and generic types
 * Note: This is a stub implementation. Update with actual Root API response structures.
 */

import {
  Message,
  User,
  Channel,
  Guild,
  Attachment,
  ChannelType
} from '../../types/common';
import { Embed, MessageOptions } from '../../types/embeds';
import type { RootProvider } from './provider';
import {
  RootMessage,
  RootUser,
  RootChannel,
  RootCommunity,
  RootAttachment,
  RootEmbed
} from './types';

/**
 * Convert a Root message to a generic Message
 */
export function toGenericMessage(rootMsg: RootMessage, provider: RootProvider): Message {
  const message: Message = {
    id: rootMsg.id,
    content: rootMsg.content,
    author: toGenericUser(rootMsg.author),
    channel: {
      id: rootMsg.channelId,
      name: 'Unknown',  // Would need to fetch channel details
      type: 'text',
      platform: 'root'
    },
    timestamp: new Date(rootMsg.timestamp),
    platform: 'root',
    embeds: rootMsg.embeds && rootMsg.embeds.length > 0 ? rootMsg.embeds.map(toGenericEmbed) : undefined,
    attachments: rootMsg.attachments && rootMsg.attachments.length > 0
      ? rootMsg.attachments.map(toGenericAttachment)
      : undefined,
    mentions: rootMsg.mentions && rootMsg.mentions.length > 0
      ? rootMsg.mentions.map(userId => ({
          id: userId,
          username: 'user',
          displayName: 'User',
          bot: false,
          platform: 'root'
        } as User))
      : undefined,
    
    // Message methods
    async reply(content: string | MessageOptions) {
      // TODO: Implement Root reply logic
      // This would use Root's API to send a reply
      return provider.sendMessage(rootMsg.channelId, content);
    },
    
    async delete() {
      // TODO: Implement Root delete logic
      await provider.deleteMessage(rootMsg.id, rootMsg.channelId);
    },
    
    async edit(content: string) {
      // TODO: Implement Root edit logic
      return provider.editMessage(rootMsg.id, rootMsg.channelId, content);
    },
    
    async react(_emoji: string): Promise<void> {
      // TODO: Implement Root reaction logic
      // This would call Root's reaction API endpoint
      console.warn('Reactions not yet implemented for Root platform');
      return Promise.resolve();
    }
  };
  
  return message;
}

/**
 * Convert a Root user to a generic User
 */
export function toGenericUser(rootUser: RootUser): User {
  return {
    id: rootUser.id,
    username: rootUser.username,
    displayName: rootUser.displayName || rootUser.username,
    avatarUrl: rootUser.avatarUrl,
    bot: rootUser.bot || false,
    platform: 'root'
  };
}

/**
 * Convert a Root channel to a generic Channel
 */
export function toGenericChannel(rootChannel: RootChannel): Channel {
  return {
    id: rootChannel.id,
    name: rootChannel.name,
    type: convertChannelType(rootChannel.type),
    platform: 'root',
    topic: rootChannel.topic
  };
}

/**
 * Convert Root channel type to generic ChannelType
 */
function convertChannelType(type: string): ChannelType {
  // Update these mappings based on actual Root channel types
  switch (type.toLowerCase()) {
    case 'text':
    case 'chat':
      return 'text';
    case 'voice':
      return 'voice';
    case 'dm':
    case 'direct':
      return 'dm';
    case 'group':
      return 'group';
    default:
      return 'text';
  }
}

/**
 * Convert a Root guild to a generic Guild
 */
export function toGenericGuild(rootCommunity: RootCommunity): Guild {
  return {
    id: rootCommunity.id,
    name: rootCommunity.name,
    iconUrl: rootCommunity.iconUrl,
    memberCount: rootCommunity.memberCount,
    platform: 'root',
    description: rootCommunity.description,
    ownerId: rootCommunity.ownerId
  };
}

/**
 * Convert a Root attachment to a generic Attachment
 */
export function toGenericAttachment(rootAttachment: RootAttachment): Attachment {
  return {
    id: rootAttachment.id,
    filename: rootAttachment.filename,
    size: rootAttachment.size,
    url: rootAttachment.url,
    contentType: rootAttachment.contentType,
    width: rootAttachment.width,
    height: rootAttachment.height
  };
}

/**
 * Convert a Root embed to a generic Embed
 */
export function toGenericEmbed(rootEmbed: RootEmbed): Embed {
  // TODO: Update based on actual Root embed structure
  const embed: Embed = {};
  
  if (typeof rootEmbed.title === 'string') embed.title = rootEmbed.title;
  if (typeof rootEmbed.description === 'string') embed.description = rootEmbed.description;
  if (typeof rootEmbed.url === 'string') embed.url = rootEmbed.url;
  if (typeof rootEmbed.color === 'number') embed.color = rootEmbed.color;
  if (typeof rootEmbed.timestamp === 'string') embed.timestamp = new Date(rootEmbed.timestamp);
  
  if (Array.isArray(rootEmbed.fields) && rootEmbed.fields.length > 0) {
    embed.fields = rootEmbed.fields.map((f) => ({
      name: String(f.name),
      value: String(f.value),
      inline: Boolean(f.inline)
    }));
  }
  
  if (rootEmbed.footer) {
    embed.footer = {
      text: String(rootEmbed.footer.text),
      iconUrl: typeof rootEmbed.footer.iconUrl === 'string' ? rootEmbed.footer.iconUrl : undefined
    };
  }
  
  if (rootEmbed.image) {
    embed.image = {
      url: String(rootEmbed.image.url),
      width: typeof rootEmbed.image.width === 'number' ? rootEmbed.image.width : undefined,
      height: typeof rootEmbed.image.height === 'number' ? rootEmbed.image.height : undefined
    };
  }
  
  if (rootEmbed.thumbnail) {
    embed.thumbnail = {
      url: String(rootEmbed.thumbnail.url),
      width: typeof rootEmbed.thumbnail.width === 'number' ? rootEmbed.thumbnail.width : undefined,
      height: typeof rootEmbed.thumbnail.height === 'number' ? rootEmbed.thumbnail.height : undefined
    };
  }
  
  if (rootEmbed.author) {
    embed.author = {
      name: String(rootEmbed.author.name),
      iconUrl: typeof rootEmbed.author.iconUrl === 'string' ? rootEmbed.author.iconUrl : undefined,
      url: typeof rootEmbed.author.url === 'string' ? rootEmbed.author.url : undefined
    };
  }
  
  return embed;
}

/**
 * Convert a generic Embed to Root embed format
 */
export function toRootEmbed(embed: Embed): Record<string, unknown> {
  // TODO: Update based on actual Root API requirements
  const rootEmbed: Record<string, unknown> = {};
  
  if (embed.title) rootEmbed['title'] = embed.title;
  if (embed.description) rootEmbed['description'] = embed.description;
  if (embed.url) rootEmbed['url'] = embed.url;
  if (embed.color) {
    // Convert hex to number if needed
    rootEmbed['color'] = typeof embed.color === 'string'
      ? parseInt(embed.color.replace('#', ''), 16)
      : embed.color;
  }
  
  if (embed.fields && embed.fields.length > 0) {
    rootEmbed['fields'] = embed.fields;
  }
  
  if (embed.footer) {
    rootEmbed['footer'] = {
      text: embed.footer.text,
      icon_url: embed.footer.iconUrl
    };
  }
  
  if (embed.image) {
    rootEmbed['image'] = { url: embed.image.url };
  }
  
  if (embed.thumbnail) {
    rootEmbed['thumbnail'] = { url: embed.thumbnail.url };
  }
  
  if (embed.author) {
    rootEmbed['author'] = {
      name: embed.author.name,
      icon_url: embed.author.iconUrl,
      url: embed.author.url
    };
  }
  
  if (embed.timestamp) {
    rootEmbed['timestamp'] = embed.timestamp.toISOString();
  }
  
  return rootEmbed;
}

/**
 * Convert generic MessageOptions to Root message format
 */
export function toRootMessageOptions(options: MessageOptions): Record<string, unknown> {
  // TODO: Update based on actual Root API requirements
  const rootOptions: Record<string, unknown> = {};
  
  if (options.content) {
    rootOptions['content'] = options.content;
  }
  
  if (options.embeds && options.embeds.length > 0) {
    rootOptions['embeds'] = options.embeds.map(toRootEmbed);
  }
  
  if (options.files && options.files.length > 0) {
    rootOptions['attachments'] = options.files.map(file => ({
      filename: file.name,
      data: file.data,
      description: file.description
    }));
  }
  
  return rootOptions;
}

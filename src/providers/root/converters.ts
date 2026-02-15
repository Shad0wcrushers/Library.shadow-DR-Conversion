/**
 * Converters for translating between Root API objects and generic types
 * Using @rootsdk/server-bot v0.17.0+
 */

import {
  ChannelMessage,
  CommunityMember,
  Channel as RootChannel,
  Community
} from '@rootsdk/server-bot';
import {
  Message,
  User,
  Channel,
  Guild,
  Attachment,
  ChannelType
} from '../../types/common';
import { MessageOptions } from '../../types/embeds';
import type { RootProvider } from './provider';

/**
 * Convert a Root ChannelMessage to a generic Message
 */
export function convertMessageToGeneric(rootMsg: ChannelMessage, provider: RootProvider): Message {
  const message: Message = {
    id: rootMsg.id,
    content: rootMsg.messageContent || '',
    author: {
      id: rootMsg.userId,
      username: 'user', // Root SDK doesn't provide user info in message events
      displayName: 'User',
      bot: false,
      platform: 'root'
    },
    channel: {
      id: rootMsg.channelId,
      name: 'Channel',
      type: 'text',
      platform: 'root'
    },
    timestamp: new Date(), // Root SDK doesn't provide createdAt in ChannelMessage
    platform: 'root',
    // Add community context to messages
    metadata: {
      communityId: provider.getCommunityId()
    },
    embeds: [],
    attachments: rootMsg.messageUris && rootMsg.messageUris.length > 0
      ? rootMsg.messageUris.map(uri => ({
          id: uri.uri,
          url: uri.uri,
          filename: uri.attachment?.fileName || 'file',
          size: Number(uri.attachment?.length || 0),
          contentType: uri.attachment?.mimeType
        } as Attachment))
      : undefined,
    mentions: undefined,
    
    // Message methods
    async reply(content: string | MessageOptions): Promise<Message> {
      return await provider.sendMessage(String(rootMsg.channelId), content);
    },
    
    async delete(): Promise<void> {
      await provider.deleteMessage(String(rootMsg.id), String(rootMsg.channelId));
    },
    
    async edit(content: string): Promise<Message> {
      return await provider.editMessage(String(rootMsg.id), String(rootMsg.channelId), content);
    },
    
    async react(emoji: string): Promise<void> {
      await provider.reactToMessage(
        String(rootMsg.id), 
        String(rootMsg.channelId), 
        emoji
      );
    }
  };
  
  return message;
}

/**
 * Convert a Root CommunityMember to a generic User
 */
export function convertUserToGeneric(member: CommunityMember): User {
  return {
    id: member.userId,
    username: member.nickname,
    displayName: member.nickname,
    avatarUrl: member.profilePictureAssetUri,
    bot: false, // Root SDK doesn't distinguish bots in member data
    platform: 'root'
  };
}

/**
 * Convert a Root Channel to a generic Channel
 */
export function convertChannelToGeneric(rootChannel: RootChannel): Channel {
  return {
    id: rootChannel.id,
    name: rootChannel.name,
    type: convertChannelType(rootChannel.channelType),
    platform: 'root',
    topic: rootChannel.description
  };
}

/**
 * Convert Root channel type to generic ChannelType
 * 
 * Root SDK ChannelType enum:
 * - Unspecified = 0
 * - Text = 1
 * - ThreadedText = 2
 */
function convertChannelType(channelType: number): ChannelType {
  switch (channelType) {
    case 1: // Text
    case 2: // ThreadedText
      return 'text';
    case 0: // Unspecified
    default:
      return 'text';
  }
}

/**
 * Convert a Root Community to a generic Guild
 */
export function convertGuildToGeneric(community: Community): Guild {
  return {
    id: community.communityId,
    name: community.name,
    iconUrl: community.pictureAssetUri,
    memberCount: undefined, // Root SDK doesn't provide member count in Community type
    platform: 'root',
    description: undefined, // Root SDK doesn't have description in Community
    ownerId: community.ownerUserId
  };
}

/**
 * Convert generic MessageOptions to Root message format
 * 
 * NOTE: Root SDK file upload limitations:
 * - Root uses a multi-step upload flow:
 *   1. Client requests upload token from Root API (client-side operation)
 *   2. Client uploads file to Root storage using token
 *   3. Token URI is obtained after upload
 *   4. Server uses attachmentTokenUris in message creation
 * 
 * The @rootsdk/server-bot package is designed for server-side bots and does not
 * expose token generation APIs. File uploads must be initiated client-side through
 * @rootsdk/client-app, or via custom integration with Root's upload API.
 * 
 * For server-side file attachment support, you would need to:
 * - Use a client SDK to generate upload tokens
 * - Upload files through Root's storage API
 * - Pass the resulting token URIs to this function
 * 
 * - Embeds: Not supported (Root doesn't have Discord-style rich embeds)  
 * - Replies: Supported via parentMessageIds (not yet implemented)
 */
export function toRootMessageOptions(options: MessageOptions): { 
  content?: string;
  attachmentTokenUris?: string[];
} {
  const rootOptions: {
    content?: string;
    attachmentTokenUris?: string[];
  } = {};
  
  if (options.content) {
    rootOptions.content = options.content;
  }
  
  // File attachments require client-side upload token generation
  // The server-bot SDK does not expose token generation APIs
  if (options.files && options.files.length > 0) {
    throw new Error(
      'File attachments in Root require client-side upload token generation. ' +
      'The @rootsdk/server-bot package does not expose upload token APIs. ' +
      'Use @rootsdk/client-app for file uploads, or integrate with Root\'s upload API directly.'
    );
  }
  
  // Discord-style embeds are not supported by Root
  if (options.embeds && options.embeds.length > 0) {
    throw new Error('Rich embeds are not supported by Root platform');
  }
  
  return rootOptions;
}


/**
 * Converters for translating between Discord.js objects and generic types
 */

import type {
  Message as DiscordMessage,
  User as DiscordUser,
  Channel as DiscordChannel,
  Guild as DiscordGuild,
  EmbedBuilder,
  Attachment as DiscordAttachment,
  GuildMember as DiscordGuildMember,
  ChannelType as DiscordChannelType,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Role as DiscordRole,
  MessageCreateOptions,
  Embed as DiscordEmbed,
  APIEmbed,
  APIEmbedField
} from 'discord.js';

// Define the shape of the discord.js module for lazy loading
interface DiscordJSModule {
  EmbedBuilder: typeof EmbedBuilder;
  ButtonBuilder: typeof ButtonBuilder;
  StringSelectMenuBuilder: typeof StringSelectMenuBuilder;
  ActionRowBuilder: typeof ActionRowBuilder;
  ButtonStyle: typeof ButtonStyle;
  ChannelType: typeof DiscordChannelType;
}

// Helper to lazy-load discord.js when needed for instantiation
function getDiscordJS(): DiscordJSModule {
  // Check if we're in a Node.js environment
  if (typeof require === 'undefined') {
    throw new Error(
      'Discord converters require Node.js environment. ' +
      'For browser-based Root Apps, use platform: "root-app" instead.'
    );
  }
  // This will only be called after the DiscordProvider has already loaded discord.js
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('discord.js') as DiscordJSModule;
}
import {
  Message,
  User,
  Channel,
  Guild,
  Attachment,
  GuildMember,
  ChannelType,
  Role
} from '../../types/common';
import {
  Embed,
  MessageOptions,
  Button,
  SelectMenu,
  ActionRow,
  ButtonStyleString,
  ButtonStyle as ButtonStyleEnum
} from '../../types/embeds';
import type { DiscordProvider } from './provider';

/**
 * Convert a Discord.js message to a generic Message
 */
export function toGenericMessage(discordMsg: DiscordMessage, provider: DiscordProvider): Message {
  const message: Message = {
    id: discordMsg.id,
    content: discordMsg.content,
    author: toGenericUser(discordMsg.author),
    channel: toGenericChannel(discordMsg.channel),
    timestamp: discordMsg.createdAt,
    platform: 'discord',
    guild: discordMsg.guild ? toGenericGuild(discordMsg.guild) : undefined,
    embeds: discordMsg.embeds.length > 0 ? discordMsg.embeds.map(toGenericEmbed) : undefined,
    attachments: discordMsg.attachments.size > 0 
      ? Array.from(discordMsg.attachments.values()).map(toGenericAttachment)
      : undefined,
    mentionsEveryone: discordMsg.mentions.everyone,
    mentions: discordMsg.mentions.users.size > 0
      ? Array.from(discordMsg.mentions.users.values()).map(toGenericUser)
      : undefined,
    
    // Message methods
    async reply(content: string | MessageOptions) {
      const reply = await discordMsg.reply(
        typeof content === 'string' ? content : toDiscordMessageOptions(content)
      );
      return toGenericMessage(reply, provider);
    },
    
    async delete() {
      await discordMsg.delete();
    },
    
    async edit(content: string) {
      const edited = await discordMsg.edit(content);
      return toGenericMessage(edited, provider);
    },
    
    async react(emoji: string) {
      await discordMsg.react(emoji);
    }
  };
  
  return message;
}

/**
 * Convert a Discord.js user to a generic User
 */
export function toGenericUser(discordUser: DiscordUser): User {
  return {
    id: discordUser.id,
    username: discordUser.username,
    displayName: discordUser.displayName || discordUser.username,
    avatarUrl: discordUser.displayAvatarURL({ size: 256 }),
    bot: discordUser.bot,
    platform: 'discord',
    discriminator: discordUser.discriminator !== '0' ? discordUser.discriminator : undefined
  };
}

/**
 * Convert a Discord.js channel to a generic Channel
 */
export function toGenericChannel(discordChannel: DiscordChannel): Channel {
  const baseChannel: Channel = {
    id: discordChannel.id,
    name: 'name' in discordChannel ? (discordChannel.name || 'DM') : 'DM',
    type: convertChannelType(discordChannel.type),
    platform: 'discord'
  };
  
  if (discordChannel.isTextBased() && 'topic' in discordChannel) {
    baseChannel.topic = discordChannel.topic || undefined;
  }
  
  if ('nsfw' in discordChannel) {
    baseChannel.nsfw = discordChannel.nsfw;
  }
  
  if ('parentId' in discordChannel) {
    baseChannel.parentId = discordChannel.parentId || undefined;
  }
  
  return baseChannel;
}

/**
 * Convert Discord channel type to generic ChannelType
 */
function convertChannelType(type: DiscordChannelType): ChannelType {
  const { ChannelType } = getDiscordJS();
  
  switch (type) {
    case ChannelType.GuildText:
      return 'text';
    case ChannelType.DM:
      return 'dm';
    case ChannelType.GuildVoice:
      return 'voice';
    case ChannelType.GroupDM:
      return 'group';
    case ChannelType.GuildCategory:
      return 'category';
    case ChannelType.GuildAnnouncement:
      return 'announcement';
    case ChannelType.AnnouncementThread:
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread:
      return 'thread';
    default:
      return 'text';
  }
}

/**
 * Convert a Discord.js guild to a generic Guild
 */
export function toGenericGuild(discordGuild: DiscordGuild): Guild {
  return {
    id: discordGuild.id,
    name: discordGuild.name,
    iconUrl: discordGuild.iconURL({ size: 256 }) || undefined,
    memberCount: discordGuild.memberCount,
    platform: 'discord',
    description: discordGuild.description || undefined,
    ownerId: discordGuild.ownerId,
    features: discordGuild.features
  };
}

/**
 * Convert a Discord.js attachment to a generic Attachment
 */
export function toGenericAttachment(discordAttachment: DiscordAttachment): Attachment {
  return {
    id: discordAttachment.id,
    filename: discordAttachment.name,
    size: discordAttachment.size,
    url: discordAttachment.url,
    proxyUrl: discordAttachment.proxyURL,
    contentType: discordAttachment.contentType || undefined,
    width: discordAttachment.width || undefined,
    height: discordAttachment.height || undefined
  };
}

/**
 * Convert a Discord.js guild member to a generic GuildMember
 */
export function toGenericGuildMember(discordMember: DiscordGuildMember): GuildMember {
  return {
    user: toGenericUser(discordMember.user),
    nickname: discordMember.nickname || undefined,
    roles: discordMember.roles.cache.map((role: DiscordRole) => role.id),
    joinedAt: discordMember.joinedAt || new Date(),
    deaf: discordMember.voice.deaf || false,
    mute: discordMember.voice.mute || false
  };
}

/**
 * Convert a Discord.js embed to a generic Embed
 */
export function toGenericEmbed(discordEmbed: APIEmbed | DiscordEmbed): Embed {
  const embed: Embed = {};
  
  if (discordEmbed.title) embed.title = discordEmbed.title;
  if (discordEmbed.description) embed.description = discordEmbed.description;
  if (discordEmbed.url) embed.url = discordEmbed.url;
  if (discordEmbed.color) embed.color = discordEmbed.color;
  if (discordEmbed.timestamp) embed.timestamp = new Date(discordEmbed.timestamp);
  
  if (discordEmbed.fields && discordEmbed.fields.length > 0) {
    embed.fields = discordEmbed.fields.map((f: APIEmbedField) => ({
      name: f.name,
      value: f.value,
      inline: f.inline
    }));
  }
  
  if (discordEmbed.footer) {
    const footer = discordEmbed.footer as { text: string; iconURL?: string; icon_url?: string };
    const footerIconUrl = footer.iconURL ?? footer.icon_url;
    embed.footer = {
      text: String(footer.text),
      iconUrl: typeof footerIconUrl === 'string' ? footerIconUrl : undefined
    };
  }
  
  if (discordEmbed.image) {
    embed.image = {
      url: discordEmbed.image.url,
      width: discordEmbed.image.width,
      height: discordEmbed.image.height
    };
  }
  
  if (discordEmbed.thumbnail) {
    embed.thumbnail = {
      url: discordEmbed.thumbnail.url,
      width: discordEmbed.thumbnail.width,
      height: discordEmbed.thumbnail.height
    };
  }
  
  if (discordEmbed.author) {
    const author = discordEmbed.author as { name: string; iconURL?: string; icon_url?: string; url?: string };
    const authorIconUrl = author.iconURL ?? author.icon_url;
    embed.author = {
      name: String(author.name),
      iconUrl: typeof authorIconUrl === 'string' ? authorIconUrl : undefined,
      url: typeof author.url === 'string' ? author.url : undefined
    };
  }
  
  return embed;
}

/**
 * Convert a generic Embed to a Discord EmbedBuilder
 */
export function toDiscordEmbed(embed: Embed): EmbedBuilder {
  const { EmbedBuilder } = getDiscordJS();
  const discordEmbed = new EmbedBuilder();
  
  if (embed.title) discordEmbed.setTitle(embed.title);
  if (embed.description) discordEmbed.setDescription(embed.description);
  if (embed.url) discordEmbed.setURL(embed.url);
  
  if (embed.color) {
    const color = typeof embed.color === 'string'
      ? parseInt(embed.color.replace('#', ''), 16)
      : embed.color;
    discordEmbed.setColor(color);
  }
  
  if (embed.fields && embed.fields.length > 0) {
    discordEmbed.addFields(embed.fields);
  }
  
  if (embed.footer) {
    discordEmbed.setFooter({
      text: embed.footer.text,
      iconURL: embed.footer.iconUrl
    });
  }
  
  if (embed.image) {
    discordEmbed.setImage(embed.image.url);
  }
  
  if (embed.thumbnail) {
    discordEmbed.setThumbnail(embed.thumbnail.url);
  }
  
  if (embed.author) {
    discordEmbed.setAuthor({
      name: embed.author.name,
      iconURL: embed.author.iconUrl,
      url: embed.author.url
    });
  }
  
  if (embed.timestamp) {
    discordEmbed.setTimestamp(embed.timestamp);
  }
  
  return discordEmbed;
}

/**
 * Convert generic MessageOptions to Discord message options
 */
export function toDiscordMessageOptions(options: MessageOptions): MessageCreateOptions {
  const discordOptions: MessageCreateOptions = {};
  
  if (options.content) {
    discordOptions.content = options.content;
  }
  
  if (options.embeds && options.embeds.length > 0) {
    discordOptions.embeds = options.embeds.map(toDiscordEmbed);
  }
  
  if (options.files && options.files.length > 0) {
    discordOptions.files = options.files.map(file => ({
      attachment: file.data,
      name: file.name,
      description: file.description
    }));
  }
  
  if (options.tts) {
    discordOptions.tts = options.tts;
  }
  
  // Convert components (buttons, select menus, etc.)
  if (options.components && options.components.length > 0) {
    discordOptions.components = options.components.map(toDiscordActionRow);
  }
  
  return discordOptions;
}

/**
 * Convert a generic ActionRow to Discord ActionRowBuilder
 */
export function toDiscordActionRow(actionRow: ActionRow): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> {
  const discord = getDiscordJS();
  // Create properly typed ActionRowBuilder
  const row: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> = new discord.ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>();
  
  for (const component of actionRow.components) {
    if (component.type === 'button') {
      row.addComponents(toDiscordButton(component));
    } else if (component.type === 'select') {
      row.addComponents(toDiscordSelectMenu(component));
    }
  }
  
  return row;
}

/**
 * Convert a generic Button to Discord ButtonBuilder
 */
export function toDiscordButton(button: Button): ButtonBuilder {
  const { ButtonBuilder } = getDiscordJS();
  const discordButton = new ButtonBuilder()
    .setStyle(convertButtonStyle(button.style));
  
  // Label is required unless there's an emoji
  if (button.label) {
    discordButton.setLabel(button.label);
  }
  
  if (button.customId) {
    discordButton.setCustomId(button.customId);
  }
  
  if (button.url) {
    discordButton.setURL(button.url);
  }
  
  if (button.emoji) {
    discordButton.setEmoji(button.emoji);
  }
  
  if (button.disabled !== undefined) {
    discordButton.setDisabled(button.disabled);
  }
  
  return discordButton;
}

/**
 * Convert generic button style to Discord ButtonStyle
 */
function convertButtonStyle(style: ButtonStyleString | ButtonStyleEnum): ButtonStyle {
  const { ButtonStyle } = getDiscordJS();
  
  if (typeof style === 'number') {
    return style;
  }
  
  switch (style) {
    case 'primary':
      return ButtonStyle.Primary;
    case 'secondary':
      return ButtonStyle.Secondary;
    case 'success':
      return ButtonStyle.Success;
    case 'danger':
      return ButtonStyle.Danger;
    case 'link':
      return ButtonStyle.Link;
    default:
      return ButtonStyle.Primary;
  }
}

/**
 * Convert Discord ButtonStyle to generic button style
 * Exported for use in other converters
 */
export function convertGenericButtonStyle(style: ButtonStyle): ButtonStyleString {
  const { ButtonStyle: DiscordButtonStyle } = getDiscordJS();
  
  switch (style) {
    case DiscordButtonStyle.Primary:
      return 'primary';
    case DiscordButtonStyle.Secondary:
      return 'secondary';
    case DiscordButtonStyle.Success:
      return 'success';
    case DiscordButtonStyle.Danger:
      return 'danger';
    case DiscordButtonStyle.Link:
      return 'link';
    default:
      return 'primary';
  }
}

/**
 * Convert a generic SelectMenu to Discord StringSelectMenuBuilder
 */
export function toDiscordSelectMenu(selectMenu: SelectMenu): StringSelectMenuBuilder {
  const { StringSelectMenuBuilder } = getDiscordJS();
  const discordMenu = new StringSelectMenuBuilder()
    .setCustomId(selectMenu.customId)
    .setPlaceholder(selectMenu.placeholder || 'Select an option')
    .addOptions(
      selectMenu.options.map(option => ({
        label: option.label,
        value: option.value,
        description: option.description,
        emoji: option.emoji,
        default: option.default
      }))
    );
  
  if (selectMenu.minValues !== undefined) {
    discordMenu.setMinValues(selectMenu.minValues);
  }
  
  if (selectMenu.maxValues !== undefined) {
    discordMenu.setMaxValues(selectMenu.maxValues);
  }
  
  if (selectMenu.disabled !== undefined) {
    discordMenu.setDisabled(selectMenu.disabled);
  }
  
  return discordMenu;
}

/**
 * Convert a Discord.js role to a generic Role
 */
export function toGenericRole(discordRole: DiscordRole): Role {
  return {
    id: discordRole.id,
    name: discordRole.name,
    color: `#${discordRole.color.toString(16).padStart(6, '0')}`,
    position: discordRole.position,
    permissions: discordRole.permissions.bitfield.toString(),
    mentionable: discordRole.mentionable,
    hoisted: discordRole.hoist,
    managed: discordRole.managed
  };
}

/**
 * Extract mentions from a Discord message
 */
export function extractMentions(discordMsg: DiscordMessage) {
  return {
    users: Array.from(discordMsg.mentions.users.values()).map(toGenericUser),
    roles: Array.from(discordMsg.mentions.roles.values()).map(toGenericRole),
    channels: Array.from(discordMsg.mentions.channels.values()).map(toGenericChannel),
    everyone: discordMsg.mentions.everyone
  };
}

/**
 * Convert generic message content to Discord-compatible format
 */
export function normalizeMessageContent(content: string | MessageOptions): MessageCreateOptions {
  if (typeof content === 'string') {
    return { content };
  }
  return toDiscordMessageOptions(content);
}

/**
 * Check if a message has specific content types
 */
export function hasEmbeds(message: DiscordMessage): boolean {
  return message.embeds.length > 0;
}

export function hasAttachments(message: DiscordMessage): boolean {
  return message.attachments.size > 0;
}

export function hasComponents(message: DiscordMessage): boolean {
  return message.components.length > 0;
}

/**
 * Extract all URLs from message content and embeds
 */
export function extractUrls(message: DiscordMessage): string[] {
  const urls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Extract from content
  const contentUrls = message.content.match(urlRegex);
  if (contentUrls) {
    urls.push(...contentUrls);
  }
  
  // Extract from embeds
  for (const embed of message.embeds) {
    if (embed.url) urls.push(embed.url);
    if (embed.image?.url) urls.push(embed.image.url);
    if (embed.thumbnail?.url) urls.push(embed.thumbnail.url);
    if (embed.author?.url) urls.push(embed.author.url);
  }
  
  // Extract from attachments
  for (const attachment of message.attachments.values()) {
    urls.push(attachment.url);
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Get the display name for a user in a specific guild context
 */
export function getDisplayName(user: DiscordUser, guildMember?: DiscordGuildMember | null): string {
  if (guildMember?.nickname) {
    return guildMember.nickname;
  }
  return user.displayName || user.username;
}

/**
 * Format a user mention for Discord
 */
export function formatUserMention(userId: string): string {
  return `<@${userId}>`;
}

/**
 * Format a channel mention for Discord
 */
export function formatChannelMention(channelId: string): string {
  return `<#${channelId}>`;
}

/**
 * Format a role mention for Discord
 */
export function formatRoleMention(roleId: string): string {
  return `<@&${roleId}>`;
}

/**
 * Parse Discord timestamp formats
 */
export function formatTimestamp(date: Date, style?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return style ? `<t:${timestamp}:${style}>` : `<t:${timestamp}>`;
}

/**
 * Escape Discord markdown
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/\|/g, '\\|')
    .replace(/>/g, '\\>');
}

/**
 * Clean Discord mentions from text
 */
export function cleanMentions(text: string): string {
  return text
    .replace(/<@!?(\d+)>/g, '@user')
    .replace(/<@&(\d+)>/g, '@role')
    .replace(/<#(\d+)>/g, '#channel');
}

/**
 * Check if a user has specific permissions in a channel
 */
export function hasPermission(member: DiscordGuildMember, permission: bigint): boolean {
  return member.permissions.has(permission);
}

/**
 * Convert error objects to user-friendly messages
 */
export function formatDiscordError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const discordError = error as { code: number; message?: string };
    if (discordError.code === 10008) return 'Message not found';
    if (discordError.code === 50001) return 'Missing access';
    if (discordError.code === 50013) return 'Missing permissions';
    if (discordError.code === 50035) return 'Invalid form body';
    if (discordError.code === 10003) return 'Channel not found';
    if (discordError.code === 10004) return 'Guild not found';
    return discordError.message || 'An error occurred';
  }
  return 'An error occurred';
}

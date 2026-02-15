/**
 * Test suite for Discord converters
 * Demonstrates how to test converter functions
 */

import { toGenericUser, toGenericEmbed, toDiscordEmbed } from '../../../src/providers/discord/converters';
import { Embed } from '../../../src/types/embeds';

describe('Discord Converters', () => {
  describe('toGenericUser', () => {
    it('should convert a Discord user to generic User', () => {
      const mockDiscordUser = {
        id: '123456789',
        username: 'testuser',
        displayName: 'Test User',
        discriminator: '1234',
        bot: false,
        displayAvatarURL: () => 'https://example.com/avatar.png'
      };

      const genericUser = toGenericUser(mockDiscordUser as any);

      expect(genericUser.id).toBe('123456789');
      expect(genericUser.username).toBe('testuser');
      expect(genericUser.displayName).toBe('Test User');
      expect(genericUser.avatarUrl).toBe('https://example.com/avatar.png');
      expect(genericUser.bot).toBe(false);
      expect(genericUser.platform).toBe('discord');
    });

    it('should handle bot users', () => {
      const mockBotUser = {
        id: '987654321',
        username: 'botuser',
        displayName: 'Bot User',
        discriminator: '0000',
        bot: true,
        displayAvatarURL: () => 'https://example.com/bot-avatar.png'
      };

      const genericUser = toGenericUser(mockBotUser as any);

      expect(genericUser.bot).toBe(true);
    });
  });

  describe('toGenericEmbed', () => {
    it('should convert a Discord embed to generic Embed', () => {
      const mockDiscordEmbed = {
        title: 'Test Embed',
        description: 'This is a test',
        url: 'https://example.com',
        color: 0x00ff00,
        fields: [
          { name: 'Field 1', value: 'Value 1', inline: true }
        ],
        footer: {
          text: 'Footer text',
          iconURL: 'https://example.com/footer.png'
        },
        timestamp: '2026-02-15T00:00:00.000Z'
      };

      const genericEmbed = toGenericEmbed(mockDiscordEmbed);

      expect(genericEmbed.title).toBe('Test Embed');
      expect(genericEmbed.description).toBe('This is a test');
      expect(genericEmbed.url).toBe('https://example.com');
      expect(genericEmbed.color).toBe(0x00ff00);
      expect(genericEmbed.fields).toHaveLength(1);
      expect(genericEmbed.fields?.[0]?.name).toBe('Field 1');
      expect(genericEmbed.footer?.text).toBe('Footer text');
    });
  });

  describe('toDiscordEmbed', () => {
    it('should convert a generic Embed to Discord EmbedBuilder', () => {
      const genericEmbed: Embed = {
        title: 'Generic Embed',
        description: 'This is generic',
        color: '#ff0000',
        fields: [
          { name: 'Test', value: 'Value', inline: false }
        ]
      };

      const discordEmbed = toDiscordEmbed(genericEmbed);

      expect(discordEmbed).toBeDefined();
      // EmbedBuilder has a toJSON method to inspect data
      const json = discordEmbed.toJSON();
      expect(json.title).toBe('Generic Embed');
      expect(json.description).toBe('This is generic');
      expect(json.color).toBe(0xff0000); // Hex color converted to number
    });

    it('should handle color as number', () => {
      const genericEmbed: Embed = {
        title: 'Test',
        color: 255 // Blue
      };

      const discordEmbed = toDiscordEmbed(genericEmbed);
      const json = discordEmbed.toJSON();

      expect(json.color).toBe(255);
    });
  });
});

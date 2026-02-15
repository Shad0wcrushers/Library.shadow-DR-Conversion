/**
 * Type definitions tests
 * Ensures all types are properly exported and usable
 */

import {
  Message,
  User,
  Channel,
  Guild,
  Embed,
  MessageOptions,
  UnifiedClient,
  PlatformProvider,
  DiscordProvider,
  RootProvider,
  LogLevel,
  BridgeError,
  UnsupportedPlatformError,
} from '../../src';

describe('Type Exports', () => {
  it('should export UnifiedClient', () => {
    expect(UnifiedClient).toBeDefined();
  });
  
  it('should export provider classes', () => {
    expect(DiscordProvider).toBeDefined();
    expect(RootProvider).toBeDefined();
  });
  
  it('should export LogLevel enum', () => {
    expect(LogLevel.DEBUG).toBeDefined();
    expect(LogLevel.INFO).toBeDefined();
    expect(LogLevel.WARN).toBeDefined();
    expect(LogLevel.ERROR).toBeDefined();
    expect(LogLevel.NONE).toBeDefined();
  });
  
  it('should export error classes', () => {
    expect(BridgeError).toBeDefined();
    expect(UnsupportedPlatformError).toBeDefined();
  });
});

describe('Type Checking', () => {
  it('should allow creating Message type', () => {
    const message: Partial<Message> = {
      id: '123',
      content: 'test',
      platform: 'discord',
    };
    expect(message.id).toBe('123');
  });
  
  it('should allow creating User type', () => {
    const user: User = {
      id: '123',
      username: 'testuser',
      displayName: 'Test User',
      bot: false,
      platform: 'discord',
    };
    expect(user.username).toBe('testuser');
  });
  
  it('should allow creating Embed type', () => {
    const embed: Embed = {
      title: 'Test Embed',
      description: 'Description',
      color: '#00ff00',
    };
    expect(embed.title).toBe('Test Embed');
  });
  
  it('should allow creating MessageOptions', () => {
    const options: MessageOptions = {
      content: 'test',
      embeds: [
        {
          title: 'Test',
        },
      ],
    };
    expect(options.content).toBe('test');
  });
});

/**
 * Test suite for BaseProvider
 */

import { BaseProvider } from '../../src/providers/base';
import { Message, User, Channel, Guild, MessageOptions, PlatformConfig } from '../../src/types';

// Mock implementation for testing
class MockProvider extends BaseProvider {
  readonly platformName = 'mock';
  readonly platformVersion = '1.0.0';
  
  async connect(): Promise<void> {
    this._isConnected = true;
  }
  
  async disconnect(): Promise<void> {
    this._isConnected = false;
  }
  
  async sendMessage(channelId: string, options: string | MessageOptions): Promise<Message> {
    return {} as Message;
  }
  
  async editMessage(messageId: string, channelId: string, content: string): Promise<Message> {
    return {} as Message;
  }
  
  async deleteMessage(messageId: string, channelId: string): Promise<void> {}
  
  async getUser(userId: string): Promise<User> {
    return {} as User;
  }
  
  async getChannel(channelId: string): Promise<Channel> {
    return {} as Channel;
  }
  
  async getGuild(guildId: string): Promise<Guild> {
    return {} as Guild;
  }
  
  convertMessage(platformMessage: any): Message {
    return {} as Message;
  }
  
  convertUser(platformUser: any): User {
    return {} as User;
  }
  
  convertChannel(platformChannel: any): Channel {
    return {} as Channel;
  }
  
  convertGuild(platformGuild: any): Guild {
    return {} as Guild;
  }
}

describe('BaseProvider', () => {
  let provider: MockProvider;
  
  beforeEach(() => {
    provider = new MockProvider({ token: 'test-token' });
  });
  
  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(provider).toBeDefined();
      expect(provider.platformName).toBe('mock');
    });
    
    it('should set isConnected to false initially', () => {
      expect(provider.isConnected).toBe(false);
    });
  });
  
  describe('connection management', () => {
    it('should connect successfully', async () => {
      await provider.connect();
      expect(provider.isConnected).toBe(true);
    });
    
    it('should disconnect successfully', async () => {
      await provider.connect();
      await provider.disconnect();
      expect(provider.isConnected).toBe(false);
    });
  });
  
  describe('ensureConnected', () => {
    it('should throw error when not connected', async () => {
      expect(() => {
        (provider as any).ensureConnected();
      }).toThrow('mock provider is not connected');
    });
    
    it('should not throw when connected', async () => {
      await provider.connect();
      expect(() => {
        (provider as any).ensureConnected();
      }).not.toThrow();
    });
  });
  
  describe('validateConfig', () => {
    it('should not throw for existing config key', () => {
      expect(() => {
        (provider as any).validateConfig('token');
      }).not.toThrow();
    });
    
    it('should throw for missing config key', () => {
      expect(() => {
        (provider as any).validateConfig('missingKey');
      }).toThrow('Missing required config property: missingKey');
    });
  });
  
  describe('normalizeColor', () => {
    it('should normalize hex string to number', () => {
      const result = (provider as any).normalizeColor('#ff0000');
      expect(result).toBe(0xff0000);
    });
    
    it('should handle hex string without #', () => {
      const result = (provider as any).normalizeColor('00ff00');
      expect(result).toBe(0x00ff00);
    });
    
    it('should pass through number', () => {
      const result = (provider as any).normalizeColor(255);
      expect(result).toBe(255);
    });
    
    it('should return undefined for undefined', () => {
      const result = (provider as any).normalizeColor(undefined);
      expect(result).toBeUndefined();
    });
  });
  
  describe('normalizeColorToHex', () => {
    it('should normalize number to hex string', () => {
      const result = (provider as any).normalizeColorToHex(0xff0000);
      expect(result).toBe('#ff0000');
    });
    
    it('should add # to hex string without it', () => {
      const result = (provider as any).normalizeColorToHex('ff0000');
      expect(result).toBe('#ff0000');
    });
    
    it('should pass through hex string with #', () => {
      const result = (provider as any).normalizeColorToHex('#00ff00');
      expect(result).toBe('#00ff00');
    });
  });
  
  describe('handleError', () => {
    it('should emit error event', (done) => {
      const error = new Error('Test error');
      provider.on('error', (err) => {
        expect(err).toBe(error);
        done();
      });
      (provider as any).handleError(error);
    });
  });
});

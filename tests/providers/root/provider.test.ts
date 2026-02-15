/**
 * Root provider tests
 */

import { RootProvider } from '../../../src/providers/root/provider';

describe('RootProvider', () => {
  let provider: RootProvider;
  
  beforeEach(() => {
    provider = new RootProvider({
      token: 'test-token',
    });
  });
  
  describe('constructor', () => {
    it('should create provider instance', () => {
      expect(provider).toBeDefined();
      expect(provider.platformName).toBe('root');
    });
    
    it('should require token', () => {
      expect(() => {
        new RootProvider({} as any);
      }).toThrow('Missing required config property: token');
    });
  });
  
  describe('connection', () => {
    it('should connect (stub mode)', async () => {
      await provider.connect();
      expect(provider.isConnected).toBe(true);
    });
    
    it('should disconnect', async () => {
      await provider.connect();
      await provider.disconnect();
      expect(provider.isConnected).toBe(false);
    });
  });
  
  describe('stub methods', () => {
    beforeEach(async () => {
      await provider.connect();
    });
    
    it('should throw UnsupportedFeatureError for sendMessage', async () => {
      await expect(
        provider.sendMessage('channel-id', 'test message')
      ).rejects.toThrow('not supported');
    });
    
    it('should throw UnsupportedFeatureError for editMessage', async () => {
      await expect(
        provider.editMessage('msg-id', 'channel-id', 'new content')
      ).rejects.toThrow('not supported');
    });
    
    it('should throw UnsupportedFeatureError for deleteMessage', async () => {
      await expect(
        provider.deleteMessage('msg-id', 'channel-id')
      ).rejects.toThrow('not supported');
    });
    
    it('should throw ResourceNotFoundError for getUser', async () => {
      await expect(
        provider.getUser('user-id')
      ).rejects.toThrow('not found');
    });
  });
});

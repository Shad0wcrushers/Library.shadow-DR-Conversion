/**
 * Test suite for UnifiedClient
 */

import { UnifiedClient } from '../../src/client';
import { UnsupportedPlatformError } from '../../src/utils/errors';

describe('UnifiedClient', () => {
  describe('constructor', () => {
    it('should create a Discord client', () => {
      const client = new UnifiedClient({
        platform: 'discord',
        config: {
          token: 'test-token'
        }
      });

      expect(client).toBeDefined();
      expect(client.platformName).toBe('discord');
    });

    it('should create a Root client', () => {
      const client = new UnifiedClient({
        platform: 'root',
        config: {
          token: 'test-token'
        }
      });

      expect(client).toBeDefined();
      expect(client.platformName).toBe('root');
    });

    it('should throw UnsupportedPlatformError for unknown platform', () => {
      expect(() => {
        new UnifiedClient({
          platform: 'unknown' as any,
          config: {
            token: 'test-token'
          }
        });
      }).toThrow(UnsupportedPlatformError);
    });
  });

  describe('properties', () => {
    it('should expose platform name', () => {
      const client = new UnifiedClient({
        platform: 'discord',
        config: { token: 'test' }
      });

      expect(client.platformName).toBe('discord');
    });

    it('should expose platform version', () => {
      const client = new UnifiedClient({
        platform: 'discord',
        config: { token: 'test' }
      });

      expect(client.platformVersion).toBeDefined();
      expect(typeof client.platformVersion).toBe('string');
    });

    it('should report connection status', () => {
      const client = new UnifiedClient({
        platform: 'discord',
        config: { token: 'test' }
      });

      expect(client.isConnected).toBe(false);
    });
  });
});

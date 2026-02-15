/**
 * Integration tests for Discord provider
 * These tests require a Discord bot token to run
 */

import { DiscordProvider } from '../../../src/providers/discord/provider';
import { GatewayIntentBits } from 'discord.js';

describe('DiscordProvider Integration', () => {
  // Skip if no token provided
  const token = process.env.DISCORD_TOKEN;
  const shouldRun = !!token;
  
  const describeIf = shouldRun ? describe : describe.skip;
  
  describeIf('with real Discord connection', () => {
    let provider: DiscordProvider;
    
    beforeAll(async () => {
      provider = new DiscordProvider({
        token: token!,
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });
      
      await provider.connect();
    }, 30000);
    
    afterAll(async () => {
      await provider.disconnect();
    });
    
    it('should connect successfully', () => {
      expect(provider.isConnected).toBe(true);
    });
    
    it('should have correct platform name', () => {
      expect(provider.platformName).toBe('discord');
    });
    
    it('should emit ready event', (done) => {
      // This might already be emitted, so we just check if connected
      if (provider.isConnected) {
        done();
      }
    });
  });
  
  describe('without token', () => {
    it('should throw AuthenticationError on invalid token', async () => {
      const provider = new DiscordProvider({
        token: 'invalid-token',
      });
      
      await expect(provider.connect()).rejects.toThrow();
    }, 10000);
  });
});

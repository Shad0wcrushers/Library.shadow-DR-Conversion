/**
 * Test suite for error classes
 */

import {
  BridgeError,
  UnsupportedPlatformError,
  UnsupportedFeatureError,
  AuthenticationError,
  ResourceNotFoundError,
  RateLimitError
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('BridgeError', () => {
    it('should create a basic error', () => {
      const error = new BridgeError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BridgeError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('BridgeError');
    });
  });

  describe('UnsupportedPlatformError', () => {
    it('should create an unsupported platform error', () => {
      const error = new UnsupportedPlatformError('myplatform');
      
      expect(error).toBeInstanceOf(BridgeError);
      expect(error.message).toBe("Platform 'myplatform' is not supported");
      expect(error.name).toBe('UnsupportedPlatformError');
    });
  });

  describe('UnsupportedFeatureError', () => {
    it('should create an unsupported feature error', () => {
      const error = new UnsupportedFeatureError('reactions', 'myplatform');
      
      expect(error).toBeInstanceOf(BridgeError);
      expect(error.message).toBe("Feature 'reactions' is not supported on platform 'myplatform'");
      expect(error.name).toBe('UnsupportedFeatureError');
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error', () => {
      const error = new AuthenticationError('discord');
      
      expect(error).toBeInstanceOf(BridgeError);
      expect(error.message).toContain('discord');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('discord', 'Invalid token');
      
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('ResourceNotFoundError', () => {
    it('should create a resource not found error', () => {
      const error = new ResourceNotFoundError('User', '123456');
      
      expect(error).toBeInstanceOf(BridgeError);
      expect(error.message).toBe("User with ID '123456' not found");
      expect(error.name).toBe('ResourceNotFoundError');
    });
  });

  describe('RateLimitError', () => {
    it('should create a rate limit error', () => {
      const error = new RateLimitError(60);
      
      expect(error).toBeInstanceOf(BridgeError);
      expect(error.message).toContain('60');
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('RateLimitError');
    });
  });
});

/**
 * Custom error classes for the Library@DR-Conversion library
 */

/**
 * Base error class for all library errors
 */
export class BridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BridgeError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a platform is not supported
 */
export class UnsupportedPlatformError extends BridgeError {
  constructor(platform: string) {
    super(`Platform '${platform}' is not supported`);
    this.name = 'UnsupportedPlatformError';
  }
}

/**
 * Error thrown when a feature is not supported on a platform
 */
export class UnsupportedFeatureError extends BridgeError {
  constructor(feature: string, platform: string) {
    super(`Feature '${feature}' is not supported on platform '${platform}'`);
    this.name = 'UnsupportedFeatureError';
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends BridgeError {
  constructor(platform: string, message?: string) {
    super(message || `Authentication failed for platform '${platform}'`);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a resource is not found
 */
export class ResourceNotFoundError extends BridgeError {
  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} with ID '${resourceId}' not found`);
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Error thrown when a channel operation fails
 */
export class ChannelError extends BridgeError {
  constructor(message: string) {
    super(message);
    this.name = 'ChannelError';
  }
}

/**
 * Error thrown when a message operation fails
 */
export class MessageError extends BridgeError {
  constructor(message: string) {
    super(message);
    this.name = 'MessageError';
  }
}

/**
 * Error thrown when permission is denied
 */
export class PermissionError extends BridgeError {
  constructor(action: string) {
    super(`Permission denied for action: ${action}`);
    this.name = 'PermissionError';
  }
}

/**
 * Error thrown when rate limited
 */
export class RateLimitError extends BridgeError {
  /** Seconds until rate limit resets */
  retryAfter: number;
  
  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when a connection error occurs
 */
export class ConnectionError extends BridgeError {
  constructor(platform: string, originalError?: Error) {
    super(`Connection error for platform '${platform}': ${originalError?.message || 'Unknown error'}`);
    this.name = 'ConnectionError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Error thrown when invalid configuration is provided
 */
export class ConfigurationError extends BridgeError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationError';
  }
}

/**
 * Library.DR-Conversion v0.1.0
 * Unified interface for building multi-platform chat bots
 * 
 * @packageDocumentation
 */

// Main client
export { UnifiedClient, UnifiedClientConfig } from './client';

// Core types
export * from './types/common';
export * from './types/platform';
export * from './types/events';
export * from './types/embeds';

// Providers (for advanced users who want direct access)
export { BaseProvider } from './providers/base';
export { DiscordProvider } from './providers/discord/provider';
export { DiscordConfig } from './providers/discord/types';
export { RootProvider } from './providers/root/provider';
export { RootConfig } from './providers/root/types';

// Utilities
export { Logger, LogLevel, getLogger } from './utils/logger';
export * from './utils/errors';

// Re-export EventEmitter for convenience
export { EventEmitter } from 'events';

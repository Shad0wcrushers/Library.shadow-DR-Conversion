/**
 * Jest setup file
 * Runs before each test suite
 */

// Make this file a module
export {};

// Set test timeout (useful for integration tests)
jest.setTimeout(10000);

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Mock environment variables for tests
process.env['NODE_ENV'] = 'test';

// Add custom matchers if needed
expect.extend({
  toBeValidMessage(received: any) {
    const pass = 
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.content === 'string' &&
      typeof received.author === 'object' &&
      typeof received.platform === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid message`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid message`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMessage(): R;
    }
  }
}

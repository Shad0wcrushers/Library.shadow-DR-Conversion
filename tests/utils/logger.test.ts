/**
 * Test suite for Logger
 */

import { Logger, LogLevel, getLogger } from '../../src/utils/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;
  
  beforeEach(() => {
    logger = Logger.getInstance();
    logger.setLevel(LogLevel.DEBUG);
    
    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      expect(logger1).toBe(logger2);
    });
    
    it('should be accessible via getLogger', () => {
      const logger1 = getLogger();
      const logger2 = Logger.getInstance();
      expect(logger1).toBe(logger2);
    });
  });
  
  describe('log levels', () => {
    it('should log debug messages when level is DEBUG', () => {
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('test message');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'test message'
      );
    });
    
    it('should not log debug when level is INFO', () => {
      logger.setLevel(LogLevel.INFO);
      logger.debug('test message');
      expect(console.debug).not.toHaveBeenCalled();
    });
    
    it('should log info messages when level is INFO', () => {
      logger.setLevel(LogLevel.INFO);
      logger.info('test message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'test message'
      );
    });
    
    it('should log warnings when level is WARN', () => {
      logger.setLevel(LogLevel.WARN);
      logger.warn('test message');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'test message'
      );
    });
    
    it('should log errors when level is ERROR', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.error('test message');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'test message'
      );
    });
    
    it('should not log anything when level is NONE', () => {
      logger.setLevel(LogLevel.NONE);
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
  
  describe('setPrefix', () => {
    it('should set custom prefix', () => {
      logger.setPrefix('[CustomBot]');
      logger.info('test');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[CustomBot]'),
        'test'
      );
    });
  });
  
  describe('child logger', () => {
    it('should create child with modified prefix', () => {
      logger.setPrefix('[Parent]');
      const child = logger.child('[Child]');
      
      child.info('test');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[Parent] [Child]'),
        'test'
      );
    });
    
    it('should inherit log level from parent', () => {
      logger.setLevel(LogLevel.WARN);
      const child = logger.child('[Child]');
      
      expect(child.getLevel()).toBe(LogLevel.WARN);
    });
  });
  
  describe('getLevel', () => {
    it('should return current log level', () => {
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });
});

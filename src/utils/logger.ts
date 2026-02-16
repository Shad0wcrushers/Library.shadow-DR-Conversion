/**
 * Simple logging utility with different log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.INFO;
  private prefix: string = '[library.dr-conversion]';
  
  private constructor() {
    // Auto-detect production environment and adjust log level
    this.detectProductionEnvironment();
  }
  
  /**
   * Detect if running in production and adjust log level accordingly
   * In production, only log warnings and errors by default
   */
  private detectProductionEnvironment(): void {
    const nodeEnv = process.env['NODE_ENV']?.toLowerCase();
    const isProduction = nodeEnv === 'production' || nodeEnv === 'prod';
    
    if (isProduction) {
      this.level = LogLevel.WARN;
      // Log once that we're in production mode (using console.log to bypass level check)
      console.log(`${this.prefix} [INFO] Production environment detected - logging set to WARN level`);
    }
  }
  
  /**
   * Get the singleton logger instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  /**
   * Set the logging level
   * @param level The minimum level to log
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Check if currently running in production environment
   */
  isProduction(): boolean {
    const nodeEnv = process.env['NODE_ENV']?.toLowerCase();
    return nodeEnv === 'production' || nodeEnv === 'prod';
  }
  
  /**
   * Get the current logging level
   */
  getLevel(): LogLevel {
    return this.level;
  }
  
  /**
   * Set a custom prefix for log messages
   * @param prefix The prefix to use
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param args Additional arguments
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`${this.prefix} [DEBUG]`, message, ...args);
    }
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param args Additional arguments
   */
  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`${this.prefix} [INFO]`, message, ...args);
    }
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param args Additional arguments
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`${this.prefix} [WARN]`, message, ...args);
    }
  }
  
  /**
   * Log an error message
   * @param message The message to log
   * @param args Additional arguments
   */
  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`${this.prefix} [ERROR]`, message, ...args);
    }
  }
  
  /**
   * Create a child logger with a custom prefix
   * @param childPrefix Additional prefix for the child logger
   */
  child(childPrefix: string): Logger {
    const child = new Logger();
    child.level = this.level;
    child.prefix = `${this.prefix} ${childPrefix}`;
    return child;
  }
}

/**
 * Get the default logger instance
 */
export function getLogger(): Logger {
  return Logger.getInstance();
}

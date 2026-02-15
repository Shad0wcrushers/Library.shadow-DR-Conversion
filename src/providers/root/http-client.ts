/**
 * Root HTTP client for REST API calls
 * Handles authentication and request/response processing
 */

import { RootConfig } from './types';
import { MessageError, AuthenticationError, ResourceNotFoundError } from '../../utils/errors';

export class RootHTTPClient {
  private baseUrl: string;
  private token: string;
  private headers: Record<string, string>;

  constructor(config: RootConfig) {
    this.baseUrl = config.apiUrl || 'https://api.rootapp.com/v1';
    this.token = config.token;
    this.headers = {
      'Authorization': `Bot ${this.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Library@DR-Conversion/v0.1.0',
    };
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * Make a POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * Make a PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  /**
   * Make a PATCH request
   */
  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Core request method
   */
  private async request<T = unknown>(method: string, endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Return empty object for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const result = await response.json();
      return result as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new MessageError(`HTTP request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData: unknown = await response.json();
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        const error = errorData as { message: string };
        errorMessage = error.message;
      }
    } catch {
      // Couldn't parse error JSON, use status text
    }

    switch (response.status) {
      case 401:
      case 403:
        throw new AuthenticationError(errorMessage);
      case 404:
        throw new ResourceNotFoundError(errorMessage, 'resource');
      case 429: {
        // Rate limit handling
        const retryAfter = response.headers.get('Retry-After');
        throw new MessageError(`Rate limited. Retry after: ${retryAfter || 'unknown'}`);
      }
      default:
        throw new MessageError(errorMessage);
    }
  }
}

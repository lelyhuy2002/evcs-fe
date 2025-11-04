import { z, type ZodType } from 'zod';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// RESPONSE WRAPPER TYPE
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// REQUEST OPTIONS
// ============================================================================

interface RequestOptions<T> {
  schema?: ZodType<ApiResponse<T>>;
  data?: unknown;
  headers?: Record<string, string>;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    method: string,
    options: RequestOptions<T> = {}
  ): Promise<ApiResponse<T>> {
    const { schema, data, headers = {} } = options;

    try {
      const config: RequestInit = {
        method,
        credentials: 'include', // Important for session cookies
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Handle non-200 responses
      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new ApiError(errorMessage, response.status);
      }

      // Parse response
      const responseData = await response.json();

      // Validate with Zod schema if provided
      if (schema) {
        const validated = schema.parse(responseData);
        return validated;
      }

      return responseData as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ApiError('Response validation failed: ' + error.message);
      }
      if (error instanceof Error) {
        throw new ApiError(error.message);
      }
      throw new ApiError('An unknown error occurred');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', options);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', options);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', options);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', options);
  }

  /**
   * DELETE request
   */
  async delete<T = void>(endpoint: string, options: RequestOptions<T> = {}): Promise<void> {
    await this.request<T>(endpoint, 'DELETE', options);
  }

  /**
   * POST request with FormData (for file uploads)
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    schema?: ZodType<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new ApiError(errorMessage, response.status);
      }

      const responseData = await response.json();

      if (schema) {
        const validated = schema.parse(responseData);
        return validated;
      }

      return responseData as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ApiError('Response validation failed: ' + error.message);
      }
      if (error instanceof Error) {
        throw new ApiError(error.message);
      }
      throw new ApiError('An unknown error occurred');
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient(API_BASE_URL);

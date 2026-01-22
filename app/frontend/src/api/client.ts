// API response types
export interface HashResponse {
  hash: string;
}

export interface StoreContentResponse {
  url: string;
}

export interface ErrorResponse {
  error: string;
}

// API Client class
class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData: ErrorResponse = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If parsing fails, use default message
        }

        switch (response.status) {
          case 400:
            throw new Error(`Bad Request: ${errorMessage}`);
          case 404:
            throw new Error(`Not Found: ${errorMessage}`);
          case 500:
            throw new Error(`Server Error: ${errorMessage}`);
          default:
            throw new Error(errorMessage);
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  /**
   * Hash a JSON object
   * @param data - The JSON object to hash
   * @returns Promise with the hash string
   */
  async hash(data: object): Promise<HashResponse> {
    return this.request<HashResponse>('/hash', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Store text content
   * @param text - The text content to store
   * @returns Promise with the content URL
   */
  async storeContent(text: string): Promise<StoreContentResponse> {
    return this.request<StoreContentResponse>('/content', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Retrieve stored content by hash
   * @param hash - The content hash (64 hex characters)
   * @returns Promise with the content text
   */
  async retrieveContent(hash: string): Promise<string> {
    // Validate hash format before making request
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error('Invalid hash format. Expected 64 hexadecimal characters.');
    }

    const response = await fetch(`${this.baseURL}/content/${hash}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Content not found');
      }
      throw new Error(`Failed to retrieve content: ${response.status}`);
    }

    return await response.text();
  }
}

// Export a singleton instance
export const apiClient = new APIClient();

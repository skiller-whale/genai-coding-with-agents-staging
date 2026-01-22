import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../src/api/client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('hash', () => {
    it('should successfully hash a JSON object', async () => {
      const mockResponse = { hash: 'abc123def456' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const data = { key: 'value' };
      const result = await apiClient.hash(data);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/hash', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw error on 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid input' }),
      });

      await expect(apiClient.hash({ key: 'value' })).rejects.toThrow('Bad Request: Invalid input');
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.hash({ key: 'value' })).rejects.toThrow('Network error');
    });
  });

  describe('storeContent', () => {
    it('should successfully store content', async () => {
      const mockResponse = { url: '/content/abc123' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const text = 'Test content';
      const result = await apiClient.storeContent(text);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/content', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw error on 500 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(apiClient.storeContent('test')).rejects.toThrow('Server Error: Server error');
    });
  });

  describe('retrieveContent', () => {
    const validHash = 'a'.repeat(64);

    it('should successfully retrieve content', async () => {
      const mockContent = 'Retrieved content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const result = await apiClient.retrieveContent(validHash);

      expect(result).toBe(mockContent);
      expect(mockFetch).toHaveBeenCalledWith(`/api/content/${validHash}`);
    });

    it('should throw error for invalid hash format', async () => {
      await expect(apiClient.retrieveContent('invalid')).rejects.toThrow(
        'Invalid hash format. Expected 64 hexadecimal characters.'
      );
    });

    it('should throw error on 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiClient.retrieveContent(validHash)).rejects.toThrow('Content not found');
    });

    it('should validate hash contains only hex characters', async () => {
      const invalidHash = 'g' + 'a'.repeat(63);
      await expect(apiClient.retrieveContent(invalidHash)).rejects.toThrow(
        'Invalid hash format'
      );
    });
  });
});

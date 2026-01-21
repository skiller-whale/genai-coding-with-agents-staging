import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const BASE_URL = "http://localhost:6000";

describe("Server API", () => {
  describe("GET /health", () => {
    test("should return status ok", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: "ok" });
    });
  });

  describe("POST /hash", () => {
    test("should return hash for valid JSON object", async () => {
      const testData = { name: "test", value: 123 };

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(typeof data.hash).toBe("string");
      expect(data.hash).toHaveLength(64);
      expect(data.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should return same hash for same data", async () => {
      const testData = { name: "consistent", value: 42 };

      const response1 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const response2 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.hash).toBe(data2.hash);
    });

    test("should return different hashes for different data", async () => {
      const testData1 = { name: "test1" };
      const testData2 = { name: "test2" };

      const response1 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData1),
      });

      const response2 = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData2),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.hash).not.toBe(data2.hash);
    });

    test("should handle complex nested objects", async () => {
      const testData = {
        user: {
          name: "John Doe",
          age: 30,
          address: {
            street: "123 Main St",
            city: "New York",
          },
        },
        metadata: {
          timestamp: "2024-01-01T00:00:00Z",
          tags: ["important", "urgent"],
        },
      };

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(data.hash).toHaveLength(64);
    });

    test("should handle empty objects", async () => {
      const testData = {};

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(data.hash).toHaveLength(64);
    });

    test("should reject arrays", async () => {
      const testData = [1, 2, 3];

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid request body");
    });

    test("should reject null", async () => {
      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "null",
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject primitives", async () => {
      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '"string value"',
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    test("should reject invalid JSON", async () => {
      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json{",
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid JSON");
    });

    test("should handle objects with special characters", async () => {
      const testData = {
        text: "Hello 世界! 🌍",
        emoji: "😀🎉",
        special: "!@#$%^&*()",
      };

      const response = await fetch(`${BASE_URL}/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("hash");
      expect(data.hash).toHaveLength(64);
    });
  });

  describe("Unknown routes", () => {
    test("should return 404 for unknown GET routes", async () => {
      const response = await fetch(`${BASE_URL}/unknown`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });

    test("should return 404 for unknown POST routes", async () => {
      const response = await fetch(`${BASE_URL}/unknown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });
  });

  describe("Method validation", () => {
    test("should reject GET requests to /hash", async () => {
      const response = await fetch(`${BASE_URL}/hash`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });

    test("should reject POST requests to /health", async () => {
      const response = await fetch(`${BASE_URL}/health`, {
        method: "POST",
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Not found" });
    });
  });
});

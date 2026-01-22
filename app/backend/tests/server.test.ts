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

  describe("POST /content", () => {
    test("should accept JSON with text and return URL with hash", async () => {
      const testData = { text: "Hello, world!" };

      const response = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("url");
      expect(typeof data.url).toBe("string");
      expect(data.url).toMatch(/^\/content\/[a-f0-9]{64}$/);
    });

    test("should return different URLs for different text", async () => {
      const testData1 = { text: "First message" };
      const testData2 = { text: "Second message" };

      const response1 = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData1),
      });

      const response2 = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData2),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.url).not.toBe(data2.url);
    });

    test("should return same URL for same text", async () => {
      const testData = { text: "Consistent message" };

      const response1 = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const response2 = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.url).toBe(data2.url);
    });
  });

  describe("GET /content/:hash", () => {
    test("should return stored content as plain text", async () => {
      const testText = "Hello, world!";
      const testData = { text: testText };

      // First, POST the content
      const postResponse = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const postData = await postResponse.json();
      const contentUrl = postData.url;

      // Then, GET the content using the returned URL
      const getResponse = await fetch(`${BASE_URL}${contentUrl}`);
      const retrievedText = await getResponse.text();

      expect(getResponse.status).toBe(200);
      expect(getResponse.headers.get("content-type")).toContain("text/plain");
      expect(retrievedText).toBe(testText);
    });

    test("should return 404 for non-existent hash", async () => {
      const fakeHash = "0".repeat(64);
      const response = await fetch(`${BASE_URL}/content/${fakeHash}`);

      expect(response.status).toBe(404);
    });

    test("should handle special characters in content", async () => {
      const testText = "Hello 世界! 🌍 Special chars: !@#$%";
      const testData = { text: testText };

      // First, POST the content
      const postResponse = await fetch(`${BASE_URL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const postData = await postResponse.json();
      const contentUrl = postData.url;

      // Then, GET the content
      const getResponse = await fetch(`${BASE_URL}${contentUrl}`);
      const retrievedText = await getResponse.text();

      expect(getResponse.status).toBe(200);
      expect(retrievedText).toBe(testText);
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

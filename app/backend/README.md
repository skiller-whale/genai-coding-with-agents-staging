# Backend API

A minimal Bun-based API server with a hashing endpoint.

## Features

- **Hash Endpoint**: POST to `/hash` with JSON data to receive a salted SHA-256 hash
- **Health Check**: GET `/health` to verify server status
- **Type-safe**: Built with TypeScript
- **Thoroughly Tested**: Comprehensive test suite covering all functionality

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

```bash
cd backend
bun install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` to set your secret salt:

```
SECRET_SALT=your-secret-salt-here
PORT=6000
HOST=0.0.0.0
```

### Running the Server

Development mode (with hot reload):
```bash
bun run dev
```

Production mode:
```bash
bun run start
```

The server will start at `http://0.0.0.0:6000`.

### Running Tests

```bash
bun test
```

## API Documentation

### POST /hash

Hashes a JSON object with a secret salt using SHA-256.

**Request:**
```json
{
  "name": "example",
  "value": 123
}
```

**Response (200 OK):**
```json
{
  "hash": "a1b2c3d4e5f6..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid request body. Must be a JSON object."
}
```

**Requirements:**
- Request body must be a valid JSON object (not array, null, or primitive)
- Content-Type should be `application/json`

### GET /health

Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

## Project Structure

```
backend/
├── src/
│   ├── server.ts      # Main server and routes
│   └── hash.ts        # Hashing utility functions
├── tests/
│   ├── server.test.ts # API endpoint tests
│   └── hash.test.ts   # Utility function tests
├── package.json
├── tsconfig.json
├── .env
├── .env.example
└── README.md
```

## Security Notes

- The `SECRET_SALT` should be kept secret and changed in production
- Never commit `.env` to version control
- Hashes are deterministic for the same input and salt

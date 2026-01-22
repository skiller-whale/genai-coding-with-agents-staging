# Claude Project Rules

This file contains important rules and guidelines for working on this project. **This file must be updated whenever significant changes are made to the project.**

## Development Rules

### Testing
- **Run tests at appropriate points**: Tests must be run after implementing new features, fixing bugs, or making significant changes to existing code
- Before committing changes, ensure all tests pass
- When adding new functionality, write corresponding tests first or immediately after implementation
- Test suite locations:
  - Backend: `backend/tests/`
  - Frontend: `frontend/__tests__/`

### Commits
- **Create commits at appropriate points**: Commits should be made after completing logical units of work
- Commit after:
  - Implementing a new feature
  - Fixing a bug
  - Completing a refactoring task
  - Adding or updating tests
  - Updating documentation
- Each commit should represent a working state of the code
- Use descriptive commit messages that explain what was changed and why

### Server Configuration
- **Backend**: Must listen on `0.0.0.0:6000`
- **Frontend**: Must listen on `0.0.0.0:5000`
- These ports are configured in environment variables and should not be changed without updating this file

### Documentation
- **Update CLAUDE.md**: This file must be updated whenever:
  - New features are added
  - Architecture changes are made
  - New rules or conventions are established
  - Dependencies or tooling changes
  - Server configurations are modified

## Project Structure

```
app/
├── backend/                      # Bun-based API server
│   ├── src/
│   │   ├── server.ts            # Main server entry point
│   │   ├── config/
│   │   │   └── index.ts         # Configuration loader (with CORS support)
│   │   ├── middleware/
│   │   │   ├── cors.ts          # CORS middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── jsonResponse.ts
│   │   │   └── types.ts
│   │   ├── routes/
│   │   │   ├── index.ts         # Router with CORS integration
│   │   │   └── handlers/
│   │   │       ├── health.ts
│   │   │       ├── hashContent.ts
│   │   │       ├── storeContent.ts
│   │   │       └── retrieveContent.ts
│   │   ├── storage/
│   │   │   └── index.ts         # In-memory and file-based storage
│   │   └── hash.ts              # Hashing utility functions
│   ├── tests/
│   │   ├── server.test.ts
│   │   ├── hash.test.ts
│   │   └── storage.test.ts
│   └── package.json
├── frontend/                     # Vite-based frontend application
│   ├── src/
│   │   ├── main.ts              # Application entry point and routing
│   │   ├── api/
│   │   │   └── client.ts        # Type-safe API client
│   │   ├── components/
│   │   │   ├── HashGenerator.ts
│   │   │   ├── ContentStorage.ts
│   │   │   └── ContentView.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   └── clipboard.ts
│   │   └── styles/
│   │       ├── main.css
│   │       └── components.css
│   ├── public/
│   │   └── index.html
│   ├── __tests__/
│   │   ├── api.test.ts
│   │   └── validators.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
└── CLAUDE.md                    # This file
```

## Current Features

### Backend API
- **Hash Endpoint** (`POST /hash`): Accepts JSON objects and returns a SHA-256 hash with secret salt
- **Content Storage** (`POST /content`): Stores text content and returns a URL with content hash
- **Content Retrieval** (`GET /content/:hash`): Retrieves stored content by hash
- **Health Check** (`GET /health`): Returns server status
- **CORS Support**: Configurable CORS headers for cross-origin requests
- Environment-based configuration for secret salt, port, and CORS origin
- In-memory and file-based storage options
- Comprehensive test coverage

### Frontend Application
- **Hash Generator**: Interactive UI for generating SHA-256 hashes from JSON objects
  - JSON validation with error messages
  - Example data loader
  - Copy-to-clipboard functionality
  - Keyboard shortcuts (Ctrl/Cmd+Enter)
- **Content Storage**: Store text content and get shareable URLs
  - Content input with validation
  - URL generation with copy and view links
  - Recent content history (localStorage)
- **Content View**: Display stored content by hash
  - Hash validation
  - Error handling for not-found content
  - Clean content display with metadata
- **Hash-based Routing**: Client-side routing for different views
  - `/hash` - Hash Generator
  - `/content` - Content Storage
  - `/view/:hash` - Content View
- **Responsive Design**: Mobile-first CSS with desktop layout
- **Type-Safe API Client**: Fully typed API integration with error handling

## Technology Stack

### Backend
- **Runtime**: Bun
- **Language**: TypeScript
- **Testing**: Bun's built-in test runner
- **Hashing**: Node.js crypto module (SHA-256)
- **Storage**: In-memory and JSON file-based storage

### Frontend
- **Framework**: Vanilla TypeScript (zero runtime dependencies)
- **Build Tool**: Vite (fast dev server with HMR)
- **Testing**: Vitest with happy-dom
- **Styling**: Custom CSS with modern features (Grid, Flexbox, CSS Custom Properties)
- **Language**: TypeScript (strict mode)

## Environment Variables

### Backend
- `SECRET_SALT`: Secret salt for hashing (default: "default-secret-salt")
- `PORT`: Server port (default: 6000)
- `HOST`: Server host (default: 0.0.0.0)
- `CORS_ORIGIN`: CORS allowed origin (default: "*" for development)
- `STORAGE_TYPE`: Storage type - "memory" or "file" (default: "memory")
- `STORAGE_FILE`: Path to JSON storage file (default: "./data/storage.json")

### Frontend
- No environment variables required (uses proxy in development)

## Development Workflow

### Running the Application

**Backend server:**
```bash
cd backend
bun run dev
```
Access at: http://localhost:6000

**Frontend development server:**
```bash
cd frontend
bun install  # First time only
bun run dev
```
Access at: http://localhost:5000

**Running both servers simultaneously:**
Open two terminal windows and run each command in its own terminal.

### Testing

**Backend tests:**
```bash
cd backend
bun test                      # Run all tests
bun test tests/hash.test.ts   # Run specific test file
```

**Frontend tests:**
```bash
cd frontend
bun test
```

### Building for Production

**Backend:**
Backend runs directly with Bun, no build step required.

**Frontend:**
```bash
cd frontend
bun run build      # Creates optimized production build in dist/
bun run preview    # Preview production build locally
```

## Security Considerations

### Backend
- Never commit `.env` files with actual secrets
- Change `SECRET_SALT` in production environments
- Configure `CORS_ORIGIN` to specific domain in production (not wildcard)
- Hashes are deterministic for the same input and salt combination
- Content stored in memory is lost on server restart (use file storage for persistence)

### Frontend
- Uses `textContent` (not `innerHTML`) to prevent XSS attacks
- Validates JSON and hash formats before API calls
- No sensitive data stored in localStorage (only content hashes)
- All user content is sanitized before display

## API Reference

### Backend Endpoints

**GET /health**
- Returns: `{ status: "ok" }`
- Purpose: Health check endpoint

**POST /hash**
- Body: `{ [key: string]: any }` (any valid JSON object)
- Returns: `{ hash: "64-char-hex-string" }`
- Purpose: Generate SHA-256 hash of JSON object

**POST /content**
- Body: `{ text: string }`
- Returns: `{ url: "/content/{hash}" }`
- Purpose: Store text content and get shareable URL

**GET /content/:hash**
- Param: `hash` (64 hexadecimal characters)
- Returns: Plain text content
- Purpose: Retrieve stored content by hash

---

**Last Updated**: Frontend implementation complete with Hash Generator, Content Storage, and Content View features

# Claude Project Rules

This file contains important rules and guidelines for working on this project. **This file must be updated whenever significant changes are made to the project.**

## Development Rules

### Testing
- **Run tests at appropriate points**: Tests must be run after implementing new features, fixing bugs, or making significant changes to existing code
- Before committing changes, ensure all tests pass
- When adding new functionality, write corresponding tests first or immediately after implementation
- Test suite location: `backend/tests/`

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
├── backend/              # Bun-based API server
│   ├── src/
│   │   ├── server.ts    # Main server and routes
│   │   └── hash.ts      # Hashing utility functions
│   ├── tests/
│   │   ├── server.test.ts
│   │   └── hash.test.ts
│   └── package.json
├── frontend/            # (Future) Frontend application
└── CLAUDE.md           # This file
```

## Current Features

### Backend API
- **Hash Endpoint** (`POST /hash`): Accepts JSON objects and returns a SHA-256 hash with secret salt
- **Health Check** (`GET /health`): Returns server status
- Environment-based configuration for secret salt and port
- Comprehensive test coverage

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Testing**: Bun's built-in test runner
- **Hashing**: Node.js crypto module (SHA-256)

## Environment Variables

Backend requires:
- `SECRET_SALT`: Secret salt for hashing (default: "default-secret-salt-change-in-production")
- `PORT`: Server port (default: 6000)
- `HOST`: Server host (default: 0.0.0.0)

## Security Considerations

- Never commit `.env` files with actual secrets
- Change `SECRET_SALT` in production environments
- Hashes are deterministic for the same input and salt combination

---

**Last Updated**: Initial setup - Backend API with hashing endpoint implemented

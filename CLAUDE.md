# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NoteSnap is a React-based web application that provides AI-powered file summarization functionality. Users can upload text files, images, or PDFs, and the application uses Google Gemini API to generate detailed summaries in Korean.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server (Vite dev server)
pnpm dev

# Build for production (TypeScript compilation + Vite build)
pnpm build

# Run linter
pnpm lint

# Preview production build
pnpm preview

# Build and deploy to Firebase Hosting
pnpm deploy
```

## Architecture

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (using @tailwindcss/vite plugin)
- **AI Service**: Google Gemini API (gemini-1.5-flash model)
- **Deployment**: Firebase Hosting (deployed to notesnap-6966c.web.app)

### Project Structure

The codebase follows a feature-based architecture:

```
src/
├── pages/           # Page-level components
│   └── NoteSnap/    # Main application page component
├── features/        # Feature modules organized by domain
│   └── summary/     # File summarization feature
│       ├── lib/     # Utility functions (fileUtils for file type detection and encoding)
│       └── ui/      # UI components (FileUploader, SummaryResult, etc.)
├── services/        # External API integrations
│   └── gemini.ts    # Google Gemini API client and summarization logic
├── assets/          # Static assets
└── main.tsx         # Application entry point
```

### Key Architecture Decisions

**Feature-Based Organization**: Code is organized by feature rather than by type. The `summary` feature contains all related logic (file validation, summarization algorithm) and UI components in one place.

**Path Aliases**: The codebase uses `@/*` as an alias for `src/*` to enable clean imports. This is configured in both `tsconfig.json` and `vite.config.ts`.

**AI-Powered Summarization**: The application uses Google Gemini API for intelligent summarization:
- Gemini 1.5 Flash model for fast, cost-effective processing
- Client-side API calls (no backend required)
- Supports multiple file types: text, images (Vision), and PDFs
- Generates detailed, multi-paragraph summaries in Korean
- No file storage - all processing happens in-memory

**Component Composition**: The NoteSnap page component (`src/pages/NoteSnap/NoteSnap.tsx`) orchestrates the file upload flow and state management, while delegating rendering to smaller UI components (FileUploader, SummaryResult, ErrorMessage, ResetButton).

### State Management

The application uses React's built-in `useState` hooks for state management. The main state is managed in `src/pages/NoteSnap/NoteSnap.tsx`:
- `selectedFile`: Currently selected file
- `summary`: Generated summary text
- `isProcessing`: Loading state during file processing
- `error`: Error messages

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- Path aliases configured for `@/*` imports

### Supported File Types

Files are processed in `src/services/gemini.ts` with different strategies:

**Text Files** (read directly):
- Plain text (.txt)
- Markdown (.md)
- JSON (.json)
- JavaScript/TypeScript (.js, .ts)
- HTML/CSS (.html, .css)
- CSV/XML (.csv, .xml)

**Images** (Gemini Vision API):
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Documents**:
- PDF (.pdf)

## Environment Variables

The application requires a Google Gemini API key to function:

```bash
# .env file (not committed to git)
VITE_GEMINI_API_KEY=your_api_key_here
```

**Getting an API Key**:
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create a new API key
4. Copy the key to `.env` file

**Important**: The `.env` file is gitignored to prevent exposing the API key. Use `.env.example` as a template.

## Firebase Deployment

The application is deployed to Firebase Hosting:
- Production build output: `dist/`
- Configured as a single-page application (all routes redirect to `/index.html`)
- Deploy command: `pnpm deploy` (builds and deploys in one step)
- **Note**: Environment variables must be set in your deployment environment for production

# sliceAI

A small React + TypeScript frontend scaffold (Vite) for experimenting with AI-related UI and services.

This repository contains a minimal app structure to build AI-powered interfaces, with clear places to add components, services, and utilities.

## Features
- React + TypeScript app (Vite)
- Organized folders for components, services, and utils
- Main application in App.tsx ready for AI integration
- Shared types in types.ts and project metadata in metadata.json

## Tech
- React
- TypeScript
- Vite

## Quickstart

1. Clone
   git clone https://github.com/zbailey83/sliceAI.git
   cd sliceAI

2. Install dependencies
   npm install
   # or
   yarn

3. Run in dev mode
   npm run dev
   # or
   yarn dev

4. Build for production
   npm run build
   # or
   yarn build

5. Preview production build
   npm run preview
   # or
   yarn preview

(If your package.json uses different script names, replace the commands above with those scripts.)

## Project structure (important files)
- App.tsx — main application UI and entry for app logic.
- index.tsx — React entry point.
- index.html — Vite HTML template.
- components/ — React UI components (place UI here).
- services/ — API / backend integration code (AI calls, fetchers).
- utils/ — helper utilities and shared functions.
- types.ts — shared TypeScript types used across the app.
- metadata.json — project metadata (used by app or build pipelines).
- package.json, tsconfig.json, vite.config.ts — project config.

## Environment / Secrets
If the app integrates with AI APIs, add required keys as environment variables. Example (Vite):

- Create a .env.local with:
  VITE_OPENAI_API_KEY=your_api_key_here

Ensure you never commit secrets to the repo.

## Development notes & recommendations
- Keep network/API logic in services/ to isolate side effects.
- Add components to components/ and prefer small, testable pieces.
- Add types to types.ts when shared across files.
- Add unit tests (Vitest/Jest) and CI (GitHub Actions) as next steps.

## Contributing
- Open an issue to discuss major changes.
- Create a branch per feature/fix: git checkout -b feat/your-feature
- Submit a PR with a clear description and tests where applicable.

## License
No license specified — add a LICENSE file if you want to apply a license (e.g., MIT).

---

This README was generated and pushed by GitHub Copilot Chat Assistant per request.

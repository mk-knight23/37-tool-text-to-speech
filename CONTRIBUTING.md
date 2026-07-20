# Contributing to MK VoiceKit

Thank you for your interest in contributing to **MK VoiceKit**! As a privacy-first, local-first voice workspace, we welcome improvements to our voice features, document readers, parser performance, and user experience.

---

## Code of Conduct

Please be respectful, professional, and patient in all interactions. Our goal is to maintain a constructive and helpful environment for developers, students, educators, and accessibility users alike.

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm (package manager)

### Quick Start

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the local development server:
   ```bash
   pnpm dev
   ```
4. Access the app at `http://localhost:3000`.

---

## Architectural Principles

1. **Local-First by Default**: Features should run client-side in the browser wherever technically possible.
2. **Privacy First**: User text, transcripts, and document files must stay local in the browser's IndexedDB and never be uploaded to a server without direct user action.
3. **Graceful Degradation**: Optional AI features should handle missing provider API keys cleanly, showing informative degraded states in the UI rather than breaking the application.
4. **Strict TypeScript & Formatting**: Keep TypeScript strict, and ensure all code compiles with no lint or type warnings.

---

## Pull Request Guidelines

Before submitting a Pull Request, please ensure:

- All TypeScript type checks pass:
  ```bash
  pnpm typecheck
  ```
- The ESLint linter runs with no errors or warnings:
  ```bash
  pnpm lint
  ```
- All unit and integration tests pass successfully:
  ```bash
  pnpm test
  ```
- All Playwright end-to-end tests pass successfully:
  ```bash
  pnpm test:e2e
  ```
- Next.js builds successfully:
  ```bash
  pnpm build
  ```

Thank you for helping us make MK VoiceKit better!

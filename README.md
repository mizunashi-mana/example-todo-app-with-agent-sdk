# example-todo-app-with-agent-sdk

A natural language TODO task management app powered by Ollama and an Agent SDK.

## What

A sample project that demonstrates how to build a TODO application where users can manage tasks through natural language conversation with a locally-running AI agent via Ollama. Features a 2-column layout with a TODO list as the main panel and an AI chat sidebar.

## Why

- Learn how to integrate Agent SDKs with Ollama for local LLM-powered applications
- Explore agent-driven application patterns without cloud API dependencies
- Production-quality sample with linting, testing, and CI

## Tech Stack

- **Agent SDK**: Vercel AI SDK v6 (`ai` + `ai-sdk-ollama`)
- **Backend**: Hono (Node.js)
- **Frontend**: React 19 + Vite 7
- **Dev Environment**: devenv (Nix) + direnv
- **Testing**: vitest
- **CI**: GitHub Actions

## Quick Start

### Prerequisites

- [devenv](https://devenv.sh/)
- [direnv](https://direnv.net/)
- [Ollama](https://ollama.ai/) with a model installed (e.g., `ollama pull gemma3`)

### Setup

```bash
git clone <repository-url>
cd example-todo-app-with-agent-sdk
direnv allow
npm install
```

### Run

```bash
# Start Ollama (in a separate terminal)
ollama serve

# Start dev server (backend + frontend)
npm run dev
```

The TODO app will be available at `http://localhost:5173` (Vite dev server proxying to the backend on port 3000).

## License

Licensed under Apache License, Version 2.0 or Mozilla Public License, Version 2.0, at your option.

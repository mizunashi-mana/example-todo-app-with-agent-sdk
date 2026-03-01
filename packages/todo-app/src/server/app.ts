import { Hono } from 'hono';
import { AgentError, createTodoAgent, type AgentOptions, type ChatMessage, type ChatOptions } from '#agent';
import { errorResponse } from './errors.js';
import type { TodoStorage } from '#storage';

export type AppOptions = AgentOptions;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;
  return (value.role === 'user' || value.role === 'assistant')
    && typeof value.content === 'string'
    && value.content.trim() !== '';
}

export function createApp(storage: TodoStorage, options?: AppOptions) {
  const agent = createTodoAgent(storage, options);
  const app = new Hono();

  // --- TODO REST API ---

  app.get('/api/todos', (c) => {
    const todos = storage.getAll();
    return c.json({ todos });
  });

  app.post('/api/todos', async (c) => {
    let body;
    try {
      body = await c.req.json<{ title?: string; description?: string }>();
    }
    catch {
      return errorResponse(c, 400, 'INVALID_JSON', 'Request body must be valid JSON');
    }

    const { title } = body;
    if (typeof title !== 'string' || title.trim() === '') {
      return errorResponse(c, 400, 'VALIDATION_ERROR', 'title is required');
    }

    const description = typeof body.description === 'string' ? body.description : undefined;
    const todo = storage.create({ title: title.trim(), description });
    return c.json(todo, 201);
  });

  app.put('/api/todos/:id', async (c) => {
    const id = c.req.param('id');
    let body;
    try {
      body = await c.req.json<{
        title?: string;
        description?: string;
        status?: string;
      }>();
    }
    catch {
      return errorResponse(c, 400, 'INVALID_JSON', 'Request body must be valid JSON');
    }

    const params: Record<string, string | undefined> = {};
    if (typeof body.title === 'string') {
      if (body.title.trim() === '') {
        return errorResponse(c, 400, 'VALIDATION_ERROR', 'title must not be empty');
      }
      params.title = body.title.trim();
    }
    if (typeof body.description === 'string') params.description = body.description;
    if (body.status === 'pending' || body.status === 'completed') params.status = body.status;

    const updated = storage.update(id, params);
    if (!updated) {
      return errorResponse(c, 404, 'NOT_FOUND', `TODO with id ${id} not found`);
    }
    return c.json(updated);
  });

  app.delete('/api/todos/:id', (c) => {
    const id = c.req.param('id');
    const deleted = storage.delete(id);
    if (!deleted) {
      return errorResponse(c, 404, 'NOT_FOUND', `TODO with id ${id} not found`);
    }
    return c.json({ success: true });
  });

  // --- Models API ---

  app.get('/api/models', async (c) => {
    const ollamaHost = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
    try {
      const res = await fetch(`${ollamaHost}/api/tags`);
      const data: unknown = await res.json();
      const modelsArray = isRecord(data) && Array.isArray(data.models) ? data.models : [];
      const models = modelsArray
        .filter((m): m is Record<string, unknown> => isRecord(m) && typeof m.name === 'string')
        .map(m => ({ name: String(m.name) }));
      return c.json({ models });
    }
    catch {
      return errorResponse(c, 502, 'OLLAMA_CONNECTION_ERROR', 'Cannot connect to Ollama to list models');
    }
  });

  // --- Chat API ---

  app.post('/api/chat', async (c) => {
    let body: { messages?: unknown; model?: unknown };
    try {
      body = await c.req.json<{ messages?: unknown; model?: unknown }>();
    }
    catch {
      return errorResponse(c, 400, 'INVALID_JSON', 'Request body must be valid JSON');
    }
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return errorResponse(c, 400, 'VALIDATION_ERROR', 'messages array is required and must not be empty');
    }

    const validatedMessages: ChatMessage[] = [];
    for (const msg of messages) {
      if (!isChatMessage(msg)) {
        return errorResponse(
          c, 400, 'VALIDATION_ERROR',
          'Each message must have role ("user" or "assistant") and a non-empty content string',
        );
      }
      validatedMessages.push(msg);
    }

    const chatOptions: ChatOptions = {};
    if (typeof body.model === 'string' && body.model.trim() !== '') {
      chatOptions.model = body.model.trim();
    }

    try {
      const response = await agent.chat(validatedMessages, chatOptions);
      return c.json({ role: 'assistant', content: response });
    }
    catch (e) {
      if (e instanceof AgentError) {
        const status = e.code === 'OLLAMA_CONNECTION_ERROR' ? 502 : 500;
        return errorResponse(c, status, e.code, e.message);
      }
      const message = e instanceof Error ? e.message : 'Unknown error';
      return errorResponse(c, 500, 'INTERNAL_ERROR', message);
    }
  });

  return app;
}

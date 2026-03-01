import { Hono } from 'hono';
import { createTodoAgent, type AgentOptions, type ChatMessage } from '#agent';
import type { TodoStorage } from '#storage';

export type AppOptions = AgentOptions;

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
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const { title } = body;
    if (typeof title !== 'string' || title.trim() === '') {
      return c.json({ error: 'title is required' }, 400);
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
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const params: Record<string, string | undefined> = {};
    if (typeof body.title === 'string') {
      if (body.title.trim() === '') {
        return c.json({ error: 'title must not be empty' }, 400);
      }
      params.title = body.title.trim();
    }
    if (typeof body.description === 'string') params.description = body.description;
    if (body.status === 'pending' || body.status === 'completed') params.status = body.status;

    const updated = storage.update(id, params);
    if (!updated) {
      return c.json({ error: `TODO with id ${id} not found` }, 404);
    }
    return c.json(updated);
  });

  app.delete('/api/todos/:id', (c) => {
    const id = c.req.param('id');
    const deleted = storage.delete(id);
    if (!deleted) {
      return c.json({ error: `TODO with id ${id} not found` }, 404);
    }
    return c.json({ success: true });
  });

  // --- Chat API ---

  app.post('/api/chat', async (c) => {
    let body;
    try {
      body = await c.req.json<{ messages: ChatMessage[] }>();
    }
    catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: 'messages array is required' }, 400);
    }

    try {
      const response = await agent.chat(messages);
      return c.json({ role: 'assistant', content: response });
    }
    catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      return c.json({ error: `Agent error: ${message}` }, 500);
    }
  });

  return app;
}

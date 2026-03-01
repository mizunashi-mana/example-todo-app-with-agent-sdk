import { Hono } from 'hono';
import { createTodoAgent, type AgentOptions, type ChatMessage } from '#agent';
import type { TodoStorage } from '#storage';

export type AppOptions = AgentOptions;

export function createApp(storage: TodoStorage, options?: AppOptions) {
  const agent = createTodoAgent(storage, options);
  const app = new Hono();

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

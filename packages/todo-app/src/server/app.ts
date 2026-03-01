import { Hono } from 'hono';
import { createTodoAgent, type AgentOptions, type ChatMessage } from '#agent';
import type { TodoStorage } from '#storage';

export type AppOptions = AgentOptions;

export function createApp(storage: TodoStorage, options?: AppOptions) {
  const agent = createTodoAgent(storage, options);
  const app = new Hono();

  app.post('/api/chat', async (c) => {
    const body = await c.req.json<{ messages: ChatMessage[] }>();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: 'messages array is required' }, 400);
    }

    const response = await agent.chat(messages);
    return c.json({ role: 'assistant', content: response });
  });

  return app;
}

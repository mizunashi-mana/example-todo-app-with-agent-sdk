import { serve } from '@hono/node-server';
import { createApp } from './server/app.js';
import { InMemoryTodoStorage } from './storage/index.js';

const storage = new InMemoryTodoStorage();
const app = createApp(storage, {
  model: process.env.OLLAMA_MODEL ?? 'gemma3',
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TODO app server running on http://localhost:${info.port}`);
});

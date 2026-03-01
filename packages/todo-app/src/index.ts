export const APP_NAME = 'example-todo-app';

export {
  createTodo,
  todoIdSchema,
  todoSchema,
  todoStatusSchema,
  type CreateTodoParams,
  type Todo,
  type TodoId,
  type TodoStatus,
} from './models/index.js';

export { InMemoryTodoStorage, type TodoStorage } from './storage/index.js';

export { createTodoTools } from './tools/index.js';

export {
  createTodoAgent,
  type AgentOptions,
  type ChatMessage,
} from './agent/index.js';

export { createApp, type AppOptions } from './server/index.js';

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

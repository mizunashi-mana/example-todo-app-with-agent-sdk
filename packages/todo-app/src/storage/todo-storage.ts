import type { CreateTodoParams, Todo, TodoId } from '#models';

export interface TodoStorage {
  create: (params: CreateTodoParams) => Todo;
  getById: (id: TodoId) => Todo | undefined;
  getAll: () => Todo[];
  update: (
    id: TodoId,
    params: Partial<Pick<Todo, 'title' | 'description' | 'status'>>,
  ) => Todo | undefined;
  delete: (id: TodoId) => boolean;
}

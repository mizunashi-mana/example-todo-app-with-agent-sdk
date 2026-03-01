import type { Todo, TodoId } from '#models';

export interface TodoStorage {
  create: (params: { title: string; description?: string }) => Todo;
  getById: (id: TodoId) => Todo | undefined;
  getAll: () => Todo[];
  update: (
    id: TodoId,
    params: Partial<Pick<Todo, 'title' | 'description' | 'status'>>,
  ) => Todo | undefined;
  delete: (id: TodoId) => boolean;
}

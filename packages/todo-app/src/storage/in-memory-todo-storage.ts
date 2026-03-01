import { createTodo } from '#models';
import type { CreateTodoParams, Todo, TodoId } from '#models';
import type { TodoStorage } from './todo-storage.js';

export class InMemoryTodoStorage implements TodoStorage {
  private readonly todos = new Map<TodoId, Todo>();

  create(params: CreateTodoParams): Todo {
    const todo = createTodo(params);
    this.todos.set(todo.id, todo);
    return { ...todo };
  }

  getById(id: TodoId): Todo | undefined {
    const todo = this.todos.get(id);
    return todo ? { ...todo } : undefined;
  }

  getAll(): Todo[] {
    return [...this.todos.values()].map(todo => ({ ...todo }));
  }

  update(
    id: TodoId,
    params: Partial<Pick<Todo, 'title' | 'description' | 'status'>>,
  ): Todo | undefined {
    const existing = this.todos.get(id);
    if (!existing) return undefined;

    const updated: Todo = {
      ...existing,
      ...params,
      updatedAt: new Date(),
    };
    this.todos.set(id, updated);
    return { ...updated };
  }

  delete(id: TodoId): boolean {
    return this.todos.delete(id);
  }
}

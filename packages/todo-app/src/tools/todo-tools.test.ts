import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryTodoStorage } from '#storage';
import { createTodoTools } from './todo-tools.js';

type ToolExecuteOptions = { toolCallId: string; messages: [] };
const opts: ToolExecuteOptions = { toolCallId: 'test', messages: [] };

function assertExecute<T>(
  execute: ((...args: never[]) => T) | undefined,
): asserts execute is (...args: never[]) => T {
  if (execute === undefined) {
    throw new Error('execute is undefined');
  }
}

describe('createTodoTools', () => {
  let storage: InMemoryTodoStorage;
  let tools: ReturnType<typeof createTodoTools>;

  beforeEach(() => {
    storage = new InMemoryTodoStorage();
    tools = createTodoTools(storage);
  });

  describe('createTodo', () => {
    it('creates a todo with title', async () => {
      assertExecute(tools.createTodo.execute);
      const result = await tools.createTodo.execute(
        { title: 'Buy groceries' },
        opts,
      );

      expect(result).toMatchObject({
        title: 'Buy groceries',
        status: 'pending',
      });
      expect(result).toHaveProperty('id');
    });

    it('creates a todo with title and description', async () => {
      assertExecute(tools.createTodo.execute);
      const result = await tools.createTodo.execute(
        { title: 'Buy groceries', description: 'Milk and eggs' },
        opts,
      );

      expect(result).toMatchObject({
        title: 'Buy groceries',
        description: 'Milk and eggs',
      });
    });

    it('persists the todo in storage', async () => {
      assertExecute(tools.createTodo.execute);
      const result = await tools.createTodo.execute(
        { title: 'Test' },
        opts,
      );

      const created = result as { id: string };
      expect(storage.getById(created.id)).toBeDefined();
    });
  });

  describe('listTodos', () => {
    it('returns empty list when no todos exist', async () => {
      assertExecute(tools.listTodos.execute);
      const result = await tools.listTodos.execute({}, opts);

      expect(result).toEqual({ todos: [] });
    });

    it('returns all todos', async () => {
      storage.create({ title: 'Task 1' });
      storage.create({ title: 'Task 2' });

      assertExecute(tools.listTodos.execute);
      const result = await tools.listTodos.execute({}, opts);

      const { todos } = result as { todos: Array<{ title: string }> };
      expect(todos).toHaveLength(2);
      expect(todos.map(t => t.title)).toEqual(
        expect.arrayContaining(['Task 1', 'Task 2']),
      );
    });
  });

  describe('updateTodo', () => {
    it('updates the title', async () => {
      const todo = storage.create({ title: 'Old title' });

      assertExecute(tools.updateTodo.execute);
      const result = await tools.updateTodo.execute(
        { id: todo.id, title: 'New title' },
        opts,
      );

      expect(result).toMatchObject({ title: 'New title' });
    });

    it('updates the status to completed', async () => {
      const todo = storage.create({ title: 'Test' });

      assertExecute(tools.updateTodo.execute);
      const result = await tools.updateTodo.execute(
        { id: todo.id, status: 'completed' },
        opts,
      );

      expect(result).toMatchObject({ status: 'completed' });
    });

    it('returns error for non-existent id', async () => {
      assertExecute(tools.updateTodo.execute);
      const result = await tools.updateTodo.execute(
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Updated',
        },
        opts,
      );

      expect(result).toMatchObject({
        error: expect.stringContaining('not found'),
      });
    });
  });

  describe('deleteTodo', () => {
    it('deletes an existing todo', async () => {
      const todo = storage.create({ title: 'Test' });

      assertExecute(tools.deleteTodo.execute);
      const result = await tools.deleteTodo.execute(
        { id: todo.id },
        opts,
      );

      expect(result).toMatchObject({ success: true });
      expect(storage.getById(todo.id)).toBeUndefined();
    });

    it('returns error for non-existent id', async () => {
      assertExecute(tools.deleteTodo.execute);
      const result = await tools.deleteTodo.execute(
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        opts,
      );

      expect(result).toMatchObject({
        error: expect.stringContaining('not found'),
      });
    });
  });
});

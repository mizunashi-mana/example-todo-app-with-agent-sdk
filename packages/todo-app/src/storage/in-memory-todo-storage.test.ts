import { describe, expect, it, beforeEach } from 'vitest';
import { InMemoryTodoStorage } from './in-memory-todo-storage.js';

describe('InMemoryTodoStorage', () => {
  let storage: InMemoryTodoStorage;

  beforeEach(() => {
    storage = new InMemoryTodoStorage();
  });

  describe('create', () => {
    it('creates a todo with title', () => {
      const todo = storage.create({ title: 'Buy groceries' });

      expect(todo.title).toBe('Buy groceries');
      expect(todo.status).toBe('pending');
      expect(todo.description).toBeUndefined();
    });

    it('creates a todo with title and description', () => {
      const todo = storage.create({
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
      });

      expect(todo.title).toBe('Buy groceries');
      expect(todo.description).toBe('Milk, eggs, bread');
    });

    it('stores the created todo', () => {
      const todo = storage.create({ title: 'Test' });
      const retrieved = storage.getById(todo.id);

      expect(retrieved).toEqual(todo);
    });
  });

  describe('getById', () => {
    it('returns the todo when found', () => {
      const todo = storage.create({ title: 'Test' });

      expect(storage.getById(todo.id)).toEqual(todo);
    });

    it('returns undefined for non-existent id', () => {
      expect(
        storage.getById('550e8400-e29b-41d4-a716-446655440000'),
      ).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('returns empty array when no todos exist', () => {
      expect(storage.getAll()).toEqual([]);
    });

    it('returns all todos', () => {
      const todo1 = storage.create({ title: 'Task 1' });
      const todo2 = storage.create({ title: 'Task 2' });

      const all = storage.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(todo1);
      expect(all).toContainEqual(todo2);
    });
  });

  describe('update', () => {
    it('updates the title', () => {
      const todo = storage.create({ title: 'Old title' });
      const updated = storage.update(todo.id, { title: 'New title' });

      expect(updated?.title).toBe('New title');
      expect(updated?.status).toBe('pending');
    });

    it('updates the status', () => {
      const todo = storage.create({ title: 'Test' });
      const updated = storage.update(todo.id, { status: 'completed' });

      expect(updated?.status).toBe('completed');
    });

    it('updates the description', () => {
      const todo = storage.create({ title: 'Test' });
      const updated = storage.update(todo.id, {
        description: 'Added description',
      });

      expect(updated?.description).toBe('Added description');
    });

    it('sets updatedAt to a new date', () => {
      const todo = storage.create({ title: 'Test' });
      const originalUpdatedAt = todo.updatedAt;

      const updated = storage.update(todo.id, { title: 'Updated' });

      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('persists the update', () => {
      const todo = storage.create({ title: 'Test' });
      storage.update(todo.id, { title: 'Updated' });

      expect(storage.getById(todo.id)?.title).toBe('Updated');
    });

    it('returns undefined for non-existent id', () => {
      expect(
        storage.update('550e8400-e29b-41d4-a716-446655440000', {
          title: 'Test',
        }),
      ).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('deletes an existing todo', () => {
      const todo = storage.create({ title: 'Test' });

      expect(storage.delete(todo.id)).toBe(true);
      expect(storage.getById(todo.id)).toBeUndefined();
    });

    it('returns false for non-existent id', () => {
      expect(
        storage.delete('550e8400-e29b-41d4-a716-446655440000'),
      ).toBe(false);
    });

    it('removes todo from getAll results', () => {
      const todo = storage.create({ title: 'Test' });
      storage.delete(todo.id);

      expect(storage.getAll()).toEqual([]);
    });
  });
});

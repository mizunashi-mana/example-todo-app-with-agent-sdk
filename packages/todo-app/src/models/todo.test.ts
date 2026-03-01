import { describe, expect, it } from 'vitest';
import { createTodo, todoSchema, todoStatusSchema } from './todo.js';

describe('todoStatusSchema', () => {
  it('accepts "pending"', () => {
    expect(todoStatusSchema.parse('pending')).toBe('pending');
  });

  it('accepts "completed"', () => {
    expect(todoStatusSchema.parse('completed')).toBe('completed');
  });

  it('rejects invalid status', () => {
    expect(() => todoStatusSchema.parse('invalid')).toThrow();
  });
});

describe('todoSchema', () => {
  it('validates a valid todo', () => {
    const todo = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Buy groceries',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(todoSchema.parse(todo)).toEqual(todo);
  });

  it('validates a todo with description', () => {
    const todo = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      status: 'completed' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(todoSchema.parse(todo)).toEqual(todo);
  });

  it('rejects empty title', () => {
    const todo = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: '',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(() => todoSchema.parse(todo)).toThrow();
  });

  it('rejects invalid UUID', () => {
    const todo = {
      id: 'not-a-uuid',
      title: 'Test',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(() => todoSchema.parse(todo)).toThrow();
  });
});

describe('createTodo', () => {
  it('creates a todo with title only', () => {
    const todo = createTodo({ title: 'Buy groceries' });

    expect(todo.title).toBe('Buy groceries');
    expect(todo.description).toBeUndefined();
    expect(todo.status).toBe('pending');
    expect(todo.id).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/,
    );
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
    expect(todo.createdAt).toEqual(todo.updatedAt);
  });

  it('creates a todo with description', () => {
    const todo = createTodo({
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
    });

    expect(todo.title).toBe('Buy groceries');
    expect(todo.description).toBe('Milk, eggs, bread');
  });

  it('creates a todo that passes schema validation', () => {
    const todo = createTodo({ title: 'Test task' });
    expect(() => todoSchema.parse(todo)).not.toThrow();
  });

  it('generates unique IDs', () => {
    const todo1 = createTodo({ title: 'Task 1' });
    const todo2 = createTodo({ title: 'Task 2' });
    expect(todo1.id).not.toBe(todo2.id);
  });
});

import { describe, expect, it } from 'vitest';
import { createTodoTools } from './todo-tools.js';

describe('createTodoTools', () => {
  const tools = createTodoTools();

  it('returns all expected tools', () => {
    expect(tools).toHaveProperty('addTodo');
    expect(tools).toHaveProperty('listTodos');
    expect(tools).toHaveProperty('editTodo');
    expect(tools).toHaveProperty('toggleTodoStatus');
    expect(tools).toHaveProperty('deleteTodo');
  });

  describe('addTodo', () => {
    it('has description and schemas, no execute', () => {
      expect(tools.addTodo.description).toContain('Add a new TODO');
      expect(tools.addTodo.inputSchema).toBeDefined();
      expect(tools.addTodo.outputSchema).toBeDefined();
      expect(tools.addTodo.execute).toBeUndefined();
    });
  });

  describe('listTodos', () => {
    it('has description and schemas, no execute', () => {
      expect(tools.listTodos.description).toContain('TODO list');
      expect(tools.listTodos.inputSchema).toBeDefined();
      expect(tools.listTodos.outputSchema).toBeDefined();
      expect(tools.listTodos.execute).toBeUndefined();
    });
  });

  describe('editTodo', () => {
    it('has description and schemas, no execute', () => {
      expect(tools.editTodo.description).toContain('Edit');
      expect(tools.editTodo.inputSchema).toBeDefined();
      expect(tools.editTodo.outputSchema).toBeDefined();
      expect(tools.editTodo.execute).toBeUndefined();
    });
  });

  describe('toggleTodoStatus', () => {
    it('has description and schemas, no execute', () => {
      expect(tools.toggleTodoStatus.description).toContain('Toggle');
      expect(tools.toggleTodoStatus.inputSchema).toBeDefined();
      expect(tools.toggleTodoStatus.outputSchema).toBeDefined();
      expect(tools.toggleTodoStatus.execute).toBeUndefined();
    });
  });

  describe('deleteTodo', () => {
    it('has description and schemas, no execute', () => {
      expect(tools.deleteTodo.description).toContain('Delete');
      expect(tools.deleteTodo.inputSchema).toBeDefined();
      expect(tools.deleteTodo.outputSchema).toBeDefined();
      expect(tools.deleteTodo.execute).toBeUndefined();
    });
  });
});

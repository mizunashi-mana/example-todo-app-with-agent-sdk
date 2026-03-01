import { tool } from 'ai';
import { z } from 'zod';
import type { TodoStorage } from '#storage';

export function createTodoTools(storage: TodoStorage) {
  const createTodo = tool({
    description: 'Create a new TODO item',
    inputSchema: z.object({
      title: z.string().describe('The title of the TODO item'),
      description: z
        .string()
        .optional()
        .describe('Optional description of the TODO item'),
    }),
    execute: async ({ title, description }) => {
      const todo = storage.create({ title, description });
      return {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        status: todo.status,
      };
    },
  });

  const listTodos = tool({
    description: 'List all TODO items',
    inputSchema: z.object({}),
    execute: async () => {
      const todos = storage.getAll();
      return { todos: todos.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
      })) };
    },
  });

  const updateTodo = tool({
    description: 'Update an existing TODO item by ID',
    inputSchema: z.object({
      id: z.uuid().describe('The ID of the TODO to update'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      status: z
        .enum(['pending', 'completed'])
        .optional()
        .describe('New status'),
    }),
    execute: async ({ id, ...params }) => {
      const updated = storage.update(id, params);
      if (!updated) {
        return { error: `TODO with id ${id} not found` };
      }
      return {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        status: updated.status,
      };
    },
  });

  const deleteTodo = tool({
    description: 'Delete a TODO item by ID',
    inputSchema: z.object({
      id: z.uuid().describe('The ID of the TODO to delete'),
    }),
    execute: async ({ id }) => {
      const deleted = storage.delete(id);
      if (!deleted) {
        return { error: `TODO with id ${id} not found` };
      }
      return { success: true, id };
    },
  });

  return { createTodo, listTodos, updateTodo, deleteTodo };
}

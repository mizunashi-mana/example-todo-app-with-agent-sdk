import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// --- Schemas ---

export const todoStatusSchema = z.enum(['pending', 'completed']);

export const todoIdSchema = z.uuid();

export const todoSchema = z.object({
  id: todoIdSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  status: todoStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// --- Types ---

export type TodoStatus = z.infer<typeof todoStatusSchema>;

export type TodoId = z.infer<typeof todoIdSchema>;

export type Todo = z.infer<typeof todoSchema>;

// --- Factory ---

export function createTodo(
  params: Pick<Todo, 'title'> & Partial<Pick<Todo, 'description'>>,
): Todo {
  const now = new Date();
  return {
    id: randomUUID(),
    title: params.title,
    description: params.description,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

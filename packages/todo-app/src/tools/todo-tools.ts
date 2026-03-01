import { tool } from 'ai';
import { z } from 'zod';

const todoOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']),
});

const todoListOutputSchema = z.object({
  todos: z.array(todoOutputSchema),
});

const todoUpdateOutputSchema = z.union([
  todoOutputSchema,
  z.object({ error: z.string() }),
]);

const todoDeleteOutputSchema = z.union([
  z.object({ success: z.literal(true), id: z.string() }),
  z.object({ error: z.string() }),
]);

export function createTodoTools() {
  const addTodo = tool({
    description: 'Add a new TODO item via the create form. Fills in the title and clicks the Add button on the UI.',
    inputSchema: z.object({
      title: z.string().describe('The title of the TODO item'),
      description: z.string().optional().describe('Optional description of the TODO item'),
    }),
    outputSchema: todoOutputSchema,
  });

  const listTodos = tool({
    description: 'View the current TODO list displayed on the screen.',
    inputSchema: z.object({}),
    outputSchema: todoListOutputSchema,
  });

  const editTodo = tool({
    description: 'Edit an existing TODO item. Clicks the Edit button, changes the title in the edit form, and clicks Save.',
    inputSchema: z.object({
      id: z.uuid().describe('The ID of the TODO to edit'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
    }),
    outputSchema: todoUpdateOutputSchema,
  });

  const toggleTodoStatus = tool({
    description: 'Toggle a TODO item status by clicking its checkbox. Switches between pending and completed.',
    inputSchema: z.object({
      id: z.uuid().describe('The ID of the TODO to toggle'),
    }),
    outputSchema: todoUpdateOutputSchema,
  });

  const deleteTodo = tool({
    description: 'Delete a TODO item by clicking its Delete button and confirming the deletion dialog.',
    inputSchema: z.object({
      id: z.uuid().describe('The ID of the TODO to delete'),
    }),
    outputSchema: todoDeleteOutputSchema,
  });

  return { addTodo, listTodos, editTodo, toggleTodoStatus, deleteTodo };
}

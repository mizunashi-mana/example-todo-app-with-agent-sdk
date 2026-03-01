import { useCallback } from 'react';

// --- Types ---

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
}

interface TodoResult {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
}

interface TodoDeleteResult {
  success: boolean;
  id: string;
}

export interface TodoListResult {
  todos: TodoResult[];
}

export type TodoErrorResult = { error: string };

export type TodoActionResult = TodoResult | TodoErrorResult;
export type DeleteActionResult = TodoDeleteResult | TodoErrorResult;

// --- Helpers ---

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;
  const error = data.error;
  if (isRecord(error) && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof data.error === 'string') return data.error;
  return undefined;
}

function isTodo(value: unknown): value is Todo {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && (value.status === 'pending' || value.status === 'completed');
}

// --- Animation helpers ---

const ANIMATION_DELAY = 400;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function highlightElement(el: Element | null, durationMs: number = ANIMATION_DELAY): Promise<void> {
  if (!el) return;
  el.classList.add('agent-highlight');
  await delay(durationMs);
  el.classList.remove('agent-highlight');
}

async function flashElement(el: Element | null, durationMs: number = ANIMATION_DELAY): Promise<void> {
  if (!el) return;
  el.classList.add('agent-flash');
  await delay(durationMs);
  el.classList.remove('agent-flash');
}

function toTodoResult(todo: Todo): TodoResult {
  return { id: todo.id, title: todo.title, description: todo.description, status: todo.status };
}

// --- Hook ---

interface AgentActionDeps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  createInputRef: React.RefObject<HTMLInputElement | null>;
  todos: Todo[];
  fetchTodos: () => Promise<Todo[]>;
  setNewTitle: (title: string) => void;
  setEditingId: (id: string | null) => void;
  setEditTitle: (title: string) => void;
  setError: (error: string | null) => void;
}

export function useTodoAgentActions(deps: AgentActionDeps) {
  const {
    panelRef, createInputRef, todos, fetchTodos,
    setNewTitle, setEditingId, setEditTitle, setError,
  } = deps;

  const animateAddTodo = useCallback(async (title: string, description?: string): Promise<TodoActionResult> => {
    const panel = panelRef.current;
    const input = createInputRef.current;

    if (input) {
      await highlightElement(input);
      setNewTitle(title);
      await delay(ANIMATION_DELAY);
    }

    const addBtn = panel?.querySelector('.todo-create-btn');
    if (addBtn) await highlightElement(addBtn);

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg = getErrorMessage(data) ?? 'Failed to create TODO';
        setError(msg);
        return { error: msg };
      }
      const created: unknown = await res.json();
      setNewTitle('');
      const fetched = await fetchTodos();

      if (isTodo(created)) {
        await delay(100);
        const newItem = panel?.querySelector(`[data-todo-id="${created.id}"]`);
        if (newItem) await flashElement(newItem);
        return toTodoResult(created);
      }

      const match = fetched.find(t => t.title === title);
      if (match) return toTodoResult(match);
      return { error: 'Created but could not find result' };
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create TODO';
      setError(msg);
      return { error: msg };
    }
  }, [panelRef, createInputRef, fetchTodos, setNewTitle, setError]);

  const animateToggleStatus = useCallback(async (id: string): Promise<TodoActionResult> => {
    const panel = panelRef.current;
    const todoEl = panel?.querySelector(`[data-todo-id="${id}"]`);
    const checkbox = todoEl?.querySelector('.todo-checkbox');

    if (todoEl) await highlightElement(todoEl);
    if (checkbox) await highlightElement(checkbox);

    const todo = todos.find(t => t.id === id);
    if (!todo) return { error: `TODO with id ${id} not found` };
    const newStatus = todo.status === 'pending' ? 'completed' : 'pending';

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg = getErrorMessage(data) ?? 'Failed to update TODO';
        setError(msg);
        return { error: msg };
      }
      const updated: unknown = await res.json();
      await fetchTodos();

      if (isTodo(updated)) return toTodoResult(updated);
      return { error: 'Updated but could not parse result' };
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update TODO';
      setError(msg);
      return { error: msg };
    }
  }, [panelRef, todos, fetchTodos, setError]);

  const animateEditTodo = useCallback(async (
    id: string,
    fields: { title?: string; description?: string },
  ): Promise<TodoActionResult> => {
    const panel = panelRef.current;
    const todoEl = panel?.querySelector(`[data-todo-id="${id}"]`);

    if (todoEl) await highlightElement(todoEl);
    const editBtn = todoEl?.querySelector('.todo-edit-btn');
    if (editBtn) await highlightElement(editBtn);

    setEditingId(id);
    if (fields.title !== undefined) setEditTitle(fields.title);
    await delay(ANIMATION_DELAY);

    await delay(100);
    const saveBtn = panel?.querySelector(`[data-todo-id="${id}"] .todo-save-btn`);
    if (saveBtn) await highlightElement(saveBtn);

    const updateBody: Record<string, string> = {};
    if (fields.title !== undefined) updateBody.title = fields.title;
    if (fields.description !== undefined) updateBody.description = fields.description;

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg = getErrorMessage(data) ?? 'Failed to update TODO';
        setError(msg);
        setEditingId(null);
        setEditTitle('');
        return { error: msg };
      }
      const updated: unknown = await res.json();
      setEditingId(null);
      setEditTitle('');
      await fetchTodos();

      await delay(100);
      const updatedEl = panel?.querySelector(`[data-todo-id="${id}"]`);
      if (updatedEl) await flashElement(updatedEl);

      if (isTodo(updated)) return toTodoResult(updated);
      return { error: 'Updated but could not parse result' };
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update TODO';
      setError(msg);
      setEditingId(null);
      setEditTitle('');
      return { error: msg };
    }
  }, [panelRef, fetchTodos, setEditingId, setEditTitle, setError]);

  const animateDeleteTodo = useCallback(async (id: string): Promise<DeleteActionResult> => {
    const panel = panelRef.current;
    const todoEl = panel?.querySelector(`[data-todo-id="${id}"]`);

    if (todoEl) await highlightElement(todoEl);
    const deleteBtn = todoEl?.querySelector('.todo-delete-btn');
    if (deleteBtn) await highlightElement(deleteBtn);

    if (todoEl) {
      todoEl.classList.add('agent-fade-out');
      await delay(ANIMATION_DELAY);
    }

    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg = getErrorMessage(data) ?? 'Failed to delete TODO';
        setError(msg);
        return { error: msg };
      }
      await fetchTodos();
      return { success: true, id };
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete TODO';
      setError(msg);
      return { error: msg };
    }
  }, [panelRef, fetchTodos, setError]);

  const animateListTodos = useCallback(async (): Promise<TodoListResult> => {
    const panel = panelRef.current;
    const listEl = panel?.querySelector('.todo-list');
    if (listEl) await highlightElement(listEl);

    const fetched = await fetchTodos();
    return { todos: fetched.map(toTodoResult) };
  }, [panelRef, fetchTodos]);

  return {
    animateAddTodo,
    animateToggleStatus,
    animateEditTodo,
    animateDeleteTodo,
    animateListTodos,
  };
}

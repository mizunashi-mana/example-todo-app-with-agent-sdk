import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  useTodoAgentActions,
  type DeleteActionResult,
  type TodoActionResult,
  type TodoListResult,
} from './useTodoAgentActions.js';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

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

function parseTodos(data: unknown): Todo[] {
  if (!isRecord(data) || !Array.isArray(data.todos)) return [];
  return data.todos.filter(isTodo);
}

export interface TodoPanelHandle {
  refresh: () => void;
  animateAddTodo: (title: string, description?: string) => Promise<TodoActionResult>;
  animateToggleStatus: (id: string) => Promise<TodoActionResult>;
  animateEditTodo: (id: string, fields: { title?: string; description?: string }) => Promise<TodoActionResult>;
  animateDeleteTodo: (id: string) => Promise<DeleteActionResult>;
  animateListTodos: () => Promise<TodoListResult>;
}

interface TodoPanelProps {
  ref?: React.Ref<TodoPanelHandle>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- React component
export function TodoPanel({ ref }: TodoPanelProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const fetchTodos = useCallback(async (): Promise<Todo[]> => {
    try {
      const res = await fetch('/api/todos');
      const data: unknown = await res.json();
      const fetched = parseTodos(data);
      setTodos(fetched);
      setError(null);
      return fetched;
    }
    catch {
      setError('Failed to load TODOs');
      return [];
    }
  }, []);

  const agentActions = useTodoAgentActions({
    panelRef, createInputRef, fetchTodos,
    setNewTitle, setEditingId, setEditTitle, setError,
  });

  useImperativeHandle(ref, () => ({
    refresh() { void fetchTodos(); },
    ...agentActions,
  }), [fetchTodos, agentActions]);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (editingId !== null) editInputRef.current?.focus();
  }, [editingId]);

  const handleCreate = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (title === '') return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(data) ?? 'Failed to create TODO');
      }
      setNewTitle('');
      void fetchTodos();
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create TODO');
    }
  }, [newTitle, fetchTodos]);

  const handleToggleStatus = useCallback(async (todo: Todo) => {
    const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(data) ?? 'Failed to update TODO');
      }
      void fetchTodos();
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update TODO');
    }
  }, [fetchTodos]);

  const handleStartEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditTitle('');
  }, []);

  const handleSaveEdit = useCallback(async (id: string) => {
    const title = editTitle.trim();
    if (title === '') return;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(data) ?? 'Failed to update TODO');
      }
      setEditingId(null);
      setEditTitle('');
      void fetchTodos();
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update TODO');
    }
  }, [editTitle, fetchTodos]);

  const handleDelete = useCallback(async (id: string) => {
    // eslint-disable-next-line no-alert -- intentional confirm dialog for destructive action
    if (!window.confirm('Are you sure you want to delete this TODO?')) return;
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(data) ?? 'Failed to delete TODO');
      }
      void fetchTodos();
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete TODO');
    }
  }, [fetchTodos]);

  const pendingTodos = todos.filter(t => t.status === 'pending');
  const completedTodos = todos.filter(t => t.status === 'completed');

  return (
    <div className="todo-panel" ref={panelRef}>
      <header className="todo-header">
        <h1>TODOs</h1>
        <span className="todo-count">
          {String(pendingTodos.length)}
          {' '}
          pending
        </span>
      </header>

      {error !== null && (
        <div className="todo-error">
          {error}
          <button type="button" className="todo-error-dismiss" onClick={() => { setError(null); }}>
            Dismiss
          </button>
        </div>
      )}

      <form className="todo-create-form" onSubmit={(e) => { void handleCreate(e); }}>
        <input
          ref={createInputRef}
          className="todo-create-input"
          type="text"
          value={newTitle}
          onChange={(e) => { setNewTitle(e.target.value); }}
          placeholder="Add a new TODO..."
        />
        <button className="todo-create-btn" type="submit" disabled={newTitle.trim() === ''}>
          Add
        </button>
      </form>

      <div className="todo-list">
        {pendingTodos.length === 0 && completedTodos.length === 0 && (
          <div className="todo-empty">No TODOs yet. Add one above or use the chat.</div>
        )}

        {pendingTodos.map(todo => (
          <div key={todo.id} className="todo-item" data-todo-id={todo.id}>
            <button
              type="button"
              className="todo-checkbox"
              onClick={() => { void handleToggleStatus(todo); }}
              aria-label="Mark as completed"
              disabled={editingId === todo.id}
            />
            {editingId === todo.id
              ? (
                  <form
                    className="todo-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSaveEdit(todo.id);
                    }}
                  >
                    <input
                      ref={editInputRef}
                      className="todo-edit-input"
                      type="text"
                      value={editTitle}
                      onChange={(e) => { setEditTitle(e.target.value); }}
                      onKeyDown={(e) => { if (e.key === 'Escape') handleCancelEdit(); }}
                    />
                    <button className="todo-action-btn todo-save-btn" type="submit" disabled={editTitle.trim() === ''}>Save</button>
                    <button className="todo-action-btn todo-cancel-btn" type="button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </form>
                )
              : (
                  <>
                    <span className="todo-title">{todo.title}</span>
                    <div className="todo-actions">
                      <button
                        className="todo-action-btn todo-edit-btn"
                        type="button"
                        onClick={() => { handleStartEdit(todo); }}
                      >
                        Edit
                      </button>
                      <button
                        className="todo-action-btn todo-delete-btn"
                        type="button"
                        onClick={() => { void handleDelete(todo.id); }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
          </div>
        ))}

        {completedTodos.length > 0 && (
          <>
            <div className="todo-section-label">Completed</div>
            {completedTodos.map(todo => (
              <div key={todo.id} className="todo-item todo-item-completed" data-todo-id={todo.id}>
                <button
                  type="button"
                  className="todo-checkbox todo-checkbox-checked"
                  onClick={() => { void handleToggleStatus(todo); }}
                  aria-label="Mark as pending"
                />
                <span className="todo-title todo-title-completed">{todo.title}</span>
                <div className="todo-actions">
                  <button
                    className="todo-action-btn todo-delete-btn"
                    type="button"
                    onClick={() => { void handleDelete(todo.id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

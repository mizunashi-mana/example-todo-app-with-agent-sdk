import { useCallback, useEffect, useRef, useState } from 'react';
import type { TodoPanelHandle } from './TodoPanel.js';

// --- API message types ---

interface TextApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolCallApiMessage {
  role: 'assistant';
  toolCalls: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
  }>;
}

interface ToolResultApiMessage {
  role: 'tool';
  toolResults: Array<{
    toolCallId: string;
    toolName: string;
    result: unknown;
  }>;
}

type ApiMessage = TextApiMessage | ToolCallApiMessage | ToolResultApiMessage;

interface ToolCallsResponse {
  type: 'tool_calls';
  toolCalls: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
  }>;
}

interface TextResponse {
  type: 'text';
  content: string;
  warning?: string;
}

type ChatApiResponse = ToolCallsResponse | TextResponse;

// --- Display message ---

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  variant?: 'warning';
}

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

function isChatApiResponse(data: unknown): data is ChatApiResponse {
  if (!isRecord(data)) return false;
  if (data.type === 'text' && typeof data.content === 'string') return true;
  if (data.type === 'tool_calls' && Array.isArray(data.toolCalls)) return true;
  return false;
}

interface OllamaModel {
  name: string;
}

// --- Tool execution ---

function getString(value: unknown): string {
  if (typeof value === 'string') return value;
  return '';
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

async function executeToolCall(
  todoPanel: TodoPanelHandle,
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case 'addTodo':
      return todoPanel.animateAddTodo(
        getString(args.title),
        getOptionalString(args.description),
      );
    case 'listTodos':
      return todoPanel.animateListTodos();
    case 'editTodo':
      return todoPanel.animateEditTodo(
        getString(args.id),
        {
          title: getOptionalString(args.title),
          description: getOptionalString(args.description),
        },
      );
    case 'toggleTodoStatus':
      return todoPanel.animateToggleStatus(getString(args.id));
    case 'deleteTodo':
      return todoPanel.animateDeleteTodo(getString(args.id));
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// --- Component ---

interface ChatPanelProps {
  todoPanelRef: React.RefObject<TodoPanelHandle | null>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- React component
export function ChatPanel({ todoPanelRef }: ChatPanelProps) {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API message history (includes tool call/result messages for LLM context)
  const apiMessagesRef = useRef<ApiMessage[]>([]);
  const inputRef = useRef<string>('');
  const loadingRef = useRef<boolean>(false);
  const selectedModelRef = useRef<string>('');
  const nextIdRef = useRef(0);

  function generateId(): string {
    nextIdRef.current += 1;
    return `msg-${String(nextIdRef.current)}`;
  }

  inputRef.current = input;
  loadingRef.current = loading;
  selectedModelRef.current = selectedModel;

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/models');
        const data: unknown = await res.json();
        const fetched = isRecord(data) && Array.isArray(data.models)
          ? (data.models as unknown[])
              .filter((m): m is Record<string, unknown> => isRecord(m) && typeof m.name === 'string')
              .map(m => ({ name: String(m.name) }))
          : [];
        setModels(fetched);
      }
      catch {
        // Ollama may not be running; ignore
      }
    }
    void fetchModels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const callChatApi = useCallback(async (messages: ApiMessage[]): Promise<ChatApiResponse> => {
    const body: Record<string, unknown> = { messages };
    if (selectedModelRef.current !== '') {
      body.model = selectedModelRef.current;
    }
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: unknown = await res.json();
    if (!res.ok) {
      throw new Error(getErrorMessage(data) ?? `HTTP ${String(res.status)}`);
    }
    if (!isChatApiResponse(data)) {
      throw new Error('Invalid response from chat API');
    }
    return data;
  }, []);

  const sendMessage = useCallback(async () => {
    const text = inputRef.current.trim();
    if (text === '' || loadingRef.current) {
      return;
    }

    const userMsg: TextApiMessage = { role: 'user', content: text };
    apiMessagesRef.current = [...apiMessagesRef.current, userMsg];

    setDisplayMessages(prev => [...prev, { id: generateId(), role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    let currentMessages = [...apiMessagesRef.current];
    try {
      let response = await callChatApi(currentMessages);

      // Tool execution loop
      const MAX_TOOL_ROUNDS = 10;
      let round = 0;
      while (response.type === 'tool_calls') {
        round += 1;
        if (round > MAX_TOOL_ROUNDS) {
          throw new Error('Too many tool execution rounds');
        }
        const { toolCalls } = response;

        // Add assistant tool call message to API history
        const toolCallMsg: ToolCallApiMessage = { role: 'assistant', toolCalls };
        currentMessages = [...currentMessages, toolCallMsg];

        // Show tool execution status
        const toolNames = toolCalls.map(tc => tc.toolName).join(', ');
        setDisplayMessages(prev => [
          ...prev,
          { id: generateId(), role: 'system', content: `実行中: ${toolNames}...` },
        ]);

        // Execute each tool call via TodoPanel
        const todoPanel = todoPanelRef.current;
        if (!todoPanel) {
          throw new Error('TodoPanel not available');
        }

        const toolResults: ToolResultApiMessage['toolResults'] = [];
        for (const tc of toolCalls) {
          const result = await executeToolCall(todoPanel, tc.toolName, tc.args);
          toolResults.push({
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            result,
          });
        }

        // Add tool results to API history
        const toolResultMsg: ToolResultApiMessage = { role: 'tool', toolResults };
        currentMessages = [...currentMessages, toolResultMsg];

        // Continue the conversation with tool results
        response = await callChatApi(currentMessages);
      }

      // Final text response
      apiMessagesRef.current = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
      ];
      setDisplayMessages(prev => [
        ...prev,
        { id: generateId(), role: 'assistant', content: response.content },
        ...(response.warning !== undefined
          ? [{ id: generateId(), role: 'system' as const, content: response.warning, variant: 'warning' as const }]
          : []),
      ]);
    }
    catch (err) {
      apiMessagesRef.current = currentMessages;
      const message = err instanceof Error ? err.message : 'Unknown error';
      setDisplayMessages(prev => [
        ...prev,
        { id: generateId(), role: 'assistant', content: `Error: ${message}` },
      ]);
    }
    finally {
      setLoading(false);
    }
  }, [callChatApi, todoPanelRef]);

  const handleSubmit = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    void sendMessage();
  }, [sendMessage]);

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <h2>チャット</h2>
        {models.length > 0 && (
          <select
            className="chat-model-select"
            value={selectedModel}
            onChange={(e) => { setSelectedModel(e.target.value); }}
            disabled={loading}
          >
            <option value="">デフォルト</option>
            {models.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        )}
      </header>
      <div className="chat-messages">
        {displayMessages.length === 0 && (
          <div className="chat-empty">
            メッセージを送って TODO を管理しましょう。
          </div>
        )}
        {displayMessages.map(msg => (
          <div key={msg.id} className={`chat-message chat-message-${msg.role}${msg.variant === 'warning' ? ' chat-message-warning' : ''}`}>
            <div className="chat-message-role">
              {msg.role === 'user' ? 'あなた' : msg.role === 'system' ? 'システム' : 'アシスタント'}
            </div>
            <div className="chat-message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-message-role">アシスタント</div>
            <div className="chat-message-content chat-loading">考え中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); }}
          placeholder="メッセージを入力..."
          disabled={loading}
        />
        <button className="chat-send" type="submit" disabled={loading || input.trim() === ''}>
          送信
        </button>
      </form>
    </div>
  );
}

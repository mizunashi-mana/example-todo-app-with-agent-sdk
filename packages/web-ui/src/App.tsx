import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringField(data: unknown, field: string): string | undefined {
  if (isRecord(data) && field in data) {
    const value = data[field];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- React component
export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (text === '' || loading) {
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        throw new Error(getStringField(data, 'error') ?? `HTTP ${String(res.status)}`);
      }

      const content = getStringField(data, 'content') ?? '(No response)';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${message}` },
      ]);
    }
    finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleSubmit = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    void sendMessage();
  }, [sendMessage]);

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>TODO Chat</h1>
      </header>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            Send a message to manage your TODOs.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            <div className="chat-message-role">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="chat-message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-message-role">Assistant</div>
            <div className="chat-message-content chat-loading">Thinking...</div>
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
          placeholder="Type a message..."
          disabled={loading}
        />
        <button className="chat-send" type="submit" disabled={loading || input.trim() === ''}>
          Send
        </button>
      </form>
    </div>
  );
}

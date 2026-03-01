import { useRef } from 'react';
import './App.css';
import { ChatPanel } from './ChatPanel.js';
import { TodoPanel, type TodoPanelHandle } from './TodoPanel.js';

// eslint-disable-next-line @typescript-eslint/naming-convention -- React component
export function App() {
  const todoPanelRef = useRef<TodoPanelHandle>(null);

  return (
    <div className="app-layout">
      <main className="app-main">
        <TodoPanel ref={todoPanelRef} />
      </main>
      <aside className="app-sidebar">
        <ChatPanel todoPanelRef={todoPanelRef} />
      </aside>
    </div>
  );
}

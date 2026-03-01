# LLM ツールを画面操作ベースに変更する

## Issue

https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/23

## 目的・ゴール

LLM エージェントのツールを、バックエンドの TodoStorage に対する直接 CRUD 操作から、フロントエンドの UI 操作ベースに変更する。ツール実行時に画面上で操作がアニメーション的に再現され、ユーザーがアプリの操作方法を視覚的に学べるようにする。

## 実装方針

### アプローチ: 完全 UI 駆動方式（フロントエンド主導のツールループ）

LLM のツール実行をフロントエンドが制御する。バックエンドはツール呼び出しの意図のみを返し、実際のデータ操作はフロントエンドが REST API 経由で行う。

#### フロー

```
1. ユーザーがチャットメッセージ送信
2. POST /api/chat → Backend: generateText(maxSteps=1, tools without execute)
3. LLM が tool_calls を返す場合:
   → Response: { type: 'tool_calls', toolCalls: [...], responseMessages: [...] }
   → Frontend: UI アニメーション実行（フォーム入力、ボタンクリック等）
   → Frontend: REST API 呼び出し（POST/PUT/DELETE /api/todos）
   → Frontend: ツール結果を messages に追加
   → POST /api/chat（フル message 履歴を送信、次のステップへ）
4. LLM がテキストを返す場合:
   → Response: { type: 'text', content: '...', responseMessages: [...] }
   → Frontend: メッセージ表示、完了
```

#### ツール定義変更

- `execute` 関数を削除し、`outputSchema` を定義（Vercel AI SDK の manual tool loop パターン）
- ツール名・説明を UI 操作ベースに変更:
  - `createTodo` → `addTodo`（TODO をフォームから追加）
  - `updateTodo` → `editTodo`（TODO のタイトル・説明を編集）/ `toggleTodoStatus`（ステータス切替）
  - `deleteTodo` → `deleteTodo`（TODO を削除）
  - `listTodos` → `listTodos`（一覧取得、UI 操作なし）

#### メッセージ形式の拡張

```typescript
// 拡張 ChatMessage 型
type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'assistant'; content: ToolCallPart[] }  // ツール呼び出し
  | { role: 'tool'; content: ToolResultPart[] }       // ツール結果

type ToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

type ToolResultPart = {
  type: 'tool-result';
  toolCallId: string;
  result: unknown;
}
```

#### API レスポンス形式

```typescript
// ツール呼び出しレスポンス
{
  type: 'tool_calls',
  toolCalls: [{ toolCallId: string, toolName: string, args: Record<string, unknown> }],
  responseMessages: ChatMessage[]  // フロントエンドが次のリクエストに含めるメッセージ
}

// テキストレスポンス
{
  type: 'text',
  content: string,
  responseMessages: ChatMessage[]
}
```

#### フロントエンド UI アクション

TodoPanel に以下のプログラマティック操作メソッドを追加:
- `animateAddTodo(title, description?)`: フォームにフォーカス → テキスト入力アニメーション → Add ボタンクリック → REST API 呼び出し
- `animateToggleStatus(todoId)`: チェックボックスハイライト → クリック → REST API 呼び出し
- `animateEditTodo(todoId, fields)`: Edit ボタンクリック → フォーム入力 → Save クリック → REST API 呼び出し
- `animateDeleteTodo(todoId)`: Delete ボタンハイライト → クリック → 確認ダイアログ → REST API 呼び出し

各操作は CSS アニメーション（ハイライト、タイピング効果、ボタン押下効果）を伴う。

### なぜこのアプローチか

- **透明性**: 実際のデータ操作がフロントエンドの REST API 経由で行われ、ユーザーが見ている画面と同じパスを通る
- **学習効果**: LLM が UI を操作する様子を視覚的に確認できる
- **デモ効果**: エージェントが画面を動かす様子はインパクトがある
- **既存アーキテクチャとの整合**: REST API はそのまま活用、WebSocket 不要（HTTP request/response のみ）

## 完了条件

- [x] LLM ツールが execute 関数なし + outputSchema 定義に変更されている
- [x] チャット API がツール呼び出しをフロントエンドに返す形式に変更されている
- [x] フロントエンドがツール呼び出しを受けて UI 操作を実行する
- [x] フロントエンドが REST API 経由でデータ操作を行い、結果をバックエンドに返す
- [x] UI 操作にアニメーション（ハイライト、タイピング効果等）がある
- [x] 既存のテストが通る（ツール変更に伴う修正を含む）
- [x] lint が通る

## 作業ログ

- 2026-03-01: トリアージ完了。完全 UI 駆動方式で実装することに決定。
- 2026-03-01: 実装完了。全 7 タスクを実施:
  1. ツール定義を execute なし + outputSchema に変更（todo-tools.ts）
  2. エージェントを単一ステップ・ツール呼び出し返却に変更（todo-agent.ts）
  3. チャット API を拡張メッセージ対応に変更（app.ts）
  4. TodoPanel にアニメーション付き操作メソッドを追加（TodoPanel.tsx, useTodoAgentActions.ts）
  5. ChatPanel にフロントエンド主導のツール実行ループを実装（ChatPanel.tsx）
  6. CSS アニメーション追加（App.css）
  7. テスト更新・lint 修正（todo-tools.test.ts）
  - typecheck 全パッケージ通過、33 テスト全通過、lint-all 通過

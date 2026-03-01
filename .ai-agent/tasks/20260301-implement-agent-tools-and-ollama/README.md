# implement-agent-tools-and-ollama

## 目的・ゴール

Vercel AI SDK v6 (`ai` + `ai-sdk-ollama`) を使い、既存の `TodoStorage` に対する CRUD ツールを定義し、Ollama 経由で自然言語から TODO を操作できるエージェント + HTTP API を構築する。

## 背景

- Phase 1 で TODO データモデル・ストレージ層は実装済み
- Agent SDK は Vercel AI SDK v6 に決定済み（調査: `.ai-agent/surveys/20260301-js-agent-sdk-comparison/`）
- Web アプリ（API サーバー + SPA）構成。今回は API 層まで。UI は次タスク

## 実装方針

### 依存追加

- `ai` (v6): ToolLoopAgent, tool() 等
- `ai-sdk-ollama` (v3): Ollama プロバイダー
- `hono`: 軽量 HTTP サーバー（TypeScript-first）

### ディレクトリ構成

```
packages/todo-app/src/
├── models/          # 既存
├── storage/         # 既存
├── tools/           # NEW: AI SDK ツール定義
│   ├── todo-tools.ts
│   ├── todo-tools.test.ts
│   └── index.ts
├── agent/           # NEW: エージェント構成
│   ├── todo-agent.ts
│   └── index.ts
├── server/          # NEW: HTTP API
│   ├── app.ts
│   └── index.ts
└── index.ts
```

### ツール定義（4つ）

- `createTodo`: タイトル（必須）と説明（任意）から TODO を作成
- `listTodos`: 全 TODO を一覧表示
- `updateTodo`: ID 指定で title/description/status を更新
- `deleteTodo`: ID 指定で TODO を削除

### エージェント

- `ToolLoopAgent` + `ollama('llama3.2')` で構成
- instructions でTODOアシスタントとしてのシステムプロンプトを設定

### HTTP API

- `POST /api/chat` - ユーザーメッセージを受け取り、エージェントのレスポンスを返す
- 会話履歴はリクエストで送受信（ステートレス API）

## 完了条件

- [x] `ai`, `ai-sdk-ollama`, `hono` が依存に追加されている
- [x] `createTodo`, `listTodos`, `updateTodo`, `deleteTodo` の4つのツールが定義されている
- [x] `generateText` + `stepCountIs` でエージェントが構成されている
- [x] `POST /api/chat` エンドポイントが動作する
- [x] ツール定義のテストが通る（10テスト）
- [x] lint が通る

## 作業ログ

- ブランチ `implement-agent-tools-and-ollama` を作成
- Web アプリ（API + SPA）構成に方針変更。今回は API 層までがスコープ
- ツール定義・エージェント・HTTP APIの実装完了（コミット: 90edb9f）

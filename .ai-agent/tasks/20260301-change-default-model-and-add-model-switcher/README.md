# デフォルトモデル変更 & モデル切り替え UI 追加

Issue: https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/21

## 目的・ゴール

- LLM モデルのデフォルトを `llama3.2` から `gemma3` に変更する
- Web UI からモデルを動的に切り替えられる機能を追加する

## 実装方針

### 1. デフォルトモデル変更

- `packages/todo-app/src/agent/todo-agent.ts` の `DEFAULT_MODEL` を `gemma3` に変更
- `packages/todo-app/src/main.ts` のフォールバック値を `gemma3` に変更
- `.ai-agent/steering/tech.md` のドキュメントを更新

### 2. バックエンド: モデル一覧 API 追加

- `GET /api/models` エンドポイントを追加
- Ollama API (`GET http://localhost:11434/api/tags`) を呼び出して利用可能なモデル一覧を取得
- レスポンス形式: `{ models: [{ name: string }] }`

### 3. バックエンド: チャット API のモデル指定対応

- `POST /api/chat` のリクエストボディに `model` パラメータ（オプション）を追加
- `todo-agent.ts` の `chat` 関数にモデル override を受け取れるように拡張
- 指定がなければデフォルトモデル（`gemma3`）を使用

### 4. フロントエンド: モデル選択 UI

- ChatPanel のヘッダーにモデル選択ドロップダウンを追加
- アプリ起動時に `GET /api/models` でモデル一覧を取得
- 選択したモデルを `/api/chat` リクエストに含める

## 完了条件

- [ ] `DEFAULT_MODEL` が `gemma3` に変更されている
- [ ] `GET /api/models` で Ollama の利用可能モデル一覧が取得できる
- [ ] `POST /api/chat` に `model` パラメータを渡すと指定モデルで応答する
- [ ] Web UI にモデル選択ドロップダウンが表示される
- [ ] 選択したモデルでチャットが動作する
- [ ] lint が通る
- [ ] 既存テストが通る

## 作業ログ

- `todo-agent.ts`: `DEFAULT_MODEL` を `gemma3` に変更、`chat` 関数に `ChatOptions` パラメータを追加してモデル override に対応
- `main.ts`: フォールバック値を `gemma3` に変更
- `app.ts`: `GET /api/models` エンドポイント追加（Ollama `/api/tags` を呼び出し）、`POST /api/chat` に `model` パラメータ対応追加
- `ChatPanel.tsx`: モデル一覧取得と選択ドロップダウン追加、選択モデルをチャットリクエストに含める
- `App.css`: `.chat-model-select` スタイル追加
- `tech.md`: `ollama pull` コマンドのモデル名を更新
- lint, typecheck, テスト全て通過

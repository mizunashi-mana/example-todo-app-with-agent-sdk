# エラーハンドリング強化

## 目的・ゴール

API のエラーレスポンス形式を統一し、Ollama 未起動・接続失敗時にユーザーフレンドリーなエラーメッセージを返す。

## スコープ

### 対象

- エラーレスポンス形式を `{ error: { code: string, message: string } }` に統一
- Ollama 接続エラー（接続拒否・タイムアウト・モデル未ダウンロード）の判定と具体的メッセージ

### 対象外

- フロントエンドの大規模な改善（新しいエラー形式の読み取り対応のみ）

## 実装方針

### バックエンド

1. エラーレスポンスのヘルパー関数を作成し、全エンドポイントで使用
2. `todo-agent.ts` で Ollama 由来のエラーを判定し、エラーコード付きで throw
3. `/api/chat` でエラーコードに応じたステータスコードとメッセージを返却

### フロントエンド

- エラーレスポンスの読み取りを `{ error: { code, message } }` 形式に対応させる（フォールバックあり）

## 完了条件

- [x] 全 API エンドポイントのエラーレスポンスが `{ error: { code, message } }` 形式
- [x] Ollama 未起動時に `OLLAMA_CONNECTION_ERROR` コードでわかりやすいメッセージが返る
- [x] フロントエンドがサーバー返却のエラーメッセージを表示する
- [x] 既存テストが通る
- [x] lint が通る

## 作業ログ

### 実装内容

**新規ファイル**
- `packages/todo-app/src/server/errors.ts` — `errorResponse()` ヘルパーと `ErrorCode` 型を定義

**バックエンド変更**
- `packages/todo-app/src/agent/todo-agent.ts` — `AgentError` クラスと `classifyAgentError()` を追加。Ollama 接続エラー（ECONNREFUSED, fetch failed 等）を `OLLAMA_CONNECTION_ERROR` として分類、モデル未ダウンロード時も対応
- `packages/todo-app/src/server/app.ts` — 全エンドポイントで `errorResponse()` を使用し `{ error: { code, message } }` 形式に統一。`/api/chat` に messages 配列の構造バリデーションを追加（`isChatMessage` 型ガード）。`AgentError` のコードに応じて HTTP 502/500 を返却

**フロントエンド変更**
- `packages/web-ui/src/ChatPanel.tsx` — `getErrorMessage()` で新エラー形式を解析（レガシー形式フォールバックあり）
- `packages/web-ui/src/TodoPanel.tsx` — 同様の `getErrorMessage()` を追加。各操作でサーバー返却のエラーメッセージを表示

**エラーコード一覧**
| コード | 用途 | HTTP |
|---|---|---|
| `INVALID_JSON` | JSON パース失敗 | 400 |
| `VALIDATION_ERROR` | バリデーション失敗 | 400 |
| `NOT_FOUND` | TODO が見つからない | 404 |
| `OLLAMA_CONNECTION_ERROR` | Ollama 接続失敗・モデル未ダウンロード | 502 |
| `AGENT_ERROR` | その他のエージェントエラー | 500 |
| `INTERNAL_ERROR` | 予期しないエラー | 500 |

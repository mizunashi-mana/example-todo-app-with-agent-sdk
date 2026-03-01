# implement-web-chat-ui

## 目的・ゴール

既存の `POST /api/chat` エンドポイントに対する React SPA のチャット UI を構築し、ユーザーが自然言語で TODO を対話的に操作できるようにする。

## 背景

- Phase 2 まで完了済み: TODO モデル、ストレージ層、AI ツール、Ollama 連携エージェント、HTTP API
- 現在は API のみで UI がない状態
- Phase 3「UI・体験」の最初のタスク

## 実装方針

### パッケージ構成

`packages/web-ui/` に新規 React SPA パッケージを作成する。

### 技術選択

- **React 19** + **TypeScript**
- **Vite** でバンドル・開発サーバー
- CSS は vanilla CSS（CSS Modules または素の CSS）で軽量に
- 開発時は Vite の proxy で `packages/todo-app` の API サーバーにリクエストを転送

### 画面構成

- シンプルなチャット画面（1ページ）
  - メッセージ一覧（ユーザー / アシスタント）
  - メッセージ入力フォーム
  - 送信中のローディング表示

### API 連携

- `POST /api/chat` に会話履歴を送信し、レスポンスを表示
- 会話履歴はフロントエンドで管理（ステートレス API）

## 完了条件

- [x] `packages/web-ui/` パッケージが作成されている
- [x] React + Vite + TypeScript の基本構成がセットアップされている
- [x] チャット UI が動作する（メッセージ送受信）
- [x] 開発時に API サーバーとの proxy 連携が動作する
- [x] ESLint 設定が適用されている
- [x] lint が通る

## 作業ログ

- ブランチ `implement-web-chat-ui` を作成
- `packages/web-ui/` を React 19 + Vite 7 + TypeScript でスキャフォールド
- チャット UI を実装（メッセージ一覧、入力フォーム、ローディング表示、自動スクロール）
- Vite proxy で `/api` を `localhost:3000` に転送する設定を追加
- root の `eslint.config.js` に web-ui エントリポイントを追加
- `devenv.nix` に web-ui 用の ESLint git hook を追加
- root の `package.json` の build スクリプトに web-ui を追加
- lint / typecheck / build 全てパス確認

# TODO 手動操作 UI

## 目的・ゴール

チャット以外に、TODO を直接操作できる Web UI を実装する。チャットパネルはサイドバーとして補助的に配置し、TODO 一覧がメイン画面となるレイアウトに変更する。

## 実装方針

### バックエンド（packages/todo-app）

- TODO CRUD 用の REST API エンドポイントを追加
  - `GET /api/todos` — 一覧取得
  - `POST /api/todos` — 新規作成
  - `PUT /api/todos/:id` — 更新
  - `DELETE /api/todos/:id` — 削除
- 既存の `TodoStorage` インターフェースをそのまま利用

### フロントエンド（packages/web-ui）

- TODO 一覧・作成・編集・削除の UI コンポーネントを実装
- レイアウトを 2 カラムに変更（メイン: TODO 一覧、サイドバー: チャット）
- チャット操作後に TODO 一覧を再取得することで双方の同期を実現（ポーリングではなく、チャットレスポンス後のリフレッシュ）

## 完了条件

- [x] REST API で TODO の CRUD 操作ができる
- [x] Web UI 上で TODO の一覧表示・作成・編集・削除ができる
- [x] チャットパネルがサイドバーとして配置されている
- [x] チャットで TODO を操作した後、一覧が更新される
- [x] 既存のテストが通る
- [x] lint が通る

## 作業ログ

### 実装内容

**バックエンド** (`packages/todo-app/src/server/app.ts`)
- `GET /api/todos`, `POST /api/todos`, `PUT /api/todos/:id`, `DELETE /api/todos/:id` を追加
- 既存の `TodoStorage` を直接利用

**フロントエンド** (`packages/web-ui/src/`)
- `TodoPanel.tsx` — TODO 一覧・作成・インライン編集・削除・ステータス切替コンポーネント
- `ChatPanel.tsx` — 既存チャット機能を独立コンポーネントとして抽出、`onChatResponse` コールバック追加
- `App.tsx` — 2 カラムレイアウト（メイン: TodoPanel、サイドバー: ChatPanel）
- `App.css` — 全スタイルを 2 カラム対応に書き換え

**同期方式**
- チャットのレスポンス受信後に `TodoPanel.refresh()` を `useImperativeHandle` 経由で呼び出し

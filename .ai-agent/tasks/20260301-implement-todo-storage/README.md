# TODO CRUD 操作の実装（ストレージ層）

## 目的・ゴール

TODO データの CRUD 操作を行うストレージ層を実装する。
Phase 2 のコア機能実装の基盤として、Agent SDK のツール定義から利用可能なストレージインターフェースを提供する。

## 実装方針

- `packages/todo-app/src/storage/` にストレージ層を配置
- `TodoStorage` インターフェースを定義し、インメモリ実装を提供
- 操作: `create`, `getById`, `getAll`, `update`, `delete`
- 既存の `Todo` モデル・`createTodo` ファクトリを活用
- vitest でテストを追加

## 完了条件

- [x] `TodoStorage` インターフェースが定義されている
- [x] インメモリ実装 (`InMemoryTodoStorage`) が動作する
- [x] CRUD 全操作のテストが通る（27 tests passed）
- [x] lint・typecheck が通る

## 作業ログ

- `TodoStorage` インターフェースを `src/storage/todo-storage.ts` に定義（create, getById, getAll, update, delete）
- `InMemoryTodoStorage` を `src/storage/in-memory-todo-storage.ts` に実装（Map ベース）
- `src/storage/index.ts` でバレルエクスポート、`src/index.ts` からも再エクスポート
- ESLint の `no-restricted-imports`（`../` 禁止）に対応するため、package.json に `imports` フィールドを追加し `#models` サブパスで models の index.ts を通じたアクセスを実現
- テスト 16 件追加（create 3, getById 2, getAll 2, update 6, delete 3）
- typecheck・lint・ビルド全てパス

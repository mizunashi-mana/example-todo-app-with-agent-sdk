# TODO データモデルの設計

## 目的・ゴール

TODO アプリのコアとなるデータモデルを Zod スキーマ + TypeScript 型として設計・実装する。
Vercel AI SDK v6 のツール定義と一貫して Zod を使用し、Phase 2 のストレージ層・ツール定義の基盤を構築する。

## 実装方針

- `packages/todo-app/src/models/` にデータモデルを配置
- Zod スキーマを定義し、`z.infer` で TypeScript 型を導出
- ファクトリ関数でデフォルト値の生成を担当
- vitest でテストを追加

### データモデル

- **Todo**: id, title, description（任意）, status（pending/completed）, createdAt, updatedAt
- **TodoId**: ユニーク ID の型（UUID v4）

## 完了条件

- [x] `packages/todo-app/src/models/` にデータモデルが定義されている
- [x] Zod スキーマと TypeScript 型が整合している
- [x] ファクトリ関数が実装されている
- [x] テストが通る（11 tests passed）
- [x] lint が通る

## 作業ログ

- Zod を依存に追加し、`packages/todo-app/src/models/todo.ts` にスキーマ・型・ファクトリ関数を実装
- `todo.test.ts` に 11 件のテストを追加（スキーマバリデーション、ファクトリ関数）
- ESLint 命名規則に合わせてスキーマ変数名を camelCase に統一（`todoSchema`, `todoStatusSchema`, `todoIdSchema`）
- `z.uuid()` を使用（`z.string().uuid()` は deprecated）
- テスト・typecheck・lint・ビルド全てパス

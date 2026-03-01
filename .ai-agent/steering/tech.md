# 技術アーキテクチャ

## 技術スタック

| カテゴリ | 技術 | 備考 |
|---|---|---|
| 言語 | JavaScript / TypeScript (Node.js >=22) | devenv で管理 |
| パッケージマネージャ | npm (workspaces) | モノレポ構成 |
| LLM ランタイム | Ollama | ローカルモデルを使用 |
| Agent SDK | Vercel AI SDK v6 (`ai` + `ai-sdk-ollama`) | `generateText` + `stepCountIs` パターンでツールループを実現 |
| HTTP フレームワーク | Hono + @hono/node-server | 軽量 Web フレームワーク |
| フロントエンド | React 19 + Vite 7 | SPA、Vite dev server → todo-app へプロキシ |
| 開発環境 | devenv (Nix) + direnv | 再現可能な環境構築 |
| コード品質 | ESLint (共有設定パッケージ) | パッケージごとに pre-commit hook |
| Git hooks | pre-commit (devenv) | actionlint, eslint |
| テスト | vitest | ユニットテスト |
| CI | GitHub Actions | ci-lint, ci-test ワークフロー |

## アーキテクチャ概要

モノレポ構成を採用。`packages/` 配下に各パッケージを配置する。

```
ユーザー → Web UI (React SPA)
            ├── TODO REST API → TodoStorage (InMemory)
            └── Chat API → Agent SDK → Ollama (ローカルLLM) → ツール実行 → TodoStorage
```

## パッケージ構成

| パッケージ | 説明 |
|---|---|
| `packages/eslint-config` | 共有 ESLint 設定（tsup でビルド） |
| `packages/todo-app` | TODO アプリ本体（Hono サーバ、Agent、Storage、Tools） |
| `packages/web-ui` | Web フロントエンド（React SPA、2カラムレイアウト） |

## 開発環境

### セットアップ

1. [devenv](https://devenv.sh/) をインストール
2. [direnv](https://direnv.net/) をインストール
3. [Ollama](https://ollama.ai/) をインストールし、モデルをダウンロード（例: `ollama pull granite4`）
4. リポジトリルートで `direnv allow` を実行
5. `npm install` で依存関係をインストール

### 利用可能なスクリプト

| コマンド | 説明 |
|---|---|
| `lint-all` | 全ファイルの lint 実行（devenv スクリプト） |
| `cc-edit-lint-hook` | Claude Code 編集時の lint hook（devenv スクリプト） |
| `npm run dev` | サーバ + Web UI を同時起動（concurrently） |
| `npm run build` | 全パッケージをビルド |
| `npm test` | 全パッケージのテスト実行 |
| `npm run typecheck` | 全パッケージの型チェック |

## テスト戦略

- vitest によるユニットテスト（`packages/todo-app` に設定済み）
- テスト対象: モデル（Zod スキーマ）、ストレージ（InMemoryTodoStorage）、ツール（Agent ツール定義）

## CI/CD

- GitHub Actions（ci-lint, ci-test ワークフロー設定済み）

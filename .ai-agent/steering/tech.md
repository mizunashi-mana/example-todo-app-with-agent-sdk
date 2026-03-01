# 技術アーキテクチャ

## 技術スタック

| カテゴリ | 技術 | 備考 |
|---|---|---|
| 言語 | JavaScript (Node.js) | devenv で管理 |
| パッケージマネージャ | npm | |
| LLM ランタイム | Ollama | ローカルモデルを使用 |
| Agent SDK | Vercel AI SDK v6 (`ai` + `ai-sdk-ollama`) | 調査比較の結果選定。Zod ベースのツール定義、ToolLoopAgent |
| 開発環境 | devenv (Nix) + direnv | 再現可能な環境構築 |
| コード品質 | ESLint | パッケージごとに設定 |
| Git hooks | pre-commit (devenv) | actionlint, eslint |

## アーキテクチャ概要

モノレポ構成を採用。`packages/` 配下に各パッケージを配置する。

```
ユーザー → 自然言語入力 → Agent SDK → Ollama (ローカルLLM) → ツール実行 → TODO CRUD
```

## パッケージ構成（予定）

- `packages/eslint-config` - 共有 ESLint 設定
- `packages/todo-app` - TODO アプリ本体

## 開発環境

### セットアップ

1. [devenv](https://devenv.sh/) をインストール
2. [direnv](https://direnv.net/) をインストール
3. リポジトリルートで `direnv allow` を実行

### 利用可能なスクリプト

- `lint-all` - 全ファイルの lint 実行
- `cc-edit-lint-hook` - Claude Code 編集時の lint hook

## テスト戦略

- vitest によるユニットテスト（`packages/todo-app` に設定済み）

## CI/CD

- GitHub Actions（ci-lint, ci-test ワークフロー設定済み）

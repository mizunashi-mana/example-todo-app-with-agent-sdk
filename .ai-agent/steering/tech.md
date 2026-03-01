# 技術アーキテクチャ

## 技術スタック

| カテゴリ | 技術 | 備考 |
|---|---|---|
| 言語 | JavaScript (Node.js) | devenv で管理 |
| パッケージマネージャ | npm | |
| LLM ランタイム | Ollama | ローカルモデルを使用 |
| Agent SDK | 未定 | 調査・比較の上で選定予定 |
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
- `packages/mcp-html-artifacts-preview` - HTML アーティファクトプレビュー用 MCP サーバー
- （TODO アプリ本体のパッケージは今後追加）

## 開発環境

### セットアップ

1. [devenv](https://devenv.sh/) をインストール
2. [direnv](https://direnv.net/) をインストール
3. リポジトリルートで `direnv allow` を実行

### 利用可能なスクリプト

- `lint-all` - 全ファイルの lint 実行
- `cc-edit-lint-hook` - Claude Code 編集時の lint hook

## テスト戦略

未定（Agent SDK 選定後に決定）

## CI/CD

未定（GitHub Actions を想定）

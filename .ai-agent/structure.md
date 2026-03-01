# example-todo-app-with-agent-sdk ディレクトリ構成

## 全体構成

```
.
├── .ai-agent/                  # AI エージェント向けドキュメント
│   ├── steering/               # 戦略的ガイドドキュメント
│   │   ├── market.md           # 市場分析・競合調査
│   │   ├── plan.md             # 実装計画・ロードマップ
│   │   ├── product.md          # プロダクトビジョン・戦略
│   │   ├── tech.md             # 技術アーキテクチャ・スタック
│   │   └── work.md             # 開発ワークフロー・規約
│   ├── structure.md            # ディレクトリ構造の説明（本ファイル）
│   ├── projects/               # 長期プロジェクト管理
│   ├── tasks/                  # 個別タスク管理
│   └── surveys/                # 技術調査・検討
├── .claude/                    # Claude Code 設定
│   └── skills/                 # autodev スキル群
│       ├── autodev-create-issue/
│       ├── autodev-create-pr/
│       ├── autodev-discussion/
│       ├── autodev-import-review-suggestions/
│       ├── autodev-replan/
│       ├── autodev-review-pr/
│       ├── autodev-start-new-project/
│       ├── autodev-start-new-survey/
│       ├── autodev-start-new-task/
│       ├── autodev-steering/
│       └── autodev-switch-to-default/
├── .github/
│   └── workflows/              # GitHub Actions CI
│       ├── ci-lint.yml         # lint ワークフロー
│       └── ci-test.yml         # テストワークフロー
├── packages/                   # モノレポパッケージ群（npm workspaces）
│   ├── eslint-config/          # 共有 ESLint 設定パッケージ
│   ├── todo-app/               # TODO アプリ本体（バックエンド）
│   └── web-ui/                 # Web フロントエンド（React SPA）
├── scripts/                    # 開発用ヘルパースクリプト
│   ├── cc-edit-lint-hook.mjs   # Claude Code 編集時の lint hook
│   └── run-script.mjs          # pre-commit hook 用スクリプトランナー
├── .envrc                      # direnv 設定
├── .gitignore                  # Git 除外設定
├── .pre-commit-config.yaml     # pre-commit フック設定（Nix 管理）
├── CLAUDE.md                   # Claude Code プロジェクト設定
├── LICENSE                     # ライセンス（Apache-2.0 OR MPL-2.0）
├── eslint.config.js            # ルート ESLint 設定
├── package.json                # ルート package.json（workspaces 定義）
├── package-lock.json           # npm ロックファイル
├── devenv.nix                  # devenv 開発環境設定
├── devenv.yaml                 # devenv 入力ソース設定
└── devenv.lock                 # devenv ロックファイル
```

## 各ディレクトリの説明

### `.ai-agent/`

AI エージェントによる開発を支援するドキュメント群。

- **`steering/`**: プロダクトの方向性、技術選択、開発フローなどの戦略的ドキュメント
- **`projects/`**: 複数タスクにまたがる長期プロジェクトの管理ディレクトリ
- **`tasks/`**: 日〜週単位の個別タスクの管理ディレクトリ
- **`surveys/`**: 技術調査・比較検討の記録

### `.claude/skills/`

Claude Code で利用可能な autodev スキル群。各スキルは `SKILL.md` に手順を定義している。

| スキル | 説明 |
|---|---|
| `autodev-create-issue` | GitHub Issue の作成 |
| `autodev-create-pr` | プルリクエストの作成 |
| `autodev-discussion` | アイデアや考えの対話的な整理 |
| `autodev-import-review-suggestions` | PR レビューコメントの取り込み |
| `autodev-replan` | ロードマップの再策定 |
| `autodev-review-pr` | PR のコードレビュー（チーム化） |
| `autodev-start-new-project` | 長期プロジェクトの開始 |
| `autodev-start-new-survey` | 技術調査の開始 |
| `autodev-start-new-task` | 個別タスクの開始 |
| `autodev-steering` | Steering ドキュメントの更新 |
| `autodev-switch-to-default` | デフォルトブランチへの切り替え |

### `packages/`

npm workspaces によるモノレポ構成。

| パッケージ | 説明 |
|---|---|
| `eslint-config` | 共有 ESLint 設定。tsup でビルド、他パッケージから `@example-todo-app/eslint-config` として参照 |
| `todo-app` | TODO アプリ本体。Hono HTTP サーバ、Vercel AI SDK + Ollama によるエージェント、InMemoryTodoStorage |
| `web-ui` | React SPA フロントエンド。Vite でビルド。TODO 一覧（メイン）+ チャットサイドバーの 2 カラムレイアウト |

### 開発環境

devenv (Nix) + direnv による再現可能な開発環境。

- **`devenv.nix`**: JavaScript/npm の有効化、lint スクリプト、Git hooks（actionlint, eslint）を定義
- **`devenv.yaml`**: nixpkgs の入力ソースを定義
- **`.envrc`**: direnv による自動環境読み込み

## アーキテクチャパターン

- **モノレポ構成**: `packages/` 配下に各パッケージを配置（npm workspaces）
- devenv.nix で `packages/eslint-config`, `packages/todo-app`, `packages/web-ui` 向けの eslint フックが定義済み

## テスト構成

- **vitest** によるユニットテスト（`packages/todo-app` に設定済み）
- テスト対象: モデル（Zod スキーマ）、ストレージ（InMemoryTodoStorage）、ツール（Agent ツール定義）
- CI: GitHub Actions `ci-test.yml` で自動実行

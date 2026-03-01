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
├── .envrc                      # direnv 設定
├── .gitignore                  # Git 除外設定
├── .pre-commit-config.yaml     # pre-commit フック設定（Nix 管理）
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

### 開発環境

devenv (Nix) + direnv による再現可能な開発環境。

- **`devenv.nix`**: JavaScript/npm の有効化、lint スクリプト、Git hooks（actionlint, eslint）を定義
- **`devenv.yaml`**: nixpkgs の入力ソースを定義
- **`.envrc`**: direnv による自動環境読み込み

## アーキテクチャパターン

- **モノレポ構成**: `packages/` 配下に各パッケージを配置予定（npm workspaces）
- devenv.nix で `packages/eslint-config` と `packages/mcp-html-artifacts-preview` 向けの eslint フックが定義済み

## テスト構成

未構築（Agent SDK 選定後に決定予定）

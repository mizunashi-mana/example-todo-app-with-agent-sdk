# GitHub Actions CI セットアップ

## 目的・ゴール

参考リポジトリ [mcp-html-artifacts-preview](https://github.com/mizunashi-mana/mcp-html-artifacts-preview) の CI 構成を本プロジェクトに適用し、PR / push 時に自動で lint・test を実行できるようにする。

## 実装方針

### 作成するファイル

| ファイル | 内容 |
|---|---|
| `.github/actions/setup-devenv/action.yml` | Nix + devenv セットアップ（composite action） |
| `.github/actions/setup-node/action.yml` | Node.js + npm キャッシュ + `npm ci`（composite action） |
| `.github/workflows/ci-lint.yml` | build → typecheck → prek lint（devenv 経由） |
| `.github/workflows/ci-test.yml` | build → test（devenv 不要） |

### 参考リポジトリからの変更点

- publish workflow は不要（private リポジトリ）
- ワークスペース名が `@example-todo-app/*` に対応

## 完了条件

- [x] `.github/actions/setup-devenv/action.yml` が正しく定義されている
- [x] `.github/actions/setup-node/action.yml` が正しく定義されている
- [x] `.github/workflows/ci-lint.yml` が正しく定義されている
- [x] `.github/workflows/ci-test.yml` が正しく定義されている
- [x] actionlint でワークフローが検証済み
- [ ] PR が作成されている

## 作業ログ

- タスク開始、方針承認済み
- 全ファイル作成完了、actionlint + lint-all パス

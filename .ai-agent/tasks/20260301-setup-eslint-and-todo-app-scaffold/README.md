# ESLint 設定と TODO アプリパッケージの雛形作成

## 目的・ゴール

mcp-html-artifacts-preview リポジトリの構成を参考に、モノレポの基盤となる ESLint 設定パッケージと TODO アプリパッケージの雛形を作成する。

## 実装方針

- 参考リポジトリ: https://github.com/mizunashi-mana/mcp-html-artifacts-preview
- npm workspaces によるモノレポ構成
- `packages/eslint-config` に共有 ESLint 設定パッケージを作成
- `packages/todo-app` に TODO アプリの雛形を作成
- ルートに `eslint.config.js` を配置
- `scripts/` ディレクトリにユーティリティスクリプトを配置

## 完了条件

- [x] ルート `package.json` が npm workspaces で構成されている
- [x] `packages/eslint-config` が参考リポジトリと同等の ESLint ルールを持つ
- [x] `packages/todo-app` の雛形（package.json, tsconfig.json, src/index.ts）が存在する
- [x] ルート `eslint.config.js` が動作する
- [x] `scripts/` にユーティリティスクリプトが配置されている
- [x] `devenv.nix` に todo-app 用の eslint hook が追加されている
- [x] `lint-all` が正常に動作する
- [x] `.gitignore` が適切に更新されている

## 作業ログ

- ルート `package.json` を作成（npm workspaces: `packages/*`）
- `packages/eslint-config` を参考リポジトリから移植（スコープ名を `@example-todo-app` に変更）
- `packages/todo-app` の雛形を作成（package.json, tsconfig.json, tsconfig.build.json, src/index.ts）
- ルート `eslint.config.js` を作成
- `scripts/run-script.mjs`, `scripts/cc-edit-lint-hook.mjs` を配置
- `devenv.nix` の mcp-html-artifacts-preview hook を todo-app hook に変更
- `.gitignore` に Node.js / TypeScript / ESLint 関連の除外パターンを追加
- `npm install`, `npm run typecheck`, `npm run build`, ESLint 実行すべて正常動作を確認

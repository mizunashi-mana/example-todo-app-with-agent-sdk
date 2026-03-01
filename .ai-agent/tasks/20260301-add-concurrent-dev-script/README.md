# concurrently で dev スクリプトを同時起動

## 目的・ゴール

ルートの `npm run dev` で todo-app サーバと web-ui 開発サーバを同時に起動できるようにする。

## 実装方針

- `concurrently` をルートの devDependencies に追加
- ルート `package.json` に `dev` スクリプトを追加し、両ワークスペースの `dev` を並列実行

## 完了条件

- [x] `concurrently` がインストールされている
- [x] `npm run dev` でサーバと Web UI が同時に起動する
- [x] lint が通る

## 作業ログ

- 2026-03-01: タスク開始
- 2026-03-01: 実装完了。`concurrently` をインストールし、ルート `dev` スクリプトを追加

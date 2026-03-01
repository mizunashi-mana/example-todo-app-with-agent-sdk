# favicon の追加

## 目的・ゴール

- Issue #16: `favicon.ico` が存在せずブラウザコンソールに 404 エラーが表示される問題を解消する
- TODO アプリにふさわしい favicon を追加し、サンプルプロジェクトとしての完成度を高める

## 実装方針

1. Node.js スクリプトで ICO 形式の favicon を生成（チェックマーク付きのシンプルなアイコン、TODO アプリらしいデザイン）
2. `packages/web-ui/public/favicon.ico` として配置
3. `packages/web-ui/index.html` に `<link rel="icon">` タグを追加

### ICO を選ぶ理由

- 全ブラウザで最も互換性が高い標準形式
- `/favicon.ico` へのブラウザ自動リクエストに直接対応

## 完了条件

- [x] favicon ファイルが `packages/web-ui/public/` に配置されている
- [x] `index.html` に favicon の `<link>` タグが追加されている
- [ ] ブラウザで 404 エラーが出ない（PR マージ後に確認）
- [x] lint が通る

## 作業ログ

- ICO 形式で favicon を生成（32x32、青い角丸四角に白いチェックマーク）
- `packages/web-ui/public/favicon.ico` に配置
- `packages/web-ui/index.html` に `<link rel="icon" href="/favicon.ico" />` を追加
- lint-all パス確認済み

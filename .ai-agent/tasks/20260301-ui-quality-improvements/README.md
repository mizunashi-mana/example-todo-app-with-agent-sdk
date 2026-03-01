# UI 品質改善

## 目的・ゴール

探索的テストで発見された 4 件の UI 品質問題（Issue #13-#16）をまとめて修正する。

## 対象 Issue

1. **Issue #13** — Edit form の Save ボタンを空入力時に無効化する
2. **Issue #14** — 編集中のステータストグルで編集内容が消失する問題の修正
3. **Issue #15** — TODO 削除時の確認ダイアログ追加

## 実装方針

### Issue #13: Save ボタンの無効化

- `TodoPanel.tsx` の Save ボタンに `disabled={editTitle.trim() === ''}` を追加
- Add ボタンと同じパターンで統一

### Issue #14: 編集中のステータストグル

- 編集モード中はステータストグルボタンを無効化（disabled）する
- シンプルかつ明確なアプローチ

### Issue #15: 削除確認ダイアログ

- `handleDelete` に `window.confirm()` を追加
- カスタムモーダルではなくブラウザネイティブの確認ダイアログを使用（シンプルさ優先）

## 完了条件

- [x] Save ボタンが空入力時に無効化される
- [x] 編集中にステータストグルができない（disabled 表示）
- [x] 削除時に確認ダイアログが表示される
- [x] lint が通る
- [x] 既存テストが通る

## 作業ログ

- Issue #13: Save ボタンに `disabled={editTitle.trim() === ''}` を追加
- Issue #14: 編集中の todo のチェックボックスに `disabled={editingId === todo.id}` を追加
- Issue #15: `handleDelete` に `window.confirm()` を追加（`no-alert` ルールは inline disable）
- lint・テスト全パス

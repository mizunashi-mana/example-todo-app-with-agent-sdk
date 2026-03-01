# Playwright CLI による探索的テスト

## 目的・ゴール

Playwright CLI を使って Web UI を実際に操作し、バグや UX 上の問題を発見する。発見した問題は GitHub Issue として起票する。

## テスト対象

- TODO パネル: 一覧表示、作成、編集、ステータス切り替え、削除
- チャットパネル: メッセージ送信、レスポンス表示
- レイアウト: 2カラム構成の表示・レスポンシブ対応

## 完了条件

- [x] TODO CRUD 操作を一通り手動テスト
- [x] チャット機能のテスト（Ollama + llama3.2）
- [x] 発見したバグを GitHub Issue として起票（合計6件）

## 作業ログ

- Playwright CLI でブラウザを開き、http://localhost:5173/ にアクセス
- TODO CRUD 操作を一通りテスト:
  - 作成（テキスト入力 + Add / Enter キー）✅
  - 空文字バリデーション（Add ボタン disabled）✅
  - 編集（Edit → 変更 → Save）✅
  - 編集キャンセル（Escape キー / Cancel ボタン）✅
  - ステータス切り替え（pending ↔ completed）✅
  - 削除 ✅
  - 全削除後の空状態表示 ✅
  - ホバーでの Edit/Delete ボタン表示 ✅
- レイアウト・スクリーンショットで視覚確認 ✅
- チャット機能テスト（Ollama llama3.2）:
  - TODO 作成（英語プロンプト）✅ 正常動作
  - TODO 一覧表示 ✅ 正常動作
  - TODO ステータス更新 ❌ LLM がハルシネーション（実際には更新されない）
  - TODO 削除 ❌ LLM がハルシネーション（削除されず別の TODO が作成される）
  - 日本語プロンプト ❌ ツールを使わず Python コードを返す
  - チャット後の TODO パネルリフレッシュ ❌ 反映されないケースあり

### 発見した問題（全6件 Issue 起票済み）

| Issue | 種別 | 概要 |
|-------|------|------|
| [#13](https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/13) | Bug | Edit Save ボタンが空入力で disabled にならない |
| [#14](https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/14) | Bug | 編集中にステータス切り替えで編集内容が無警告で破棄される |
| [#15](https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/15) | UX改善 | TODO 削除に確認ダイアログがない |
| [#16](https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/16) | 軽微 | favicon.ico が未設定で 404 エラー |
| [#17](https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/17) | Bug | LLM が update/delete でツールチェーンに失敗し、虚偽の成功報告をする |
| [#18](https://github.com/mizunashi-mana/example-todo-app-with-agent-sdk/issues/18) | Bug | チャット後の TODO パネルリフレッシュが動作しないことがある |

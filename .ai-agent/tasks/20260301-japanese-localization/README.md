# UI およびドキュメントの日本語化

GitHub Issue: #19

## 目的・ゴール

日本人開発者向けサンプルアプリケーションとして、UI テキストおよび README を日本語化する。

## 実装方針

- i18n ライブラリは導入せず、英語テキストを日本語に直接置き換える
- 対象ファイル:
  - `packages/web-ui/index.html` — `<html lang>` 属性、`<title>`
  - `packages/web-ui/src/TodoPanel.tsx` — ボタン、プレースホルダー、ラベル、確認ダイアログ、エラーメッセージ
  - `packages/web-ui/src/ChatPanel.tsx` — ヘッダー、メッセージ表示、プレースホルダー、ローディング
  - `packages/web-ui/src/useTodoAgentActions.ts` — エラーメッセージ（内部用なのでそのままでも可）
  - `README.md` — 全体を日本語に翻訳

## 完了条件

- [x] UI のすべてのユーザー向けテキストが日本語になっている
- [x] `index.html` の `lang` 属性が `ja` になっている
- [x] README.md が日本語化されている
- [x] lint が通る
- [x] 既存テストが通る

## 作業ログ

- `index.html`: `lang="ja"` に変更、`<title>` を「TODO チャット」に変更
- `TodoPanel.tsx`: ボタンラベル（追加、保存、キャンセル、編集、削除、閉じる）、プレースホルダー、セクションラベル（完了済み）、確認ダイアログ、エラーメッセージ、aria-label を日本語化
- `ChatPanel.tsx`: ヘッダー（チャット）、メッセージ表示ラベル（あなた、アシスタント、システム）、プレースホルダー、ボタン（送信）、ローディング（考え中...）、モデル選択（デフォルト）、ツール実行ステータスを日本語化
- `useTodoAgentActions.ts`: LLM 向け内部エラーメッセージのため英語のまま維持
- `README.md`: 全体を日本語に翻訳
- lint: 全パス、テスト: 33/33 パス

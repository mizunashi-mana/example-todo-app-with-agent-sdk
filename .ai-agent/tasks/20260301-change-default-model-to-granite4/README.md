# デフォルトモデルを granite4 に変更

## 目的・ゴール

デフォルトモデル `gemma3` がツールコール非対応のため、ツール対応モデル `granite4` に変更する。

- 関連 Issue: #29

## 実装方針

- `DEFAULT_MODEL` 定数とフォールバック値を `granite4` に変更
- ドキュメント中の `gemma3` 参照を `granite4` に更新

## 完了条件

- [x] `packages/todo-app/src/agent/todo-agent.ts` の `DEFAULT_MODEL` が `granite4` に変更されている
- [x] `packages/todo-app/src/main.ts` のフォールバック値が `granite4` に変更されている
- [x] `README.md` のモデル名が `granite4` に更新されている
- [x] `.ai-agent/steering/tech.md` のモデル名が `granite4` に更新されている
- [x] lint が通る
- [x] テストが通る

## 作業ログ

- タスク開始、granite4 への変更方針でユーザー確認済み
- ソースコード2ファイル、ドキュメント3ファイルを修正、lint・テスト全パス

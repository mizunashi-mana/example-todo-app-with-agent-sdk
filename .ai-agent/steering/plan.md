# 実装計画

## 現在のフェーズ

Phase 5: 品質・完成度向上 — サンプルプロジェクトとしての完成度を高める

## 完了済み

### Phase 1: 基盤構築
- devenv による開発環境構築
- Git hooks 設定（actionlint, eslint）
- autodev 開発環境の初期化
- モノレポ構成のセットアップ（npm workspaces）
- 共有 ESLint 設定パッケージの作成
- GitHub Actions CI（ci-lint, ci-test）
- Agent SDK の選定調査 → Vercel AI SDK v6 に決定（調査: `.ai-agent/surveys/20260301-js-agent-sdk-comparison/`）
- TODO データモデルの設計（Zod スキーマ + TypeScript 型）

### Phase 2: コア機能実装
- TODO CRUD 操作の実装（InMemoryTodoStorage）
- Ollama 連携の基本実装（ai-sdk-ollama）
- Agent SDK によるツール定義（create, read, update, delete）
- 自然言語 → ツール呼び出しの HTTP API サーバ構築

### Phase 3: UI・体験
- Web チャット UI の実装（React SPA）
- 対話的な TODO 操作フローの実装
- concurrently による dev 同時起動スクリプト

### Phase 4: CI・テスト基盤
- モデル・ストレージ・ツールのユニットテスト
- GitHub Actions CI パイプライン（lint, test）

## 今後の計画

### Phase 5: 品質・完成度向上

#### TODO 手動操作 UI
- [ ] TODO 一覧・作成・編集・削除の Web UI をメイン画面として実装
- [ ] チャットパネルをサイドバーとして補助的に配置
- [ ] TODO の状態変更がチャット・手動 UI 双方にリアルタイム反映

#### エラーハンドリング強化
- [ ] Ollama 未起動・接続失敗時のエラーハンドリング
- [ ] 不正入力・バリデーションエラーの改善
- [ ] API エラーレスポンスの統一

#### E2E テスト
- [ ] API エンドポイントの結合テスト
- [ ] Web UI の E2E テスト（Playwright 等）

#### ドキュメント整備
- [ ] README の充実（セットアップ手順、アーキテクチャ図、スクリーンショット）
- [ ] 使い方ガイド（Ollama のインストールから動作確認まで）

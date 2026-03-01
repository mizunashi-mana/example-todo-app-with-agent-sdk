# 実装計画

## 現在のフェーズ

新規開発 - プロジェクト初期セットアップ段階

## 完了済み

- devenv による開発環境構築
- Git hooks 設定（actionlint, eslint）
- autodev 開発環境の初期化

## 進行中

- Agent SDK の選定調査（Ollama 対応の JS Agent SDK 比較）

## 今後の計画

### Phase 1: 基盤構築
- [ ] Agent SDK の調査・比較・選定
- [ ] モノレポ構成のセットアップ（npm workspaces）
- [ ] 共有 ESLint 設定パッケージの作成
- [ ] TODO データモデルの設計

### Phase 2: コア機能実装
- [ ] TODO CRUD 操作の実装（ストレージ層）
- [ ] Ollama 連携の基本実装
- [ ] Agent SDK によるツール定義（create, read, update, delete）
- [ ] 自然言語 → ツール呼び出しのパイプライン構築

### Phase 3: UI・体験
- [ ] ユーザーインターフェースの実装（CLI or Web）
- [ ] 対話的な TODO 操作フローの実装
- [ ] エラーハンドリング・バリデーション

### Phase 4: 品質・ドキュメント
- [ ] テストの追加
- [ ] CI/CD パイプライン構築
- [ ] README・使い方ドキュメントの充実

# example-todo-app-with-agent-sdk

Ollama と Agent SDK を活用した、自然言語で操作できる TODO タスク管理アプリです。

## 概要

ローカルで動作する AI エージェント（Ollama）との自然言語チャットを通じてタスクを管理できる TODO アプリケーションのサンプルプロジェクトです。メインパネルに TODO リスト、サイドバーに AI チャットを配置した 2 カラムレイアウトを採用しています。

## 特徴

- Agent SDK と Ollama を連携させたローカル LLM アプリケーションの構築方法を学べる
- クラウド API に依存しないエージェント駆動アプリケーションパターンを体験できる
- lint・テスト・CI を備えた実用的なサンプルプロジェクト

## 技術スタック

- **Agent SDK**: Vercel AI SDK v6 (`ai` + `ai-sdk-ollama`)
- **バックエンド**: Hono (Node.js)
- **フロントエンド**: React 19 + Vite 7
- **開発環境**: devenv (Nix) + direnv
- **テスト**: vitest
- **CI**: GitHub Actions

## クイックスタート

### 前提条件

- [devenv](https://devenv.sh/)
- [direnv](https://direnv.net/)
- [Ollama](https://ollama.ai/) とモデルのインストール（例: `ollama pull gemma3`）

### セットアップ

```bash
git clone <repository-url>
cd example-todo-app-with-agent-sdk
direnv allow
npm install
```

### 起動

```bash
# Ollama を起動（別ターミナルで）
ollama serve

# 開発サーバを起動（バックエンド + フロントエンド）
npm run dev
```

TODO アプリは `http://localhost:5173`（Vite dev server がポート 3000 のバックエンドにプロキシ）で利用できます。

## ライセンス

Apache License, Version 2.0 または Mozilla Public License, Version 2.0 のいずれかを選択して利用できます。

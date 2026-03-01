# Mastra (mastra.ai) - Agent SDK Survey

調査日: 2026-03-01

## 1. Overview

| 項目 | 内容 |
|------|------|
| 名称 | Mastra |
| 公式サイト | https://mastra.ai/ |
| GitHub | https://github.com/mastra-ai/mastra |
| 現在のバージョン | @mastra/core@1.8.0 (CLI: mastra@1.3.5) |
| ライセンス | Apache 2.0 (2025年7月に ELv2 から変更) |
| リポジトリ作成日 | 2024-08-06 |
| 1.0 リリース日 | 2026-01-20 |
| 開発元 | Gatsby.js の創設チーム (Sam Bhagwat, Abhi Aiyer, Shane Thomas) |
| 資金調達 | Y Combinator 支援の $13M シードラウンド |

Mastra は TypeScript ファーストの AI エージェントフレームワーク。Gatsby.js を作ったチームが開発しており、LLM を活用したアプリケーションとエージェントの構築に必要な機能をオールインワンで提供する。

主要機能:
- Model routing (40+ プロバイダー対応)
- Agent & Workflow エンジン
- Tool calling (MCP 対応)
- Human-in-the-loop (実行の一時停止・再開)
- RAG / セマンティックメモリ
- Evals (評価・スコアリング)
- Observability (可観測性)

## 2. Ollama サポート

### 接続方法

Mastra は Vercel AI SDK を内部で使用しており、Ollama へは `ollama-ai-provider-v2` パッケージ経由で接続する。ネイティブの Ollama プロバイダーではなく、AI SDK の Provider インターフェースを通じたアダプター方式。

```bash
npm install ollama-ai-provider-v2
```

```typescript
import { createOllama } from 'ollama-ai-provider-v2';
import { Agent } from '@mastra/core/agent';

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
});

const agent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  instructions: 'You are a helpful assistant.',
  model: ollama.chat('llama3', {
    simulateStreaming: true,
  }),
});
```

### 成熟度

- 2025年10月に「Local Provider Fix: Support for Ollama and custom URLs」の修正あり
- GitHub Issue #2619 で接続問題が報告されており、`simulateStreaming: true` の設定が必要なケースがある
- ツール呼び出しに対応していないモデル (例: gemma3) では、Agent の `tools` プロパティを省略する必要がある
- Ollama Cloud (クラウドホスト版) にも対応しており、33 モデルが利用可能

### 制限事項

- ツール呼び出しのサポートは Ollama モデル側の能力に依存する (llama3, mistral 等は対応、gemma3 等は非対応)
- ストリーミングは `simulateStreaming: true` が必要な場合がある
- ローカル LLM 全般の課題として、ツール呼び出し時のハルシネーションやツール選択の不安定さがある

## 3. Agent / Tool Calling 機能

### ツール定義

`createTool()` 関数で Zod スキーマベースのツールを定義する:

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const todoTool = createTool({
  id: 'add-todo',
  description: 'Add a new TODO item',
  inputSchema: z.object({
    title: z.string(),
    completed: z.boolean().optional(),
  }),
  outputSchema: z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
  }),
  execute: async ({ context }) => {
    // ツールのロジック
    return { id: '1', title: context.title, completed: context.completed ?? false };
  },
});
```

### createTool の主要パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | string | ツールの一意識別子 |
| description | string | ツールの説明 (Agent がツール選択に使用) |
| inputSchema | Zod schema | 入力パラメータのスキーマ |
| outputSchema | Zod schema | 出力パラメータのスキーマ |
| execute | function | ツールの実行関数 |
| requireApproval | boolean | 実行前に承認を要求するか |
| suspendSchema | Zod schema | 一時停止時のペイロード構造 |
| resumeSchema | Zod schema | 再開時のデータ構造 |

ライフサイクルフック: `onInputStart`, `onInputDelta`, `onInputAvailable`, `onOutput`

### エージェント定義

```typescript
import { Agent } from '@mastra/core/agent';

const agent = new Agent({
  id: 'todo-agent',
  name: 'TODO Agent',
  instructions: 'You are a TODO list manager.',
  model: 'openai/gpt-4o',
  tools: { todoTool },
  maxSteps: 5,
  onStepFinish: (step) => {
    console.log('Step finished:', step);
  },
});
```

### Agentic Loop (マルチステップツール呼び出し)

- Agent は反復的な推論サイクルで動作する
- 各ステップ: レスポンス生成 -> ツール呼び出し -> 結果処理
- `maxSteps` パラメータで最大ステップ数を制御 (デフォルト: 1)
- 無限ループ防止、レイテンシ制御、トークン使用量の管理が可能
- `onStepFinish` コールバックでステップの進行を監視可能
- サブエージェント、ワークフローもツールとして登録可能

## 4. TypeScript サポート

- **TypeScript ファースト**: フレームワーク全体が TypeScript で書かれている
- Zod スキーマによる入出力の型安全性
- `@mastra/client-js` による型安全な API クライアント
- "If you know TypeScript, you already know 90% of Mastra" (公式)
- AI SDK v6 の LanguageModelV3 型をサポート
- フロントエンド統合: React, Next.js 対応

## 5. ドキュメントの品質

### 良い点
- 公式ドキュメント (mastra.ai/docs) が体系的に整備されている
- API リファレンスが充実 (`createTool`, `Agent` 等)
- サーバーアダプター (Express, Hono, Fastify, Koa) のドキュメントあり
- ブログに定期的な Changelog が投稿されている
- 外部のチュートリアル記事も豊富 (Medium, DEV Community 等)

### 課題
- Ollama + ローカル LLM の公式コード例が不足している
- Ollama でのツール呼び出しに関する具体的なドキュメントが薄い
- `ollama-ai-provider-v2` の設定に関しては AI SDK のドキュメントに依存している

## 6. コミュニティ & メンテナンス

| 指標 | 値 |
|------|-----|
| GitHub Stars | ~21,500 |
| Forks | ~1,633 |
| Contributors | 327 |
| Open Issues | 468 |
| npm weekly downloads (mastra) | ~221,000 |
| npm weekly downloads (@mastra/core) | ~397,000 |
| 最終コミット | 2026-02-28 (調査日前日) |
| リリース頻度 | 週1-2回 (最新: @mastra/core@1.7.0 2026-02-25) |
| 主要言語 | TypeScript |

非常に活発に開発されている。最近のコミット例:
- fix: clear stale OM continuation hints (2026-02-28)
- Fix harness getTokenUsage() returning zeros with AI SDK v5/v6 (2026-02-28)
- feat(harness): file attachment support (2026-02-28)

## 7. バンドルサイズ / 依存関係

| パッケージ | バンドルサイズ | Weekly Downloads |
|-----------|-------------|-----------------|
| mastra (CLI) | 18.5 MB | ~221,000 |
| @mastra/core | 38 MB | ~397,000 |
| @mastra/ai-sdk | 1.97 MB | ~70,000 |
| @mastra/evals | 1.16 MB | ~60,000 |
| @mastra/mcp | 1.36 MB | ~135,000 |
| @mastra/express | 308 kB | ~3,000 |

### 依存関係の課題
- `@mastra/core` は 38MB と大きい (デフォルトで @libsql/client, fastembed 等を含む)
- 未使用の依存関係を除去する最適化が計画中
- `.mastra/.build` フォルダにプリバンドルされたコードを配置して、不要なトランジティブ依存関係を削減する仕組みがある
- peer dependency の問題が報告されている (例: @ai-sdk/provider-utils のバージョン不一致)

## 8. TODO アプリプロジェクトでの Pros / Cons

### Pros

1. **TypeScript ネイティブ**: TODO アプリの TypeScript プロジェクトとの親和性が高い
2. **Zod ベースのツール定義**: 型安全なツール定義により、TODO の CRUD 操作を堅牢に実装できる
3. **Agentic Loop サポート**: maxSteps でマルチステップのタスク管理が可能 (例: TODO の追加 -> 一覧取得 -> 完了状態の確認)
4. **Human-in-the-loop**: ユーザーの承認を待つフローが組み込み済み (requireApproval)
5. **活発な開発**: 毎日のようにコミットがあり、問題の修正が速い
6. **MCP サポート**: 将来的な拡張性が高い
7. **ワークフローエンジン**: 複雑な TODO 操作のオーケストレーションが可能
8. **Y Combinator 支援 & Gatsby チーム**: プロジェクトの継続性・信頼性が高い

### Cons

1. **Ollama との統合が完全にはネイティブでない**: サードパーティの `ollama-ai-provider-v2` に依存し、公式ドキュメントが薄い
2. **バンドルサイズが大きい**: @mastra/core が 38MB で、TODO アプリには過剰な依存関係を含む
3. **Ollama でのツール呼び出しの不安定さ**: ローカル LLM のツール呼び出し精度はモデルに大きく依存し、小さなモデルではハルシネーションが発生しやすい
4. **まだ若いフレームワーク**: 1.0 リリースが 2026年1月で、エコシステムがまだ成熟途上
5. **設定の複雑さ**: Ollama 接続に `simulateStreaming: true` 等のワークアラウンドが必要なケースがある
6. **オーバーエンジニアリングの懸念**: TODO アプリに対して RAG, Evals, Workflow 等の機能は過剰
7. **peer dependency の問題**: @ai-sdk との間でバージョン不一致の問題が報告されている

### 総合評価

Mastra は TypeScript で AI エージェントを構築するための有力なフレームワークだが、Ollama (ローカル LLM) との組み合わせではいくつかの課題がある。TODO アプリのような小規模プロジェクトでは、フレームワークのフル機能は不要であり、`@mastra/core` の大きな依存関係はやや過剰。ただし、将来的にエージェント機能を拡張する予定がある場合は、充実したエコシステムと活発な開発が大きなメリットとなる。

Ollama でのツール呼び出しを重視する場合は、以下を確認すべき:
- 使用する Ollama モデルがツール呼び出しに対応しているか (llama3, mistral 等を推奨)
- `simulateStreaming` の設定が必要か
- ツール呼び出しの精度が十分か (小規模モデルでは限界がある)

## Sources

- [Mastra 公式ドキュメント](https://mastra.ai/docs)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [Mastra Ollama Provider ドキュメント](https://mastra.ai/models/providers/ollama)
- [Mastra 1.0 リリースブログ](https://mastra.ai/blog/announcing-mastra-1)
- [Mastra Apache 2.0 ライセンス変更ブログ](https://mastra.ai/blog/apache-license)
- [Mastra Y Combinator ページ](https://www.ycombinator.com/companies/mastra)
- [Mastra $13M シードラウンド](https://mastra.ai/blog/seed-round)
- [createTool() API リファレンス](https://mastra.ai/reference/tools/create-tool)
- [Agent Overview](https://mastra.ai/docs/agents/overview)
- [Ollama ローカル接続 Issue #2619](https://github.com/mastra-ai/mastra/issues/2619)
- [Mastra + Ollama + Next.js ガイド](https://danielkliewer.com/blog/2025-03-09-mastra-ollama-nextjs)
- [@mastra/core npm](https://www.npmjs.com/package/@mastra/core)
- [mastra npm](https://www.npmjs.com/package/mastra)

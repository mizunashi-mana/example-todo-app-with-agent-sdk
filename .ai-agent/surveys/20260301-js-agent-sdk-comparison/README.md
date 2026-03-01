# JS Agent SDK 比較調査（Ollama 対応）

調査日: 2026-03-01

## 調査の問い

Ollama（ローカル LLM）対応の JS/TS Agent SDK はどれが本プロジェクトに最適か？

## 背景

本プロジェクトは「Ollama と Agent SDK を使い、自然言語で操作できる TODO タスク管理アプリ」のサンプル実装。
Agent SDK の選定は Phase 2 以降の全体設計に影響するため、Phase 1 で比較調査を行う。

- 関連: `.ai-agent/steering/plan.md` Phase 1「Agent SDK の調査・比較・選定」
- 関連: `.ai-agent/steering/product.md` プロダクトビジョン

## 判断基準

| # | 基準 | 重み | 説明 |
|---|------|------|------|
| 1 | Ollama 連携のしやすさ | 高 | ツール呼び出し対応、セットアップの容易さ |
| 2 | TypeScript サポート | 高 | 型安全性、開発体験 |
| 3 | 学習コスト・わかりやすさ | 高 | 教育目的のサンプルとしての適性 |
| 4 | メンテナンス状況 | 中 | GitHub 活動、リリース頻度、バッキング |
| 5 | コミュニティの活性度 | 中 | Stars、Downloads、ドキュメント充実度 |
| 6 | 依存関係の軽さ | 低 | バンドルサイズ、依存パッケージ数 |

## 調査方法

- Web 検索（最新の技術動向、比較記事）
- 公式ドキュメント・GitHub リポジトリの確認
- npm レジストリの統計確認
- 各 SDK 6つについて並行で詳細調査を実施

## 比較対象

1. Vercel AI SDK (`ai`)
2. LangChain.js (`langchain`)
3. Ollama.js (`ollama`) - 公式クライアント
4. Mastra (`@mastra/core`)
5. Strands Agents (`@strands-agents/sdk`) - AWS
6. LlamaIndex.TS (`llamaindex`)

## 調査結果

### 比較総括表

| 項目 | Vercel AI SDK | LangChain.js | Ollama.js | Mastra | Strands Agents | LlamaIndex.TS |
|------|--------------|-------------|-----------|--------|---------------|--------------|
| **バージョン** | 6.0.105 | 1.2.28 | 0.6.3 | 1.8.0 | 0.4.0 (preview) | 0.12.1 |
| **ライセンス** | Apache 2.0 | MIT | MIT | Apache 2.0 | Apache 2.0 | MIT |
| **GitHub Stars** | 22,169 | 17,056 | 4,016 | 21,500 | 496 (TS) | 3,061 |
| **npm 週間DL** | 2,000,000+ | 1,300,000+ | 426,000 | 397,000 | 19,166 | 22,070 |
| **Contributors** | 479+ | 173 | 61 | 327 | 21 (TS) | 30 |
| **Ollama 対応** | コミュニティ | 公式パートナー | 公式クライアント | AI SDK 経由 | TS 非対応 | 公式 |
| **エージェントループ** | ToolLoopAgent | createReactAgent | なし（自作） | Agent クラス | Agent クラス | ReActAgent |
| **ツール定義** | Zod | Zod | JSON Schema | Zod | Zod | JSON Schema/Zod |
| **TypeScript** | ネイティブ | Python ポート | TypeScript | ネイティブ | ネイティブ | TypeScript |
| **バッキング** | Vercel | LangChain Inc. | Ollama | Mastra Inc. (YC) | AWS | LlamaIndex |
| **成熟度** | 安定 | 安定 | 安定 (薄い) | v1.0 直後 | 実験的 | pre-1.0 |

### スコアリング

各基準を 5 段階（5=最良）で評価:

| 基準 (重み) | Vercel AI SDK | LangChain.js | Ollama.js | Mastra | Strands Agents | LlamaIndex.TS |
|------------|--------------|-------------|-----------|--------|---------------|--------------|
| Ollama 連携 (高) | 4 | 4 | 5 | 3 | 1 | 4 |
| TypeScript (高) | 5 | 3 | 3 | 5 | 4 | 4 |
| 学習コスト (高) | 4 | 2 | 5 | 3 | 2 | 3 |
| メンテナンス (中) | 5 | 5 | 2 | 4 | 3 | 3 |
| コミュニティ (中) | 5 | 4 | 3 | 4 | 1 | 2 |
| 依存の軽さ (低) | 4 | 2 | 5 | 1 | 3 | 4 |
| **加重合計** | **4.5** | **3.3** | **3.8** | **3.4** | **1.9** | **3.3** |

※ 加重: 高=×3, 中=×2, 低=×1 で計算し 11 で割って正規化

### 詳細分析

#### 1. Vercel AI SDK（推奨）

**概要**: Vercel が開発する TypeScript-first の AI ツールキット。v6 で `ToolLoopAgent` を導入し、本格的なエージェント機能を搭載。

**Ollama 連携**:
- コミュニティプロバイダー `ai-sdk-ollama`（jagreehal）を使用
- ツール呼び出しの信頼性向上機能（JSON 自動修復、レスポンス合成）あり
- 公式ではないがドキュメントページで案内されている

**強み**:
- `ToolLoopAgent` + `tool()` が TODO CRUD に最適なパターン
- Zod ベースの型安全なツール定義
- プロバイダー抽象化により将来的な LLM 切り替えが容易
- Human-in-the-loop（`needsApproval`）でデータ削除の確認が可能
- ストリーミング対応（ローカル LLM の遅延を補う UX）
- 圧倒的なコミュニティ規模（22K stars, 2M+ DL/week）

**弱み**:
- Ollama プロバイダーがコミュニティ管理（公式ではない）
- v3→v5→v6 とバージョン変更が速い
- Ollama 固有のドキュメントが薄い

**TODO アプリでの実装イメージ**:
```typescript
import { ToolLoopAgent, tool } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import { z } from 'zod';

const addTodo = tool({
  description: 'Add a new TODO item',
  inputSchema: z.object({ title: z.string() }),
  execute: async ({ title }) => { /* CRUD */ },
});

const agent = new ToolLoopAgent({
  model: ollama('llama3.2'),
  tools: { addTodo, listTodos, completeTodo, deleteTodo },
});
```

#### 2. LangChain.js

**概要**: Python LangChain の JS/TS ポート。`@langchain/ollama` パッケージで公式パートナー連携。`@langchain/langgraph` の `createReactAgent` でエージェントループを提供。

**強み**:
- 公式 Ollama パッケージ（`@langchain/ollama`）
- 成熟したエージェントループ（ReAct, Plan-and-Execute 等）
- 最大のエコシステム（RAG、メモリ等の拡張）

**弱み**:
- Python ポートのため API が TypeScript らしくない
- 4+ パッケージが必要（`langchain`, `@langchain/core`, `@langchain/ollama`, `@langchain/langgraph`）
- `langsmith` が必須依存（未使用でも含まれる）
- 抽象化レイヤーが厚く、教育目的のサンプルとしてはブラックボックスになりがち
- API 変更が激しい（v0.1→v0.2→v0.3→v1.x、AgentExecutor→createReactAgent）

#### 3. Ollama.js（公式クライアント）

**概要**: Ollama 公式の JS/TS クライアント。REST API の薄いラッパー。

**強み**:
- 最軽量（2.7KB gzip、依存1つ）
- 最も直接的な Ollama 接続（アダプター層なし）
- ツール呼び出し API はサポート済み
- 学習コストが最も低い

**弱み**:
- エージェントループなし（while ループを自作する必要あり）
- ツール定義は生の JSON Schema（Zod 非対応、型安全性が低い）
- エラーハンドリング、リトライ、メモリ管理すべて自作
- 16ヶ月リリースなし（v0.6.3 が最新）

**補足**: エージェントの仕組みを内部から学びたい場合は良い選択肢だが、「Agent SDK の使い方を示す」というプロジェクト目的とは合わない。

#### 4. Mastra

**概要**: TypeScript-first の AI エージェントフレームワーク。Gatsby.js チームが開発、YC バック。

**強み**:
- TypeScript ネイティブ（「TypeScript を知っていれば 90% わかる」）
- Zod ベースのツール定義
- Human-in-the-loop、MCP サポート
- 活発な開発（21.5K stars）

**弱み**:
- Ollama 連携は AI SDK プロバイダー経由（二重の間接層）
- `@mastra/core` が 38MB と非常に重い
- v1.0 リリースが 2026年1月（まだ若い）
- Ollama 固有の問題（`simulateStreaming: true` 等のワークアラウンドが必要）
- peer dependency の競合が報告されている

#### 5. Strands Agents（AWS）

**概要**: AWS が開発したオープンソース AI エージェント SDK。Amazon Q Developer 等で使用。

**結論: 本プロジェクトには不適**

- TypeScript SDK は実験的プレビュー（v0.4.0）
- TypeScript での Ollama ネイティブサポートなし
- ドキュメントは Python 中心
- コミュニティが極めて小さい（TS: 496 stars, 19K DL/week）

#### 6. LlamaIndex.TS

**概要**: LlamaIndex の TypeScript 版。RAG + エージェント + ワークフローのフレームワーク。

**強み**:
- 公式 Ollama パッケージ（`@llamaindex/ollama`、72 リリース）
- ReActAgent はネイティブ Function Calling API 不要（任意の LLM で動作）
- モジュラーアーキテクチャ（必要なものだけインストール）
- MIT ライセンス

**弱み**:
- TypeScript コミュニティが小さい（3K stars vs Python 40K+）
- Ollama + ツール呼び出しの公式チュートリアルがない
- pre-1.0（v0.12.x）で破壊的変更のリスク
- npm 週間 DL が 22K と少ない
- 最終リリースから 3ヶ月のギャップ（2025-12 → 2026-02 はコミットのみ）

### 本プロジェクトへの適用

**プロジェクト要件との適合度**:

| 要件 | 最適な SDK |
|------|-----------|
| Ollama でツール呼び出し | Vercel AI SDK, LangChain.js, LlamaIndex.TS |
| TypeScript で型安全 | Vercel AI SDK, Mastra |
| 教育目的のわかりやすさ | Vercel AI SDK, Ollama.js |
| 活発なメンテナンス | Vercel AI SDK, LangChain.js, Mastra |
| 軽量な依存関係 | Ollama.js, Vercel AI SDK |

## 結論

### 推奨: Vercel AI SDK (`ai` v6 + `ai-sdk-ollama`)

**理由**:

1. **TODO CRUD との適合性**: `ToolLoopAgent` + `tool()` パターンが「自然言語 → ツール選択 → CRUD 実行」のアーキテクチャに最も自然にマッピングされる
2. **TypeScript-first の開発体験**: Zod ベースの型安全なツール定義、優れた型推論
3. **教育的価値**: API がシンプルで直感的。抽象化が適度で、エージェントの動作を理解しやすい
4. **将来性**: プロバイダー抽象化により Ollama → クラウド LLM への切り替えが容易。Vercel の継続的サポート
5. **コミュニティ**: 22K stars, 2M+ DL/week は全候補中最大。問題解決のリソースが豊富

**リスクと対策**:

| リスク | 対策 |
|--------|------|
| Ollama プロバイダーがコミュニティ管理 | `ai-sdk-ollama`（jagreehal）は AI SDK v6 対応で活発。代替として `ollama-ai-provider`（sgomez, 88K DL/week）もある |
| ローカル LLM のツール呼び出し精度 | `ai-sdk-ollama` の JSON 自動修復機能を活用。ツール呼び出し対応モデル（llama3.2, qwen3, mistral）を推奨 |
| バージョン変更の速さ | v6 は安定版。マイグレーションガイドが充実 |

**推奨構成**:
```
ai@^6.0.0 + ai-sdk-ollama@^3.0.0 + zod
```

**推奨 Ollama モデル**: `llama3.2`, `qwen3`, `mistral`（ツール呼び出し対応）

### 次のアクション

1. tech.md の Agent SDK 欄を「Vercel AI SDK v6」に更新
2. plan.md の「Agent SDK の調査・比較・選定」を完了にマーク
3. `packages/todo-app` に `ai`, `ai-sdk-ollama`, `zod` を依存追加するタスクを開始

## 参考リンク

### Vercel AI SDK
- [AI SDK 公式ドキュメント](https://ai-sdk.dev/docs/introduction)
- [AI SDK 6 ブログ](https://vercel.com/blog/ai-sdk-6)
- [GitHub - vercel/ai](https://github.com/vercel/ai)
- [Community Providers: Ollama](https://ai-sdk.dev/providers/community-providers/ollama)
- [ai-sdk-ollama (jagreehal)](https://github.com/jagreehal/ai-sdk-ollama)
- [ollama-ai-provider (sgomez)](https://github.com/sgomez/ollama-ai-provider)

### LangChain.js
- [GitHub - langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs)
- [@langchain/ollama npm](https://www.npmjs.com/package/@langchain/ollama)
- [LangChain.js ドキュメント](https://docs.langchain.com/oss/javascript/langchain/overview)

### Ollama.js
- [GitHub - ollama/ollama-js](https://github.com/ollama/ollama-js)

### Mastra
- [Mastra 公式ドキュメント](https://mastra.ai/docs)
- [GitHub - mastra-ai/mastra](https://github.com/mastra-ai/mastra)

### Strands Agents
- [Strands Agents ドキュメント](https://strandsagents.com/latest/documentation/docs/)
- [GitHub - strands-agents/sdk-typescript](https://github.com/strands-agents/sdk-typescript)

### LlamaIndex.TS
- [GitHub - run-llama/LlamaIndexTS](https://github.com/run-llama/LlamaIndexTS)
- [LlamaIndex.TS ドキュメント](https://developers.llamaindex.ai/typescript/framework/)
- [@llamaindex/ollama npm](https://www.npmjs.com/package/@llamaindex/ollama)

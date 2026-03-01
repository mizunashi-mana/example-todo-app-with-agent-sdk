# Ollama.js (ollama-js) - Agent SDK Survey

調査日: 2026-03-01

## 1. Overview

| 項目 | 内容 |
|------|------|
| 名称 | Ollama JavaScript Library (ollama-js) |
| 公式サイト | https://ollama.com/ |
| GitHub | https://github.com/ollama/ollama-js |
| npm パッケージ | https://www.npmjs.com/package/ollama |
| 現在のバージョン | 0.6.3 |
| ライセンス | MIT |
| リポジトリ作成日 | 2023年 (Ollama プロジェクトの一部) |
| 開発元 | Ollama Inc. (Ollama 本体と同じ組織) |

Ollama.js は Ollama の公式 JavaScript/TypeScript クライアントライブラリ。Ollama の REST API を薄くラップしたもので、フレームワークではなく HTTP クライアントに近い位置づけ。Node.js とブラウザの両方で動作する。

主要機能:
- chat (会話)
- generate (テキスト生成)
- embed (エンベディング)
- pull / push / create / delete / copy / list / show (モデル管理)
- Tool calling (ツール呼び出し)
- Streaming (AsyncGenerator ベース)
- Vision / Multimodal (画像入力)
- Structured outputs (JSON 形式)
- Thinking (拡張思考)
- webSearch / webFetch (Ollama Cloud 経由)
- abort (ストリーミング中止)
- version (サーバーバージョン取得)

## 2. Ollama サポート

### 接続方法

Ollama の公式クライアントであるため、Ollama との接続はネイティブかつ直接的。サードパーティのプロバイダーアダプターは不要。

```typescript
import ollama from 'ollama';

// デフォルトで http://127.0.0.1:11434 に接続
const response = await ollama.chat({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
});

// カスタムホストの場合
import { Ollama } from 'ollama';
const client = new Ollama({ host: 'http://127.0.0.1:11434' });
```

### API 対応

| API | サポート | 備考 |
|-----|---------|------|
| chat | Yes | ストリーミング対応 |
| generate | Yes | ストリーミング対応 |
| embed | Yes | dimensions パラメータ対応 |
| pull / push | Yes | プログレス表示対応 |
| create / delete / copy | Yes | モデル管理 |
| list / show / ps | Yes | モデル情報取得 |
| Tool calling | Yes | chat API 経由 |
| Vision (画像) | Yes | chat, generate 両方 |
| Structured outputs | Yes | format パラメータ |
| Thinking | Yes | think パラメータ |
| Streaming | Yes | AsyncGenerator |
| webSearch / webFetch | Yes | Ollama Cloud 経由、API キー必要 |

### 成熟度

- Ollama 本体と同じ組織が開発しているため、API の互換性は最も高い
- Ollama の新機能 (Tool calling, Thinking, Structured outputs 等) に迅速に対応する
- REST API の薄いラッパーであるため、Ollama のバージョンアップに追従しやすい

### 制限事項

- ツール呼び出しのサポートは Ollama モデル側の能力に依存する (llama3.1, mistral, qwen3 等は対応)
- Ollama Cloud の webSearch/webFetch は API キーが必要

## 3. Agent / Tool Calling 機能

### ツール定義

JSON Schema ベースのツール定義。Zod スキーマのような高レベルな抽象化はなく、素の JSON Schema を手動で記述する:

```typescript
const addTwoNumbersTool = {
  type: 'function',
  function: {
    name: 'addTwoNumbers',
    description: 'Add two numbers together',
    parameters: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: { type: 'number', description: 'The first number' },
        b: { type: 'number', description: 'The second number' },
      },
    },
  },
};
```

### Tool 型定義

```typescript
export interface Tool {
  type: string;
  function: {
    name?: string;
    description?: string;
    type?: string;
    parameters?: {
      type?: string;
      $defs?: any;
      items?: any;
      required?: string[];
      properties?: {
        [key: string]: {
          type?: string | string[];
          items?: any;
          description?: string;
          enum?: any[];
        };
      };
    };
  };
}

export interface ToolCall {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}
```

### ツール呼び出しのワークフロー

```typescript
import ollama from 'ollama';

// 1. ツール関数の実装
function addTwoNumbers(args: { a: number; b: number }): number {
  return args.a + args.b;
}

// 2. 利用可能な関数のマッピング
const availableFunctions: Record<string, Function> = {
  addTwoNumbers: addTwoNumbers,
};

// 3. ツール定義付きで chat を呼び出し
const messages = [{ role: 'user', content: 'What is 3 plus 5?' }];
const response = await ollama.chat({
  model: 'llama3.1',
  messages: messages,
  tools: [addTwoNumbersTool],
});

// 4. ツール呼び出しの処理
if (response.message.tool_calls) {
  for (const tool of response.message.tool_calls) {
    const fn = availableFunctions[tool.function.name];
    if (fn) {
      const output = fn(tool.function.arguments);
      // 5. ツール結果をメッセージ履歴に追加
      messages.push(response.message);
      messages.push({ role: 'tool', content: output.toString() });
    }
  }

  // 6. 最終レスポンスを取得
  const finalResponse = await ollama.chat({
    model: 'llama3.1',
    messages: messages,
  });
  console.log(finalResponse.message.content);
}
```

### Agentic Loop (マルチステップツール呼び出し)

**ビルトインの agentic loop は存在しない。** 開発者が自分で while ループを実装する必要がある:

```typescript
// 自前で agentic loop を構築する例
let continueLoop = true;
while (continueLoop) {
  const response = await ollama.chat({
    model: 'llama3.1',
    messages: messages,
    tools: tools,
  });

  if (response.message.tool_calls) {
    messages.push(response.message);
    for (const tool of response.message.tool_calls) {
      const fn = availableFunctions[tool.function.name];
      const result = fn(tool.function.arguments);
      messages.push({ role: 'tool', content: JSON.stringify(result) });
    }
  } else {
    // ツール呼び出しがなければループ終了
    console.log(response.message.content);
    continueLoop = false;
  }
}
```

maxSteps のようなパラメータ、onStepFinish のようなコールバック、自動的なエラーハンドリングなどは提供されない。全て自前で実装する必要がある。

### 公式 Examples

`examples/tools/` ディレクトリに3つのサンプルがある:
- `calculator.ts` - 基本的なツール呼び出し (加算・減算)
- `flight-tracker.ts` - API 呼び出しシミュレーション
- `multi-tool.ts` - マルチツール + ストリーミング + thinking

## 4. TypeScript サポート

- **TypeScript で書かれている**: ソースコード自体が TypeScript
- 全ての API メソッドに型定義がある (`ChatRequest`, `ChatResponse`, `Message`, `Tool`, `ToolCall` 等)
- ストリーミング時は `AsyncGenerator` の型が正しく提供される
- `stream: true` 設定時の型推論については、条件型 (conditional types) での切り替えはなく、手動でのキャストが必要な場面がある

### 型の品質

| 観点 | 評価 | 備考 |
|------|------|------|
| API メソッドの型 | 良好 | Request/Response が明確に型定義されている |
| Tool 定義の型 | やや弱い | `any` が多い。Zod のような型安全なスキーマ定義はない |
| ToolCall の型 | やや弱い | `arguments` が `{ [key: string]: any }` |
| ストリーミング | 良好 | AsyncGenerator の型が適切 |
| Message の型 | 普通 | `role` が `string` で、リテラル型ではない |

Tool 関連の型で `any` が多用されているのが課題。ツール定義やツール呼び出しの引数に型安全性がないため、実行時エラーが発生しやすい。Zod ベースのスキーマ検証を自前で導入することは可能だが、ライブラリ側には統合されていない。

## 5. ドキュメントの品質

### 良い点
- README に主要 API の使用例が網羅的に掲載されている
- `examples/` ディレクトリに10種類のサンプルがある (tools, multimodal, structured_outputs, thinking 等)
- Ollama 公式ドキュメント (docs.ollama.com) に Tool calling のガイドがあり、JavaScript の例も含まれている
- DeepWiki にアーキテクチャ解説がある
- Red Hat, IBM 等のサードパーティチュートリアルが豊富

### 課題
- README のツール呼び出しの説明はパラメータの列挙のみで、詳細な使用例がない
- Agentic loop のパターンは公式ドキュメントに記載があるが、ライブラリの README には含まれていない
- API リファレンス (JSDoc) は充実しているとは言えない
- ベストプラクティスやパターンの説明が限定的
- エラーハンドリングのガイダンスが不足

## 6. コミュニティ & メンテナンス

| 指標 | 値 |
|------|-----|
| GitHub Stars | ~4,016 |
| Forks | ~394 |
| Contributors | 61 |
| npm weekly downloads | ~426,000 |
| 最終更新 | 2026-02-19 |
| 最新リリース | v0.6.3 (2024-11-13) |
| 直近1年のコミット数 | 17 |
| 主要言語 | TypeScript |

### 開発活動の特徴

- コミット頻度は低め (年17回程度)。REST API の薄いラッパーであるため、Ollama 本体の API 変更時に更新される形式
- v0.6.3 が最新で、2024年11月以降リリースがない (2026年3月時点で約16ヶ月間リリースなし)
- メジャーバージョン 1.0 には到達していない
- Ollama 本体 (ollama/ollama) は 158,000 stars、非常に活発に開発されているが、JS クライアントは相対的に開発ペースが遅い
- 週間ダウンロード数 ~426,000 は健全で、広く使われている

## 7. バンドルサイズ / 依存関係

| 指標 | 値 |
|------|-----|
| Minified サイズ | 7,523 bytes (7.5 kB) |
| Gzip サイズ | 2,684 bytes (2.7 kB) |
| 依存関係数 | 1 (whatwg-fetch) |
| Unpacked サイズ | ~14.8 kB |

**極めて軽量。** 依存関係は `whatwg-fetch` (ブラウザ互換のための Fetch polyfill) のみ。Mastra の `@mastra/core` (38 MB) と比較すると 5000分の1 以下のサイズ。

## 8. TODO アプリプロジェクトでの Pros / Cons

### Pros

1. **極めて軽量**: 2.7 kB (gzip) + 依存関係1つ。TODO アプリのような小規模プロジェクトに最適なサイズ感
2. **Ollama とのネイティブ接続**: 公式クライアントであるため、接続の信頼性が最も高い。アダプター層が不要
3. **シンプルな API**: 学習コストが低い。Ollama REST API をほぼそのまま TypeScript で呼べる
4. **Tool calling サポート**: ツール定義と呼び出しの基本機能は備わっている
5. **ゼロ設定**: デフォルトで `localhost:11434` に接続。`simulateStreaming` 等のワークアラウンドは不要
6. **MIT ライセンス**: 利用制限なし
7. **広い普及率**: 週 ~426,000 ダウンロード。コミュニティの知見が豊富
8. **ブラウザ対応**: `ollama/browser` で Web フロントエンドからも直接利用可能

### Cons

1. **Agentic loop がない**: マルチステップのツール呼び出しを全て自前で実装する必要がある。maxSteps, onStepFinish, 自動リトライ等のエージェント機能は一切なし
2. **Tool 定義の型安全性が弱い**: JSON Schema を手書きで定義する必要があり、Zod のような型安全なスキーマ検証がない。`arguments` の型が `any`
3. **エージェントの抽象化がない**: Agent クラス、instructions (システムプロンプト管理)、メモリ、ワークフロー等のエージェント構築に必要な機能は一切提供されない
4. **エラーハンドリングが開発者任せ**: ツール呼び出し失敗時のリトライ、タイムアウト、フォールバック等を全て自前で実装する必要がある
5. **開発ペースが遅い**: 16ヶ月間リリースがなく、v1.0 に到達していない
6. **ツール呼び出しの結果型が型安全でない**: ツールの戻り値を `content: output.toString()` のように文字列化して渡す必要がある
7. **Human-in-the-loop のサポートなし**: ユーザー確認のフローは全て自前で構築する必要がある
8. **MCP (Model Context Protocol) 非対応**: MCP サーバーとの統合機能はない

### 自前で構築が必要な機能一覧

TODO アプリのエージェントを構築するには、以下を全て自前で実装する必要がある:

| 機能 | 難易度 | 説明 |
|------|--------|------|
| Agentic loop | 中 | while ループ + tool_calls 判定 + メッセージ履歴管理 |
| maxSteps 制御 | 低 | カウンターで上限を設定 |
| システムプロンプト管理 | 低 | messages 配列の先頭に system メッセージを追加 |
| ツール呼び出しのバリデーション | 中 | Zod 等を別途導入して引数を検証 |
| エラーハンドリング | 中 | try-catch + リトライロジック |
| 会話履歴管理 | 中 | メッセージ配列の管理、トークン数の制御 |
| Human-in-the-loop | 高 | 実行確認フローの設計・実装 |
| ストリーミング UI 統合 | 高 | AsyncGenerator の消費とフロントエンドへの接続 |

### 総合評価

Ollama.js は Ollama の公式クライアントとして、Ollama との接続の信頼性とシンプルさにおいて最も優れている。極めて軽量で依存関係も最小限。しかし、これは「SDK」であって「フレームワーク」ではない。エージェントを構築するための高レベルな抽象化 (agentic loop, ツールのバリデーション, メモリ管理等) は一切提供されない。

TODO アプリプロジェクトにおいては以下のケースで適切:
- **最小限の依存関係で、エージェントの仕組みを学びながら構築したい場合**: 全てを自前で実装するため、エージェントの内部動作を深く理解できる
- **フレームワークのオーバーヘッドを避けたい場合**: 2.7 kB vs 38 MB (@mastra/core) は大きな差
- **Ollama との接続の安定性を最優先する場合**: サードパーティアダプター経由よりも信頼性が高い

以下のケースでは不適切:
- **エージェント機能を素早く構築したい場合**: Agentic loop、エラーハンドリング、バリデーション等を全て自前で構築するコストが高い
- **型安全性を重視する場合**: Tool 定義の `any` 型が多く、ランタイムエラーのリスクがある
- **将来的に複雑なエージェント機能を拡張する予定がある場合**: ワークフロー、メモリ、評価等の機能は全て自前で構築する必要がある

**一言で言えば**: 「最もシンプルだが、最も多くを自分で構築する必要がある」選択肢。

## Sources

- [Ollama.js GitHub リポジトリ](https://github.com/ollama/ollama-js)
- [Ollama.js npm パッケージ](https://www.npmjs.com/package/ollama)
- [Ollama 公式ドキュメント - Tool Calling](https://docs.ollama.com/capabilities/tool-calling)
- [Ollama Blog - Tool Support](https://ollama.com/blog/tool-support)
- [Ollama Blog - Streaming Tool Calling](https://ollama.com/blog/streaming-tool)
- [Ollama Blog - Python & JavaScript Libraries](https://ollama.com/blog/python-javascript-libraries)
- [Ollama.js Releases](https://github.com/ollama/ollama-js/releases)
- [Ollama.js Calculator Example](https://github.com/ollama/ollama-js/blob/main/examples/tools/calculator.ts)
- [Ollama.js Multi-Tool Example](https://github.com/ollama/ollama-js/blob/main/examples/tools/multi-tool.ts)
- [DeepWiki - Ollama.js Tool Calling](https://deepwiki.com/ollama/ollama-js/5.2-tool-calling)
- [Red Hat - Tool Use/Function Calling with Node.js and Ollama](https://developers.redhat.com/blog/2024/09/10/quick-look-tool-usefunction-calling-nodejs-and-ollama)
- [Bundlephobia - ollama](https://bundlephobia.com/package/ollama@0.6.3)
- [npm Downloads API](https://api.npmjs.org/downloads/point/last-week/ollama)
- [Bright Coding - Guide to Ollama-js](https://www.blog.brightcoding.dev/2025/12/09/guide-to-ollama-js-revolutionizing-ai-integration-in-javascript-applications/)
- [TypeScript Ollama Integration Guide](https://markaicode.com/typescript-ollama-integration-type-safe-development/)

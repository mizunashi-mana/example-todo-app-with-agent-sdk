# Strands Agents (AWS) - Research Survey

調査日: 2026-03-01

## 1. Overview

| 項目 | 詳細 |
|------|------|
| 名前 | Strands Agents SDK |
| 開発元 | AWS (Amazon Web Services) |
| ライセンス | Apache-2.0 |
| 初回リリース | 2025年5月16日 (Python SDK オープンソース公開) |
| TypeScript SDK 発表 | 2025年12月3日 (preview) |
| Python 最新バージョン | v1.28.0 (2026-02-25) |
| TypeScript 最新バージョン | v0.4.0 (2026-02-25) |
| リポジトリ (Python) | https://github.com/strands-agents/sdk-python |
| リポジトリ (TypeScript) | https://github.com/strands-agents/sdk-typescript |
| npm パッケージ | @strands-agents/sdk |
| PyPI パッケージ | strands-agents |
| 公式ドキュメント | https://strandsagents.com/latest/ |

Strands Agents は AWS が開発したオープンソースの AI エージェント SDK。「model-driven approach」を採用し、LLM の推論能力に計画とツール使用を委ねるアーキテクチャ。Amazon Q Developer, AWS Glue, VPC Reachability Analyzer など AWS の本番プロダクトで使用されている。

## 2. Ollama サポート

### Python SDK: ネイティブサポートあり

- `OllamaModel` クラスによるネイティブ統合
- インストール: `pip install 'strands-agents[ollama]' strands-agents-tools`
- テキスト生成、画像理解、ツール/関数呼び出し、ストリーミング、構造化出力をサポート
- `host`, `model_id`, `temperature`, `top_p`, `keep_alive` 等の設定可能

### TypeScript SDK: ネイティブ Ollama サポートなし

**公式ドキュメントに明記: "This provider is only supported in Python."**

TypeScript SDK でサポートされているモデルプロバイダー:
- Amazon Bedrock (デフォルト)
- OpenAI
- Gemini
- Custom Providers

**ワークアラウンド**: Ollama は OpenAI 互換 API を提供するため、TypeScript の `OpenAIModel` を `baseURL` 設定で Ollama に接続可能:

```typescript
const model = new OpenAIModel({
  apiKey: 'ollama', // Ollama は API key 不要だが空でない値が必要
  clientConfig: {
    baseURL: 'http://localhost:11434/v1',
  },
  modelId: 'llama3.1',
})
```

ただし、これは公式にサポートされた方法ではなく、Ollama 固有の機能（画像理解、構造化出力等）へのアクセスは制限される可能性がある。

### 成熟度評価

- Python Ollama 統合: **成熟** (ネイティブサポート、ドキュメント充実)
- TypeScript Ollama 統合: **未成熟** (ネイティブ未対応、OpenAI 互換経由のワークアラウンドのみ)

## 3. 言語サポート

| 言語 | ステータス | バージョン | 備考 |
|------|-----------|-----------|------|
| Python | GA (安定版) | v1.28.0 | フル機能、17+ モデルプロバイダー |
| TypeScript | Preview (実験的) | v0.4.0 | 機能限定、4 モデルプロバイダーのみ |

**重要**: TypeScript SDK は存在するが **preview/experimental** ステータスであり、以下の制限がある:
- Python SDK の全機能をサポートしていない
- breaking changes が予想される
- 本番環境での使用は慎重に

## 4. Agent/Tool Calling 機能

### Agent Loop (エージェントループ)

- モデル呼び出し -> ツール使用判断 -> ツール実行 -> 結果をモデルに返す -> 繰り返し
- マルチステップツール呼び出しをサポート
- エラーが発生してもループを中断せず、エラー情報をモデルに返して回復を試みる
- 会話履歴を蓄積し、コンテキストウィンドウの範囲内で推論を継続
- TypeScript/Python 両方で動作

### ツール定義

**Python**:
```python
@tool
def my_tool(param: str) -> str:
    """Tool description for the LLM."""
    return result
```

**TypeScript**:
```typescript
const myTool = tool({
  name: 'myTool',
  description: 'Tool description for the LLM',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  callback: async ({ param }) => {
    return result;
  },
});
```

### サポートするツールタイプ

1. **Custom Tools** - SDK のインターフェースで独自ツールを構築
2. **Vended Tools** - プリビルトツール (Python/TypeScript 両方)
3. **MCP Tools** - Model Context Protocol 準拠ツール

### マルチエージェント

- Swarm、Graph、Workflow アーキテクチャをサポート
- Agents-as-Tools パターン (エージェントをツールとして他のエージェントに提供)

### TypeScript でのツール制限

- ファイルベースのツールロードは未サポート
- 自動ツールリロードは未サポート
- 構造化出力はカスタムモデルプロバイダーでは未対応

## 5. TypeScript SDK の詳細

| 項目 | 詳細 |
|------|------|
| パッケージ | @strands-agents/sdk |
| バージョン | v0.4.0 (preview) |
| 言語 | TypeScript (98%+) |
| Node.js 要件 | 20+ |
| 型安全性 | Zod スキーマによるツール定義、型付き AgentResult |
| async/await | フルサポート |
| ストリーミング | リアルタイムレスポンスストリーミングサポート |
| ライフサイクルフック | 拡張可能 |
| ブラウザサポート | あり (軽量設計) |
| モデルプロバイダー | 4つ (Bedrock, OpenAI, Gemini, Custom) |

### TypeScript SDK の制限事項

- **experimental/preview ステータス** - breaking changes が発生する可能性
- Ollama ネイティブサポートなし
- Anthropic プロバイダーなし (TypeScript)
- LiteLLM サポートなし (TypeScript)
- ファイルベースツールロード未対応
- 構造化出力がカスタムプロバイダーで未対応
- Python SDK に比べ機能が大幅に少ない

## 6. ドキュメント品質

### 全体評価: 良好 (Python), 普通 (TypeScript)

**ドキュメントサイト**: https://strandsagents.com/latest/

**構成**:
- クイックスタートガイド (Python/TypeScript)
- コンセプトドキュメント (Agents, Tools, Model Providers)
- API リファレンス (Python/TypeScript)
- セキュリティ・安全性ガイド
- デプロイメントガイド (Lambda, Fargate, EKS, Docker 等)
- 評価フレームワークドキュメント

**サンプル・チュートリアル**:
- GitHub samples リポジトリ (https://github.com/strands-agents/samples)
- Jupyter Notebook チュートリアル
- Python の例は豊富
- TypeScript の例は限定的

**注意点**:
- ドキュメントは主に Python 中心
- TypeScript のドキュメントは基本的なクイックスタートとAPI リファレンスのみ
- Ollama + TypeScript の組み合わせに関するドキュメントは存在しない

## 7. コミュニティ & メンテナンス

### GitHub

| 指標 | sdk-python | sdk-typescript |
|------|-----------|---------------|
| Stars | 5,221 | 496 |
| Forks | 676 | 62 |
| Contributors | 94 | 21 |
| Watchers | 50 | 7 |
| 作成日 | 2025-05-14 | 2025-09-19 |
| 最終更新 | 2026-03-01 | 2026-02-28 |
| 最新リリース | v1.28.0 (2026-02-25) | v0.4.0 (2026-02-25) |

### ダウンロード数

| プラットフォーム | パッケージ | 週間ダウンロード |
|----------------|-----------|----------------|
| PyPI | strands-agents | ~1,324,501/week |
| npm | @strands-agents/sdk | ~19,166/week |

### 開発活動

- Python SDK: 非常に活発 (2026年2月末も毎日コミット、1,768+ issues/PRs)
- TypeScript SDK: 活発 (2026年2月末も毎日コミット、584+ issues/PRs)
- 企業貢献: Accenture, Anthropic, Langfuse, mem0.ai, Meta, PwC, Ragas.io, Tavily

### 累計ダウンロード

- PyPI 累計: 約14,000,000 (AWS ブログ記載)
- npm 累計: 不明 (preview 期間が短いため相対的に少ない)

## 8. TODO アプリプロジェクト (Ollama + JavaScript/TypeScript) への Pros/Cons

### Pros

1. **AWS のバッキング**: AWS の本番プロダクトで使用されており、長期的なメンテナンスが期待できる
2. **TypeScript SDK が存在する**: Python-only ではなく、TypeScript で開発可能
3. **型安全なツール定義**: Zod スキーマによる型安全なツール定義が可能
4. **Agent Loop が強力**: マルチステップツール呼び出し、エラー回復、会話管理が組み込み
5. **MCP サポート**: Model Context Protocol 対応で将来の拡張性あり
6. **OpenAI 互換 API 経由で Ollama 接続可能**: ワークアラウンドだが技術的には可能
7. **活発な開発**: 2026年2月時点でも頻繁にコミットされている
8. **Apache-2.0 ライセンス**: 商用利用に適した寛容なライセンス

### Cons

1. **TypeScript SDK は experimental/preview**: v0.4.0 であり、breaking changes のリスクが高い
2. **Ollama ネイティブサポートなし (TypeScript)**: OpenAI 互換 API 経由のワークアラウンドが必要
3. **TypeScript の機能が Python に大幅に劣る**: 17 プロバイダー vs 4 プロバイダー
4. **npm ダウンロード数が少ない**: 週19,166 はコミュニティの小ささを示す
5. **TypeScript ドキュメントが薄い**: Python 中心のドキュメント
6. **Ollama + TypeScript の公式ドキュメント/サンプルがない**: 自力で OpenAI 互換経由の設定が必要
7. **デフォルトが AWS Bedrock**: ローカル Ollama 使用が主目的の場合、AWS 依存の設計思想がミスマッチ
8. **構造化出力がカスタムプロバイダーで未対応 (TypeScript)**: Ollama 使用時に制限となる可能性

### 総合判定

**Ollama + TypeScript の組み合わせでの推奨度: 低~中**

Strands Agents は AWS エコシステムとの統合が主な強みであり、ローカル LLM (Ollama) + TypeScript という組み合わせは現時点ではプライマリなユースケースではない。TypeScript SDK が preview であること、Ollama のネイティブサポートがないことが大きなリスク要因。ただし、OpenAI 互換 API 経由での接続は技術的に可能であり、AWS のバッキングによる将来の改善は期待できる。

TODO アプリのような比較的シンプルなプロジェクトでは、エージェントループとツール呼び出しの基本機能は TypeScript SDK でもカバーできるが、Ollama 統合部分で追加の設定作業が必要になる。

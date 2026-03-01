import { stepCountIs, type ModelMessage, type ToolCallPart, type ToolResultPart } from 'ai';
import { generateText, ollama } from 'ai-sdk-ollama';
import { createTodoTools } from '#tools';

const DEFAULT_MODEL = 'gemma3';
const MAX_STEPS = 10;

const SYSTEM_PROMPT = `You are a helpful TODO management assistant.
You help users manage their TODO items by operating the TODO app UI.

When a user asks to create, list, update, or delete TODOs, use the appropriate tool.
The tools will operate the UI elements on the screen (forms, buttons, checkboxes).
Always confirm the action taken and show relevant results to the user.
Respond in the same language as the user.`;

// --- Message types for the API layer ---

export interface TextMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolCallMessage {
  role: 'assistant';
  toolCalls: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
  }>;
}

export interface ToolResultMessage {
  role: 'tool';
  toolResults: Array<{
    toolCallId: string;
    toolName: string;
    result: unknown;
  }>;
}

export type ChatMessage = TextMessage | ToolCallMessage | ToolResultMessage;

export function isTextMessage(msg: ChatMessage): msg is TextMessage {
  return 'content' in msg && typeof msg.content === 'string';
}

export function isToolCallMessage(msg: ChatMessage): msg is ToolCallMessage {
  return msg.role === 'assistant' && 'toolCalls' in msg;
}

export function isToolResultMessage(msg: ChatMessage): msg is ToolResultMessage {
  return msg.role === 'tool' && 'toolResults' in msg;
}

// --- Chat response types ---

export interface ChatTextResponse {
  type: 'text';
  content: string;
}

export interface ChatToolCallsResponse {
  type: 'tool_calls';
  toolCalls: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
  }>;
}

export type ChatResponse = ChatTextResponse | ChatToolCallsResponse;

// --- Error types ---

export interface AgentOptions {
  model?: string;
}

export type AgentErrorCode = 'OLLAMA_CONNECTION_ERROR' | 'AGENT_ERROR';

export class AgentError extends Error {
  code: AgentErrorCode;

  constructor(code: AgentErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AgentError';
    this.code = code;
  }
}

function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('econnrefused')
    || msg.includes('econnreset')
    || msg.includes('fetch failed')
    || msg.includes('connect etimedout');
}

const MODEL_NOT_FOUND_PATTERN = /model\s+'[^']*'\s+not found/i;

function classifyAgentError(error: unknown): AgentError {
  const cause = error instanceof Error ? { cause: error } : undefined;

  if (isConnectionError(error)) {
    return new AgentError(
      'OLLAMA_CONNECTION_ERROR',
      'Cannot connect to Ollama. Please ensure Ollama is running (run "ollama serve" in a terminal).',
      cause,
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  if (MODEL_NOT_FOUND_PATTERN.test(message)) {
    return new AgentError(
      'OLLAMA_CONNECTION_ERROR',
      `Model not found. Please download it first (run "ollama pull <model>").`,
      cause,
    );
  }

  return new AgentError('AGENT_ERROR', message, cause);
}

// --- Convert API messages to SDK ModelMessage format ---

function toModelMessages(messages: ChatMessage[]): ModelMessage[] {
  return messages.map((msg): ModelMessage => {
    if (isToolCallMessage(msg)) {
      return {
        role: 'assistant',
        content: msg.toolCalls.map((tc): ToolCallPart => ({
          type: 'tool-call',
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          input: tc.args,
        })),
      };
    }
    if (isToolResultMessage(msg)) {
      return {
        role: 'tool',
        content: msg.toolResults.map((tr): ToolResultPart => ({
          type: 'tool-result',
          toolCallId: tr.toolCallId,
          toolName: tr.toolName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/consistent-type-imports -- result is JSON-serializable from frontend
          output: { type: 'json' as const, value: tr.result as import('ai').JSONValue },
        })),
      };
    }
    // TextMessage (user or assistant with string content)
    return { role: msg.role, content: msg.content };
  });
}

// --- Agent ---

export interface ChatOptions {
  model?: string;
}

export function createTodoAgent(options?: AgentOptions) {
  const tools = createTodoTools();
  const defaultModel = options?.model ?? DEFAULT_MODEL;

  async function chat(messages: ChatMessage[], chatOptions?: ChatOptions): Promise<ChatResponse> {
    const modelName = chatOptions?.model ?? defaultModel;
    try {
      const modelMessages = toModelMessages(messages);
      const result = await generateText({
        model: ollama(modelName),
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        tools,
        stopWhen: stepCountIs(MAX_STEPS),
      });

      if (result.toolCalls.length > 0) {
        return {
          type: 'tool_calls',
          toolCalls: result.toolCalls.map(tc => ({
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- input is typed by SDK tool schema
            args: tc.input as Record<string, unknown>,
          })),
        };
      }

      return {
        type: 'text',
        content: result.text !== '' ? result.text : '(No response generated)',
      };
    }
    catch (error) {
      throw classifyAgentError(error);
    }
  }

  return { chat };
}

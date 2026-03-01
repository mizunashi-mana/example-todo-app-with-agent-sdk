import { stepCountIs } from 'ai';
import { generateText, ollama } from 'ai-sdk-ollama';
import { createTodoTools } from '#tools';
import type { TodoStorage } from '#storage';

const DEFAULT_MODEL = 'llama3.2';
const MAX_STEPS = 10;

const SYSTEM_PROMPT = `You are a helpful TODO management assistant.
You help users manage their TODO items using the available tools.

When a user asks to create, list, update, or delete TODOs, use the appropriate tool.
Always confirm the action taken and show relevant results to the user.
Respond in the same language as the user.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentOptions {
  model?: string;
}

export type AgentErrorCode = 'OLLAMA_CONNECTION_ERROR' | 'AGENT_ERROR';

export class AgentError extends Error {
  code: AgentErrorCode;

  constructor(code: AgentErrorCode, message: string) {
    super(message);
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

function classifyAgentError(error: unknown): AgentError {
  if (isConnectionError(error)) {
    return new AgentError(
      'OLLAMA_CONNECTION_ERROR',
      'Cannot connect to Ollama. Please ensure Ollama is running (run "ollama serve" in a terminal).',
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  if (message.includes('model') && message.includes('not found')) {
    return new AgentError(
      'OLLAMA_CONNECTION_ERROR',
      `Model not found. Please download it first (run "ollama pull <model>").`,
    );
  }

  return new AgentError('AGENT_ERROR', message);
}

export function createTodoAgent(storage: TodoStorage, options?: AgentOptions) {
  const tools = createTodoTools(storage);
  const modelName = options?.model ?? DEFAULT_MODEL;

  async function chat(messages: ChatMessage[]): Promise<string> {
    try {
      const result = await generateText({
        model: ollama(modelName),
        system: SYSTEM_PROMPT,
        messages,
        tools,
        stopWhen: stepCountIs(MAX_STEPS),
      });

      return result.text !== '' ? result.text : '(No response generated)';
    }
    catch (error) {
      throw classifyAgentError(error);
    }
  }

  return { chat };
}

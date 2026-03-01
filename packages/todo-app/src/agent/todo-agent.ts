import { generateText, stepCountIs } from 'ai';
import { ollama } from 'ai-sdk-ollama';
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

export function createTodoAgent(storage: TodoStorage, options?: AgentOptions) {
  const tools = createTodoTools(storage);
  const modelName = options?.model ?? DEFAULT_MODEL;

  async function chat(messages: ChatMessage[]): Promise<string> {
    const result = await generateText({
      model: ollama(modelName),
      system: SYSTEM_PROMPT,
      messages,
      tools,
      stopWhen: stepCountIs(MAX_STEPS),
    });

    return result.text !== '' ? result.text : '(No response generated)';
  }

  return { chat };
}

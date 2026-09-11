// Eval-local catalog extension using Pi's existing OpenAI Codex auth and transport.
// Context 272000 comes from local Codex models_cache.json for gpt-6-astra.
// Output 32768 is a conservative evaluation cap, not a published model limit.
// Zero cost fields mean unavailable pricing, not free usage.
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

export default function (pi: ExtensionAPI) {
  pi.registerProvider('openai-codex', {
    api: 'openai-codex-responses',
    baseUrl: 'https://chatgpt.com/backend-api',
    models: [{
      id: 'gpt-6-astra',
      name: 'GPT-6 Astra (evaluation catalog)',
      reasoning: true,
      input: ['text', 'image'],
      contextWindow: 272000,
      maxTokens: 32768,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    }],
  });
}

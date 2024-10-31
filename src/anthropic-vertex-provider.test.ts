import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAnthropicVertex, AnthropicVertexProvider } from './anthropic-vertex-provider';
import { AnthropicMessagesLanguageModel } from './anthropic-messages-language-model';

vi.mock('./anthropic-messages-language-model', () => ({
  AnthropicMessagesLanguageModel: vi.fn().mockImplementation((modelId, settings, config) => ({
    modelId,
    settings,
    config,
  })),
}));

describe('AnthropicVertex Provider', () => {
  let provider: AnthropicVertexProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = createAnthropicVertex({
      project: 'test-project',
      location: 'us-central1',
    });
  });

  it('creates a provider with specified settings', () => {
    expect(provider).toBeDefined();
    expect(typeof provider).toBe('function');
    expect(provider.languageModel).toBeDefined();
  });

  it('creates a language model with specified model ID', () => {
    const model = provider('claude-3-opus@20240229');

    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        provider: 'anthropic.vertex',
        project: 'test-project',
        location: 'us-central1',
      }),
    );
    expect(model).toBeDefined();
  });

  it('throws an error when called with new keyword', () => {
    expect(() => {
      // @ts-expect-error - Intentionally calling with new for testing
      new provider('claude-3-opus@20240229');
    }).toThrow('The Anthropic model function cannot be called with the new keyword.');
  });

  it('creates a provider with specified baseURL', () => {
    const customProvider = createAnthropicVertex({
      project: 'test-project',
      location: 'us-central1',
      baseURL: 'https://{location}-aiplatform.googleapis.com/v1',
    });
    customProvider('claude-3-opus@20240229');

    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        baseURL: 'https://us-central1-aiplatform.googleapis.com/v1',
      }),
    );
  });

  it('uses provided Google Auth instance', () => {
    const customProvider = createAnthropicVertex({
      project: 'test-project',
      location: 'us-central1',
    });
    customProvider('claude-3-opus@20240229');

    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        googleAuth: expect.objectContaining({
          getClient: expect.any(Function),
        }),
      }),
    );
  });

  it('creates a chat model', () => {
    const languageModel = provider.languageModel('claude-3-opus@20240229');

    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        provider: 'anthropic.vertex',
        project: 'test-project',
        location: 'us-central1',
      }),
    );
    expect(languageModel).toBeDefined();
  });

  it('throws an error when no region/project credentials are set', () => {
    // Clear any environment variables
    const originalEnv = process.env;
    process.env = {};

    expect(() => {
      createAnthropicVertex();
    }).toThrow(
      "Google Vertex project setting is missing. Pass it using the 'project' parameter or the GOOGLE_VERTEX_PROJECT environment variable.",
    );

    // Restore the original environment
    process.env = originalEnv;
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAnthropicVertex, AnthropicVertexProvider } from './anthropic-vertex-provider';
import { AnthropicMessagesLanguageModel } from './anthropic-messages-language-model';
import { GoogleAuth } from 'google-auth-library';

vi.mock('google-auth-library', () => ({
  GoogleAuth: vi.fn().mockImplementation(() => ({
    getClient: vi.fn().mockResolvedValue({
      getRequestHeaders: vi.fn().mockResolvedValue({ 'Authorization': 'Bearer mock-token' })
    })
  }))
}));

vi.mock('./anthropic-messages-language-model', () => ({
  AnthropicMessagesLanguageModel: vi.fn().mockImplementation((modelId, settings, config) => ({
    modelId,
    settings,
    config,
  }))
}));

describe('AnthropicVertex Provider', () => {
  let provider: AnthropicVertexProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = createAnthropicVertex({
      projectId: 'test-project',
      region: 'us-central1',
    });
  });

  it('creates a provider with specified settings', () => {
    expect(provider).toBeDefined();
    expect(typeof provider).toBe('function');
    expect(provider.languageModel).toBeDefined();
    expect(provider.chat).toBeDefined();
  });

  it('creates a language model with specified model ID', () => {
    const model = provider('claude-3-opus@20240229');

    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        provider: 'anthropic.messages',
        projectId: 'test-project',
        region: 'us-central1',
      })
    );
    expect(model).toBeDefined();
  });

  it('throws an error when called with new keyword', () => {
    expect(() => {
      // @ts-expect-error - Intentionally calling with new for testing
      new provider('claude-3-opus@20240229');
    }).toThrow('The Anthropic model function cannot be called with the new keyword.');
  });

  it('uses provided Google Auth instance', () => {
    const mockGoogleAuth = new GoogleAuth();
    const customProvider = createAnthropicVertex({
      googleAuth: mockGoogleAuth,
      projectId: 'test-project',
      region: 'us-central1',
    });
    customProvider('claude-3-opus@20240229');

    expect(GoogleAuth).toHaveBeenCalledTimes(2); // Once for the custom instance, once for the internal instance
    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        googleAuth: mockGoogleAuth,
      })
    );
  });

  it('creates a chat model', () => {
    const chatModel = provider.chat('claude-3-opus@20240229');

    expect(AnthropicMessagesLanguageModel).toHaveBeenCalledWith(
      'claude-3-opus@20240229',
      {},
      expect.objectContaining({
        provider: 'anthropic.messages',
        projectId: 'test-project',
        region: 'us-central1',
      })
    );
    expect(chatModel).toBeDefined();
  });

  it('throws an error when no region/project credentials are set', () => {
    // Clear any environment variables
    const originalEnv = process.env;
    process.env = {};

    expect(() => {
      createAnthropicVertex();
    }).toThrow('Google Vertex project id setting is missing. Pass it using the \'projectId\' parameter or the GOOGLE_VERTEX_PROJECT_ID environment variable.');

    // Restore the original environment
    process.env = originalEnv;
  });
});

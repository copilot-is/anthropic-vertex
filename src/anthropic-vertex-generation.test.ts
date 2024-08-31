/* eslint-disable  @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAnthropicVertex, AnthropicVertexProvider } from './anthropic-vertex-provider';
import { AnthropicMessagesLanguageModel } from './anthropic-messages-language-model';
import { postJsonToApi } from '@ai-sdk/provider-utils';

vi.mock('google-auth-library', () => ({
  GoogleAuth: vi.fn().mockImplementation(() => ({
    getClient: vi.fn().mockResolvedValue({
      getRequestHeaders: vi.fn().mockResolvedValue({ Authorization: 'Bearer mock-token' }),
    }),
  })),
}));

vi.mock('@ai-sdk/provider-utils', async () => {
  const actual = await vi.importActual('@ai-sdk/provider-utils');
  return {
    ...actual,
    postJsonToApi: vi.fn(),
  };
});

describe('AnthropicVertex Provider Integration', () => {
  let provider: AnthropicVertexProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = createAnthropicVertex({
      projectId: 'test-project',
      region: 'us-central1',
    });
  });

  it('creates a language model with the correct configuration', () => {
    const model = provider('claude-3-haiku@20240307');
    expect(model).toBeInstanceOf(AnthropicMessagesLanguageModel);
    expect(model.modelId).toBe('claude-3-haiku@20240307');
    expect((model as any).config.projectId).toBe('test-project');
    expect((model as any).config.region).toBe('us-central1');
  });

  it('creates a provider with custom region and project ID', () => {
    const customProvider = createAnthropicVertex({
      region: 'europe-west1',
      projectId: 'custom-project',
    });
    const model = customProvider('claude-3-5-sonnet@20240620');
    expect(model).toBeInstanceOf(AnthropicMessagesLanguageModel);
    expect(model.modelId).toBe('claude-3-5-sonnet@20240620');
    expect((model as any).config.projectId).toBe('custom-project');
    expect((model as any).config.region).toBe('europe-west1');
  });

  it('supports text generation', async () => {
    const model = provider('claude-3-haiku@20240307');
    vi.spyOn(model, 'doGenerate').mockResolvedValue({
      text: '6x12 is 72.',
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 5 },
      rawCall: {
        rawPrompt: undefined,
        rawSettings: undefined as any,
      },
    });

    const result = await model.doGenerate({
      prompt: [{ role: 'user', content: [{ type: 'text', text: 'What is 6x12?' }] }],
      mode: { type: 'regular' },
      inputFormat: 'prompt',
    });

    expect(result.text).toBe('6x12 is 72.');
    expect(model.doGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: [{ role: 'user', content: [{ type: 'text', text: 'What is 6x12?' }] }],
      }),
    );
  });

  it('supports streaming text generation', async () => {
    const model = provider('claude-3-5-sonnet@20240620');
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue({ type: 'text-delta', textDelta: 'Embedding' });
        controller.enqueue({ type: 'text-delta', textDelta: ' models' });
        controller.enqueue({ type: 'text-delta', textDelta: ' are' });
        controller.enqueue({
          type: 'finish',
          finishReason: 'stop',
          usage: { promptTokens: 15, completionTokens: 10 },
        });
        controller.close();
      },
    });

    vi.spyOn(model, 'doStream').mockResolvedValue({
      stream: mockStream,
      rawCall: { rawPrompt: [], rawSettings: {} },
      rawResponse: { headers: new Headers() as any },
      warnings: [],
    });

    const result = await model.doStream({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Write a long poem about embedding models.',
            },
          ],
        },
      ],
      inputFormat: 'prompt',
      mode: {
        type: 'regular',
        tools: undefined,
        toolChoice: undefined,
      },
    });

    const reader = result.stream.getReader();
    const chunks = [];
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) chunks.push(value);
    }

    expect(chunks).toHaveLength(4);
    expect(chunks[0]).toEqual({ type: 'text-delta', textDelta: 'Embedding' });
    expect(chunks[1]).toEqual({ type: 'text-delta', textDelta: ' models' });
    expect(chunks[2]).toEqual({ type: 'text-delta', textDelta: ' are' });
    expect(chunks[3]).toEqual({
      type: 'finish',
      finishReason: 'stop',
      usage: { promptTokens: 15, completionTokens: 10 },
    });

    expect(model.doStream).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Write a long poem about embedding models.' }],
          },
        ],
      }),
    );
  });

  it('supports tool calls', async () => {
    const model = provider('claude-3-haiku@20240307');

    // Mock the API response
    (postJsonToApi as any).mockResolvedValue({
      value: {
        content: [
          {
            type: 'tool_use',
            id: 'toolu_vrtx_01Gg47Tt2uYNMop8F2igxdHh',
            name: 'celsiusToFahrenheit',
            input: { value: '30' },
          }
        ],
        stop_reason: 'tool_calls',
        usage: { input_tokens: 20, output_tokens: 15 },
      },
      responseHeaders: new Headers(),
    });

    const result = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'What is 30 degrees Celsius in Fahrenheit?' }],
        },
      ],
      mode: {
        type: 'regular',
        tools: [
          {
            name: 'celsiusToFahrenheit',
            description: 'Converts celsius to fahrenheit',
            parameters: {
              type: 'object',
              properties: {
                value: { type: 'string', description: 'The value in celsius' },
              },
              required: ['value'],
            },
            type: 'function'
          },
        ],
      },
      inputFormat: 'prompt',
    });

    expect(result.text).toBe('');
    expect(result.toolCalls).toEqual([
      {
        toolCallType: 'function',
        toolCallId: 'toolu_vrtx_01Gg47Tt2uYNMop8F2igxdHh',
        toolName: 'celsiusToFahrenheit',
        args: JSON.stringify({ value: '30' }),
      },
    ]);
    expect(result.finishReason).toBe('other');

    // Verify that postJsonToApi was called with the correct arguments
    expect(postJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/projects/test-project/locations/us-central1/publishers/anthropic/models/claude-3-haiku@20240307:rawPredict'),
        body: expect.objectContaining({
          messages: expect.any(Array),
          tools: expect.any(Array),
        }),
      })
    );
  });
});

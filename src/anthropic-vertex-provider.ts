import { LanguageModelV1, NoSuchModelError, ProviderV1 } from '@ai-sdk/provider';
import { FetchFunction, loadSetting, withoutTrailingSlash } from '@ai-sdk/provider-utils';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { AnthropicMessagesLanguageModel } from './anthropic-messages-language-model';
import { AnthropicMessagesModelId, AnthropicMessagesSettings } from './anthropic-messages-settings';

export interface AnthropicVertexProvider extends ProviderV1 {
  /**
   * Creates a model for text generation.
   */
  (modelId: AnthropicMessagesModelId, settings?: AnthropicMessagesSettings): LanguageModelV1;

  /**
   * Creates a model for text generation.
   */
  languageModel: (
    modelId: AnthropicMessagesModelId,
    settings?: AnthropicMessagesSettings,
  ) => LanguageModelV1;
}

export interface AnthropicVertexProviderSettings {
  /**
   * Your Google Vertex location. Defaults to the environment variable `GOOGLE_VERTEX_LOCATION`.
   */
  location?: string;

  /**
   * Your Google Vertex project. Defaults to the environment variable `GOOGLE_VERTEX_PROJECT`.
   */
  project?: string;

  /**
   * Optional. The Authentication options provided by google-auth-library.
   * Complete list of authentication options is documented in the
   * GoogleAuthOptions interface:
   * https://github.com/googleapis/google-auth-library-nodejs/blob/main/src/auth/googleauth.ts
   */
  googleAuthOptions?: GoogleAuthOptions;

  /**
   * Use a different URL prefix for API calls, e.g. to use proxy servers.
   * The default prefix is `https://{location}-aiplatform.googleapis.com/v1`.
   */
  baseURL?: string;

  /**
   * Custom headers to include in the requests.
   */
  headers?: Record<string, string>;

  /**
   * Custom fetch implementation. You can use it as a middleware to intercept requests,
   * or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;

  // for testing
  generateId?: () => string;
}

/**
 * Create an Anthropic provider instance.
 */
export function createAnthropicVertex(
  options: AnthropicVertexProviderSettings = {},
): AnthropicVertexProvider {
  const config = {
    project: loadSetting({
      settingValue: options.project,
      settingName: 'project',
      environmentVariableName: 'GOOGLE_VERTEX_PROJECT',
      description: 'Google Vertex project',
    }),
    location: loadSetting({
      settingValue: options.location,
      settingName: 'location',
      environmentVariableName: 'GOOGLE_VERTEX_LOCATION',
      description: 'Google Vertex location',
    }),
    googleAuthOptions: options.googleAuthOptions,
  };

  const baseURL =
    withoutTrailingSlash(options.baseURL)?.replace('{location}', config.location) ??
    `https://${config.location}-aiplatform.googleapis.com/v1`;
  const googleAuth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
    ...options.googleAuthOptions,
  });

  const createLanguageModel = (
    modelId: AnthropicMessagesModelId,
    settings: AnthropicMessagesSettings = {},
  ) =>
    new AnthropicMessagesLanguageModel(modelId, settings, {
      provider: 'anthropic.vertex',
      baseURL,
      headers: () => ({
        ...options.headers,
      }),
      fetch: options.fetch,
      project: config.project,
      location: config.location,
      googleAuth,
    });

  const provider = function (
    modelId: AnthropicMessagesModelId,
    settings?: AnthropicMessagesSettings,
  ) {
    if (new.target) {
      throw new Error('The Anthropic model function cannot be called with the new keyword.');
    }

    return createLanguageModel(modelId, settings);
  };

  provider.languageModel = createLanguageModel;
  provider.textEmbeddingModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'textEmbeddingModel' });
  };

  return provider as AnthropicVertexProvider;
}

/**
 * Default Anthropic provider instance.
 */
export const anthropicVertex = (
  modelId: AnthropicMessagesModelId,
  settings?: AnthropicMessagesSettings,
) => {
  const provider = createAnthropicVertex();
  return provider(modelId, settings);
};

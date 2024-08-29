import { LanguageModelV1, NoSuchModelError, ProviderV1 } from '@ai-sdk/provider';
import { loadSetting, withoutTrailingSlash } from '@ai-sdk/provider-utils';
import { GoogleAuth } from 'google-auth-library';
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

  /**
   * Creates a model for text generation.
   */
  chat: (
    modelId: AnthropicMessagesModelId,
    settings?: AnthropicMessagesSettings,
  ) => LanguageModelV1;
}

export interface AnthropicVertexProviderSettings {
  /**
Your Google Vertex region. Defaults to the environment variable `GOOGLE_VERTEX_REGION`.
   */
  region?: string;

  /**
Your Google Vertex project. Defaults to the environment variable `GOOGLE_VERTEX_PROJECT_ID`.
  */
  projectId?: string;

  /**
 Optional. The Authentication options provided by google-auth-library.
Complete list of authentication options is documented in the
GoogleAuthOptions interface:
https://github.com/googleapis/google-auth-library-nodejs/blob/main/src/auth/googleauth.ts.
   */
  googleAuth?: GoogleAuth;

  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
The default prefix is `https://api.anthropic.com/v1`.
   */
  baseURL?: string;

  /**
API key that is being send using the `x-api-key` header.
It defaults to the `ANTHROPIC_API_KEY` environment variable.
   */
  apiKey?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;

  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
    */
  fetch?: typeof fetch;

  generateId?: () => string;
}

/**
Create an Anthropic provider instance.
 */
export function createAnthropicVertex(
  options: AnthropicVertexProviderSettings = {},
): AnthropicVertexProvider {
  const config = {
    projectId: loadSetting({
      settingValue: options.projectId,
      settingName: 'projectId',
      environmentVariableName: 'GOOGLE_VERTEX_PROJECT_ID',
      description: 'Google Vertex project id',
    }),
    region: loadSetting({
      settingValue: options.region,
      settingName: 'region',
      environmentVariableName: 'GOOGLE_VERTEX_REGION',
      description: 'Google Vertex region',
    }),
    googleAuth: options.googleAuth,
  };

  const baseURL =
    withoutTrailingSlash(options.baseURL) ??
    `https://${config.region}-aiplatform.googleapis.com/v1`;

  const auth =
    options.googleAuth ??
    new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });

  const createChatModel = (
    modelId: AnthropicMessagesModelId,
    settings: AnthropicMessagesSettings = {},
  ) =>
    new AnthropicMessagesLanguageModel(modelId, settings, {
      provider: 'anthropic.messages',
      baseURL,
      headers: () => ({
        ...options.headers,
      }),
      fetch: options.fetch,
      projectId: config.projectId,
      region: config.region,
      googleAuth: auth,
    });

  const provider = function (
    modelId: AnthropicMessagesModelId,
    settings?: AnthropicMessagesSettings,
  ) {
    if (new.target) {
      throw new Error('The Anthropic model function cannot be called with the new keyword.');
    }

    return createChatModel(modelId, settings);
  };

  provider.languageModel = createChatModel;
  provider.textEmbeddingModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'textEmbeddingModel' });
  };
  provider.chat = createChatModel;

  return provider as AnthropicVertexProvider;
}

/**
Default Anthropic provider instance.
 */
export const anthropicVertex = (
  modelId: AnthropicMessagesModelId,
  settings?: AnthropicMessagesSettings,
) => {
  const provider = createAnthropicVertex();
  return provider(modelId, settings);
};

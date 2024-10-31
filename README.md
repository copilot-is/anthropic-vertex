# Vercel AI SDK - Anthropic Vertex Provider

[copilot-is/anthropic-vertex](https://github.com/copilot-is/anthropic-vertex) is a community provider that uses Anthropic models through Vertex AI to provide language model support for the Vercel AI SDK.

This provider is a community-maintained module and is not officially supported by Vercel. It was forked from the [Anthropic Vertex Provider](https://github.com/vercel/ai/pull/2482) pull request and updated.

## Compatibility

The AnthropicVertex provider was tested with Vercel AI SDK version `3.1.0`. To avoid TypeScript errors it is recommended to use version `3.3.0` or higher.

## Example scripts

Example scripts how to use this provider can be found in the [examples](./examples) folder.

## Setup

The AnthropicVertex provider is available in the `anthropic-vertex` module. You can install it with:

```bash
npm install anthropic-vertex
# or
pnpm add anthropic-vertex
# or
yarn add anthropic-vertex
# or
bun add anthropic-vertex
```

## Provider Instance

You can import the default provider instance `anthropicVertex` from `anthropic-vertex`:

```ts
import { anthropicVertex } from 'anthropic-vertex';
```

If you need a customized setup, you can import `createAnthropicVertex` from `anthropic-vertex` and create a provider instance with your settings:

```ts
import { createAnthropicVertex } from 'anthropic-vertex';

const anthropicVertex = createAnthropicVertex({
  project: 'your-project-id',
  location: 'us-central1',
  // other options
});
```

You can use the following optional settings to customize the AnthropicVertex provider instance:

- **project** _string_

  The Google Cloud project ID that you want to use for the API calls. It uses the `GOOGLE_VERTEX_PROJECT` environment variable by default.

- **location** _string_

  The Google Cloud location that you want to use for the API calls, e.g. us-central1. It uses the `GOOGLE_VERTEX_LOCATION` environment variable by default.

- **googleAuthOptions** _object_

  Optional. The Authentication options used by the [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs/).

  - **authClient** _object_ An AuthClient to use.

  - **keyFilename** _string_ Path to a .json, .pem, or .p12 key file.

  - **keyFile** _string_ Path to a .json, .pem, or .p12 key file.

  - **credentials** _object_ Object containing client_email and private_key properties, or the external account client options.

  - **clientOptions** _object_ Options object passed to the constructor of the client.

  - **scopes** _string | string[]_ Required scopes for the desired API request.

  - **projectId** _string_ Your project ID.

  - **universeDomain** _string_ The default service domain for a given Cloud universe.

- **baseURL** _string_

  Use a different URL prefix for API calls, e.g., to use proxy servers.
  The default prefix is `https://{location}-aiplatform.googleapis.com/v1`.

- **headers** _Record&lt;string,string&gt;_

  Custom headers to include in the requests.

- **fetch** _(input: RequestInfo, init?: RequestInit) => Promise<Response>_

  Custom fetch implementation. Defaults to the global fetch function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.

## Language Models

You can create models that call the Anthropic API through Vertex AI using the provider instance.
The first argument is the model ID, e.g., `claude-3-sonnet@20240229`:

```ts
const model = anthropicVertex('claude-3-sonnet@20240229');
```

### Example: Generate Text

You can use AnthropicVertex language models to generate text with the `generateText` function:

```ts
import { anthropicVertex } from 'anthropic-vertex';
import { generateText } from 'ai';

const { text } = await generateText({
  model: anthropicVertex('claude-3-sonnet@20240229'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

AnthropicVertex language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions
(see [AI SDK Core](/docs/ai-sdk-core) for more information).

### Model Capabilities

| Model                           | Image Input        | Object Generation  | Tool Usage         | Tool Streaming     |
| ------------------------------- | ------------------ | ------------------ | ------------------ | ------------------ |
| `claude-3-5-sonnet-v2@20241022` | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `claude-3-5-sonnet@20240620`    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `claude-3-opus@20240229`        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `claude-3-sonnet@20240229`      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `claude-3-haiku@20240307`       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |

## Environment Variables

To use the AnthropicVertex provider, you need to set up the following environment variables:

- `GOOGLE_VERTEX_LOCATION`: Your Google Vertex region (e.g., 'us-central1')
- `GOOGLE_VERTEX_PROJECT`: Your Google Cloud project ID

Make sure to set these variables in your environment or in a `.env` file in your project root.

## Authentication

The AnthropicVertex provider uses Google Cloud authentication. Make sure you have set up your Google Cloud credentials properly. You can either use a service account key file or default application credentials.

For more information on setting up authentication, refer to the [Google Cloud Authentication guide](https://cloud.google.com/docs/authentication).

## Tests

To run the tests, make sure you have installed the dependencies with:

```shell
pnpm install
```

Then, run the tests with:

```shell
pnpm test
```

All tests will get run automatically on every push to the repository to ensure regressions will get caught as early as possible.

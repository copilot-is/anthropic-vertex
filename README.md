# Vercel AI SDK - Anthropic Vertex Provider

The **Anthropic Vertex Provider** contains language model support for the Anthropic Vertex Messages API.

This provider is a community-maintained module and is not officially supported by Vercel. It was forked from the [Anthropic Vertex Provider](https://github.com/vercel/ai/pull/2482) pull request and updated.

## Setup

The Anthropic Vertex provider is available in the `anthropic-vertex-ai-provider` module via the NPM registry.

## Provider Instance

You can import the provider instance creation function `createAnthropicVertex` from `anthropic-vertex-ai-provider`:

```ts
import { createAnthropicVertex } from 'anthropic-vertex-ai-provider';
```

## Example

```ts
import { createAnthropicVertex } from 'anthropic-vertex-ai-provider';
import { generateText } from 'ai';

const anthropicVertex = createAnthropicVertex({
  region: 'europe-west1',
  projectId: 'my-project-id-1234',
});

const { text } = await generateText({
  model: anthropicVertex('claude-3-haiku@20240307'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});

console.log(text);
```
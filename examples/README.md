# Example Scripts for Anthropic Vertex AI Provider

This folder contains example scripts demonstrating how to use the Anthropic Vertex AI Provider with different features of the Claude AI model.

## streaming.ts

This script demonstrates how to use the Anthropic Vertex AI Provider to stream text completions from the Claude model. It showcases:

- How to create an Anthropic Vertex provider instance
- How to initialize a specific Claude model (claude-3-5-sonnet@20240620 in this case)
- How to use the `streamText` function to generate a streaming response
- How to process and display the streamed text output

This example is useful for applications that require real-time text generation, such as chatbots or interactive AI assistants.

## tool_call.ts

This script illustrates how to use the Anthropic Vertex AI Provider to make tool calls with the Claude model. It demonstrates:

- How to set up the Anthropic Vertex provider
- How to define and use a custom tool (celsiusToFahrenheit in this example)
- How to generate text using the model with tool calling capabilities
- How to process and display the results of tool calls

This example is particularly useful for applications that need to integrate AI-driven decision-making with external functions or APIs, such as data processing, calculations, or third-party service interactions.

Both examples provide a starting point for developers to understand and implement Anthropic's Claude AI model in their Vertex AI projects, showcasing different interaction modes with the AI.

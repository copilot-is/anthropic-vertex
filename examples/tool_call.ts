import { createAnthropicVertex } from 'anthropic-vertex';
import { generateText } from 'ai';
import { z } from 'zod';

const vertexProvider = createAnthropicVertex({
  region: 'europe-west1',
  projectId: 'my-proj-1234',
});

const vertexHaiku = vertexProvider('claude-3-haiku@20240307');

const { text, toolResults } = await generateText({
  model: vertexHaiku,
  system: 'You are a friendly assistant!',
  // prompt: 'What is 30 degrees Celseius in Fahrenheit?',
  messages: [
    {
      role: 'user',
      content: 'What is 30 degrees Celseius in Fahrenheit?',
    },
  ],
  tools: {
    celsiusToFahrenheit: {
      description: 'Converts celsius to fahrenheit',
      parameters: z.object({
        value: z.string().describe('The value in celsius'),
      }),
      execute: async ({ value }) => {
        const celsius = parseFloat(value);
        const fahrenheit = celsius * (9 / 5) + 32;
        return `${celsius}°C is ${fahrenheit.toFixed(2)}°F`;
      },
    },
  },
});

console.log(text); // emtpy string
console.log(toolResults);
// returns:
// [
//   {
//     toolCallId: "toolu_vrtx_01Gg47Tt2uYNMop8F2igxdHh",
//     toolName: "celsiusToFahrenheit",
//     args: {
//       value: "30",
//     },
//     result: "30°C is 86.00°F",
//   }
// ]
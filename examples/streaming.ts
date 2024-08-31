import { createAnthropicVertex } from 'anthropic-vertex-ai-provider';
import { streamText } from 'ai';

const vertexProvider = createAnthropicVertex({
  region: 'europe-west1',
  projectId: 'second-try-432401',
});

const vertexSonnet = vertexProvider('claude-3-5-sonnet@20240620');

const { textStream } = await streamText({
  model: vertexSonnet,
  prompt: 'Are penguins birds?',
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}

// returns:
// Text content block start
// Yes, penguins are birds. They belong to the family Spheniscidae and are classified as seabirds. While they have some unique characteristics that set them apart from many other birds, penguins possess all the key features that define birds:
// 1. They have feathers, although their feathers are adapted for swimming and insulation rather than flight.
// 2. They lay eggs and care for their young.
// 3. They have beaks and no teeth.
// 4. They are warm-blooded (endothermic).
// 5. They have wings, although they are adapted for swimming rather than flying.
// 6. They have a four-chambered heart and lightweight bones, like other birds.
// Penguins are flightless birds that have evolved to be excellent swimmers, with their wings modified into flippers for propulsion in water. There are 18 species of penguins, all of which are found in the Southern Hemisphere, primarily in Antarctica and surrounding islands, though some species live in more temperate regions like South America, Africa, and New Zealand.

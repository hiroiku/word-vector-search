import { createInterface } from 'readline';
import { OpenAIManager } from '@/OpenAI/OpenAIManager';
import { QdrantManager } from '@/Qdrant/QdrantManager';
import 'dotenv/config';

// Check if the OPENAI_API_KEY environment variable is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set. Please set OPENAI_API_KEY in .env file.');
}

// Initialize OpenAI and Qdrant managers
const openAIManager = new OpenAIManager(process.env.OPENAI_API_KEY ?? '');
const qdrantManager = new QdrantManager('word-vector');

(async () => {
  // Setup readline interface for command line input
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt user for input and wait for response
  const inputText = await new Promise<string>(resolve => {
    readline.question('Enter a string: ', text => {
      readline.close();
      resolve(text);
    });
  });

  // Get embedding vector for the input text from OpenAI
  const embedding = await openAIManager.getEmbedding(inputText);
  const vector = embedding.data.shift()?.embedding ?? [];

  // Ensure a valid vector was returned
  if (!vector.length) {
    throw new Error('No vector found');
  }

  // Initialize Qdrant manager
  await qdrantManager.initialize();

  // Search for similar vectors in Qdrant and log results
  const result = await qdrantManager.search(vector);
  console.log(result);

  // Add the new point and its vector to Qdrant
  await qdrantManager.addPoint(inputText, vector);
  console.info('Point added');
})();

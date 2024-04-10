import { OpenAI } from 'openai';

export class OpenAIManager {
  private readonly openai: OpenAI;

  public constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  public async getEmbedding(text: string) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response;
  }
}

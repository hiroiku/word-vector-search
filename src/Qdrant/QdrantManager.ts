import { createHash } from 'crypto';
import { QdrantClient } from '@qdrant/js-client-rest';

export class QdrantManager {
  private static createId(text: string) {
    const hash = createHash('sha1').update(text).digest('hex');
    const segments = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20, 32),
    ];
    const uuid = `${segments.join('-')}`;

    return uuid;
  }

  private readonly client: QdrantClient;
  private readonly collectionName: string;

  public constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.client = new QdrantClient({ host: 'localhost', port: 6333 });
  }

  public async initialize() {
    try {
      await this.client.getCollection(this.collectionName);
    } catch {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
      });
    }
  }

  public async addPoint(text: string, vector: number[]) {
    const result = await this.client.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: QdrantManager.createId(text),
          vector: vector,
          payload: { text: text },
        },
      ],
    });

    return result;
  }

  public async search(vector: number[]) {
    const result = await this.client.search(this.collectionName, {
      vector,
      limit: 2,
      // score_threshold: 0.5,
    });

    return result;
  }
}

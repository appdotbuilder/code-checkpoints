import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CodeCheckpoint } from '../schema';
import { desc } from 'drizzle-orm';

export const getCodeCheckpoints = async (): Promise<CodeCheckpoint[]> => {
  try {
    // Fetch all code checkpoints ordered by creation date (newest first)
    const results = await db.select()
      .from(codeCheckpointsTable)
      .orderBy(desc(codeCheckpointsTable.created_at))
      .execute();

    // Return results with proper type conversion for embedding array
    return results.map(checkpoint => ({
      ...checkpoint,
      // Ensure embedding is properly typed as number array
      embedding: checkpoint.embedding as number[]
    }));
  } catch (error) {
    console.error('Failed to fetch code checkpoints:', error);
    throw error;
  }
};
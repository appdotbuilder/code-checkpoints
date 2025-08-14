import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CodeCheckpoint } from '../schema';
import { eq } from 'drizzle-orm';

export const getCodeCheckpointById = async (id: number): Promise<CodeCheckpoint | null> => {
  try {
    const result = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const checkpoint = result[0];
    
    // Return the checkpoint with proper type conversion
    // Note: embedding array of real numbers doesn't need conversion
    return {
      ...checkpoint,
      id: checkpoint.id,
      title: checkpoint.title,
      summary: checkpoint.summary,
      code_snippet: checkpoint.code_snippet,
      user_feedback: checkpoint.user_feedback,
      programming_language: checkpoint.programming_language,
      tags: checkpoint.tags,
      embedding: checkpoint.embedding,
      created_at: checkpoint.created_at
    };
  } catch (error) {
    console.error('Failed to get code checkpoint by id:', error);
    throw error;
  }
};
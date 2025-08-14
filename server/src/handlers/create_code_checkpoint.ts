import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CreateCodeCheckpointInput, type CodeCheckpoint } from '../schema';

export const createCodeCheckpoint = async (input: CreateCodeCheckpointInput): Promise<CodeCheckpoint> => {
  try {
    // Insert code checkpoint record
    const result = await db.insert(codeCheckpointsTable)
      .values({
        title: input.title,
        summary: input.summary,
        code_snippet: input.code_snippet,
        user_feedback: input.user_feedback,
        programming_language: input.programming_language,
        tags: input.tags,
        embedding: input.embedding
      })
      .returning()
      .execute();

    const checkpoint = result[0];
    return checkpoint;
  } catch (error) {
    console.error('Code checkpoint creation failed:', error);
    throw error;
  }
};
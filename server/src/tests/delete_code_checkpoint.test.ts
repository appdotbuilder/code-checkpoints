import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CreateCodeCheckpointInput } from '../schema';
import { deleteCodeCheckpoint } from '../handlers/delete_code_checkpoint';
import { eq } from 'drizzle-orm';

// Test data for creating checkpoints
const testCheckpoint1: CreateCodeCheckpointInput = {
  title: 'Test Checkpoint 1',
  summary: 'A summary for testing deletion',
  code_snippet: 'console.log("test");',
  user_feedback: 'This is helpful for testing',
  programming_language: 'javascript',
  tags: ['test', 'javascript'],
  embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
};

const testCheckpoint2: CreateCodeCheckpointInput = {
  title: 'Test Checkpoint 2',
  summary: 'Another checkpoint for testing',
  code_snippet: 'print("hello world")',
  user_feedback: 'Good example for testing',
  programming_language: 'python',
  tags: ['test', 'python'],
  embedding: [0.2, 0.3, 0.4, 0.5, 0.6]
};

describe('deleteCodeCheckpoint', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing code checkpoint', async () => {
    // Create a checkpoint first
    const insertResult = await db.insert(codeCheckpointsTable)
      .values({
        title: testCheckpoint1.title,
        summary: testCheckpoint1.summary,
        code_snippet: testCheckpoint1.code_snippet,
        user_feedback: testCheckpoint1.user_feedback,
        programming_language: testCheckpoint1.programming_language,
        tags: testCheckpoint1.tags,
        embedding: testCheckpoint1.embedding
      })
      .returning()
      .execute();

    const createdCheckpoint = insertResult[0];
    expect(createdCheckpoint.id).toBeDefined();

    // Delete the checkpoint
    const result = await deleteCodeCheckpoint(createdCheckpoint.id);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify checkpoint is actually deleted from database
    const deletedCheckpoints = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, createdCheckpoint.id))
      .execute();

    expect(deletedCheckpoints).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent checkpoint', async () => {
    // Try to delete a checkpoint with an ID that doesn't exist
    const nonExistentId = 99999;
    
    const result = await deleteCodeCheckpoint(nonExistentId);

    // Should return false indicating no checkpoint was found/deleted
    expect(result).toBe(false);
  });

  it('should only delete the specified checkpoint', async () => {
    // Create two checkpoints
    const insertResult1 = await db.insert(codeCheckpointsTable)
      .values({
        title: testCheckpoint1.title,
        summary: testCheckpoint1.summary,
        code_snippet: testCheckpoint1.code_snippet,
        user_feedback: testCheckpoint1.user_feedback,
        programming_language: testCheckpoint1.programming_language,
        tags: testCheckpoint1.tags,
        embedding: testCheckpoint1.embedding
      })
      .returning()
      .execute();

    const insertResult2 = await db.insert(codeCheckpointsTable)
      .values({
        title: testCheckpoint2.title,
        summary: testCheckpoint2.summary,
        code_snippet: testCheckpoint2.code_snippet,
        user_feedback: testCheckpoint2.user_feedback,
        programming_language: testCheckpoint2.programming_language,
        tags: testCheckpoint2.tags,
        embedding: testCheckpoint2.embedding
      })
      .returning()
      .execute();

    const checkpoint1 = insertResult1[0];
    const checkpoint2 = insertResult2[0];

    // Delete only the first checkpoint
    const result = await deleteCodeCheckpoint(checkpoint1.id);

    // Should return true
    expect(result).toBe(true);

    // Verify first checkpoint is deleted
    const deletedCheckpoints = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, checkpoint1.id))
      .execute();

    expect(deletedCheckpoints).toHaveLength(0);

    // Verify second checkpoint still exists
    const remainingCheckpoints = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, checkpoint2.id))
      .execute();

    expect(remainingCheckpoints).toHaveLength(1);
    expect(remainingCheckpoints[0].title).toBe(testCheckpoint2.title);
  });

  it('should handle deletion of checkpoint with empty tags array', async () => {
    // Create checkpoint with empty tags
    const checkpointWithEmptyTags = {
      ...testCheckpoint1,
      tags: [] // Empty tags array
    };

    const insertResult = await db.insert(codeCheckpointsTable)
      .values({
        title: checkpointWithEmptyTags.title,
        summary: checkpointWithEmptyTags.summary,
        code_snippet: checkpointWithEmptyTags.code_snippet,
        user_feedback: checkpointWithEmptyTags.user_feedback,
        programming_language: checkpointWithEmptyTags.programming_language,
        tags: checkpointWithEmptyTags.tags,
        embedding: checkpointWithEmptyTags.embedding
      })
      .returning()
      .execute();

    const createdCheckpoint = insertResult[0];

    // Delete the checkpoint
    const result = await deleteCodeCheckpoint(createdCheckpoint.id);

    // Should successfully delete
    expect(result).toBe(true);

    // Verify deletion
    const deletedCheckpoints = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, createdCheckpoint.id))
      .execute();

    expect(deletedCheckpoints).toHaveLength(0);
  });

  it('should handle deletion with very large embedding arrays', async () => {
    // Create checkpoint with large embedding
    const largeEmbedding = Array(1000).fill(0).map((_, i) => i * 0.001);
    const checkpointWithLargeEmbedding = {
      ...testCheckpoint1,
      embedding: largeEmbedding
    };

    const insertResult = await db.insert(codeCheckpointsTable)
      .values({
        title: checkpointWithLargeEmbedding.title,
        summary: checkpointWithLargeEmbedding.summary,
        code_snippet: checkpointWithLargeEmbedding.code_snippet,
        user_feedback: checkpointWithLargeEmbedding.user_feedback,
        programming_language: checkpointWithLargeEmbedding.programming_language,
        tags: checkpointWithLargeEmbedding.tags,
        embedding: checkpointWithLargeEmbedding.embedding
      })
      .returning()
      .execute();

    const createdCheckpoint = insertResult[0];

    // Delete the checkpoint
    const result = await deleteCodeCheckpoint(createdCheckpoint.id);

    // Should successfully delete
    expect(result).toBe(true);

    // Verify deletion
    const deletedCheckpoints = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, createdCheckpoint.id))
      .execute();

    expect(deletedCheckpoints).toHaveLength(0);
  });
});
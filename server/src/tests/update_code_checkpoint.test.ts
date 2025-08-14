import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CreateCodeCheckpointInput, type UpdateCodeCheckpointInput } from '../schema';
import { updateCodeCheckpoint } from '../handlers/update_code_checkpoint';
import { eq } from 'drizzle-orm';

// Helper to create a test checkpoint
const createTestCheckpoint = async (): Promise<number> => {
  const testCheckpoint: CreateCodeCheckpointInput = {
    title: 'Original Title',
    summary: 'Original summary for testing',
    code_snippet: 'console.log("original");',
    user_feedback: 'This is original feedback',
    programming_language: 'javascript',
    tags: ['original', 'test'],
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
  };

  const result = await db.insert(codeCheckpointsTable)
    .values(testCheckpoint)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateCodeCheckpoint', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a single field', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId,
      title: 'Updated Title'
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(checkpointId);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.summary).toEqual('Original summary for testing'); // Unchanged
    expect(result!.programming_language).toEqual('javascript'); // Unchanged
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId,
      title: 'Multi-Updated Title',
      summary: 'Updated summary with new content',
      programming_language: 'typescript',
      tags: ['updated', 'multi-field', 'test']
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Multi-Updated Title');
    expect(result!.summary).toEqual('Updated summary with new content');
    expect(result!.programming_language).toEqual('typescript');
    expect(result!.tags).toEqual(['updated', 'multi-field', 'test']);
    expect(result!.code_snippet).toEqual('console.log("original");'); // Unchanged
    expect(result!.user_feedback).toEqual('This is original feedback'); // Unchanged
  });

  it('should update embedding field', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const newEmbedding = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId,
      embedding: newEmbedding,
      code_snippet: 'console.log("updated code");'
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeDefined();
    expect(result!.embedding).toEqual(newEmbedding);
    expect(result!.code_snippet).toEqual('console.log("updated code");');
    expect(result!.title).toEqual('Original Title'); // Unchanged
  });

  it('should update tags array', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId,
      tags: ['new-tag', 'another-tag', 'complex-update']
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeDefined();
    expect(result!.tags).toEqual(['new-tag', 'another-tag', 'complex-update']);
    expect(result!.title).toEqual('Original Title'); // Unchanged
  });

  it('should persist changes in database', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId,
      title: 'Persisted Title',
      user_feedback: 'Updated feedback content'
    };

    await updateCodeCheckpoint(updateInput);

    // Query database directly to verify persistence
    const dbRecord = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, checkpointId))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].title).toEqual('Persisted Title');
    expect(dbRecord[0].user_feedback).toEqual('Updated feedback content');
    expect(dbRecord[0].summary).toEqual('Original summary for testing'); // Unchanged
  });

  it('should return null for non-existent checkpoint', async () => {
    const updateInput: UpdateCodeCheckpointInput = {
      id: 99999, // Non-existent ID
      title: 'This Should Not Work'
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeNull();
  });

  it('should return existing record when no fields to update', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId
      // No other fields provided
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(checkpointId);
    expect(result!.title).toEqual('Original Title');
    expect(result!.summary).toEqual('Original summary for testing');
    expect(result!.tags).toEqual(['original', 'test']);
  });

  it('should return null when no fields to update and checkpoint does not exist', async () => {
    const updateInput: UpdateCodeCheckpointInput = {
      id: 99999 // Non-existent ID
      // No other fields provided
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeNull();
  });

  it('should update all updatable fields', async () => {
    const checkpointId = await createTestCheckpoint();
    
    const updateInput: UpdateCodeCheckpointInput = {
      id: checkpointId,
      title: 'Complete Update Title',
      summary: 'Complete update summary',
      code_snippet: 'const updated = true;',
      user_feedback: 'All fields updated feedback',
      programming_language: 'python',
      tags: ['complete', 'update', 'all-fields'],
      embedding: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
    };

    const result = await updateCodeCheckpoint(updateInput);

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Complete Update Title');
    expect(result!.summary).toEqual('Complete update summary');
    expect(result!.code_snippet).toEqual('const updated = true;');
    expect(result!.user_feedback).toEqual('All fields updated feedback');
    expect(result!.programming_language).toEqual('python');
    expect(result!.tags).toEqual(['complete', 'update', 'all-fields']);
    expect(result!.embedding).toEqual([1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]);
    expect(result!.created_at).toBeInstanceOf(Date); // Should remain unchanged
  });
});
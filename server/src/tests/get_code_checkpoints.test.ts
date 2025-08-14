import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { getCodeCheckpoints } from '../handlers/get_code_checkpoints';

describe('getCodeCheckpoints', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no checkpoints exist', async () => {
    const result = await getCodeCheckpoints();

    expect(result).toEqual([]);
  });

  it('should fetch all code checkpoints', async () => {
    // Insert test checkpoints
    await db.insert(codeCheckpointsTable)
      .values([
        {
          title: 'First Checkpoint',
          summary: 'First summary',
          code_snippet: 'console.log("first");',
          user_feedback: 'Great work!',
          programming_language: 'javascript',
          tags: ['test', 'basic'],
          embedding: [0.1, 0.2, 0.3]
        },
        {
          title: 'Second Checkpoint',
          summary: 'Second summary',
          code_snippet: 'print("second")',
          user_feedback: 'Needs improvement',
          programming_language: 'python',
          tags: ['advanced', 'optimization'],
          embedding: [0.4, 0.5, 0.6]
        }
      ])
      .execute();

    const result = await getCodeCheckpoints();

    expect(result).toHaveLength(2);
    
    // Verify all required fields are present
    result.forEach(checkpoint => {
      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.title).toBeDefined();
      expect(checkpoint.summary).toBeDefined();
      expect(checkpoint.code_snippet).toBeDefined();
      expect(checkpoint.user_feedback).toBeDefined();
      expect(checkpoint.programming_language).toBeDefined();
      expect(checkpoint.tags).toBeInstanceOf(Array);
      expect(checkpoint.embedding).toBeInstanceOf(Array);
      expect(checkpoint.created_at).toBeInstanceOf(Date);
      
      // Verify embedding is properly typed as number array
      checkpoint.embedding.forEach(value => {
        expect(typeof value).toBe('number');
      });
    });
  });

  it('should return checkpoints ordered by creation date (newest first)', async () => {
    // Insert checkpoints with specific timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Insert in random order to test ordering
    await db.insert(codeCheckpointsTable)
      .values([
        {
          title: 'Middle Checkpoint',
          summary: 'Middle summary',
          code_snippet: 'console.log("middle");',
          user_feedback: 'Good',
          programming_language: 'javascript',
          tags: ['middle'],
          embedding: [0.2, 0.3, 0.4],
          created_at: oneHourAgo
        },
        {
          title: 'Newest Checkpoint',
          summary: 'Newest summary',
          code_snippet: 'console.log("newest");',
          user_feedback: 'Excellent',
          programming_language: 'javascript',
          tags: ['newest'],
          embedding: [0.3, 0.4, 0.5],
          created_at: now
        },
        {
          title: 'Oldest Checkpoint',
          summary: 'Oldest summary',
          code_snippet: 'console.log("oldest");',
          user_feedback: 'Okay',
          programming_language: 'javascript',
          tags: ['oldest'],
          embedding: [0.1, 0.2, 0.3],
          created_at: twoHoursAgo
        }
      ])
      .execute();

    const result = await getCodeCheckpoints();

    expect(result).toHaveLength(3);
    
    // Verify ordering (newest first)
    expect(result[0].title).toBe('Newest Checkpoint');
    expect(result[1].title).toBe('Middle Checkpoint');
    expect(result[2].title).toBe('Oldest Checkpoint');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle checkpoints with different data types correctly', async () => {
    // Insert checkpoint with various tag and embedding configurations
    await db.insert(codeCheckpointsTable)
      .values({
        title: 'Complex Checkpoint',
        summary: 'A checkpoint with complex data',
        code_snippet: 'def complex_function():\n    return "complex"',
        user_feedback: 'Very detailed feedback with special characters: @#$%',
        programming_language: 'python',
        tags: ['complex', 'data-structures', 'algorithms'],
        embedding: [0.123, 0.456, 0.789, 0.012, 0.345]
      })
      .execute();

    const result = await getCodeCheckpoints();

    expect(result).toHaveLength(1);
    
    const checkpoint = result[0];
    expect(checkpoint.title).toBe('Complex Checkpoint');
    expect(checkpoint.tags).toEqual(['complex', 'data-structures', 'algorithms']);
    expect(checkpoint.embedding).toEqual([0.123, 0.456, 0.789, 0.012, 0.345]);
    expect(checkpoint.user_feedback).toBe('Very detailed feedback with special characters: @#$%');
  });

  it('should handle empty tags and different embedding sizes', async () => {
    // Insert checkpoint with empty tags and different embedding size
    await db.insert(codeCheckpointsTable)
      .values({
        title: 'Minimal Checkpoint',
        summary: 'Minimal data checkpoint',
        code_snippet: 'x = 1',
        user_feedback: 'Basic',
        programming_language: 'python',
        tags: [], // Empty tags array
        embedding: [0.5] // Single value embedding
      })
      .execute();

    const result = await getCodeCheckpoints();

    expect(result).toHaveLength(1);
    
    const checkpoint = result[0];
    expect(checkpoint.tags).toEqual([]);
    expect(checkpoint.embedding).toEqual([0.5]);
    expect(checkpoint.embedding).toHaveLength(1);
  });
});
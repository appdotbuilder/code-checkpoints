import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CreateCodeCheckpointInput } from '../schema';
import { getCodeCheckpointById } from '../handlers/get_code_checkpoint_by_id';

// Test input data
const testCheckpoint: CreateCodeCheckpointInput = {
  title: 'Test Function Implementation',
  summary: 'A comprehensive test for function implementation with error handling',
  code_snippet: 'function testFunction() { return "hello world"; }',
  user_feedback: 'This implementation works well but could use better error handling',
  programming_language: 'javascript',
  tags: ['testing', 'functions', 'javascript'],
  embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Test embedding vector
};

describe('getCodeCheckpointById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return code checkpoint when found', async () => {
    // Create test checkpoint
    const insertResult = await db.insert(codeCheckpointsTable)
      .values({
        title: testCheckpoint.title,
        summary: testCheckpoint.summary,
        code_snippet: testCheckpoint.code_snippet,
        user_feedback: testCheckpoint.user_feedback,
        programming_language: testCheckpoint.programming_language,
        tags: testCheckpoint.tags,
        embedding: testCheckpoint.embedding
      })
      .returning()
      .execute();

    const createdCheckpoint = insertResult[0];
    
    // Test the handler
    const result = await getCodeCheckpointById(createdCheckpoint.id);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdCheckpoint.id);
    expect(result!.title).toEqual(testCheckpoint.title);
    expect(result!.summary).toEqual(testCheckpoint.summary);
    expect(result!.code_snippet).toEqual(testCheckpoint.code_snippet);
    expect(result!.user_feedback).toEqual(testCheckpoint.user_feedback);
    expect(result!.programming_language).toEqual(testCheckpoint.programming_language);
    expect(result!.tags).toEqual(testCheckpoint.tags);
    expect(result!.embedding).toEqual(testCheckpoint.embedding);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when checkpoint not found', async () => {
    const result = await getCodeCheckpointById(999);
    
    expect(result).toBeNull();
  });

  it('should handle zero id correctly', async () => {
    const result = await getCodeCheckpointById(0);
    
    expect(result).toBeNull();
  });

  it('should handle negative id correctly', async () => {
    const result = await getCodeCheckpointById(-1);
    
    expect(result).toBeNull();
  });

  it('should return correct checkpoint with complex data', async () => {
    // Create checkpoint with complex data
    const complexCheckpoint = {
      title: 'Complex Algorithm Implementation',
      summary: 'Implementation of a sorting algorithm with detailed explanation',
      code_snippet: `
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}`,
      user_feedback: 'Great implementation! Very clean and readable. Could add type annotations for TypeScript.',
      programming_language: 'javascript',
      tags: ['algorithms', 'sorting', 'recursion', 'quicksort'],
      embedding: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85] // Longer embedding
    };

    const insertResult = await db.insert(codeCheckpointsTable)
      .values(complexCheckpoint)
      .returning()
      .execute();

    const createdId = insertResult[0].id;
    
    // Test retrieval
    const result = await getCodeCheckpointById(createdId);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual(complexCheckpoint.title);
    expect(result!.code_snippet).toContain('quickSort');
    expect(result!.tags).toHaveLength(4);
    expect(result!.tags).toContain('algorithms');
    expect(result!.embedding).toHaveLength(8);
    expect(result!.embedding[0]).toEqual(0.15);
    expect(result!.embedding[7]).toEqual(0.85);
  });

  it('should verify database query behavior', async () => {
    // Create multiple checkpoints
    const checkpoint1 = await db.insert(codeCheckpointsTable)
      .values({
        title: 'First Checkpoint',
        summary: 'First summary',
        code_snippet: 'console.log("first");',
        user_feedback: 'Good start',
        programming_language: 'javascript',
        tags: ['basic'],
        embedding: [0.1, 0.2]
      })
      .returning()
      .execute();

    const checkpoint2 = await db.insert(codeCheckpointsTable)
      .values({
        title: 'Second Checkpoint',
        summary: 'Second summary',
        code_snippet: 'console.log("second");',
        user_feedback: 'Better implementation',
        programming_language: 'typescript',
        tags: ['intermediate'],
        embedding: [0.3, 0.4]
      })
      .returning()
      .execute();

    // Test that we get the correct checkpoint
    const result1 = await getCodeCheckpointById(checkpoint1[0].id);
    const result2 = await getCodeCheckpointById(checkpoint2[0].id);

    expect(result1!.title).toEqual('First Checkpoint');
    expect(result1!.programming_language).toEqual('javascript');
    expect(result2!.title).toEqual('Second Checkpoint');
    expect(result2!.programming_language).toEqual('typescript');
    
    // Ensure we don't get mixed results
    expect(result1!.id).not.toEqual(result2!.id);
  });
});
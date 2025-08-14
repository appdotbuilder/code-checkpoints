import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type CreateCodeCheckpointInput } from '../schema';
import { createCodeCheckpoint } from '../handlers/create_code_checkpoint';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateCodeCheckpointInput = {
  title: 'Test Checkpoint',
  summary: 'A checkpoint for testing purposes',
  code_snippet: 'function test() { return "hello world"; }',
  user_feedback: 'This code works well for basic testing',
  programming_language: 'javascript',
  tags: ['testing', 'example', 'function'],
  embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
};

// Test input with minimal fields and defaults
const minimalInput: CreateCodeCheckpointInput = {
  title: 'Minimal Checkpoint',
  summary: 'Minimal test case',
  code_snippet: 'console.log("test");',
  user_feedback: 'Simple test feedback',
  programming_language: 'javascript',
  tags: [], // Explicitly provide empty array
  embedding: [0.5, 0.5, 0.5]
};

describe('createCodeCheckpoint', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a code checkpoint with all fields', async () => {
    const result = await createCodeCheckpoint(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Checkpoint');
    expect(result.summary).toEqual(testInput.summary);
    expect(result.code_snippet).toEqual(testInput.code_snippet);
    expect(result.user_feedback).toEqual(testInput.user_feedback);
    expect(result.programming_language).toEqual('javascript');
    expect(result.tags).toEqual(['testing', 'example', 'function']);
    expect(result.embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a checkpoint with default empty tags', async () => {
    const result = await createCodeCheckpoint(minimalInput);

    expect(result.title).toEqual('Minimal Checkpoint');
    expect(result.tags).toEqual([]);
    expect(result.embedding).toEqual([0.5, 0.5, 0.5]);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save checkpoint to database correctly', async () => {
    const result = await createCodeCheckpoint(testInput);

    // Query database to verify persistence
    const checkpoints = await db.select()
      .from(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, result.id))
      .execute();

    expect(checkpoints).toHaveLength(1);
    const savedCheckpoint = checkpoints[0];
    
    expect(savedCheckpoint.title).toEqual('Test Checkpoint');
    expect(savedCheckpoint.summary).toEqual(testInput.summary);
    expect(savedCheckpoint.code_snippet).toEqual(testInput.code_snippet);
    expect(savedCheckpoint.user_feedback).toEqual(testInput.user_feedback);
    expect(savedCheckpoint.programming_language).toEqual('javascript');
    expect(savedCheckpoint.tags).toEqual(['testing', 'example', 'function']);
    expect(savedCheckpoint.embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
    expect(savedCheckpoint.created_at).toBeInstanceOf(Date);
  });

  it('should handle different programming languages', async () => {
    const pythonInput: CreateCodeCheckpointInput = {
      ...testInput,
      title: 'Python Test',
      programming_language: 'python',
      code_snippet: 'def test():\n    return "hello world"',
      tags: ['python', 'function']
    };

    const result = await createCodeCheckpoint(pythonInput);

    expect(result.programming_language).toEqual('python');
    expect(result.code_snippet).toEqual('def test():\n    return "hello world"');
    expect(result.tags).toEqual(['python', 'function']);
  });

  it('should handle complex embedding vectors', async () => {
    const complexEmbedding = new Array(512).fill(0).map((_, i) => Math.sin(i / 100));
    
    const complexInput: CreateCodeCheckpointInput = {
      ...testInput,
      title: 'Complex Embedding Test',
      embedding: complexEmbedding
    };

    const result = await createCodeCheckpoint(complexInput);

    // Use toBeCloseTo for floating point comparisons to handle precision differences
    expect(result.embedding.length).toEqual(512);
    for (let i = 0; i < complexEmbedding.length; i++) {
      expect(result.embedding[i]).toBeCloseTo(complexEmbedding[i], 5);
    }
  });

  it('should preserve special characters in code snippets', async () => {
    const specialCodeInput: CreateCodeCheckpointInput = {
      ...testInput,
      title: 'Special Characters Test',
      code_snippet: `const regex = /[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/g;
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function(m) { 
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; 
  });
}`
    };

    const result = await createCodeCheckpoint(specialCodeInput);

    expect(result.code_snippet).toContain('const regex = /[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]/g;');
    expect(result.code_snippet).toContain('&amp;');
    expect(result.code_snippet).toContain('&lt;');
  });
});
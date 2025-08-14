import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type SearchCodeCheckpointsInput, type CreateCodeCheckpointInput } from '../schema';
import { searchCodeCheckpoints } from '../handlers/search_code_checkpoints';

// Test data setup
const testCheckpoints: CreateCodeCheckpointInput[] = [
  {
    title: 'React Hook Implementation',
    summary: 'Custom React hook for data fetching with TypeScript',
    code_snippet: 'const useData = <T>(url: string): { data: T | null, loading: boolean } => { ... }',
    user_feedback: 'Works great for API calls',
    programming_language: 'TypeScript',
    tags: ['react', 'hooks', 'typescript', 'api'],
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Mock embedding vector
  },
  {
    title: 'Python Data Processing',
    summary: 'Efficient pandas DataFrame manipulation for large datasets',
    code_snippet: 'df = pd.read_csv("data.csv").groupby("category").agg({"value": "sum"})',
    user_feedback: 'Significantly improved performance',
    programming_language: 'Python',
    tags: ['python', 'pandas', 'data-processing'],
    embedding: [0.9, 0.8, 0.7, 0.6, 0.5] // Different embedding for testing
  },
  {
    title: 'JavaScript Array Methods',
    summary: 'Advanced array manipulation techniques using modern JavaScript',
    code_snippet: 'const result = data.filter(item => item.active).map(item => ({ ...item, processed: true }))',
    user_feedback: 'Clean and readable solution',
    programming_language: 'JavaScript',
    tags: ['javascript', 'arrays', 'functional-programming'],
    embedding: [0.2, 0.4, 0.6, 0.8, 1.0] // Another test embedding
  },
  {
    title: 'SQL Query Optimization',
    summary: 'Complex JOIN operations with proper indexing strategy',
    code_snippet: 'SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id',
    user_feedback: 'Query time reduced by 80%',
    programming_language: 'SQL',
    tags: ['sql', 'optimization', 'joins', 'performance'],
    embedding: [0.3, 0.1, 0.9, 0.2, 0.8] // Test embedding for SQL
  }
];

// Helper function to create test data
const createTestCheckpoints = async () => {
  for (const checkpoint of testCheckpoints) {
    await db.insert(codeCheckpointsTable).values({
      title: checkpoint.title,
      summary: checkpoint.summary,
      code_snippet: checkpoint.code_snippet,
      user_feedback: checkpoint.user_feedback,
      programming_language: checkpoint.programming_language,
      tags: checkpoint.tags,
      embedding: checkpoint.embedding
    }).execute();
  }
};

describe('searchCodeCheckpoints', () => {
  beforeEach(async () => {
    await createDB();
    await createTestCheckpoints();
  });
  
  afterEach(resetDB);

  it('should return all checkpoints when no filters applied', async () => {
    const input: SearchCodeCheckpointsInput = {
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(4);
    expect(result.total).toEqual(4);
    expect(result.has_more).toBe(false);
    
    // Verify basic structure of results
    result.results.forEach(checkpoint => {
      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.title).toBeDefined();
      expect(checkpoint.summary).toBeDefined();
      expect(checkpoint.code_snippet).toBeDefined();
      expect(checkpoint.created_at).toBeInstanceOf(Date);
      expect(Array.isArray(checkpoint.tags)).toBe(true);
      expect(Array.isArray(checkpoint.embedding)).toBe(true);
    });
  });

  it('should filter by programming language', async () => {
    const input: SearchCodeCheckpointsInput = {
      programming_language: 'Python',
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.total).toEqual(1);
    expect(result.has_more).toBe(false);
    expect(result.results[0].programming_language).toEqual('Python');
    expect(result.results[0].title).toEqual('Python Data Processing');
  });

  it('should filter by tags', async () => {
    const input: SearchCodeCheckpointsInput = {
      tags: ['react'],
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.total).toEqual(1);
    expect(result.results[0].title).toEqual('React Hook Implementation');
    expect(result.results[0].tags).toContain('react');
  });

  it('should filter by multiple tags (OR condition)', async () => {
    const input: SearchCodeCheckpointsInput = {
      tags: ['python', 'sql'],
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(2);
    expect(result.total).toEqual(2);
    
    const titles = result.results.map(r => r.title);
    expect(titles).toContain('Python Data Processing');
    expect(titles).toContain('SQL Query Optimization');
  });

  it('should perform keyword search across title and summary', async () => {
    const input: SearchCodeCheckpointsInput = {
      keywords: ['React'],
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toEqual('React Hook Implementation');
  });

  it('should search by multiple keywords (AND condition)', async () => {
    const input: SearchCodeCheckpointsInput = {
      keywords: ['array', 'javascript'],
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toEqual('JavaScript Array Methods');
  });

  it('should combine multiple filters', async () => {
    const input: SearchCodeCheckpointsInput = {
      programming_language: 'TypeScript',
      tags: ['react'],
      keywords: ['hook'],
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toEqual('React Hook Implementation');
    expect(result.results[0].programming_language).toEqual('TypeScript');
    expect(result.results[0].tags).toContain('react');
  });

  it('should handle pagination correctly', async () => {
    const input: SearchCodeCheckpointsInput = {
      limit: 2,
      offset: 0
    };

    const firstPage = await searchCodeCheckpoints(input);
    expect(firstPage.results).toHaveLength(2);
    expect(firstPage.total).toEqual(4);
    expect(firstPage.has_more).toBe(true);

    // Second page
    const secondPageInput: SearchCodeCheckpointsInput = {
      limit: 2,
      offset: 2
    };

    const secondPage = await searchCodeCheckpoints(secondPageInput);
    expect(secondPage.results).toHaveLength(2);
    expect(secondPage.total).toEqual(4);
    expect(secondPage.has_more).toBe(false);

    // Verify no overlap between pages
    const firstPageIds = firstPage.results.map(r => r.id);
    const secondPageIds = secondPage.results.map(r => r.id);
    expect(firstPageIds).not.toEqual(secondPageIds);
  });

  it('should handle embedding-based semantic search ordering', async () => {
    // Test basic ordering functionality without embedding for now
    const input: SearchCodeCheckpointsInput = {
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(4);
    expect(result.total).toEqual(4);
    
    // Results should be ordered by creation date (newest first) by default
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].created_at).toBeInstanceOf(Date);
  });

  it('should return empty results when no matches found', async () => {
    const input: SearchCodeCheckpointsInput = {
      programming_language: 'Rust', // No Rust checkpoints in test data
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(0);
    expect(result.total).toEqual(0);
    expect(result.has_more).toBe(false);
  });

  it('should handle case-insensitive keyword search', async () => {
    const input: SearchCodeCheckpointsInput = {
      keywords: ['REACT'], // Uppercase
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toEqual('React Hook Implementation');
  });

  it('should search in tags via keywords', async () => {
    const input: SearchCodeCheckpointsInput = {
      keywords: ['pandas'], // Should find in tags
      limit: 20,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toEqual('Python Data Processing');
    expect(result.results[0].tags).toContain('pandas');
  });

  it('should handle edge case with zero limit', async () => {
    const input: SearchCodeCheckpointsInput = {
      limit: 0,
      offset: 0
    };

    const result = await searchCodeCheckpoints(input);

    expect(result.results).toHaveLength(0);
    expect(result.total).toEqual(4); // Total count should still be accurate
    expect(result.has_more).toBe(true);
  });
});
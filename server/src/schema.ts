import { z } from 'zod';

// Code checkpoint schema with proper numeric handling
export const codeCheckpointSchema = z.object({
  id: z.number(),
  title: z.string(),
  summary: z.string(),
  code_snippet: z.string(),
  user_feedback: z.string(),
  programming_language: z.string(),
  tags: z.array(z.string()), // Array of tags for filtering
  embedding: z.array(z.number()), // Numerical embedding for semantic search
  created_at: z.coerce.date() // Automatically converts string timestamps to Date objects
});

export type CodeCheckpoint = z.infer<typeof codeCheckpointSchema>;

// Input schema for creating code checkpoints
export const createCodeCheckpointInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  code_snippet: z.string().min(1, "Code snippet is required"),
  user_feedback: z.string().min(1, "User feedback is required"),
  programming_language: z.string().min(1, "Programming language is required"),
  tags: z.array(z.string()).default([]), // Optional tags array
  embedding: z.array(z.number()) // Required embedding for semantic search
});

export type CreateCodeCheckpointInput = z.infer<typeof createCodeCheckpointInputSchema>;

// Input schema for updating code checkpoints
export const updateCodeCheckpointInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  code_snippet: z.string().min(1).optional(),
  user_feedback: z.string().min(1).optional(),
  programming_language: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  embedding: z.array(z.number()).optional()
});

export type UpdateCodeCheckpointInput = z.infer<typeof updateCodeCheckpointInputSchema>;

// Search input schema for finding checkpoints
export const searchCodeCheckpointsInputSchema = z.object({
  query: z.string().optional(), // Natural language query
  keywords: z.array(z.string()).optional(), // Keyword search in title, summary, tags
  programming_language: z.string().optional(), // Filter by language
  tags: z.array(z.string()).optional(), // Filter by specific tags
  embedding: z.array(z.number()).optional(), // Embedding for semantic search
  limit: z.number().int().positive().default(20), // Limit results
  offset: z.number().int().nonnegative().default(0) // Pagination offset
});

export type SearchCodeCheckpointsInput = z.infer<typeof searchCodeCheckpointsInputSchema>;

// Response schema for search results
export const searchResultsSchema = z.object({
  results: z.array(codeCheckpointSchema),
  total: z.number(),
  has_more: z.boolean()
});

export type SearchResults = z.infer<typeof searchResultsSchema>;
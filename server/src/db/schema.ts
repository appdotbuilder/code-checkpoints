import { serial, text, pgTable, timestamp, real } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const codeCheckpointsTable = pgTable('code_checkpoints', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  code_snippet: text('code_snippet').notNull(),
  user_feedback: text('user_feedback').notNull(),
  programming_language: text('programming_language').notNull(),
  tags: text('tags').array().notNull().default(sql`'{}'`), // Array of text for tags
  embedding: real('embedding').array().notNull(), // Array of real numbers for embeddings
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type CodeCheckpoint = typeof codeCheckpointsTable.$inferSelect; // For SELECT operations
export type NewCodeCheckpoint = typeof codeCheckpointsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { codeCheckpoints: codeCheckpointsTable };
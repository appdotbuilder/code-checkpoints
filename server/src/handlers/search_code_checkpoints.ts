import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type SearchCodeCheckpointsInput, type SearchResults } from '../schema';
import { and, or, ilike, eq, sql, desc } from 'drizzle-orm';

export const searchCodeCheckpoints = async (input: SearchCodeCheckpointsInput): Promise<SearchResults> => {
  try {
    // Build conditions array for filtering
    const conditions = [];

    // Filter by programming language if provided
    if (input.programming_language) {
      conditions.push(eq(codeCheckpointsTable.programming_language, input.programming_language));
    }

    // Filter by tags if provided - check if any of the requested tags exist in the checkpoint's tags array
    if (input.tags && input.tags.length > 0) {
      const validTagConditions = input.tags
        .map(tag => sql`${codeCheckpointsTable.tags} @> ARRAY[${tag}]::text[]`)
        .filter(Boolean);
      
      if (validTagConditions.length === 1) {
        conditions.push(validTagConditions[0]);
      } else if (validTagConditions.length > 1) {
        conditions.push(or(...validTagConditions));
      }
    }

    // Keyword search in title, summary, and tags if provided
    if (input.keywords && input.keywords.length > 0) {
      const keywordConditions = [];
      
      for (const keyword of input.keywords) {
        const titleMatch = ilike(codeCheckpointsTable.title, `%${keyword}%`);
        const summaryMatch = ilike(codeCheckpointsTable.summary, `%${keyword}%`);
        const tagMatch = sql`array_to_string(${codeCheckpointsTable.tags}, ' ') ILIKE ${`%${keyword}%`}`;
        
        keywordConditions.push(or(titleMatch, summaryMatch, tagMatch));
      }
      
      if (keywordConditions.length === 1) {
        conditions.push(keywordConditions[0]);
      } else if (keywordConditions.length > 1) {
        conditions.push(and(...keywordConditions));
      }
    }

    // Build the base query
    const baseQuery = db.select().from(codeCheckpointsTable);
    
    // Apply conditions if any exist
    const queryWithWhere = conditions.length > 0 
      ? conditions.length === 1 
        ? baseQuery.where(conditions[0])
        : baseQuery.where(and(...conditions))
      : baseQuery;

    // Handle ordering
    const queryWithOrder = input.embedding && input.embedding.length > 0
      ? queryWithWhere.orderBy(
          sql`(
            SELECT COALESCE(SUM((e.val * v.val)), 0) 
            FROM unnest(${codeCheckpointsTable.embedding}) WITH ORDINALITY e(val, ord)
            JOIN unnest(${sql`ARRAY[${sql.join(input.embedding.map(n => sql`${n}`), sql`, `)}]::real[]`}) WITH ORDINALITY v(val, ord) ON e.ord = v.ord
          ) DESC`
        )
      : queryWithWhere.orderBy(desc(codeCheckpointsTable.created_at));

    // Apply pagination
    const finalQuery = queryWithOrder.limit(input.limit).offset(input.offset);

    // Build count query
    const baseCountQuery = db.select({ count: sql<number>`cast(count(*) as integer)` }).from(codeCheckpointsTable);
    
    const countQuery = conditions.length > 0 
      ? conditions.length === 1 
        ? baseCountQuery.where(conditions[0])
        : baseCountQuery.where(and(...conditions))
      : baseCountQuery;

    // Execute both queries
    const [results, countResult] = await Promise.all([
      finalQuery.execute(),
      countQuery.execute()
    ]);

    const total = countResult[0]?.count || 0;
    const hasMore = input.offset + input.limit < total;

    // Convert results to proper format
    const formattedResults = results.map(checkpoint => ({
      ...checkpoint,
      created_at: checkpoint.created_at
    }));

    return {
      results: formattedResults,
      total,
      has_more: hasMore
    };

  } catch (error) {
    console.error('Code checkpoint search failed:', error);
    throw error;
  }
};
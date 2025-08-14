import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { type UpdateCodeCheckpointInput, type CodeCheckpoint } from '../schema';
import { eq } from 'drizzle-orm';

export const updateCodeCheckpoint = async (input: UpdateCodeCheckpointInput): Promise<CodeCheckpoint | null> => {
  try {
    // Extract id and prepare update fields
    const { id, ...updateFields } = input;
    
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      // If no fields to update, just return the existing record
      const existingRecord = await db.select()
        .from(codeCheckpointsTable)
        .where(eq(codeCheckpointsTable.id, id))
        .execute();
      
      if (existingRecord.length === 0) {
        return null;
      }
      
      return existingRecord[0] as CodeCheckpoint;
    }

    // Update the record
    const result = await db.update(codeCheckpointsTable)
      .set(updateFields)
      .where(eq(codeCheckpointsTable.id, id))
      .returning()
      .execute();

    // Return null if no record was updated (record doesn't exist)
    if (result.length === 0) {
      return null;
    }

    // Return the updated record
    return result[0] as CodeCheckpoint;
  } catch (error) {
    console.error('Code checkpoint update failed:', error);
    throw error;
  }
};
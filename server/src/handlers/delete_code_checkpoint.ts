import { db } from '../db';
import { codeCheckpointsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteCodeCheckpoint = async (id: number): Promise<boolean> => {
  try {
    // Delete the code checkpoint by ID
    const result = await db.delete(codeCheckpointsTable)
      .where(eq(codeCheckpointsTable.id, id))
      .execute();

    // Check if any rows were affected (i.e., checkpoint was found and deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Code checkpoint deletion failed:', error);
    throw error;
  }
};
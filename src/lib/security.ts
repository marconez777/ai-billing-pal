// Security helpers for RLS protection

export const withUserScope = <T>(fn: () => Promise<T>, userId: string): Promise<T> => {
  // Stub: wrapper for backend calls with userId validation
  console.log(`Executing with user scope: ${userId}`);
  return fn();
};

export const assertUserScope = (record: { user_id?: string }, userId: string): void => {
  if (record.user_id !== userId) {
    throw new Error(`Access denied: record belongs to different user`);
  }
};

export const withRowLevelSecurity = <T extends { user_id: string }>(
  records: T[], 
  userId: string
): T[] => {
  return records.filter(record => record.user_id === userId);
};
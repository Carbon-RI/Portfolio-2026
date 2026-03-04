export const cleanFields = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
};

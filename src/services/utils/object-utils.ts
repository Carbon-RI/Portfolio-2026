export const cleanFields = (obj: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
};

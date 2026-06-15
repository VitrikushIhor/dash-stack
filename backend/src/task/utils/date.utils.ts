export const toDateOrUndefined = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${value}`);
  }
  return date;
};

/**
 * Handles the three-state optional/nullable date semantics used in update DTOs:
 *
 * - `undefined` → `undefined`  — Prisma skips the field (no change)
 * - `null`      → `null`       — Prisma sets the column to NULL
 * - `string`    → `new Date()` — Prisma sets the column value
 */
export const toDateOrNullish = (
  value?: string | null,
): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${value}`);
  }
  return date;
};

/**
 * Returns `new Date(value)` when defined, `undefined` otherwise.
 * Used for optional range filter boundaries in repository queries.
 */
export const toOptionalDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${value}`);
  }
  return date;
};

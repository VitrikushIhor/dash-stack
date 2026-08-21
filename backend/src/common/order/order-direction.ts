export const OrderDirection = {
  // Specifies an ascending order for a given `orderBy` argument.
  asc: 'asc',
  // Specifies a descending order for a given `orderBy` argument.
  desc: 'desc',
} as const;

export type OrderDirection = (typeof OrderDirection)[keyof typeof OrderDirection];

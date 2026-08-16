export const LABEL_ERRORS = {
  NOT_FOUND: 'Label not found',
  ALREADY_EXISTS: (name: string) => `Label with name "${name}" already exists`,
} as const;

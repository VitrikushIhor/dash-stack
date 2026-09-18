export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json',
} as const;

export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];

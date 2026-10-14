export type LearningDocument = {
  readonly schemaVersion: 1;
  readonly type: 'doc';
  readonly content: readonly Paragraph[];
};

export type Paragraph = {
  readonly type: 'paragraph';
  readonly content: readonly TextNode[];
};

export type TextNode = {
  readonly type: 'text';
  readonly text: string;
};

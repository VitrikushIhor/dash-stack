import { ExportFormat } from '../contracts/export-flashcards.contract';

export class ExportFlashcardsCommand {
  constructor(
    public readonly deckId: string,
    public readonly userId: string,
    public readonly format: ExportFormat,
  ) {}
}

import { Injectable, Inject } from '@nestjs/common';
import { StudyProgressTransactionPort } from '../ports/study-progress-transaction.port';
import { ToggleCardStarCommand } from '../commands/toggle-card-star.command';
import { SetCardStarUseCase, SetCardStarResult } from './set-card-star.use-case';

export type ToggleCardStarResult = SetCardStarResult;

@Injectable()
export class ToggleCardStarUseCase {
  private readonly star: SetCardStarUseCase;

  constructor(@Inject('StudyProgressTransactionPort') transaction: StudyProgressTransactionPort) {
    this.star = new SetCardStarUseCase(transaction);
  }

  public execute(command: ToggleCardStarCommand): Promise<ToggleCardStarResult> {
    return this.star.toggle(command);
  }
}

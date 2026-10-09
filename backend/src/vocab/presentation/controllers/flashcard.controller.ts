import {
  Controller,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { CreateFlashcardUseCase } from '../../application/use-cases/create-flashcard.use-case';
import { UpdateFlashcardUseCase } from '../../application/use-cases/update-flashcard.use-case';
import { DeleteFlashcardUseCase } from '../../application/use-cases/delete-flashcard.use-case';
import { ReorderFlashcardsUseCase } from '../../application/use-cases/reorder-flashcards.use-case';
import { CreateFlashcardsDto } from '../dtos/create-flashcard.dto';
import { UpdateFlashcardDto } from '../dtos/update-flashcard.dto';
import { ReorderFlashcardsDto } from '../dtos/reorder-flashcards.dto';
import { FlashcardPresentationMapper } from '../mappers/flashcard-presentation.mapper';
import { FlashcardResponseDto } from '../dtos/flashcard-response.dto';

@ApiTags('Vocabulary - Flashcards')
@Controller('v1/vocab/decks/:id/cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashcardController {
  constructor(
    private readonly createFlashcardUseCase: CreateFlashcardUseCase,
    private readonly updateFlashcardUseCase: UpdateFlashcardUseCase,
    private readonly deleteFlashcardUseCase: DeleteFlashcardUseCase,
    private readonly reorderFlashcardsUseCase: ReorderFlashcardsUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Add one or more flashcards to a deck (Owner only)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: [FlashcardResponseDto],
    description: 'Flashcards created successfully',
  })
  async createFlashcards(
    @Param('id') deckId: string,
    @UserEntity() user: AuthUser,
    @Body() dto: CreateFlashcardsDto,
  ): Promise<FlashcardResponseDto[]> {
    const cards = await this.createFlashcardUseCase.execute({
      deckId,
      userId: user.id,
      cards: dto.cards,
    });
    return FlashcardPresentationMapper.toResponseList(cards);
  }

  @Patch(':cardId')
  @ApiOperation({ summary: 'Update flashcard content (Owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FlashcardResponseDto,
    description: 'Flashcard updated successfully',
  })
  async updateFlashcard(
    @Param('id') deckId: string,
    @Param('cardId') cardId: string,
    @UserEntity() user: AuthUser,
    @Body() dto: UpdateFlashcardDto,
  ): Promise<FlashcardResponseDto> {
    const card = await this.updateFlashcardUseCase.execute({
      deckId,
      cardId,
      userId: user.id,
      ...dto,
    });
    return FlashcardPresentationMapper.toResponse(card);
  }

  @Delete(':cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flashcard from deck (Owner only)' })
  async deleteFlashcard(
    @Param('id') deckId: string,
    @Param('cardId') cardId: string,
    @UserEntity() user: AuthUser,
  ): Promise<void> {
    await this.deleteFlashcardUseCase.execute({
      deckId,
      cardId,
      userId: user.id,
    });
  }

  @Put('order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update order of flashcards in a deck (Owner only)',
  })
  async reorderFlashcards(
    @Param('id') deckId: string,
    @UserEntity() user: AuthUser,
    @Body() dto: ReorderFlashcardsDto,
  ) {
    await this.reorderFlashcardsUseCase.execute({
      deckId,
      userId: user.id,
      orderedCardIds: dto.orderedCardIds,
    });
    return { success: true, message: 'Flashcards reordered successfully' };
  }
}

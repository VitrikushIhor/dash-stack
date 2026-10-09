import { Body, Controller, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { AuthUser, UserEntity } from '@common/decorators/user.decorator';
import { ImportFlashcardsUseCase } from '../../application/use-cases/import-flashcards.use-case';
import { ImportFlashcardsDto, ImportFlashcardsResponseDto } from '../dtos/import-flashcards.dto';

@ApiTags('Vocabulary - Import')
@Controller('v1/vocab/decks/:id/import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeckImportController {
  constructor(private readonly importFlashcardsUseCase: ImportFlashcardsUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Append imported flashcards atomically (Owner only)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ImportFlashcardsResponseDto })
  async importFlashcards(
    @Param('id') deckId: string,
    @UserEntity() user: AuthUser,
    @Body() dto: ImportFlashcardsDto,
  ): Promise<ImportFlashcardsResponseDto> {
    return this.importFlashcardsUseCase.execute({
      deckId,
      userId: user.id,
      importId: dto.importId,
      cards: dto.cards,
    });
  }
}

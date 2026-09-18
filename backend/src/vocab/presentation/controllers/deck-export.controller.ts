import { AuthUser, UserEntity } from '../../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportFlashcardsCommand } from '../../application/commands/export-flashcards.command';
import { ExportFlashcardsUseCase } from '../../application/use-cases/export-flashcards.use-case';
import { ExportFlashcardsQueryDto } from '../dtos/export-flashcards.dto';

@ApiTags('vocab-export')
@Controller('v1/vocab/decks/:deckId/export')
export class DeckExportController {
  constructor(private readonly exportFlashcardsUseCase: ExportFlashcardsUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export deck flashcards to CSV or JSON' })
  @ApiQuery({ name: 'format', enum: ['csv', 'json'], required: true })
  @ApiProduces('text/csv', 'application/json')
  async export(
    @Param('deckId') deckId: string,
    @Query() query: ExportFlashcardsQueryDto,
    @UserEntity() user: AuthUser,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.exportFlashcardsUseCase.execute(
      new ExportFlashcardsCommand(deckId, user.id, query.format),
    );

    response.setHeader('Content-Type', result.contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    response.send(result.data);
  }
}

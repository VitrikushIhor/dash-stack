import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { CreateDeckUseCase } from '../../application/use-cases/create-deck.use-case';
import { GetMyDecksUseCase } from '../../application/use-cases/get-my-decks.use-case';
import { GetDeckByIdUseCase } from '../../application/use-cases/get-deck-by-id.use-case';
import { UpdateDeckUseCase } from '../../application/use-cases/update-deck.use-case';
import { SaveDeckEditorUseCase } from '../../application/use-cases/save-deck-editor.use-case';
import { DeleteDeckUseCase } from '../../application/use-cases/delete-deck.use-case';
import { PublishDeckUseCase } from '../../application/use-cases/publish-deck.use-case';
import { UnpublishDeckUseCase } from '../../application/use-cases/unpublish-deck.use-case';
import { ArchiveDeckUseCase } from '../../application/use-cases/archive-deck.use-case';
import { RestoreDeckUseCase } from '../../application/use-cases/restore-deck.use-case';
import { ForkDeckUseCase } from '../../application/use-cases/fork-deck.use-case';
import { SearchPublicDecksUseCase } from '../../application/use-cases/search-public-decks.use-case';
import { CreateDeckDto } from '../dtos/create-deck.dto';
import { UpdateDeckDto } from '../dtos/update-deck.dto';
import { SaveDeckEditorDto } from '../dtos/save-deck-editor.dto';
import { MyDecksQueryDto, PublicDecksQueryDto } from '../dtos/deck-query.dto';
import { DeckPresentationMapper } from '../mappers/deck-presentation.mapper';
import { DeckResponseDto } from '../dtos/deck-response.dto';
import { DeckEditorResponseDto } from '../dtos/deck-editor-response.dto';

@ApiTags('Vocabulary - Decks')
@Controller('v1/vocab/decks')
export class DeckController {
  constructor(
    private readonly createDeckUseCase: CreateDeckUseCase,
    private readonly getMyDecksUseCase: GetMyDecksUseCase,
    private readonly getDeckByIdUseCase: GetDeckByIdUseCase,
    private readonly updateDeckUseCase: UpdateDeckUseCase,
    private readonly saveDeckEditorUseCase: SaveDeckEditorUseCase,
    private readonly deleteDeckUseCase: DeleteDeckUseCase,
    private readonly publishDeckUseCase: PublishDeckUseCase,
    private readonly unpublishDeckUseCase: UnpublishDeckUseCase,
    private readonly archiveDeckUseCase: ArchiveDeckUseCase,
    private readonly restoreDeckUseCase: RestoreDeckUseCase,
    private readonly forkDeckUseCase: ForkDeckUseCase,
    private readonly searchPublicDecksUseCase: SearchPublicDecksUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new vocabulary deck in DRAFT status' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DeckResponseDto,
    description: 'Deck successfully created',
  })
  async createDeck(
    @UserEntity() user: AuthUser,
    @Body() dto: CreateDeckDto,
  ): Promise<DeckResponseDto> {
    const deck = await this.createDeckUseCase.execute({
      ownerUserId: user.id,
      ...dto,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all decks owned by the authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, type: [DeckResponseDto] })
  async getMyDecks(
    @UserEntity() user: AuthUser,
    @Query() query: MyDecksQueryDto,
  ): Promise<DeckResponseDto[]> {
    const decks = await this.getMyDecksUseCase.execute({
      userId: user.id,
      status: query.status,
    });
    return DeckPresentationMapper.toResponseList(decks);
  }

  @Get('public')
  @ApiOperation({ summary: 'Search and browse published public decks' })
  async searchPublicDecks(@Query() query: PublicDecksQueryDto) {
    const tags = query.tags ? query.tags.split(',').map((t) => t.trim()) : undefined;
    const paginated = await this.searchPublicDecksUseCase.execute({
      query: query.q,
      level: query.level,
      tags,
      page: query.page,
      perPage: query.perPage ?? query.limit,
    });
    return DeckPresentationMapper.toPaginatedResponse(paginated);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get deck details and cards by ID (respects visibility)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async getDeckById(
    @Param('id') id: string,
    @UserEntity() user: AuthUser | null,
  ): Promise<DeckResponseDto> {
    const deck = await this.getDeckByIdUseCase.execute({
      deckId: id,
      userId: user?.id ?? null,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Put(':id/editor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atomically save deck metadata and flashcard editor state' })
  @ApiResponse({ status: HttpStatus.OK, type: DeckEditorResponseDto })
  async saveEditor(
    @Param('id') id: string,
    @UserEntity() user: AuthUser,
    @Body() dto: SaveDeckEditorDto,
  ): Promise<DeckEditorResponseDto> {
    const deck = await this.saveDeckEditorUseCase.execute({
      deckId: id,
      userId: user.id,
      metadata: dto.metadata,
      cards: dto.cards,
      deletedCardIds: dto.deletedCardIds ?? [],
    });
    return DeckPresentationMapper.toEditorResponse(deck);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update deck metadata (Owner only)' })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async updateDeck(
    @Param('id') id: string,
    @UserEntity() user: AuthUser,
    @Body() dto: UpdateDeckDto,
  ): Promise<DeckResponseDto> {
    const deck = await this.updateDeckUseCase.execute({
      deckId: id,
      userId: user.id,
      ...dto,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a deck and all associated cards (Owner only)',
  })
  async deleteDeck(@Param('id') id: string, @UserEntity() user: AuthUser): Promise<void> {
    await this.deleteDeckUseCase.execute({
      deckId: id,
      userId: user.id,
    });
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish deck to make it discoverable (requires min 2 cards)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async publishDeck(
    @Param('id') id: string,
    @UserEntity() user: AuthUser,
  ): Promise<DeckResponseDto> {
    const deck = await this.publishDeckUseCase.execute({
      deckId: id,
      userId: user.id,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish deck back to DRAFT status' })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async unpublishDeck(
    @Param('id') id: string,
    @UserEntity() user: AuthUser,
  ): Promise<DeckResponseDto> {
    const deck = await this.unpublishDeckUseCase.execute({
      deckId: id,
      userId: user.id,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive deck (hides from active view)' })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async archiveDeck(
    @Param('id') id: string,
    @UserEntity() user: AuthUser,
  ): Promise<DeckResponseDto> {
    const deck = await this.archiveDeckUseCase.execute({
      deckId: id,
      userId: user.id,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore archived deck to DRAFT status' })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async restoreDeck(
    @Param('id') id: string,
    @UserEntity() user: AuthUser,
  ): Promise<DeckResponseDto> {
    const deck = await this.restoreDeckUseCase.execute({
      deckId: id,
      userId: user.id,
    });
    return DeckPresentationMapper.toResponse(deck);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post(':id/fork')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Fork/clone a public or accessible deck into user library',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeckResponseDto })
  async forkDeck(@Param('id') id: string, @UserEntity() user: AuthUser): Promise<DeckResponseDto> {
    const deck = await this.forkDeckUseCase.execute({
      deckId: id,
      targetUserId: user.id,
    });
    return DeckPresentationMapper.toResponse(deck);
  }
}
